import { s } from "@/i18n/strings";
export function Disclaimer({ className = "" }: { className?: string }) {
  return (
    <footer className={`px-4 py-6 text-center text-xs text-muted-foreground ${className}`}>
      {s.disclaimer}
    </footer>
  );
}
