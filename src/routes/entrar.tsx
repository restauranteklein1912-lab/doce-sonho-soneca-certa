import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AuthLayout } from "@/components/app/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { s } from "@/i18n/strings";

export const Route = createFileRoute("/entrar")({
  head: () => ({
    meta: [
      { title: "Entrar · Doce Sonho" },
      { name: "description", content: "Acesse sua conta do Doce Sonho." },
      { property: "og:title", content: "Entrar · Doce Sonho" },
      { property: "og:description", content: "Acesse sua conta do Doce Sonho." },
    ],
  }),
  component: Entrar,
});

function Entrar() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function onLogin(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setMsg(null);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (error) { setMsg(error.message.includes("confirm") ? s.auth.checkEmail : s.auth.invalidLogin); return; }
    navigate({ to: "/app", replace: true });
  }
  async function onForgot(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    });
    setBusy(false);
    if (error) toast.error(s.common.error);
    else setMsg(s.auth.forgotSent);
  }

  if (mode === "forgot") {
    return (
      <AuthLayout title={s.auth.forgotTitle} subtitle={s.auth.forgotDesc}>
        <form onSubmit={onForgot} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">{s.auth.email}</Label>
            <Input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          {msg && <p role="status" className="rounded-xl bg-sky p-3 text-sm text-sky-foreground">{msg}</p>}
          <Button type="submit" className="w-full" disabled={busy}>{s.auth.forgotCta}</Button>
          <Button type="button" variant="ghost" className="w-full" onClick={() => { setMode("login"); setMsg(null); }}>{s.common.cancel}</Button>
        </form>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title={s.auth.loginTitle} subtitle={s.auth.loginSubtitle}>
      <form onSubmit={onLogin} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">{s.auth.email}</Label>
          <Input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">{s.auth.password}</Label>
            <button type="button" className="text-xs text-primary-strong hover:underline" onClick={() => { setMode("forgot"); setMsg(null); }}>{s.auth.forgot}</button>
          </div>
          <Input id="password" type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {msg && <p role="alert" className="text-sm text-destructive">{msg}</p>}
        <Button type="submit" className="w-full" disabled={busy}>{busy ? s.common.loading : s.auth.loginCta}</Button>
        <p className="text-center text-sm text-muted-foreground">
          {s.auth.noAccount} <Link to="/criar-conta" className="font-semibold text-primary-strong hover:underline">{s.auth.signupCta}</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
