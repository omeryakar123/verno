import { createFileRoute } from "@tanstack/react-router";
import { desc, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db, schema } from "@/db";

export const Route = createFileRoute("/api/me/supported")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session?.user) return new Response("Unauthorized", { status: 401 });

        const rows = await db
          .select({
            id: schema.complaints.id,
            publicId: schema.complaints.publicId,
            title: schema.complaints.title,
            status: schema.complaints.status,
            views: schema.complaints.views,
            createdAt: schema.complaints.createdAt,
            supportedAt: schema.complaintSupports.createdAt,
          })
          .from(schema.complaintSupports)
          .innerJoin(schema.complaints, eq(schema.complaintSupports.complaintId, schema.complaints.id))
          .where(eq(schema.complaintSupports.userId, session.user.id))
          .orderBy(desc(schema.complaintSupports.createdAt));

        return Response.json({ complaints: rows });
      },
    },
  },
});
