# Doce Sonho Soneca Certa

Crie do zero o app "Doce Sonho": um micro SaaS por assinatura de apoio ao sono de bebês de 0 a 5 anos e ao descanso de quem cuida. Este projeto é SOMENTE o aplicativo (área de membros). NÃO crie página de vendas nem landing de venda: a página de vendas é um projeto separado. A rota "/" deve levar para /entrar quando a pessoa não estiver logada e para /app quando estiver.

TOM E VISUAL
- Tom neutro, calmo e informativo: frases curtas, sem diminutivos em excesso, sem alarmismo, sem promessas de cura e sem aconselhamento médico. Português do Brasil. Centralize todos os textos da interface em um único arquivo de strings para facilitar traduzir depois para espanhol neutro.
- Visual acolhedor e limpo: fundo creme (#FFF5E9), tons pastel (pêssego, azul-céu suave, lavanda), tipografia arredondada, cantos arredondados, mobile-first, boa acessibilidade e modo escuro suave opcional.

Use Lovable Cloud (autenticação e banco) com RLS em todas as tabelas.

ROTAS PÚBLICAS
1) "/entrar" e "/criar-conta": e-mail + senha, com "esqueci minha senha" e rota /redefinir-senha. Após o login, redirecionar para /app.
2) "/calculadora": Calculadora de Janelas de Sono, grátis e sem login. A pessoa informa a idade do bebê (em meses, 0 a 60) e o horário em que ele acordou. O app mostra: janela de vigília sugerida para a idade, horários estimados das sonecas, número esperado de sonecas e horário sugerido para dormir à noite. Use uma tabela de referência por faixa etária no código, com o aviso "são médias de referência; cada bebê é único". No fim, botão para criar conta e campo opcional para deixar o e-mail (tabela leads).

ÁREA LOGADA (/app, protegida)
- Onboarding: cadastrar o bebê (nome e data de nascimento). Vários bebês por conta, com seletor para alternar.
- Início: resumo do dia (horas dormidas, sonecas, despertares), próxima janela de sono sugerida e botão rápido "Registrar soneca" / "Dormiu agora" com cronômetro.
- Diário do sono: registrar sonecas, sono noturno e despertares (início, fim, como adormeceu, humor ao acordar, observações). Editar e excluir registros. Permitir inserir registro manual com data e hora.
- Relatórios: gráficos (recharts) de horas de sono por dia nos últimos 7 e 30 dias, média de sonecas, horário médio de dormir e de acordar, e número médio de despertares.
- Rotina do bebê: sugestão de rotina diária por idade (acordar, sonecas, refeições de referência, dormir), editável e salva por bebê.
- Rotina da hora de dormir: checklist personalizável (banho, pijama, luz baixa, historinha etc.) com marcação diária e sequência de dias.
- Sons relaxantes: ruído branco, ruído rosa, chuva e oceano gerados pela Web Audio API (sem arquivos externos), com timer de desligamento e controle de volume.
- Biblioteca de conteúdos: artigos curtos por faixa etária (recém-nascido, 3 a 6 meses, 6 a 12 meses, 1 a 2 anos, 2 a 5 anos) sobre sono seguro, regressões de sono, desmame da mamada noturna, transição de sonecas, medos e pesadelos. Inclua orientações de sono seguro (bebê de barriga para cima, berço firme e livre de objetos soltos). Busca e favoritos.
- Cuidador: registro rápido de como a pessoa está (descanso e energia de 1 a 5, observação) e dicas de autocuidado.
- Conta: editar perfil, trocar senha, ver plano atual, sair, excluir conta.

PLANOS
- Grátis: calculadora, 1 bebê, diário dos últimos 7 dias, 3 conteúdos e 1 som.
- Premium (assinatura mensal vendida na Hotmart): bebês ilimitados, histórico completo, relatórios de 30 dias, rotinas, todos os sons e toda a biblioteca.
- Tabelas: profiles (com is_premium e premium_until), babies, sleep_logs, wakeups, routines, bedtime_checklist_items, bedtime_checklist_days, caregiver_checkins, favorites, leads, pending_premium. Papéis de usuário em tabela separada. Tudo com RLS por user_id.
- Edge function pública "hotmart-webhook": recebe o webhook da Hotmart, valida o token secreto (secret HOTMART_HOTTOK) e ativa ou desativa o Premium pelo e-mail do comprador conforme o evento (compra aprovada, assinatura cancelada, reembolso, chargeback). Se o e-mail ainda não tiver conta, guarde em pending_premium e aplique quando a pessoa criar a conta com esse e-mail.
- Telas premium bloqueadas mostram um paywall discreto com botão "Assinar o Premium" que abre uma URL configurável de checkout (variável de configuração editável depois).

QUALIDADE
- Rodapé com o aviso: "O Doce Sonho oferece apoio informativo e não substitui o acompanhamento do pediatra."
- Meta tags com título "Doce Sonho" e theme-color #FFF5E9.
- Estados de carregamento, vazios e de erro tratados; layout responsivo e acessível; navegação inferior fixa no celular.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://doce-sonho-soneca-certa.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/998dba41-5f81-41a2-afa4-132fe9579088).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
