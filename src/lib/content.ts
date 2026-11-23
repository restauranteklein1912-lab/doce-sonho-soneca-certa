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
  kind?: "article" | "story";
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


/** Histórias originais para leitura acompanhada antes de dormir. Todas são exclusivas do Premium. */
export const STORIES: Article[] = [
  { slug: "a-lua-que-guardava-sonhos", title: "A Lua que Guardava Sonhos", summary: "Uma pequena viagem pelo céu para descobrir onde os sonhos descansam.", groups: ["2-5"], minutes: 4, kind: "story", body: ["Quando a noite chegou à Vila das Janelas, uma lua redonda apareceu devagarinho no céu. Lá embaixo, todas as casas começavam a ficar quietas. Menos uma: a casinha de Lia, que ainda olhava pela janela.","— Lua, onde você guarda os sonhos? — perguntou Lia, baixinho.","A Lua sorriu e chamou uma estrelinha que brilhava pertinho dela. A estrelinha trouxe uma caixinha feita de luz prateada. Dentro dela havia sonhos de todos os tamanhos: um passeio de balão, um jardim de borboletas e um abraço bem apertado.","— Cada sonho encontra seu caminho quando os olhos descansam — explicou a Lua. — Alguns chegam como uma aventura; outros são apenas uma sensação gostosa de carinho.","Lia escolheu um sonho de jardim. Imaginou flores macias, borboletas coloridas e o vento fazendo cócegas nas folhas.","A Lua cobriu a vila com seu brilho suave. As janelas se fecharam, os passarinhos dormiram em seus ninhos e até o relógio pareceu andar mais devagar.","Lia encostou a cabeça no travesseiro. A estrelinha piscou uma vez, duas vezes, três vezes… e ficou quietinha no céu.","Naquela noite, a Lua guardou o sonho de Lia com muito cuidado. E a menina adormeceu tranquila, sabendo que o céu estava cheio de histórias esperando por ela."] },
  { slug: "nino-e-a-estrela-sonolenta", title: "Nino e a Estrela Sonolenta", summary: "Uma estrela aprende que até quem ilumina precisa descansar.", groups: ["2-5"], minutes: 4, kind: "story", body: ["No alto de uma montanha vivia uma estrelinha chamada Nina. Todas as noites ela gostava de brilhar bem forte para ajudar os viajantes a encontrar o caminho.","Mas, certa noite, Nina começou a piscar devagar. Primeiro uma vez, depois outra. Um bocejo comprido escapou de sua pontinha.","— Acho que estou com sono — confessou ela à Lua.","— Então está na hora de descansar — respondeu a Lua. — Amanhã você poderá brilhar novamente.","Nina ficou preocupada. E se alguém precisasse de sua luz? A Lua chamou as outras estrelas, que se aproximaram e formaram um lindo caminho brilhante pelo céu.","— Viu só? Ninguém precisa fazer tudo sozinho — disse a Lua.","Nina se aconchegou atrás de uma nuvem fofinha. A nuvem parecia um travesseiro feito de algodão. O vento cantou uma canção baixinha e a montanha ficou em silêncio.","Antes de fechar os olhos, Nina viu que o céu continuava iluminado. Sentiu-se segura e deixou seu brilho ficar pequenininho, como uma luz de presença.","E assim a estrela sonolenta dormiu. Quando o sol nasceu, ela acordou descansada e pronta para mais uma noite de brilho."] },
  { slug: "o-coelhinho-e-o-vento-calmo", title: "O Coelhinho e o Vento Calmo", summary: "Tico descobre uma maneira tranquila de terminar um dia cheio de brincadeiras.", groups: ["2-5"], minutes: 4, kind: "story", body: ["Tico era um coelhinho curioso que adorava pular pelo campo. Naquele dia, pulou sobre pedras, correu atrás de borboletas e brincou com os amigos até o sol começar a se esconder.","Quando chegou a hora de voltar para casa, Tico ainda tinha tanta energia que suas patinhas pareciam molas.","Vovó Coelha abriu a porta e o recebeu com um abraço quentinho. Depois, preparou um cantinho confortável, colocou o pijama de Tico e fechou um pouquinho a cortina.","— Vamos ouvir o vento? — perguntou ela.","Os dois ficaram quietinhos. Lá fora, o vento passava pelas folhas: shhhhh… shhhhh… As árvores balançavam devagar, como se estivessem dando boa-noite ao campo.","Tico imaginou que cada folha estava guardando uma lembrança feliz do dia: a borboleta azul, a corrida com os amigos e o abraço da vovó.","— Meu dia foi cheio de coisas boas — sussurrou ele.","— E agora seu corpo merece uma pausa — respondeu a vovó.","Tico se aconchegou no cobertor. O vento continuou sua canção suave e a casa ficou tranquila.","Logo, o coelhinho fechou os olhos. Amanhã haveria novas brincadeiras. Mas, por enquanto, era hora de descansar."] },
  { slug: "a-nuvem-de-algodao", title: "A Nuvem de Algodão", summary: "Uma nuvenzinha passeia pelo céu e aprende a encontrar seu lugar de descanso.", groups: ["2-5"], minutes: 3, kind: "story", body: ["Bem longe, no céu azul, morava uma nuvenzinha chamada Bel. Ela gostava de passear, conhecer os passarinhos e observar os telhados lá de cima.","Quando a tarde terminou, Bel percebeu que estava cansada. Procurou um lugar macio para descansar, mas o céu parecia enorme.","Um passarinho pousou pertinho dela e perguntou: — Por que você não descansa perto da Lua?","Bel seguiu devagarinho até encontrar a Lua, que já começava a aparecer. A Lua abriu espaço ao seu lado e contou uma história sobre o primeiro raio de sol, que acordava o mundo com delicadeza.","Bel ouviu tudo em silêncio. O céu ficou azul-escuro, depois violeta, depois cheio de pontinhos brilhantes.","— Acho que encontrei meu lugar — disse a nuvenzinha.","Ela se ajeitou como um travesseiro fofinho ao lado da Lua. Lá embaixo, as casas estavam tranquilas e as famílias se preparavam para dormir.","Bel fechou os olhos. Naquela noite, sonhou que era feita de algodão-doce e que passeava por um céu de estrelas."] },
  { slug: "o-barquinho-que-descansava", title: "O Barquinho que Descansava", summary: "Um barquinho aprende que o lago também precisa de noites tranquilas.", groups: ["2-5"], minutes: 4, kind: "story", body: ["No meio de um lago calmo havia um barquinho amarelo chamado Sol. Durante o dia, ele gostava de levar patinhos para passear e observar os peixinhos que nadavam lá embaixo.","Quando o céu começou a escurecer, Sol ainda queria continuar navegando.","— Amanhã tem mais passeio — disse o velho farol, piscando sua luz amiga. — Agora o lago vai descansar.","Sol olhou ao redor. Os patinhos já estavam juntinhos perto da mamãe, os peixinhos procuravam seus cantinhos e as árvores não mexiam quase nada.","Uma brisa leve empurrou o barquinho até a margem. Ali, a água fazia um som baixinho: ploc… ploc… ploc…","Sol percebeu que não precisava correr para aproveitar todos os momentos. Algumas das coisas mais bonitas aconteciam quando tudo ficava quieto.","Ele se acomodou junto à margem e olhou para o céu. Uma estrela apareceu, depois outra, e mais outra.","— Boa noite, lago — sussurrou Sol.","O farol piscou uma última vez. O barquinho ficou quietinho, balançando suavemente até adormecer sob o céu estrelado."] },
  { slug: "a-floresta-que-bocejava", title: "A Floresta que Bocejava", summary: "Os animais da floresta se despedem do dia com calma e carinho.", groups: ["2-5"], minutes: 4, kind: "story", body: ["Na Floresta do Sossego, o dia terminava sempre com um grande bocejo. Primeiro bocejava o urso, depois a raposa, em seguida os esquilos e até as corujas piscavam os olhos bem devagar.","Naquela noite, o pequeno ouriço Pipo ainda estava acordado. Ele caminhou pela trilha e encontrou seus amigos se preparando para dormir.","O urso ajeitava sua cama de folhas. A raposa procurava um lugar quentinho. Os esquilos guardavam as últimas sementinhas.","— Como vocês sabem que chegou a hora? — perguntou Pipo.","— A floresta fica mais silenciosa — respondeu o urso. — E nosso corpo pede descanso.","Pipo parou para escutar. Ouviu o riacho cantar baixinho, as folhas se encostarem e um grilo fazer sua música tranquila.","Ele voltou para sua toca, deu boa-noite aos amigos e se enrolou em uma caminha macia de folhas secas.","Do lado de fora, a Lua iluminava a trilha. A floresta inteira parecia respirar devagar.","Pipo deu um bocejo pequenininho. Depois outro. E, antes que a coruja terminasse sua canção, o ouriço já estava dormindo.","A Floresta do Sossego ficou em paz até o primeiro raio de sol chegar."] }
];

export const ALL_CONTENT: Article[] = [...ARTICLES, ...STORIES];

export function isArticleFree(a: Article) {
  return !!a.free;
}
