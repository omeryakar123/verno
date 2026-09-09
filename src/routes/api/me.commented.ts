import { createFileRoute } from "@tanstack/react-router";
import { desc, eq, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db, schema } from "@/db";

export const Route = createFileRoute("/api/me/commented")({
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
            commentedAt: sql<string>`max(${schema.comments.createdAt})`.as("commented_at"),
          })
          .from(schema.comments)
          .innerJoin(schema.complaints, eq(schema.comments.complaintId, schema.complaints.id))
          .where(eq(schema.comments.userId, session.user.id))
          .groupBy(
            schema.complaints.id,
            schema.complaints.publicId,
            schema.complaints.title,
            schema.complaints.status,
            schema.complaints.views,
            schema.complaints.createdAt,
          )
          .orderBy(desc(sql`max(${schema.comments.createdAt})`));

        return Response.json({ complaints: rows });
      },
    },
  },
});
