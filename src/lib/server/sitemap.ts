import { SITE_URL } from "@/lib/seo";

const BASE_URL = SITE_URL.replace(/\/$/, "");

export interface SitemapEntry {
  path: string;
  changefreq?:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
  priority?: string;
  lastmod?: Date | string | null;
}

function formatLastmod(value: Date | string | null | undefined): string | null {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function staticEntries(): SitemapEntry[] {
  return [
    { path: "/", changefreq: "daily", priority: "1.0" },
    { path: "/sikayetler", changefreq: "hourly", priority: "0.95" },
    { path: "/markalar", changefreq: "daily", priority: "0.9" },
    { path: "/trendler", changefreq: "hourly", priority: "0.9" },
    { path: "/trend-100", changefreq: "daily", priority: "0.85" },
    { path: "/blog", changefreq: "weekly", priority: "0.75" },
    { path: "/arama", changefreq: "weekly", priority: "0.5" },
    { path: "/sikayet-yaz", changefreq: "monthly", priority: "0.6" },
    { path: "/kurumsal-uyelik", changefreq: "monthly", priority: "0.65" },
    { path: "/reklam-cozumleri", changefreq: "monthly", priority: "0.6" },
    { path: "/hakkimizda", changefreq: "monthly", priority: "0.5" },
    { path: "/seffaflik-raporu", changefreq: "monthly", priority: "0.5" },
    { path: "/yardim", changefreq: "monthly", priority: "0.5" },
    { path: "/iletisim", changefreq: "monthly", priority: "0.4" },
    { path: "/kullanim-kosullari", changefreq: "yearly", priority: "0.3" },
    { path: "/gizlilik", changefreq: "yearly", priority: "0.3" },
    { path: "/kvkk", changefreq: "yearly", priority: "0.3" },
  ];
}

async function dynamicEntries(): Promise<SitemapEntry[]> {
  const entries: SitemapEntry[] = [];
  try {
    const { db, schema } = await import("@/db");
    const { eq, and, notInArray, desc } = await import("drizzle-orm");

    const [brands, cats, complaints, posts] = await Promise.all([
      db
        .select({
          slug: schema.brands.slug,
          updatedAt: schema.brands.updatedAt,
        })
        .from(schema.brands)
        .where(eq(schema.brands.isActive, true))
        .limit(5000),
      db
        // `categories` tablosunda `updated_at` kolonu yok — oluşturma tarihi kullanılır.
        .select({
          slug: schema.categories.slug,
          updatedAt: schema.categories.createdAt,
        })
        .from(schema.categories)
        .where(eq(schema.categories.isActive, true))
        .limit(500),
      db
        .select({
          publicId: schema.complaints.publicId,
          id: schema.complaints.id,
          updatedAt: schema.complaints.updatedAt,
        })
        .from(schema.complaints)
        .where(
          and(
            eq(schema.complaints.isPublic, true),
            eq(schema.complaints.hidden, false),
            notInArray(schema.complaints.status, [
              "pending",
              "rejected",
              "spam",
            ]),
          ),
        )
        .orderBy(desc(schema.complaints.updatedAt))
        .limit(5000),
      db
        .select({
          slug: schema.blogs.slug,
          updatedAt: schema.blogs.updatedAt,
          publishedAt: schema.blogs.publishedAt,
        })
        .from(schema.blogs)
        .where(eq(schema.blogs.status, "published"))
        .limit(1000),
    ]);

    for (const b of brands) {
      if (b.slug) {
        entries.push({
          path: `/firma/${b.slug}`,
          changefreq: "weekly",
          priority: "0.7",
          lastmod: b.updatedAt,
        });
      }
    }
    for (const c of cats) {
      if (c.slug) {
        entries.push({
          path: `/kategori/${c.slug}`,
          changefreq: "weekly",
          priority: "0.6",
          lastmod: c.updatedAt,
        });
      }
    }
    for (const c of complaints) {
      entries.push({
        path: `/sikayet/${c.publicId ?? c.id}`,
        changefreq: "weekly",
        priority: "0.6",
        lastmod: c.updatedAt,
      });
    }
    for (const b of posts) {
      entries.push({
        path: `/blog/${b.slug}`,
        changefreq: "monthly",
        priority: "0.6",
        lastmod: b.updatedAt ?? b.publishedAt,
      });
    }
  } catch (e) {
    console.error("[sitemap]", e);
  }
  return entries;
}

export async function buildSitemapXml(): Promise<string> {
  try {
    const entries = [...staticEntries(), ...(await dynamicEntries())];
    return renderSitemapXml(entries);
  } catch (e) {
    console.error("[sitemap] dynamic build failed, using static fallback", e);
    return buildStaticSitemapXml();
  }
}

function renderSitemapXml(entries: SitemapEntry[]): string {
  const urls = entries.map((e) => {
    const loc = escapeXml(`${BASE_URL}${e.path}`);
    const lastmod = formatLastmod(e.lastmod);
    return [
      "  <url>",
      `    <loc>${loc}</loc>`,
      lastmod ? `    <lastmod>${lastmod}</lastmod>` : null,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      "  </url>",
    ]
      .filter(Boolean)
      .join("\n");
  });

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls,
    `</urlset>`,
  ].join("\n");
}

/** DB olmadan da geçerli sitemap — asla HTML fallback'e düşülmesin. */
export function buildStaticSitemapXml(): string {
  return renderSitemapXml(staticEntries());
}

const SITEMAP_HEADERS = {
  "Content-Type": "application/xml; charset=utf-8",
  "Cache-Control": "public, max-age=3600",
  "X-Content-Type-Options": "nosniff",
} as const;

/** Google Search Console için saf XML yanıtı — SSR/HTML fallback yok. */
export async function sitemapResponse(method = "GET"): Promise<Response> {
  let xml = buildStaticSitemapXml();
  try {
    xml = await buildSitemapXml();
  } catch (e) {
    console.error("[sitemap] response fallback", e);
  }

  if (method === "HEAD") {
    return new Response(null, { status: 200, headers: SITEMAP_HEADERS });
  }
  return new Response(xml, { status: 200, headers: SITEMAP_HEADERS });
}
