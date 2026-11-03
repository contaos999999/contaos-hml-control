# GOV-002 — PROMPT / PLAN: fechar quatro lacunas operacionais da migração Lovable → GitHub
**Data:** 03/11/2026 · **Modo:** PLAN exclusivamente documental, sem BUILD da aplicação · **Frontend canônico:** `contaos9999/contaos-hml-control` no SHA `823165b8a000d73283907579b76c70b4aec5c78f`.

## Objetivo e invariantes
Resolver o máximo possível dos quatro impedimentos registrados na auditoria de paridade, sem tocar código funcional (`src/**`, `public/**`, package/lock), schema, RLS, RPC, Auth, dados, migrações, segredos, `contaos9999/develop` ou PROD. **Supabase continua autoridade exclusiva**. Requisito de autorização humana específica para investigar lacuna do backend permanece absoluto. Nenhum teste fabricado conta como prova HML A/B.

## Origem e requisitos
PRD Mestre 4.1; Premissas; Arquitetura; `07_ZERO_DRIFT_GOVERNANCA_4_1.md` §§6–11; `12_PROMPTS_PROTOCOLO_IMPLEMENTACAO_4_1.md` §§2–9; `19_IDENTIDADE_VISUAL_OFICIAL_BRAND_1_0.md`, `20_PROMPT_000_BRAND_01.md`, `docs/prompts/PROMPT_TRACKS_4_1.json`. Regular 00–99 (100), atômicos 000–096 (97, sendo 000 BRAND-01), matriz 96/96 NFR/PRD. SNAPSHOT: `docs/frontend/CONTEXT_CANONICO_4_1_SNAPSHOT.json`, backend documental HEAD `cb65f4980f4eeca6ccd33caf6198a801b7e60328`. Nenhum prompt novo é inventado; GOV-002 é rito técnico de governança, não funcionalidade.

## Gate 1: Teste C independente
Implantar GitHub Actions **separado** do BUILD: disparar depois de CI Zero-Drift SUCCESS da mesma revisão, e sob solicitação manual. Checkout do commit imutável; instalar Playwright versionado e Chromium fora das dependências funcionais; rodar servidor isolado do próprio checkout; inspecionar 4 larguras (1440/1280/768/390) × 2 temas em 23 telas, usando navegador público SEM credenciais. Capturar telas públicas e estados de acesso negado/sem sessão, logs públicos, manifesto SHA256, metadados da revisão, erros e `PASS / FAIL / NÃO VERIFICADO` por rota. Armazenar PNG/JSON por 30 dias em GitHub Actions, sem cookies, tokens ou dados reais. Telas internas só com MOCK/sem sessão **NÃO** contam como E2E HML real. Se não houver executor disponível, gate FAIL, sem ignorar.

## Gate 2: Branch e aprovação
Permissões/planos impedem que este conector ative proteção obrigatória do `main`. Documentar clique por clique no GitHub privado, exigindo GitHub Pro/Team para Ruleset/branch protection com PR, revisão independente, status checks do CI frontend e Teste C, bloqueio force-push e bypass (conforme disponibilidade). Nada de expor repositório privado ao público para contornar limitação. Anotar que `workflow_run` pode publicar check em SHA diferente do PR; não designar como required até validar aplicação por PR. Campos "PASS" declaratórios não substituem evento GitHub real.

## Gate 3: E2E real no HML
Documentar plano de duas identidades **reais e autorizadas**, organizações A/B, contratos/sentinelas temporários e perfis minimamente privilegiados; roteiro de login/logout, isolamento cruzado UUID, recuperação de senha via caixa controlada, CRUD, upload/download privado e limpeza. Registrar pré-requisitos, responsáveis e evidência. NÃO executar qualquer operação no Supabase antes de autorização específica e de credenciais HML de teste inseridas diretamente em Secrets/ambiente, jamais neste chat. Nenhum dado clínico/pessoal real.

## Gate 4: Verificação automática da fonte viva
Adicionar ferramenta Node isolada que lê a revisão normativo-documental de `contaos9999/develop` via GitHub REST com token de **somente leitura** e confere SHA HEAD e Git blob SHA dos 25 documentos + catálogo oficial. Token `CONTAOS_CANONICAL_READ_TOKEN` em **GitHub Actions Secrets** do repositório frontend, restrito ao repositório `contaos9999/develop` com Contents:read; nunca commit/prompt/log. Deve **falhar fechado** se houver BUILD funcional/PLAN VALIDADO e token ausente, erro 403 ou divergência, mas não bloquear atualizações documentais sem BUILD (classificar gate documental N/A). Testes sintéticos de respostas iguais/diferentes e ausência de token; não alterar backend. Registrar manual de setup do token e status NÃO VERIFICADO até existir segredo real.

