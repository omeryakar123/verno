import { createFileRoute } from "@tanstack/react-router";
import { AuthForm } from "@/components/auth-form";
import { privateHead, SITE_NAME } from "@/lib/seo";

export const Route = createFileRoute("/(auth)/register/kurumsal")({
  head: () => privateHead(`Корпоративна регистрация — ${SITE_NAME}`, "/register/kurumsal"),
  component: () => <AuthForm variant="user" initialMode="register" corporate />,
});
