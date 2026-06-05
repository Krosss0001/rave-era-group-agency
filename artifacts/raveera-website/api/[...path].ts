import type { IncomingMessage, ServerResponse } from "node:http";
import {
  checkinLogin,
  checkinLogout,
  checkinMarkUsed,
  checkinVerify,
  createOrder,
  getEmailConfigCheck,
  getCheckinSession,
  getPaymentStatus,
  getPaymentConfigCheck,
  getPublicTicket,
  getTicketPdf,
  paymentCallback,
  sendCors,
  sendJson,
  type VercelApiRequest,
} from "./_payment.js";

type VercelCatchAllRequest = VercelApiRequest & {
  query?: {
    path?: string | string[];
    [key: string]: string | string[] | undefined;
  };
};

function normalizePathSegments(segments: string[]): string[] {
  return segments
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

function getPathSegments(req: VercelCatchAllRequest, parsed: URL): string[] {
  const queryPath = req.query?.path;
  if (Array.isArray(queryPath) && queryPath.length > 0) {
    return normalizePathSegments(queryPath);
  }
  if (typeof queryPath === "string" && queryPath.length > 0) {
    return normalizePathSegments([queryPath]);
  }

  const searchPath = parsed.searchParams.getAll("path");
  if (searchPath.length > 0) {
    return normalizePathSegments(searchPath);
  }

  return [];
}

function getCatchAllPath(req: VercelCatchAllRequest, parsed: URL): string | null {
  const pathSegments = getPathSegments(req, parsed);
  return pathSegments.length > 0 ? pathSegments.map((segment) => encodeURIComponent(segment)).join("/") : null;
}

function normalizeApiUrl(req: VercelCatchAllRequest): URL {
  const rawUrl = req.url || "/";
  const parsed = new URL(rawUrl, "http://vercel.local");
  const catchAllPath = getCatchAllPath(req, parsed);
  const normalizedPath =
    catchAllPath && (parsed.pathname.includes("[...path]") || parsed.pathname === "/api")
      ? `/api/${catchAllPath}`
      : parsed.pathname === "/api" || parsed.pathname.startsWith("/api/")
        ? parsed.pathname
        : `/api${parsed.pathname.startsWith("/") ? parsed.pathname : `/${parsed.pathname}`}`;

  parsed.searchParams.delete("path");
  return new URL(`${normalizedPath}${parsed.search}`, "http://vercel.local");
}

function normalizeLoosePath(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return "/";
  }

  const withoutQuery = trimmed.split("?")[0] || "/";
  return withoutQuery.startsWith("/") ? withoutQuery : `/${withoutQuery}`;
}

function withoutApiPrefix(pathname: string): string {
  const path = normalizeLoosePath(pathname);
  return path === "/api" ? "/" : path.startsWith("/api/") ? path.slice(4) || "/" : path;
}

function uniquePaths(paths: string[]): string[] {
  return [...new Set(paths.map(normalizeLoosePath).filter(Boolean))];
}

function matchesPath(pathname: string, ...paths: string[]): boolean {
  return paths.includes(pathname);
}

function getCandidatePaths(req: VercelCatchAllRequest, originalUrl: URL, normalizedUrl: URL): string[] {
  const rawUrl = req.url || "/";
  const catchAllPath = getCatchAllPath(req, originalUrl);
  const basePaths = [
    normalizeLoosePath(rawUrl),
    originalUrl.pathname,
    normalizedUrl.pathname,
    catchAllPath ? normalizeLoosePath(catchAllPath) : "",
    catchAllPath ? `/api/${catchAllPath}` : "",
  ].filter(Boolean);

  return uniquePaths([
    ...basePaths,
    ...basePaths.map(withoutApiPrefix),
  ]);
}

function getRouteDiagnostics(req: VercelCatchAllRequest, originalUrl: URL, normalizedUrl: URL): Record<string, unknown> {
  const pathSegments = getPathSegments(req, originalUrl);
  return {
    method: req.method,
    rawUrl: req.url || "",
    pathname: originalUrl.pathname,
    normalizedPath: normalizedUrl.pathname,
    ...(pathSegments.length > 0 ? { pathSegments } : {}),
    candidatePaths: getCandidatePaths(req, originalUrl, normalizedUrl),
  };
}

function isCreateOrderPath(pathname: string): boolean {
  const path = normalizeLoosePath(pathname);
  return (
    pathname === "payment/create-order" ||
    path === "/api/payment/create-order" ||
    path === "/payment/create-order" ||
    path.endsWith("/payment/create-order")
  );
}

function isPaymentCallbackPath(pathname: string): boolean {
  const path = normalizeLoosePath(pathname);
  return (
    pathname === "payment/callback" ||
    path === "/api/payment/callback" ||
    path === "/payment/callback" ||
    path.endsWith("/payment/callback")
  );
}

function isPaymentStatusPath(pathname: string): boolean {
  const path = normalizeLoosePath(pathname);
  return path === "/api/payment/status" || path === "/payment/status" || path.endsWith("/payment/status");
}

function isEmailConfigCheckPath(pathname: string): boolean {
  const path = normalizeLoosePath(pathname);
  return path === "/api/email/config-check" || path === "/email/config-check" || path.endsWith("/email/config-check");
}

