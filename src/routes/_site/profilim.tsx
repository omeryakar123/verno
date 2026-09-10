import { createFileRoute, redirect } from "@tanstack/react-router";

/** Türkçe /sikayetvar uyumlu alias → профил. */
export const Route = createFileRoute("/_site/profilim")({
  beforeLoad: () => {
    throw redirect({ to: "/profile" });
  },
});
