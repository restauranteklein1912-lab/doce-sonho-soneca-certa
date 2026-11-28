import { describe, expect, it, vi } from "vitest";
import { handleHotmartWebhook, type HotmartCommand, type HotmartResult } from "./hotmart-webhook";

const now = Date.UTC(2026, 10, 28, 10);
const valid = {
  id: "test-event",
  event: "PURCHASE_APPROVED",
  creation_date: now,
  data: { buyer: { email: "  Buyer@Example.com  " }, purchase: { transaction: "TEST-TRANSACTION", status: "APPROVED", approved_date: now - 1000, offer: { code: "i1qgmmj1" } } },
};
function request(payload: unknown, token = "test-secret") {
  return new Request("http://localhost/api/public/hotmart-webhook", { method: "POST", headers: { "x-hotmart-hottok": token }, body: JSON.stringify(payload) });
}
const processor = (result: HotmartResult = { status: "activated" }) => vi.fn<(command: HotmartCommand) => Promise<HotmartResult>>().mockResolvedValue(result);

describe("Hotmart request boundary", () => {
  it("normaliza e-mail e usa a data original de aprovação", async () => {
    const process = processor();
    const response = await handleHotmartWebhook(request(valid), "test-secret", process, now);
    expect(response.status).toBe(200);
    expect(process).toHaveBeenCalledWith(expect.objectContaining({ _email: "buyer@example.com", _transaction: "TEST-TRANSACTION", _approved_at: "2026-11-28T09:59:59.000Z", _offer: "i1qgmmj1" }));
  });
  it("rejeita token incorreto sem gravar", async () => {
    const process = processor();
    expect((await handleHotmartWebhook(request(valid, "wrong"), "test-secret", process, now)).status).toBe(401);
    expect(process).not.toHaveBeenCalled();
  });
  it("aceita o HOTTOK no corpo sem registrá-lo", async () => {
    const process = processor();
    const req = new Request("http://localhost/webhook", { method: "POST", body: JSON.stringify({ ...valid, hottok: "test-secret" }) });
    expect((await handleHotmartWebhook(req, "test-secret", process, now)).status).toBe(200);
    expect(process.mock.calls[0]?.[0]).not.toHaveProperty("hottok");
  });
  it("não concede Premium a compra não aprovada", async () => {
    const process = processor();
    const payload = { ...valid, data: { ...valid.data, purchase: { ...valid.data.purchase, status: "WAITING_PAYMENT" } } };
    expect((await handleHotmartWebhook(request(payload), "test-secret", process, now)).status).toBe(422);
    expect(process).not.toHaveBeenCalled();
  });
  it("não concede Premium para oferta desconhecida", async () => {
    const process = processor();
    const payload = { ...valid, data: { ...valid.data, purchase: { ...valid.data.purchase, offer: { code: "other" } } } };
    expect((await handleHotmartWebhook(request(payload), "test-secret", process, now)).status).toBe(422);
    expect(process).not.toHaveBeenCalled();
  });
  it("compra sem e-mail retorna 422, nunca sucesso silencioso", async () => {
    const process = processor();
    expect((await handleHotmartWebhook(request({ ...valid, data: { purchase: valid.data.purchase } }), "test-secret", process, now)).status).toBe(422);
    expect(process).not.toHaveBeenCalled();
  });
  it("cancelamento de renovação é explicitamente ignorado e não revoga acesso", async () => {
    const process = processor();
    const response = await handleHotmartWebhook(request({ ...valid, event: "SUBSCRIPTION_CANCELLATION" }), "test-secret", process, now);
    expect(response.status).toBe(202);
    expect(await response.json()).toEqual({ status: "ignored", reason: "unsupported_event" });
    expect(process).not.toHaveBeenCalled();
  });
  it.each(["PURCHASE_REFUNDED", "PURCHASE_CHARGEBACK", "PURCHASE_PROTEST", "PURCHASE_EXPIRED"])("%s chega à revogação", async (event) => {
    const process = processor({ status: "deactivated" });
    expect((await handleHotmartWebhook(request({ ...valid, event }), "test-secret", process, now)).status).toBe(200);
    expect(process).toHaveBeenCalledWith(expect.objectContaining({ _event: event }));
  });
  it("pendência retorna 202 e informa pending", async () => {
    const response = await handleHotmartWebhook(request(valid), "test-secret", processor({ status: "pending" }), now);
    expect(response.status).toBe(202);
    expect(await response.json()).toEqual({ status: "pending" });
  });
  it("reenvio de pendência não se apresenta como ativação", async () => {
    const response = await handleHotmartWebhook(request(valid), "test-secret", processor({ status: "duplicate", original_status: "pending" }), now);
    expect(response.status).toBe(202);
  });
  it("falha de persistência retorna 500 para permitir reenvio", async () => {
    const process = processor().mockRejectedValue(new Error("failure"));
    expect((await handleHotmartWebhook(request(valid), "test-secret", process, now)).status).toBe(500);
  });
  it("reenvio mantém o comando de aprovação original", async () => {
    const process = processor({ status: "duplicate", original_status: "activated" });
    await handleHotmartWebhook(request(valid), "test-secret", process, now);
    await handleHotmartWebhook(request(valid), "test-secret", process, now + 86400000);
    expect(process.mock.calls[0]?.[0]).toEqual(process.mock.calls[1]?.[0]);
  });
});