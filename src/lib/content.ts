/** Artigos da biblioteca (conteúdo traduzível). Os 3 primeiros ficam liberados no plano Grátis. */
export type AgeGroup = "recem-nascido" | "3-6" | "6-12" | "1-2" | "2-5";

export const AGE_GROUPS: { id: AgeGroup; label: string }[] = [
  { id: "recem-nascido", label: "Recém-nascido" },
  { id: "3-6", label: "3 a 6 meses" },
  { id: "6-12", label: "6 a 12 meses" },
  { id: "1-2", label: "1 a 2 anos" },
  { id: "2-5", label: "2 a 5 anos" },
];

export type Article = {
  slug: string;
  title: string;
  summary: string;
  groups: AgeGroup[];
  minutes: number;
  body: string[];
  free?: boolean;
};

export const ARTICLES: Article[] = [
  {
    slug: "sono-seguro",
    title: "Sono seguro: o essencial",
    summary: "Posição, berço e ambiente recomendados para dormir.",
    groups: ["recem-nascido", "3-6", "6-12"],
    minutes: 3,
    free: true,
    body: [
      "Coloque o bebê para dormir sempre de barriga para cima, em todas as sonecas e à noite.",
      "Use berço com colchão firme, plano e bem ajustado às laterais, coberto apenas por lençol com elástico.",
      "Mantenha o berço livre de objetos soltos: travesseiros, protetores, mantas fofas, bichos de pelúcia e brinquedos.",
      "Recomenda-se que o bebê durma no mesmo quarto dos cuidadores, em seu próprio berço, nos primeiros meses.",
      "Evite superaquecimento: roupas leves e ambiente arejado. Se usar saco de dormir, escolha um do tamanho certo.",
      "Não fume perto do bebê e mantenha o ambiente livre de fumaça.",
      "Dúvidas sobre o sono do seu bebê devem ser conversadas com o pediatra.",
    ],
  },
  {
    slug: "janelas-de-vigilia",
    title: "O que são janelas de vigília",
    summary: "Entenda o tempo que o bebê costuma ficar acordado entre os sonos.",
    groups: ["recem-nascido", "3-6", "6-12", "1-2"],
    minutes: 2,
    free: true,
    body: [
      "Janela de vigília é o tempo que o bebê fica acordado entre um sono e outro.",
      "Ela aumenta com a idade: poucos minutos no recém-nascido e algumas horas perto de 1 ano.",
      "Sinais de sono, como bocejos, olhar parado e esfregar os olhos, ajudam a perceber o momento.",
      "As faixas de referência são médias. Observe o seu bebê e ajuste aos poucos.",
    ],
  },
  {
    slug: "regressao-4-meses",
    title: "Regressão de sono dos 4 meses",
    summary: "Por que o sono pode mudar por volta dos 4 meses.",
    groups: ["3-6"],
    minutes: 3,
    free: true,
    body: [
      "Por volta dos 4 meses o sono do bebê amadurece e passa a ter ciclos mais parecidos com os de um adulto.",
      "É comum haver mais despertares e sonecas mais curtas por algumas semanas.",
      "Manter uma rotina previsível e um ambiente calmo costuma ajudar nesse período.",
      "Se houver febre, recusa alimentar ou outros sinais diferentes, procure o pediatra.",
    ],
  },
  {
    slug: "rotina-recem-nascido",
    title: "Os primeiros dias de sono",
    summary: "Como costuma ser o sono nas primeiras semanas.",
    groups: ["recem-nascido"],
    minutes: 3,
    body: [
      "Recém-nascidos dormem muitas horas por dia, em períodos curtos, sem diferenciar dia e noite.",
      "Luz natural durante o dia e ambiente escuro à noite ajudam a ajustar o relógio biológico aos poucos.",
      "As mamadas noturnas são esperadas nessa fase.",
      "Siga sempre as orientações de sono seguro.",
    ],
  },
  {
    slug: "regressao-8-10-meses",
    title: "Mudanças no sono entre 8 e 10 meses",
    summary: "Novas habilidades e ansiedade de separação.",
    groups: ["6-12"],
    minutes: 3,
    body: [
      "Engatinhar, ficar de pé e a ansiedade de separação podem mexer com o sono nessa fase.",
      "Treinar as novas habilidades durante o dia pode reduzir a agitação à noite.",
      "Respostas calmas e consistentes nos despertares trazem segurança.",
    ],
  },
  {
    slug: "desmame-noturno",
    title: "Desmame da mamada noturna",
    summary: "Caminhos graduais para reduzir as mamadas à noite.",
    groups: ["6-12", "1-2"],
    minutes: 4,
    body: [
      "Antes de iniciar, converse com o pediatra para confirmar que o bebê está pronto.",
      "Uma forma gradual é reduzir alguns minutos da mamada ou alguns mililitros a cada poucas noites.",
      "Outra pessoa oferecer conforto nos despertares pode ajudar.",
      "Garanta boas mamadas e refeições durante o dia.",
    ],
  },
  {
    slug: "transicao-de-sonecas",
    title: "Transição de sonecas",
    summary: "Quando e como passar de 3 para 2, e de 2 para 1 soneca.",
    groups: ["6-12", "1-2"],
    minutes: 3,
    body: [
      "Recusar uma soneca por vários dias seguidos pode indicar que é hora de mudar.",
      "De 3 para 2 sonecas costuma ocorrer entre 6 e 9 meses; de 2 para 1, entre 12 e 18 meses.",
      "Durante a transição, adiantar um pouco o horário de dormir à noite pode evitar cansaço excessivo.",
    ],
  },
  {
    slug: "regressao-18-meses",
    title: "Sono por volta dos 18 meses",
    summary: "Autonomia, dentes e limites na hora de dormir.",
    groups: ["1-2"],
    minutes: 3,
    body: [
      "Nessa idade a criança testa limites e pode resistir à hora de dormir.",
      "Oferecer pequenas escolhas, como o pijama ou a história, ajuda a dar autonomia.",
      "Uma rotina curta e sempre na mesma ordem traz previsibilidade.",
    ],
  },
  {
    slug: "medos-e-pesadelos",
    title: "Medos noturnos e pesadelos",
    summary: "Como acolher a criança que acorda com medo.",
    groups: ["2-5"],
    minutes: 4,
    body: [
      "Medos noturnos são comuns entre 2 e 5 anos, quando a imaginação se desenvolve.",
      "Acolha com calma, valide o sentimento e reforce que ela está segura.",
      "Uma luz noturna fraca e um objeto de apego podem ajudar.",
      "Terror noturno é diferente de pesadelo: a criança parece acordada mas não responde. Mantenha-a segura e evite acordá-la.",
      "Se os episódios forem frequentes, converse com o pediatra.",
    ],
  },
  {
    slug: "saida-do-berco",
    title: "Saída do berço para a cama",
    summary: "Sinais de prontidão e dicas para a mudança.",
    groups: ["2-5"],
    minutes: 3,
    body: [
      "Muitas crianças fazem essa mudança entre 2 e 3 anos e meio.",
      "Escalar o berço é um sinal de que é hora, por segurança.",
      "Envolver a criança na escolha da roupa de cama torna a mudança mais leve.",
      "Garanta um quarto seguro: móveis fixados, tomadas protegidas e sem objetos perigosos ao alcance.",
    ],
  },
  {
    slug: "horario-de-dormir",
    title: "Hora de dormir sem pressa",
    summary: "Rotinas curtas que ajudam a desacelerar.",
    groups: ["1-2", "2-5"],
    minutes: 2,
    body: [
      "Desligar telas cerca de uma hora antes de dormir ajuda o corpo a desacelerar.",
      "Banho, pijama, dentes, história e luz baixa formam uma sequência simples.",
      "Manter horários parecidos todos os dias, inclusive nos fins de semana, favorece o sono.",
    ],
  },
];

export function isArticleFree(a: Article) {
  return !!a.free;
}
