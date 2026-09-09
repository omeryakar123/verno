import { createFileRoute } from "@tanstack/react-router";
import { SITE_URL } from "@/lib/seo";

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: async () => {
        const base = SITE_URL.replace(/\/$/, "");
        const body = [
          "User-agent: *",
          "Allow: /",
          "",
          "# Yönetim ve oturum sayfaları",
          "Disallow: /admin",
          "Disallow: /brand",
          "Disallow: /api/",
          "Disallow: /profile",
          "Disallow: /login",
          "Disallow: /register",
          "Disallow: /verify-email",
          "Disallow: /forgot-password",
          "Disallow: /reset-password",
          "",
          `Sitemap: ${base}/sitemap.xml`,
          "",
        ].join("\n");
        return new Response(body, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
