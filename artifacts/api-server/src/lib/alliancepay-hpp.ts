import { compactDecrypt, importJWK, type JWK } from "jose";

export const ALLIANCEPAY_HPP_CREATE_ORDER_URL =
  "https://api-ecom-prod.bankalliance.ua/ecom/execute_request/hpp/v1/create-order";

export type AlliancePayAuthHeaders = {
  "x-api_version": string;
  "x-device_id": string;
  "x-refresh_token": string;
};

export type AlliancePayProviderStep = "authorize_virtual_device" | "hpp_create_order";

type AlliancePaySession = {
  deviceId: string;
  refreshToken: string;
  expiresAt: number;
};

type PaymentUrls = {
  successUrl: string;
  failUrl: string;
  notificationUrl: string;
};

type AlliancePayAuthConfig = {
  apiUrl: string;
  serviceCode: string;
  privateJwk?: string;
  deviceId?: string;
  refreshToken?: string;
  fetchImpl?: typeof fetch;
};

let cachedAlliancePaySession: AlliancePaySession | null = null;

export class AlliancePayServiceMessageError extends Error {
  readonly providerStep: AlliancePayProviderStep;
  readonly providerStatus: number;
  readonly providerMessage: Record<string, unknown>;

  constructor(
    providerStep: AlliancePayProviderStep,
    providerStatus: number,
    providerMessage: Record<string, unknown>,
  ) {
    super("AlliancePay returned a service message");
    this.providerStep = providerStep;
    this.providerStatus = providerStatus;
    this.providerMessage = providerMessage;
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
  merchantId: string;
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

export function getProviderString(data: Record<string, unknown>, keys: string[]): string {
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

export function getProviderErrorSummary(data: Record<string, unknown>): Record<string, unknown> {
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

function getSafeProviderValue(data: Record<string, unknown>, key: string): unknown {
  const value = data[key];
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean" ||
    value === null ||
    Array.isArray(value) ||
    (value && typeof value === "object")
  ) {
    return value;
  }
  return undefined;
}

export function getAlliancePayServiceMessage(data: Record<string, unknown>): Record<string, unknown> | null {
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

function parsePrivateJwk(raw: string | undefined): JWK | null {
  if (!raw?.trim()) {
    return null;
  }

  try {
    return JSON.parse(raw) as JWK;
  } catch {
    return null;
  }
}

export function privateJwkLooksValid(raw: string | undefined): boolean {
  const jwk = parsePrivateJwk(raw);
  return Boolean(
    jwk &&
      jwk.kty === "EC" &&
      jwk.crv === "P-384" &&
      typeof jwk.x === "string" &&
      typeof jwk.y === "string" &&
      typeof jwk.d === "string",
  );
}

function getApiOrigin(apiUrl: string): string {
  return new URL(apiUrl).origin;
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

async function decryptAlliancePayJwe(jwe: string, privateJwk: string): Promise<Record<string, unknown>> {
  const parsedPrivateJwk = parsePrivateJwk(privateJwk);
  if (!parsedPrivateJwk || !privateJwkLooksValid(privateJwk)) {
    throw new Error("ALLIANCEPAY_PRIVATE_JWK is invalid");
  }

  const key = await importJWK(parsedPrivateJwk, "ECDH-ES+A256KW");
  const decrypted = await compactDecrypt(jwe, key);
  return JSON.parse(new TextDecoder().decode(decrypted.plaintext)) as Record<string, unknown>;
}

async function authorizeAlliancePayVirtualDevice(
  config: AlliancePayAuthConfig,
): Promise<AlliancePaySession> {
  if (cachedAlliancePaySession && cachedAlliancePaySession.expiresAt > Date.now() + 5 * 60 * 1000) {
    return cachedAlliancePaySession;
  }

  const privateJwk = config.privateJwk;
  if (!config.serviceCode.trim()) {
    throw new Error("ALLIANCEPAY_SERVICE_CODE is missing");
  }
  if (!privateJwkLooksValid(privateJwk)) {
    throw new Error("ALLIANCEPAY_PRIVATE_JWK is invalid");
  }

  const fetchImpl = config.fetchImpl || fetch;
  const authRes = await fetchImpl(`${getApiOrigin(config.apiUrl)}/api-gateway/authorize_virtual_device`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "x-api_version": "1",
    },
    body: JSON.stringify({ serviceCode: config.serviceCode }),
  });
  const authData = await authRes.json().catch(() => ({} as Record<string, unknown>));
  const authServiceMessage = getAlliancePayServiceMessage(authData);
  if (authServiceMessage) {
    throw new AlliancePayServiceMessageError(
      "authorize_virtual_device",
      authRes.status,
      authServiceMessage,
    );
  }
  if (!authRes.ok) {
    throw new Error("AlliancePay virtual device authorization failed");
  }

  const responseJwe = getProviderString(authData, ["jwe"]);
  if (!responseJwe || !privateJwk) {
    throw new Error("AlliancePay virtual device authorization missing JWE");
  }

  const decrypted = await decryptAlliancePayJwe(responseJwe, privateJwk);
  const session = parseAlliancePaySession(decrypted);
  if (!session) {
    throw new Error("AlliancePay virtual device authorization missing session fields");
  }

  cachedAlliancePaySession = session;
  return session;
}

export async function getAlliancePayAuthHeaders(
  config: AlliancePayAuthConfig,
  { forceRefresh = false }: { forceRefresh?: boolean } = {},
): Promise<AlliancePayAuthHeaders> {
  if (!forceRefresh && config.deviceId?.trim() && config.refreshToken?.trim()) {
    return buildAlliancePayAuthHeaders(config.deviceId, config.refreshToken);
  }

  if (forceRefresh) {
    cachedAlliancePaySession = null;
  }

  const session = await authorizeAlliancePayVirtualDevice(config);
  return buildAlliancePayAuthHeaders(session.deviceId, session.refreshToken);
}

export async function postAlliancePayJson({
  url,
  body,
  authConfig,
}: {
  url: string;
  body: unknown;
  authConfig: AlliancePayAuthConfig;
}): Promise<{ response: Response; data: Record<string, unknown> }> {
  const fetchImpl = authConfig.fetchImpl || fetch;
  const postOnce = async (forceRefresh: boolean) => {
    const authHeaders = await getAlliancePayAuthHeaders(authConfig, { forceRefresh });
    const response = await fetchImpl(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...authHeaders,
      },
      body: JSON.stringify(body),
    });
    const data = await response.json().catch(() => ({} as Record<string, unknown>));
    return { response, data };
  };

  const first = await postOnce(false);
  if (first.response.status !== 401) {
    return first;
  }

  return postOnce(true);
}

export function extractRedirectUrl(data: Record<string, unknown>): string {
  const value = data["redirectUrl"];
  return typeof value === "string" ? value : "";
}

export function extractHppOrderId(data: Record<string, unknown>): string {
  const value = data["hppOrderId"];
  if (typeof value === "string" && value.trim()) {
    return value;
  }
  if (typeof value === "number") {
    return String(value);
  }
  return "";
}
