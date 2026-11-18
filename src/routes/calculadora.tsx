import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Moon, Sun, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/app/Logo";
import { Disclaimer } from "@/components/app/Footer";
import { computeSchedule, formatHHMM, formatWindow, parseHHMM, type DaySchedule } from "@/lib/sleep";
import { s } from "@/i18n/strings";

export const Route = createFileRoute("/calculadora")({
  head: () => ({
    meta: [
      { title: "Calculadora de Janelas de Sono · Doce Sonho" },
      { name: "description", content: "Descubra janelas de vigília, sonecas e horário de dormir sugeridos para bebês de 0 a 5 anos." },
      { property: "og:title", content: "Calculadora de Janelas de Sono · Doce Sonho" },
      { property: "og:description", content: "Grátis e sem cadastro: sonecas e horário de dormir por idade." },
    ],
  }),
  component: Calculadora,
});

function Calculadora() {
  const [age, setAge] = useState("6");
  const [wake, setWake] = useState("07:00");
  const [result, setResult] = useState<DaySchedule | null>(null);
  const [email, setEmail] = useState("");
  const [leadState, setLeadState] = useState<"idle" | "busy" | "done" | "error">("idle");

  function calc(e: React.FormEvent) {
    e.preventDefault();
    const m = Math.min(60, Math.max(0, Number(age) || 0));
    setResult(computeSchedule(m, parseHHMM(wake)));
  }
  async function sendLead(e: React.FormEvent) {
    e.preventDefault();
    setLeadState("busy");
    const { error } = await supabase.from("leads").insert({
      email: email.trim().toLowerCase(),
      source: "calculadora",
      baby_age_months: Math.min(60, Math.max(0, Number(age) || 0)),
    });
    setLeadState(error ? "error" : "done");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-3xl items-center justify-between px-5 py-4">
        <Logo />
        <Button asChild variant="ghost" size="sm"><Link to="/entrar">{s.auth.loginCta}</Link></Button>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 pb-10">
        <h1 className="text-3xl sm:text-4xl">{s.calc.title}</h1>
        <p className="mt-2 text-muted-foreground">{s.calc.subtitle}</p>

        <form onSubmit={calc} className="card-soft mt-6 grid gap-4 p-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <div className="space-y-1.5">
            <Label htmlFor="age">{s.calc.age}</Label>
            <Input id="age" type="number" inputMode="numeric" min={0} max={60} required value={age} onChange={(e) => setAge(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="wake">{s.calc.wake}</Label>
            <Input id="wake" type="time" required value={wake} onChange={(e) => setWake(e.target.value)} />
          </div>
          <Button type="submit" size="lg">{s.calc.calculate}</Button>
        </form>

        {result && (
          <section aria-live="polite" className="mt-6 space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <Stat icon={<Clock className="h-5 w-5" />} tone="bg-sky text-sky-foreground" label={s.calc.window} value={formatWindow(result.ref)} />
              <Stat icon={<Sun className="h-5 w-5" />} tone="bg-peach text-peach-foreground" label={s.calc.naps} value={String(result.ref.naps)} />
              <Stat icon={<Moon className="h-5 w-5" />} tone="bg-lavender text-lavender-foreground" label={s.calc.bedtime} value={formatHHMM(result.bedtime)} />
            </div>
            <div className="card-soft p-5">
              <h2 className="text-lg">{s.calc.napTimes}</h2>
              {result.naps.length === 0 ? (
                <p className="mt-2 text-sm text-muted-foreground">{s.calc.noNaps}</p>
              ) : (
                <ol className="mt-3 divide-y">
                  {result.naps.map((n, i) => (
                    <li key={i} className="flex justify-between py-2 text-sm">
                      <span>{s.calc.napLabel(i + 1)}</span>
                      <span className="font-semibold tabular-nums">{formatHHMM(n.start)} – {formatHHMM(n.end)}</span>
                    </li>
                  ))}
                </ol>
              )}
              <p className="mt-3 text-sm text-muted-foreground">{s.calc.totalSleep}: {result.ref.totalSleep}</p>
              <p className="mt-3 rounded-xl bg-muted p-3 text-sm">{s.calc.notice}</p>
            </div>
          </section>
        )}

        <section className="card-soft mt-8 space-y-4 p-6 text-center">
          <h2 className="text-xl">{s.calc.ctaTitle}</h2>
          <p className="text-sm text-muted-foreground">{s.calc.ctaDesc}</p>
          <Button asChild size="lg"><Link to="/criar-conta">{s.auth.signupCta}</Link></Button>
          <form onSubmit={sendLead} className="mx-auto mt-4 max-w-sm space-y-2 text-left">
            <Label htmlFor="lead">{s.calc.leadLabel} <span className="text-muted-foreground">({s.common.optional})</span></Label>
            {leadState === "done" ? (
              <p role="status" className="text-sm text-primary-strong">{s.calc.leadDone}</p>
            ) : (
              <div className="flex gap-2">
                <Input id="lead" type="email" required maxLength={255} value={email} onChange={(e) => setEmail(e.target.value)} />
                <Button type="submit" variant="soft" disabled={leadState === "busy"}>{s.calc.leadCta}</Button>
              </div>
            )}
            {leadState === "error" && <p role="alert" className="text-sm text-destructive">{s.common.error}</p>}
          </form>
        </section>
      </main>
      <Disclaimer />
    </div>
  );
}

function Stat({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone: string }) {
  return (
    <div className="card-soft p-4">
      <span className={`grid h-9 w-9 place-items-center rounded-full ${tone}`} aria-hidden>{icon}</span>
      <p className="mt-3 text-xs text-muted-foreground">{label}</p>
      <p className="font-display text-2xl tabular-nums">{value}</p>
    </div>
  );
}
