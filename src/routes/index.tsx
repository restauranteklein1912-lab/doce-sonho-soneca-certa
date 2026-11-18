import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Loading } from "@/components/app/States";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Doce Sonho" },
      { name: "description", content: "Área de membros do Doce Sonho: sono do bebê e descanso de quem cuida." },
      { property: "og:title", content: "Doce Sonho" },
      { property: "og:description", content: "Área de membros do Doce Sonho." },
    ],
  }),
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    throw redirect({ to: data.session ? "/app" : "/entrar", replace: true });
  },
  component: Loading,
});
