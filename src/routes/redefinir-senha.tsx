import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AuthLayout } from "@/components/app/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { s } from "@/i18n/strings";

export const Route = createFileRoute("/redefinir-senha")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Redefinir senha · Doce Sonho" },
      { name: "description", content: "Crie uma nova senha para sua conta do Doce Sonho." },
      { property: "og:title", content: "Redefinir senha · Doce Sonho" },
      { property: "og:description", content: "Crie uma nova senha." },
    ],
  }),
  component: Redefinir,
});

function Redefinir() {
  const navigate = useNavigate();
  const [ready, setReady] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    const t = setTimeout(async () => {
      const { data: d } = await supabase.auth.getSession();
      setReady((r) => r ?? !!d.session);
    }, 800);
    return () => { data.subscription.unsubscribe(); clearTimeout(t); };
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) { setErr(s.auth.passwordHint); return; }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) { setErr(error.message); return; }
    toast.success(s.auth.resetDone);
    navigate({ to: "/app", replace: true });
  }

  return (
    <AuthLayout title={s.auth.resetTitle}>
      {ready === false ? (
        <p role="alert" className="text-sm text-destructive">{s.auth.resetInvalid}</p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="pw">{s.auth.newPassword}</Label>
            <Input id="pw" type="password" required minLength={8} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <p className="text-xs text-muted-foreground">{s.auth.passwordHint}</p>
          </div>
          {err && <p role="alert" className="text-sm text-destructive">{err}</p>}
          <Button type="submit" className="w-full" disabled={busy || !ready}>{s.auth.resetCta}</Button>
        </form>
      )}
    </AuthLayout>
  );
}
