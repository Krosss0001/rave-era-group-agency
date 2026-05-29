import type { IncomingMessage, ServerResponse } from "node:http";
import { compactDecrypt, importJWK, type JWK } from "jose";
import pg from "pg";
import { z } from "zod";

export type VercelApiRequest = IncomingMessage & {
  body?: unknown;
};

type DbModule = {
  pool: pg.Pool;
};

type AlliancePayAuthHeaders = {
  "x-api_version": string;
  "x-device_id": string;
  "x-refresh_token": string;
};

type AlliancePaySession = {
  deviceId: string;
  refreshToken: string;
  expiresAt: number;
};

type AlliancePayProviderStep = "authorize_virtual_device" | "hpp_create_order";

class AlliancePayServiceMessageError extends Error {
  constructor(
    public readonly providerStep: AlliancePayProviderStep,
    public readonly providerStatus: number,
    public readonly providerMessage: Record<string, unknown>,
  ) {
    super("AlliancePay returned a service message");
  }
}

const { Pool } = pg;

const ALB_API_URL =
  process.env["ALLIANCEPAY_API_URL"] ||
  "https://api-ecom-prod.bankalliance.ua/ecom/execute_request/hpp/v1/create-order";
const EVENT_PAYMENT_PATH = "/event/sbc-summit-ukraine-2026/payment";
const CALLBACK_PATH = "/api/payment/callback";
let cachedAlliancePaySession: AlliancePaySession | null = null;

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
  const missing = [
    "DATABASE_URL",
    "ALLIANCEPAY_MERCHANT_ID",
    "ALLIANCEPAY_SERVICE_CODE",
    "ALLIANCEPAY_MERCHANT_ALIAS_ID",
    "ALLIANCEPAY_API_URL",
    "PUBLIC_APP_ORIGIN",
  ].filter((key) => !process.env[key]?.trim());

  if (
    !process.env["ALLIANCEPAY_PRIVATE_JWK"]?.trim() &&
    (!process.env["ALLIANCEPAY_DEVICE_ID"]?.trim() || !process.env["ALLIANCEPAY_REFRESH_TOKEN"]?.trim())
  ) {
    missing.push("ALLIANCEPAY_PRIVATE_JWK");
  }

  return [...new Set(missing)];
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

function isValidationServiceMessage(providerMessage: Record<string, unknown>): boolean {
  return [providerMessage["msgType"], providerMessage["msgCode"], providerMessage["msgText"]]
    .filter((value) => typeof value === "string")
    .join(" ")
    .toLowerCase()
    .includes("validation");
}

