import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldX, ArrowLeft } from "lucide-react";
import { seoHead, SITE_NAME } from "@/lib/seo";

export const Route = createFileRoute("/_site/(kurumsal)/erisim-yok")({
  head: () => ({
    ...seoHead({
      title: `Няма достъп — ${SITE_NAME}`,
      description: "Нямате права да преглеждате тази страница.",
      path: "/erisim-yok",
      noindex: true,
    }),
  }),
  component: AccessDenied,
});

function AccessDenied() {
  return (
    <div className="flex flex-col">
      <main className="flex-1 grid place-items-center px-6 py-20">
        <div className="text-center max-w-md">
          <div className="mx-auto size-20 rounded-full bg-danger-soft grid place-items-center mb-6 animate-pulse">
            <ShieldX className="size-10 text-danger" />
          </div>
          <h1 className="font-display text-3xl font-black tracking-tight text-ink mb-2">
            Достъпът е отказан
          </h1>
          <p className="text-navy-mid text-[15px] leading-relaxed mb-6">
            Нямате необходимите права за тази страница. Ако смятате, че това е грешка, влезте в
            акаунта си или се свържете с администратор.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full bg-brand text-brand-foreground px-5 h-11 text-sm font-semibold shadow-soft hover:brightness-105"
          >
            <ArrowLeft className="size-4" /> Към началната страница
          </Link>
        </div>
      </main>
    </div>
  );
}
