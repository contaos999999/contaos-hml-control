# PLAN P0 — Fase 1 de Saneamento: PR #593, prevenção de requisição histórica

**Data:** 14/11/2026; **Estado:** PLAN documental, não é BUILD nem nova certificação.  
**Plano pai integrado:** `docs/frontend/planos/P0_PLANO_UNICO_SANEAMENTO_PENDENCIAS_2026-11-14.md` pela PR #670, merge `5130c4a1be210f04c0a0cebed543d98f47f0c997`; Fase 0 #671 integrada em `eda87e58bc9e8996d3b4f8601c27eb9a46681377`.  
**PR de BUILD já existente:** [#593](https://github.com/contaos999999/contaos-hml-control/pull/593), HEAD inicial `db0ca054a264655e749709617cdd821e341da303`, OPEN, conflito antigo.  
**Veto inegociável:** P0-LOCK-CERT, **sem editar/reabrir/rebaixar** o certificado V1 PASS ou Fase 1/2, sem novo request R14, HML privada ou PROD.

## Causa confirmada
O workflow `.github/workflows/contaos-trilha-a-authenticated.yml` escuta `workflow_run` do Zero-Drift main. Quando merge atual não alterou `docs/frontend/auditorias/TRILHA_A_SOLICITACAO_UNICA.json`, ainda assim executa `--request-preflight` contra o pedido antigo `integracao-v1-fase2-nav-20261113-r14`. Seu `approved_parent_sha=795a3e26...` não equivale ao primeiro pai do merge posterior; a rejeição `REQUEST_PARENT` é **correta e segura**, mas produz falso FAIL administrativo antes da auditoria privada. Não reclassificar o certificado Fase 2 (52/52 PASS). A run de CI original da #593 `43042528333` falhou em `playwright install --with-deps chromium` por resolução DNS dos mirrors apt/Ubuntu: causa ambiental independente, não prova de interface falha.

## Escopo autorizado do BUILD #593 (sem alternar PLANO_ATIVO)
- ÚNICA mudança executável: `.github/workflows/contaos-trilha-a-authenticated.yml` no bloco do job `request`, após `checkout` do SHA verificado e antes de qualquer token de Actions/preflight/dependência privada.
- Preservar o arquivo PLAN histórico `docs/frontend/planos/P0_FASE8_AUTH_SUBSCRIBER_NO_REQUEST_PLAN_2026-11-11.md` como documentação somente, se ainda não estiver na main. Não editar `PLANO_ATIVO.json` na branch #593, pois sua versão antiga conflita com o histórico integrado; não sobrescrever outros PLANs.
- Testes do workflow são necessários e devem demonstrar `request` alterada / não alterada / merge e SHA inválidos; usar test existente se permitir negativas reais e escopo aprovado. Se precisar de novo `scripts/...` será necessária emenda de PLAN + allowlist protegida antes de mudar.
- Não alterar `scripts/hml/authenticated-visual-audit.mjs`, request R14, tokens, controle de unicidade, HML, `src/`, RBAC/RLS, backend, certificados, tipos, PROD ou job `private` além de sua condição existente.

## Decisão do gate
Após validar a origem do evento, o job `request` compara `git diff --name-only --no-renames HEAD^1 HEAD -- docs/frontend/auditorias/TRILHA_A_SOLICITACAO_UNICA.json`:
1. Resultado EXATO caminho ⇒ `run=true`, executar instalação e `--request-preflight` originais na íntegra, incluindo parent/nonce/sessão; somente o preflight controla `selected`.
2. Resultado vazio ⇒ `run=false`, não instalar dependências neste job, não fornecer token ao preflight, não selecionar request, e manter `private` SKIPPED. Isso é **NO_REQUEST**, não `HML_PASS`.
3. Resultado inesperado, SHA inválido, parent ausente, exceção git, check do evento inválido ⇒ FAIL-closed e nenhuma auditoria privada.
4. Nunca aceitar `commit message`, caminho parcial, reenvio histórico, alteração de docs gerais ou PR sem merge como substitutos de request real.

## Aceite e bloqueios
- Reconciliar branch #593 com main atual por merge de duas parents, sem force-push, preservando os **certificados** e todo o restante da main; diff mínimo apenas workflow + PLAN documental histórico.
- Simular RED de acionamento histórico (run `43589941705` REQUEST_PARENT após merge #667) e GREEN via step `Detectar nova solicitação única no merge atual`, com evidência do SHA real.
- Zero-Drift, LOCK, P0-NR e Teste C obrigatório no HEAD; job Trilha A `protocol` precisa terminar SUCCESS; se a instalação DNS falhar, diagnosticar separadamente sem remover teste.
- Auditoria Edivan5002 no HEAD exato, protegida; integração/CI push e readback só após APPROVED.
- Quando integrado, classificar PR #593 `MERGED_PROTECTED`. Se uma PR sucessora substituí-la, marcar `CLOSED_SUPERSEDED` com provas; não deixar duplicidade sem decisão.
- Snapshot de certs antes/depois do merge deve preservar os blobs `8ce1f23a...`, `7045c0a0...`, `751c5e6d...`, `e07d6689...` integrados na Fase 0. **Zero alteração retroativa da Fase 2.**

**Sem PROD e sem certificação funcional da V1 neste plano.** A barreira administrativa não transforma resultado anterior em novo PASS.
