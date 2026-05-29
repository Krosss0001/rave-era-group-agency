const EVENT_PAYMENT_PATH = "/event/sbc-summit-ukraine-2026/payment";
const CALLBACK_PATH = "/api/payment/callback";

export type PaymentUrls = {
  successUrl: string;
  failUrl: string;
  notificationUrl: string;
};

function normalizeHttpOrigin(value: string, label: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error(`${label} must not be empty.`);
  }

  const parsed = new URL(trimmed);
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new Error(`${label} must use http or https.`);
  }

  return parsed.origin;
}

function validateAbsoluteHttpUrl(value: string, label: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error(`${label} must not be empty.`);
  }

  const parsed = new URL(trimmed);
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new Error(`${label} must use http or https.`);
  }

  return parsed.toString();
}

export function buildPaymentUrls({
  publicAppOrigin,
  notificationUrl,
}: {
  publicAppOrigin: string;
  notificationUrl: string;
}): PaymentUrls {
  const origin = normalizeHttpOrigin(publicAppOrigin, "PUBLIC_APP_ORIGIN");

  return {
    successUrl: `${origin}${EVENT_PAYMENT_PATH}/success`,
    failUrl: `${origin}${EVENT_PAYMENT_PATH}/fail`,
    notificationUrl: notificationUrl.trim()
      ? validateAbsoluteHttpUrl(notificationUrl, "ALLIANCEPAY_NOTIFICATION_URL")
      : `${origin}${CALLBACK_PATH}`,
  };
}
