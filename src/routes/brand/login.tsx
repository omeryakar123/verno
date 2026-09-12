import { createFileRoute } from "@tanstack/react-router";
import { AuthForm } from "@/components/auth-form";
import { privateHead } from "@/lib/seo";

export const Route = createFileRoute("/brand/login")({
  head: () => privateHead("Вход за марки — verno.bg", "/brand/login"),
  component: () => <AuthForm variant="brand" initialMode="login" />,
});
