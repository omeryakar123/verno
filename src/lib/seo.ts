/**
 * SEO yardımcıları — meta/OG/canonical/JSON-LD üretimi.
 * Domain: Coolify'da SITE_URL (sunucu) + VITE_SITE_URL (client build).
 */
export const SITE_NAME = "verno";
export const SITE_TAGLINE = "Споделете жалбата си, проследете решението";
export const SITE_URL =
  (typeof process !== "undefined" ? process.env.SITE_URL : undefined) ||
  (import.meta.env?.VITE_SITE_URL as string | undefined) ||
  "https://verno.bg";

export const DEFAULT_OG_IMAGE = "/og-default.png";
export const DEFAULT_OG_WIDTH = "1200";
export const DEFAULT_OG_HEIGHT = "630";

export function absUrl(path: string): string {
  return `${SITE_URL.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Meta description için düz metne indir + kırp. */
export function clamp(text: string | null | undefined, max = 155): string {
  if (!text) return "";
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length <= max ? clean : `${clean.slice(0, max - 1).trimEnd()}…`;
}

type SeoInput = {
  title: string;
  description: string;
  path: string;
  image?: string | null;
  type?: "website" | "article" | "profile";
  noindex?: boolean;
  publishedTime?: string | null;
  modifiedTime?: string | null;
};

function resolveImage(raw?: string | null): string | null {
  const src = raw ?? DEFAULT_OG_IMAGE;
  if (!src) return null;
  return src.startsWith("http") ? src : absUrl(src);
}

/** TanStack `head()` için meta + canonical üretir. */
export function seoHead(input: SeoInput) {
  const url = absUrl(input.path);
  const image = resolveImage(input.image);

  const meta: Record<string, string>[] = [
    { title: input.title },
    { name: "description", content: input.description },
    { property: "og:title", content: input.title },
    { property: "og:description", content: input.description },
    { property: "og:url", content: url },
    { property: "og:type", content: input.type ?? "website" },
    { property: "og:site_name", content: SITE_NAME },
    { property: "og:locale", content: "bg_BG" },
    {
      name: "twitter:card",
      content: image ? "summary_large_image" : "summary",
    },
    { name: "twitter:title", content: input.title },
    { name: "twitter:description", content: input.description },
  ];

  if (image) {
    meta.push({ property: "og:image", content: image });
    meta.push({ property: "og:image:secure_url", content: image });
    meta.push({ property: "og:image:width", content: DEFAULT_OG_WIDTH });
    meta.push({ property: "og:image:height", content: DEFAULT_OG_HEIGHT });
    meta.push({
      property: "og:image:alt",
      content: `${SITE_NAME} — ${SITE_TAGLINE}`,
    });
    meta.push({ name: "twitter:image", content: image });
  }

  if (input.publishedTime) {
    meta.push({
      property: "article:published_time",
      content: input.publishedTime,
    });
  }
  if (input.modifiedTime) {
    meta.push({
      property: "article:modified_time",
      content: input.modifiedTime,
    });
  }
  if (input.noindex) {
    meta.push({ name: "robots", content: "noindex, nofollow" });
  }

  const links: { rel: string; href: string; hrefLang?: string }[] = [
    { rel: "canonical", href: url },
    { rel: "alternate", href: url, hrefLang: "bg" },
    { rel: "alternate", href: url, hrefLang: "x-default" },
  ];

  return { meta, links };
}

/** Giriş, admin, profil gibi indekslenmemesi gereken sayfalar. */
export function privateHead(title: string, path = "/") {
  return seoHead({
    title,
    description: "Bu sayfa arama motorlarında listelenmez.",
    path,
    noindex: true,
  });
}

/** __root.tsx varsayılan meta (alt sayfalar üzerine yazar). */
export function defaultRootHead() {
  return seoHead({
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description:
      "Надежна българска платформа за жалби и решения. Проучете компании, споделете проблемите си и проследете процеса на разрешаване.",
    path: "/",
  });
}

/** JSON-LD script nesnesi (TanStack `scripts` dizisine konur). */
export function jsonLd(data: Record<string, unknown>) {
  return { type: "application/ld+json", children: JSON.stringify(data) };
}

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return jsonLd({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: absUrl(it.path),
    })),
  });
}

/** SSS sayfaları için FAQPage şeması. */
export function faqLd(items: { question: string; answer: string }[]) {
  return jsonLd({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  });
}
