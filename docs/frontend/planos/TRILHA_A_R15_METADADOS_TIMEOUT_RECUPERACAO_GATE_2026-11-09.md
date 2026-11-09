# GATE R15: recuperação do timeout de metadados

PLAN canônico: docs/frontend/planos/TRILHA_A_R15_METADADOS_TIMEOUT_RECUPERACAO_PLAN_2026-11-09.md. Base main: 1282198bfc72ac4a119856139e6b95d9e14177dc.

## Escopo condicionado a aprovação deste GATE
Somente scripts/hml/authenticated-visual-audit.mjs e scripts/hml/authenticated-visual-audit.test.mjs. O BUILD posterior deve substituir a política externa PR512 (3 tentativas de 12s e retry TRANSPORT) por **até 2 tentativas de no máximo 5s, somente TIMEOUT tipado pelo AbortSignal da tentativa**. Mesmo GET/URL/host, redirect:error, HTTP 200, 4MiB e deadline global de 60s. Revalidar ENV/token e reconstruir headers a cada tentativa; falhar fechado para HTTP, TRANSPORT genérico, JSON/schema, tamanho, identidade, token ou ENV alterados. Sem Auth, deploy, workflow, banco, frontend, tipos, secrets ou nova solicitação nesta PR.

## RED e GREEN obrigatórios
1. TIMEOUT uma vez seguido de sucesso na mesma URL; dois TIMEOUTs falham sem terceira chamada.
2. Deadline compartilhado; 10 GETs lógicos, máximo 20 físicos.
3. Mutação ENV/token entre tentativas bloqueia antes de repetir.
4. HTTP 401/403/404/429/5xx, TRANSPORT, JSON, schema, size, identity não repetem.
5. Cache Master fresco zero GET; operação oposta não acessa API.
6. Preservar R11-R14, DocR13, orçamento 10+1+13, writer22+SHA23, HISTORY19 e 18 provas nativas.
7. Prova pública de R14 original: upstream 42694401246 SUCCESS; Fixtures 42694609672 REQUEST_API/RUN_JOBS/TIMEOUT, job privado 129423314958 SKIPPED; auditoria oposta 42694609740; attempt1, artifacts vazios, zero intenção privada. Conferir quatro blobs e ancestralidade fixados no PLAN, não inferir PASS de SKIPPED.
8. GREEN focal, lint, Prettier, Zero-Drift, LOCK-TYPES-01 e Teste C no mesmo HEAD; revisão antes de merge.

## Liberação posterior
Após GATE integrado e BUILD separado integrado com evidências, abrir solicitação R15 em PR distinto, alterando somente docs/frontend/auditorias/TRILHA_A_SOLICITACAO_UNICA.json, nonce trilha-a-fixtures-20261109-r15, approved_parent_sha igual ao HEAD real e merge de dois pais. Não reutilizar R14 nem contornar REQUEST_PARENT. Auditoria HML apenas com Fixtures R15 terminal e artefatos reais. Esta PR documental não certifica telas nem autoriza execução privada.
