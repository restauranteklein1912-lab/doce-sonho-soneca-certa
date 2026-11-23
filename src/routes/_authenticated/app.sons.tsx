import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { CloudRain, Pause, Play, Waves, Wind, AudioLines, Bluetooth } from "lucide-react";
import { toast } from "sonner";
import { SoundPlayer, type SoundId } from "@/lib/sounds";
import { useAppData } from "@/lib/app-data";
import { FREE_LIMITS } from "@/config";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageTitle } from "@/components/app/States";
import { Paywall, PremiumBadge } from "@/components/app/Paywall";
import { s } from "@/i18n/strings";

export const Route = createFileRoute("/_authenticated/app/sons")({
  head: () => ({ meta: [{ title: "Sons relaxantes · Doce Sonho" }] }),
  component: Sons,
});

const SOUNDS: { id: SoundId; label: string; icon: typeof Wind; tone: string }[] = [
  { id: "white", label: s.sounds.white, icon: AudioLines, tone: "bg-sky text-sky-foreground" },
  { id: "pink", label: s.sounds.pink, icon: Wind, tone: "bg-peach text-peach-foreground" },
  { id: "rain", label: s.sounds.rain, icon: CloudRain, tone: "bg-lavender text-lavender-foreground" },
  { id: "ocean", label: s.sounds.ocean, icon: Waves, tone: "bg-sky text-sky-foreground" },
];

function Sons() {
  const { premium } = useAppData();
  const player = useRef<SoundPlayer | null>(null);
  const [playing, setPlaying] = useState<SoundId | null>(null);
  const [volume, setVolume] = useState(0.4);
  const [timer, setTimer] = useState("30");
  const [endsAt, setEndsAt] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => () => player.current?.dispose(), []);
  useEffect(() => {
    if (!endsAt) return;
    const t = setInterval(() => {
      setNow(Date.now());
      if (Date.now() >= endsAt) { player.current?.stop(); setPlaying(null); setEndsAt(null); }
    }, 1000);
    return () => clearInterval(t);
  }, [endsAt]);

  async function toggle(id: SoundId) {
    if (!premium && !FREE_LIMITS.sounds.includes(id)) { setShowPaywall(true); return; }
    player.current = player.current ?? new SoundPlayer();
    if (playing === id) { player.current.stop(); setPlaying(null); setEndsAt(null); return; }
    // Atualiza a interface imediatamente; a reprodução pode demorar a confirmar no Safari/iOS.
    setPlaying(id);
    setEndsAt(timer === "0" ? null : Date.now() + Number(timer) * 60000);
    try {
      await player.current.play(id, volume);
    } catch {
      player.current.stop();
      setPlaying(null);
      setEndsAt(null);
      toast.error("Não foi possível reproduzir o som. Toque novamente e confira o volume do aparelho.");
    }
  }

  const remaining = endsAt ? Math.max(0, Math.ceil((endsAt - now) / 1000)) : 0;
  const rem = `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, "0")}`;

  return (
    <div>
      <PageTitle title={s.sounds.title} subtitle={s.sounds.subtitle} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {SOUNDS.map((snd) => {
          const locked = !premium && !FREE_LIMITS.sounds.includes(snd.id);
          const active = playing === snd.id;
          return (
            <button key={snd.id} onClick={() => toggle(snd.id)} aria-pressed={active}
              className={`card-soft flex flex-col items-center gap-3 p-5 text-center transition-transform active:scale-95 ${active ? "ring-2 ring-ring" : ""}`}>
              <span className={`grid h-14 w-14 place-items-center rounded-full ${snd.tone}`}><snd.icon className="h-7 w-7" aria-hidden /></span>
              <span className="font-semibold">{snd.label}</span>
              {locked ? <PremiumBadge /> : (
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  {active ? <><Pause className="h-3 w-3" aria-hidden /> {s.sounds.stop}</> : <><Play className="h-3 w-3" aria-hidden /> {s.sounds.play}</>}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <section className="card-soft mt-5 grid gap-5 p-5 sm:grid-cols-2">
        <div className="space-y-3">
          <p id="vol" className="text-sm font-semibold">{s.sounds.volume}</p>
          <Slider aria-labelledby="vol" min={0} max={1} step={0.05} value={[volume]} onValueChange={([v = 0]) => { setVolume(v); player.current?.setVolume(v); }} />
        </div>
        <div className="space-y-2">
          <p id="tm" className="text-sm font-semibold">{s.sounds.timer}</p>
          <Select value={timer} onValueChange={(v) => { setTimer(v); if (playing) setEndsAt(v === "0" ? null : Date.now() + Number(v) * 60000); }}>
            <SelectTrigger aria-labelledby="tm"><SelectValue /></SelectTrigger>
            <SelectContent>
              {["15", "30", "45", "60", "90"].map((m) => <SelectItem key={m} value={m}>{m} min</SelectItem>)}
              <SelectItem value="0">{s.sounds.timerOff}</SelectItem>
            </SelectContent>
          </Select>
          {playing && endsAt && <p className="text-sm text-muted-foreground tabular-nums" aria-live="off">{s.sounds.remaining(rem)}</p>}
        </div>
      </section>
      <section className="card-soft mt-5 flex items-start gap-3 p-4">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-sky text-sky-foreground"><Bluetooth className="h-5 w-5" aria-hidden /></span>
        <div>
          <h2 className="font-semibold">Ouvir em uma caixinha Bluetooth</h2>
          <p className="mt-1 text-sm text-muted-foreground">Conecte a caixinha Bluetooth nas configurações de Bluetooth do celular antes de iniciar o som. O Doce Sonho usará automaticamente a saída de áudio selecionada pelo aparelho. Não é necessário parear dentro do aplicativo.</p>
        </div>
      </section>
      {showPaywall && <div className="mt-5"><Paywall compact /></div>}
      {playing && <Button variant="outline" className="mt-4" onClick={() => toggle(playing)}>{s.sounds.stop}</Button>}
    </div>
  );
}
