import { describe, expect, it } from "vitest";
import { premiumActionFor, safeEqual } from "./hotmart";

describe("eventos da Hotmart", () => {
  it("compra aprovada ativa o Premium", () => expect(premiumActionFor("PURCHASE_APPROVED")).toBe("activate"));
  it("assinatura cancelada desativa", () => expect(premiumActionFor("SUBSCRIPTION_CANCELLATION")).toBe("deactivate"));
  it("reembolso desativa", () => expect(premiumActionFor("PURCHASE_REFUNDED")).toBe("deactivate"));
  it("chargeback desativa", () => expect(premiumActionFor("PURCHASE_CHARGEBACK")).toBe("deactivate"));
  it("outros eventos são ignorados", () => expect(premiumActionFor("PURCHASE_BILLET_PRINTED")).toBeNull());
  it("token diferente é rejeitado", () => expect(safeEqual("abc", "abd")).toBe(false));
});
