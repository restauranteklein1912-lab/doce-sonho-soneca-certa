import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Heart } from "lucide-react";
import { useAppData } from "@/lib/app-data";
import { useFavorites } from "@/lib/favorites";
import { ALL_CONTENT, isArticleFree } from "@/lib/content";
import { Button } from "@/components/ui/button";
import { Paywall } from "@/components/app/Paywall";
import { s } from "@/i18n/strings";

export const Route = createFileRoute("/_authenticated/app/biblioteca/$slug")({
  loader: ({ params }) => {
    const article = ALL_CONTENT.find((a) => a.slug === params.slug);
    if (!article) throw notFound();
    return { article };
  },
  head: ({ loaderData }) => ({ meta: [{ title: `${loaderData?.article.title ?? s.library.title} · Doce Sonho` }] }),
  notFoundComponent: () => <p className="p-6 text-center">{s.notFound}</p>,
  component: Artigo,
});

function Artigo() {
  const { article } = Route.useLoaderData();
  const { premium } = useAppData();
  const { favs, toggle } = useFavorites();
  const locked = !premium && !isArticleFree(article);
  const fav = favs.has(article.slug);
  return (
    <article className="mx-auto max-w-2xl">
      <Link to="/app/biblioteca" className="mb-4 inline-flex items-center gap-1 text-sm text-primary-strong hover:underline"><ArrowLeft className="h-4 w-4" aria-hidden /> {s.library.back}</Link>
      <div className="mb-2 flex flex-wrap items-center gap-2">{article.kind === "story" && <span className="rounded-full bg-peach px-3 py-1 text-xs font-semibold text-peach-foreground">História para dormir · Premium</span>}</div>
      <h1 className="text-3xl">{article.title}</h1>
      <p className="mt-2 text-muted-foreground">{article.summary}</p>
      {locked ? <div className="mt-6"><Paywall /></div> : (
        <>
          <div className={`card-soft mt-6 space-y-4 p-6 leading-relaxed ${article.kind === "story" ? "text-lg" : ""}`}>
            {article.body.map((p, i) => <p key={i}>{p}</p>)}
          </div>
          <Button variant="outline" className="mt-4" onClick={() => toggle(article.slug)} aria-pressed={fav}>
            <Heart className={fav ? "fill-primary-strong text-primary-strong" : ""} /> {fav ? s.library.removeFav : s.library.addFav}
          </Button>
        </>
      )}
    </article>
  );
}
