import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Logo } from "./Logo";
import { Disclaimer } from "./Footer";
import { s } from "@/i18n/strings";

export function AuthLayout({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-5 py-10">
        <div className="mb-8 text-center"><Logo size="lg" /></div>
        <div className="card-soft p-6 sm:p-8">
          <h1 className="text-2xl">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
        <p className="mt-6 text-center text-sm">
          <Link to="/calculadora" className="text-primary-strong underline-offset-4 hover:underline">{s.auth.tryCalculator}</Link>
        </p>
      </main>
      <Disclaimer />
    </div>
  );
}
