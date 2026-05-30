import assert from "node:assert/strict";
import test from "node:test";
import handler from "./[...path].ts";

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

test("POST /api/payment/callback is routed to callback validation", async () => {
  const response = await callHandler({
    method: "POST",
    url: "/api/payment/callback",
    body: {},
  });

  assert.equal(response.statusCode, 400);
  assert.equal(response.body["code"], "INVALID_REQUEST");
});
