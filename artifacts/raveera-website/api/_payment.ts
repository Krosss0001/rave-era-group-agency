import type { IncomingMessage, ServerResponse } from "node:http";
import pg from "pg";
import { z } from "zod";

export type VercelApiRequest = IncomingMessage & {
  body?: unknown;
};

type DbModule = {
  pool: pg.Pool;
};

const { Pool } = pg;

const ALB_API_URL =
  process.env["ALLIANCEPAY_API_URL"] ||
  "https://pay.alb.ua/ecom/execute_request/hpp/v1/create-order";
const EVENT_PAYMENT_PATH = "/event/sbc-summit-ukraine-2026/payment";
const CALLBACK_PATH = "/api/payment/callback";

const ticketPrices: Record<string, number> = {
  sport: 250000,
  business: 650000,
  online: 10000,
};

const createOrderBodySchema = z.object({
  ticketType: z.enum(["sport", "business", "online"]),
  firstName: z.string().min(1).max(30),
  lastName: z.string().min(1).max(30),
  email: z.string().email().max(256),
  phone: z.string().min(10).max(20).optional(),
});

export function sendJson(res: ServerResponse, statusCode: number, body: unknown): void {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

export function sendCors(res: ServerResponse): void {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Accept");
}

async function readJsonBody(req: VercelApiRequest): Promise<unknown> {
  if (req.body !== undefined) {
    return req.body;
  }

  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  const rawBody = Buffer.concat(chunks).toString("utf8");
  if (!rawBody.trim()) {
    return {};
  }

  return JSON.parse(rawBody);
}

function normalizeHttpOrigin(value: string, label: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error(`${label} must not be empty`);
  }

  const parsed = new URL(trimmed);
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new Error(`${label} must use http or https`);
  }

  return parsed.origin;
}

function validateAbsoluteHttpUrl(value: string, label: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error(`${label} must not be empty`);
  }

  const parsed = new URL(trimmed);
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new Error(`${label} must use http or https`);
  }

  return parsed.toString();
}

function buildPaymentUrls(): {
  successUrl: string;
  failUrl: string;
  notificationUrl: string;
} {
  const origin = normalizeHttpOrigin(
    process.env["PUBLIC_APP_ORIGIN"] || "https://www.rave-era.com.ua",
    "PUBLIC_APP_ORIGIN",
  );
  const notificationUrl = process.env["ALLIANCEPAY_NOTIFICATION_URL"] || "";

  return {
    successUrl: `${origin}${EVENT_PAYMENT_PATH}/success`,
    failUrl: `${origin}${EVENT_PAYMENT_PATH}/fail`,
    notificationUrl: notificationUrl.trim()
      ? validateAbsoluteHttpUrl(notificationUrl, "ALLIANCEPAY_NOTIFICATION_URL")
      : `${origin}${CALLBACK_PATH}`,
  };
}

function getMissingPaymentConfig(): string[] {
  return [
    "DATABASE_URL",
    "ALLIANCEPAY_MERCHANT_ID",
    "ALLIANCEPAY_SERVICE_CODE",
    "ALLIANCEPAY_MERCHANT_ALIAS_ID",
    "ALLIANCEPAY_API_URL",
    "PUBLIC_APP_ORIGIN",
  ].filter((key) => !process.env[key]?.trim());
}

function getProviderErrorSummary(data: Record<string, unknown>): Record<string, unknown> {
  const summary: Record<string, unknown> = {};
  for (const key of [
    "error",
    "errorCode",
    "code",
    "message",
    "status",
    "reason",
    "requestId",
    "traceId",
    "request_id",
    "trace_id",
    "correlationId",
  ]) {
    const value = data[key];
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      summary[key] = value;
    }
  }
  return summary;
}

function getProviderString(data: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = data[key];
    if (typeof value === "string" && value.trim()) {
      return value;
    }
    if (typeof value === "number" || typeof value === "boolean") {
      return String(value);
    }
  }
  return "";
}

