# Hotmart — diagnóstico e correções

## 1. O que foi confirmado

Consulta ao banco compartilhado pela versão publicada e pelo preview, em 28/11/2026:

- A conta correspondente ao e-mail informado existe desde 23/11/2026 e está confirmada.
- `profiles.is_premium` está `false`; `premium_until` está vazio.
- Não existe compra correspondente em `pending_premium`. A tabela estava vazia.
- O endereço publicado rejeitou uma requisição sem HOTTOK com HTTP 401.
- Não havia registros do webhook disponíveis na janela de logs consultada, de uma hora.

**A causa histórica exata da transação HP2265225775 não foi comprovada.** O código anterior podia responder HTTP 200 ao ignorar um evento sem e-mail ou não reconhecido, e também não diferenciava compras pendentes de ativações. Não guardava transação, evento ou data original, impossibilitando reconstruir o processamento. O JSON original e a data da aprovação não foram fornecidos; a resposta à solicitação foi o token, que não comprova o conteúdo do evento.

Falhas comprovadas no código anterior:

- Recuperação de pendências apenas na criação da conta, sem recuperação para contas existentes e sem coordenação atômica com o webhook.
- Busca pelo e-mail editável de `profiles`, em vez da identidade de cadastro.
- Ausência de atualização periódica do acesso enquanto a pessoa aguardava pagamento.
- Prazo calculado a partir de cada recebimento: reenvios podiam prolongá-lo.
- Ausência de validação do status aprovado e aceitação de ofertas desconhecidas como mensais.
- O banco permitia alteração do próprio campo Premium por usuários autenticados; essa permissão foi removida.

## 2. Correções

- Aprovação exige evento de ativação, status `APPROVED` ou `COMPLETE`, transação, e-mail válido, oferta conhecida e data do evento.
- E-mails são normalizados antes da validação: espaços removidos e letras minúsculas.
- O vínculo é feito pelo e-mail de cadastro em `auth.users`, não por um campo de perfil editável.
- `process_hotmart_event` faz o registro e a atualização em uma única operação atômica, com bloqueio por e-mail.
- Registro em `hotmart_events`, restrito ao serviço de pagamentos; chave única por transação/evento.
- Validade ancorada na data original de aprovação; reenvios e os eventos APPROVED/COMPLETE da mesma transação não acrescentam dias.
- Eventos antigos não sobrescrevem eventos posteriores. Uma transação revogada não é reativada por aprovação atrasada.
- Compras sem perfil ficam pendentes e são vinculadas automaticamente ao criar o perfil.
- Contas existentes recuperam pendências ao consultar o acesso; o vínculo usa somente a identidade autenticada e confirmada.
- Acesso consultado a cada 15 segundos enquanto bloqueado, a cada minuto enquanto ativo e ao voltar à aba; consultas de outras telas são atualizadas quando o plano muda.
- HTTP 200 para ativação/desativação concluída ou reenvio já concluído; HTTP 202 com estado explícito para pendência, evento ignorado ou antigo; 401 para token inválido; 422 para compra inválida; 500 para falha de gravação.
- Cancelamento de renovação continua preservando o período pago. Reembolso, chargeback, protesto e expiração revogam o acesso.

## 3. Planos

- Mensal: oferta `i1qgmmj1`, 35 dias desde a aprovação (30 + margem técnica existente).
- Anual: oferta `gjv109ka`, 370 dias desde a aprovação (365 + margem técnica existente).
- Links públicos de checkout existentes foram preservados. Ofertas desconhecidas são rejeitadas.
- Preço, duração contratual, teste grátis e configuração das ofertas dentro da Hotmart não foram verificados no painel da Hotmart. Não houve alteração desses valores.

## 4. Arquivos

Funcionais:

- `src/routes/api/public/hotmart-webhook.ts`
- `src/lib/hotmart-webhook.ts` (novo)
- `src/lib/hotmart.ts`
- `src/lib/app-data.tsx`
- `drizzle/migrations/0001_hotmart_atomic_entitlements.sql` (aplicada)

Testes:

- `src/lib/hotmart.test.ts`
- `src/lib/hotmart-webhook.test.ts` (novo)
- `src/lib/app-data.test.tsx` (novo)

Documentação: `AGENTS.md`, `roadmap.md` e este relatório. A ferramenta de migração também atualizou os tipos gerados e os arquivos de controle de migrações.

Não foram alterados layout, funcionalidades de sono, cadastros de bebês ou textos da interface.

## 5. Migração

**Já aplicada ao banco compartilhado**, sem ação manual adicional. Cria o registro de eventos, funções atômicas, vinculação de pendências e restringe edição dos campos de assinatura. A versão nova do aplicativo/webhook ainda precisa ser publicada para chegar ao endereço público.

## 6. Testes efetivamente realizados

- 32 testes automatizados passaram: pagamento, status de assinatura, cálculo de sono e roteamento.
- Verificação automática da compilação: `build OK`.
- Conta temporária autenticada, sem Premium: enviada uma aprovação sintética com HOTTOK configurado; resposta `activated`, e a tela mudou para o cadastro inicial sem recarregar nem entrar novamente.
- Mesmo evento reenviado: `duplicate`, com validade idêntica.
- Cancelamento de renovação: `ignored`, HTTP 202, acesso preservado.
- Reembolso: `deactivated`; bloqueio reapareceu automaticamente.
- APPROVED/COMPLETE da transação revogada: `stale`, sem reativação.
- Conta existente com pendência: abertura do app recuperou Premium; consulta ao banco confirmou Premium ativo e pendência removida.
- Inserção de perfil temporário com uma pendência anterior e e-mail com espaços/maiúsculas: o vínculo automático ativou Premium e removeu a pendência. Esse teste validou o gatilho de perfil, não uma inscrição completa pelo formulário com confirmação de e-mail.
- Nenhum erro de página observado no teste de navegador. Registros sintéticos foram removidos e o Premium da conta temporária foi desativado após os testes.

**Não foi testada uma compra real no checkout da Hotmart, nem foi ativada manualmente a cliente.** Sua conta continua sem Premium até recebermos o evento original válido ou seu reenvio. Nenhuma data de pagamento foi inventada.

## 7. Como confirmar a compra real

1. Publicar a versão corrigida.
2. Conferir na Hotmart o destino: `https://doce-sonho-soneca-certa.lovable.app/api/public/hotmart-webhook`.
3. Reenviar o evento original `PURCHASE_APPROVED` da transação HP2265225775, com `data.purchase.status`, `data.purchase.transaction`, `data.purchase.offer.code`, e-mail e data original de aprovação; manter a autenticação HOTTOK configurada.
4. Para a conta existente, esperar HTTP 200 com `status: activated` (ou `duplicate` caso já processada). HTTP 202 `pending` não significa acesso liberado.
5. Confirmar `profiles.is_premium = true` e validade igual à aprovação original + 35 dias; o registro deve aparecer em `hotmart_events`.
6. Com a cliente na tela bloqueada, aguardar até 15 segundos com a aba ativa, ou voltar à aba. Não deve ser necessário sair e entrar.
7. Reenviar novamente: esperar `duplicate`, sem mudança de validade.

Se a aprovação original ocorreu há mais de 35 dias, o reenvio não deve criar um novo período: é necessário verificar a renovação aprovada mais recente.