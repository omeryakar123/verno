import { createFileRoute } from "@tanstack/react-router";
import { clientIp, errorResponse, optionalUser } from "@/lib/server/guard";
import { sendSignupOtp } from "@/lib/server/otp";

export const Route = createFileRoute("/api/otp/send")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as { email?: string };
          if (!body.email?.trim()) {
            return Response.json({ error: "E-posta adresi gerekli." }, { status: 400 });
          }
          const normalized = body.email.trim().toLowerCase();
          const sessionUser = await optionalUser(request);
          if (sessionUser && sessionUser.email.toLowerCase() !== normalized) {
            return Response.json({ error: "Yalnızca kendi e-postanıza kod gönderebilirsiniz." }, { status: 403 });
          }
          await sendSignupOtp(normalized, clientIp(request));
          return Response.json({ ok: true });
        } catch (e) {
          return errorResponse(e);
        }
      },
    },
  },
});