function isTerminalNotReady(status: number, data: Record<string, unknown>): boolean {
  const text = [
    getProviderString(data, ["error", "errorCode", "code", "message", "status", "reason"]),
    JSON.stringify(getProviderErrorSummary(data)),
  ]
    .join(" ")
    .toLowerCase();

  return (
    status === 403 ||
    text.includes("terminal") ||
    text.includes("merchant") ||
    text.includes("service") ||
    text.includes("not active") ||
    text.includes("inactive") ||
    text.includes("not found") ||
    text.includes("disabled")
  );
}

function buildProviderErrorResponse(
  status: number,
  data: Record<string, unknown>,
  orderId: number | undefined,
): Record<string, unknown> {
  const providerError = getProviderErrorSummary(data);
  const code = isTerminalNotReady(status, data)
    ? "ALLIANCEPAY_TERMINAL_NOT_READY"
    : "ALLIANCEPAY_ERROR";

  return {
    code,
    error:
      code === "ALLIANCEPAY_TERMINAL_NOT_READY"
        ? "AlliancePay terminal is not ready"
        : "Payment provider error",
    orderId,
    provider: {
      status,
      code: getProviderString(data, ["errorCode", "code", "status"]),
      message: getProviderString(data, ["message", "error", "reason"]),
      requestId: getProviderString(data, ["requestId", "request_id", "correlationId"]),
      traceId: getProviderString(data, ["traceId", "trace_id"]),
      details: providerError,
    },
  };
}

async function getDb(): Promise<DbModule> {
  if (!process.env["DATABASE_URL"]) {
    throw new Error("DATABASE_URL is not configured");
  }

  return {
    pool: new Pool({ connectionString: process.env["DATABASE_URL"] }),
  };
}

async function ensurePaymentOrdersTable(dbModule: DbModule): Promise<void> {
  await dbModule.pool.query(`
    create table if not exists ticket_orders (
      id serial primary key,
      merchant_request_id text not null unique,
      ticket_type text not null,
      amount_kopiykas integer not null,
      currency text not null default 'UAH',
      status text not null default 'PENDING',
      customer_email text not null,
      customer_first_name text not null,
      customer_last_name text not null,
      customer_phone text,
      hpp_order_id text,
      redirect_url text,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `);

  await dbModule.pool.query(`
    create index if not exists ticket_orders_merchant_request_id_idx
    on ticket_orders (merchant_request_id)
  `);

  await dbModule.pool.query(`
    create index if not exists ticket_orders_hpp_order_id_idx
    on ticket_orders (hpp_order_id)
  `);
}