function getServiceMessageCode(
  providerStep: AlliancePayProviderStep,
  providerMessage: Record<string, unknown>,
): string {
  if (!isValidationServiceMessage(providerMessage)) {
    return "ALLIANCEPAY_SERVICE_MESSAGE";
  }

  return providerStep === "authorize_virtual_device"
    ? "ALLIANCEPAY_AUTH_VALIDATION_ERROR"
    : "ALLIANCEPAY_CREATE_ORDER_VALIDATION_ERROR";
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

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function keysOf(value: unknown): string[] {
  return Object.keys(asRecord(value) || {});
}

function getNestedValue(data: Record<string, unknown>, path: string[]): unknown {
  let current: unknown = data;
  for (const key of path) {
    const record = asRecord(current);
    if (!record) {
      return undefined;
    }
    current = record[key];
  }
  return current;
}

function isSafeHttpUrl(value: unknown): value is string {
  if (typeof value !== "string") {
    return false;
  }

  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

const redirectCandidatePaths = [
  ["redirectUrl"],
  ["redirect_url"],
  ["paymentUrl"],
  ["payment_url"],
  ["hppUrl"],
  ["hpp_url"],
  ["url"],
  ["data", "redirectUrl"],
  ["data", "redirect_url"],
  ["data", "paymentUrl"],
  ["data", "payment_url"],
  ["data", "hppUrl"],
  ["data", "hpp_url"],
  ["data", "url"],
  ["result", "redirectUrl"],
  ["result", "url"],
  ["payload", "redirectUrl"],
  ["payload", "url"],
  ["links", "payment"],
  ["links", "redirect"],
];

const hppOrderIdCandidatePaths = [
  ["hppOrderId"],
  ["hpp_order_id"],
  ["orderId"],
  ["order_id"],
  ["data", "hppOrderId"],
  ["data", "hpp_order_id"],
  ["data", "orderId"],
  ["data", "order_id"],
  ["result", "hppOrderId"],
  ["result", "orderId"],
  ["payload", "hppOrderId"],
  ["payload", "orderId"],
];

function extractRedirectUrl(data: Record<string, unknown>): string {
  for (const path of redirectCandidatePaths) {
    const value = getNestedValue(data, path);
    if (isSafeHttpUrl(value)) {
      return value;
    }
  }
  return "";
}

function extractHppOrderId(data: Record<string, unknown>): string {
  for (const path of hppOrderIdCandidatePaths) {
    const value = getNestedValue(data, path);
    if (typeof value === "string" && value.trim()) {
      return value;
    }
    if (typeof value === "number") {
      return String(value);
    }
  }
  return "";
}

function buildProviderShape(data: Record<string, unknown>): Record<string, unknown> {
  const redirectCandidateValues: Record<string, string> = {};
  for (const path of redirectCandidatePaths) {
    const value = getNestedValue(data, path);
    if (isSafeHttpUrl(value)) {
      redirectCandidateValues[path.join(".")] = value;
    }
  }

  const hppOrderIdCandidates: Record<string, string> = {};
  for (const path of hppOrderIdCandidatePaths) {
    const value = getNestedValue(data, path);
    if (typeof value === "string" && value.trim()) {
      hppOrderIdCandidates[path.join(".")] = value;
    } else if (typeof value === "number") {
      hppOrderIdCandidates[path.join(".")] = String(value);
    }
  }

  return {
    topLevelKeys: keysOf(data),
    dataKeys: keysOf(data.data),
    resultKeys: keysOf(data.result),
    payloadKeys: keysOf(data.payload),
    linksKeys: keysOf(data.links),
    hppOrderIdCandidates,
    redirectCandidateValues,
  };
}

function parsePrivateJwk(): JWK | null {
  const raw = process.env["ALLIANCEPAY_PRIVATE_JWK"];
  if (!raw?.trim()) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as JWK;
    return parsed;
  } catch {
    return null;
  }
}

function privateJwkLooksValid(): boolean {
  const jwk = parsePrivateJwk();
  return Boolean(
    jwk &&
      jwk.kty === "EC" &&
      jwk.crv === "P-384" &&
      typeof jwk.x === "string" &&
      typeof jwk.y === "string" &&
      typeof jwk.d === "string",
  );
}

function getApiOrigin(): string {
  return new URL(ALB_API_URL).origin;
}

function parseAlliancePaySession(data: Record<string, unknown>): AlliancePaySession | null {
  const deviceId = getProviderString(data, ["deviceId", "device_id"]);
  const refreshToken = getProviderString(data, ["refreshToken", "refresh_token"]);
  if (!deviceId || !refreshToken) {
    return null;
  }

  return {
    deviceId,
    refreshToken,
    expiresAt: Date.now() + 8 * 60 * 60 * 1000,
  };
}

async function decryptAlliancePayJwe(jwe: string): Promise<Record<string, unknown>> {
  const privateJwk = parsePrivateJwk();
  if (!privateJwk || !privateJwkLooksValid()) {
    throw new Error("ALLIANCEPAY_PRIVATE_JWK is invalid");
  }

  const key = await importJWK(privateJwk, "ECDH-ES+A256KW");
  const decrypted = await compactDecrypt(jwe, key);
  return JSON.parse(new TextDecoder().decode(decrypted.plaintext)) as Record<string, unknown>;
}

async function authorizeAlliancePayVirtualDevice(): Promise<AlliancePaySession> {
  if (cachedAlliancePaySession && cachedAlliancePaySession.expiresAt > Date.now() + 5 * 60 * 1000) {
    return cachedAlliancePaySession;
  }

  const serviceCode = process.env["ALLIANCEPAY_SERVICE_CODE"];
  if (!serviceCode?.trim()) {
    throw new Error("ALLIANCEPAY_SERVICE_CODE is missing");
  }

  const authRes = await fetch(`${getApiOrigin()}/api-gateway/authorize_virtual_device`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "x-api_version": "1",
    },
    body: JSON.stringify({ serviceCode }),
  });
  const authData = await authRes.json().catch(() => ({} as Record<string, unknown>));
  const authServiceMessage = getAlliancePayServiceMessage(authData);
  if (authServiceMessage) {
    console.error("ALB virtual device authorization returned service message", {
      providerStep: "authorize_virtual_device",
      providerStatus: authRes.status,
      providerMessage: authServiceMessage,
    });
    throw new AlliancePayServiceMessageError(
      "authorize_virtual_device",
      authRes.status,
      authServiceMessage,
    );
  }

  if (!authRes.ok) {
    console.error("ALB virtual device authorization failed", {
      providerStep: "authorize_virtual_device",
      status: authRes.status,
      providerError: getProviderErrorSummary(authData),
    });
    throw new Error("AlliancePay virtual device authorization failed");
  }

  const responseJwe = getProviderString(authData, ["jwe"]);
  if (!responseJwe) {
    console.error("ALB virtual device authorization missing JWE", {
      topLevelKeys: keysOf(authData),
    });
    throw new Error("AlliancePay virtual device authorization missing JWE");
  }

  const decrypted = await decryptAlliancePayJwe(responseJwe);
  const session = parseAlliancePaySession(decrypted);
  if (!session) {
    console.error("ALB virtual device authorization decrypted response missing session fields", {
      topLevelKeys: keysOf(decrypted),
    });
    throw new Error("AlliancePay virtual device authorization missing session fields");
  }

  cachedAlliancePaySession = session;
  return session;
}

