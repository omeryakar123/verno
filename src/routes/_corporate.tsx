import { createFileRoute, Outlet } from "@tanstack/react-router";
import { CorporateNav } from "@/components/corporate/corporate-nav";
import { SiteFooter } from "@/components/site-chrome";
import { TawkChat } from "@/components/tawk-chat";

/**
 * Корпоративни landing страници (Pro членство и др.) — отделна навигация от
 * потребителския сайт, по модела на şikayetvar /kurumsal-uyelik.
 */
export const Route = createFileRoute("/_corporate")({
  component: CorporateLayout,
});

function CorporateLayout() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-white">
      <CorporateNav />
      <main className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />
      <TawkChat />
    </div>
  );
}
