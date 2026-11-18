import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { s } from "@/i18n/strings";

export function useFavorites() {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["favorites"],
    queryFn: async () => {
      const { data, error } = await supabase.from("favorites").select("article_slug");
      if (error) throw error;
      return new Set(data.map((d) => d.article_slug));
    },
  });
  async function toggle(slug: string) {
    const has = q.data?.has(slug);
    const res = has
      ? await supabase.from("favorites").delete().eq("article_slug", slug)
      : await supabase.from("favorites").insert({ article_slug: slug });
    if (res.error) toast.error(s.common.error);
    qc.invalidateQueries({ queryKey: ["favorites"] });
  }
  return { favs: q.data ?? new Set<string>(), toggle, isLoading: q.isLoading };
}
