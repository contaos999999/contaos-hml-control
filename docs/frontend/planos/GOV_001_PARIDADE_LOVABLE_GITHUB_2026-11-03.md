# GOV-001 — PROMPT / PLAN e validação: paridade de regras Lovable × GitHub
**Estado:** PLAN VALIDADO no escopo de governança do FRONTEND, sem BUILD funcional · **Data:** 03/11/2026
**Gatilho:** pedido expresso de comparar profundamente e assegurar o mesmo rigor do processo anterior. **Objeto:** controles de GOVERNANÇA do frontend, sem alterar app.

## PROMPT e fontes vinculantes
- **Regular 00–99:** preservar 100 textos de origem; **atômicos 000–096:** preservar 97 itens e cobertura de requisitos 96/96; nenhuma reenumeração. GOV-001 não é PROMPT 40 nem novo requisito de produto.
- Fonte normativa: `contaos9999/develop` no commit `cb65f4980f4eeca6ccd33caf6198a801b7e60328`, documentação `00_AI_LEIA_ANTES_DE_ALTERAR.md`, `07_ZERO_DRIFT_GOVERNANCA_4_1.md` §§6–11, `12_PROMPTS_PROTOCOLO_IMPLEMENTACAO_4_1.md` §§2,3,9, `14_CHECKLIST_PRE_ALTERACAO.md`, `19_IDENTIDADE_VISUAL_OFICIAL_BRAND_1_0.md`, `20_PROMPT_000_BRAND_01.md`, `docs/prompts/PROMPT_TRACKS_4_1.json`; demais documentos `01–20` + `08A–08D` constam de `CONTEXT_CANONICO_4_1_SNAPSHOT.json`.
- Linha de base frontend: `a3d5eb316c7f889db8538eb2d8d9cd256a185d56`; CI https://github.com/contaos9999/contaos-hml-control/actions/runs/41730684049 (SUCCESS, 812/812).

## PLAN mínimo
**Diagnóstico 1:** gate existente `scripts/frontend-scope-gate.mjs` valida PLAN/allowlist, mas não exige reconhecimento dos 25 documentos canônicos, fingerprint da origem, ID/correspondência de prompts, nem presença textual do bloco Zero-Drift do §11.3 no PLAN.

**Diagnóstico 2:** pipeline faz regressão 812, TS, lint, build, marca e guard, mas a aprovação de PLAN não prova por si só revisão integral do contexto; Teste C visual independente e testes RLS A/B reais continuam manuais. Devem permanecer NO-GO sem prova.

**Diagnóstico 3:** controle de PR calcula plano pelo merge-base, portanto pode rejeitar plano aprovado apenas na branch. Ajustar exclusivamente guard para localizar o commit documental anterior ao primeiro BUILD, exigindo verificação do plano em histórico e URL real de CI; não reduzir proteção.

**Escopo autorizado exato do BUILD (governança frontend apenas):**
- `docs/frontend/CONTEXT_CANONICO_4_1_SNAPSHOT.json` novo, com 25 arquivos e SHAs do repo de fonte;
- `docs/frontend/ADR-DEV-002-PROMPT-PLAN-GATE-BUILD-TESTEC.md` adicionar cláusula de contexto/crosswalk sem modificar política existente;
- `docs/frontend/planos/TEMPLATE_PROMPT_PLAN_GATE.md` exigir todos os campos do contexto, atomics e bloco literal;
- `docs/frontend/planos/PLANO_ATIVO.json` manter SEM_PLANO_ATIVO; adicionar campos vazios para novos gates, sem ativar BUILD;
- `scripts/frontend-scope-gate.mjs` validar PLAN em SHA anterior, contexto/metadata, prompt/atômicos, seção literal, aprovações e allowlist; corrigir PR sem bypass;
- `scripts/frontend-scope-gate.test.mjs` adicionar positivos e negativos para esses cenários;
- `docs/frontend/ESTADO_E_RETOMADA_CONTAOS_4_1.md` registrar o novo compromisso.
- `.github/workflows/contaos-frontend-zero-drift.yml` **não previsto**, salvo falha reprodutível que exija novo PLAN. Não alterar o CI neste BUILD.
- Nenhum `src/**`, `public/**`, `package.json`, `bun.lock`, `src/integrations/supabase/**`, `supabase/**`, `contaos9999/develop`, schema, RPC, RLS, Auth, Edge, Storage, migrations ou PROD.

