import assert from "node:assert/strict";
import test from "node:test";
import {
  ALLIANCEPAY_HPP_CREATE_ORDER_URL,
  applyVerifiedPaymentStatus,
  buildAlliancePayAuthHeaders,
  buildAlliancePayHppCreateOrderPayload,
  buildPaymentUrls,
  createOrder,
  getEventConfig,
  getTicketPrice,
  ticketPrices,
} from "./_payment.js";

class MockResponse {
  statusCode = 200;
  headers = new Map<string, string>();
  body = "";

  setHeader(name: string, value: string) {
    this.headers.set(name, value);
  }

  end(body = "") {
    this.body = body;
  }
}

test("Vercel payment API builds the official AlliancePay HPP create-order payload", () => {
  const merchantRequestId = "137d9304-0368-11ed-b939-0242ac120002";
  const payload = buildAlliancePayHppCreateOrderPayload({
    merchantRequestId,
    merchantId: "merchant-id",
    coinAmount: 1000,
    language: "uk",
    purpose: "SBC Summit Ukraine 2026",
    urls: {
      notificationUrl: "https://example.com/api/payment/callback",
      successUrl: "https://example.com/payment/success",
      failUrl: "https://example.com/payment/fail",
    },
  });

  assert.equal(payload.merchantRequestId, merchantRequestId);
  assert.equal(payload.hppPayType, "PURCHASE");
  assert.equal(payload.directType, "REDIRECT");
  assert.deepEqual(payload.paymentMethods, ["CARD", "APPLE_PAY", "GOOGLE_PAY"]);
  assert.deepEqual(payload.customerData, { senderCustomerId: merchantRequestId });
  assert.equal("serviceCode" in payload, false);
  assert.equal("merchantAliasId" in payload, false);
});

test("Vercel payment API uses the official AlliancePay ECOM endpoint and auth headers", () => {
  assert.equal(
    ALLIANCEPAY_HPP_CREATE_ORDER_URL,
    "https://api-ecom-prod.bankalliance.ua/ecom/execute_request/hpp/v1/create-order",
  );
  assert.deepEqual(buildAlliancePayAuthHeaders("device-id", "refresh-token"), {
    "x-api_version": "v1",
    "x-device_id": "device-id",
    "x-refresh_token": "refresh-token",
  });
});

test("ticket prices preserve SBC prices while adding E-Commerce formats", () => {
  assert.deepEqual(ticketPrices, {
    "sbc-summit-ukraine-2026": {
      sport: 250000,
      business: 650000,
      online: 100,
    },
    "e-commerce-conference-2026": {
      online: 150000,
      standard: 180000,
      vip: 400000,
    },
  });
  assert.equal(getTicketPrice("sbc-summit-ukraine-2026", "online"), 100);
  assert.equal(getTicketPrice("sbc-summit-ukraine-2026", "sport"), 250000);
  assert.equal(getTicketPrice("sbc-summit-ukraine-2026", "business"), 650000);
  assert.equal(getTicketPrice("e-commerce-conference-2026", "online"), 150000);
  assert.equal(getTicketPrice("e-commerce-conference-2026", "standard"), 180000);
  assert.equal(getTicketPrice("e-commerce-conference-2026", "vip"), 400000);
  assert.equal(getTicketPrice("e-commerce-conference-2026", "corporate"), 0);
});

test("event production metadata preserves SBC and configures E-Commerce launch details", () => {
  assert.deepEqual(getEventConfig("sbc-summit-ukraine-2026"), {
    slug: "sbc-summit-ukraine-2026",
    title: "SBC Summit Ukraine 2026",
    codePrefix: "SBC-2026",
    paymentPath: "/event/sbc-summit-ukraine-2026/payment",
    pdfDate: "27 травня 2026",
    pdfVenue: "КВЦ Парковий, Київ",
    publicDateTime: "27 травня 2026, 09:30-23:00",
    publicVenue: "КВЦ «Парковий», Київ",
  });
  assert.deepEqual(getEventConfig("e-commerce-conference-2026"), {
    slug: "e-commerce-conference-2026",
    title: "E-Commerce Conference 2026",
    codePrefix: "ECC-2026",
    paymentPath: "/event/e-commerce-conference-2026/payment",
    pdfDate: "6 жовтня 2026",
    pdfVenue: "КВЦ Парковий, Київ",
    publicDateTime: "6 жовтня 2026",
    publicVenue: "КВЦ «Парковий», Київ",
  });
});

test("E-Commerce payment URLs return to E-Commerce success and failure pages", () => {
  assert.deepEqual(
    buildPaymentUrls("merchant-ecc", "vip", getEventConfig("e-commerce-conference-2026")),
    {
      successUrl: "https://www.rave-era.com.ua/event/e-commerce-conference-2026/payment/success?merchantRequestId=merchant-ecc",
      failUrl: "https://www.rave-era.com.ua/event/e-commerce-conference-2026/payment/fail?type=vip",
      notificationUrl: "https://www.rave-era.com.ua/api/payment/callback",
    },
  );
});

test("failed E-Commerce payment status does not issue a ticket", async () => {
  const queries: string[] = [];
  const result = await applyVerifiedPaymentStatus(
    {
      pool: {
        async query(sql: string) {
          queries.push(sql);
          return { rows: [] };
        },
      },
    } as never,
    {
      id: 7,
      merchant_request_id: "merchant-ecc",
      hpp_order_id: "hpp-ecc",
      event_slug: "e-commerce-conference-2026",
      event_title: "E-Commerce Conference 2026",
      ticket_type: "standard",
      amount_kopiykas: 180000,
      currency: "UAH",
      status: "PENDING",
      payment_status: "PENDING",
      order_status: "PENDING",
      customer_email: "buyer@example.com",
      customer_first_name: "Test",
      customer_last_name: "Buyer",
      email_status: "PENDING",
    },
    { orderStatus: "FAIL" },
  );

  assert.equal(result, null);
  assert.equal(queries.some((sql) => sql.includes("insert into tickets")), false);
});

test("E-Commerce corporate tickets are not accepted as direct payment tickets", async () => {
  const response = new MockResponse();
  await createOrder({
    body: {
      eventSlug: "e-commerce-conference-2026",
      ticketType: "corporate",
      firstName: "Test",
      lastName: "Buyer",
      email: "buyer@example.com",
      phone: "+380934307551",
    },
    headers: {},
    socket: {},
  } as never, response as never);

  assert.equal(response.statusCode, 400);
  assert.equal(JSON.parse(response.body).code, "INVALID_REQUEST");
});
