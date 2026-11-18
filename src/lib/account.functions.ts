import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Exclui a conta do usuário autenticado e todos os seus dados. */
export const deleteMyAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const uid = context.userId;
    for (const table of ["favorites", "caregiver_checkins", "babies"] as const) {
      const { error } = await supabaseAdmin.from(table).delete().eq("user_id", uid);
      if (error) throw new Error("delete_failed");
    }
    const { error } = await supabaseAdmin.auth.admin.deleteUser(uid);
    if (error) throw new Error("delete_failed");
    return { ok: true };
  });
