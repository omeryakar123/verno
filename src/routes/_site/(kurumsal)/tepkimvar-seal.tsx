import { createFileRoute, redirect } from "@tanstack/react-router";

/** Eski tepkimvar URL — verno.bg е отделна платформа; пренасочване към марки. */
export const Route = createFileRoute("/_site/(kurumsal)/tepkimvar-seal")({
  beforeLoad: () => {
    throw redirect({ to: "/markalar" });
  },
  component: () => null,
});
