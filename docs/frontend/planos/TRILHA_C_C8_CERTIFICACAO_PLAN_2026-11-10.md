# PLAN Trilha C: concluir oito telas e certificação com provas individuais

Base documental 36213b80aa016c44f229051517b65d0ff03608a0. Execução integral autorizada pelo titular, sem nova autorização genérica. Este PLAN não dispara Auth, request, deploy ou BUILD; fecha o trabalho posterior à recuperação R19. Preserva autoria única Node no BUILD552, PLAN550/GATE551, A184/24 e todas as provas históricas.

## Objetivo e arquitetura

Concluir exclusivamente V111, V114, V115, V116, V117, V118, V119 e V120 em 1440/1280/768/390, light/dark: 64 casos distintos. Preservar as 19 telas anteriores em suas origens. A execução usa o auditor Playwright protegido existente, bindings provados por UI/SDK e request de escopo fechado; nenhuma escrita de negócio para produzir screenshot. Não atribuir a uma tela aprovação recebida apenas por workflow oposto SKIPPED.

Referências: ESTADO_E_RETOMADA_CONTAOS_4_1.md, TRILHA_C_PLANO_CERTIFICACAO.md e TRILHA_A_R19_RETOMADA_FINAL_READONLY_GATE_2026-11-10.md. Stack existente Node/Playwright/TypeScript, sem dependência nova. V1 continua não certificada.

## Pré-requisito obrigatório: R19 real

BUILD552 ainda RED63c148bf nesta base. Exigir GREEN4mjs, quatro CIs finais/Zero/LOCK, nativos18, revisão independente, merge e pushCI antes de request único readonly. Consumir somente o original R19 attempt1 e sua inspeção protegida: completedtrue, logouttrue/cleanupnull, ledger19,17confirmadas+2reservas, newArmed0, recibos atuais vazios e bindings completos/frescos. Run/artifact/hash futuros não são preenchidos por presunção.

Não repetir R18, aprovação/registroSept, aprovaçãoOct, efeitos R16/R17 ou reservas R11/R15, nem usar UUID novo para repetir efeito. Candidato administrativo só é hint até readbacks JWT/UI válidos. Não repetir SELECT administrativo. Saldo5 teórico intocado.

## Escopo de implementação posterior

Somente scripts/hml/authenticated-visual-audit.mjs e seu authenticated-visual-audit.test.mjs, em BUILD posterior a GATE próprio e integração do PLAN. Nenhum src/public/types/backend/SQL/RLS/RBAC/AuthAdmin/YAML/deps/config/deploy por este escopo. Defeitos de produto descobertos exigem correção causal com escopo e regressão próprios, sem alterar o auditor para aceitar defeito.

Interfaces futuras, a fechar no GATE com evidência R19: privateCases(scope) e summarizeCases(rows,scope), argumento opcional validado sem efeito no defaultA208. C8 resolve somente os oito IDs acima a 64 chaves; A184 continua seu escopo separado, com24preservações em suas origens. Identidade de request deve resolver o escopo por nonce literal inventariado, antes ENV/Auth/efeitos; não aceitar scope arbitrário de CLI/ENV, não acrescentar oitavo campo ao requestJSON7. Nonce/ancestralidade/artefato R19 literais serão fechados no GATE após prova real, sem placeholders que liberem execução.

Diagnóstico real nesta base: privateCases() retorna208, V117/V119/V120 têm pathnull, requireSingleRequestOperation(audit) retorna AUDIT_BINDING_PENDING. Resolver a dependência com bindings e roteamento válidos; não remover o bloqueio global isoladamente.

## Tarefa 1: seleção e resumo coerentes

- [ ] RED no consumidor real: C8 seleciona64, nenhuma superfície externa; default continua208; escopo desconhecido/duplicado/injetado é rejeitado antes efeitos. Preservar A184.
- [ ] GREEN das interfaces acima, sem reduzir validateCase. summarizeCases para C8 exige64 chaves válidas distintas, nenhum caso extra/falho/abortado/unknown, passed64 e globalCompletefalse.63/duplicata/extra/falha não passam.
- [ ] Fluxo de captura itera a seleção validada; comprovar por spies que nenhum navigate/resize/screenshot ocorre foraC8. Uma falha preserva provas anteriores e só o caso afetado pode ser reexecutado em solicitação rastreável.

## Tarefa 2: bindings e conteúdo atual

