import assert from "node:assert/strict";
import test from "node:test";
import { buildPaymentUrls } from "./payment-security";

test("payment URLs always use the canonical public origin and never expose callback secrets", () => {
  const urls = buildPaymentUrls({
    publicAppOrigin: "https://example.invalid",
    notificationUrl: "",
  });

  assert.equal(
    urls.successUrl,
    "https://rave-era.com.ua/event/sbc-summit-ukraine-2026/payment/success",
  );
  assert.equal(
    urls.failUrl,
    "https://rave-era.com.ua/event/sbc-summit-ukraine-2026/payment/fail",
  );
  assert.equal(urls.notificationUrl, "https://rave-era.com.ua/api/payment/callback");
  assert.equal(urls.notificationUrl.includes("callbackToken"), false);
});

test("payment URLs ignore non-canonical explicit provider notification URLs", () => {
  const urls = buildPaymentUrls({
    publicAppOrigin: "https://example.invalid/",
    notificationUrl: "https://api.example.invalid/api/payment/callback",
  });

  assert.equal(urls.notificationUrl, "https://rave-era.com.ua/api/payment/callback");
  assert.equal(
    urls.successUrl,
    "https://rave-era.com.ua/event/sbc-summit-ukraine-2026/payment/success",
  );
});
