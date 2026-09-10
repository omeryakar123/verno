import { createFileRoute } from "@tanstack/react-router";
import { CorporateMembershipPage } from "@/components/corporate/corporate-membership-page";
import { fetchBrandsPaged, fetchPlatformStats } from "@/lib/data";
import { breadcrumbLd, seoHead, SITE_NAME } from "@/lib/seo";

export const Route = createFileRoute("/_corporate/kurumsal-uyelik")({
  loader: async () => {
    const [stats, brandsResult] = await Promise.all([
      fetchPlatformStats().catch(() => null),
      fetchBrandsPaged({ page: 1, pageSize: 15, premium: true, sortBy: "rating" }).catch(() => ({
        items: [],
        total: 0,
        page: 1,
        pageSize: 15,
      })),
    ]);
    return { stats, proBrands: brandsResult.items };
  },
  head: () => ({
    ...seoHead({
      title: `Корпоративно членство — Pro ${SITE_NAME}`,
      description:
        "С Pro членство в verno управлявате жалби, увеличавате удовлетвореността, достигате до клиенти и анализирате конкуренцията.",
      path: "/kurumsal-uyelik",
    }),
    scripts: [
      breadcrumbLd([
        { name: "Начало", path: "/" },
        { name: "Pro членство", path: "/kurumsal-uyelik" },
      ]),
    ],
  }),
  component: Page,
});

function Page() {
  const { stats, proBrands } = Route.useLoaderData();
  return <CorporateMembershipPage stats={stats} proBrands={proBrands} />;
}
