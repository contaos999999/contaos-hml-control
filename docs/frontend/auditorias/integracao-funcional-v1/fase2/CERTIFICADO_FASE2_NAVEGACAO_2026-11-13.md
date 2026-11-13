# Certificado da Fase 2 (Integração Funcional V1): navegação autenticada 52/52

Data: 13/11/2026. Escopo: `INTEGRACAO_V1_FASE2_NAV`, 26 superfícies privadas × (1440 claro, 390 escuro) = 52 casos, no HML `https://contaos-41-hml.vercel.app`.

## Produto certificado

- Frontend `e6c8cb06dac2a6cdc225b0705ef984ed3e398d97` (merge do BUILD R10, #637).
- Deployment `dpl_9t3QDhWhNt1jiTQvewhUKanSm6Dz`, READY em produção HML; "Ignored Build Step" liberando somente esse SHA.
- Backend, SQL, RLS, RBAC, Auth, Storage, Edge, segredos, workflows, lockfile, `types.ts` e PROD não foram alterados na Fase 2.

## Ledger consolidado

`docs/frontend/auditorias/integracao-funcional-v1/fase2/NAV_LEDGER.json` v5, SHA-256 `6eeef70b5d194cfe388666096dd3a4b493e89c7b9259248a98b4ef212745afd4`, encadeado à v4 `2245b4fe…` (append-only desde a v1 `0a8f71f2…`). **52 PASS válidos, 0 pendentes**, todos do produto e do deployment acima. Os 33 PASS do produto anterior (`3638cdd`) estão `SUPERSEDED` desde a v3.

| Índices | Execução | Artefato | ZIP SHA-256 | Report SHA-256 | Harness |
|---|---|---|---|---|---|
| 1-51 | Auth `43459877744` (R10), attempt 1 | `14059408905` | `5a1b08e2eaa519d3e350488994c8625cd0bc4a60fe9d73e1c19432e717971236` | `a70976206a97571b9613ffb55dfb18491a5a76e4e337afd7c8f7b378d50eb2fc` | `050beb1` |
| 52 | Auth `43509322900` (R14), attempt 1 | `14076439209` | `596629b98ee9a580e4664e97f0b0062fa2361a6e33d6816c61e2ab4aa8a63cf0` | `0d1e580b7af1646e6c2884683b609c399c278bcb1e77a981b4a6271896b00184` | `ccf5343` |

Cada linha foi aceita individualmente por `summarizeNavigation` do auditor, em ordem canônica, com zero erros na linha.

## Controles globais na execução de fechamento (R14)

Relatório `contaos.navigation.audit.v4` da R14, **válido por `validateNavigationReportIncremental`** com o ledger v4 (retomada 52):
- sessão, MASTER, organização e logout verificados (`true`);
- `transportErrors` 0, `httpErrors` 0, `httpStatusErrors` 0, `pageErrors` 0, mutações bloqueadas 0;
- `fenceDiagnostic`, `logoutFailure`, `networkFailure` e `aborted` nulos;
- guard nativo PASS (8 casos), proveniência pública PASS (111 módulos), produto e deployment fixados;
- contadores da sessão por fase: antes do logout 0, depois do logout 0, depois do encerramento 0.

## Ocorrências registradas (R9-R13)

- **R9 e R10:** um erro global de transporte fora das linhas, sem caso afetado. A instrumentação da R11 o localizou no logout (R13: `afterLogout` 1, `POST /auth/v1/logout` `ABORTED`).
- **Causa, provada em Chrome real e reproduzida por revisão independente:** o GoTrue responde 204 ao logout e o cliente não lê o corpo; o Chromium emite `requestfailed` `net::ERR_ABORTED` depois do `response` 204. O logout é concluído no servidor; não há defeito de produto. Desde o BUILD R14, só esse pedido exato, com o 204 observado antes, deixa de contar como erro; na R14 ele foi observado (`NAVIGATION_LOGOUT_COMPLETED_EMPTY`, status 204) e todo o resto continua erro.
- **R11:** bloqueada no preflight (`REQUEST_API_TIMEOUT`) por listar todo o histórico de execuções; corrigido no BUILD R12 com a mesma semântica e o mesmo prazo. Sem login nem caso.
- **R12:** bloqueada pelo guard nativo (`WORKER`, `FENCE_SOURCE`) antes do login, sem casos. O mesmo guard passou na R10, na R13, na R14 e no CI; a falha não se repetiu e segue sem explicação. Referência: job `132125342973`.

Nenhuma execução foi reexecutada, nenhum nonce foi reutilizado e nenhuma regra de fail-closed, prazo, fence ou guard foi relaxada. Todas as PRs de PLAN, BUILD, pins e REQUEST foram integradas por merge commit, com revisão independente registrada e CI verde.

## Conclusão

**Fase 2 encerrada e certificada**: 52/52 casos de navegação autenticada PASS no produto `e6c8cb0` / `dpl_9t3QDhWhNt1jiTQvewhUKanSm6Dz`, com os controles globais verificados na execução de fechamento.