async function getAlliancePayAuthHeaders(): Promise<AlliancePayAuthHeaders> {
  const configuredDeviceId = process.env["ALLIANCEPAY_DEVICE_ID"];
  const configuredRefreshToken = process.env["ALLIANCEPAY_REFRESH_TOKEN"];
  if (configuredDeviceId?.trim() && configuredRefreshToken?.trim()) {
    return {
      "x-api_version": "v1",
      "x-device_id": configuredDeviceId,
      "x-refresh_token": configuredRefreshToken,
    };
  }

  const session = await authorizeAlliancePayVirtualDevice();
  return {
    "x-api_version": "v1",
    "x-device_id": session.deviceId,
    "x-refresh_token": session.refreshToken,
  };
}

export function getPaymentConfigCheck(): Record<string, unknown> {
  let apiHost = "";
  try {
    apiHost = new URL(ALB_API_URL).host;
  } catch {
    apiHost = "";
  }

  return {
    ok: true,
    hasDatabaseUrl: Boolean(process.env["DATABASE_URL"]?.trim()),
    hasPrivateJwk: Boolean(process.env["ALLIANCEPAY_PRIVATE_JWK"]?.trim()),
    privateJwkLooksValid: privateJwkLooksValid(),
    hasMerchantId: Boolean(process.env["ALLIANCEPAY_MERCHANT_ID"]?.trim()),
    hasServiceCode: Boolean(process.env["ALLIANCEPAY_SERVICE_CODE"]?.trim()),
    hasMerchantAliasId: Boolean(process.env["ALLIANCEPAY_MERCHANT_ALIAS_ID"]?.trim()),
    hasApiUrl: Boolean(process.env["ALLIANCEPAY_API_URL"]?.trim()),
    apiHost,
  };
}

function getSafeProviderValue(data: Record<string, unknown>, key: string): unknown {
  const value = data[key];
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean" ||
    value === null
  ) {
    return value;
  }
  if (Array.isArray(value)) {
    return value;
  }
  if (value && typeof value === "object") {
    return value;
  }
  return undefined;
}

function getAlliancePayServiceMessage(data: Record<string, unknown>): Record<string, unknown> | null {
  const hasServiceMessage =
    "msgCode" in data || "msgText" in data || "msgType" in data || "errorCauses" in data;
  if (!hasServiceMessage) {
    return null;
  }

  return {
    requestId: getSafeProviderValue(data, "requestId"),
    serviceId: getSafeProviderValue(data, "serviceId"),
    msgCode: getSafeProviderValue(data, "msgCode"),
    msgType: getSafeProviderValue(data, "msgType"),
    msgText: getSafeProviderValue(data, "msgText"),
    isLocalized: getSafeProviderValue(data, "isLocalized"),
    msgAttrs: getSafeProviderValue(data, "msgAttrs"),
    errorCauses: getSafeProviderValue(data, "errorCauses"),
  };
}

