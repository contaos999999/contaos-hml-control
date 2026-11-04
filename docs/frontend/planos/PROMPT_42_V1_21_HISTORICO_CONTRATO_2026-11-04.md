# PLAN 42 / V1-21 — Histórico do contrato

**Data 04/11/2026, Brasília. Status: PLANEJADO, NÃO VALIDADO para BUILD.** Fonte original: Manual Mestre de Prompts 4.1, SHA-256 `8a15d96568d021ac86fdd45e79038e2cb969d69c12b2edb84f012a6129b8940e`, parágrafos 2363–2422, conferidos a partir do pacote original. Catálogo dos atômicos 000–096, SHA do original `d9faaae47de4b697b18ad7fb71e4738384514936813cd5b18779f4cb8aed83b8`. Baseline frontend `e12bf962d83b347f1c168c3e7541172d9ae35df4`, normativo `a10d3b1a1a14276c017027f93ec2a7aace4d6cb6`. Reconfirmar HEADs antes do BUILD.

## Contrato de entrega

Tela V1-21 **Histórico do contrato**, rota literal `/contratos/:id/historico`, acesso com usuário autenticado, consumo somente da Data API Supabase existente sob RLS. A tela é a consulta de relatórios anteriores e sua rastreabilidade, não o importador V1-22 do PROMPT regular 43. Não reimplementar ingestão, OCR, extração, precedentes, aprendizado ou regra preventiva em cliente.

A auditoria documental individual `docs/frontend/auditorias/PROMPT_42_V121_CROSSWALK_97_ATOMICOS_2026-11-04.md` classifica **97/97 IDs**. Diretos: 000/BRAND-01, 006–010 (V1-HIS) e 093/NFR paginação; transversais: 019, 070, 089, 095; condicionais: 087/094. Não confundir triagem com certificação da implementação ou validação global 100×97.

## Contratos existentes (somente SELECT)

O frontend `src/integrations/supabase/types.ts` blob certificado `8ea7750b75fd9d76b29c36ce7613392e3ab65e19` expõe:
- `relatorios_historicos_contratante`: id, id_contrato, id_organizacao, id_arquivo, tipo, numero_documento, competencia_referencia, data_documento, status_processamento, resultado_geral, origem_temporal, criado_em;
- `apontamentos_historicos`: id, id_relatorio, id_contrato, id_organizacao, item, problema, severidade, fonte_pagina, fundamento, criado_em;
- `respostas_historicas`: id, id_apontamento, id_contrato, id_organizacao, texto, criado_em;
- `desfechos_historicos`: id, id_apontamento, id_contrato, id_organizacao, resultado, data, criado_em;
- `precedentes`: id, id_contrato_origem, id_organizacao, id_apontamento_historico, fonte_tipo, titulo, problema, solucao, desfecho, status, criado_em;
- `regras_preventivas`: id, id_contrato, id_organizacao, codigo_regra, descricao, efeito, situacao, criado_em.

Autenticação via `supabase.auth.getUser()`, organização preferida já validada e contrato via `obterContrato(id, signal)` da V1-06, que usa classificação backend oficial quando aplicável. A preferência de organização é contexto, não permissão: backend/RLS continua autoridade. Filtrar todas as consultas por `id_contrato` e `id_organizacao`, precedentes por `id_contrato_origem` e organização. Conferir escopo da resposta e falhar fechado se inconsistente. Nenhuma chamada a documento de outro contrato, nenhum download não certificado, nenhum UPDATE/RPC mutativo.

## UX e paginação

Seções: identificação do contrato, relatórios anteriores paginados por data (25 por página, count exato), apontamentos do relatório selecionado paginados (25 por página) e suas respostas/desfechos em lote limitada à página; precedentes e regras preventivas oficiais do contrato, também paginados. Sem carregar coleção ilimitada. Apresentar apenas relações e status retornados, nunca inferir desfecho, criticidade, confiança ou aprovação de regra. Exibir estados loading/empty/denied/error/processing, não converter 401/403 em lista vazia. AbortSignal nas alterações de rota/página, nenhuma exposição de dados antigos. Texto PT-BR, datas Brasília, teclado/foco/labels/alertas; 1440/1280/768/390 px e dois temas, usando ContaOSMarca/transparência oficial e tokens existentes.

## Allowlist do BUILD, apenas depois de GATE

1. `src/lib/contratos/historicoContratoDados.ts`.
2. `src/components/contratos/HistoricoContrato.tsx`.
3. `src/routes/contratos_.$id_.historico.tsx`.
4. `src/test/historicoContrato.test.tsx`.
5. `src/routeTree.gen.ts`, **somente saída determinística do TanStack**.
6. `scripts/testc/visual-audit.mjs` e `scripts/testc/visual-audit.test.mjs`.
7. `src/test/brand.test.tsx`, somente se crivo de marca precisar registrar nova tela.
8. `docs/frontend/auditorias/PROMPT_42_V121_TESTES_2026-11-04.md`.
9. `docs/frontend/ESTADO_E_RETOMADA_CONTAOS_4_1.md`.

Não alterar Auth, RLS, backend, tipos Supabase, PROD, package/lockfile, assets, logo, CSS global, workflows ou wizard V1-20. O manifesto `PLANO_ATIVO.json` será atualizado exclusivamente em PR de GATE separado.

## Testes e critérios

TDD RED antes do adaptador; GREEN para formato UUID, auth, 403/404/vazio distintos, id_organizacao/id_contrato, relatório e seus apontamentos associados, respostas/desfechos em lote, ausência de N+1, limite de 25, paginação e abort, flags de processamento oficiais, não autorização cruzada via mocks sem alegar teste operacional HML, sem mutações, sem dados fabricados e sem segredo. Regressão completa Vitest, TypeScript, eslint/Prettier, build, BRAND-01, GOV-020 e fontes 25/25. Ao adicionar V1-21, Teste C deve cobrir 27 telas × 4 larguras × 2 temas = **216 combinações**; tela privada sem sessão real permanece NÃO VERIFICADA, não é E2E HML. Dois checks obrigatórios SUCCESS no mesmo SHA antes de merge. Rollback por PR, sem alterar dados.

## ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE

REUTILIZAR > ESTENDER > CRIAR. Usar os mesmos componentes/cores/tokens oficiais, sem redesenhar marca ou promover lógica backend para browser. GitHub direto para BUILD, Lovable apenas para sincronizar/revisar. `routeTree.gen.ts` nunca pode ser editado manualmente: gerar via Vite, versionar output na allowlist e exigir GOV-020 PASS antes de testes longos e no Teste C. Não reduzir segurança, RNFs ou cobertura para economizar créditos.

A decisão expressa do titular permanece: verificação de RLS HML A/B entre organizações **NÃO VERIFICADA, FACULTATIVA DEPOIS DO PROMPT 99, NÃO BLOQUEANTE ISOLADAMENTE**. Os demais controles continuam obrigatórios.

**Gate atual:** PLAN elaborado, ainda não aprovado por CI; não construir V1-21 até integrar PLAN e GATE subsequentes.
