import type { ServerResponse } from "node:http";
import { getTicketPdf, sendCors, sendJson, type VercelApiRequest } from "../../_payment.js";

type TicketPdfRequest = VercelApiRequest & {
  query?: {
    ticketCode?: string | string[];
  };
};

export default async function handler(req: TicketPdfRequest, res: ServerResponse) {
  sendCors(res);

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== "GET") {
    sendJson(res, 405, {
      code: "METHOD_NOT_ALLOWED",
      error: "Method not allowed",
      allowedMethods: ["GET"],
    });
    return;
  }

  const ticketCode = Array.isArray(req.query?.ticketCode)
    ? req.query?.ticketCode[0]
    : req.query?.ticketCode;
  if (!ticketCode) {
    sendJson(res, 400, { code: "INVALID_TICKET_CODE", error: "Ticket code is required" });
    return;
  }

  await getTicketPdf(ticketCode, res);
}
