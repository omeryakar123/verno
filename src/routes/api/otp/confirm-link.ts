import { createFileRoute } from "@tanstack/react-router";
import { clientIp, errorResponse } from "@/lib/server/guard";
import { verifySignupLink } from "@/lib/server/otp";

export const Route = createFileRoute("/api/otp/confirm-link")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as { email?: string; token?: string };
          if (!body.email?.trim() || !body.token?.trim()) {
            return Response.json({ error: "E-posta ve doğrulama bağlantısı gerekli." }, { status: 400 });
          }
          await verifySignupLink(body.email, body.token, clientIp(request));
          return Response.json({ ok: true });
        } catch (e) {
          return errorResponse(e);
        }
      },
    },
  },
});
