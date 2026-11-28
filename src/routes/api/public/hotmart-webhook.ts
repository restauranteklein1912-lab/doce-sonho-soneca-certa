import { createFileRoute } from "@tanstack/react-router";
import { handleHotmartWebhook, HotmartResultSchema } from "@/lib/hotmart-webhook";

export const Route = createFileRoute("/api/public/hotmart-webhook")({
  server: {
    handlers: {
      POST: ({ request }) => handleHotmartWebhook(request, process.env["HOTMART_HOTTOK"], async (command) => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin.rpc("process_hotmart_event", command);
        if (error) throw new Error("hotmart_persistence_failed");
        const result = HotmartResultSchema.parse(data);
        return {
          status: result.status,
          ...(result.original_status === undefined ? {} : { original_status: result.original_status }),
          ...(result.premium_until === undefined ? {} : { premium_until: result.premium_until }),
        };
      }),
    },
  },
});
