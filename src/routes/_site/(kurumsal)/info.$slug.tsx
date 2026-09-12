import { createFileRoute, redirect } from "@tanstack/react-router";
import { InfoPageShell } from "@/components/info-page-shell";
import { getInfoPage, INFO_SLUGS } from "@/lib/info-pages-data";
import { seoHead, breadcrumbLd, SITE_NAME } from "@/lib/seo";

export const Route = createFileRoute("/_site/(kurumsal)/info/$slug")({
  beforeLoad: ({ params }) => {
    if (!INFO_SLUGS.includes(params.slug)) {
      throw redirect({ to: "/yardim" });
    }
  },
  head: ({ params }) => {
    const page = getInfoPage(params.slug)!;
    return {
      ...seoHead({
        title: `${page.title} — ${SITE_NAME}`,
        description: page.subtitle,
        path: `/info/${params.slug}`,
      }),
      scripts: [
        breadcrumbLd([
          { name: "Начало", path: "/" },
          { name: "Помощ", path: "/yardim" },
          { name: page.title, path: `/info/${params.slug}` },
        ]),
      ],
    };
  },
  component: Page,
});

function Page() {
  const { slug } = Route.useParams();
  const page = getInfoPage(slug)!;
  return <InfoPageShell page={page} />;
}
