import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { s } from "@/i18n/strings";

export function Loading() {
  return (
    <div role="status" className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
      <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> {s.common.loading}
    </div>
  );
}
export function ErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <div role="alert" className="card-soft flex flex-col items-center gap-3 p-6 text-center">
      <p className="text-sm">{s.common.error}</p>
      {onRetry && <Button variant="outline" onClick={onRetry}>{s.common.retry}</Button>}
    </div>
  );
}
export function Empty({ children }: { children: React.ReactNode }) {
  return <p className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">{children}</p>;
}
export function PageTitle({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
