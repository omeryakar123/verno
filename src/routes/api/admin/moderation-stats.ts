import { createFileRoute } from "@tanstack/react-router";
import { errorResponse, requireStaff } from "@/lib/server/guard";
import { ensureDbPatches } from "@/lib/server/ensure-db-patches";
import { getModerationStats } from "@/lib/server/moderation-queue-sync";

/** Admin: moderasyon kuyruğu özeti (bildirim çubuğu ile aynı mantık). */
export const Route = createFileRoute("/api/admin/moderation-stats")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          await requireStaff(request);
          await ensureDbPatches();
          return Response.json(await getModerationStats());
        } catch (e) {
          return errorResponse(e);
        }
      },
    },
  },
});
