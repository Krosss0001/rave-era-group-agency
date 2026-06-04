import assert from "node:assert/strict";
import test from "node:test";
import adminCheckinHandler from "./admin-checkin.js";
import handler from "./[...path].js";
import {
  extractTicketCodeFromCheckinInput,
  markCheckinTicketUsedWithDb,
  verifyCheckinTicketWithDb,
  type DbModule,
} from "./_payment.js";

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
  cookie,
  query,
}: {
  method: string;
  url: string;
  body?: unknown;
  cookie?: string;
  query?: { path?: string | string[] };
}): Promise<{ statusCode: number; body: Record<string, unknown>; headers: MockResponse["headers"] }> {
  const res = new MockResponse();
  await handler({
    method,
    url,
    body,
    query,
    headers: cookie ? { cookie } : {},
    socket: { remoteAddress: "127.0.0.1" },
  } as never, res as never);

  return {
    statusCode: res.statusCode,
    body: res.body ? JSON.parse(res.body) as Record<string, unknown> : {},
    headers: res.headers,
  };
}

async function callAdminCheckinHandler({
  method,
  url,
  body,
}: {
  method: string;
  url: string;
  body?: unknown;
}): Promise<{ statusCode: number; body: Record<string, unknown>; headers: MockResponse["headers"] }> {
  const res = new MockResponse();
  await adminCheckinHandler({
    method,
    url,
    body,
    headers: {},
    socket: { remoteAddress: "127.0.0.1" },
  } as never, res as never);

  return {
    statusCode: res.statusCode,
    body: res.body ? JSON.parse(res.body) as Record<string, unknown> : {},
    headers: res.headers,
  };
}

function makeTicket(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    ticket_code: "SBC-2026-ABCDEF123456",
    order_id: 1,
    merchant_request_id: "merchant-1",
    hpp_order_id: "hpp-1",
    event_slug: "sbc-summit-ukraine-2026",
    event_title: "SBC Summit Ukraine 2026",
    ticket_type: "business",
    customer_email: "customer@example.com",
    customer_first_name: "Olena",
    customer_last_name: "Kyivska",
    status: "ACTIVE",
    qr_payload: "https://www.rave-era.com.ua/ticket/SBC-2026-ABCDEF123456",
    issued_at: new Date("2026-05-01T10:00:00Z"),
    checked_in_at: null,
    checked_in_by: null,
    ...overrides,
  };
}

function mockDb(ticket: ReturnType<typeof makeTicket> | null, options: { updateSucceeds?: boolean } = {}): DbModule {
  const state = { ticket };
  return {
    pool: {
      async query(sql: string, params: unknown[]) {
        if (sql.includes("insert into ticket_checkins")) {
          return { rows: [] };
        }
        if (sql.includes("update tickets")) {
          if (options.updateSucceeds && state.ticket?.status === "ACTIVE") {
            state.ticket = {
              ...state.ticket,
              status: "USED",
              checked_in_at: new Date("2026-05-27T09:30:00Z"),
              checked_in_by: String(params[1]),
            };
            return { rows: [state.ticket] };
          }
          return { rows: [] };
        }
        if (sql.includes("select * from tickets")) {
          return state.ticket?.ticket_code === params[0] ? { rows: [state.ticket] } : { rows: [] };
        }
        throw new Error(`Unexpected SQL: ${sql}`);
      },
    },
  } as never;
}

test("check-in login rejects bad PIN without exposing secrets", async () => {
  const originalEnv = { ...process.env };
  try {
    process.env["CHECKIN_ADMIN_PIN"] = "123456";
    process.env["CHECKIN_SESSION_SECRET"] = "session-secret-for-tests";

    const response = await callHandler({
      method: "POST",
      url: "/api/admin/checkin/login",
      body: { pin: "000000" },
    });

    assert.equal(response.statusCode, 401);
    assert.equal(response.body["code"], "INVALID_PIN");
    assert.equal(response.headers.has("set-cookie"), false);
  } finally {
    process.env = originalEnv;
  }
});

test("check-in session catch-all returns JSON unauthenticated for path variants", async () => {
  for (const request of [
    { url: "/api/admin/checkin/session" },
    { url: "/admin/checkin/session" },
    { url: "admin/checkin/session" },
    { url: "/api/[...path]", query: { path: ["admin", "checkin", "session"] } },
    { url: "/api/[...path]?path=admin/checkin/session" },
  ]) {
    const response = await callHandler({
      method: "GET",
      url: request.url,
      query: request.query,
    });

    assert.equal(response.statusCode, 200, request.url);
    assert.deepEqual(response.body, { authenticated: false }, request.url);
  }
});

test("check-in login catch-all rejects bad PIN with JSON for path variants", async () => {
  const originalEnv = { ...process.env };
  try {
    process.env["CHECKIN_ADMIN_PIN"] = "123456";
    process.env["CHECKIN_SESSION_SECRET"] = "session-secret-for-tests";

    for (const request of [
      { url: "/api/admin/checkin/login" },
      { url: "/admin/checkin/login" },
      { url: "admin/checkin/login" },
      { url: "/api/[...path]", query: { path: ["admin", "checkin", "login"] } },
    ]) {
      const response = await callHandler({
        method: "POST",
        url: request.url,
        query: request.query,
        body: { pin: "bad-pin" },
      });

      assert.equal(response.statusCode, 401, request.url);
      assert.equal(response.body["code"], "INVALID_PIN", request.url);
      assert.equal(response.body["error"], "Invalid PIN", request.url);
    }
  } finally {
    process.env = originalEnv;
  }
});

