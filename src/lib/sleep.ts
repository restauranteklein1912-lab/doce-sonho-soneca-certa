/** Tabela de referência por faixa etária (médias; cada bebê é único). */
export type AgeRef = {
  minMonth: number;
  maxMonth: number;
  wakeMin: number; // minutos
  wakeMax: number;
  naps: number;
  napLength: number; // minutos
  totalSleep: string;
};

export const SLEEP_REFERENCE: AgeRef[] = [
  { minMonth: 0, maxMonth: 1, wakeMin: 35, wakeMax: 60, naps: 5, napLength: 50, totalSleep: "14–17 h" },
  { minMonth: 2, maxMonth: 3, wakeMin: 60, wakeMax: 90, naps: 4, napLength: 60, totalSleep: "14–17 h" },
  { minMonth: 4, maxMonth: 5, wakeMin: 90, wakeMax: 135, naps: 3, napLength: 75, totalSleep: "12–16 h" },
  { minMonth: 6, maxMonth: 8, wakeMin: 120, wakeMax: 180, naps: 3, napLength: 70, totalSleep: "12–16 h" },
  { minMonth: 9, maxMonth: 11, wakeMin: 150, wakeMax: 210, naps: 2, napLength: 90, totalSleep: "12–15 h" },
  { minMonth: 12, maxMonth: 14, wakeMin: 180, wakeMax: 240, naps: 2, napLength: 75, totalSleep: "11–14 h" },
  { minMonth: 15, maxMonth: 23, wakeMin: 240, wakeMax: 330, naps: 1, napLength: 120, totalSleep: "11–14 h" },
  { minMonth: 24, maxMonth: 35, wakeMin: 300, wakeMax: 360, naps: 1, napLength: 100, totalSleep: "11–14 h" },
  { minMonth: 36, maxMonth: 47, wakeMin: 330, wakeMax: 420, naps: 1, napLength: 60, totalSleep: "10–13 h" },
  { minMonth: 48, maxMonth: 60, wakeMin: 720, wakeMax: 780, naps: 0, napLength: 0, totalSleep: "10–13 h" },
];

export function refForAge(months: number): AgeRef {
  const m = Math.max(0, Math.min(60, Math.floor(months)));
  return SLEEP_REFERENCE.find((r) => m >= r.minMonth && m <= r.maxMonth) ?? SLEEP_REFERENCE[0]!;
}

export type DaySchedule = {
  ref: AgeRef;
  naps: { start: number; end: number }[]; // minutos desde 00:00 (podem passar de 1440)
  bedtime: number;
};

/** Calcula sonecas e horário de dormir: 1ª janela curta, intermediárias médias, última longa. */
export function computeSchedule(months: number, wakeMinutes: number): DaySchedule {
  const ref = refForAge(months);
  const avg = Math.round((ref.wakeMin + ref.wakeMax) / 2);
  const naps: { start: number; end: number }[] = [];
  let cur = wakeMinutes;
  for (let i = 0; i < ref.naps; i++) {
    const win = i === 0 ? ref.wakeMin : avg;
    const start = cur + win;
    const end = start + ref.napLength;
    naps.push({ start, end });
    cur = end;
  }
  return { ref, naps, bedtime: cur + ref.wakeMax };
}

export function parseHHMM(v: string): number {
  const [h, m] = v.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

export function formatHHMM(mins: number): string {
  const t = ((Math.round(mins) % 1440) + 1440) % 1440;
  return `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
}

export function formatDuration(mins: number): string {
  const m = Math.max(0, Math.round(mins));
  const h = Math.floor(m / 60);
  const r = m % 60;
  if (h === 0) return `${r} min`;
  return r === 0 ? `${h} h` : `${h} h ${r} min`;
}

export function formatWindow(ref: AgeRef): string {
  return `${formatDuration(ref.wakeMin)} – ${formatDuration(ref.wakeMax)}`;
}

export function ageInMonths(birth: string | Date, now = new Date()): number {
  const b = typeof birth === "string" ? new Date(birth + "T00:00:00") : birth;
  let m = (now.getFullYear() - b.getFullYear()) * 12 + (now.getMonth() - b.getMonth());
  if (now.getDate() < b.getDate()) m -= 1;
  return Math.max(0, m);
}

export function ageLabel(birth: string): string {
  const m = ageInMonths(birth);
  if (m < 1) {
    const days = Math.max(0, Math.floor((Date.now() - new Date(birth + "T00:00:00").getTime()) / 86400000));
    return days === 1 ? "1 dia" : `${days} dias`;
  }
  if (m < 24) return m === 1 ? "1 mês" : `${m} meses`;
  const y = Math.floor(m / 12);
  const r = m % 12;
  return r ? `${y} anos e ${r} ${r === 1 ? "mês" : "meses"}` : `${y} anos`;
}

/** Minutos de sobreposição entre [a1,a2] e [b1,b2] (datas em ms). */
export function overlapMinutes(a1: number, a2: number, b1: number, b2: number): number {
  return Math.max(0, Math.min(a2, b2) - Math.max(a1, b1)) / 60000;
}

/** Rotina diária sugerida por idade. */
export function suggestedRoutine(months: number, labels: { wake: string; nap: (n: number) => string; meal: string; milk: string; bath: string; bed: string }) {
  const wake = 7 * 60;
  const sch = computeSchedule(months, wake);
  const items: { time: string; label: string }[] = [{ time: formatHHMM(wake), label: labels.wake }];
  sch.naps.forEach((n, i) => items.push({ time: formatHHMM(n.start), label: labels.nap(i + 1) }));
  if (months < 6) {
    for (let t = wake + 30; t < sch.bedtime; t += 180) items.push({ time: formatHHMM(t), label: labels.milk });
  } else {
    [8 * 60, 12 * 60, 15 * 60 + 30, 18 * 60 + 30].forEach((t) => items.push({ time: formatHHMM(t), label: labels.meal }));
  }
  items.push({ time: formatHHMM(sch.bedtime - 45), label: labels.bath });
  items.push({ time: formatHHMM(sch.bedtime), label: labels.bed });
  return items.sort((a, b) => a.time.localeCompare(b.time));
}
