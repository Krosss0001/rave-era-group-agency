import type { IncomingMessage, ServerResponse } from "node:http";
import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import fontkit from "@pdf-lib/fontkit";
import { compactDecrypt, importJWK, type JWK } from "jose";
import nodemailer from "nodemailer";
import { PDFDocument, rgb, type PDFFont } from "pdf-lib";
import pg from "pg";
import QRCode from "qrcode";
import { z } from "zod";

export type VercelApiRequest = IncomingMessage & {
  body?: unknown;
};

export type DbModule = {
  pool: pg.Pool;
};

type AlliancePayAuthHeaders = {
  "x-api_version": string;
  "x-device_id": string;
  "x-refresh_token": string;
};

type PaymentUrls = {
  successUrl: string;
  failUrl: string;
  notificationUrl: string;
};

type AlliancePaySession = {
  deviceId: string;
  refreshToken: string;
  expiresAt: number;
};

type AlliancePayProviderStep = "authorize_virtual_device" | "hpp_create_order";

type PaymentStatus = "SUCCESS" | "FAIL" | "PENDING" | "REQUIRED_3DS";

type TicketOrder = {
  id: number;
  merchant_request_id: string;
  hpp_order_id: string | null;
  ticket_type: string;
  amount_kopiykas: number;
  currency: string;
  status: PaymentStatus;
  payment_status: PaymentStatus;
  order_status: PaymentStatus;
  customer_email: string;
  customer_first_name: string;
  customer_last_name: string;
  email_status: string;
  email_sent_at?: Date | null;
};

type TicketRecord = {
  id: number;
  ticket_code: string;
  order_id: number;
  merchant_request_id: string;
  hpp_order_id: string | null;
  event_slug: string;
  event_title: string;
  ticket_type: string;
  customer_email: string;
  customer_first_name: string;
  customer_last_name: string;
  status: "ACTIVE" | "USED" | "CANCELLED";
  qr_payload: string;
  issued_at: Date;
  checked_in_at?: Date | null;
  checked_in_by?: string | null;
  updated_at?: Date | null;
};

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

export const ALLIANCEPAY_HPP_CREATE_ORDER_URL =
  "https://api-ecom-prod.bankalliance.ua/ecom/execute_request/hpp/v1/create-order";
export const ALLIANCEPAY_HPP_OPERATIONS_URL =
  "https://api-ecom-prod.bankalliance.ua/ecom/execute_request/hpp/v1/operations";

const ALB_API_URL =
  process.env["ALLIANCEPAY_API_URL"] ||
  ALLIANCEPAY_HPP_CREATE_ORDER_URL;
const ALB_HPP_OPERATIONS_URL =
  process.env["ALLIANCEPAY_HPP_OPERATIONS_URL"] ||
  `${new URL(ALB_API_URL).origin}/ecom/execute_request/hpp/v1/operations`;
const EVENT_PAYMENT_PATH = "/event/sbc-summit-ukraine-2026/payment";
const CALLBACK_PATH = "/api/payment/callback";
const CANONICAL_PUBLIC_APP_ORIGIN = "https://www.rave-era.com.ua";
const EVENT_SLUG = "sbc-summit-ukraine-2026";
const EVENT_TITLE = "SBC Summit Ukraine 2026";
const require = createRequire(import.meta.url);
let cachedAlliancePaySession: AlliancePaySession | null = null;
let cachedDbModule: DbModule | null = null;
let cachedNotoLatinFontBytes: Uint8Array | null = null;
let cachedNotoLatinBoldFontBytes: Uint8Array | null = null;
let cachedNotoCyrillicFontBytes: Uint8Array | null = null;
let cachedNotoCyrillicBoldFontBytes: Uint8Array | null = null;

export const ticketPrices: Record<string, number> = {
  sport: 250000,
  business: 650000,
  online: 100,
};

const createOrderBodySchema = z.object({
  ticketType: z.enum(["sport", "business", "online"]),
  firstName: z.string().min(1).max(30),
  lastName: z.string().min(1).max(30),
  email: z.string().email().max(256),
  phone: z.string().min(10).max(20).optional(),
});

const optionalNonEmptyString = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().min(1).optional(),
);

const callbackBodySchema = z
  .object({
    hppOrderId: optionalNonEmptyString,
    merchantRequestId: optionalNonEmptyString,
    orderStatus: z.enum(["SUCCESS", "FAIL", "PENDING", "REQUIRED_3DS"]),
  })
  .passthrough()
  .refine((body) => Boolean(body.hppOrderId || body.merchantRequestId), {
    message: "Missing order identifier",
    path: ["merchantRequestId"],
  });

const checkinLoginBodySchema = z.object({
  pin: z.string().min(1).max(128),
});

const checkinVerifyBodySchema = z.object({
  ticketCode: z.string().max(256).optional(),
  qrPayload: z.string().max(512).optional(),
}).refine((body) => Boolean(body.ticketCode?.trim() || body.qrPayload?.trim()), {
  message: "ticketCode or qrPayload is required",
  path: ["ticketCode"],
});

const checkinMarkUsedBodySchema = z.object({
  ticketCode: z.string().min(1).max(256),
});

