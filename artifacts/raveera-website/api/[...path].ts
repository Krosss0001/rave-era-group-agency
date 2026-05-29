import type { IncomingMessage, ServerResponse } from "node:http";
import { createOrder, sendCors, sendJson, type VercelApiRequest } from "./_payment.js";

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
  rawUrl,
  pathname,
  normalizedPath,
}: {
  method: string | undefined;
  rawUrl: string;
  pathname: string;
  normalizedPath: string;
}): void {
  console.info("Vercel API request", {
    method,
    rawUrl,
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
    rawUrl: req.url || "/",
    pathname: originalUrl.pathname,
    normalizedPath: normalizedUrl.pathname,
  });

  if (req.method === "POST" && candidatePaths.some(isCreateOrderPath)) {
    await createOrder(req, res);
    return;
  }

  if (req.method === "GET" && matchesPath(normalizedUrl.pathname, "/api/health", "/api/healthz", "/health")) {
    sendJson(res, 200, { ok: true, service: "raveera-api" });
    return;
  }

  if (req.method === "GET" && matchesPath(normalizedUrl.pathname, "/api/routes", "/routes")) {
    sendJson(res, 200, {
      ok: true,
      routes: ["GET /api/health", "POST /api/payment/create-order"],
      matching: {
        createOrder: {
          method: "POST",
          paths: ["/api/payment/create-order", "/payment/create-order", "payment/create-order"],
          suffix: "/payment/create-order",
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

  sendJson(res, 404, {
    error: "NOT_FOUND",
    method: req.method,
    path: originalUrl.pathname,
    normalizedPath: normalizedUrl.pathname,
  });
}
