/** Mapeia eventos da Hotmart para ativar/desativar o Premium. */
export const ACTIVATE_EVENTS = new Set(["PURCHASE_APPROVED", "PURCHASE_COMPLETE"]);
export const DEACTIVATE_EVENTS = new Set([
  "PURCHASE_CANCELED", "SUBSCRIPTION_CANCELLATION", "PURCHASE_REFUNDED", "PURCHASE_CHARGEBACK", "PURCHASE_PROTEST",
]);

export function premiumActionFor(event: string): "activate" | "deactivate" | null {
  const e = event.toUpperCase();
  if (ACTIVATE_EVENTS.has(e)) return "activate";
  if (DEACTIVATE_EVENTS.has(e)) return "deactivate";
  return null;
}

export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}
