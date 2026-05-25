import assert from "node:assert/strict";
import test from "node:test";
import {
  buildPaymentUrls,
  verifyAlliancePayCallback,
} from "./payment-security";
import { createCallbackSignature } from "./webhook-auth";

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

test("AlliancePay callback authentication requires a valid signature", () => {
  const rawBody = Buffer.from(
    JSON.stringify({ merchantRequestId: "order-1", orderStatus: "SUCCESS" }),
  );
  const secret = "shared-callback-secret";
  const signatureHeader = createCallbackSignature(rawBody, secret);

  assert.deepEqual(
    verifyAlliancePayCallback({ rawBody, secret, signatureHeader }),
    { ok: true },
  );
  assert.deepEqual(
    verifyAlliancePayCallback({ rawBody, secret, signatureHeader: undefined }),
    { ok: false, reason: "missing_signature" },
  );
});
