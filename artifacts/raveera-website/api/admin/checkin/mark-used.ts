import type { ServerResponse } from "node:http";
import { checkinMarkUsed, sendCors, sendJson, type VercelApiRequest } from "../../_payment.js";

export default async function handler(req: VercelApiRequest, res: ServerResponse) {
  sendCors(res);

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== "POST") {
    sendJson(res, 405, {
      code: "METHOD_NOT_ALLOWED",
      error: "Method not allowed",
      allowedMethods: ["POST"],
    });
    return;
  }

  await checkinMarkUsed(req, res);
}
