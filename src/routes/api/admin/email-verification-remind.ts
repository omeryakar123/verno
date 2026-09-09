import { createFileRoute } from "@tanstack/react-router";
import { audit } from "@/lib/server/audit";
import { clientIp, errorResponse, requireStaff } from "@/lib/server/guard";
import { remindUnverifiedUsers } from "@/lib/server/unverified-user-reminders";

export const Route = createFileRoute("/api/admin/email-verification-remind")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const user = await requireStaff(request);
          const result = await remindUnverifiedUsers(clientIp(request));

          await audit(request, user.id, {
            action: "user.email_verification_remind",
            entityType: "user",
            metadata: {
              total: result.total,
              notified: result.notified,
              emailed: result.emailed,
              errors: result.errors.length,
            },
            severity: "info",
          });

          return Response.json({ ok: true, ...result });
        } catch (e) {
          return errorResponse(e);
        }
      },
    },
  },
});
