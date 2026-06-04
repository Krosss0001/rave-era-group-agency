import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("online ticket price matches the Vercel payment API price", () => {
  const routeSource = readFileSync(new URL("./payment.ts", import.meta.url), "utf8");

  assert.match(routeSource, /online:\s*100,/);
});
