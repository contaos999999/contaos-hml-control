# F3 BUILD S4: driver UI e consumidor V113 de criação de competência

**Missão:** issue #708 e catálogo fixo de 138 relações F3. **Norma:** emenda CODE vs GATE PROD PR #722. **Dependências:** S1 e S2 integradas, contratos de mutação S3 PR #729. Esta fatia é somente código verificável, sem credenciais nem execução LIVE.

## Fluxo e invariantes

1. Requer no livro F3 organização criada de SYS04 e contrato isolado criado e confirmado pelo produtor 7 V105, todos vinculados à mesma organização F3. Rejeita UUID externo ou registro sem vínculo.
2. Navega pela rota real `/contratos/{id}/competencias/nova`, espera o título `Nova competência` e o campo `#v113-mes` efetivamente visível, não aceita atalho por chamada RPC do runner.
3. Preenche mês corrente `YYYY-MM`; UI real converte para referência `YYYY-MM-01`. A cerca `createF3MutationFence` observa exclusivamente `POST /rest/v1/rpc/criar_competencia` com `p_id_contrato` do inventário e `p_competencia_referencia` daquela UI.
4. Confere status 200 e UUID da RPC (fonte `src/lib/contratos/novaCompetenciaDados.ts:66-80`). Antes de confirmar a intenção, exige estado de sucesso da UI e `settle()` completo da cerca.
5. Navega ao consumidor real `/contratos/{id}/competencias` e observa a leitura RLS `GET /rest/v1/competencias` com filtro `id_contrato=eq.{contratoF3}`. Somente aceita o UUID da RPC se existir exatamente uma linha naquele contrato e competência. Zero, duas, divergência de id/período ou rota falsa reprovam.
6. Só depois do readback registra a entidade no livro `book.confirm` e verifica o isolamento; qualquer erro posterior ao selo registra incerteza e não permite reenvio automático, em coerência com `F3_FLUXOS_PRODUTORES.md` e a ausência de chave em V113.

## Provas desta fatia

Os testes do driver usam a cerca e o livro de intenções reais do executor, mantendo apenas o transporte/DOM simulado. Conferem POST único, consumidor após mutação, identidade guardada, vínculo correto, negativas de UUID, cardinalidade, mês e contrato de outro escopo. Não marcam os casos `IFV1-F3-Cxxxx` como PASS: a interação ponta-a-ponta com todos os consumidores ainda exige matriz própria `caseId → teste → resultado → HEAD → run/job → hash`.

## Limites e bloqueios

Não altera o produto, Supabase, RLS, tabelas, Edge Functions ou PROD; não escreve em F3_CODE_EVIDENCE_LEDGER ou F3_LEDGER. Não libera a Fase 4. Demais produtores 9, 11–13, 15, 17 e 20 e a integração dos consumidores permanecem pendentes. As contraprovas LIVE permanecem exclusivas do GATE PROD após V1–V5 CODE certificados.
