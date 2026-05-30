import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { createTicketCode, getPublicTicket, getSafeCallbackSummary } from "./_payment.js";

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
  assert.match(first, /^SBC-2026-[A-F0-9]{12}$/);
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
  const migration = readFileSync(new URL("./migrations/001_post_payment_tickets.sql", import.meta.url), "utf8");
  assert.match(migration, /order_id integer not null unique references ticket_orders\(id\)/);
  assert.match(migration, /create table if not exists tickets/);
  assert.match(migration, /add column if not exists email_status/);
});