- [ ] Fechar catálogo contextual após R19: valores de texto/data/IDs efetivamente observados por UI/SDK, origem e SHA; nenhum valor deduzido de relógio/template/lookupADMIN. Desconhecido bloqueia antes credencial, sem ampliar dicionário global com palavras livres.
- [ ] V111, V114, V115, V116 e V118 mantêm suas rotas/competência históricas conforme auditor existente; não substituir todas pela fixtureOct/Sept. Guardar proveniência de cada contexto.
- [ ] V117 usa Oct com requisito75938450-a972-410c-8612-da3ef7dc0e00, análise/execução/documento coerentes e drawer realmente aberto. V119 usa Oct já aprovado em pode_apresentar_contratante/100, resumo e Etapa2de2 visíveis sem registrar. V120 usa Sept/apresentação existente/pacote/hash admitidos por R19 e os três GETs originais contextualizados.
- [ ] RED/GREEN: missing/foreign/stale/pending/hostile, hash/owner/generation/source/deployment divergentes, drawer ausente e pacote sem item negados; nenhum negócio continuado pela fence. Binding não é catálogo nem PASS visual.

## Tarefa 3: controles e integração C13

Preservar API final-readback42596392357, artifact13663262831, SHA5e2177afc72b78e0a8e6109bb8795633886c8052c37a756832f616a8c5066795, API_PASS_UI_PENDING; não executar de novo o conjunto aprovado. Preservar CORS/noAuth42607662941 e Edgev8/JWTtrue. PR463 foi superada pela464 integrada50c7930d; não mesclar463 novamente.

- [ ] Conferir proveniência dos controles JWT/RLS cross-tenant/revogação/quotas no pacote API existente e deltas de fonte/deploy. Preencher matriz controle→run/caso/artefato/hash/resultado; executar apenas lacuna efetivamente identificada, nunca certificar por título de workflow ou readback administrativo.
- [ ] UI C13 exige provas próprias de sessão persistente, histórico/paginação, retomada, encerramento, revalidação de fontes e multi-turn no frontend implantado. Se necessária execução funcional distinta, fechar no GATE seus cenários, limites de consumo e fixture própria, sem repetir conversa/API aprovada ou misturar negócios da recuperação R19.
- [ ] Conferir equivalência entre frontend implantado e implementação C13 integrada antes da provaUI. Se houver diferença de produto, agrupar todas as correções e somente depois planejar um deploy HML controlado com quota disponível; sem deploy por correção ou mudançaPROD. Não presumir que source0024 contém C13 somente porque main contém464.

## Tarefa 4: CI, execução e inspeção

- [ ] RED/GREEN focal, nativos e testes de segurança preservados; lint/formato/build aplicáveis, Zero/LOCK/CI no HEAD final, revisão independente sem Critical/Important, merge normal/pushCI. Sem waiver, bypass, fakecheck ou aumento de skips.
- [ ] Request auditJSON7 único distinto e vinculado ao escopoC8, paiBUILD exato, freeze até ambos subscribers originais attempt1terminais. Sem rerun/dispatch de solicitação consumida; oposto SKIPPED não é auditoriaPASS.
- [ ] Sessão sintéticaHML normal, política readonly/fence/owner/source/SSR originais, logoutfinally comprovado.64 casos com PNGprincipal/menu complementar quando exigido, DOM permitido, logs/métricas por caso e SHA256SUMS. Nenhum token/cookie/senha/PII em saída.
- [ ] Inspeção independente usa aquisição oficial protegida, metadados/ZIPdigest/limites/membros/path traversal/privacidade antes pixels. Fechar rota técnica no GATE; não ampliar leitorJSON paraPNG por conveniência nem publicar artefato privado.
- [ ] Verificar pixels dos64 casos e BRAND/AppShell/sidebar/menu/contexto/contraste/foco/teclado/responsividade, com resultado por caso. Hash ou DOM isolado não equivale a revisão visual. Falhas corrigidas na causa e repetição só do cenário afetado, com cadeia de evidência preservada.

## Saída e revisão obrigatória

Riscos de revisão: escopoC8 que captura208; bindingADMIN promovido aJWT; fonte implantada semC13; falsoPASSporworkflowSKIP; catálogo de texto que vazaPII. Os testes e verificações das tarefas1–4 cobrem esses riscos, sem reduzir A184 ou provas anteriores.

Certificar TrilhaC somente após matriz mandatória integralPASS,64casos válidos/revisados, controles de segurança e UI13 efetivamente provados, artefatos/hashes/logout, CI/revisão/integração conferidos. Registrar19anteriores por referência própria, sem recaptura ou reatribuição de HEAD. TrilhaC não certifica automaticamente A184/72/DoD/V1 ou produção.

Atualizar GATE138 e checkpoint oficial por PR: HEADs/commits/PRs/CI/runs/artifacts/hashes/resultados/última etapa concluída/próxima tarefa. Confirmar readback da integração antes declarar checkpoint concluído. Este PLAN é preparação concreta e não prova de auditoria ou certificação.