function buildCreateOrderRequestShape(payload: Record<string, unknown>): Record<string, unknown> {
  const urlFieldNames = ["successUrl", "failUrl", "notificationUrl", "callbackUrl", "returnUrl"].filter(
    (key) => key in payload,
  );

  return {
    topLevelKeys: Object.keys(payload),
    hppPayType: payload["hppPayType"],
    directType: payload["directType"],
    coinAmountType: typeof payload["coinAmount"],
    coinAmountValue: payload["coinAmount"],
    paymentMethods: payload["paymentMethods"],
    statusPageType: payload["statusPageType"],
    language: payload["language"],
    urlFieldNames,
    hasMerchantId: Boolean(payload["merchantId"]),
    hasMerchantAliasId: Boolean(payload["merchantAliasId"]),
    hasServiceCode: Boolean(payload["serviceCode"]),
    hasPurpose: Boolean(payload["purpose"]),
    hasDescription: Boolean(payload["description"]),
    hasCustomerBlock: Boolean(asRecord(payload["customerData"])),
    customerDataKeys: keysOf(payload["customerData"]),
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
  if (
    (!process.env["ALLIANCEPAY_DEVICE_ID"]?.trim() || !process.env["ALLIANCEPAY_REFRESH_TOKEN"]?.trim()) &&
    !privateJwkLooksValid()
  ) {
    sendJson(res, 503, {
      code: "MISSING_CONFIG",
      error: "Payment service is not configured",
      missingConfig: ["ALLIANCEPAY_PRIVATE_JWK"],
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
    hppPayType: "PURCHASE",
    directType: "REDIRECT",
    coinAmount,
    paymentMethods: ["CARD"],
    language: "uk",
    notificationUrl: urls.notificationUrl,
    successUrl: urls.successUrl,
    failUrl: urls.failUrl,
    statusPageType: "STATUS_TIMER_PAGE",
    expirationTimeMinutes: 1440,
    purpose: "SBC Summit Ukraine 2026",
    customerData: {
      senderCustomerId: merchantRequestId,
    },
  };

  let redirectUrl = "";
  let hppOrderId = "";
  let albData: Record<string, unknown> = {};
  try {
    const authHeaders = await getAlliancePayAuthHeaders();
    const albRes = await fetch(ALB_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...authHeaders,
      },
      body: JSON.stringify(albPayload),
    });
    albData = await albRes.json().catch(() => ({} as Record<string, unknown>));
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

    const serviceMessage = getAlliancePayServiceMessage(albData);
    if (serviceMessage) {
      const requestShape = buildCreateOrderRequestShape(albPayload);
      const serviceMessageCode = getServiceMessageCode("hpp_create_order", serviceMessage);
      console.error("ALB API returned service message", {
        providerStep: "hpp_create_order",
        merchantRequestId,
        providerStatus: albRes.status,
        providerMessage: serviceMessage,
        requestShape,
      });
      sendJson(res, 502, {
        code: serviceMessageCode,
        error: "AlliancePay returned a service message",
        orderId,
        providerStep: "hpp_create_order",
        providerStatus: albRes.status,
        providerMessage: serviceMessage,
        ...(serviceMessageCode === "ALLIANCEPAY_CREATE_ORDER_VALIDATION_ERROR" ? { requestShape } : {}),
      });
      return;
    }

    redirectUrl = extractRedirectUrl(albData);
    hppOrderId = extractHppOrderId(albData);
  } catch (err) {
    if (err instanceof AlliancePayServiceMessageError) {
      sendJson(res, 502, {
        code: getServiceMessageCode(err.providerStep, err.providerMessage),
        error: "AlliancePay returned a service message",
        orderId,
        providerStep: err.providerStep,
        providerStatus: err.providerStatus,
        providerMessage: err.providerMessage,
      });
      return;
    }

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
    const providerShape = buildProviderShape(albData);
    console.error("ALB API response missing redirect URL", {
      merchantRequestId,
      providerStatus: 200,
      providerShape,
    });
    sendJson(res, 502, {
      code: "ALLIANCEPAY_NO_REDIRECT_URL",
      error: "No redirect URL from payment provider",
      orderId,
      providerStatus: 200,
      providerShape,
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