export function sendJson(res: ServerResponse, statusCode: number, body: unknown): void {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

export function sendCors(res: ServerResponse): void {
  res.setHeader("Access-Control-Allow-Origin", CANONICAL_PUBLIC_APP_ORIGIN);
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

function buildPaymentUrls(merchantRequestId: string, ticketType: string): PaymentUrls {
  const origin = CANONICAL_PUBLIC_APP_ORIGIN;

  return {
    successUrl: `${origin}${EVENT_PAYMENT_PATH}/success?merchantRequestId=${encodeURIComponent(merchantRequestId)}`,
    failUrl: `${origin}${EVENT_PAYMENT_PATH}/fail?type=${encodeURIComponent(ticketType)}`,
    notificationUrl: `${origin}${CALLBACK_PATH}`,
  };
}

function normalizeHttpOrigin(rawOrigin: string, name: string): string {
  try {
    const parsed = new URL(rawOrigin.trim());
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      throw new Error("Invalid protocol");
    }
    return parsed.origin;
  } catch {
    throw new Error(`${name} must be a valid HTTP(S) origin`);
  }
}

export function buildAlliancePayAuthHeaders(
  deviceId: string,
  refreshToken: string,
): AlliancePayAuthHeaders {
  return {
    "x-api_version": "v1",
    "x-device_id": deviceId,
    "x-refresh_token": refreshToken,
  };
}

export function buildAlliancePayHppCreateOrderPayload({
  merchantRequestId,
  merchantId,
  coinAmount,
  language,
  purpose,
  urls,
}: {
  merchantRequestId: string;
  merchantId: string | undefined;
  coinAmount: number;
  language: "uk" | "en";
  purpose: string;
  urls: PaymentUrls;
}) {
  return {
    merchantRequestId,
    merchantId,
    hppPayType: "PURCHASE",
    directType: "REDIRECT",
    coinAmount,
    paymentMethods: ["CARD", "APPLE_PAY", "GOOGLE_PAY"],
    language,
    notificationUrl: urls.notificationUrl,
    successUrl: urls.successUrl,
    failUrl: urls.failUrl,
    statusPageType: "STATUS_TIMER_PAGE",
    expirationTimeMinutes: 1440,
    purpose,
    customerData: {
      senderCustomerId: merchantRequestId,
    },
  };
}

function getMissingPaymentConfig(): string[] {
  const missing = [
    "DATABASE_URL",
    "ALLIANCEPAY_MERCHANT_ID",
    "ALLIANCEPAY_SERVICE_CODE",
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

function getDiagnosticRef(value: string | null | undefined): string {
  return value ? createHash("sha256").update(value).digest("hex").slice(0, 12) : "";
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
    return buildAlliancePayAuthHeaders(configuredDeviceId, configuredRefreshToken);
  }

  const session = await authorizeAlliancePayVirtualDevice();
  return buildAlliancePayAuthHeaders(session.deviceId, session.refreshToken);
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
    hasApiUrl: Boolean(process.env["ALLIANCEPAY_API_URL"]?.trim()),
    apiHost,
  };
}

export function getEmailConfigCheck(): Record<string, boolean> {
  return {
    ok: true,
    hasSmtpHost: Boolean(process.env["SMTP_HOST"]?.trim()),
    hasSmtpPort: Boolean(process.env["SMTP_PORT"]?.trim()),
    hasSmtpUser: Boolean(process.env["SMTP_USER"]?.trim()),
    hasSmtpPass: Boolean(process.env["SMTP_PASS"]?.trim()),
    hasSmtpFrom: Boolean(process.env["SMTP_FROM"]?.trim()),
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
    return value.filter(
      (item) =>
        typeof item === "string" ||
        typeof item === "number" ||
        typeof item === "boolean" ||
        item === null,
    );
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
    hasServiceCode: Boolean(payload["serviceCode"]),
    hasPurpose: Boolean(payload["purpose"]),
    hasDescription: Boolean(payload["description"]),
    hasCustomerBlock: Boolean(asRecord(payload["customerData"])),
    customerDataKeys: keysOf(payload["customerData"]),
  };
}

async function getDb(): Promise<DbModule> {
  if (cachedDbModule) {
    return cachedDbModule;
  }
  if (!process.env["DATABASE_URL"]) {
    throw new Error("DATABASE_URL is not configured");
  }

  cachedDbModule = {
    pool: new Pool({ connectionString: process.env["DATABASE_URL"] }),
  };
  return cachedDbModule;
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
      payment_status text not null default 'PENDING',
      order_status text not null default 'PENDING',
      alliancepay_callback_payload_safe jsonb,
      paid_at timestamptz,
      email_status text not null default 'PENDING',
      email_sent_at timestamptz,
      email_error_safe text,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `);

  await dbModule.pool.query(`
    alter table ticket_orders add column if not exists payment_status text not null default 'PENDING';
    alter table ticket_orders add column if not exists order_status text not null default 'PENDING';
    alter table ticket_orders add column if not exists alliancepay_callback_payload_safe jsonb;
    alter table ticket_orders add column if not exists paid_at timestamptz;
    alter table ticket_orders add column if not exists email_status text not null default 'PENDING';
    alter table ticket_orders add column if not exists email_sent_at timestamptz;
    alter table ticket_orders add column if not exists email_error_safe text;
  `);

  await dbModule.pool.query(`
    create table if not exists tickets (
      id serial primary key,
      ticket_code text not null unique,
      order_id integer not null unique references ticket_orders(id),
      merchant_request_id text not null,
      hpp_order_id text,
      event_slug text not null,
      event_title text not null,
      ticket_type text not null,
      customer_email text not null,
      customer_first_name text not null,
      customer_last_name text not null,
      status text not null default 'ACTIVE',
      qr_payload text not null,
      qr_token_hash text,
      issued_at timestamptz not null default now(),
      checked_in_at timestamptz,
      checked_in_by text,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `);

  await dbModule.pool.query(`
    alter table tickets add column if not exists checked_in_at timestamptz;
    alter table tickets add column if not exists checked_in_by text;
    alter table tickets add column if not exists updated_at timestamptz default now();
  `);

  await dbModule.pool.query(`
    create table if not exists ticket_checkins (
      id serial primary key,
      ticket_id integer references tickets(id),
      ticket_code text not null,
      action text not null,
      result text not null,
      checked_in_at timestamptz,
      device_label text,
      created_at timestamptz not null default now()
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

  await dbModule.pool.query(`
    create unique index if not exists tickets_ticket_code_idx on tickets (ticket_code);
    create index if not exists tickets_order_id_idx on tickets (order_id);
    create index if not exists tickets_merchant_request_id_idx on tickets (merchant_request_id);
    create index if not exists tickets_hpp_order_id_idx on tickets (hpp_order_id);
    create index if not exists tickets_customer_email_idx on tickets (customer_email);
    create index if not exists tickets_status_idx on tickets (status);
    create index if not exists ticket_checkins_ticket_code_idx on ticket_checkins (ticket_code);
    create index if not exists ticket_checkins_created_at_idx on ticket_checkins (created_at);
  `);
}

function getPublicAppOrigin(): string {
  return normalizeHttpOrigin(
    process.env["PUBLIC_APP_ORIGIN"] || "https://www.rave-era.com.ua",
    "PUBLIC_APP_ORIGIN",
  );
}

function parsePaymentStatus(value: unknown): PaymentStatus | null {
  return value === "SUCCESS" || value === "FAIL" || value === "PENDING" || value === "REQUIRED_3DS"
    ? value
    : null;
}

export function getSafeCallbackSummary(data: Record<string, unknown>): Record<string, unknown> {
  const summary: Record<string, unknown> = {};
  for (const key of [
    "hppOrderId",
    "merchantRequestId",
    "orderStatus",
    "hppPayType",
    "hppDirectType",
    "coinAmount",
    "createDate",
    "expiredOrderDate",
  ]) {
    const value = data[key];
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      summary[key] = value;
    }
  }
  if (Array.isArray(data["paymentMethods"])) {
    summary["paymentMethods"] = data["paymentMethods"].filter((value) => typeof value === "string");
  }
  return summary;
}

async function findTicketOrder(
  dbModule: DbModule,
  identifiers: { merchantRequestId?: string; hppOrderId?: string },
): Promise<TicketOrder | null> {
  const result = identifiers.merchantRequestId
    ? await dbModule.pool.query<TicketOrder>(
      `select * from ticket_orders where merchant_request_id = $1 limit 1`,
      [identifiers.merchantRequestId],
    )
    : await dbModule.pool.query<TicketOrder>(
      `select * from ticket_orders where hpp_order_id = $1 limit 1`,
      [identifiers.hppOrderId],
    );
  return result.rows[0] || null;
}

async function verifyAlliancePayHppOrder(order: TicketOrder): Promise<Record<string, unknown>> {
  if (!order.hpp_order_id) {
    throw new Error("AlliancePay HPP order ID is missing");
  }

  const authHeaders = await getAlliancePayAuthHeaders();
  const response = await fetch(ALB_HPP_OPERATIONS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...authHeaders,
    },
    body: JSON.stringify({ hppOrderId: order.hpp_order_id }),
  });
  const data = await response.json().catch(() => ({} as Record<string, unknown>));
  const serviceMessage = getAlliancePayServiceMessage(data);
  if (!response.ok || serviceMessage) {
    console.error("AlliancePay HPP status verification failed", {
      merchantRequestRef: getDiagnosticRef(order.merchant_request_id),
      hppOrderRef: getDiagnosticRef(order.hpp_order_id),
      providerStatus: response.status,
      providerMessage: serviceMessage || getProviderErrorSummary(data),
    });
    throw new Error("AlliancePay HPP status verification failed");
  }

  const verifiedHppOrderId = getProviderString(data, ["hppOrderId"]);
  const verifiedMerchantRequestId = getProviderString(data, ["merchantRequestId"]);
  const verifiedCoinAmount = Number(data["coinAmount"]);
  if (
    verifiedHppOrderId !== order.hpp_order_id ||
    verifiedMerchantRequestId !== order.merchant_request_id ||
    verifiedCoinAmount !== order.amount_kopiykas
  ) {
    throw new Error("AlliancePay HPP status verification mismatch");
  }

  return data;
}

