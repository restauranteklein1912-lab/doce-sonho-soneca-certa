import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { premiumActionFor, premiumDaysForOffer, safeEqual } from "@/lib/hotmart";

const Payload = z.object({
  event: z.string().min(1).max(100),
  hottok: z.string().optional(),
  data: z.object({
    buyer: z.object({ email: z.string().email().max(255) }).partial().optional(),
    subscriber: z.object({ email: z.string().email().max(255) }).partial().optional(),
    purchase: z.object({
      offer: z.object({ code: z.string().optional() }).passthrough().optional(),
    }).passthrough().optional(),
  }).passthrough(),
}).passthrough();

export const Route = createFileRoute("/api/public/hotmart-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env["HOTMART_HOTTOK"];
        if (!secret) return new Response("Not configured", { status: 500 });

        let json: unknown;
        try { json = await request.json(); } catch { return new Response("Bad request", { status: 400 }); }
        const parsed = Payload.safeParse(json);
        if (!parsed.success) return new Response("Bad request", { status: 400 });

        const token = request.headers.get("x-hotmart-hottok") ?? parsed.data.hottok ?? "";
        if (!safeEqual(token, secret)) return new Response("Unauthorized", { status: 401 });

        const action = premiumActionFor(parsed.data.event);
        const email = (parsed.data.data.buyer?.email ?? parsed.data.data.subscriber?.email ?? "").trim().toLowerCase();
        if (!action || !email) return Response.json({ ok: true, ignored: true });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const isPremium = action === "activate";
        const offerCode = parsed.data.data.purchase?.offer?.code;
        const days = premiumDaysForOffer(offerCode);
        const until = isPremium ? new Date(Date.now() + days * 86400000).toISOString() : null;

        const { data: profile, error } = await supabaseAdmin.from("profiles").select("id").eq("email", email).maybeSingle();
        if (error) return new Response("Error", { status: 500 });

        if (profile) {
          const { error: ue } = await supabaseAdmin.from("profiles").update({ is_premium: isPremium, premium_until: until }).eq("id", profile.id);
          if (ue) return new Response("Error", { status: 500 });
        } else {
          const { error: pe } = await supabaseAdmin.from("pending_premium").upsert({
            email, is_premium: isPremium, premium_until: until, event: parsed.data.event, updated_at: new Date().toISOString(),
          });
          if (pe) return new Response("Error", { status: 500 });
        }
        return Response.json({ ok: true });
      },
    },
  },
});
