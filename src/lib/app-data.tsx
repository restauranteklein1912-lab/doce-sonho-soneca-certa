import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Profile = Tables<"profiles">;
export type Baby = Tables<"babies">;
export type SleepLog = Tables<"sleep_logs">;
export type Wakeup = Tables<"wakeups">;

type Ctx = {
  userId: string;
  email: string;
  profile: Profile | null;
  premium: boolean;
  babies: Baby[];
  baby: Baby | null;
  setBabyId: (id: string) => void;
  refresh: () => Promise<void>;
};

const AppDataContext = createContext<Ctx | null>(null);

export function isPremiumProfile(p: Profile | null | undefined) {
  if (!p?.is_premium) return false;
  return !p.premium_until || new Date(p.premium_until).getTime() > Date.now();
}

export function useAppDataQuery() {
  return useQuery({
    queryKey: ["app-data"],
    queryFn: async () => {
      const { data: u, error: ue } = await supabase.auth.getUser();
      if (ue || !u.user) throw ue ?? new Error("no user");
      const [p, b] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", u.user.id).maybeSingle(),
        supabase.from("babies").select("*").order("created_at"),
      ]);
      if (p.error) throw p.error;
      if (b.error) throw b.error;
      return { userId: u.user.id, email: u.user.email ?? "", profile: p.data, babies: b.data ?? [] };
    },
  });
}

export function AppDataProvider({ data, children }: { data: NonNullable<ReturnType<typeof useAppDataQuery>["data"]>; children: ReactNode }) {
  const qc = useQueryClient();
  const [babyId, setBabyIdState] = useState<string | null>(null);
  useEffect(() => {
    setBabyIdState(localStorage.getItem("ds-baby"));
  }, []);
  const setBabyId = (id: string) => {
    localStorage.setItem("ds-baby", id);
    setBabyIdState(id);
  };
  const value = useMemo<Ctx>(() => {
    const baby = data.babies.find((b) => b.id === babyId) ?? data.babies[0] ?? null;
    return {
      userId: data.userId,
      email: data.email,
      profile: data.profile,
      premium: isPremiumProfile(data.profile),
      babies: data.babies,
      baby,
      setBabyId,
      refresh: () => qc.invalidateQueries({ queryKey: ["app-data"] }),
    };
  }, [data, babyId, qc]);
  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const c = useContext(AppDataContext);
  if (!c) throw new Error("useAppData fora do provider");
  return c;
}

/** Converte Date para valor de <input type="datetime-local">. */
export function toLocalInput(d: Date) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

export function localDayKey(d: Date) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
