import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AlarmClock, Moon, Sun, BellRing } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAppData } from "@/lib/app-data";
import { useInvalidateLogs, useLogs } from "@/lib/logs";
import { ageInMonths, formatDuration, overlapMinutes, refForAge } from "@/lib/sleep";
import { Button } from "@/components/ui/button";
import { ErrorState, Loading } from "@/components/app/States";
import { s } from "@/i18n/strings";

export const Route = createFileRoute("/_authenticated/app/")({
  head: () => ({ meta: [{ title: "Início · Doce Sonho" }] }),
  component: Inicio,
});

function useNow(ms = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), ms); return () => clearInterval(t); }, [ms]);
  return now;
}

function hhmm(d: Date) {
  return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function Inicio() {
  const { baby, profile } = useAppData();
  const q = useLogs(baby?.id, 2);
  const invalidate = useInvalidateLogs();
  const now = useNow();
  const [busy, setBusy] = useState(false);

  const data = useMemo(() => {
    if (!q.data) return null;
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const s0 = start.getTime(), s1 = s0 + 86400000;
    const active = q.data.logs.find((l) => !l.end_at) ?? null;
    let slept = 0, naps = 0;
    for (const l of q.data.logs) {
      const a = new Date(l.start_at).getTime();
      const b = l.end_at ? new Date(l.end_at).getTime() : Date.now();
      slept += overlapMinutes(a, b, s0, s1);
      if (l.kind === "nap" && a >= s0 && a < s1) naps++;
    }
    const wakeups = q.data.wakeups.filter((w) => { const t = new Date(w.at).getTime(); return t >= s0 && t < s1; }).length;
    const lastEnded = q.data.logs.find((l) => l.end_at);
    return { active, slept, naps, wakeups, lastEnd: lastEnded?.end_at ? new Date(lastEnded.end_at) : null };
  }, [q.data, Math.floor(now / 60000)]);

  if (!baby) return null;
  if (q.isLoading) return <Loading />;
  if (q.isError || !data) return <ErrorState onRetry={() => q.refetch()} />;

  const ref = refForAge(ageInMonths(baby.birth_date));
  const nextFrom = data.lastEnd ? new Date(data.lastEnd.getTime() + ref.wakeMin * 60000) : null;
  const nextTo = data.lastEnd ? new Date(data.lastEnd.getTime() + ref.wakeMax * 60000) : null;

  async function start(kind: "nap" | "night") {
    setBusy(true);
    const { error } = await supabase.from("sleep_logs").insert({ baby_id: baby!.id, kind, start_at: new Date().toISOString() });
    setBusy(false);
    if (error) toast.error(s.common.error); else { toast.success(s.home.started); invalidate(); }
  }
  async function stop() {
    if (!data?.active) return;
    setBusy(true);
    const { error } = await supabase.from("sleep_logs").update({ end_at: new Date().toISOString() }).eq("id", data.active.id);
    setBusy(false);
    if (error) toast.error(s.common.error); else { toast.success(s.home.ended); invalidate(); }
  }
  async function wakeup() {
    const { error } = await supabase.from("wakeups").insert({ baby_id: baby!.id, at: new Date().toISOString(), sleep_log_id: data?.active?.id ?? null });
    if (error) toast.error(s.common.error); else { toast.success(s.home.wakeupSaved); invalidate(); }
  }

  const elapsed = data.active ? Math.floor((now - new Date(data.active.start_at).getTime()) / 1000) : 0;
  const clock = `${String(Math.floor(elapsed / 3600)).padStart(2, "0")}:${String(Math.floor((elapsed % 3600) / 60)).padStart(2, "0")}:${String(elapsed % 60).padStart(2, "0")}`;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl sm:text-3xl">{s.home.greeting(profile?.display_name || "")}</h1>
        <p className="text-sm text-muted-foreground">{baby.name}</p>
      </div>

      <section className="card-soft overflow-hidden p-5">
        {data.active ? (
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="text-sm text-muted-foreground">{s.home.sleeping(data.active.kind === "nap" ? s.diary.nap : s.diary.night)}</p>
            <p className="font-display text-5xl tabular-nums" aria-live="off">{clock}</p>
            <div className="flex flex-wrap justify-center gap-2">
              <Button size="lg" onClick={stop} disabled={busy}><Sun className="h-5 w-5" /> {s.home.wokeUp}</Button>
              {data.active.kind === "night" && <Button size="lg" variant="lavender" onClick={wakeup}><BellRing className="h-5 w-5" /> {s.home.addWakeup}</Button>}
            </div>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <Button size="lg" variant="soft" className="h-16 text-base" onClick={() => start("nap")} disabled={busy}><Sun className="h-5 w-5" /> {s.home.startNap}</Button>
            <Button size="lg" variant="lavender" className="h-16 text-base" onClick={() => start("night")} disabled={busy}><Moon className="h-5 w-5" /> {s.home.startNight}</Button>
          </div>
        )}
      </section>

      <section aria-labelledby="sum">
        <h2 id="sum" className="mb-2 text-lg">{s.home.summary}</h2>
        <div className="grid grid-cols-3 gap-3">
          <Tile label={s.home.slept} value={formatDuration(data.slept)} tone="bg-sky text-sky-foreground" />
          <Tile label={s.home.naps} value={String(data.naps)} tone="bg-peach text-peach-foreground" />
          <Tile label={s.home.wakeups} value={String(data.wakeups)} tone="bg-lavender text-lavender-foreground" />
        </div>
      </section>

      <section className="card-soft flex items-start gap-4 p-5">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-peach text-peach-foreground"><AlarmClock className="h-5 w-5" aria-hidden /></span>
        <div>
          <h2 className="text-lg">{s.home.nextWindow}</h2>
          {nextFrom && nextTo && !data.active ? (
            <p className="font-display text-2xl tabular-nums">{hhmm(nextFrom)} – {hhmm(nextTo)}</p>
          ) : (
            <p className="text-sm text-muted-foreground">{s.home.nextWindowEmpty}</p>
          )}
          <p className="mt-1 text-xs text-muted-foreground">{s.calc.notice}</p>
        </div>
      </section>
    </div>
  );
}

function Tile({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className={`rounded-3xl p-4 ${tone}`}>
      <p className="text-xs opacity-80">{label}</p>
      <p className="font-display text-xl tabular-nums sm:text-2xl">{value}</p>
    </div>
  );
}
