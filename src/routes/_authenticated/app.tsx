import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { BarChart3, BookOpen, CalendarClock, Heart, Home, ListChecks, Menu, Music, NotebookPen, UserRound } from "lucide-react";
import { AppDataProvider, useAppData, useAppDataQuery } from "@/lib/app-data";
import { Logo } from "@/components/app/Logo";
import { Disclaimer } from "@/components/app/Footer";
import { BabyForm } from "@/components/app/BabyForm";
import { SubscriptionGate } from "@/components/app/SubscriptionGate";
import { ErrorState, Loading } from "@/components/app/States";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ageLabel } from "@/lib/sleep";
import { s } from "@/i18n/strings";

export const Route = createFileRoute("/_authenticated/app")({
  head: () => ({ meta: [{ title: "Doce Sonho" }, { name: "robots", content: "noindex" }] }),
  component: AppLayout,
});

const NAV = [
  { to: "/app", label: s.nav.home, icon: Home, exact: true },
  { to: "/app/diario", label: s.nav.diary, icon: NotebookPen },
  { to: "/app/relatorios", label: s.nav.reports, icon: BarChart3 },
  { to: "/app/sons", label: s.nav.sounds, icon: Music },
  { to: "/app/rotina", label: s.nav.routine, icon: CalendarClock },
  { to: "/app/hora-de-dormir", label: s.nav.bedtime, icon: ListChecks },
  { to: "/app/biblioteca", label: s.nav.library, icon: BookOpen },
  { to: "/app/cuidador", label: s.nav.caregiver, icon: Heart },
  { to: "/app/conta", label: s.nav.account, icon: UserRound },
] as const;

function AppLayout() {
  const q = useAppDataQuery();
  if (q.isLoading) return <Loading />;
  if (q.isError || !q.data) return <div className="p-6"><ErrorState onRetry={() => q.refetch()} /></div>;
  return (
    <AppDataProvider data={q.data}>
      <Shell />
    </AppDataProvider>
  );
}

function Shell() {
  const { premium, babies, setBabyId, refresh } = useAppData();
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  if (!premium && !pathname.startsWith("/app/conta")) {
    return <SubscriptionGate />;
  }
  if (premium && babies.length === 0) {
    return (
      <div className="flex min-h-screen flex-col">
        <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-5 py-10">
          <div className="mb-8 text-center"><Logo size="lg" /></div>
          <div className="card-soft p-6">
            <h1 className="text-2xl">{s.onboarding.title}</h1>
            <p className="mb-5 mt-1 text-sm text-muted-foreground">{s.onboarding.subtitle}</p>
            <BabyForm onDone={async (id) => { setBabyId(id); await refresh(); }} />
          </div>
        </main>
        <Disclaimer />
      </div>
    );
  }
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <Link to="/app" aria-label={s.nav.home}><Logo /></Link>
          <BabySwitcher />
        </div>
        <nav aria-label="Principal" className="mx-auto hidden max-w-5xl gap-1 overflow-x-auto px-4 pb-2 md:flex">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} activeOptions={{ exact: "exact" in n }}
              className="flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground data-[status=active]:bg-primary data-[status=active]:text-primary-foreground">
              <n.icon className="h-4 w-4" aria-hidden /> {n.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        <Outlet />
      </main>
      <Disclaimer className="pb-28 md:pb-6" />
      <MobileNav />
    </div>
  );
}

function BabySwitcher() {
  const { babies, baby, setBabyId } = useAppData();
  if (!baby) return null;
  if (babies.length === 1)
    return <p className="text-right text-sm"><span className="font-semibold">{baby.name}</span> <span className="text-muted-foreground">· {ageLabel(baby.birth_date)}</span></p>;
  return (
    <Select value={baby.id} onValueChange={setBabyId}>
      <SelectTrigger className="h-10 w-auto min-w-40 rounded-full" aria-label={s.onboarding.babyName}><SelectValue /></SelectTrigger>
      <SelectContent>
        {babies.map((b) => <SelectItem key={b.id} value={b.id}>{b.name} · {ageLabel(b.birth_date)}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}

function MobileNav() {
  const [open, setOpen] = useState(false);
  const path = useRouterState({ select: (r) => r.location.pathname });
  const main = NAV.slice(0, 4);
  const rest = NAV.slice(4);
  const restActive = rest.some((r) => path.startsWith(r.to));
  return (
    <>
      <nav aria-label="Navegação" className="fixed inset-x-0 bottom-0 z-40 border-t bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
        <ul className="grid grid-cols-5">
          {main.map((n) => (
            <li key={n.to}>
              <Link to={n.to} activeOptions={{ exact: "exact" in n }}
                className="flex flex-col items-center gap-0.5 py-2.5 text-[11px] text-muted-foreground data-[status=active]:text-primary-strong data-[status=active]:font-bold">
                <n.icon className="h-5 w-5" aria-hidden /> {n.label}
              </Link>
            </li>
          ))}
          <li>
            <button onClick={() => setOpen(true)} className={`flex w-full flex-col items-center gap-0.5 py-2.5 text-[11px] ${restActive ? "font-bold text-primary-strong" : "text-muted-foreground"}`}>
              <Menu className="h-5 w-5" aria-hidden /> {s.common.more}
            </button>
          </li>
        </ul>
      </nav>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl">
          <SheetHeader><SheetTitle>{s.common.more}</SheetTitle></SheetHeader>
          <ul className="mt-4 grid grid-cols-2 gap-2 pb-4">
            {rest.map((n) => (
              <li key={n.to}>
                <Link to={n.to} onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-2xl bg-muted p-4 text-sm font-semibold data-[status=active]:bg-primary data-[status=active]:text-primary-foreground">
                  <n.icon className="h-5 w-5" aria-hidden /> {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </SheetContent>
      </Sheet>
    </>
  );
}
