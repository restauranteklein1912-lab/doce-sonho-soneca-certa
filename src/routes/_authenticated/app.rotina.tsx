import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAppData } from "@/lib/app-data";
import { ageInMonths, suggestedRoutine } from "@/lib/sleep";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ErrorState, Loading, PageTitle } from "@/components/app/States";
import { Paywall } from "@/components/app/Paywall";
import { s } from "@/i18n/strings";

export const Route = createFileRoute("/_authenticated/app/rotina")({
  head: () => ({ meta: [{ title: "Rotina do bebê · Doce Sonho" }] }),
  component: Rotina,
});

type RItem = { time: string; label: string };

function Rotina() {
  const { baby, premium } = useAppData();
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["routine", baby?.id],
    enabled: !!baby && premium,
    queryFn: async () => {
      const { data, error } = await supabase.from("routines").select("*").eq("baby_id", baby!.id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
  const [items, setItems] = useState<RItem[]>([]);
  const [busy, setBusy] = useState(false);
  const suggestion = () => (baby ? suggestedRoutine(ageInMonths(baby.birth_date), s.routine) : []);

  useEffect(() => {
    if (q.isSuccess) setItems(q.data && Array.isArray(q.data.items) && q.data.items.length ? (q.data.items as RItem[]) : suggestion());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q.isSuccess, q.data, baby?.id]);

  if (!premium) return <div><PageTitle title={s.routine.title} subtitle={s.routine.subtitle} /><Paywall /></div>;
  if (q.isLoading) return <Loading />;
  if (q.isError) return <ErrorState onRetry={() => q.refetch()} />;

  async function save() {
    setBusy(true);
    const clean = items.filter((i) => i.label.trim()).sort((a, b) => a.time.localeCompare(b.time));
    const { error } = await supabase.from("routines").upsert({ baby_id: baby!.id, items: clean, updated_at: new Date().toISOString() }, { onConflict: "baby_id" });
    setBusy(false);
    if (error) toast.error(s.common.error); else { toast.success(s.common.saved); setItems(clean); qc.invalidateQueries({ queryKey: ["routine"] }); }
  }
  const update = (i: number, patch: Partial<RItem>) => setItems((arr) => arr.map((x, j) => (j === i ? { ...x, ...patch } : x)));

  return (
    <div>
      <PageTitle title={s.routine.title} subtitle={s.routine.subtitle} action={<Button variant="outline" onClick={() => setItems(suggestion())}>{s.routine.reset}</Button>} />
      <ul className="card-soft divide-y">
        {items.map((it, i) => (
          <li key={i} className="flex items-center gap-2 p-3">
            <Input type="time" aria-label={s.routine.time} className="w-28 shrink-0" value={it.time} onChange={(e) => update(i, { time: e.target.value })} />
            <Input aria-label={s.routine.label} maxLength={80} value={it.label} onChange={(e) => update(i, { label: e.target.value })} />
            <Button size="icon" variant="ghost" aria-label={s.common.delete} onClick={() => setItems((arr) => arr.filter((_, j) => j !== i))}><Trash2 /></Button>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex flex-wrap justify-between gap-2">
        <Button variant="soft" onClick={() => setItems((a) => [...a, { time: "12:00", label: "" }])}><Plus /> {s.routine.addItem}</Button>
        <Button onClick={save} disabled={busy}>{busy ? s.common.saving : s.common.save}</Button>
      </div>
      <p className="mt-4 text-xs text-muted-foreground">{s.calc.notice}</p>
    </div>
  );
}