## Lista FECHADA de arquivos permitidos neste BUILD de governança
- `.github/workflows/contaos-teste-c-independente.yml`
- `.github/workflows/contaos-frontend-zero-drift.yml` (um passo de verificação da fonte + autoteste, sem relaxar testes anteriores)
- `scripts/testc/visual-audit.mjs`
- `scripts/testc/visual-audit.test.mjs`
- `scripts/context-freshness-gate.mjs`
- `scripts/context-freshness-gate.test.mjs`
- `docs/frontend/GUIA_TESTEC_E_FONTES_2026-11-03.md`
- `docs/frontend/GUIA_PROTECAO_GITHUB_2026-11-03.md`
- `docs/frontend/HML_E2E_PRECONDICOES_2026-11-03.md`
- `docs/frontend/ESTADO_E_RETOMADA_CONTAOS_4_1.md`
- `docs/frontend/planos/GOV_002_QUATRO_GATES_2026-11-03.md` (somente plano/evidência).
**Proibidos:** `src/**`, `public/**`, `package.json`, `bun.lock`, `src/integrations/supabase/**`, `supabase/**`, backend `contaos9999/develop`, PROD e todas as outras superfícies.

## TDD e verificação
1. PLAN em commit só documental. Abrir PR rascunho e exigir seu CI SUCCESS antes do BUILD.
2. Testes RED para script de SHA/metadata e Teste C, seguidos de implementação GREEN. Não introduzir fake PASS.
3. BUILD mínimo somente scripts/workflows/docs allowlisted. CI do branch exige lint/format/testes 812+, TS/build, Zero-Drift e SHA `types.ts` certificado.
4. Validar workflow independente navegador em execução real. Se não puder executar browser, registrar **NÃO VERIFICADO** e não fechar issue #9.
5. Proteção de branch e E2E HML ficam bloqueados por ação humana externa. Informar configuração precisa, manter #10 e pendências de HML abertas até prova real.
6. Fechamento em GitHub com links de commits, CI, artefatos e plano de rollback (reverter somente esses scripts/workflows/docs).

## VALIDAÇÃO TÉCNICA DO PLAN
- PRD/Premissas/Arquitetura, 100/97 prompts, BRAND-01, RNF e Zero-Drift: **PASS** quanto à delimitação, sem interpretação funcional.
- Escopo zero backend/PROD/types e zero frontend funcional: **PASS**.
- Aprovações humanas obrigatórias em mudanças BRAND-01: **N/A**, nenhuma marca/visual de produção será modificada.
- Autorização para investigar backend: **N/A**, não haverá investigação; E2E autenticado fica BLOQUEADO até autorização.
- Testes, prova, rollback e separação: **PASS quanto ao plano**, implementação ainda NÃO VERIFICADA.
**Decisão:** GOV-002 PLAN VALIDADO somente para governança frontend; não ativa `PLANO_ATIVO.json` nem autoriza BUILD funcional.

## ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE (OBRIGATÓRIO)
Marca: ContaOS Brand v1.0 / BRAND-01; ler 19_IDENTIDADE_VISUAL_OFICIAL_BRAND_1_0.md e 20_PROMPT_000_BRAND_01.md para qualquer alteração frontend. Preservar assets oficiais, ContaOSMarca, Design System e tokens (REUTILIZAR > ESTENDER > CRIAR), componentes e estados; sem hardcodes, redesign ou bibliotecas paralelas. PLAN deve informar baseline visual, riscos e matriz de aceite; BUILD deve manter consistência; TESTE/TESTE C devem provar 1440/1280/768/390 nos temas claro/escuro, acessibilidade, marca e estados, sem alterações durante Teste C. Se prompt não envolver frontend, declarar impacto visual N/A justificado e garantir ausência de alteração visual.
Economia Lovable: checar turno/estado/commit antes de enviar; usar GitHub e Supabase diretamente quando possível; consolidar instruções; executar o menor delta; reutilizar testes/evidências válidos; não reenviar turno pendente nem duplicar builds/scans; nunca pular aprovação humana obrigatória, TDD, segurança, CI, Zero-Drift, fidelidade ao PRD, validação visual ou Teste C separado.
Entregar evidências e classificar: IDENTIDADE VISUAL PASS/FAIL/NÃO VERIFICADO/N/A; ECONOMIA LOVABLE CONFORME/NÃO CONFORME; ZERO-DRIFT PASS/FAIL. Sem prova não declarar PASS.
