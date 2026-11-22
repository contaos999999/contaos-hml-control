# PLAN P0-HML-REAL-COUNTERPROOFS-001 — Contraprovas autenticadas GitHub Actions / Playwright

**Estado:** PROPOSTO; sem BUILD, sem execução HML, sem certificação, sem ativação PROD.
**Autorização:** pedido expresso do titular nesta sessão para executar contraprovas reais em HML, usando GitHub Actions e Playwright com credenciais seguras e evidências vinculadas aos commits.
**Sequência institucional:** preservar a prioridade de certificação das sete fases V1; este PLAN prepara a etapa de contraprovas, sem declarar que ela já foi executada ou que libera V2.

## Baseline verificado
- Frontend: `contaos999999/contaos-hml-control`, `main` protegida; fonte normativa: `contaos999999/develop`, snapshot `docs/frontend/CONTEXT_CANONICO_4_1_SNAPSHOT.json`.
- `playwright.config.ts` já contém `CONTAOS_SYS03_AUTH_E2E`, `CONTAOS_HML_FRONTEND_URL` e `tests/hml/sys03-real-e2e.spec.ts`.
- No SYS-03, N1 e N2 estão explicitamente `test.skip`; N3/N4 não certificam os nove casos nem as demais cláusulas.
- O Teste C visual da PR #692 ficou `skipped` por escopo. Seu PASS de job não comprova HML autenticado.
- O extrator CSDI aponta originais dos 197 prompts não materializados e 34 correspondências pendentes. A certificação semântica permanece `INCONCLUSIVE`.

## Escopo de BUILD sujeito a PLAN protegido na main
Arquivos previstos, a validar pelo diff antes de autorizar:
1. `.github/workflows/contaos-hml-authenticated-counterproofs.yml` (novo; execução manual controlada ou chamada reutilizável, sem gatilho automático em PR não confiável).
2. `tests/hml/counterproofs/` (fixtures, casos positivos e negativos, verificador de cobertura e manifestos).
3. `playwright.hml-counterproofs.config.ts` (novo; projeto exclusivo HML, `forbidOnly`, sem retries que escondam falhas).
4. `scripts/hml-counterproofs/` (proveniência, sanitização, integridade, resumo de cobertura e teste RED).
5. `docs/frontend/planos/` (matriz cláusula × interação × sete eixos × comportamento esperado × teste real × prova).
Não alterar frontend funcional, backend, RLS, políticas, `types.ts`, ruleset, CI obrigatório ou PROD por este PLAN. Alterações adicionais exigem emenda protegida e aprovação específica.

## Credenciais e segurança
- Usar exclusivamente GitHub Environment `hml-counterproofs` com aprovação/restrição de branches e secrets próprios para **usuários sintéticos** de menor privilégio; nunca usar conta pessoal, `service_role`, token de administrador ou credenciais de produção.
- Variáveis não sensíveis: `CONTAOS_HML_FRONTEND_URL`, referência imutável do commit frontend e referência canônica backend; secrets por papel, sem escrever seus valores em logs, screenshots, traces, artifacts ou comentários.
- A configuração não pode considerar secret ausente como SKIP/PASS: pré-condição ausente resulta `BLOCKED` e falha explícita.
- Operações de escrita somente em fixtures sintéticas isoladas, com identificador da execução e limpeza verificável. Se isolamento/limpeza não estiver comprovado, NO-GO para cenários mutáveis.
- Não capturar cookies, JWTs, URLs com tokens, credenciais, dados pessoais ou respostas de API sensíveis. Redigir logs e produzir screenshots apenas de telas saneadas.

## Protocolo RED → GREEN → regressões
1. Reconciliar inventário normativo imutável (25 documentos + 197 prompts), IDs, exceções, precedência, conflitos e todas as interações identificadas; não inferir completude de extração lexical.
2. Para cada regra e par de regras: fixar cenário positivo, contraprova negativa, perfil, organização, status, pré-condições, oráculo observável e sete eixos semânticos.
3. Criar testes negativos de infraestrutura: secret ausente, URL não HML, HEAD divergente, evidência ausente, teste `skip`, falha de RLS, tentativa entre organizações, aprovação sem perfil e modificação material sem invalidação. Exigir RED reprodutível antes de corrigir a causa.
4. Executar em HML real por GitHub Actions/Playwright e, quando aplicável, confirmar resultado de rede/RLS com contas sintéticas distintas; não usar mocks como prova LIVE.
5. Executar GREEN, regressões e teste de integridade das evidências no **mesmo SHA**. Teste visual local não substitui autenticação HML.
6. Publicar artefato com `github.repository`, `github.sha`, `run_id`, `run_attempt`, SHA canônico, ambiente, IDs de casos, resultado esperado/observado, hashes SHA-256 e referências de logs sanitizados. Artifact não pode conter segredos.
7. Exigir parecer independente no SHA e recibo autenticado antes de certificar. `PASS` só para cobertura integral comprovada; qualquer `skip`, `blocked`, relação não adjudicada, evidência não verificável ou ausência de integração resulta `INCONCLUSIVE`/NO-GO.

## Gates e impedimentos
- A conexão GitHub disponível nesta sessão **não expõe workflow_dispatch nem gerenciamento de secrets**. Criar workflow no repositório não comprova sua execução; o workflow deverá ser acionado por uma identidade/serviço com essa permissão, sem simular disparo.
- Não presumir que o único projeto Supabase visível é HML até reconciliar a identidade do ambiente com as configurações canônicas.
- A execução real requer fixtures e credenciais HML provisionadas no Environment; não pedir senhas em conversa.
- N17(c), App privilegiado, fila real, HML/RLS e PROD mantêm seus próprios gates de ativação. `ativacao_autorizada=false`.
- Não mesclar este PLAN como substituto de provas; após integração protegida do PLAN, abrir BUILD separado, com RED/GREEN e auditoria independente.
