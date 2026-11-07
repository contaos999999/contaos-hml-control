# ContaOS 4.1 P0 — prova JWT real V1-17 e fila de integração

Data: 07/11/2026. Escopo: evidência de homologação, sem alteração de PROD, banco ou código.

## Evidência nova, verificada diretamente no GitHub
Backend `contaos999999/develop`, commit `744dee8636c164415774e413e76883e08dffbc09`, PR #99 integrado.
Workflow https://github.com/contaos999999/develop/actions/runs/42362609674, tentativa 3, dois jobs `canonical-deploy` e `real-jwt` com conclusão **success**. Job JWT `128386155328`: log registra `V117_REVIEW_REAL_JWT_PASS: 38 assertions, own quarantine verified`. Inclui etapas de verificação da migration aplicada uma vez, Auth real/concorrência HTTP, limpeza de fixtures e publicação de evidência sanitizada.
Artefato `contaos-v117-revisao-real-jwt` ID `13572550033`, SHA-256 do ZIP `e082a3669c2e9adf34674ad9e74134bcb9ef46d20d88453887925fa3af92e43d`.

A antiga pendência de `CONTAOS_HML_AUTH_ADMIN_KEY` está **resolvida para este workflow**. Não reexecutar deploy canônico sem motivo, não expor credenciais.

## Fila P0 de implementação
1. Abrir PLAN específico de integração da revisão humana V117 no drawer de requisitos, confrontando as RPCs `obter_contexto_revisao_v117` e `registrar_revisao_requisito_v117` com o contrato, assinatura e autoridade do backend; preservar 25 fontes e tipos congelados. Validar CI e merge protegido.
2. GATE separado, TDD RED e BUILD com CAS, idempotência, concorrência, evidência pertencente à organização, erro de rede/resultado incerto e feedback acessível. Testar rollback e Teste C independente, sem alegar sessão privada onde não houve.
3. Completar matriz CRUD de 27 telas com capacidades reais backend/RLS e proibições explícitas. Testar autorização multi-organização, upload/worker aplicáveis, quatro larguras (1440/1280/768/390), claro/escuro, sidebar BRAND-01 transparente e WCAG 2.2 AA.
4. Revisar retroativamente 00–42 e atômicos 000–024, NFRs aplicáveis e emitir certificado V1 apenas com evidência. V2–V5 bloqueadas até PASS V1.

## Estado e impedimentos
Frontend PR #251 continua aberto, documental, com referência à retomada Lovable incompatível com o executor GitHub Actions e CI anteriormente reprovado. Não integrar sem reconciliação e dois checks requeridos SUCCESS no mesmo HEAD.
Esta prova JWT **não certifica CRUD global, frontend privado, worker/upload, auditoria visual nem V1**. Não altera a dispensa facultativa de teste A/B pós-99 registrada na norma, nem relaxa demais gates.
Fonte de ordem: `docs/frontend/governanca/P0_PRIORIDADE_ZERO_ORDEM_POR_VERSAO_4_1.md`.
