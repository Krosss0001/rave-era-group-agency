import type { IncomingMessage, ServerResponse } from "node:http";
import app from "../../api-server/src/app";
import { logger } from "../../api-server/src/lib/logger";

type VercelCatchAllRequest = IncomingMessage & {
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

function normalizeApiUrl(req: VercelCatchAllRequest): string {
  const rawUrl = req.url || "/";
  const parsed = new URL(rawUrl, "http://vercel.local");
  const catchAllPath = getCatchAllPath(req, parsed);
  const normalizedPath = catchAllPath && (parsed.pathname.includes("[...path]") || parsed.pathname === "/api")
    ? `/api/${catchAllPath}`
    : parsed.pathname === "/api" || parsed.pathname.startsWith("/api/")
    ? parsed.pathname
    : `/api${parsed.pathname.startsWith("/") ? parsed.pathname : `/${parsed.pathname}`}`;

  parsed.searchParams.delete("path");
  const search = parsed.searchParams.toString();

  return `${normalizedPath}${search ? `?${search}` : ""}`;
}

export default function handler(req: VercelCatchAllRequest, res: ServerResponse) {
  if (req.url) {
    const originalUrl = req.url;
    req.url = normalizeApiUrl(req);
    logger.info(
      {
        method: req.method,
        originalPath: new URL(originalUrl, "http://vercel.local").pathname,
        normalizedPath: new URL(req.url, "http://vercel.local").pathname,
      },
      "Vercel API request forwarded",
    );
  }

  return app(req, res);
}
