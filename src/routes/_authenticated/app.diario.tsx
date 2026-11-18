import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { BellRing, Moon, Pencil, Plus, Sun, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { localDayKey, toLocalInput, useAppData, type SleepLog, type Wakeup } from "@/lib/app-data";
import { useInvalidateLogs, useLogs } from "@/lib/logs";
import { formatDuration } from "@/lib/sleep";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Empty, ErrorState, Loading, PageTitle } from "@/components/app/States";
import { s } from "@/i18n/strings";

export const Route = createFileRoute("/_authenticated/app/diario")({
  head: () => ({ meta: [{ title: "Diário do sono · Doce Sonho" }] }),
  component: Diario,
});

type Item = { type: "log"; at: Date; log: SleepLog } | { type: "wake"; at: Date; w: Wakeup };

function Diario() {
  const { baby, premium } = useAppData();
  const q = useLogs(baby?.id, null);
  const invalidate = useInvalidateLogs();
  const [editing, setEditing] = useState<SleepLog | "new" | null>(null);
  const [wakeOpen, setWakeOpen] = useState<Wakeup | "new" | null>(null);
  const [toDelete, setToDelete] = useState<Item | null>(null);

  const groups = useMemo(() => {
    if (!q.data) return [];
    const items: Item[] = [
      ...q.data.logs.map((log) => ({ type: "log" as const, at: new Date(log.start_at), log })),
      ...q.data.wakeups.map((w) => ({ type: "wake" as const, at: new Date(w.at), w })),
    ].sort((a, b) => b.at.getTime() - a.at.getTime());
    const map = new Map<string, Item[]>();
    for (const it of items) {
      const k = localDayKey(it.at);
      map.set(k, [...(map.get(k) ?? []), it]);
    }
    return [...map.entries()];
  }, [q.data]);

  async function confirmDelete() {
    if (!toDelete) return;
    const res = toDelete.type === "log"
      ? await supabase.from("sleep_logs").delete().eq("id", toDelete.log.id)
      : await supabase.from("wakeups").delete().eq("id", toDelete.w.id);
    setToDelete(null);
    if (res.error) toast.error(s.common.error); else { toast.success(s.common.deleted); invalidate(); }
  }

  return (
    <div>
      <PageTitle title={s.diary.title} action={
        <div className="flex gap-2">
          <Button variant="lavender" onClick={() => setWakeOpen("new")}><BellRing /> {s.diary.newWakeup}</Button>
          <Button onClick={() => setEditing("new")}><Plus /> {s.diary.newLog}</Button>
        </div>
      } />
      {!premium && <p className="mb-4 rounded-2xl bg-peach p-3 text-sm text-peach-foreground">{s.diary.freeLimit}</p>}
      {q.isLoading ? <Loading /> : q.isError ? <ErrorState onRetry={() => q.refetch()} /> : groups.length === 0 ? <Empty>{s.diary.empty}</Empty> : (
        <div className="space-y-5">
          {groups.map(([day, items]) => (
            <section key={day}>
              <h2 className="mb-2 text-sm font-semibold capitalize text-muted-foreground">
                {new Date(day + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })}
              </h2>
              <ul className="card-soft divide-y">
                {items.map((it) => (
                  <li key={it.type === "log" ? it.log.id : it.w.id} className="flex items-start gap-3 p-4">
                    {it.type === "log" ? <LogRow log={it.log} /> : <WakeRow w={it.w} />}
                    <div className="ml-auto flex shrink-0 gap-1">
                      <Button size="icon" variant="ghost" aria-label={s.common.edit} onClick={() => it.type === "log" ? setEditing(it.log) : setWakeOpen(it.w)}><Pencil /></Button>
                      <Button size="icon" variant="ghost" aria-label={s.common.delete} onClick={() => setToDelete(it)}><Trash2 /></Button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      {editing && baby && <LogDialog babyId={baby.id} log={editing === "new" ? null : editing} onClose={() => setEditing(null)} onSaved={invalidate} />}
      {wakeOpen && baby && <WakeDialog babyId={baby.id} w={wakeOpen === "new" ? null : wakeOpen} onClose={() => setWakeOpen(null)} onSaved={invalidate} />}

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{s.common.confirmDelete}</AlertDialogTitle>
            <AlertDialogDescription>{s.common.confirmDeleteDesc}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{s.common.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>{s.common.delete}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

const t = (d: string) => new Date(d).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

function LogRow({ log }: { log: SleepLog }) {
  const dur = log.end_at ? (new Date(log.end_at).getTime() - new Date(log.start_at).getTime()) / 60000 : null;
  const Icon = log.kind === "nap" ? Sun : Moon;
  return (
    <>
      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${log.kind === "nap" ? "bg-sky text-sky-foreground" : "bg-lavender text-lavender-foreground"}`}><Icon className="h-5 w-5" aria-hidden /></span>
      <div className="min-w-0 text-sm">
        <p className="font-semibold">{log.kind === "nap" ? s.diary.nap : s.diary.night} · <span className="tabular-nums">{t(log.start_at)} – {log.end_at ? t(log.end_at) : s.diary.inProgress}</span></p>
        <p className="text-muted-foreground">{[dur != null ? formatDuration(dur) : null, log.fell_asleep_how, log.mood].filter(Boolean).join(" · ")}</p>
        {log.notes && <p className="mt-1 break-words text-muted-foreground">{log.notes}</p>}
      </div>
    </>
  );
}
function WakeRow({ w }: { w: Wakeup }) {
  return (
    <>
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-peach text-peach-foreground"><BellRing className="h-5 w-5" aria-hidden /></span>
      <div className="min-w-0 text-sm">
        <p className="font-semibold">{s.diary.wakeup} · <span className="tabular-nums">{t(w.at)}</span></p>
        {w.notes && <p className="break-words text-muted-foreground">{w.notes}</p>}
      </div>
    </>
  );
}

function LogDialog({ babyId, log, onClose, onSaved }: { babyId: string; log: SleepLog | null; onClose: () => void; onSaved: () => void }) {
  const [kind, setKind] = useState(log?.kind ?? "nap");
  const [start, setStart] = useState(toLocalInput(log ? new Date(log.start_at) : new Date(Date.now() - 3600000)));
  const [end, setEnd] = useState(log ? (log.end_at ? toLocalInput(new Date(log.end_at)) : "") : toLocalInput(new Date()));
  const [how, setHow] = useState(log?.fell_asleep_how ?? "");
  const [mood, setMood] = useState(log?.mood ?? "");
  const [notes, setNotes] = useState(log?.notes ?? "");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const sd = new Date(start); const ed = end ? new Date(end) : null;
    if (ed && ed <= sd) { setErr(s.diary.endBeforeStart); return; }
    setBusy(true);
    const row = { baby_id: babyId, kind, start_at: sd.toISOString(), end_at: ed?.toISOString() ?? null, fell_asleep_how: how || null, mood: mood || null, notes: notes.trim() || null };
    const res = log ? await supabase.from("sleep_logs").update(row).eq("id", log.id) : await supabase.from("sleep_logs").insert(row);
    setBusy(false);
    if (res.error) { toast.error(s.common.error); return; }
    toast.success(s.common.saved); onSaved(); onClose();
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-3xl">
        <DialogHeader><DialogTitle>{log ? s.diary.editLog : s.diary.newLog}</DialogTitle></DialogHeader>
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label={s.diary.kind}>
            {(["nap", "night"] as const).map((k) => (
              <Button key={k} type="button" role="radio" aria-checked={kind === k} variant={kind === k ? "default" : "outline"} onClick={() => setKind(k)}>
                {k === "nap" ? s.diary.nap : s.diary.night}
              </Button>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5"><Label htmlFor="st">{s.diary.start}</Label><Input id="st" type="datetime-local" required value={start} onChange={(e) => setStart(e.target.value)} /></div>
            <div className="space-y-1.5"><Label htmlFor="en">{s.diary.end}</Label><Input id="en" type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} /></div>
          </div>
          <Choice label={s.diary.how} value={how} onChange={setHow} options={s.diary.howOptions} />
          <Choice label={s.diary.mood} value={mood} onChange={setMood} options={s.diary.moodOptions} />
          <div className="space-y-1.5"><Label htmlFor="nt">{s.diary.notes}</Label><Textarea id="nt" maxLength={1000} value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
          {err && <p role="alert" className="text-sm text-destructive">{err}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>{s.common.cancel}</Button>
            <Button type="submit" disabled={busy}>{busy ? s.common.saving : s.common.save}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Choice({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Select value={value || "_"} onValueChange={(v) => onChange(v === "_" ? "" : v)}>
        <SelectTrigger aria-label={label}><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="_">—</SelectItem>
          {options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}

function WakeDialog({ babyId, w, onClose, onSaved }: { babyId: string; w: Wakeup | null; onClose: () => void; onSaved: () => void }) {
  const [at, setAt] = useState(toLocalInput(w ? new Date(w.at) : new Date()));
  const [notes, setNotes] = useState(w?.notes ?? "");
  const [busy, setBusy] = useState(false);
  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const row = { baby_id: babyId, at: new Date(at).toISOString(), notes: notes.trim() || null };
    const res = w ? await supabase.from("wakeups").update(row).eq("id", w.id) : await supabase.from("wakeups").insert(row);
    setBusy(false);
    if (res.error) { toast.error(s.common.error); return; }
    toast.success(s.common.saved); onSaved(); onClose();
  }
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="rounded-3xl">
        <DialogHeader><DialogTitle>{s.diary.wakeup}</DialogTitle></DialogHeader>
        <form onSubmit={save} className="space-y-4">
          <div className="space-y-1.5"><Label htmlFor="wa">{s.diary.wakeupAt}</Label><Input id="wa" type="datetime-local" required value={at} onChange={(e) => setAt(e.target.value)} /></div>
          <div className="space-y-1.5"><Label htmlFor="wn">{s.diary.notes}</Label><Textarea id="wn" maxLength={1000} value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>{s.common.cancel}</Button>
            <Button type="submit" disabled={busy}>{s.common.save}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
