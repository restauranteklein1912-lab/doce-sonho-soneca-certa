import { describe, expect, it } from "vitest";
import { computeSchedule, formatHHMM, refForAge, ageInMonths } from "./sleep";

describe("calculadora de janelas de sono", () => {
  it("bebê de 6 meses que acordou às 07:00 tem 3 sonecas e dorme às 20:30", () => {
    const s = computeSchedule(6, 7 * 60);
    expect(s.naps).toHaveLength(3);
    expect(formatHHMM(s.naps[0]!.start)).toBe("09:00");
    expect(formatHHMM(s.bedtime)).toBe("20:30");
  });
  it("limita a idade entre 0 e 60 meses", () => {
    expect(refForAge(80).minMonth).toBe(48);
    expect(refForAge(-3).minMonth).toBe(0);
  });
  it("crianças de 4 anos não têm sonecas previstas", () => {
    expect(computeSchedule(50, 7 * 60).naps).toHaveLength(0);
  });
  it("calcula idade em meses completos", () => {
    expect(ageInMonths("2026-01-20", new Date("2026-11-18T12:00:00"))).toBe(9);
  });
});
