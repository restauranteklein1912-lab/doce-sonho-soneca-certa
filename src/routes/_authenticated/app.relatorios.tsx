import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import { useAppData } from "@/lib/app-data";
import { localDayKey } from "@/lib/app-data";
import { useLogs } from "@/lib/logs";
import { formatHHMM, overlapMinutes } from "@/lib/sleep";
import { Button } from "@/components/ui/button";
import { Empty, ErrorState, Loading, PageTitle } from "@/components/app/States";
import { Paywall, PremiumBadge } from "@/components/app/Paywall";
import { s } from "@/i18n/strings";

export const Route = createFileRoute("/_authenticated/app/relatorios")({
  head: () => ({ meta: [{ title: "Relatórios · Doce Sonho" }] }),
  component: Relatorios,
});

function Relatorios() {
  const { baby, premium } = useAppData();
  const [days, setDays] = useState<7 | 30>(7);
  const q = useLogs(baby?.id, 31);

  const stats = useMemo(() => {
    if (!q.data) return null;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const rows = [];
    let napTotal = 0;
    for (let i = days - 1; i >= 0; i--) {
      const d0 = today.getTime() - i * 86400000, d1 = d0 + 86400000;
      let nap = 0, night = 0;
      for (const l of q.data.logs) {
        if (!l.end_at) continue;
        const m = overlapMinutes(new Date(l.start_at).getTime(), new Date(l.end_at).getTime(), d0, d1);
        if (l.kind === "nap") nap += m; else night += m;
        const st = new Date(l.start_at).getTime();
        if (l.kind === "nap" && st >= d0 && st < d1) napTotal++;
      }
      rows.push({ day: new Date(d0).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }), [s.reports.napsLegend]: +(nap / 60).toFixed(1), [s.reports.nightLegend]: +(night / 60).toFixed(1) });
    }
    const since = today.getTime() - (days - 1) * 86400000;
    const nights = q.data.logs.filter((l) => l.kind === "night" && new Date(l.start_at).getTime() >= since);
    const mins = (d: Date) => d.getHours() * 60 + d.getMinutes();
    const bed = nights.map((l) => { const m = mins(new Date(l.start_at)); return m < 12 * 60 ? m + 1440 : m; });
    const wake = nights.filter((l) => l.end_at).map((l) => mins(new Date(l.end_at!)));
    const avg = (a: number[]) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : null);
    const wakeups = q.data.wakeups.filter((w) => new Date(w.at).getTime() >= since);
    const nightDays = new Set(nights.map((l) => localDayKey(new Date(l.start_at)))).size;
    const hasData = q.data.logs.some((l) => new Date(l.start_at).getTime() >= since);
    return {
      rows, hasData,
      avgNaps: (napTotal / days).toFixed(1),
      avgBed: avg(bed), avgWake: avg(wake),
      avgWakeups: nightDays ? (wakeups.length / nightDays).toFixed(1) : "0",
    };
  }, [q.data, days]);

  const locked = days === 30 && !premium;

  return (
    <div>
      <PageTitle title={s.reports.title} action={
        <div className="flex gap-1 rounded-full bg-muted p-1" role="tablist">
          {([7, 30] as const).map((d) => (
            <Button key={d} role="tab" aria-selected={days === d} size="sm" variant={days === d ? "default" : "ghost"} onClick={() => setDays(d)}>
              {d === 7 ? s.reports.last7 : s.reports.last30} {d === 30 && !premium && <PremiumBadge />}
            </Button>
          ))}
        </div>
      } />
      {locked ? <Paywall /> : q.isLoading ? <Loading /> : q.isError || !stats ? <ErrorState onRetry={() => q.refetch()} /> : !stats.hasData ? <Empty>{s.reports.empty}</Empty> : (
        <div className="space-y-4">
          <section className="card-soft p-4">
            <h2 className="mb-3 text-lg">{s.reports.hoursPerDay}</h2>
            <div className="h-64 w-full">
              <ResponsiveContainer>
                <BarChart data={stats.rows} margin={{ left: -20, right: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} interval={days === 30 ? 4 : 0} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
                  <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey={s.reports.nightLegend} stackId="a" fill="var(--color-chart-3)" radius={[0, 0, 6, 6]} />
                  <Bar dataKey={s.reports.napsLegend} stackId="a" fill="var(--color-chart-1)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Metric label={s.reports.avgNaps} value={stats.avgNaps} />
            <Metric label={s.reports.avgBedtime} value={stats.avgBed != null ? formatHHMM(stats.avgBed) : "—"} />
            <Metric label={s.reports.avgWake} value={stats.avgWake != null ? formatHHMM(stats.avgWake) : "—"} />
            <Metric label={s.reports.avgWakeups} value={stats.avgWakeups} />
          </div>
        </div>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="card-soft p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-display text-2xl tabular-nums">{value}</p>
    </div>
  );
}
