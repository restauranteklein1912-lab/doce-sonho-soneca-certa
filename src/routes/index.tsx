import { createFileRoute, Link } from "@tanstack/react-router";
import { Baby, BookOpen, CalendarClock, ChartNoAxesCombined, Heart, Moon, NotebookPen, ShieldCheck, Sparkles } from "lucide-react";
import { HOTMART_CHECKOUT_ANNUAL_URL, HOTMART_CHECKOUT_MONTHLY_URL } from "@/config";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/app/Logo";
import { Disclaimer } from "@/components/app/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Doce Sonho – Soneca Certa | Acompanhe o sono do seu bebê" },
      { name: "description", content: "Organize a rotina de sono do bebê, registre sonecas e despertares e acompanhe a evolução em um só lugar." },
      { property: "og:title", content: "Doce Sonho – Soneca Certa" },
      { property: "og:description", content: "Um espaço completo para acompanhar o sono do bebê e organizar a rotina da família." },
    ],
  }),
  component: LandingPage,
});

const features = [
  { icon: NotebookPen, title: "Diário do sono", desc: "Registre sonecas, sono noturno e despertares em uma linha do tempo organizada." },
  { icon: ChartNoAxesCombined, title: "Relatórios", desc: "Visualize padrões e acompanhe os registros ao longo dos dias." },
  { icon: CalendarClock, title: "Rotina personalizada", desc: "Organize horários e atividades da rotina do bebê." },
  { icon: Moon, title: "Sons relaxantes", desc: "Acesse sons para compor um ambiente mais tranquilo na hora do descanso." },
  { icon: BookOpen, title: "Biblioteca", desc: "Leia conteúdos e orientações sobre sono infantil." },
  { icon: Heart, title: "Cuidado com quem cuida", desc: "Registre também como você está durante essa jornada." },
];

