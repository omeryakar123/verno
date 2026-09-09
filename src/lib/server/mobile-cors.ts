import { collectTrustedOrigins } from "@/lib/auth-urls";

const MOBILE_SCHEMES = (process.env.MOBILE_APP_SCHEMES ?? "verno,my-expo-app")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

function mobileOrigins(): string[] {
  const out = new Set<string>();
  for (const scheme of MOBILE_SCHEMES) {
    out.add(`${scheme}://`);
  }
  out.add("exp://");
  out.add("http://localhost:8081");
  out.add("http://127.0.0.1:8081");
  return [...out];
}

function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  const allowed = new Set([...collectTrustedOrigins(), ...mobileOrigins()]);
  if (allowed.has(origin)) return true;
  if (origin.startsWith("exp://")) return true;
  for (const scheme of MOBILE_SCHEMES) {
    if (origin.startsWith(`${scheme}://`)) return true;
  }
  return false;
}

export function applyMobileCors(request: Request, response: Response): Response {
  const origin = request.headers.get("Origin");
  if (!origin || !isAllowedOrigin(origin)) return response;

  const headers = new Headers(response.headers);
  headers.set("Access-Control-Allow-Origin", origin);
  headers.set("Access-Control-Allow-Credentials", "true");
  headers.set("Vary", "Origin");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export function mobileCorsPreflight(request: Request): Response | null {
  if (request.method !== "OPTIONS") return null;
  const origin = request.headers.get("Origin");
  if (!origin || !isAllowedOrigin(origin)) return null;

  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
      "Access-Control-Allow-Headers":
        "Content-Type, Authorization, Cookie, expo-origin, x-expo-origin",
      "Access-Control-Max-Age": "86400",
      Vary: "Origin",
    },
  });
}
