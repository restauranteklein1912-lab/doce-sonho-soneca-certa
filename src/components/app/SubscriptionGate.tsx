import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Lock, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { HOTMART_CHECKOUT_ANNUAL_URL, HOTMART_CHECKOUT_MONTHLY_URL } from "@/config";
import { Logo } from "@/components/app/Logo";
import { Disclaimer } from "@/components/app/Footer";
import { Button } from "@/components/ui/button";
import { s } from "@/i18n/strings";

export function SubscriptionGate() {
  const qc = useQueryClient();
  const navigate = useNavigate();

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/entrar", replace: true });
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-5 py-10">
        <div className="mb-8 text-center">
          <Logo size="lg" />
        </div>
        <div className="card-soft space-y-5 p-6 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-peach text-peach-foreground">
            <Lock className="h-5 w-5" aria-hidden />
          </span>
          <div className="space-y-2">
            <h1 className="text-2xl">{s.gate.title}</h1>
            <p className="text-sm text-muted-foreground">{s.gate.desc}</p>
          </div>
          <div className="space-y-2.5">
            <Button asChild className="w-full">
              <a href={HOTMART_CHECKOUT_MONTHLY_URL} target="_blank" rel="noopener noreferrer">
                {s.gate.monthly}
              </a>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <a href={HOTMART_CHECKOUT_ANNUAL_URL} target="_blank" rel="noopener noreferrer">
                {s.gate.annual}
              </a>
            </Button>
            <p className="text-xs font-medium text-muted-foreground">{s.gate.trial}</p>
            <p className="text-xs text-muted-foreground">{s.gate.hint}</p>
          </div>
          <div className="flex items-center justify-between gap-2 border-t pt-4">
            <Link to="/app/conta" className="text-sm font-semibold text-primary-strong hover:underline">
              {s.gate.viewAccount}
            </Link>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4" aria-hidden /> {s.account.signOut}
            </Button>
          </div>
        </div>
      </main>
      <Disclaimer />
    </div>
  );
}