import type { ServerResponse } from "node:http";
import { createOrder, sendCors, sendJson, type VercelApiRequest } from "../_payment.js";

export default async function handler(req: VercelApiRequest, res: ServerResponse) {
  sendCors(res);

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  console.info("Vercel create-order API request", {
    method: req.method,
    rawUrl: req.url || "/api/payment/create-order",
    pathname: new URL(req.url || "/api/payment/create-order", "http://vercel.local").pathname,
  });

  if (req.method !== "POST") {
    sendJson(res, 405, {
      code: "METHOD_NOT_ALLOWED",
      error: "Method not allowed",
      allowedMethods: ["POST"],
    });
    return;
  }

  await createOrder(req, res);
}
