import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { AuthForm } from "@/components/auth-form";
import { privateHead } from "@/lib/seo";

/**
 * Alt rotalar (/register/marka-basvuru, /register/kurumsal) Outlet ile render edilir.
 * /register kök yolu doğrudan bireysel kayıt formunu gösterir.
 */
export const Route = createFileRoute("/(auth)/register")({
  head: () => privateHead("Üye Ol — tepkimvar", "/register"),
  component: RegisterLayout,
});

function RegisterLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isNested = pathname.startsWith("/register/") && pathname.length > "/register/".length;

  if (isNested) return <Outlet />;
  return <AuthForm variant="user" initialMode="register" />;
}
