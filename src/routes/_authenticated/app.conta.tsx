import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Crown, LogOut, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAppData } from "@/lib/app-data";
import { deleteMyAccount } from "@/lib/account.functions";
import { applyStoredTheme, setTheme } from "@/lib/theme";
import { ageLabel } from "@/lib/sleep";
import { CHECKOUT_URL } from "@/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { BabyForm } from "@/components/app/BabyForm";
import { PageTitle } from "@/components/app/States";
import { s } from "@/i18n/strings";

export const Route = createFileRoute("/_authenticated/app/conta")({
  head: () => ({ meta: [{ title: "Conta · Doce Sonho" }] }),
  component: Conta,
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="card-soft space-y-4 p-5"><h2 className="text-lg">{title}</h2>{children}</section>;
}

function Conta() {
  const { profile, email, premium, babies, refresh, setBabyId } = useAppData();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const del = useServerFn(deleteMyAccount);
  const [name, setName] = useState(profile?.display_name ?? "");
  const [cur, setCur] = useState("");
  const [pw, setPw] = useState("");
  const [dark, setDark] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [removeId, setRemoveId] = useState<string | null>(null);
  const [confirmDel, setConfirmDel] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => { setDark(applyStoredTheme()); }, []);

  async function saveName(e: React.FormEvent) {
    e.preventDefault();
    setBusy("name");
    const { error } = await supabase.from("profiles").update({ display_name: name.trim().slice(0, 60) }).eq("id", profile!.id);
    setBusy(null);
    if (error) toast.error(s.common.error); else { toast.success(s.common.saved); refresh(); }
  }
  async function changePw(e: React.FormEvent) {
    e.preventDefault();
    if (pw.length < 8) { toast.error(s.auth.passwordHint); return; }
    setBusy("pw");
    const check = await supabase.auth.signInWithPassword({ email, password: cur });
    if (check.error) { setBusy(null); toast.error(s.account.wrongPassword); return; }
    const { error } = await supabase.auth.updateUser({ password: pw });
    setBusy(null);
    if (error) toast.error(error.message); else { toast.success(s.account.passwordChanged); setCur(""); setPw(""); }
  }
  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/entrar", replace: true });
  }
  async function removeBaby() {
    if (!removeId) return;
    const { error } = await supabase.from("babies").delete().eq("id", removeId);
    setRemoveId(null);
    if (error) toast.error(s.common.error); else { toast.success(s.common.deleted); refresh(); }
  }
  async function deleteAccount() {
    setBusy("del");
    try {
      await del();
      qc.clear();
      await supabase.auth.signOut();
      navigate({ to: "/entrar", replace: true });
    } catch {
      setBusy(null);
      toast.error(s.common.error);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <PageTitle title={s.account.title} subtitle={email} />

      <Section title={s.account.plan}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className={`grid h-11 w-11 place-items-center rounded-full ${premium ? "bg-peach text-peach-foreground" : "bg-muted text-muted-foreground"}`}><Crown className="h-5 w-5" aria-hidden /></span>
            <div>
              <p className="font-semibold">{premium ? s.account.premium : s.account.free}</p>
              {premium && profile?.premium_until && <p className="text-xs text-muted-foreground">{s.account.premiumUntil(new Date(profile.premium_until).toLocaleDateString("pt-BR"))}</p>}
            </div>
          </div>
          {!premium && <Button asChild><a href={CHECKOUT_URL} target="_blank" rel="noopener noreferrer">{s.paywall.cta}</a></Button>}
        </div>
      </Section>

      <Section title={s.account.babies}>
        <ul className="divide-y">
          {babies.map((b) => (
            <li key={b.id} className="flex items-center justify-between py-2 text-sm">
              <span><span className="font-semibold">{b.name}</span> <span className="text-muted-foreground">· {ageLabel(b.birth_date)}</span></span>
              <Button size="icon" variant="ghost" aria-label={`${s.account.removeBaby}: ${b.name}`} onClick={() => setRemoveId(b.id)}><Trash2 /></Button>
            </li>
          ))}
        </ul>
        {premium || babies.length < 1 ? (
          <Button variant="soft" onClick={() => setAddOpen(true)}><Plus /> {s.onboarding.addBaby}</Button>
        ) : <p className="text-xs text-muted-foreground">{s.onboarding.limit}</p>}
      </Section>

      <Section title={s.account.profile}>
        <form onSubmit={saveName} className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-1.5"><Label htmlFor="dn">{s.account.displayName}</Label><Input id="dn" maxLength={60} value={name} onChange={(e) => setName(e.target.value)} /></div>
          <Button type="submit" disabled={busy === "name"}>{s.common.save}</Button>
        </form>
        <div className="flex items-center justify-between">
          <Label htmlFor="dark">{s.common.darkMode}</Label>
          <Switch id="dark" checked={dark} onCheckedChange={(v) => { setDark(v); setTheme(v); }} />
        </div>
      </Section>

      <Section title={s.account.changePassword}>
        <form onSubmit={changePw} className="space-y-3">
          <div className="space-y-1.5"><Label htmlFor="cp">{s.auth.currentPassword}</Label><Input id="cp" type="password" required autoComplete="current-password" value={cur} onChange={(e) => setCur(e.target.value)} /></div>
          <div className="space-y-1.5"><Label htmlFor="np">{s.auth.newPassword}</Label><Input id="np" type="password" required minLength={8} autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} /></div>
          <Button type="submit" disabled={busy === "pw"}>{s.common.save}</Button>
        </form>
      </Section>

      <div className="flex flex-wrap justify-between gap-2 pt-2">
        <Button variant="outline" onClick={signOut}><LogOut /> {s.account.signOut}</Button>
        <Button variant="ghost" className="text-destructive" onClick={() => setConfirmDel(true)}>{s.account.deleteAccount}</Button>
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="rounded-3xl">
          <DialogHeader><DialogTitle>{s.onboarding.addBaby}</DialogTitle></DialogHeader>
          <BabyForm onDone={async (id) => { setAddOpen(false); setBabyId(id); await refresh(); }} />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!removeId} onOpenChange={(o) => !o && setRemoveId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>{s.account.removeBaby}</AlertDialogTitle><AlertDialogDescription>{s.account.removeBabyDesc}</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>{s.common.cancel}</AlertDialogCancel><AlertDialogAction onClick={removeBaby}>{s.common.delete}</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmDel} onOpenChange={setConfirmDel}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>{s.account.deleteAccount}</AlertDialogTitle><AlertDialogDescription>{s.account.deleteDesc}</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{s.common.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={(e) => { e.preventDefault(); deleteAccount(); }} disabled={busy === "del"}>{s.account.deleteConfirm}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
