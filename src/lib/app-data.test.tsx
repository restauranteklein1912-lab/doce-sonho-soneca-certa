import { describe, expect, it } from "vitest";
import { isPremiumProfile, type Profile } from "./app-data";

const profile: Profile = { id: "test", email: "test@example.com", display_name: null, created_at: "2026-01-01T00:00:00Z", is_premium: false, premium_until: null };
describe("active subscription", () => {
  it("sem assinatura não tem Premium", () => expect(isPremiumProfile(profile)).toBe(false));
  it("assinatura válida libera Premium", () => expect(isPremiumProfile({ ...profile, is_premium: true, premium_until: new Date(Date.now() + 60000).toISOString() })).toBe(true));
  it("assinatura expirada não libera Premium", () => expect(isPremiumProfile({ ...profile, is_premium: true, premium_until: new Date(Date.now() - 60000).toISOString() })).toBe(false));
});