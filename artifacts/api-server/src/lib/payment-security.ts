const EVENT_PAYMENT_PATH = "/event/sbc-summit-ukraine-2026/payment";
const CALLBACK_PATH = "/api/payment/callback";
const CANONICAL_PUBLIC_APP_ORIGIN = "https://rave-era.com.ua";

export type PaymentUrls = {
  successUrl: string;
  failUrl: string;
  notificationUrl: string;
};

export function buildPaymentUrls({
  publicAppOrigin,
  notificationUrl,
}: {
  publicAppOrigin: string;
  notificationUrl: string;
}): PaymentUrls {
  void publicAppOrigin;
  void notificationUrl;

  return {
    successUrl: `${CANONICAL_PUBLIC_APP_ORIGIN}${EVENT_PAYMENT_PATH}/success`,
    failUrl: `${CANONICAL_PUBLIC_APP_ORIGIN}${EVENT_PAYMENT_PATH}/fail`,
    notificationUrl: `${CANONICAL_PUBLIC_APP_ORIGIN}${CALLBACK_PATH}`,
  };
}
