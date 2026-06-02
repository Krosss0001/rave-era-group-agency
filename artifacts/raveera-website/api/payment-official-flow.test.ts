import assert from "node:assert/strict";
import test from "node:test";
import {
  ALLIANCEPAY_HPP_CREATE_ORDER_URL,
  buildAlliancePayAuthHeaders,
  buildAlliancePayHppCreateOrderPayload,
  ticketPrices,
} from "./_payment.js";

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

test("ticket prices preserve SPORT and BUSINESS while ONLINE is one hryvnia", () => {
  assert.deepEqual(ticketPrices, {
    sport: 250000,
    business: 650000,
    online: 100,
  });
});