function isAdminCheckinPath(pathname: string, action: string): boolean {
  const path = normalizeLoosePath(pathname);
  return (
    path === `/api/admin/checkin/${action}` ||
    path === `/admin/checkin/${action}` ||
    path.endsWith(`/admin/checkin/${action}`)
  );
}

function getTicketCode(pathname: string): string | null {
  const match = normalizeLoosePath(pathname).match(/(?:^|\/api)\/ticket\/([^/?]+)$/);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

function getTicketPdfCode(pathname: string): string | null {
  const match = normalizeLoosePath(pathname).match(/(?:^|\/api)\/ticket\/([^/?]+)\/pdf$/);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

export default async function handler(req: VercelCatchAllRequest, res: ServerResponse) {
  sendCors(res);

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  const originalUrl = new URL(req.url || "/", "http://vercel.local");
  const normalizedUrl = normalizeApiUrl(req);
  const candidatePaths = getCandidatePaths(req, originalUrl, normalizedUrl);

  if (req.method === "POST" && candidatePaths.some(isCreateOrderPath)) {
    await createOrder(req, res);
    return;
  }

  if (req.method === "POST" && candidatePaths.some(isPaymentCallbackPath)) {
    await paymentCallback(req, res);
    return;
  }

  if (req.method === "GET" && candidatePaths.some(isPaymentStatusPath)) {
    await getPaymentStatus(req, res);
    return;
  }

  if (req.method === "GET" && candidatePaths.some(isEmailConfigCheckPath)) {
    sendJson(res, 200, getEmailConfigCheck());
    return;
  }

  if (req.method === "POST" && candidatePaths.some((path) => isAdminCheckinPath(path, "login"))) {
    await checkinLogin(req, res);
    return;
  }

  if (req.method === "POST" && candidatePaths.some((path) => isAdminCheckinPath(path, "logout"))) {
    await checkinLogout(req, res);
    return;
  }

  if (req.method === "GET" && candidatePaths.some((path) => isAdminCheckinPath(path, "session"))) {
    getCheckinSession(req, res);
    return;
  }

  if (req.method === "POST" && candidatePaths.some((path) => isAdminCheckinPath(path, "verify"))) {
    await checkinVerify(req, res);
    return;
  }

  if (req.method === "POST" && candidatePaths.some((path) => isAdminCheckinPath(path, "mark-used"))) {
    await checkinMarkUsed(req, res);
    return;
  }

  const ticketPdfCode = candidatePaths.map(getTicketPdfCode).find(Boolean);
  if (req.method === "GET" && ticketPdfCode) {
    await getTicketPdf(ticketPdfCode, res);
    return;
  }

  const ticketCode = candidatePaths.map(getTicketCode).find(Boolean);
  if (req.method === "GET" && ticketCode) {
    await getPublicTicket(ticketCode, res);
    return;
  }

  if (req.method === "GET" && candidatePaths.some((path) => matchesPath(path, "/api/health", "/api/healthz", "/health"))) {
    sendJson(res, 200, { ok: true, service: "raveera-api" });
    return;
  }

  if (req.method === "GET" && candidatePaths.some((path) => matchesPath(path, "/api/routes", "/routes"))) {
    sendJson(res, 200, {
      ok: true,
      routes: [
        "GET /api/health",
        "GET /api/email/config-check",
        "GET /api/payment/config-check",
        "POST /api/payment/create-order",
        "POST /api/payment/callback",
        "GET /api/payment/status?merchantRequestId=...",
        "GET /api/ticket/:ticketCode",
        "GET /api/ticket/:ticketCode/pdf",
        "GET /api/admin-checkin?action=session",
        "POST /api/admin-checkin?action=login",
        "POST /api/admin-checkin?action=logout",
        "POST /api/admin-checkin?action=verify",
        "POST /api/admin-checkin?action=mark-used",
      ],
      matching: {
        diagnostics: getRouteDiagnostics(req, originalUrl, normalizedUrl),
        adminCheckin: {
          flatFunction: "/api/admin-checkin.ts",
          paths: [
            "/api/admin-checkin?action=session",
            "/api/admin-checkin?action=login",
            "/api/admin-checkin?action=logout",
            "/api/admin-checkin?action=verify",
            "/api/admin-checkin?action=mark-used",
          ],
        },
        createOrder: {
          method: "POST",
          paths: ["/api/payment/create-order", "/payment/create-order", "payment/create-order"],
          suffix: "/payment/create-order",
        },
        paymentCallback: {
          method: "POST",
          paths: ["/api/payment/callback", "/payment/callback", "payment/callback"],
          suffix: "/payment/callback",
        },
        received: {
          method: req.method,
          path: originalUrl.pathname,
          normalizedPath: normalizedUrl.pathname,
        },
      },
    });
    return;
  }

  if (
    req.method === "GET" &&
    candidatePaths.some((path) => matchesPath(path, "/api/payment/config-check", "/payment/config-check"))
  ) {
    sendJson(res, 200, getPaymentConfigCheck());
    return;
  }

  sendJson(res, 404, {
    error: "NOT_FOUND",
    method: req.method,
    path: originalUrl.pathname,
    normalizedPath: normalizedUrl.pathname,
  });
}
