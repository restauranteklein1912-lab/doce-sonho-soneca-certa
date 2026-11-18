/**
 * Configurações editáveis do Doce Sonho.
 * CHECKOUT_URL: link do checkout da Hotmart. Pode ser definido pela variável
 * VITE_HOTMART_CHECKOUT_URL ou editado diretamente aqui.
 */
export const CHECKOUT_URL: string =
  (import.meta.env["VITE_HOTMART_CHECKOUT_URL"] as string | undefined) ||
  "https://pay.hotmart.com/SEU_PRODUTO";

export const FREE_LIMITS = {
  babies: 1,
  diaryDays: 7,
  articles: 3,
  sounds: ["white"] as string[],
};
