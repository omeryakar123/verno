import { createFileRoute } from "@tanstack/react-router";
import { BrandApplicationForm } from "@/components/brand-application-form";
import { privateHead, SITE_NAME } from "@/lib/seo";

export const Route = createFileRoute("/(auth)/register/marka-basvuru")({
  head: () => privateHead(`Brand Application — ${SITE_NAME}`, "/register/marka-basvuru"),
  component: BrandApplicationForm,
});
