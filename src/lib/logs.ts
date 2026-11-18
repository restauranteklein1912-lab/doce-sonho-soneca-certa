import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { SleepLog, Wakeup } from "./app-data";

export function useLogs(babyId: string | undefined, days: number | null) {
  return useQuery({
    queryKey: ["logs", babyId, days],
    enabled: !!babyId,
    queryFn: async () => {
      let lq = supabase.from("sleep_logs").select("*").eq("baby_id", babyId!).order("start_at", { ascending: false }).limit(1000);
      let wq = supabase.from("wakeups").select("*").eq("baby_id", babyId!).order("at", { ascending: false }).limit(1000);
      if (days) {
        const since = new Date(Date.now() - days * 86400000).toISOString();
        lq = lq.gte("start_at", since);
        wq = wq.gte("at", since);
      }
      const [l, w] = await Promise.all([lq, wq]);
      if (l.error) throw l.error;
      if (w.error) throw w.error;
      return { logs: (l.data ?? []) as SleepLog[], wakeups: (w.data ?? []) as Wakeup[] };
    },
  });
}

export function useInvalidateLogs() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ["logs"] });
}
