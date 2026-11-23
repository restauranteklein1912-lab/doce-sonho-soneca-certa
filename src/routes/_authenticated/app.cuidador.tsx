import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Leaf } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Empty, ErrorState, Loading, PageTitle } from "@/components/app/States";
import { s } from "@/i18n/strings";
import { useAppData } from "@/lib/app-data";
import { Paywall } from "@/components/app/Paywall";

export const Route = createFileRoute("/_authenticated/app/cuidador")({
  head: () => ({ meta: [{ title: "Cuidador · Doce Sonho" }] }),
  component: Cuidador,
});

function Scale({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-semibold">{label}</legend>
      <div className="flex gap-2" role="radiogroup" aria-label={label}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" role="radio" aria-checked={value === n} onClick={() => onChange(n)}
            className={`h-11 w-11 rounded-full font-semibold ${value === n ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{n}</button>
        ))}
      </div>
    </fieldset>
  );
}

function Cuidador() {
  const { premium } = useAppData();
  const qc = useQueryClient();
  const [rest, setRest] = useState(3);
  const [energy, setEnergy] = useState(3);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const q = useQuery({
    queryKey: ["checkins"],
    enabled: premium,
    queryFn: async () => {
      const { data, error } = await supabase.from("caregiver_checkins").select("*").order("created_at", { ascending: false }).limit(14);
      if (error) throw error;
      return data;
    },
  });
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.from("caregiver_checkins").insert({ rest, energy, note: note.trim() || null });
    setBusy(false);
    if (error) toast.error(s.common.error); else { toast.success(s.common.saved); setNote(""); qc.invalidateQueries({ queryKey: ["checkins"] }); }
  }
  if (!premium) return <div><PageTitle title={s.caregiver.title} subtitle={s.caregiver.subtitle} /><Paywall /></div>;

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div>
        <PageTitle title={s.caregiver.title} subtitle={s.caregiver.subtitle} />
        <form onSubmit={submit} className="card-soft space-y-4 p-5">
          <Scale label={s.caregiver.rest} value={rest} onChange={setRest} />
          <Scale label={s.caregiver.energy} value={energy} onChange={setEnergy} />
          <div className="space-y-1.5"><Label htmlFor="cn">{s.caregiver.note}</Label><Textarea id="cn" maxLength={1000} value={note} onChange={(e) => setNote(e.target.value)} /></div>
          <Button type="submit" disabled={busy}>{s.caregiver.cta}</Button>
        </form>
        <section className="mt-5">
          <h2 className="mb-2 text-lg">{s.caregiver.history}</h2>
          {q.isLoading ? <Loading /> : q.isError ? <ErrorState onRetry={() => q.refetch()} /> : !q.data?.length ? <Empty>{s.caregiver.empty}</Empty> : (
            <ul className="card-soft divide-y">
              {q.data.map((c) => (
                <li key={c.id} className="p-4 text-sm">
                  <p className="font-semibold">{new Date(c.created_at).toLocaleString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
                  <p className="text-muted-foreground">{s.caregiver.rest}: {c.rest}/5 · {s.caregiver.energy}: {c.energy}/5</p>
                  {c.note && <p className="mt-1 break-words">{c.note}</p>}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
      <aside className="rounded-3xl bg-lavender p-6 text-lavender-foreground lg:mt-16 lg:self-start">
        <h2 className="flex items-center gap-2 text-lg"><Leaf className="h-5 w-5" aria-hidden /> {s.caregiver.tipsTitle}</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm">
          {s.caregiver.tips.map((t) => <li key={t}>{t}</li>)}
        </ul>
      </aside>
    </div>
  );
}
