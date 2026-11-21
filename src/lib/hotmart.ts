/** Mapeia eventos da Hotmart para ativar/desativar o Premium. */
export const ACTIVATE_EVENTS = new Set(["PURCHASE_APPROVED", "PURCHASE_COMPLETE"]);

// Cancelar a renovação não deve cortar um período já pago.
// Acesso é revogado apenas em reembolso, chargeback, protesto ou expiração.
export const DEACTIVATE_EVENTS = new Set([
  "PURCHASE_REFUNDED",
  "PURCHASE_CHARGEBACK",
  "PURCHASE_PROTEST",
  "PURCHASE_EXPIRED",
]);

export function premiumActionFor(event: string): "activate" | "deactivate" | null {
  const e = event.toUpperCase();
  if (ACTIVATE_EVENTS.has(e)) return "activate";
  if (DEACTIVATE_EVENTS.has(e)) return "deactivate";
  return null;
}

export function premiumDaysForOffer(offerCode?: string): number {
  // Códigos públicos das ofertas configuradas no checkout da Doce Sonho.
  if (offerCode === "gjv109ka") return 370; // anual: 365 dias + margem técnica
  return 35; // mensal: 30 dias + margem técnica
}

export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}
