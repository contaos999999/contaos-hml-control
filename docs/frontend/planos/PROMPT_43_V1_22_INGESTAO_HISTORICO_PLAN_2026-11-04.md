# PLAN do PROMPT regular 43 / V1-22 — Ingestão de histórico

**04/11/2026, horário de Brasília | PLAN documental para validação posterior; NÃO AUTORIZA BUILD.**

## Regra P0, fontes e proveniência
- Fase vigente V1, próximo regular **43/V1-22**; seguir **75/V1-23** e então auditoria/ certificação V1; não abrir V2.
- Baseline frontend `contaos999999/contaos-hml-control/main@48ff81d804247bfa48be93afcfcaa947c48ecd0d`; normativo `contaos999999/develop/main@c2bf86d011da6bfd3abaa70de38e7a722ae629de`, snapshot 25/25 blobs correspondente e catálogo `e54e49e626e65a9c94c81709180fd192a1f0c079`.
- Manual original de 100 prompts SHA-256 `8a15d96568d021ac86fdd45e79038e2cb969d69c12b2edb84f012a6129b8940e`; caderno 97 atômicos SHA-256 `d9faaae47de4b697b18ad7fb71e4738384514936813cd5b18779f4cb8aed83b8`. Fonte recuperada e conferida em `PROMPT_43_V1_22_FONTE_ORIGINAL_VERIFICADA_2026-11-04.md`. Rota original: `/contratos/:id/historico/importar` com acesso gestão. A fonte original não foi alterada.
- Requisitos V1-HIS-001 a 005, atômicos `000,006,007,008,009,010`, NFRs `085–096` triados transversalmente. NFR-003/004: upload direto certificado; NFR-005/006: execução assíncrona; NFR-007/008: dupla submissão, idempotência, revisão; NFR-009–012: recuperação, limites, rastreabilidade e segurança.
- Decisão expressa do titular em 04/11/2026: **não executar** no presente ciclo os três ensaios operacionais (i) upload real; (ii) processamento real do worker; (iii) isolamento real entre usuários. **Não transformar dispensa de testes em afirmação de PASS operacional.** RLS HML A/B permanece facultativo após regular 99 e não bloqueante isoladamente conforme P0.

## Contratos backend HML confirmados, sem alterações de schema
Projeto de homologação exclusivamente `gklhhhyosgasnyoxlrui`. SQL read-only e run `41939010108` comprovaram conexão, as RPCs, e cron ativo. A verificação documental de código confirmou:
1. `storage-sign-upload` + `enviarArquivoCertificado` (reuso V1-10/V1-15) faz upload direto autorizado, hash SHA-256 e `confirmar_upload_arquivo`, preservando `arquivos` com status de segurança.
2. `criar_documento_contrato_completo` preexistente cria versão `versoes_documento` e fila `documents` automaticamente, com chave idempotente, retornando `id_versao`. Se o arquivo estiver em quarentena/bloqueado, a RPC recusa.
3. `registrar_relatorio_historico_hml(p_id_arquivo,p_competencia,p_tipo)` exige sessão, gestão, arquivo aprovado, competência no primeiro dia do mês e aceita tipos `relatorio_contratante`, `parecer_contratante`, `resposta_contratante`, `outro`. Repetição pelo mesmo arquivo é idempotente.
4. `enfileirar_ingestao_historica_hml(p_id_relatorio,p_id_versao_documento)` exige versão do mesmo arquivo/tenant/contrato e processamento documental concluído. Worker dedicado e cron ativos; isso **não** é prova de execução real.
5. `vincular_tratamento_historico_hml(p_id_apontamento,p_resposta,p_desfecho,p_fundamento)` exige gestão, contrato e resposta/desfecho não vazio. Regra preventiva obrigatória não será gerada sem revisão humana: `promover_precedente_para_regra` / `aprovar_regra_preventiva` mantêm gate próprio.
6. RLS Data API é autoridade; preferências locais/controle visual de perfil não autorizam nada. Confirmar autorização por usuário e validação de retorno a cada contrato e organização.

## BUILD fechado: arquivos permitidos e sequência
Apenas no GitHub frontend, depois de PLAN CI + GATE VALIDADO em PR separado. Nenhuma alteração de backend/HML, PROD, migrations, Auth, RLS, Edges, secrets, marca ou `src/integrations/supabase/types.ts` imutável.

Allowlist:
- `src/lib/contratos/ingestaoHistoricoDados.ts` (NOVO: orquestração somente através de RPCs/cliente oficial, sem decisão de autorização própria);
- `src/components/contratos/ImportarHistorico.tsx` (NOVO: fluxo responsivo, foco/teclado, batch sequencial e estados seguros);
- `src/routes/contratos_.$id_.historico_.importar.tsx` (NOVO: route file TanStack);
- `src/components/contratos/HistoricoContrato.tsx` (atalho contextual de gestão para a importação, sem mudar histórico existente);
- `src/routeTree.gen.ts` (**geração real pelo TanStack/Vite**, nunca composição manual);
- `src/test/ingestaoHistorico.test.tsx` (NOVO: TDD focado, sem chamadas HML reais);
- `scripts/testc/visual-audit.mjs` e `scripts/testc/visual-audit.test.mjs` (cadastro da rota e cobertura Teste C);
- `src/test/brand.test.tsx` (se a nova rota exigir validação visual);
- `docs/frontend/auditorias/PROMPT_43_V122_TESTES_2026-11-04.md`;
- `docs/frontend/ESTADO_E_RETOMADA_CONTAOS_4_1.md`.