export function createTicketCode(): string {
  return `SBC-2026-${randomBytes(6).toString("hex").toUpperCase()}`;
}

async function getTicketByOrderId(dbModule: DbModule, orderId: number): Promise<TicketRecord | null> {
  const result = await dbModule.pool.query<TicketRecord>(
    `select * from tickets where order_id = $1 limit 1`,
    [orderId],
  );
  return result.rows[0] || null;
}

async function getTicketByCode(dbModule: DbModule, ticketCode: string): Promise<TicketRecord | null> {
  const result = await dbModule.pool.query<TicketRecord>(
    `select * from tickets where ticket_code = $1 limit 1`,
    [ticketCode],
  );
  return result.rows[0] || null;
}

async function issueTicket(dbModule: DbModule, order: TicketOrder): Promise<TicketRecord> {
  const existingTicket = await getTicketByOrderId(dbModule, order.id);
  if (existingTicket) {
    return existingTicket;
  }

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const ticketCode = createTicketCode();
    const qrPayload = `${getPublicAppOrigin()}/ticket/${encodeURIComponent(ticketCode)}`;
    const qrTokenHash = createHash("sha256").update(qrPayload).digest("hex");
    try {
      const result = await dbModule.pool.query<TicketRecord>(
        `insert into tickets (
          ticket_code, order_id, merchant_request_id, hpp_order_id,
          event_slug, event_title, ticket_type,
          customer_email, customer_first_name, customer_last_name,
          status, qr_payload, qr_token_hash
        ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'ACTIVE', $11, $12)
        on conflict (order_id) do update set updated_at = now()
        returning *`,
        [
          ticketCode,
          order.id,
          order.merchant_request_id,
          order.hpp_order_id,
          EVENT_SLUG,
          EVENT_TITLE,
          order.ticket_type,
          order.customer_email,
          order.customer_first_name,
          order.customer_last_name,
          qrPayload,
          qrTokenHash,
        ],
      );
      const ticket = result.rows[0];
      if (ticket) {
        return ticket;
      }
    } catch (err) {
      if (attempt === 2) {
        throw err;
      }
    }
  }
  throw new Error("Ticket issuance failed");
}

function getNotoLatinFontBytes(): Uint8Array {
  if (!cachedNotoLatinFontBytes) {
    cachedNotoLatinFontBytes = readFileSync(
      require.resolve("@fontsource/noto-sans/files/noto-sans-latin-400-normal.woff"),
    );
  }
  return cachedNotoLatinFontBytes;
}

function getNotoLatinBoldFontBytes(): Uint8Array {
  if (!cachedNotoLatinBoldFontBytes) {
    cachedNotoLatinBoldFontBytes = readFileSync(
      require.resolve("@fontsource/noto-sans/files/noto-sans-latin-700-normal.woff"),
    );
  }
  return cachedNotoLatinBoldFontBytes;
}

function getNotoCyrillicFontBytes(): Uint8Array {
  if (!cachedNotoCyrillicFontBytes) {
    cachedNotoCyrillicFontBytes = readFileSync(
      require.resolve("@fontsource/noto-sans/files/noto-sans-cyrillic-400-normal.woff"),
    );
  }
  return cachedNotoCyrillicFontBytes;
}

function getNotoCyrillicBoldFontBytes(): Uint8Array {
  if (!cachedNotoCyrillicBoldFontBytes) {
    cachedNotoCyrillicBoldFontBytes = readFileSync(
      require.resolve("@fontsource/noto-sans/files/noto-sans-cyrillic-700-normal.woff"),
    );
  }
  return cachedNotoCyrillicBoldFontBytes;
}

function getTicketTypeLabel(ticketType: string): string {
  return {
    sport: "Sport Marketing",
    business: "Business",
    online: "Online",
  }[ticketType] || ticketType;
}

