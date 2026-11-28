import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthLayout } from "@/components/app/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { s } from "@/i18n/strings";

export const Route = createFileRoute("/criar-conta")({
  head: () => ({
    meta: [
      { title: "Criar conta · Doce Sonho" },
      { name: "description", content: "Crie sua conta no Doce Sonho." },
      { property: "og:title", content: "Criar conta · Doce Sonho" },
      { property: "og:description", content: "Crie sua conta no Doce Sonho." },
    ],
  }),
  component: CriarConta,
});

function CriarConta() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const requestedPlan = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("plano") : null;
  const planQuery = requestedPlan === "mensal" || requestedPlan === "anual" ? `?plano=${requestedPlan}` : "";
  const destination = `/app/conta${planQuery}`;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (password.length < 8) { setErr(s.auth.passwordHint); return; }
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: { emailRedirectTo: `${window.location.origin}${destination}`, data: { display_name: name.trim() } },
    });
    setBusy(false);
    if (error) { setErr(error.message); return; }
    if (data.session) window.location.assign(destination);
    else setDone(true);
  }

  return (
    <AuthLayout title={s.auth.signupTitle} subtitle={s.auth.signupSubtitle}>
      {done ? (
        <div className="space-y-4">
          <p role="status" className="rounded-xl bg-sky p-4 text-sm text-sky-foreground">{s.auth.checkEmail}</p>
          <Button asChild className="w-full"><a href={`/entrar${planQuery}`}>{s.auth.loginCta}</a></Button>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">{s.auth.name}</Label>
            <Input id="name" required maxLength={60} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">{s.auth.email}</Label>
            <Input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">{s.auth.password}</Label>
            <Input id="password" type="password" required minLength={8} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} aria-describedby="pw-hint" />
            <p id="pw-hint" className="text-xs text-muted-foreground">{s.auth.passwordHint}</p>
          </div>
          {err && <p role="alert" className="text-sm text-destructive">{err}</p>}
          <Button type="submit" className="w-full" disabled={busy}>{busy ? s.common.loading : s.auth.signupCta}</Button>
          <p className="text-center text-sm text-muted-foreground">
            {s.auth.haveAccount} <a href={`/entrar${planQuery}`} className="font-semibold text-primary-strong hover:underline">{s.auth.loginCta}</a>
          </p>
        </form>
      )}
    </AuthLayout>
  );
}
