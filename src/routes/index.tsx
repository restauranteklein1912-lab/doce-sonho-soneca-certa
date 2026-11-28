import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

const SALES_PAGE_URL = "https://doce-sonho-do-bebe.lovable.app";

export const Route = createFileRoute("/")({
  component: SalesPageRedirect,
});

function SalesPageRedirect() {
  useEffect(() => {
    window.location.replace(SALES_PAGE_URL);
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 text-center">
      <p className="text-sm text-muted-foreground">
        Redirecionando para a página oficial do Doce Sonho…
        {" "}
        <a className="font-semibold underline" href={SALES_PAGE_URL}>
          Clique aqui se não for redirecionado.
        </a>
      </p>
    </main>
  );
}