function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5">
        <Logo />
        <Link to="/entrar" className="text-sm font-semibold text-primary-strong hover:underline">Já tenho uma conta</Link>
      </header>

      <main>
        <section className="mx-auto grid w-full max-w-6xl items-center gap-10 px-5 pb-16 pt-10 md:grid-cols-[1.1fr_.9fr] md:pb-24 md:pt-16">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-peach px-3 py-1.5 text-xs font-semibold text-peach-foreground">
              <Sparkles className="h-4 w-4" /> Seu espaço de cuidado e organização
            </span>
            <h1 className="mt-5 max-w-2xl text-4xl leading-tight sm:text-5xl">Mais clareza para acompanhar o sono do seu bebê.</h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Registre sonecas e despertares, organize a rotina e acompanhe os padrões de sono em um só aplicativo.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-12 px-6">
                <a href={HOTMART_CHECKOUT_MONTHLY_URL} target="_blank" rel="noopener noreferrer">Assinar plano mensal</a>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-6">
                <a href={HOTMART_CHECKOUT_ANNUAL_URL} target="_blank" rel="noopener noreferrer">Conhecer plano anual</a>
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">Acesso ao aplicativo mediante assinatura aprovada. Pagamento processado com segurança pela Hotmart.</p>
            <p className="mt-3 text-sm text-muted-foreground">Já assinou? <Link to="/criar-conta" className="font-semibold text-primary-strong underline">Crie sua conta</Link> com o mesmo e-mail usado na compra.</p>
          </div>

          <div className="relative mx-auto w-full max-w-md">
            <div className="card-soft rounded-[2rem] p-5 shadow-xl">
              <div className="flex items-center justify-between border-b pb-4">
                <div><p className="text-xs text-muted-foreground">DOCE SONHO</p><p className="font-display text-xl">Resumo do dia</p></div>
                <span className="rounded-full bg-peach p-3 text-peach-foreground"><Baby className="h-6 w-6" /></span>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-2">
                <div className="rounded-2xl bg-sky p-3"><p className="text-xs text-sky-foreground/80">Sono</p><p className="mt-1 font-display text-xl text-sky-foreground">—</p></div>
                <div className="rounded-2xl bg-peach p-3"><p className="text-xs text-peach-foreground/80">Sonecas</p><p className="mt-1 font-display text-xl text-peach-foreground">—</p></div>
                <div className="rounded-2xl bg-lavender p-3"><p className="text-xs text-lavender-foreground/80">Despertares</p><p className="mt-1 font-display text-xl text-lavender-foreground">—</p></div>
              </div>
              <div className="mt-4 rounded-2xl border p-4">
                <div className="flex items-center gap-2"><Moon className="h-5 w-5 text-primary" /><p className="font-semibold">Cronômetro do sono</p></div>
                <div className="py-6 text-center"><p className="font-display text-4xl tabular-nums">00:00:00</p><p className="mt-1 text-xs text-muted-foreground">Acompanhe cada momento de descanso</p></div>
                <div className="grid grid-cols-2 gap-2"><div className="rounded-xl bg-sky/60 p-3 text-center text-xs font-semibold">Registrar soneca</div><div className="rounded-xl bg-lavender/60 p-3 text-center text-xs font-semibold">Sono noturno</div></div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground"><ShieldCheck className="h-4 w-4" /> Seus registros em um espaço organizado.</div>
            </div>
          </div>
        </section>

        <section className="bg-muted/40 px-5 py-16">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold uppercase tracking-wide text-primary-strong">Tudo em um só lugar</p>
              <h2 className="mt-2 text-3xl">Ferramentas para acompanhar a rotina com mais tranquilidade</h2>
              <p className="mt-3 text-muted-foreground">O Doce Sonho reúne recursos práticos para registrar, observar e organizar o dia a dia da família.</p>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map(({ icon: Icon, title, desc }) => (
                <article key={title} className="card-soft rounded-3xl p-5">
                  <span className="inline-grid h-11 w-11 place-items-center rounded-2xl bg-peach text-peach-foreground"><Icon className="h-5 w-5" /></span>
                  <h3 className="mt-4 text-lg font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-5 py-16 text-center">
          <h2 className="text-3xl">Escolha sua assinatura</h2>
          <p className="mt-3 text-muted-foreground">O acesso completo é liberado após a confirmação do pagamento pela Hotmart.</p>
          <div className="mt-8 grid gap-4 text-left sm:grid-cols-2">
            <article className="card-soft rounded-3xl p-6">
              <p className="text-sm font-semibold text-muted-foreground">PLANO MENSAL</p>
              <p className="mt-2 font-display text-3xl">R$ 19,90</p>
              <p className="mt-1 text-sm text-muted-foreground">Assinatura mensal</p>
              <Button asChild className="mt-6 w-full"><a href={HOTMART_CHECKOUT_MONTHLY_URL} target="_blank" rel="noopener noreferrer">Assinar mensal</a></Button>
            </article>
            <article className="card-soft rounded-3xl border-primary/30 p-6">
              <p className="text-sm font-semibold text-primary-strong">PLANO ANUAL</p>
              <p className="mt-2 font-display text-3xl">R$ 149,90</p>
              <p className="mt-1 text-sm text-muted-foreground">Assinatura anual</p>
              <Button asChild variant="outline" className="mt-6 w-full"><a href={HOTMART_CHECKOUT_ANNUAL_URL} target="_blank" rel="noopener noreferrer">Assinar anual</a></Button>
            </article>
          </div>
          <p className="mt-5 text-xs text-muted-foreground">Consulte as condições de cobrança e renovação apresentadas no checkout da Hotmart.</p>
        </section>

        <section className="border-t px-5 py-10">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
            <div><p className="font-semibold">Já é assinante?</p><p className="text-sm text-muted-foreground">Entre na sua conta ou finalize seu cadastro para acessar o aplicativo.</p></div>
            <div className="flex gap-2"><Button asChild variant="outline"><Link to="/entrar">Entrar</Link></Button><Button asChild><Link to="/criar-conta">Criar conta</Link></Button></div>
          </div>
        </section>
      </main>
      <Disclaimer />
    </div>
  );
}
