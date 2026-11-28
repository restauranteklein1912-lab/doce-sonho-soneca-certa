import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/calculadora")({
  beforeLoad: () => {
    throw redirect({ to: "/", replace: true });
  },
});