export async function buildTicketPdf(ticket: TicketRecord): Promise<Buffer> {
  const pdfDocument = await PDFDocument.create();
  pdfDocument.registerFontkit(fontkit);
  const latinFont = await pdfDocument.embedFont(getNotoLatinFontBytes(), { subset: true });
  const latinBoldFont = await pdfDocument.embedFont(getNotoLatinBoldFontBytes(), { subset: true });
  const cyrillicFont = await pdfDocument.embedFont(getNotoCyrillicFontBytes(), { subset: true });
  const cyrillicBoldFont = await pdfDocument.embedFont(getNotoCyrillicBoldFontBytes(), { subset: true });
  const page = pdfDocument.addPage([842, 420]);
  const green = rgb(0, 1, 0.53);
  const white = rgb(0.96, 0.97, 0.98);
  const muted = rgb(0.62, 0.65, 0.7);
  const panel = rgb(0.07, 0.075, 0.1);
  const customerName = `${ticket.customer_first_name} ${ticket.customer_last_name}`.trim();
  const qrPng = await QRCode.toBuffer(ticket.qr_payload, {
    type: "png",
    width: 420,
    margin: 2,
    errorCorrectionLevel: "M",
  });
  const qrImage = await pdfDocument.embedPng(qrPng);

  const drawText = (
    text: string,
    x: number,
    y: number,
    options: { size?: number; color?: ReturnType<typeof rgb>; font?: PDFFont; bold?: boolean } = {},
  ) => {
    const size = options.size || 12;
    const color = options.color || white;
    if (options.font) {
      page.drawText(text, { x, y, size, color, font: options.font });
      return;
    }

    let cursorX = x;
    let currentText = "";
    let currentFont: PDFFont | null = null;
    const flush = () => {
      if (!currentText || !currentFont) {
        return;
      }
      page.drawText(currentText, { x: cursorX, y, size, color, font: currentFont });
      cursorX += currentFont.widthOfTextAtSize(currentText, size);
      currentText = "";
      currentFont = null;
    };

    for (const char of text) {
      const font = /[А-Яа-яІіЇїЄєҐґ]/.test(char)
        ? options.bold ? cyrillicBoldFont : cyrillicFont
        : options.bold ? latinBoldFont : latinFont;
      if (currentFont && currentFont !== font) {
        flush();
      }
      currentFont = font;
      currentText += char;
    }
    flush();
  };

  page.drawRectangle({ x: 0, y: 0, width: 842, height: 420, color: rgb(0.025, 0.027, 0.04) });
  page.drawRectangle({ x: 0, y: 394, width: 842, height: 26, color: green });
  page.drawRectangle({ x: 36, y: 38, width: 545, height: 324, color: panel });
  page.drawRectangle({ x: 606, y: 38, width: 200, height: 324, color: white });
  page.drawLine({ start: { x: 581, y: 38 }, end: { x: 581, y: 362 }, color: green, thickness: 1 });

  drawText("RAVE'ERA GROUP", 60, 326, { size: 18, color: green, bold: true });
  drawText(EVENT_TITLE, 60, 281, { size: 28, bold: true });
  drawText("27 травня 2026", 60, 233, { size: 16 });
  drawText("КВЦ Парковий, Київ", 60, 204, { size: 16 });

  drawText("ТИП КВИТКА", 60, 148, { size: 10, color: muted });
  drawText(getTicketTypeLabel(ticket.ticket_type), 60, 126, { size: 15, bold: true });
  drawText("ВЛАСНИК КВИТКА", 264, 148, { size: 10, color: muted });
  drawText(customerName, 264, 126, { size: 15 });
  drawText("КОД КВИТКА", 60, 88, { size: 10, color: muted });
  drawText(ticket.ticket_code, 60, 64, { size: 16, color: green, bold: true });

  page.drawImage(qrImage, { x: 625, y: 145, width: 162, height: 162 });
  drawText("SCAN TO VERIFY", 648, 116, { size: 11, color: rgb(0.08, 0.09, 0.12), bold: true });
  drawText(ticket.ticket_code, 635, 92, { size: 9, color: rgb(0.2, 0.22, 0.25), font: latinFont });

  drawText("Квиток дійсний лише після успішної оплати.", 36, 16, { size: 10, color: muted });
  drawText("www.rave-era.com.ua", 688, 16, { size: 9, color: muted, font: latinFont });

  return Buffer.from(await pdfDocument.save({ useObjectStreams: false }));
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

type SmtpConfig = {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
};

function getSmtpConfig(): SmtpConfig | null {
  const host = process.env["SMTP_HOST"]?.trim();
  const rawPort = process.env["SMTP_PORT"]?.trim();
  const port = Number(rawPort);
  const user = process.env["SMTP_USER"]?.trim();
  const pass = process.env["SMTP_PASS"]?.trim();
  const from = process.env["SMTP_FROM"]?.trim();
  if (!host || !rawPort || !user || !pass || !from || !Number.isInteger(port) || port < 1 || port > 65535) {
    return null;
  }
  return { host, port, user, pass, from };
}

function redactEmails(value: string): string {
  return value.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[email]");
}

function getSafeSmtpValue(value: unknown): string | number | undefined {
  if (typeof value === "number") {
    return value;
  }
  if (typeof value !== "string" || !value.trim()) {
    return undefined;
  }
  return redactEmails(value).replace(/\s+/g, " ").trim().slice(0, 180);
}

function getSafeEmailError(err: unknown): string {
  if (!(err instanceof Error)) {
    return "Unknown SMTP error";
  }
  return redactEmails(err.message).replace(/\s+/g, " ").trim().slice(0, 300) || "SMTP error";
}

function getSafeSmtpInfo(info: unknown): Record<string, string | number> {
  const record = asRecord(info);
  const safe: Record<string, string | number> = {};
  if (!record) {
    return safe;
  }
  const responseCode = getSafeSmtpValue(record["responseCode"]);
  const response = getSafeSmtpValue(record["response"]);
  if (responseCode !== undefined) {
    safe.responseCode = responseCode;
  }
  if (response !== undefined) {
    safe.response = response;
  }
  return safe;
}

async function deliverTicketEmail(
  dbModule: DbModule,
  order: TicketOrder,
  ticket: TicketRecord,
): Promise<void> {
  if (order.email_status === "SENT" || order.email_sent_at) {
    return;
  }

  const smtpConfig = getSmtpConfig();
  const logRefs = {
    orderIdRef: getDiagnosticRef(String(order.id)),
    merchantRequestRef: getDiagnosticRef(order.merchant_request_id),
    ticketCodeRef: getDiagnosticRef(ticket.ticket_code),
  };
  if (!smtpConfig) {
    console.warn("Ticket email not sent: SMTP is not configured", {
      ...logRefs,
      emailStatus: "NOT_CONFIGURED",
    });
    await dbModule.pool.query(
      `update ticket_orders
       set email_status = 'NOT_CONFIGURED',
           email_error_safe = 'SMTP is not configured',
           updated_at = now()
       where id = $1`,
      [order.id],
    );
    order.email_status = "NOT_CONFIGURED";
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.port === 465,
      auth: { user: smtpConfig.user, pass: smtpConfig.pass },
    });
    const customerName = `${ticket.customer_first_name} ${ticket.customer_last_name}`.trim();
    const ticketPdf = await buildTicketPdf(ticket);
    const info = await transporter.sendMail({
      from: smtpConfig.from,
      to: ticket.customer_email,
      subject: "Ваш квиток на SBC Summit Ukraine 2026",
      text: [
        `Вітаємо, ${customerName}!`,
        "",
        `Ваш квиток на ${EVENT_TITLE} готовий.`,
        `Тип квитка: ${ticket.ticket_type}`,
        `Код квитка: ${ticket.ticket_code}`,
        `Відкрити квиток: ${ticket.qr_payload}`,
        "",
        "Квиток дійсний лише після успішної оплати та може бути перевірений організатором.",
        "Підтримка: ceo@rave-era.com.ua",
      ].join("\n"),
      html: `<p>Вітаємо, ${escapeHtml(customerName)}!</p>
        <p>Ваш квиток на <strong>${EVENT_TITLE}</strong> готовий.</p>
        <p>Тип квитка: <strong>${escapeHtml(ticket.ticket_type)}</strong><br>
        Код квитка: <strong>${escapeHtml(ticket.ticket_code)}</strong></p>
        <p><a href="${escapeHtml(ticket.qr_payload)}">Відкрити квиток</a></p>
        <p>Квиток дійсний лише після успішної оплати та може бути перевірений організатором.</p>
        <p>Підтримка: <a href="mailto:ceo@rave-era.com.ua">ceo@rave-era.com.ua</a></p>`,
      attachments: [
        {
          filename: `${ticket.ticket_code}.pdf`,
          content: ticketPdf,
          contentType: "application/pdf",
        },
      ],
    });
    await dbModule.pool.query(
      `update ticket_orders
       set email_status = 'SENT', email_sent_at = now(), email_error_safe = null, updated_at = now()
       where id = $1`,
      [order.id],
    );
    order.email_status = "SENT";
    console.info("Ticket email delivered", {
      ...logRefs,
      emailStatus: "SENT",
      ...getSafeSmtpInfo(info),
    });
  } catch (err) {
    const errorMessage = getSafeEmailError(err);
    const smtpInfo = getSafeSmtpInfo(err);
    console.warn("Ticket email delivery failed", {
      ...logRefs,
      emailStatus: "FAILED",
      error: errorMessage,
      ...smtpInfo,
    });
    await dbModule.pool.query(
      `update ticket_orders
       set email_status = 'FAILED', email_error_safe = $1, updated_at = now()
       where id = $2`,
      [errorMessage, order.id],
    );
    order.email_status = "FAILED";
  }
}

