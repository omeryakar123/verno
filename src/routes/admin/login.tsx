import { createFileRoute } from "@tanstack/react-router";
import { AuthForm } from "@/components/auth-form";
import { privateHead } from "@/lib/seo";

export const Route = createFileRoute("/admin/login")({
  head: () => privateHead("Вход за администратори — verno.bg", "/admin/login"),
  component: () => <AuthForm variant="admin" initialMode="login" />,
});
