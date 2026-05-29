import assert from "node:assert/strict";
import test from "node:test";
import { buildPaymentUrls } from "./payment-security";

test("payment URLs use the configured public origin and never expose callback secrets", () => {
  const urls = buildPaymentUrls({
    publicAppOrigin: "https://raveera.group",
    notificationUrl: "",
  });

  assert.equal(
    urls.successUrl,
    "https://raveera.group/event/sbc-summit-ukraine-2026/payment/success",
  );
  assert.equal(
    urls.failUrl,
    "https://raveera.group/event/sbc-summit-ukraine-2026/payment/fail",
  );
  assert.equal(urls.notificationUrl, "https://raveera.group/api/payment/callback");
  assert.equal(urls.notificationUrl.includes("callbackToken"), false);
});

test("payment URLs preserve an explicit provider notification URL", () => {
  const urls = buildPaymentUrls({
    publicAppOrigin: "https://raveera.group/",
    notificationUrl: "https://api.raveera.group/api/payment/callback",
  });

  assert.equal(urls.notificationUrl, "https://api.raveera.group/api/payment/callback");
  assert.equal(
    urls.successUrl,
    "https://raveera.group/event/sbc-summit-ukraine-2026/payment/success",
  );
});
