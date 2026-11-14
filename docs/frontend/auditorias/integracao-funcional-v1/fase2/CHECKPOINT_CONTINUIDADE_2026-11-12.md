# CHECKPOINT DE CONTINUIDADE — ContaOS 4.1 — Auditoria de Integração V1 / Fase 2

Data: 2026-11-12 (Brasil). Estado: **FASE 2 NÃO CERTIFICADA**. Este checkpoint não altera produto, HML, auditor ou a solicitação consumida.

## Escopo e decisões
Plano aprovado: sete fases para auditar integração real das 27 telas V1 antes de V2. Fase 1 encerrada/certificada; documentação em `docs/frontend/auditorias/integracao-funcional-v1/fase1/`. Fase 2: navegação autenticada MASTER, sidebar, URLs, recargas, retorno, transições, links e controles, desktop 1440 e mobile 390; 52 cenários. Não reabrir certificações anteriores; não burlar RLS/RBAC, branch protection, nonce única, origem HML ou CI.

## Identidades verificadas
Frontend `contaos999999/contaos-hml-control`, main HEAD antes deste checkpoint `1a7b55cdad67fc2f639fa2abfb5faff04062d08a` (merge da REQUEST). Produto frontend SHA `024a232c5bdb717e556d9ff16ca000e1ae65b0cb`; auditor/harness SHA `1a7b55cdad67fc2f639fa2abfb5faff04062d08a`; deployment HML `dpl_FZgy7ARPgbQAbnGVVtbegFi4htXW`. Backend normativo: `contaos999999/develop`; HEAD não reconfirmado neste checkpoint. Supabase HML ref `gklhhhyosgasnyoxlrui`. PR #603 foi integrado e consumiu a solicitação original. Não rerodar nem fazer replay dessa nonce.

## Evidência de execução real R1
GitHub Actions run `43157856422`, workflow `411115674`, artifact ID `13917231956` (`trilha-a-private-43157856422-1`), SHA256 ZIP `f08392462141b97763d9c8c4cf6918dad91a4c7bbb617fe556c4397495ca79a0`, SHA256 report `3d994303537f7e06d3c57b1dc1f1f69c763739edc6194909f331a69ac6cb348c`, nativeProofSha256 `9239663fc4e605ad8e7446a66b9634dfff93ca8763fe607242e59b2e1932bf72`. ZIP e report conferidos com hash e schema em sandbox isolado. Relatório: expected=52; observed=33; passed=2; failed=31; matrixComplete=false; sessionVerified=true; masterVerified=true; organizationVerified=true; logoutVerified=false; blockedMutations=0; pageErrors=0; httpErrors=1. Falhas: NAVIGATION_LINK_MISSING=12, NAVIGATION_MENU=6, NAVIGATION_STATE=12, NAVIGATION_RUNTIME=1. Duas entradas SYS04 PASS (1440/390); falhas de menu começam SYS05; V114 apresentou HTTP error no estágio LINKS. Não há evidência de PASS global.

## Correção e rastreio
Issue P0 [#604](https://github.com/contaos999999/contaos-hml-control/issues/604) criada com critérios de saída e diagnóstico inicial. PRs anteriores #595 (plano), #598 (correção de reentrada), #603 (request governada) devem ser consultados em GitHub; conferir estado real de cada um, não inferir. Testes informados na trilha anterior: 1.258 testes de produto, tipagem, build, gates nativos 18/18, quatro workflows BUILD; não substituem auditoria real R1. Evidência R1 é bloqueante e prevalece sobre testes locais.

## Próxima tarefa exata
1. Ler Issue #604 e código atual de menu/sidebar/ContextoRbac, fixtures de navegação e relatório R1. Reproduzir causas de links ausentes, menu mobile, estado de contexto após recarga e HTTP error em V114. Distinguir defeito do produto de seletor/expectativa incorreta do auditor.
2. Aprovar/integrar plano corretivo antes de alterar código. Corrigir causa, sem simular acesso MASTER nem enfraquecer RLS/RBAC. Adicionar regressões 1440/390, testar local, revisão independente, PR com CI verde e merge protegido.
3. Publicar apenas HEAD aprovado na HML; validar identidade pública, módulos/hashes e deployment.
4. Criar nova solicitação governada com nonce nova, executar **uma única vez** os 52 cenários; exigir 52/52 PASS, logout, zero erros de página/HTTP e mutações bloqueadas, relatório íntegro e revisado.
5. Registrar recibo de certificação na main apenas após evidência; atualizar checkpoint com HEADs, PRs, jobs e resultados. Sem PASS, manter Fase 2 aberta e V2 bloqueada.

## Regras de continuidade
Este arquivo é uma fotografia de estado, não um certificado. Manter as sete fases e as certificações anteriores. Antes de recomendar outro chat, atualizar e integrar novo checkpoint. Acesso às credenciais só pelo workflow governado. Não utilizar dados reais de pacientes nem executar em produção.
