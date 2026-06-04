import type { ServerResponse } from "node:http";
import {
  checkinLogin,
  checkinLogout,
  checkinMarkUsed,
  checkinVerify,
  getCheckinSession,
  sendCors,
  sendJson,
  type VercelApiRequest,
} from "./_payment.js";

type AdminCheckinAction = "session" | "login" | "logout" | "verify" | "mark-used";

const allowedMethods: Record<AdminCheckinAction, string> = {
  session: "GET",
  login: "POST",
  logout: "POST",
  verify: "POST",
  "mark-used": "POST",
};

function getAction(req: VercelApiRequest): string | null {
  const parsed = new URL(req.url || "/", "http://vercel.local");
  const action = parsed.searchParams.get("action");
  return action?.trim() || null;
}

function isAdminCheckinAction(action: string | null): action is AdminCheckinAction {
  return action === "session" || action === "login" || action === "logout" || action === "verify" || action === "mark-used";
}

function methodNotAllowed(res: ServerResponse, allowedMethod: string): void {
  sendJson(res, 405, {
    code: "METHOD_NOT_ALLOWED",
    error: "Method not allowed",
    allowedMethods: [allowedMethod],
  });
}

export default async function handler(req: VercelApiRequest, res: ServerResponse) {
  sendCors(res);

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  const action = getAction(req);

  if (!isAdminCheckinAction(action)) {
    sendJson(res, 400, {
      code: "INVALID_ACTION",
      error: "Invalid admin check-in action",
      allowedActions: Object.keys(allowedMethods),
    });
    return;
  }

  const allowedMethod = allowedMethods[action];
  if (req.method !== allowedMethod) {
    methodNotAllowed(res, allowedMethod);
    return;
  }

  if (action === "session") {
    getCheckinSession(req, res);
    return;
  }

  if (action === "login") {
    await checkinLogin(req, res);
    return;
  }

  if (action === "logout") {
    await checkinLogout(req, res);
    return;
  }

  if (action === "verify") {
    await checkinVerify(req, res);
    return;
  }

  await checkinMarkUsed(req, res);
}
