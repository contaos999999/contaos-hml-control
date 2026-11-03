# PROMPT 29 / V1-08 — Contrato — Orçamento

Ambiente: HML (`gklhhhyosgasnyoxlrui`). PROD proibido. Somente frontend.

## Rastreabilidade
- Regular: PROMPT 29 / V1-08.
- Atômicos: 001 V1-CON-001, 002 V1-CON-002, 003 V1-CON-003, 004 V1-CON-004, 005 V1-CON-005.
- Transversais: NFR-007 (concorrência otimista/PT409), idempotência, NFR-009 (paginação 25), RLS, auditoria (`correlation_id`), PT-BR/BRL, a11y, BRAND-01, Zero-Drift.
- Plano aprovado: `.lovable/plan/prompt-29-v1-08-contrato-orçamento-plan-2026-11-03.md`.

## Arquivos
- Novos: `src/routes/contratos_.$id_.orcamento.tsx`, `src/components/contratos/OrcamentoContrato.tsx`, `src/lib/contratos/orcamentoDados.ts`, `src/test/orcamento.test.tsx`, este documento.
- Alterados (mínimo): `VisaoGeralContrato.tsx` e `BaseNormativaContrato.tsx` (link "Orçamento"); `src/test/contratoDetalhe.test.tsx` e `src/test/baseNormativa.test.tsx` (asserções de navegação atualizadas para o novo link).
- Gerado automaticamente: `src/routeTree.gen.ts`.
- Intocados: `types.ts`, cliente/auth Supabase, `styles.css`, `package.json`, `AGENTS.md`, assets de marca, backend.

## Backend consumido (V108, sem alteração)
- Leituras RLS: `propostas_orcamentarias`, `versoes_proposta`, `linhas_orcamentarias`, `arquivos` (somente id, nome, mime, tamanho, status_seguranca, criado_em); colunas explícitas, `range(0,24)`, ordem estável.
- Gate: `obterContrato` (V1-06) com `classificar_acesso_contrato_v106` só após zero linhas.
- Escritas: `salvar_proposta_orcamentaria_v108`, `registrar_versao_proposta_v108`, `salvar_linha_orcamentaria_v108`, `remover_linha_orcamentaria_v108`, `publicar_versao_proposta_v108`, via fronteira tipada única `as unknown as`.
- Upload/download: pipeline V1-07 (`storage-sign-upload` → signed upload → `confirmar_upload_arquivo`; `storage-sign-download` por clique).

## Resultados do BUILD
- RED: módulo inexistente (falha esperada).
- GREEN: focado 22/22; suíte 406/406; `npx tsc --noEmit` exit 0; build exit 0.
- Browser 1440/1280/768/390 com sessão e dados simulados: sem overflow, H1 único "Orçamento", marca Mono Branco 131 px (≥sm) e símbolo 32 px (390), publicar bloqueado com documento pendente, sem path/token no DOM, Esc devolve foco ao gatilho, console sem erros.

## Limitações
- Supabase externo: o navegador de teste usa sessão/dados simulados; prova visual, não de RLS/RPC real.
- Upload retomável não suportado (interrompe com mensagem PT-BR).
- Teste C pendente (turno separado, read-only).
