import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HOTMART_CHECKOUT_MONTHLY_URL } from "@/config";
import { s } from "@/i18n/strings";

export function Paywall({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`card-soft flex flex-col items-center gap-3 text-center ${compact ? "p-5" : "p-8"}`}>
      <span className="grid h-11 w-11 place-items-center rounded-full bg-peach text-peach-foreground">
        <Lock className="h-5 w-5" aria-hidden />
      </span>
      <h2 className="text-lg">{s.paywall.title}</h2>
      <p className="max-w-sm text-sm text-muted-foreground">{s.paywall.desc}</p>
      <Button asChild>
        <a href={HOTMART_CHECKOUT_MONTHLY_URL} target="_blank" rel="noopener noreferrer">{s.paywall.cta}</a>
      </Button>
    </div>
  );
}

export function PremiumBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-peach px-2 py-0.5 text-[11px] font-semibold text-peach-foreground">
      <Lock className="h-3 w-3" aria-hidden /> {s.paywall.badge}
    </span>
  );
}
