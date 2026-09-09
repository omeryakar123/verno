import { createFileRoute } from "@tanstack/react-router";
import { AuthForm } from "@/components/auth-form";
import { privateHead } from "@/lib/seo";

export const Route = createFileRoute("/admin/login")({
  head: () => privateHead("Admin Girişi — tepkimvar", "/admin/login"),
  component: () => <AuthForm variant="admin" initialMode="login" />,
});
