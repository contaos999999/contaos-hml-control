# Trilha C C13 — revisão independente e correção focal

Data: 09/11/2026. Baseline frontend a3a5df2b4e99705d214a509ba035f155c7ae8de9; backend 5eca44aebead3183e81b5c1af0d1dffa5fb8feb6. V1 continua não certificada, sem avanço V2. Fonte de requisitos: PLAN #450, docs/frontend/planos/TRILHA_C_COPILOTO_FRONTEND_PLAN_2026-11-08.md, itens C13 2,4,5,6,7. Autorização: determinação expressa do titular para corrigir e concluir a Trilha C, preservando A/B. Este commit registra achados; NÃO ativa BUILD, não altera manifesto, não certifica HML e não declara gates ainda não verificados como PASS.

## Achados da revisão independente de código

1. Important: retorno ao foco durante pergunta pendente é ignorado por !ocupado.current; histórico/fontes não são ocultados nem há leitura canônica agendada após conclusão. CopilotoContrato.tsx:306–321,373. Viola item5.
2. Important: novaConversa incrementa geração durante carregarHistorico sem limpar carregandoHistorico; finally antigo ignora geração obsoleta e interface pode permanecer ocupada. Linhas255,281–297,420.
3. Important: limite50s só em perguntar; listar/historico podem esperar indefinidamente e encerrar não recebe signal. Linhas200,234,267; copilotoApi.ts:67.
4. Important: validarPaginaHistorico aceita fontes [null] ou [{trecho:{}}]; render443–446 pode lançar exceção. copilotoApi.ts:54.
5. Minor: prepend de páginas244–246 não preserva posição de leitura exigida pelo item2.
6. Minor: conversão238–243 descarta incerteza/conflito_historico/baixa_confianca; flags por resposta exigidas pelo item4.

Revisão feita por executor independente read-only. Caminhos src/test/copilotoContrato.test.tsx/.ts retornaram404 no baseline; não afirmar que testes históricos43focais cobrem estes defeitos. Os seis testes existentes de copilotoApi.test.ts não reproduzem esses achados. Erro de ferramenta com window.confirm NÃO prova bug de encerramento; quatro mensagens sem cursor NÃO provam falha de paginação.

## Contrato fechado proposto para BUILD posterior

Somente src/components/copiloto/CopilotoContrato.tsx, src/lib/copiloto/copilotoApi.ts, src/test/copilotoContrato.test.tsx (se de fato ausente, criar no caminho já previsto), src/test/copilotoApi.test.ts. Documentação de gate/PLANO_ATIVO e checkpoint devem ser preparados separadamente antes de BUILD. Não modificar AppShell, rotas, routeTree, assets, tipos Supabase, dependências, guards, workflows A, backend, Auth/RLS/RPC/schema/Storage/Edge ou PROD. Supabase HML permanece único backend; JWT e autorização do servidor intactos.

## RED causal obrigatório antes de implementar

- Foco/visibility durante pergunta pendente: ocultar fontes antigas imediatamente; resolver Promise real; observar historico canônico depois, sem segundo POST perguntar; negar/erro mantém cache oculto.
- Abrir histórico com Promise pendente; Nova conversa; resolver leitura antiga: loading termina e conteúdo antigo não reaparece. Cobrir troca de sessão/contexto/logout.
- Fake timers50s em listar/historico/encerrar, transporte pendente, resposta tardia ignorada, aborto efetivo; encerramento incerto não afirma sucesso nem faz retry.
- DTO fontes null/objeto/array inválido, campos tipo/página/trecho inválidos, flags boolean|null; DTO canônico válido continua aceito. Texto sempre escapado.
- Paginação com IDs/cursor reais do contrato, dedup e posição de leitura preservada; atualizar volta à página recente sem reaproveitar fontes não revalidadas.
- Apresentar flags verdadeiras/falsas/null sem converter desconhecido em certeza.

GREEN: mesmos testes e regressões; lint/typecheck/build, Zero-Drift/LOCK no HEAD final; revisão independente do diff final. Não classificar mocks como HML. Teste C4larguras×2temas com fontes atuais e screenshots/SHA256. Confirmar diálogo canônico (não remover confirmação para facilitar automação). Reusar API42596392357 e multi-turn UIc999ebc9-e9fc-484b-881b-505e889b53cb sem repetir.

## Evidências e bloqueios independentes

CI main: Zero42638600034/job129233307149SUCCESS e LOCK42638599967/job129233306457SUCCESS consultados diretamente. TesteC129233307890SUCCESS mas browser e screenshots SKIPPED por escopo: NÃO prova autenticada27telas.

Trilha A R10 original42638883189/job129234842279FAILURE. Artefato13683268867 baixado, ZIP SHA256 b306e1a4b89e839da5244e2b0ddc589f502618a2253dbcbb61415f68cc448a43 verificado,17membros. OBSERVATION_FAILED em RPC:obter_analise_competencia_v116/RESPONSE_PROJECTION/statusHTTPNONE/requestFailureNONE; zero novas intenções/receipts vazio, logout verificado/cleanup sem falha. Comentário issue3176743205930. Não repetir dispatch/nonce/operações aprovadas. O diagnóstico não prova erro HTTP nem lacuna backend; investigação deve ser causal e preservada pela Trilha A.

## Gate e rollback

Estado: BLOQUEADO PARA BUILD até validação documental/manifesto/CI e conferência das fontes canônicas aplicáveis. Não afirmar leitura25/25 ou aprovação de PRD/BRAND/NFR sem executá-la. Marca oficial e tokens preservados; impacto visual restrito a estados/flags do painel, exige teste4×2. Nenhuma nova autorização do usuário é necessária para a correção já solicitada; seguir os gates técnicos e PR protegido.

Rollback: reverter somente futuros commits C via PR protegido, sem reescrever histórico nem reverter A/B. Publicação HML única após todas as correções/gates se necessária; nenhum deploy por correção. Certificação global permanece API_PASS_UI_PENDING/NO-GO.