test("flat admin check-in session route returns JSON unauthenticated", async () => {
  const response = await callAdminCheckinHandler({
    method: "GET",
    url: "/api/admin-checkin?action=session",
  });

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.body, { authenticated: false });
});

test("flat admin check-in login route rejects bad PIN with JSON", async () => {
  const originalEnv = { ...process.env };
  try {
    process.env["CHECKIN_ADMIN_PIN"] = "123456";
    process.env["CHECKIN_SESSION_SECRET"] = "session-secret-for-tests";

    const response = await callAdminCheckinHandler({
      method: "POST",
      url: "/api/admin-checkin?action=login",
      body: { pin: "bad-pin" },
    });

    assert.equal(response.statusCode, 401);
    assert.equal(response.body["code"], "INVALID_PIN");
    assert.equal(response.body["error"], "Invalid PIN");
  } finally {
    process.env = originalEnv;
  }
});

test("routes diagnostic includes admin check-in endpoints and safe path matching data", async () => {
  const response = await callHandler({
    method: "GET",
    url: "/api/[...path]",
    query: { path: ["routes"] },
  });

  assert.equal(response.statusCode, 200);
  const routes = response.body["routes"] as string[];
  assert.ok(routes.includes("GET /api/admin-checkin?action=session"));
  assert.ok(routes.includes("POST /api/admin-checkin?action=login"));
  assert.ok(routes.includes("POST /api/admin-checkin?action=logout"));
  assert.ok(routes.includes("POST /api/admin-checkin?action=verify"));
  assert.ok(routes.includes("POST /api/admin-checkin?action=mark-used"));
  const matching = response.body["matching"] as Record<string, unknown>;
  const diagnostics = matching["diagnostics"] as Record<string, unknown>;
  const adminCheckin = matching["adminCheckin"] as Record<string, unknown>;
  assert.equal(diagnostics["method"], "GET");
  assert.equal(diagnostics["rawUrl"], "/api/[...path]");
  assert.deepEqual(diagnostics["pathSegments"], ["routes"]);
  assert.equal(adminCheckin["flatFunction"], "/api/admin-checkin.ts");
});

test("check-in verify requires auth", async () => {
  const response = await callHandler({
    method: "POST",
    url: "/api/admin/checkin/verify",
    body: { ticketCode: "SBC-2026-ABCDEF123456" },
  });

  assert.equal(response.statusCode, 401);
  assert.equal(response.body["code"], "UNAUTHENTICATED");
});

test("check-in extracts ticket code from public QR URL", () => {
  assert.equal(
    extractTicketCodeFromCheckinInput("https://www.rave-era.com.ua/ticket/SBC-2026-ABCDEF123456"),
    "SBC-2026-ABCDEF123456",
  );
  assert.equal(extractTicketCodeFromCheckinInput("sbc-2026-abcdef123456"), "SBC-2026-ABCDEF123456");
});

test("check-in verify returns ACTIVE ticket info without payment details", async () => {
  const result = await verifyCheckinTicketWithDb(
    mockDb(makeTicket()),
    "SBC-2026-ABCDEF123456",
  );

  assert.equal(result.statusCode, 200);
  const ticket = result.body["ticket"] as Record<string, unknown>;
  assert.equal(ticket["status"], "ACTIVE");
  assert.equal(ticket["ticketCode"], "SBC-2026-ABCDEF123456");
  assert.equal(ticket["customerName"], "Olena Kyivska");
  assert.equal("customerEmail" in ticket, false);
});

test("check-in mark-used changes ACTIVE ticket to USED", async () => {
  const result = await markCheckinTicketUsedWithDb(
    mockDb(makeTicket(), { updateSucceeds: true }),
    "SBC-2026-ABCDEF123456",
  );

  assert.equal(result.statusCode, 200);
  assert.equal(result.body["result"], "CHECKED_IN");
  const ticket = result.body["ticket"] as Record<string, unknown>;
  assert.equal(ticket["status"], "USED");
  assert.ok(ticket["checkedInAt"]);
});

test("check-in duplicate mark-used is idempotent", async () => {
  const result = await markCheckinTicketUsedWithDb(
    mockDb(makeTicket({
      status: "USED",
      checked_in_at: new Date("2026-05-27T09:30:00Z"),
    })),
    "SBC-2026-ABCDEF123456",
  );

  assert.equal(result.statusCode, 200);
  assert.equal(result.body["result"], "ALREADY_USED");
});

test("check-in invalid ticket returns 404", async () => {
  const result = await verifyCheckinTicketWithDb(mockDb(null), "SBC-2026-ABCDEF123456");

  assert.equal(result.statusCode, 404);
  assert.equal(result.body["code"], "TICKET_NOT_FOUND");
});
