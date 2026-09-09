import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { applyMobileCors, mobileCorsPreflight } from "./lib/server/mobile-cors";
import { buildStaticSitemapXml, sitemapResponse } from "./lib/server/sitemap";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

function normalizePath(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!body.includes('"unhandled":true') || !body.includes('"message":"HTTPError"')) {
    return response;
  }

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function sitemapRedirect(request: Request): Response {
  return Response.redirect(new URL("/sitemap.xml", request.url), 301);
}

function isSitemapPath(path: string): boolean {
  return path === "/sitemap.xml" || path.toLowerCase() === "/sitemap.xml";
}

function readPublicSitemapFallback(): string | null {
  const candidates = [
    join(process.cwd(), ".output/public/sitemap.xml"),
    join(process.cwd(), "public/sitemap.xml"),
    join(process.cwd(), "sitemap.xml"),
  ];
  for (const p of candidates) {
    if (!existsSync(p)) continue;
    try {
      const xml = readFileSync(p, "utf8");
      if (xml.trimStart().startsWith("<?xml")) return xml;
    } catch {
      /* try next */
    }
  }
  return null;
}

async function serveSitemap(method: string): Promise<Response> {
  const headers = {
    "Content-Type": "application/xml; charset=utf-8",
    "Cache-Control": "public, max-age=3600",
    "X-Content-Type-Options": "nosniff",
  } as const;

  try {
    return await sitemapResponse(method);
  } catch (e) {
    console.error("[server] sitemap dynamic failed", e);
  }

  const staticFile = readPublicSitemapFallback();
  const xml = staticFile ?? buildStaticSitemapXml();
  if (method === "HEAD") {
    return new Response(null, { status: 200, headers });
  }
  return new Response(xml, { status: 200, headers });
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    const path = normalizePath(new URL(request.url).pathname);
    const preflight = mobileCorsPreflight(request);
    if (preflight) return preflight;

    // Sitemap asla SSR/HTML'e düşmesin — GSC yalnızca XML kabul eder.
    if (isSitemapPath(path) && (request.method === "GET" || request.method === "HEAD")) {
      return serveSitemap(request.method);
    }

    if (
      (path === "/sitemap" || path === "/sitemap/") &&
      (request.method === "GET" || request.method === "HEAD")
    ) {
      return sitemapRedirect(request);
    }

    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      const normalized = await normalizeCatastrophicSsrResponse(response);
      if (path.startsWith("/api/")) return applyMobileCors(request, normalized);
      return normalized;
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
