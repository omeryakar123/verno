import { createFileRoute } from "@tanstack/react-router";

/** Yanlış URL (/sitemap) → doğru sitemap.xml yönlendirmesi. */
export const Route = createFileRoute("/sitemap")({
  server: {
    handlers: {
      GET: ({ request }) => Response.redirect(new URL("/sitemap.xml", request.url), 301),
      HEAD: ({ request }) => Response.redirect(new URL("/sitemap.xml", request.url), 301),
    },
  },
});