async function applyVerifiedPaymentStatus(
  dbModule: DbModule,
  order: TicketOrder,
  providerData: Record<string, unknown>,
): Promise<TicketRecord | null> {
  const verifiedStatus = parsePaymentStatus(providerData["orderStatus"]);
  if (!verifiedStatus) {
    throw new Error("AlliancePay HPP status response is invalid");
  }

  await dbModule.pool.query(
    `update ticket_orders
     set status = $1,
         payment_status = $1,
         order_status = $1,
         paid_at = case when $1 = 'SUCCESS' then coalesce(paid_at, now()) else paid_at end,
         updated_at = now()
     where id = $2`,
    [verifiedStatus, order.id],
  );
  order.status = verifiedStatus;
  order.payment_status = verifiedStatus;
  order.order_status = verifiedStatus;

  if (verifiedStatus !== "SUCCESS") {
    return null;
  }

  const ticket = await issueTicket(dbModule, order);
  await deliverTicketEmail(dbModule, order, ticket);
  return ticket;
}

async function refreshOrderFromAlliancePay(
  dbModule: DbModule,
  order: TicketOrder,
): Promise<TicketRecord | null> {
  const providerData = await verifyAlliancePayHppOrder(order);
  return applyVerifiedPaymentStatus(dbModule, order, providerData);
}

function toSafeOrderResponse(order: TicketOrder): Record<string, unknown> {
  return {
    id: order.id,
    merchantRequestId: order.merchant_request_id,
    status: order.payment_status,
    ticketType: order.ticket_type,
    amount: order.amount_kopiykas,
    currency: order.currency,
  };
}

function toSafeTicketResponse(ticket: TicketRecord): Record<string, unknown> {
  return {
    ticketCode: ticket.ticket_code,
    eventTitle: ticket.event_title,
    ticketType: ticket.ticket_type,
    customerName: `${ticket.customer_first_name} ${ticket.customer_last_name}`.trim(),
    status: ticket.status,
    qrPayload: ticket.qr_payload,
    issuedAt: ticket.issued_at,
  };
}

const checkinAttempts = new Map<string, { count: number; resetAt: number }>();
const CHECKIN_COOKIE_NAME = "raveera_checkin";
const CHECKIN_SESSION_TTL_MS = 12 * 60 * 60 * 1000;

function getHeaderValue(req: VercelApiRequest, headerName: string): string {
  const value = req.headers[headerName.toLowerCase()];
  if (Array.isArray(value)) {
    return value[0] || "";
  }
  return typeof value === "string" ? value : "";
}

function getRequestIp(req: VercelApiRequest): string {
  return (
    getHeaderValue(req, "x-forwarded-for").split(",")[0]?.trim() ||
    req.socket.remoteAddress ||
    "unknown"
  );
}

function safeCompareSecret(received: string, expected: string): boolean {
  const left = Buffer.from(received);
  const right = Buffer.from(expected);
  if (left.length !== right.length) {
    return false;
  }
  return timingSafeEqual(left, right);
}

function getCheckinSecret(name: "CHECKIN_ADMIN_PIN" | "CHECKIN_SESSION_SECRET"): string {
  return process.env[name]?.trim() || "";
}

function getCookie(req: VercelApiRequest, name: string): string {
  const cookieHeader = getHeaderValue(req, "cookie");
  for (const part of cookieHeader.split(";")) {
    const [rawKey, ...rawValue] = part.trim().split("=");
    if (rawKey === name) {
      return decodeURIComponent(rawValue.join("="));
    }
  }
  return "";
}

function signCheckinSession(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

function createCheckinSessionToken(now = Date.now()): string {
  const secret = getCheckinSecret("CHECKIN_SESSION_SECRET");
  if (!secret) {
    throw new Error("CHECKIN_SESSION_SECRET is not configured");
  }
  const expiresAt = now + CHECKIN_SESSION_TTL_MS;
  const nonce = randomBytes(16).toString("base64url");
  const payload = `${expiresAt}.${nonce}`;
  const signature = signCheckinSession(payload, secret);
  return `${payload}.${signature}`;
}

export function isAuthenticatedCheckinRequest(req: VercelApiRequest, now = Date.now()): boolean {
  const token = getCookie(req, CHECKIN_COOKIE_NAME);
  const secret = getCheckinSecret("CHECKIN_SESSION_SECRET");
  if (!token || !secret) {
    return false;
  }

  const parts = token.split(".");
  if (parts.length !== 3) {
    return false;
  }
  const [expiresAtRaw, nonce, signature] = parts;
  const expiresAt = Number(expiresAtRaw);
  if (!Number.isFinite(expiresAt) || expiresAt <= now || !nonce || !signature) {
    return false;
  }

  const expected = signCheckinSession(`${expiresAtRaw}.${nonce}`, secret);
  return safeCompareSecret(signature, expected);
}

function shouldUseSecureCookie(req: VercelApiRequest): boolean {
  return process.env["NODE_ENV"] === "production" || getHeaderValue(req, "x-forwarded-proto") === "https";
}

function setCheckinCookie(req: VercelApiRequest, res: ServerResponse, token: string): void {
  const secure = shouldUseSecureCookie(req) ? "; Secure" : "";
  res.setHeader(
    "Set-Cookie",
    `${CHECKIN_COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${Math.floor(CHECKIN_SESSION_TTL_MS / 1000)}${secure}`,
  );
}

function clearCheckinCookie(req: VercelApiRequest, res: ServerResponse): void {
  const secure = shouldUseSecureCookie(req) ? "; Secure" : "";
  res.setHeader(
    "Set-Cookie",
    `${CHECKIN_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`,
  );
}

function isRateLimited(req: VercelApiRequest): boolean {
  const key = getRequestIp(req);
  const now = Date.now();
  const current = checkinAttempts.get(key);
  if (!current || current.resetAt <= now) {
    checkinAttempts.set(key, { count: 1, resetAt: now + 10 * 60 * 1000 });
    return false;
  }
  current.count += 1;
  return current.count > 10;
}

function clearRateLimit(req: VercelApiRequest): void {
  checkinAttempts.delete(getRequestIp(req));
}

export function extractTicketCodeFromCheckinInput(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) {
    return null;
  }

  try {
    const parsed = new URL(trimmed);
    const match = parsed.pathname.match(/\/ticket\/([^/]+)/);
    if (match?.[1]) {
      return decodeURIComponent(match[1]).trim().toUpperCase();
    }
  } catch {
    // Plain ticket code input is handled below.
  }

  const match = trimmed.match(/SBC-2026-[A-Z0-9]{6,24}/i);
  return match?.[0] ? match[0].toUpperCase() : null;
}

