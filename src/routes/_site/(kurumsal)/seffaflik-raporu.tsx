import { createFileRoute } from "@tanstack/react-router";
import { TransparencyReportPage } from "@/components/transparency/transparency-report-page";
import { fetchPlatformStats } from "@/lib/data";
import { breadcrumbLd, seoHead, SITE_NAME } from "@/lib/seo";

export const Route = createFileRoute("/_site/(kurumsal)/seffaflik-raporu")({
  head: () => ({
    ...seoHead({
      title: `Доклад за прозрачност 2025 — ${SITE_NAME}`,
      description:
        "Годишен доклад за прозрачност на verno: брой потребители и марки, решени жалби, модерация, принципи на доверие и защита на платформата.",
      path: "/seffaflik-raporu",
    }),
    scripts: [
      breadcrumbLd([
        { name: "Начало", path: "/" },
        { name: "Доклад за прозрачност", path: "/seffaflik-raporu" },
      ]),
    ],
  }),
  loader: async () => ({ stats: await fetchPlatformStats().catch(() => null) }),
  component: Page,
});

function Page() {
  const { stats } = Route.useLoaderData();
  return <TransparencyReportPage stats={stats} />;
}
