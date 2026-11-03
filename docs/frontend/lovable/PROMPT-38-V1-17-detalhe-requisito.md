# PROMPT 38 / V1-17 — Detalhe do requisito (drawer na Análise) — BUILD

- Plano aprovado: `.lovable/plan/prompt-38-v1-17-detalhe-do-requisito-drawer-na-análise-2026-11-03.md`.
- Condição de BUILD: CI backend "ContaOS Zero-Drift" `contaos9999/develop@1c87c586c0ba0aa7daace37032925c0990054098` SUCCESS (run 41708437801), informado pelo titular.
- Base frontend: `f64df93433814abf61e198d1351d8ee9a2ea8b5c` (árvore = Teste C `856209dc…`, 765/765).
- `src/integrations/supabase/types.ts`: restaurado e conferido no blob `8ea7750b75fd9d76b29c36ce7613392e3ab65e19` (a plataforma o havia regenerado no commit `869786c`).
- Backend HML `gklhhhyosgasnyoxlrui` somente lido (assinaturas `obter_detalhe_requisito_v117` e `solicitar_reanalise_requisitos` confirmadas via `pg_proc`). PROD intocado.

## Arquivos
Criados: `src/lib/competencias/requisitoDetalheDados.ts`, `src/components/competencias/RequirementDrawer.tsx`
(subcomponentes locais `SourceReference`, `EvidenceList`, `ResultBadge`, `AuditTimeline`, `Paginador`),
`src/test/requisitoDetalhe.test.tsx`, este documento.
Alterados (hunk mínimo): `CompetenciaAnalise.tsx` ("Em breve" → botão "Abrir requisito" + drawer + recarga V1-16),
`competenciaAnalise.test.tsx` (teste staged → teste do drawer). Sem rota nova, sem routeTree.

## Contrato aplicado
- Leitura com 3 paginações independentes, limite fixo 25, `AbortSignal`.
- Parser fail-closed: `schema_versao = v117-v1`; IDs UUID e iguais aos solicitados; arrays obrigatórios;
  paginação inteira ≥0, limite 25 e offset igual ao solicitado; 3 booleanos em `allowed_actions`;
  `na_validade` só quando referência = `nao_aplicavel` e com `valido` boolean (`false` legítimo).
- `resultado_atual` nulo com referência presente: exibe a referência e, separado, "Última execução global" com
  "Sem resultado deste requisito nesta execução".
- Nada é calculado no cliente (portão, percentual, stale, N/A, mecanismo, autorização).
- Download: somente `documento.id_arquivo` com `status_seguranca === "aprovado"` via `baixarDocumento(id_arquivo)` (V1-10).
- Reanálise: só com `allowed_actions.reanalisar`; trava síncrona; 1 RPC `[idRequisito]`; PT409/42501/PT400 em PT-BR;
  erro/timeout ambíguo → nenhuma 2ª escrita, 1 leitura de reconciliação; sucesso recarrega drawer e V1-16.
- Gate: UUID inválido → zero Auth/RPC; UUID → getUser → preferência (contexto) → RPC; estado chaveado por
  `competência:requisito`, respostas tardias descartadas.
- A11y: Sheet Radix, título `h2` com foco inicial, Esc fecha, foco devolvido ao botão de origem, `aria-live`,
  tooltips em termos técnicos (hover/foco; toque abre via botão), alvos ≥44px.

## TDD
- RED 1: `bunx vitest run src/test/requisitoDetalhe.test.tsx` → exit 1, módulos ausentes (adapter/drawer).
- GREEN 1: 45/45.
- RED 2: teste novo do drawer em `competenciaAnalise.test.tsx` contra `CompetenciaAnalise.tsx` da base `f64df93` → 1 falha.
- GREEN 2: Análise + visão geral + V1-17 = 171/171.
- Ajuste a11y (foco devolvido) com teste adicional → 46/46 (RED não registrado para este caso: em jsdom o comportamento
  não era distinguível antes da correção; falha observada no navegador real).

## Verificações (resultados no final do BUILD)
Ver relatório do turno: suíte serial, ESLint, `tsc --noEmit -p .`, `vite build`, `frontend-zero-drift.mjs`, scan, browser.
Browser: **MOCK** (rede Supabase interceptada, sessão fictícia) em 1440/1280/768/390 × claro/escuro; sessão real NÃO VERIFICADA.

## Ressalvas
- O botão fechar "X" do Sheet compartilhado tem rótulo `Close` (shared UI proibida neste escopo); o drawer adiciona botão "Fechar" em PT-BR.
- Teste C deve ser executado em turno separado, read-only.
