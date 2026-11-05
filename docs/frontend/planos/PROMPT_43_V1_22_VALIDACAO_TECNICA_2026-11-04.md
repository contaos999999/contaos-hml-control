# GATE técnico do PROMPT 43/V1-22 — Ingestão de histórico

**04/11/2026 (Brasília). Decisão PLAN: VALIDADO para BUILD frontend, não confundir com certificação de funcionalidade.**

- PLAN fonte: `docs/frontend/planos/PROMPT_43_V1_22_INGESTAO_HISTORICO_PLAN_2026-11-04.md`, PR #71 **MERGED** em `main@a3d1f65e2af235166d5d0d68ffe227a5877959e8`.
- CI PLAN [41940708299](https://github.com/contaos999999/contaos-hml-control/actions/runs/41940708299): dois checks obrigatórios, **SUCCESS no mesmo SHA** `b1d9fab7f5a43561aaf507bfb6738374c7753875`, auditoria Teste C somente documental. Não houve Teste C funcional da nova tela, pois ela ainda não existe.
- Fonte normativa `develop/main@c2bf86d011da6bfd3abaa70de38e7a722ae629de`, snapshot 25/25 `context_documents` com blobs idênticos, catálogo `e54e49e626e65a9c94c81709180fd192a1f0c079`. Regular 43/V1-22; atômicos diretos 000/006–010, 12 NFRs considerados e individualizados no PLAN.
- Contratos HML reais consultados **somente leitura**: `confirmar_upload_arquivo`, `criar_documento_contrato_completo`, `registrar_relatorio_historico_hml`, `enfileirar_ingestao_historica_hml`, `vincular_tratamento_historico_hml`, `versoes_documento`, `processamentos_documento`, Storage privado, Queue histórica e Cron. `tests/hml/v1-22-historico-smoke.sql` passou em [41939010108](https://github.com/contaos999999/contaos-hml-control/actions/runs/41939010108) com `ROLLBACK`; isso não é E2E real.
- **Matriz de PLAN:** PRD/premissas/arquitetura/atômicos/BRAND/segurança/RNF/Zero-Drift/TDD/CI/Teste C planejado/rollback avaliados como PASS **do desenho do plano**, não do BUILD nem do fluxo.
- Novo plano ativo `PLANO_ATIVO.json`: prompt `43`, status `VALIDADO`, allowlist exata com 11 caminhos frontend, proibição de backend/PROD, `types.ts` preservado.
- **Decisão humana sobre exceções:** não realizar teste real de upload, execução do worker nem isolamento real interusuários. Classificar `NÃO EXECUTADO POR DECISÃO DO TITULAR`; esta dispensa não revoga requisitos de rota, lote, estados, segurança, CI, TDD, acessibilidade e rastreabilidade.
- Aprovação humana da marca: **não exigida**, porque a aplicação deve reutilizar os mesmos assets e componentes, sem edição direta de `public/brand`, `src/components/brand` ou CSS global.

**Próxima etapa permitida apenas após merge deste GATE e dois SUCCESS no seu SHA:** nova branch BUILD com TDD RED/GREEN, `src/routes/contratos_.$id_.historico_.importar.tsx`, acesso e links, 4×2 temas/larguras e `src/routeTree.gen.ts` produzido pelo gerador oficial, sem editar manualmente. Dois checks no SHA BUILD final e dossiê com PASS/FAIL/NÃO VERIFICADO. Só então considerar o regular 43 encerrado tecnicamente, ressalvas preservadas.

**V1 não está certificada. Próximo regular após o 43: 75/V1-23. V2 não liberada. Produção inalterada.**
