import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { s } from "@/i18n/strings";

export function BabyForm({ onDone }: { onDone: (id: string) => void }) {
  const [name, setName] = useState("");
  const [birth, setBirth] = useState("");
  const [busy, setBusy] = useState(false);
  const today = new Date().toISOString().slice(0, 10);
  const min = new Date(Date.now() - 6 * 365 * 86400000).toISOString().slice(0, 10);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { data, error } = await supabase.from("babies").insert({ name: name.trim(), birth_date: birth }).select("id").single();
    setBusy(false);
    if (error) { toast.error(error.message.includes("FREE_BABY_LIMIT") ? s.onboarding.limit : s.common.error); return; }
    setName(""); setBirth("");
    onDone(data.id);
  }
  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="baby-name">{s.onboarding.babyName}</Label>
        <Input id="baby-name" required maxLength={60} value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="baby-birth">{s.onboarding.birthDate}</Label>
        <Input id="baby-birth" type="date" required min={min} max={today} value={birth} onChange={(e) => setBirth(e.target.value)} />
      </div>
      <Button type="submit" className="w-full" disabled={busy}>{busy ? s.common.saving : s.onboarding.cta}</Button>
    </form>
  );
}
