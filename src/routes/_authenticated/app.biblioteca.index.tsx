import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Heart, Search } from "lucide-react";
import { useAppData } from "@/lib/app-data";
import { useFavorites } from "@/lib/favorites";
import { AGE_GROUPS, ARTICLES, isArticleFree, type AgeGroup } from "@/lib/content";
import { Input } from "@/components/ui/input";
import { Empty, PageTitle } from "@/components/app/States";
import { PremiumBadge } from "@/components/app/Paywall";
import { s } from "@/i18n/strings";

export const Route = createFileRoute("/_authenticated/app/biblioteca/")({
  head: () => ({ meta: [{ title: "Biblioteca · Doce Sonho" }] }),
  component: Biblioteca,
});

function norm(v: string) {
  return v.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function Biblioteca() {
  const { premium } = useAppData();
  const { favs, toggle } = useFavorites();
  const [q, setQ] = useState("");
  const [group, setGroup] = useState<AgeGroup | "all" | "fav">("all");

  const list = useMemo(() => ARTICLES.filter((a) => {
    if (group === "fav" && !favs.has(a.slug)) return false;
    if (group !== "all" && group !== "fav" && !a.groups.includes(group)) return false;
    const n = norm(q.trim());
    return !n || norm(a.title + " " + a.summary + " " + a.body.join(" ")).includes(n);
  }), [q, group, favs]);

  const chips: { id: typeof group; label: string }[] = [{ id: "all", label: s.library.all }, { id: "fav", label: s.library.favorites }, ...AGE_GROUPS];

  return (
    <div>
      <PageTitle title={s.library.title} />
      <div className="relative mb-3">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input type="search" aria-label={s.library.search} placeholder={s.library.search} className="h-12 rounded-full pl-10" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        {chips.map((c) => (
          <button key={c.id} onClick={() => setGroup(c.id)} aria-pressed={group === c.id}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold ${group === c.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
            {c.label}
          </button>
        ))}
      </div>
      {list.length === 0 ? <Empty>{s.library.empty}</Empty> : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {list.map((a) => {
            const locked = !premium && !isArticleFree(a);
            const fav = favs.has(a.slug);
            return (
              <li key={a.slug} className="card-soft relative p-5">
                <Link to="/app/biblioteca/$slug" params={{ slug: a.slug }} className="block pr-10">
                  <div className="mb-2 flex flex-wrap gap-1">
                    {locked && <PremiumBadge />}
                    {a.groups.slice(0, 2).map((g) => <span key={g} className="rounded-full bg-sky px-2 py-0.5 text-[11px] text-sky-foreground">{AGE_GROUPS.find((x) => x.id === g)?.label}</span>)}
                  </div>
                  <h2 className="text-lg leading-tight">{a.title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{a.summary}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{s.library.minutes(a.minutes)}</p>
                </Link>
                <button onClick={() => toggle(a.slug)} aria-pressed={fav} aria-label={fav ? s.library.removeFav : s.library.addFav}
                  className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full hover:bg-accent">
                  <Heart className={`h-5 w-5 ${fav ? "fill-primary-strong text-primary-strong" : "text-muted-foreground"}`} aria-hidden />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