function isSafeCheckinTicketCode(ticketCode: string): boolean {
  return /^SBC-2026-[A-Z0-9]{6,24}$/.test(ticketCode);
}

function toSafeCheckinTicketResponse(ticket: TicketRecord): Record<string, unknown> {
  return {
    ticketCode: ticket.ticket_code,
    status: ticket.status,
    eventTitle: ticket.event_title,
    ticketType: ticket.ticket_type,
    customerName: `${ticket.customer_first_name} ${ticket.customer_last_name}`.trim(),
    issuedAt: ticket.issued_at,
    checkedInAt: ticket.checked_in_at || null,
  };
}

async function auditCheckin(
  dbModule: DbModule,
  ticket: TicketRecord | null,
  ticketCode: string,
  action: "VERIFY" | "MARK_USED",
  result: string,
): Promise<void> {
  try {
    await dbModule.pool.query(
      `insert into ticket_checkins (
        ticket_id, ticket_code, action, result, checked_in_at, device_label
      ) values ($1, $2, $3, $4, $5, $6)`,
      [ticket?.id || null, ticketCode, action, result, ticket?.checked_in_at || null, "admin-checkin"],
    );
  } catch (err) {
    console.warn("Ticket check-in audit insert failed", {
      ticketCodeRef: getDiagnosticRef(ticketCode),
      action,
      result,
      error: err instanceof Error ? err.message : "Unknown error",
    });
  }
}

function requireCheckinAuth(req: VercelApiRequest, res: ServerResponse): boolean {
  if (isAuthenticatedCheckinRequest(req)) {
    return true;
  }
  sendJson(res, 401, { code: "UNAUTHENTICATED", error: "Authentication required" });
  return false;
}

export async function checkinLogin(req: VercelApiRequest, res: ServerResponse): Promise<void> {
  const pin = getCheckinSecret("CHECKIN_ADMIN_PIN");
  const secret = getCheckinSecret("CHECKIN_SESSION_SECRET");
  if (!pin || !secret) {
    sendJson(res, 503, { code: "MISSING_CONFIG", error: "Check-in is not configured" });
    return;
  }
  if (isRateLimited(req)) {
    sendJson(res, 429, { code: "RATE_LIMITED", error: "Too many attempts. Try again later." });
    return;
  }

  let parsedBody: z.infer<typeof checkinLoginBodySchema>;
  try {
    const parsed = checkinLoginBodySchema.safeParse(await readJsonBody(req));
    if (!parsed.success) {
      sendJson(res, 400, { code: "INVALID_REQUEST", error: "Invalid request body" });
      return;
    }
    parsedBody = parsed.data;
  } catch {
    sendJson(res, 400, { code: "INVALID_REQUEST", error: "Invalid JSON body" });
    return;
  }

  if (!safeCompareSecret(parsedBody.pin, pin)) {
    sendJson(res, 401, { code: "INVALID_PIN", error: "Invalid PIN" });
    return;
  }

  clearRateLimit(req);
  setCheckinCookie(req, res, createCheckinSessionToken());
  sendJson(res, 200, { ok: true });
}

export async function checkinLogout(req: VercelApiRequest, res: ServerResponse): Promise<void> {
  clearCheckinCookie(req, res);
  sendJson(res, 200, { ok: true });
}

export function getCheckinSession(req: VercelApiRequest, res: ServerResponse): void {
  sendJson(res, 200, { authenticated: isAuthenticatedCheckinRequest(req) });
}

async function loadCheckinTicket(dbModule: DbModule, ticketCode: string): Promise<TicketRecord | null> {
  const result = await dbModule.pool.query<TicketRecord>(
    `select * from tickets where ticket_code = $1 limit 1`,
    [ticketCode],
  );
  return result.rows[0] || null;
}

export async function verifyCheckinTicketWithDb(
  dbModule: DbModule,
  ticketCode: string,
): Promise<{ statusCode: number; body: Record<string, unknown> }> {
  if (!isSafeCheckinTicketCode(ticketCode)) {
    return { statusCode: 400, body: { code: "INVALID_TICKET_CODE", error: "Invalid ticket code" } };
  }

  const ticket = await loadCheckinTicket(dbModule, ticketCode);
  if (!ticket) {
    await auditCheckin(dbModule, null, ticketCode, "VERIFY", "NOT_FOUND");
    return { statusCode: 404, body: { code: "TICKET_NOT_FOUND", error: "Ticket not found" } };
  }

  await auditCheckin(dbModule, ticket, ticketCode, "VERIFY", ticket.status);
  return { statusCode: 200, body: { ok: true, ticket: toSafeCheckinTicketResponse(ticket) } };
}

