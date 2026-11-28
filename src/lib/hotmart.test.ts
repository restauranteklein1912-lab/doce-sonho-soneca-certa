import { describe, expect, it } from "vitest";
import { premiumActionFor, premiumDaysForOffer, safeEqual } from "./hotmart";

describe("eventos da Hotmart", () => {
  it("compra aprovada ativa o Premium", () => expect(premiumActionFor("PURCHASE_APPROVED")).toBe("activate"));
  it("cancelar renovação preserva o período pago", () => expect(premiumActionFor("SUBSCRIPTION_CANCELLATION")).toBeNull());
  it("reembolso desativa", () => expect(premiumActionFor("PURCHASE_REFUNDED")).toBe("deactivate"));
  it("chargeback desativa", () => expect(premiumActionFor("PURCHASE_CHARGEBACK")).toBe("deactivate"));
  it("outros eventos são ignorados", () => expect(premiumActionFor("PURCHASE_BILLET_PRINTED")).toBeNull());
  it("token diferente é rejeitado", () => expect(safeEqual("abc", "abd")).toBe(false));
  it("mensal i1qgmmj1 mantém 35 dias", () => expect(premiumDaysForOffer("i1qgmmj1")).toBe(35));
  it("anual gjv109ka mantém 370 dias", () => expect(premiumDaysForOffer("gjv109ka")).toBe(370));
  it("oferta desconhecida não concede dias", () => expect(premiumDaysForOffer("unknown")).toBeNull());
});
