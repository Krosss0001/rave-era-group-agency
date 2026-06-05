import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import {
  buildTicketPdf,
  createTicketCode,
  getEmailConfigCheck,
  getPublicTicket,
  getSafeCallbackSummary,
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

test("ticket codes use a non-sequential public-safe identifier", () => {
  const first = createTicketCode();
  const second = createTicketCode();
  const ecc = createTicketCode("e-commerce-conference-2026");
  assert.match(first, /^SBC-2026-[A-F0-9]{12}$/);
  assert.match(ecc, /^ECC-2026-[A-F0-9]{12}$/);
  assert.notEqual(first, second);
});

test("callback persistence allowlist excludes operation and card data", () => {
  const summary = getSafeCallbackSummary({
    hppOrderId: "hpp-1",
    merchantRequestId: "merchant-1",
    orderStatus: "SUCCESS",
    paymentMethods: ["CARD"],
    cardNumberMask: "4111********1111",
    operation: { cardNumberMask: "4111********1111" },
  });
  assert.deepEqual(summary, {
    hppOrderId: "hpp-1",
    merchantRequestId: "merchant-1",
    orderStatus: "SUCCESS",
    paymentMethods: ["CARD"],
  });
});

test("invalid public ticket codes are rejected before database access", async () => {
  const response = new MockResponse();
  await getPublicTicket("not-a-ticket", response as never);
  assert.equal(response.statusCode, 400);
  assert.equal(JSON.parse(response.body).code, "INVALID_TICKET_CODE");
});

test("migration enforces idempotent one-ticket-per-order issuance", () => {
  const migration = readFileSync(new URL("./api/migrations/001_post_payment_tickets.sql", `file://${process.cwd()}/`), "utf8");
  assert.match(migration, /order_id integer not null unique references ticket_orders\(id\)/);
  assert.match(migration, /create table if not exists tickets/);
  assert.match(migration, /add column if not exists email_status/);
  assert.match(migration, /add column if not exists event_slug/);
  assert.match(migration, /add column if not exists event_title/);
});

test("PDF ticket generation returns a valid PDF document", async () => {
  const ticketCode = "SBC-2026-ABCDEF123456";
  const pdf = await buildTicketPdf({
    id: 1,
    ticket_code: ticketCode,
    order_id: 1,
    merchant_request_id: "merchant-1",
    hpp_order_id: "hpp-1",
    event_slug: "sbc-summit-ukraine-2026",
    event_title: "SBC Summit Ukraine 2026",
    ticket_type: "business",
    customer_email: "customer@example.com",
    customer_first_name: "Богдан",
    customer_last_name: "Чекан",
    status: "ACTIVE",
    qr_payload: `https://www.rave-era.com.ua/ticket/${ticketCode}`,
    issued_at: new Date("2026-05-01T10:00:00Z"),
  });

  assert.equal(pdf.subarray(0, 5).toString("ascii"), "%PDF-");
  assert.ok(pdf.length > 5000);
});

test("PDF ticket embeds bundled Noto fonts for Ukrainian ticket text", async () => {
  const ticketCode = "SBC-2026-ABCDEF123456";
  const pdf = await buildTicketPdf({
    id: 1,
    ticket_code: ticketCode,
    order_id: 1,
    merchant_request_id: "merchant-1",
    hpp_order_id: "hpp-1",
    event_slug: "sbc-summit-ukraine-2026",
    event_title: "SBC Summit Ukraine 2026",
    ticket_type: "business",
    customer_email: "customer@example.com",
    customer_first_name: "Олена",
    customer_last_name: "Київська",
    status: "ACTIVE",
    qr_payload: `https://www.rave-era.com.ua/ticket/${ticketCode}`,
    issued_at: new Date("2026-05-01T10:00:00Z"),
  });
  const pdfText = pdf.toString("latin1");

  assert.doesNotThrow(() => Buffer.from("27 травня 2026", "utf8"));
  assert.doesNotThrow(() => Buffer.from("КВЦ Парковий, Київ", "utf8"));
  assert.doesNotThrow(() => Buffer.from("Квиток дійсний лише після успішної оплати", "utf8"));
  assert.match(pdfText, /FontFile2|FontFile3/);
  assert.match(pdfText, /NotoSans/);
  assert.doesNotMatch(pdfText, /Helvetica|ZapfDingbats|Symbol/);
});

test("email config check exposes SMTP booleans only", () => {
  const originalEnv = { ...process.env };
  try {
    process.env["SMTP_HOST"] = "smtp.example.com";
    process.env["SMTP_PORT"] = "587";
    process.env["SMTP_USER"] = "user@example.com";
    process.env["SMTP_PASS"] = "configured-pass";
    process.env["SMTP_FROM"] = "tickets@example.com";

    assert.deepEqual(getEmailConfigCheck(), {
      ok: true,
      hasSmtpHost: true,
      hasSmtpPort: true,
      hasSmtpUser: true,
      hasSmtpPass: true,
      hasSmtpFrom: true,
    });
  } finally {
    process.env = originalEnv;
  }
});