## Validação do PLAN (feita sem mudar aplicação)
| Gate | Resultado | Fundamentação |
| --- | --- | --- |
| Hierarquia de autoridade PRD 4.1, Premissas, Arquitetura, Zero-Drift | PASS | Contratos canônicos, sem alteração |
| PROMPT 00–99 e atômicos 000–096, BRAND-01 | PASS (escopo governança) | Integridade do catálogo original confirmada; não confundir cobertura com execução |
| Escopo fechado, backend/PROD/types.ts imutáveis | PASS | Lista explícita e restrita do BUILD documental/gate |
| Sem mudança visual/funcional | PASS, impacto_visual N/A | Não altera React/rotas/design/assets |
| TDD red/green, testes de branch PR, CI 812/812 | PASS (plano prevê ensaios), BUILD NÃO EXECUTADO | Teste de guard sintético, cobertura de aprovação/documento/branch/backend |
| Auditoria visual Teste C | N/A neste BUILD exclusivo de governança; obrigatório em futuras mudanças de UI | O fluxo não muda interface |
| Aprovação humana específica BRAND-01 | N/A | Nenhuma mudança de BRAND-01 é permitida |
| Backend HML, lacuna/backend | N/A | Sem investigação ou alteração backend; gate separado exige autorização |
| Risco residual | ACEITO SOMENTE PARA GATE DOCUMENTAL | CI é pós-push; branch protection indisponível e browser real não automatizado |

**Decisão técnica:** PLAN válido para **controles de governança frontend**. Nunca autoriza código funcional nem altera `PLANO_ATIVO.json` para VALIDADO. A própria governança já autorizada pelo usuário requer mesmo processo PLAN→ validação→ BUILD→CI.

## ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE (OBRIGATÓRIO)
Marca: ContaOS Brand v1.0 / BRAND-01; ler 19_IDENTIDADE_VISUAL_OFICIAL_BRAND_1_0.md e 20_PROMPT_000_BRAND_01.md para qualquer alteração frontend. Preservar assets oficiais, ContaOSMarca, Design System e tokens (REUTILIZAR > ESTENDER > CRIAR), componentes e estados; sem hardcodes, redesign ou bibliotecas paralelas. PLAN deve informar baseline visual, riscos e matriz de aceite; BUILD deve manter consistência; TESTE/TESTE C devem provar 1440/1280/768/390 nos temas claro/escuro, acessibilidade, marca e estados, sem alterações durante Teste C. Se prompt não envolver frontend, declarar impacto visual N/A justificado e garantir ausência de alteração visual.
Economia Lovable: checar turno/estado/commit antes de enviar; usar GitHub e Supabase diretamente quando possível; consolidar instruções; executar o menor delta; reutilizar testes/evidências válidos; não reenviar turno pendente nem duplicar builds/scans; nunca pular aprovação humana obrigatória, TDD, segurança, CI, Zero-Drift, fidelidade ao PRD, validação visual ou Teste C separado.
Entregar evidências e classificar: IDENTIDADE VISUAL PASS/FAIL/NÃO VERIFICADO/N/A; ECONOMIA LOVABLE CONFORME/NÃO CONFORME; ZERO-DRIFT PASS/FAIL. Sem prova não declarar PASS.

## Conclusão do PLAN
Somente depois de CI verde do **commit documental deste PLAN**, aplicar as correções exclusivamente no guard do frontend. Verificar hash types, 5+ casos de teste, PR, lint, suite completa, typecheck, build e Zero-Drift. Se qualquer gate falhar, retornar PLAN e ajustar, sem tocar backend nem PROD.
