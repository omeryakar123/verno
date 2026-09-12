import {
  Outlet,
  Link,
  createRootRoute,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Toaster } from "sonner";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { defaultRootHead } from "@/lib/seo";
import { GA_MEASUREMENT_ID, googleAnalyticsInitScript } from "@/lib/google-analytics";
import { themeInitScript } from "@/lib/theme";
import { AuthProvider } from "../hooks/use-auth";
import { PageViewTracker } from "@/components/page-view-tracker";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-dark">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-dark">Страницата не е намерена</h2>
        <p className="mt-2 text-sm text-navy-mid">
          Търсената страница може да е преместена или да не съществува.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-lg bg-brand px-4 py-2 text-sm font-medium text-brand-foreground transition-colors hover:brightness-110"
          >
            Към началната страница
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-dark">Страницата не може да се зареди</h1>
        <p className="mt-2 text-sm text-navy-mid">
          Нещо се обърка. Опитайте да опресните или се върнете на началната страница.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-lg bg-brand px-4 py-2 text-sm font-medium text-brand-foreground transition-colors hover:brightness-110"
          >
            Опитай отново
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-lg border border-rule bg-card px-4 py-2 text-sm font-medium text-dark transition-colors hover:bg-surface"
          >
            Начало
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => {
    const base = defaultRootHead();
    return {
      ...base,
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { name: "author", content: "verno" },
        ...base.meta,
      ],
      links: [
        ...(base.links ?? []),
        { rel: "stylesheet", href: appCss },
        { rel: "icon", href: "/favicon.ico", sizes: "any" },
        { rel: "icon", href: "/favicon-32.png", type: "image/png", sizes: "32x32" },
        { rel: "icon", href: "/favicon.png", type: "image/png", sizes: "96x96" },
        { rel: "apple-touch-icon", href: "/apple-touch-icon.png", sizes: "180x180" },
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
        {
          rel: "stylesheet",
          href: "https://api.fontshare.com/v2/css?f[]=metropolis@400,500,600,700&display=swap",
        },
      ],
    };
  },
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="bg" suppressHydrationWarning>
      <head>
        {/* React'ten ÖNCE çalışır: koyu temada açılışta beyaz parlamayı önler. */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        {/* Google Analytics (gtag.js) */}
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} />
        <script dangerouslySetInnerHTML={{ __html: googleAnalyticsInitScript }} />
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

/** Bildirimler seçili temaya uyar. */
function ThemedToaster() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  useEffect(() => {
    const sync = () => setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
    sync();
    const obs = new MutationObserver(sync);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);
  return <Toaster position="top-right" richColors theme={theme} />;
}

function RootComponent() {
  return (
    <AuthProvider>
      <PageViewTracker />
      <Outlet />
      <ThemedToaster />
    </AuthProvider>
  );
}
