import { z } from "zod";
import { premiumActionFor, premiumDaysForOffer, safeEqual } from "./hotmart";

const Email = z.string().trim().toLowerCase().email().max(255);
const Timestamp = z.number().int().positive().max(8640000000000000);
export const HotmartPayload = z.object({
  id: z.string().min(1).max(100).optional(),
  event: z.string().trim().min(1).max(100).transform((event) => event.toUpperCase()),
  creation_date: Timestamp.optional(),
  hottok: z.string().max(4096).optional(),
  data: z.object({
    buyer: z.object({ email: Email.optional() }).optional(),
    subscriber: z.object({ email: Email.optional() }).optional(),
    purchase: z.object({
      transaction: z.string().trim().min(1).max(100).optional(),
      status: z.string().trim().max(100).transform((status) => status.toUpperCase()).optional(),
      approved_date: Timestamp.optional(),
      offer: z.object({ code: z.string().trim().max(100).optional() }).optional(),
    }).optional(),
  }),
});

export type HotmartCommand = {
  _transaction: string;
  _event: string;
  _event_id: string;
  _email: string;
  _status: string;
  _offer: string;
  _occurred_at: string;
  _approved_at: string;
};

export type HotmartResult = {
  status: "activated" | "deactivated" | "pending" | "duplicate" | "stale";
  original_status?: string;
  premium_until?: string | null;
};

export const HotmartResultSchema = z.object({
  status: z.enum(["activated", "deactivated", "pending", "duplicate", "stale"]),
  original_status: z.string().optional(),
  premium_until: z.string().nullable().optional(),
});

/** Pure request boundary: only an authenticated, validated event reaches persistence. */
export async function handleHotmartWebhook(
  request: Request,
  secret: string | undefined,
  processEvent: (command: HotmartCommand) => Promise<HotmartResult>,
  now = Date.now(),
) {
  if (!secret) return Response.json({ status: "not_configured" }, { status: 503 });
  let json: unknown;
  try {
    const body = await request.text();
    if (body.length > 65536) return Response.json({ status: "payload_too_large" }, { status: 413 });
    json = JSON.parse(body);
  } catch {
    return Response.json({ status: "invalid_payload" }, { status: 400 });
  }
  const bodyToken = typeof json === "object" && json !== null && "hottok" in json && typeof json.hottok === "string" ? json.hottok : "";
  const token = request.headers.get("x-hotmart-hottok") ?? bodyToken;
  if (!safeEqual(token, secret)) return Response.json({ status: "unauthorized" }, { status: 401 });
  const parsed = HotmartPayload.safeParse(json);
  if (!parsed.success) return Response.json({ status: "invalid_payload" }, { status: 400 });
  const payload = parsed.data;
  const action = premiumActionFor(payload.event);
  if (!action) return Response.json({ status: "ignored", reason: "unsupported_event" }, { status: 202 });
  const purchase = payload.data.purchase;
  const email = payload.data.buyer?.email ?? payload.data.subscriber?.email;
  if (!email || !purchase?.transaction) return Response.json({ status: "invalid_payload", reason: "missing_email_or_transaction" }, { status: 422 });
  if (action === "activate" && !["APPROVED", "COMPLETE"].includes(purchase.status ?? "")) {
    return Response.json({ status: "rejected", reason: "purchase_not_approved" }, { status: 422 });
  }
  if (action === "activate" && premiumDaysForOffer(purchase.offer?.code) === null) {
    return Response.json({ status: "rejected", reason: "unknown_offer" }, { status: 422 });
  }
  // Anchor access to the original approval, never to the date of a resend.
  const approvedAt = purchase.approved_date ?? payload.creation_date;
  const occurredAt = payload.creation_date ?? purchase.approved_date;
  if (!occurredAt || (action === "activate" && !approvedAt) || occurredAt > now + 300000 || (approvedAt && approvedAt > now + 300000)) {
    return Response.json({ status: "invalid_payload", reason: "invalid_event_date" }, { status: 422 });
  }
  try {
    const result = await processEvent({
      _transaction: purchase.transaction,
      _event: payload.event,
      _event_id: payload.id ?? "",
      _email: email,
      _status: purchase.status ?? "",
      _offer: purchase.offer?.code ?? "",
      _occurred_at: new Date(occurredAt).toISOString(),
      _approved_at: new Date(approvedAt ?? occurredAt).toISOString(),
    });
    const acceptedOnly = ["pending", "stale"].includes(result.status) || (result.status === "duplicate" && ["pending", "stale"].includes(result.original_status ?? ""));
    console.info("hotmart_event", { transaction: purchase.transaction, event: payload.event, status: result.status });
    return Response.json(result, { status: acceptedOnly ? 202 : 200 });
  } catch {
    // No buyer email, raw payload, or HOTTOK in logs/responses.
    console.error("hotmart_processing_failed", { transaction: purchase.transaction, event: payload.event });
    return Response.json({ status: "processing_failed" }, { status: 500 });
  }
}