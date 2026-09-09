import { createFileRoute } from "@tanstack/react-router";
import { AuthForm } from "@/components/auth-form";
import { privateHead } from "@/lib/seo";

export const Route = createFileRoute("/(auth)/register/kurumsal")({
  head: () => privateHead("Kurumsal Kayıt — tepkimvar", "/register/kurumsal"),
  component: () => <AuthForm variant="user" initialMode="register" corporate />,
});