export async function markCheckinTicketUsedWithDb(
  dbModule: DbModule,
  ticketCode: string,
): Promise<{ statusCode: number; body: Record<string, unknown> }> {
  if (!isSafeCheckinTicketCode(ticketCode)) {
    return { statusCode: 400, body: { code: "INVALID_TICKET_CODE", error: "Invalid ticket code" } };
  }

  const updated = await dbModule.pool.query<TicketRecord>(
    `update tickets
     set status = 'USED',
         checked_in_at = coalesce(checked_in_at, now()),
         checked_in_by = coalesce(checked_in_by, $2),
         updated_at = now()
     where ticket_code = $1 and status = 'ACTIVE'
     returning *`,
    [ticketCode, "admin-checkin"],
  );

  const checkedInTicket = updated.rows[0];
  if (checkedInTicket) {
    await auditCheckin(dbModule, checkedInTicket, ticketCode, "MARK_USED", "USED");
    return {
      statusCode: 200,
      body: { ok: true, result: "CHECKED_IN", ticket: toSafeCheckinTicketResponse(checkedInTicket) },
    };
  }

  const ticket = await loadCheckinTicket(dbModule, ticketCode);
  if (!ticket) {
    await auditCheckin(dbModule, null, ticketCode, "MARK_USED", "NOT_FOUND");
    return { statusCode: 404, body: { code: "TICKET_NOT_FOUND", error: "Ticket not found" } };
  }
  if (ticket.status === "USED") {
    await auditCheckin(dbModule, ticket, ticketCode, "MARK_USED", "ALREADY_USED");
    return {
      statusCode: 200,
      body: { ok: true, result: "ALREADY_USED", ticket: toSafeCheckinTicketResponse(ticket) },
    };
  }

  await auditCheckin(dbModule, ticket, ticketCode, "MARK_USED", ticket.status);
  return {
    statusCode: 409,
    body: { code: "TICKET_INVALID", error: "Ticket is not active", ticket: toSafeCheckinTicketResponse(ticket) },
  };
}

export async function checkinVerify(req: VercelApiRequest, res: ServerResponse): Promise<void> {
  if (!requireCheckinAuth(req, res)) {
    return;
  }

  let parsedBody: z.infer<typeof checkinVerifyBodySchema>;
  try {
    const parsed = checkinVerifyBodySchema.safeParse(await readJsonBody(req));
    if (!parsed.success) {
      sendJson(res, 400, { code: "INVALID_REQUEST", error: "Invalid request body" });
      return;
    }
    parsedBody = parsed.data;
  } catch {
    sendJson(res, 400, { code: "INVALID_REQUEST", error: "Invalid JSON body" });
    return;
  }

  const ticketCode = extractTicketCodeFromCheckinInput(parsedBody.qrPayload || parsedBody.ticketCode || "");
  if (!ticketCode) {
    sendJson(res, 400, { code: "INVALID_TICKET_CODE", error: "Invalid ticket code" });
    return;
  }

  try {
    const dbModule = await getDb();
    await ensurePaymentOrdersTable(dbModule);
    const result = await verifyCheckinTicketWithDb(dbModule, ticketCode);
    sendJson(res, result.statusCode, result.body);
  } catch (err) {
    console.error("Check-in ticket verify failed", {
      ticketCodeRef: getDiagnosticRef(ticketCode),
      error: err instanceof Error ? err.message : "Unknown error",
    });
    sendJson(res, 503, { code: "DATABASE_ERROR", error: "Ticket verification is temporarily unavailable" });
  }
}

