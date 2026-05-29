import type { IncomingMessage, ServerResponse } from "node:http";
import pg from "pg";
import { z } from "zod";

type VercelCatchAllRequest = IncomingMessage & {
  body?: unknown;
  query?: {
    path?: string | string[];
  };
};

const { Pool } = pg;

type DbModule = {
  pool: pg.Pool;
};

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

function getCatchAllPath(req: VercelCatchAllRequest, parsed: URL): string | null {
  const queryPath = req.query?.path;
  if (Array.isArray(queryPath) && queryPath.length > 0) {
    return queryPath.map((segment) => encodeURIComponent(segment)).join("/");
  }
  if (typeof queryPath === "string" && queryPath.length > 0) {
    return queryPath
      .split("/")
      .filter(Boolean)
      .map((segment) => encodeURIComponent(segment))
      .join("/");
  }

  const searchPath = parsed.searchParams.getAll("path");
  if (searchPath.length > 0) {
    return searchPath.map((segment) => encodeURIComponent(segment)).join("/");
  }

  return null;
}

function normalizeApiUrl(req: VercelCatchAllRequest): URL {
  const rawUrl = req.url || "/";
  const parsed = new URL(rawUrl, "http://vercel.local");
  const catchAllPath = getCatchAllPath(req, parsed);
  const normalizedPath =
    catchAllPath && (parsed.pathname.includes("[...path]") || parsed.pathname === "/api")
      ? `/api/${catchAllPath}`
      : parsed.pathname === "/api" || parsed.pathname.startsWith("/api/")
        ? parsed.pathname
        : `/api${parsed.pathname.startsWith("/") ? parsed.pathname : `/${parsed.pathname}`}`;

  parsed.searchParams.delete("path");
  return new URL(`${normalizedPath}${parsed.search}`, "http://vercel.local");
}

function sendJson(res: ServerResponse, statusCode: number, body: unknown): void {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

function sendCors(res: ServerResponse): void {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Accept");
}

function logRequest(method: string | undefined, originalPath: string, normalizedPath: string): void {
  console.info("Vercel API request", {
    method,
    originalPath,
    normalizedPath,
  });
}

async function readJsonBody(req: VercelCatchAllRequest): Promise<unknown> {
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
  for (const key of ["error", "errorCode", "code", "message", "status", "reason"]) {
    const value = data[key];
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      summary[key] = value;
    }
  }
  return summary;
}

async function getDb(): Promise<DbModule> {
  if (!process.env["DATABASE_URL"]) {
    throw new Error("DATABASE_URL is not configured");
  }

  return {
    pool: new Pool({ connectionString: process.env["DATABASE_URL"] }),
  };
}

async function createOrder(req: VercelCatchAllRequest, res: ServerResponse): Promise<void> {
  let parsedBody: z.infer<typeof createOrderBodySchema>;
  try {
    const parsed = createOrderBodySchema.safeParse(await readJsonBody(req));
    if (!parsed.success) {
      sendJson(res, 400, { error: "Invalid request body", details: parsed.error.flatten() });
      return;
    }
    parsedBody = parsed.data;
  } catch {
    sendJson(res, 400, { error: "Invalid JSON body" });
    return;
  }

  const missingConfig = getMissingPaymentConfig();
  if (missingConfig.length > 0) {
    console.error("Payment configuration missing", { missingConfig });
    sendJson(res, 503, { error: "Payment service is not configured", missingConfig });
    return;
  }

  let dbModule: DbModule;
  try {
    dbModule = await getDb();
  } catch (err) {
    console.error("Payment database module failed to load", {
      error: err instanceof Error ? err.message : "Unknown error",
    });
    sendJson(res, 503, { error: "Payment database is unavailable" });
    return;
  }

  const { ticketType, firstName, lastName, email, phone } = parsedBody;
  const coinAmount = ticketPrices[ticketType] ?? 0;
  if (!coinAmount) {
    sendJson(res, 400, { error: "Unknown ticket type" });
    return;
  }

  let urls: ReturnType<typeof buildPaymentUrls>;
  try {
    urls = buildPaymentUrls();
  } catch (err) {
    console.error("Payment URL configuration invalid", {
      error: err instanceof Error ? err.message : "Unknown error",
    });
    sendJson(res, 503, { error: "Payment URL configuration is invalid" });
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
        status,
        customer_email,
        customer_first_name,
        customer_last_name,
        customer_phone
      ) values ($1, $2, $3, 'PENDING', $4, $5, $6, $7)
      returning id`,
      [merchantRequestId, ticketType, coinAmount, email, firstName, lastName, phone || null],
    );
    orderId = result.rows[0]?.id;
  } catch (err) {
    console.error("Payment order insert failed", {
      error: err instanceof Error ? err.message : "Unknown error",
      merchantRequestId,
    });
    sendJson(res, 503, { error: "Payment database write failed" });
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
    paymentMethods: "CARD",
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
      console.error("ALB API error creating payment order", {
        status: albRes.status,
        merchantRequestId,
        providerError: getProviderErrorSummary(albData),
      });
      sendJson(res, 502, { error: "Payment provider error", orderId });
      return;
    }

    redirectUrl = String(albData.redirectUrl || "");
    hppOrderId = String(albData.hppOrderId || "");
  } catch (err) {
    console.error("ALB API network error creating payment order", {
      error: err instanceof Error ? err.message : "Unknown error",
      merchantRequestId,
    });
    sendJson(res, 502, { error: "Payment provider unreachable", orderId });
    return;
  }

  if (!redirectUrl) {
    console.error("ALB API response missing redirect URL", { merchantRequestId });
    sendJson(res, 502, { error: "No redirect URL from payment provider", orderId });
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
    sendJson(res, 503, { error: "Payment database update failed", orderId });
    return;
  }

  sendJson(res, 200, {
    success: true,
    orderId,
    merchantRequestId,
    redirectUrl,
  });
}

export default async function handler(req: VercelCatchAllRequest, res: ServerResponse) {
  sendCors(res);

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  const originalUrl = new URL(req.url || "/", "http://vercel.local");
  const normalizedUrl = normalizeApiUrl(req);
  logRequest(req.method, originalUrl.pathname, normalizedUrl.pathname);

  if (
    req.method === "GET" &&
    (normalizedUrl.pathname === "/api/health" || normalizedUrl.pathname === "/api/healthz")
  ) {
    sendJson(res, 200, { ok: true, service: "raveera-api" });
    return;
  }

  if (req.method === "POST" && normalizedUrl.pathname === "/api/payment/create-order") {
    await createOrder(req, res);
    return;
  }

  sendJson(res, 404, { error: "API route not found" });
}
