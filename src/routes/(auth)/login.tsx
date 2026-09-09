import { createFileRoute } from "@tanstack/react-router";
import { AuthForm } from "@/components/auth-form";
import { privateHead } from "@/lib/seo";

export const Route = createFileRoute("/(auth)/login")({
  head: () => privateHead("Giriş Yap — tepkimvar", "/login"),
  component: () => <AuthForm variant="user" initialMode="login" />,
});