export async function createOrder(req: VercelApiRequest, res: ServerResponse): Promise<void> {
  let parsedBody: z.infer<typeof createOrderBodySchema>;
  try {
    const parsed = createOrderBodySchema.safeParse(await readJsonBody(req));
    if (!parsed.success) {
      sendJson(res, 400, {
        code: "INVALID_REQUEST",
        error: "Invalid request body",
        details: parsed.error.flatten(),
      });
      return;
    }
    parsedBody = parsed.data;
  } catch {
    sendJson(res, 400, { code: "INVALID_REQUEST", error: "Invalid JSON body" });
    return;
  }

  const missingConfig = getMissingPaymentConfig();
  if (missingConfig.length > 0) {
    console.error("Payment configuration missing", { missingConfig });
    sendJson(res, 503, {
      code: "MISSING_CONFIG",
      error: "Payment service is not configured",
      missingConfig,
    });
    return;
  }

  let dbModule: DbModule;
  try {
    dbModule = await getDb();
  } catch (err) {
    console.error("Payment database module failed to load", {
      error: err instanceof Error ? err.message : "Unknown error",
    });
    sendJson(res, 503, { code: "DATABASE_ERROR", error: "Payment database is unavailable" });
    return;
  }

  try {
    await ensurePaymentOrdersTable(dbModule);
  } catch (err) {
    console.error("Payment database migration failed", {
      error: err instanceof Error ? err.message : "Unknown error",
    });
    sendJson(res, 503, {
      code: "DATABASE_MIGRATION_ERROR",
      error: "Payment database migration failed",
    });
    return;
  }

  const { ticketType, firstName, lastName, email, phone } = parsedBody;
  const coinAmount = ticketPrices[ticketType] ?? 0;
  if (!coinAmount) {
    sendJson(res, 400, { code: "INVALID_REQUEST", error: "Unknown ticket type" });
    return;
  }

  let urls: ReturnType<typeof buildPaymentUrls>;
  try {
    urls = buildPaymentUrls();
  } catch (err) {
    console.error("Payment URL configuration invalid", {
      error: err instanceof Error ? err.message : "Unknown error",
    });
    sendJson(res, 503, { code: "MISSING_CONFIG", error: "Payment URL configuration is invalid" });
    return;
  }

  const merchantRequestId = crypto.randomUUID();
  let orderId: number | undefined;

  try {
    const result = await dbModule.pool.query<{ id: number }>(
      `insert into ticket_orders (
        merchant_request_id,
        ticket_type,
        amount_kopiykas,
        currency,
        status,
        customer_email,
        customer_first_name,
        customer_last_name,
        customer_phone
      ) values ($1, $2, $3, 'UAH', 'PENDING', $4, $5, $6, $7)
      returning id`,
      [merchantRequestId, ticketType, coinAmount, email, firstName, lastName, phone || null],
    );
    orderId = result.rows[0]?.id;
  } catch (err) {
    console.error("Payment order insert failed", {
      error: err instanceof Error ? err.message : "Unknown error",
      merchantRequestId,
    });
    sendJson(res, 503, { code: "DATABASE_ERROR", error: "Payment database write failed" });
    return;
  }

  const albPayload = {
    merchantRequestId,
    merchantId: process.env["ALLIANCEPAY_MERCHANT_ID"],
    serviceCode: process.env["ALLIANCEPAY_SERVICE_CODE"],
    merchantAliasId: process.env["ALLIANCEPAY_MERCHANT_ALIAS_ID"],
    hppPayType: "PURCHASE",
    directType: "REDIRECT",
    coinAmount,
    paymentMethods: ["CARD"],
    language: "uk",
    notificationUrl: urls.notificationUrl,
    successUrl: urls.successUrl,
    failUrl: urls.failUrl,
    statusPageType: "STATUS_TIMER_PAGE",
    purpose: "SBC Summit Ukraine 2026",
    customerData: {
      senderFirstName: firstName,
      senderLastName: lastName,
      senderEmail: email,
      senderPhone: phone || undefined,
    },
  };

  let redirectUrl = "";
  let hppOrderId = "";
  try {
    const albRes = await fetch(ALB_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(albPayload),
    });
    const albData = await albRes.json().catch(() => ({} as Record<string, unknown>));
    if (!albRes.ok) {
      const errorResponse = buildProviderErrorResponse(albRes.status, albData, orderId);
      console.error("ALB API error creating payment order", {
        status: albRes.status,
        merchantRequestId,
        providerError: errorResponse.provider,
      });
      sendJson(res, 502, errorResponse);
      return;
    }

    redirectUrl = String(albData.redirectUrl || "");
    hppOrderId = String(albData.hppOrderId || "");
  } catch (err) {
    console.error("ALB API network error creating payment order", {
      error: err instanceof Error ? err.message : "Unknown error",
      merchantRequestId,
    });
    sendJson(res, 502, {
      code: "ALLIANCEPAY_ERROR",
      error: "Payment provider unreachable",
      orderId,
    });
    return;
  }

  if (!redirectUrl) {
    console.error("ALB API response missing redirect URL", { merchantRequestId });
    sendJson(res, 502, {
      code: "ALLIANCEPAY_ERROR",
      error: "No redirect URL from payment provider",
      orderId,
    });
    return;
  }

  try {
    await dbModule.pool.query(
      `update ticket_orders
       set hpp_order_id = $1, redirect_url = $2, status = 'PENDING', updated_at = now()
       where id = $3`,
      [hppOrderId || null, redirectUrl, orderId],
    );
  } catch (err) {
    console.error("Payment order update failed", {
      error: err instanceof Error ? err.message : "Unknown error",
      merchantRequestId,
    });
    sendJson(res, 503, {
      code: "DATABASE_ERROR",
      error: "Payment database update failed",
      orderId,
    });
    return;
  }

  sendJson(res, 200, {
    success: true,
    orderId,
    merchantRequestId,
    redirectUrl,
  });
}
