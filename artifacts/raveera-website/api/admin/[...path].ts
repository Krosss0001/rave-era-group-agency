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
} from "../_payment.js";

type VercelAdminCatchAllRequest = VercelApiRequest & {
  query?: {
    path?: string | string[];
    [key: string]: string | string[] | undefined;
  };
};

function normalizeLoosePath(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return "/";
  }
  const withoutQuery = trimmed.split("?")[0] || "/";
  return withoutQuery.startsWith("/") ? withoutQuery : `/${withoutQuery}`;
}

function normalizePathSegments(value: string | string[] | undefined): string[] {
  const rawSegments = Array.isArray(value) ? value : value ? [value] : [];
  return rawSegments
    .flatMap((segment) => segment.split("/"))
    .map((segment) => segment.trim())
    .filter(Boolean)
    .map((segment) => {
      try {
        return decodeURIComponent(segment);
      } catch {
        return segment;
      }
    });
}

function uniquePaths(paths: string[]): string[] {
  return [...new Set(paths.map(normalizeLoosePath).filter(Boolean))];
}

function getCandidatePaths(req: VercelAdminCatchAllRequest): string[] {
  const parsed = new URL(req.url || "/", "http://vercel.local");
  const querySegments = normalizePathSegments(req.query?.path);
  const searchSegments = parsed.searchParams.getAll("path").flatMap((path) => normalizePathSegments(path));
  const segmentPath = querySegments.length > 0
    ? querySegments.join("/")
    : searchSegments.length > 0
      ? searchSegments.join("/")
      : "";

  const basePaths = [
    req.url || "",
    parsed.pathname,
    segmentPath,
    segmentPath ? `/admin/${segmentPath}` : "",
    segmentPath ? `/api/admin/${segmentPath}` : "",
  ];

  return uniquePaths(basePaths);
}

function isCheckinActionPath(pathname: string, action: string): boolean {
  const path = normalizeLoosePath(pathname);
  return (
    path === `/api/admin/checkin/${action}` ||
    path === `/admin/checkin/${action}` ||
    path === `/checkin/${action}` ||
    path === `/${action}` ||
    path.endsWith(`/admin/checkin/${action}`) ||
    path.endsWith(`/checkin/${action}`)
  );
}

function methodNotAllowed(res: ServerResponse, allowedMethods: string[]): void {
  sendJson(res, 405, {
    code: "METHOD_NOT_ALLOWED",
    error: "Method not allowed",
    allowedMethods,
  });
}

export default async function handler(req: VercelAdminCatchAllRequest, res: ServerResponse) {
  sendCors(res);

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  const candidatePaths = getCandidatePaths(req);

  if (candidatePaths.some((path) => isCheckinActionPath(path, "session"))) {
    if (req.method !== "GET") {
      methodNotAllowed(res, ["GET"]);
      return;
    }
    getCheckinSession(req, res);
    return;
  }

  if (candidatePaths.some((path) => isCheckinActionPath(path, "login"))) {
    if (req.method !== "POST") {
      methodNotAllowed(res, ["POST"]);
      return;
    }
    await checkinLogin(req, res);
    return;
  }

  if (candidatePaths.some((path) => isCheckinActionPath(path, "logout"))) {
    if (req.method !== "POST") {
      methodNotAllowed(res, ["POST"]);
      return;
    }
    await checkinLogout(req, res);
    return;
  }

  if (candidatePaths.some((path) => isCheckinActionPath(path, "verify"))) {
    if (req.method !== "POST") {
      methodNotAllowed(res, ["POST"]);
      return;
    }
    await checkinVerify(req, res);
    return;
  }

  if (candidatePaths.some((path) => isCheckinActionPath(path, "mark-used"))) {
    if (req.method !== "POST") {
      methodNotAllowed(res, ["POST"]);
      return;
    }
    await checkinMarkUsed(req, res);
    return;
  }

  sendJson(res, 404, {
    code: "NOT_FOUND",
    error: "Admin API route not found",
  });
}
