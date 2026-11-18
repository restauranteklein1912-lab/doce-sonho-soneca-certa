import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, Flame, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { localDayKey, useAppData } from "@/lib/app-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Empty, ErrorState, Loading, PageTitle } from "@/components/app/States";
import { Paywall } from "@/components/app/Paywall";
import { s } from "@/i18n/strings";

export const Route = createFileRoute("/_authenticated/app/hora-de-dormir")({
  head: () => ({ meta: [{ title: "Hora de dormir · Doce Sonho" }] }),
  component: HoraDeDormir,
});

function HoraDeDormir() {
  const { baby, premium } = useAppData();
  const qc = useQueryClient();
  const [label, setLabel] = useState("");
  const today = localDayKey(new Date());
  const q = useQuery({
    queryKey: ["bedtime", baby?.id],
    enabled: !!baby && premium,
    queryFn: async () => {
      const since = localDayKey(new Date(Date.now() - 90 * 86400000));
      const [i, d] = await Promise.all([
        supabase.from("bedtime_checklist_items").select("*").eq("baby_id", baby!.id).order("position").order("created_at"),
        supabase.from("bedtime_checklist_days").select("*").eq("baby_id", baby!.id).gte("day", since),
      ]);
      if (i.error) throw i.error;
      if (d.error) throw d.error;
      return { items: i.data, days: d.data };
    },
  });
  const refresh = () => qc.invalidateQueries({ queryKey: ["bedtime"] });

  if (!premium) return <div><PageTitle title={s.bedtime.title} subtitle={s.bedtime.subtitle} /><Paywall /></div>;
  if (q.isLoading) return <Loading />;
  if (q.isError || !q.data) return <ErrorState onRetry={() => q.refetch()} />;

  const { items, days } = q.data;
  const doneToday = new Set(days.filter((d) => d.day === today).map((d) => d.item_id));
  const itemIds = new Set(items.map((i) => i.id));
  const byDay = new Map<string, Set<string>>();
  days.forEach((d) => { if (itemIds.has(d.item_id)) byDay.set(d.day, (byDay.get(d.day) ?? new Set()).add(d.item_id)); });
  const complete = (k: string) => items.length > 0 && (byDay.get(k)?.size ?? 0) >= items.length;
  let streak = 0;
  const cursor = new Date();
  if (!complete(localDayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  while (complete(localDayKey(cursor))) { streak++; cursor.setDate(cursor.getDate() - 1); }

  async function toggle(itemId: string) {
    const res = doneToday.has(itemId)
      ? await supabase.from("bedtime_checklist_days").delete().eq("item_id", itemId).eq("day", today)
      : await supabase.from("bedtime_checklist_days").insert({ baby_id: baby!.id, item_id: itemId, day: today });
    if (res.error) toast.error(s.common.error); else refresh();
  }
  async function add(labels: string[]) {
    const rows = labels.map((l, i) => ({ baby_id: baby!.id, label: l.trim().slice(0, 80), position: items.length + i })).filter((r) => r.label);
    if (!rows.length) return;
    const { error } = await supabase.from("bedtime_checklist_items").insert(rows);
    if (error) toast.error(s.common.error); else { setLabel(""); refresh(); }
  }
  async function remove(id: string) {
    const { error } = await supabase.from("bedtime_checklist_items").delete().eq("id", id);
    if (error) toast.error(s.common.error); else refresh();
  }

  return (
    <div>
      <PageTitle title={s.bedtime.title} subtitle={s.bedtime.subtitle} />
      <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-peach px-4 py-2 text-sm font-semibold text-peach-foreground">
        <Flame className="h-4 w-4" aria-hidden /> {s.bedtime.streak(streak)}
      </div>
      {items.length === 0 ? (
        <div className="space-y-3">
          <Empty>{s.bedtime.empty}</Empty>
          <Button variant="soft" onClick={() => add(s.bedtime.defaults)}>{s.bedtime.useDefaults}</Button>
        </div>
      ) : (
        <ul className="card-soft divide-y">
          {items.map((it) => {
            const done = doneToday.has(it.id);
            return (
              <li key={it.id} className="flex items-center gap-3 p-3">
                <button role="checkbox" aria-checked={done} onClick={() => toggle(it.id)}
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 transition-colors ${done ? "border-primary bg-primary text-primary-foreground" : "border-input"}`}>
                  {done && <Check className="h-5 w-5" aria-hidden />}
                  <span className="sr-only">{it.label}</span>
                </button>
                <span className={`flex-1 ${done ? "text-muted-foreground line-through" : ""}`}>{it.label}</span>
                <Button size="icon" variant="ghost" aria-label={s.common.delete} onClick={() => remove(it.id)}><Trash2 /></Button>
              </li>
            );
          })}
        </ul>
      )}
      <form onSubmit={(e) => { e.preventDefault(); add([label]); }} className="mt-4 flex gap-2">
        <Input aria-label={s.bedtime.newItem} placeholder={s.bedtime.newItem} maxLength={80} value={label} onChange={(e) => setLabel(e.target.value)} />
        <Button type="submit" variant="soft"><Plus /> {s.common.add}</Button>
      </form>
    </div>
  );
}