Fluxo proposto (usuário gestão, contrato corrente validado): escolher um ou vários arquivos, competência mês/ano e tipo por arquivo → validar formato/tamanho exclusivamente a partir de `configuracao_upload` → upload existente via Storage privado e URL temporária → registrar como documento contratual/versionado usando RPC existente → mostrar `pendente` enquanto segurança e documentos não estiverem aprovados/concluídos (sem tentar saltar verificação) → **quando confirmado** arquivo aprovado e processamento genérico concluído, registrar relatório histórico e solicitar fila dedicada via RPC oficial → mostrar status real, apontamentos e vincular resposta/desfecho a partir de IDs verificados e ação de gestão. Regras preventivas só candidatas por RPC oficial e revisão humana, nunca por conclusão automática do navegador. Registros já importados não são recriados em retry; manter chave idempotente por arquivo/intenção, lock anti-duplo clique e reconciliar retorno sob RLS. Não tratar upload em pendência como sucesso de ingestão.

A interface não pode afirmar que todos os formatos são extraídos: worker atual é conservador por marcadores. A regra de UX explicitará revisão humana, indicação de formato não processado e vinculação manual por procedimento autorizado, sem extrapolar resultado. **Não executar worker real neste ciclo**, nem afirmar cobertura de formatos sem evidência.

## Matriz de aceitação, evidências, segurança e estados
| Requisito | Implementação | Prova exigida |
| --- | --- | --- |
| 43 / V1-HIS-001 / 006 | vários arquivos, associação por competência, upload/versão/registro por RPC existente | teste lote 1/2/n, falha parcial/retry, data válida/invalidada |
| V1-HIS-002 / 007 | exibir processamento, apontamentos individuais com fonte e documento original | teste mocks status/página/trecho, sem geração local |
| V1-HIS-003 / 008 | operação de vinculação resposta/desfecho através de RPC oficial | teste texto vazio, 401/403/409 e vínculo por ID do relatório corrente |
| V1-HIS-004 / 009 | apenas regra candidata e aprovação humana RPC; nunca status vinculante automático | assert negativo sem autoprovação |
| V1-HIS-005 / 010 | utilizar consultas V1-21 e retorno ao histórico escopado | teste contrato/organização e navegação sem vazamento |
| BRAND-01 / 000 | `ContaOSMarca`, tokens/theme/gradientes existentes, logo transparente | 4 larguras × 2 temas, sem sobreposição |
| NFR 085–096 | reuso assíncrono direto, limites/tamanho, estado e cancelamento, idempotência, mensagens PT-BR, acesso e logs sem segredos | Vitest, typecheck, CI, TESTE C independente conforme escopo |

Estados UI: autenticação/carregamento/ausência de autorização/contrato inexistente, configuração falhou, nenhum arquivo, arquivo inválido, andamento por arquivo, segurança pendente, bloqueado, documento em processamento, pronto para enfileirar, enfileirado, concluído, falha, retry explícito e sugestão para revisão humana. Mensagens PT-BR; datas de competência `01/MM/AAAA` no banco e `MM/AAAA` na tela (Brasília), página com label e foco, teclado, contraste acessível em 1440/1280/768/390, claro/escuro; alertas sem IDs/paths sensíveis. Abort ao trocar contrato, sem dados stale do outro tenant. Não injetar HTML, não interpretar resposta de erro bruto do backend.

## PLAN/GATE/BUILD/Teste C e rollback
1. Este PLAN em PR exclusivamente documental; aguardar dois checks CI SUCCESS no SHA final, merge protegido.
2. GATE separado em PR exclusivamente documental atualiza `PLANO_ATIVO.json` para 43 VALIDADO após revalidar 25 fontes, crosswalk e ci do PLAN. Se algum gate incompleto, permanecer bloqueado e corrigir.
3. BUILD somente depois de merge do GATE. TDD RED por testes de módulo ausente, GREEN com mocks de RPCs e storage, regressão Vitest, TypeScript, lint, build e GOV-020 com `routeTree.gen.ts` produzido pelo gerador oficial. Dois checks obrigatórios SUCCESS no mesmo SHA. Teste C sem sessão real não finge teste operacional.
4. Registrar dossiê por critério PASS/FAIL/NÃO VERIFICADO; evidências, HEAD, PR, artefatos, hash do `types.ts`, riscos/rollback; atualizar checkpoint no GitHub.
5. O recebimento do presente PLAN não é certificação V1-22. As três exceções operacionais devem continuar explicitamente `NÃO VERIFICADO POR DECISÃO DO TITULAR` e não constituem autorização de PROD. Se restar qualquer outra lacuna, certificar como PENDENTE, nunca PASS.

## ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE (OBRIGATÓRIO)
REUTILIZAR > ESTENDER > CRIAR. Manter `ContaOSMarca`, logomarca transparente oficial, Design System, tokens de cor, tipografia, spacing e estados. Código frontend exclusivamente GitHub; Lovable somente sincronização/visualização, sem IA BUILD. Responsividade 4×2 + Teste C; `routeTree.gen.ts` gerada pelo TanStack, nunca editada manualmente. Manter imutáveis 25 fontes/100 regulares/97 atômicos, RLS, segurança, dados e `types.ts`. Economia de créditos não relaxa gates. Rollback só por PR revertendo alterações frontend, sem modificação de dados HML nem PROD.

**Status atual do PLAN:** criado; validação formal, CI e integração ainda não concluídos.
