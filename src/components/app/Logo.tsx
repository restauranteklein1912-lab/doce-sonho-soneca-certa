import { Moon } from "lucide-react";
import { s } from "@/i18n/strings";
export function Logo({ size = "md" }: { size?: "md" | "lg" }) {
  return (
    <span className="inline-flex items-center gap-2 font-display text-foreground">
      <span className={`grid place-items-center rounded-full bg-lavender text-lavender-foreground ${size === "lg" ? "h-12 w-12" : "h-9 w-9"}`}>
        <Moon className={size === "lg" ? "h-6 w-6" : "h-5 w-5"} aria-hidden />
      </span>
      <span className={size === "lg" ? "text-3xl" : "text-xl"}>{s.appName}</span>
    </span>
  );
}
