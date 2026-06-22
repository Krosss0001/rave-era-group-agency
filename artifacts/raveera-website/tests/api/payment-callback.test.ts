import assert from "node:assert/strict";
import test from "node:test";
import handler from "../../api/[...path].js";
import paymentCallbackHandler from "../../api/payment/callback.js";
import createOrderHandler from "../../api/payment/create-order.js";
import paymentStatusHandler from "../../api/payment/status.js";

class MockResponse {
  statusCode = 200;
  body = "";
  headers = new Map<string, string | number | readonly string[]>();

  setHeader(name: string, value: string | number | readonly string[]): void {
    this.headers.set(name.toLowerCase(), value);
  }

  end(chunk?: string | Buffer): void {
    if (chunk) {
      this.body += Buffer.isBuffer(chunk) ? chunk.toString("utf8") : chunk;
    }
  }
}

async function callHandler({
  method,
  url,
  body,
}: {
  method: string;
  url: string;
  body?: unknown;
}): Promise<{ statusCode: number; body: Record<string, unknown> }> {
  const res = new MockResponse();
  await handler({ method, url, body } as never, res as never);

  return {
    statusCode: res.statusCode,
    body: JSON.parse(res.body) as Record<string, unknown>,
  };
}

async function callDeployedHandler(
  deployedHandler: (req: never, res: never) => Promise<void>,
  request: { method: string; url: string; body?: unknown },
): Promise<{ statusCode: number; body: Record<string, unknown> }> {
  const res = new MockResponse();
  await deployedHandler({ ...request, headers: {} } as never, res as never);
  return { statusCode: res.statusCode, body: JSON.parse(res.body) as Record<string, unknown> };
}

test("POST /api/payment/callback is routed to callback validation", async () => {
  const response = await callHandler({
    method: "POST",
    url: "/api/payment/callback",
    body: {},
  });

  assert.equal(response.statusCode, 400);
  assert.equal(response.body["code"], "INVALID_REQUEST");
});

test("GET /api/email/config-check returns SMTP booleans only", async () => {
  const response = await callHandler({
    method: "GET",
    url: "/api/email/config-check",
  });

  assert.equal(response.statusCode, 200);
  assert.deepEqual(Object.keys(response.body).sort(), [
    "hasSmtpFrom",
    "hasSmtpHost",
    "hasSmtpPass",
    "hasSmtpPort",
    "hasSmtpUser",
    "ok",
  ]);
});

test("deployed POST /api/payment/create-order reaches the explicit Vercel function", async () => {
  const response = await callDeployedHandler(createOrderHandler, {
    method: "POST",
    url: "/api/payment/create-order",
    body: {
      eventSlug: "sbc-summit-ukraine-2026",
      ticketType: "business",
      firstName: "Test",
      lastName: "Buyer",
      email: "buyer@example.com",
      phone: "+380934307551",
    },
  });
  assert.equal(response.statusCode, 410);
  assert.equal(response.body["code"], "EVENT_SALES_CLOSED");
});

test("deployed POST /api/payment/callback reaches the explicit Vercel function", async () => {
  const response = await callDeployedHandler(paymentCallbackHandler, {
    method: "POST",
    url: "/api/payment/callback",
    body: {},
  });
  assert.equal(response.statusCode, 400);
  assert.equal(response.body["code"], "INVALID_REQUEST");
});

test("deployed GET /api/payment/status reaches the explicit Vercel function", async () => {
  const response = await callDeployedHandler(paymentStatusHandler, {
    method: "GET",
    url: "/api/payment/status",
  });
  assert.equal(response.statusCode, 400);
  assert.equal(response.body["code"], "INVALID_REQUEST");
});
