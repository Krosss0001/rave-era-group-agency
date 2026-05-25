import { createHmac, timingSafeEqual } from "node:crypto";

export const CALLBACK_SIGNATURE_HEADER = "x-alliancepay-signature";

export type CallbackSignatureFailure =
  | "missing_callback_secret"
  | "missing_raw_body"
  | "missing_signature"
  | "malformed_signature"
  | "signature_mismatch";

export type CallbackSignatureResult =
  | { ok: true }
  | { ok: false; reason: CallbackSignatureFailure };

function normalizeSignature(value: string | string[] | undefined): Buffer | null {
  const rawValue = Array.isArray(value) ? value[0] : value;
  if (!rawValue) return null;

  const signature = rawValue.trim().replace(/^sha256=/i, "");
  if (!/^[a-f0-9]{64}$/i.test(signature)) return null;

  return Buffer.from(signature, "hex");
}

export function createCallbackSignature(rawBody: Buffer, secret: string): string {
  return createHmac("sha256", secret).update(rawBody).digest("hex");
}

export function verifyCallbackSignature({
  rawBody,
  secret,
  signatureHeader,
}: {
  rawBody?: Buffer;
  secret: string;
  signatureHeader: string | string[] | undefined;
}): CallbackSignatureResult {
  if (!secret) return { ok: false, reason: "missing_callback_secret" };
  if (!rawBody) return { ok: false, reason: "missing_raw_body" };
  if (!signatureHeader) return { ok: false, reason: "missing_signature" };

  const received = normalizeSignature(signatureHeader);
  if (!received) return { ok: false, reason: "malformed_signature" };

  const expected = Buffer.from(createCallbackSignature(rawBody, secret), "hex");
  if (received.length !== expected.length || !timingSafeEqual(received, expected)) {
    return { ok: false, reason: "signature_mismatch" };
  }

  return { ok: true };
}