export async function checkinMarkUsed(req: VercelApiRequest, res: ServerResponse): Promise<void> {
  if (!requireCheckinAuth(req, res)) {
    return;
  }

  let parsedBody: z.infer<typeof checkinMarkUsedBodySchema>;
  try {
    const parsed = checkinMarkUsedBodySchema.safeParse(await readJsonBody(req));
    if (!parsed.success) {
      sendJson(res, 400, { code: "INVALID_REQUEST", error: "Invalid request body" });
      return;
    }
    parsedBody = parsed.data;
  } catch {
    sendJson(res, 400, { code: "INVALID_REQUEST", error: "Invalid JSON body" });
    return;
  }

  const ticketCode = extractTicketCodeFromCheckinInput(parsedBody.ticketCode);
  if (!ticketCode) {
    sendJson(res, 400, { code: "INVALID_TICKET_CODE", error: "Invalid ticket code" });
    return;
  }

  try {
    const dbModule = await getDb();
    await ensurePaymentOrdersTable(dbModule);
    const result = await markCheckinTicketUsedWithDb(dbModule, ticketCode);
    sendJson(res, result.statusCode, result.body);
  } catch (err) {
    console.error("Check-in ticket mark-used failed", {
      ticketCodeRef: getDiagnosticRef(ticketCode),
      error: err instanceof Error ? err.message : "Unknown error",
    });
    sendJson(res, 503, { code: "DATABASE_ERROR", error: "Ticket check-in is temporarily unavailable" });
  }
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

  const merchantRequestId = crypto.randomUUID();
  let urls: ReturnType<typeof buildPaymentUrls>;
  try {
    urls = buildPaymentUrls(merchantRequestId, ticketType);
  } catch (err) {
    console.error("Payment URL configuration invalid", {
      error: err instanceof Error ? err.message : "Unknown error",
    });
    sendJson(res, 503, { code: "MISSING_CONFIG", error: "Payment URL configuration is invalid" });
    return;
  }

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
      merchantRequestRef: getDiagnosticRef(merchantRequestId),
    });
    sendJson(res, 503, { code: "DATABASE_ERROR", error: "Payment database write failed" });
    return;
  }

  const albPayload = buildAlliancePayHppCreateOrderPayload({
    merchantRequestId,
    merchantId: process.env["ALLIANCEPAY_MERCHANT_ID"],
    coinAmount,
    language: "uk",
    purpose: "SBC Summit Ukraine 2026",
    urls,
  });

  let redirectUrl = "";
  let hppOrderId = "";
  let albData: Record<string, unknown> = {};
  try {
    console.info("AlliancePay HPP create-order payment method diagnostics", {
      paymentMethods: albPayload.paymentMethods,
      hppPayType: albPayload.hppPayType,
      directType: albPayload.directType,
      language: albPayload.language,
    });
    if (albPayload.paymentMethods.includes("GOOGLE_PAY") && albPayload.paymentMethods.includes("APPLE_PAY")) {
      console.info("Google Pay and Apple Pay requested from provider.");
    }

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
        merchantRequestRef: getDiagnosticRef(merchantRequestId),
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
        merchantRequestRef: getDiagnosticRef(merchantRequestId),
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
      merchantRequestRef: getDiagnosticRef(merchantRequestId),
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
      merchantRequestRef: getDiagnosticRef(merchantRequestId),
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
      merchantRequestRef: getDiagnosticRef(merchantRequestId),
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

export async function paymentCallback(req: VercelApiRequest, res: ServerResponse): Promise<void> {
  let parsedBody: z.infer<typeof callbackBodySchema>;
  try {
    const parsed = callbackBodySchema.safeParse(await readJsonBody(req));
    if (!parsed.success) {
      sendJson(res, 400, {
        code: "INVALID_REQUEST",
        error: "Invalid callback body",
        details: parsed.error.flatten(),
      });
      return;
    }
    parsedBody = parsed.data;
  } catch {
    sendJson(res, 400, { code: "INVALID_REQUEST", error: "Invalid JSON body" });
    return;
  }

  let dbModule: DbModule;
  try {
    dbModule = await getDb();
    await ensurePaymentOrdersTable(dbModule);
  } catch (err) {
    console.error("Payment callback database unavailable", {
      error: err instanceof Error ? err.message : "Unknown error",
    });
    sendJson(res, 503, { code: "DATABASE_ERROR", error: "Payment database is unavailable" });
    return;
  }

  const { hppOrderId, merchantRequestId, orderStatus } = parsedBody;

  try {
    const order =
      (merchantRequestId ? await findTicketOrder(dbModule, { merchantRequestId }) : null) ||
      (hppOrderId ? await findTicketOrder(dbModule, { hppOrderId }) : null);
    if (!order) {
      console.warn("Payment callback order not found", {
        hppOrderRef: getDiagnosticRef(hppOrderId),
        merchantRequestRef: getDiagnosticRef(merchantRequestId),
        orderStatus,
      });
      sendJson(res, 404, { code: "ORDER_NOT_FOUND", error: "Order not found" });
      return;
    }

    if (hppOrderId && order.hpp_order_id && hppOrderId !== order.hpp_order_id) {
      sendJson(res, 400, { code: "ORDER_MISMATCH", error: "Order identifier mismatch" });
      return;
    }

    await dbModule.pool.query(
      `update ticket_orders
       set hpp_order_id = coalesce(hpp_order_id, $1),
           alliancepay_callback_payload_safe = $2,
           updated_at = now()
       where id = $3`,
      [hppOrderId || null, JSON.stringify(getSafeCallbackSummary(parsedBody)), order.id],
    );
    order.hpp_order_id ||= hppOrderId || null;

    const ticket = await refreshOrderFromAlliancePay(dbModule, order);
    console.info("AlliancePay callback processed after server-side verification", {
      merchantRequestRef: getDiagnosticRef(order.merchant_request_id),
      callbackStatus: orderStatus,
      verifiedStatus: order.payment_status,
      hasTicket: Boolean(ticket),
    });
    sendJson(res, 200, { received: true, orderId: order.id });
  } catch (err) {
    console.error("Payment callback update failed", {
      error: err instanceof Error ? err.message : "Unknown error",
      hppOrderRef: getDiagnosticRef(hppOrderId),
      merchantRequestRef: getDiagnosticRef(merchantRequestId),
      orderStatus,
    });
    sendJson(res, 502, { code: "CALLBACK_PROCESSING_ERROR", error: "Payment callback processing failed" });
  }
}

export async function getPaymentStatus(req: VercelApiRequest, res: ServerResponse): Promise<void> {
  const parsedUrl = new URL(req.url || "/", "http://vercel.local");
  const merchantRequestId = parsedUrl.searchParams.get("merchantRequestId")?.trim();
  if (!merchantRequestId) {
    sendJson(res, 400, { code: "INVALID_REQUEST", error: "merchantRequestId is required" });
    return;
  }

  try {
    const dbModule = await getDb();
    await ensurePaymentOrdersTable(dbModule);
    const order = await findTicketOrder(dbModule, { merchantRequestId });
    if (!order) {
      sendJson(res, 404, { code: "ORDER_NOT_FOUND", error: "Order not found" });
      return;
    }

    let ticket = await getTicketByOrderId(dbModule, order.id);
    if (order.hpp_order_id && (!ticket || order.payment_status !== "SUCCESS")) {
      try {
        ticket = await refreshOrderFromAlliancePay(dbModule, order);
      } catch (err) {
        console.warn("Payment status refresh deferred", {
          merchantRequestRef: getDiagnosticRef(merchantRequestId),
          error: err instanceof Error ? err.message : "Unknown error",
        });
      }
    }
    if (order.payment_status === "SUCCESS" && ticket) {
      await deliverTicketEmail(dbModule, order, ticket);
    }

    sendJson(res, 200, {
      ok: true,
      order: toSafeOrderResponse(order),
      ticket: order.payment_status === "SUCCESS" && ticket ? toSafeTicketResponse(ticket) : null,
    });
  } catch (err) {
    console.error("Payment status lookup failed", {
      merchantRequestRef: getDiagnosticRef(merchantRequestId),
      error: err instanceof Error ? err.message : "Unknown error",
    });
    sendJson(res, 503, { code: "DATABASE_ERROR", error: "Payment status is temporarily unavailable" });
  }
}

function maskCustomerName(firstName: string, lastName: string): string {
  const mask = (value: string) => value ? `${value[0]}${"*".repeat(Math.max(1, value.length - 1))}` : "";
  return `${mask(firstName)} ${mask(lastName)}`.trim();
}

function isValidTicketCode(ticketCode: string): boolean {
  return /^SBC-2026-[A-F0-9]{12}$/.test(ticketCode);
}

export async function getPublicTicket(ticketCode: string, res: ServerResponse): Promise<void> {
  if (!isValidTicketCode(ticketCode)) {
    sendJson(res, 400, { code: "INVALID_TICKET_CODE", error: "Invalid ticket code" });
    return;
  }

  try {
    const dbModule = await getDb();
    await ensurePaymentOrdersTable(dbModule);
    const ticket = await getTicketByCode(dbModule, ticketCode);
    if (!ticket) {
      sendJson(res, 404, { code: "TICKET_NOT_FOUND", error: "Ticket not found" });
      return;
    }

    sendJson(res, 200, {
      ok: true,
      ticket: {
        ticketCode: ticket.ticket_code,
        eventTitle: ticket.event_title,
        ticketType: ticket.ticket_type,
        customerName: maskCustomerName(ticket.customer_first_name, ticket.customer_last_name),
        status: ticket.status,
        issuedAt: ticket.issued_at,
      },
    });
  } catch (err) {
    console.error("Public ticket lookup failed", {
      ticketCodeRef: getDiagnosticRef(ticketCode),
      error: err instanceof Error ? err.message : "Unknown error",
    });
    sendJson(res, 503, { code: "DATABASE_ERROR", error: "Ticket lookup is temporarily unavailable" });
  }
}

export async function getTicketPdf(ticketCode: string, res: ServerResponse): Promise<void> {
  if (!isValidTicketCode(ticketCode)) {
    sendJson(res, 400, { code: "INVALID_TICKET_CODE", error: "Invalid ticket code" });
    return;
  }

  try {
    const dbModule = await getDb();
    await ensurePaymentOrdersTable(dbModule);
    const ticket = await getTicketByCode(dbModule, ticketCode);
    if (!ticket) {
      sendJson(res, 404, { code: "TICKET_NOT_FOUND", error: "Ticket not found" });
      return;
    }

    const pdf = await buildTicketPdf(ticket);
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${ticket.ticket_code}.pdf"`);
    res.setHeader("Cache-Control", "private, no-store");
    res.end(pdf);
  } catch (err) {
    console.error("Ticket PDF generation failed", {
      ticketCodeRef: getDiagnosticRef(ticketCode),
      error: err instanceof Error ? err.message : "Unknown error",
    });
    sendJson(res, 503, { code: "PDF_GENERATION_ERROR", error: "Ticket PDF is temporarily unavailable" });
  }
}
