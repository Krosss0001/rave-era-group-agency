import type { IncomingMessage, ServerResponse } from "node:http";
import {
  createOrder,
  getEmailConfigCheck,
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
  };
};

function getCatchAllPath(req: VercelCatchAllRequest, parsed: URL): string | null {
  const queryPath = req.query?.path;
  if (Array.isArray(queryPath) && queryPath.length > 0) {
    return queryPath.map((segment) => encodeURIComponent(segment)).join("/");
  }
  if (typeof queryPath === "string" && queryPath.length > 0) {
    return queryPath
      .split("/")
      .filter(Boolean)
      .map((segment) => encodeURIComponent(segment))
      .join("/");
  }

  const searchPath = parsed.searchParams.getAll("path");
  if (searchPath.length > 0) {
    return searchPath.map((segment) => encodeURIComponent(segment)).join("/");
  }

  return null;
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

function logRequest({
  method,
  pathname,
  normalizedPath,
}: {
  method: string | undefined;
  pathname: string;
  normalizedPath: string;
}): void {
  console.info("Vercel API request", {
    method,
    pathname,
    normalizedPath,
  });
}
function matchesPath(pathname: string, ...paths: string[]): boolean {
  return paths.includes(pathname);
}

function getCandidatePaths(req: VercelCatchAllRequest, originalUrl: URL, normalizedUrl: URL): string[] {
  const rawUrl = req.url || "/";
  const catchAllPath = getCatchAllPath(req, originalUrl);
  return [
    normalizeLoosePath(rawUrl),
    originalUrl.pathname,
    normalizedUrl.pathname,
    catchAllPath ? normalizeLoosePath(catchAllPath) : "",
  ].filter(Boolean);
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
  logRequest({
    method: req.method,
    pathname: originalUrl.pathname,
    normalizedPath: normalizedUrl.pathname,
  });

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

  if (req.method === "GET" && matchesPath(normalizedUrl.pathname, "/api/health", "/api/healthz", "/health")) {
    sendJson(res, 200, { ok: true, service: "raveera-api" });
    return;
  }

  if (req.method === "GET" && matchesPath(normalizedUrl.pathname, "/api/routes", "/routes")) {
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
      ],
      matching: {
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
    matchesPath(normalizedUrl.pathname, "/api/payment/config-check", "/payment/config-check")
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
