# Trilha A P0: plano único de conclusão
Data: 09/11/2026. Issue #317. Autorização expressa do titular nesta sessão: executar, corrigir erros e ajustar regras canônicas quando necessário até concluir.

## Objetivo e arquitetura
Concluir 29 superfícies, 232 combinações e 72 critérios com evidência autenticada HML e revisão independente. Frontend → Supabase API/RPC/Edge → PostgreSQL/Storage/auditoria permanece obrigatório. Não certifica V1 por si só.

## Baseline verificável
Estado histórico abaixo preservado em sua origem; não representa freshness ou completude atual. Atualização coordenada: main d1ce01204219516a85745d250b5a79afe59c220f após PR443, HEADd94b6ebab50ab7054b89259e1b4746041b4e8f1e/revisão5821861865/Zero42565438215/LOCK42565438170SUCCESS, source+ack63a8164d9d89427fdf0ce82ede66800a9ad0d63c conferidos no merge. Freshness exige novo GET vivo antes da próxima etapa, nunca inferência por CI anterior.

PR440 foi integrado externamente ainda WIP; seu HEAD54a9 e checks não fecham os12readbacks. PR442 é o complemento causal pendente, com achados/revisão/CI do HEAD final ainda obrigatórios. ReciboRootissue3176732691988 registra FIXTURE.org incorreto no recovery de competências existentes e necessidade de caso positivo não-vazio. Não tratar revisão de54a9 como aceite suficiente do complemento. PR432 integrado d2d4 permanece preparatório, semliberarAUDIT_BINDING_PENDING ouproveniência. Nenhuma requestR4 emitida por este plano.
- Frontend main c764b6676af250b759ed3daf6ca22fd9f2f5b606; PR440 integrado, head 54a9d6a8630badcc9f4d2e8be41099eaff344f1c.
- Backend main 0ec86f5d0b1df2afffc1c778eac1c44e1962f63b.
- No HEAD440: Zero-Drift, Teste C, protect-types e dois checks de protocolo/Chromium SUCCESS; etapas privadas SKIPPED.
- GET /pulls/440/reviews e /issues/440/comments retornaram listas vazias nesta consulta. Revisão independente do BUILD não comprovada.
- Main: Zero42563987943 e LOCK42563987905 SUCCESS. Fixtures42564069970 falhou antes da etapa privada com REQUEST_SCHEMA, job128986618017; não é resultado de nova auditoria/fixture.
- R3 Run42559214436 encerrou FLOW_ACTIVE_NOT_READBACK, logout confirmado, bindings ausentes. Três operações históricas confirmadas, máximo21 novas, sem replay/reativação.
- HML F3/source437 é referência histórica do checkpoint, requer revalidação viva antes de autenticar.
- Run124: 102 PASS automatizados incluem6 baselines móveis; nos184 originais:96 provisórios+8FAIL_UI+56PII+24FIXTURE. Revisão430 examinou204PNG/102DOM/306hashes. Não reatribuir prova antiga ao produto atual.
- 18 provas públicas adicionais preservadas; não repetir PLAN322/GATE323/BUILD324.

## Execução única, com etapas verificáveis
- [ ] 1. Fechar complemento causal442 sobre440WIP: corrigir achados reproduzidos, inclusive recovery de competências existentes com organização correta e caso positivo não-vazio; conferir todos12estágios/DTOs/readbacks/provas nativas por RED→fix→GREEN. Herdar443 por merge normal semreescreverhistórico, preservar códigos concorrentes, executar CI no novoHEAD e obter revisão independente rastreável desse HEADfinal. Não certificar por checks/revisão do54a9 anterior.
- [ ] 2. Preparar requestR4 separado, JSON fechado de7 chaves, pai aprovado vivo e nonceR4 exclusivo. Integrar somente após CI/revisão canônica. REQUEST_SCHEMA atual não justifica relaxar o guard nem rerun do requestR3.
- [ ] 3. Executar a única R4 governada após provar deployment/alias/SSR/módulos, origem do produto e origem separada do harness. Reconciliar fonte ativa por leitura ordinária; negar as3 operações já confirmadas. Conferir report/receipts/broker/logout/cleanup/bindings e todos SHA256; congelar resultado incerto.
- [ ] 4. Completar24fixtures e bindings reais. Retomar432 e catálogo433 com gates específicos, IDs/recibos existentes e escopo mínimo. Não ampliar permissões de PII nem fabricar catálogo/IDs.
- [ ] 5. Executar auditoria privada pendente, preservando provas com aplicabilidade demonstrada. Fechar8FAIL_UI e56PII por causa comprovada. Screenshots/DOM somente após controle de privacidade; SHA256 e proveniência por caso.
- [ ] 6. Fechar72 critérios individualmente: BRAND-01 transparente exclusiva na sidebar organizacional; AppShell; sidebar expandida/recolhida/mobile; organização/status persistentes; todas rotas MASTER/progressivas; teclado/foco/contraste/refluxo/zoom/leitor de tela e WCAG2.2AA aplicável. Incluir4 larguras×2 temas nas29superfícies.
- [ ] 7. Consolidar correções de produto necessárias antes de um deploy HML, respeitando limite Vercel. Alterações só de harness não exigem redeploy do produto. Revalidar apenas consumidores/regressões afetados, além dos checks obrigatórios.
- [ ] 8. Revisão independente integral, zero falhas abertas, matriz caso/critério→arquivo/hash/SHA/deployment, checks no HEAD final, PRs integrados e checkpoint canônico atualizado por PR. Certificar somente DoD integral.

## Governança e ajustes canônicos
Este plano consolida a execução; não substitui os gates separados já exigidos. Não amplia indiscriminadamente allowlists.
Se uma regra canônica impedir solução legítima: reproduzir conflito, propor emenda mínima em docs/frontend/planos/PLANO_ATIVO.json e documento específico, testes negativos do guard, CI e revisão antes do BUILD. Preservar normas sem conflito e histórico. Nenhuma alteração canônica necessária foi demonstrada nesta consulta.
Não tocar PROD, types.ts/blob8ea7750b, proteção de branch, JWT/RLS/CSP/TLS/sandbox ou backend paralelo. Dependência139 somente com evidência específica; demais trabalhos visuais seguem independentes. Não alterar trabalho concorrente de B/C.
Rollback: revert rastreável via PR do delta novo; jamais refazer operações de negócio, compensar dados por hipótese ou reescrever histórico.

## Continuidade
Última etapa comprovada: integração440WIP/432preparatório e reancoragem443comreadback; complemento442 ainda pendente de achados/CI/revisão final. ExecuçãoR4 não comprovada.
Próxima tarefa: fechar achados442, validar12estágios, CI/revisão doHEADfinal e merge protegido antes do requestR4 separado.
Trilha A/72critérios/V1 continuam não certificados. Este documento é PLAN, não evidência de execução ou autorização para contornar controles.
