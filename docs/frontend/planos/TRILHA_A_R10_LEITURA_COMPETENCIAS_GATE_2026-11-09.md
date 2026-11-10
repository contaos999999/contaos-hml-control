# GATE R10: leitura mensal concluída antes de avançar

Incorpora integralmente PLAN476, HEADc02681e7ce279af7ead394ced8b0f3d128871c31/blob6480da91171aa089444caeaa90b9f2535f4c04bd, integrado em52493ee72122a218c3da9cae8ad054da19ac5b3d com parents0144f12829fcd9bdd5557950f095a3479ffafe14/c02681e7ce279af7ead394ced8b0f3d128871c31 verificados. CI42627209588LOCK/42627209706ZeroSUCCESS; reviews5826638239/5826659115zeroCritical/Important. Autorização contínua do titular já concedida. Este GATE não executa Auth, SQL ou mutações.

## Âncoras e preservação

Base52493ee, backend5eca44aebead3183e81b5c1af0d1dffa5fb8feb6, HMLREADY437c788e32f0325dd15c9d2e7277c10129bcb462/dpl_F3CjrU8Q3iXrKz1YS7KfDs3VXAzp revalidado durante o PLAN. Snapshot/context5eca, source_proof histórico, C13,25normativas/catalog100/97/tipos8ea7750b75fd9d76b29c36ce7613392e3ab65e19 preservados. Não redeploy por harness. R9real e14/14 hashes constam do checkpoint6741228761; PLAN476 incorpora os três raws e fonte forense. O GET/action específico que causou o aborto R9 não está identificado; não atribuir causa ao R8.

R9 report: OBSERVATION_FAILED, TABLE:competencias/BODY_READ/HTTP200/ABORTED, phaseSOURCE_AND_LIST;10confirmadas/zero novas/saldo14/flagsfalse/logouttrue/cleanupnull/reconciledfalse/bindingsnull. Sem dependência backend139 demonstrada.

## Escopo fechado

BUILD somente scripts/hml/authenticated-visual-audit.mjs e .test.mjs; scripts/hml/prepare-visual-fixtures.mjs e .test.mjs. Sem YAML, produto, dependências, lock, SQL, tipos ou permissões novas. Este GATE atualiza somente si próprio, PLANO_ATIVO e ESTADO, acrescentando R10/allowlist documental e preservando campos anteriores. Reancorar documentos apenas se HEAD realmente mudar e comparação comprovar escopo.

## Sequência local e evidência da query

Aplicar nos dois consumidores reais: reconcileRecoveryCompetencies e prepareCompetencies.listMonth. Preservar navegações necessárias para reset de filtro/freshness. Antes de goKnown/goto, drenar leituras já admitidas; não depender só de networkidle. Após a navegação, aguardar e validar o corpo da leitura inicial da lista, capturar NOVO ordinal imediatamente antes do fill do mês, e só avançar após leitura mensal posterior a esse ordinal. Nenhum comando de negócio antes dessa prova. Não promover cache, linha prévia ou consulta inicial a evidência mensal.

Modo local de opções queryScope:'RECOVERY_COMPETENCE_MONTH', exclusivamente em observedAfter/waitObservedAfter/read de TABLEcompetencias. Validar modo/where/select/after ANTES de causalFloor, waitTarget ou snapshots. Em RPC, outra tabela, modo desconhecido, extra where ou mês November, rejeitar. Where exato: id_contrato=FIXTURE.contract e competencia_referencia em October/September aprovados. after obrigatório e consistente com argumento posicional de observedAfter. Select literal: id,competencia_referencia,periodo_inicio,periodo_fim,data_limite,situacao,percentual_conformidade,versao_pacote_atual,atualizado_em. Query admitida deve conter eq(id_contrato,contrato fixo) e eq(competencia_referencia,mês), offset0/limit25/ordercompetencia_referencia.desc,id.desc, sem filtro de situação não pedido.

Default e matchesObservation global permanecem intactos. Neste modo local, considerar a observação mais nova relevante do mesmo contrato, inclusive sem mês/select parcial/empty, ANTES de escolher a projeção mensal. Resposta inicial/unfiltered posterior ao marcador não satisfaz o filtro e não autoriza fallback para olderexact, inclusive quando a mais nova é vazia ou id-only. Request ordinal anterior com corpo tardio não substitui request mais novo. Preservar deduplicação antes de filtragem de estado/projeção; nenhum snapshot de mutação pode contornar a query. Floor de criação de competência inesperado neste recovery deve falhar fechado, pois ambas competências R5 já existem e a repetição é negada.

## Prazo e fatalidade

Um único orçamento monotônico opaco de no máximo15s cobre a operação local de leitura, desde a espera inicial/request até corpo validado e rows mensais; não reiniciar15s por request, flush, observedAfter ou read. A orquestração pode compartilhar token privado de deadline ou fazer read atômico; nenhum valor de env/CLI autoriza prolongar ou desativar a barreira. Incluir flush que poderia aguardar corpo sem fim. Navegações e verificação de deployment mantêm limites atuais; nenhum novo request/retry/refetch/reload adicional/invalidação de cache.

Se request ainda não tem resposta, aguardar sob o mesmo orçamento. Rastreamento adicional, se necessário, limitado aos GETs/RPCs de leitura já admitidos e com RED específico. Não ampliar matcher, URL, query, argumento ou DTO; não criar listener irrestrito. Deadline expirado impede avanço tardio, mesmo se o corpo for liberado depois; cleanup/logout continuam autorizados. Não armar comando após timeout.

Aborto, status ruim, corpo inválido, contexto divergente, ausência ou timeout permanecem fatais. Usar erro fechado existente e diagnóstico UNAVAILABLE quando o detalhe não puder ser provado. Nunca ignorar ABORTED ou importar message/stack/URL/corpo/token para diagnóstico. Preservar primeira falha antes do throw, schema6/first4/matriz8, report15/diagnostics9/recovery10, seal3s/detach→drain→close e decisão final fatal com primary anterior preservado.

## RED e Chromium inerte

CI é o executor; não iniciar VM paga ou alegar browser executado antes do log. Primeiro publicar testes e demonstrar falha causal do consumidor atual. Reproduzir separadamente a admissão do GET inicial por rowmonth e o cancelamento React Query de corpo200 pendente; não afirmar que a fixture identifica univocamente o GET histórico R9.

Acrescentar o terceiro teste nativo com nome exato: R3 Chromium sourceforms competence read barriers and actual recovery consumer. Preservar ordem/nomes dos dois anteriores. preparerSourceFormsSupplement exige TAP1..3, três nomes fixos, tests/pass3 e fail/skip/cancel0; retorno3. Native guard exige3 e consolepreparerSourceFormsCases3 deriva do TAP. nativeProof.passed permanece EXATAMENTE8 e conserva hash/identidade/guardas. Total derivado16=8+1+3+2+1+1, sem enfraquecer contadores.

Usar React Query congelado5.101.4, ListaCompetencias/FilterBar/listarCompetencias e consumidor/observer reais ou extração controlada existente, HTTP loopback inerte com corpo/headers controlados e factory nativa existente. Sem page.route/fallback, Auth, HML, Supabase real ou escrita. Override de destino somente no harness de teste isolado, nunca novo parâmetro/env de produção. QuerySDK exata e causalidade devem ser observadas pelo servidor.

Negativos obrigatórios: unfiltered pós-marcador com rowOctober; olderexact seguido newerunfiltered/empty/id-only; request antigo com corpo tardio; pending sem headers e pendingbody; timeout único e ausência de fill/link/command tardios; contexto divergente durante drain; erro anterior preservado; modo fora de competências/RPC/where extra/November/floor inesperado. Positivo só avança após corpo/query mensal corretos, abort0/writes0. Node, Chromium e contadores devem medir ações reais, sem simular drain exitoso.

## Recuperação R9 e artefato

R9Doc obrigatório antes de login em todo broker/runtime recovery, sem fallback. Blobce22f033a617f89192aa397fd9cd1cdab8512eb4,3170ASCII/SHA25671e20cc2dfd5888ab22228efe2b253eea316194ce0503e262ad58aef516078b8. Schema contaos.fixture.recovery-r9.v1 e12chaves na ordem: schema,workflowRun,artifactId,requestId,harnessSha,zipSha256,reportSha256,receiptsSha256,observationSha256,reportRaw,receiptsRaw,observationRaw. Valores/bytes iguais ao documento pinned; validar canonical/hash/identidade/projeções e rejeitar extras/símbolos/Proxy/accessors antes de leitura.

Raw report1813/4163c5266ed9715ceafa3650af55a42348636cfbccceb9c8f124b55ab1eac31e; receipts55/fc28878b2cf8ba5df6acb7d838fa8a3b930544bb4e5af3288847db0fd24ddeaf; observation404/6beb2ab824c183a65b1bd7334a4a6ab7ca878a0c6cab999a32dfd39a4ec5cad6. Confirma zero novas intenções R9, não zero Auth. Budget10+14/teto24 e dez negações semânticas preservados, inclusive documento/análise October com UUID novo. Não reescrever R8prior8/max16 ou R9prior10/max14 históricos.

Artefato futuro16dados+SHA256SUMS=17membros/HISTORY13: adicionar somente receipts-r9.json e recovery-r9.json aos14dados R9; observation atual continua mesmo nome. Hashes iguais legítimos permitidos com nomes únicos; bytes históricos intocados. Sem PNG/DOM privado em logs públicos.

## GREEN, revisão e solicitação

RED→BUILD→GREEN no mesmo HEAD: protocolos Node/Chromium,16nativos com basepassed8 inalterada, lint/Prettier, Zero/LOCK, TesteC e revisão independente0Critical/Important; merge normal protegido. Depois PR separado JSON7campos nonce trilha-a-fixtures-20261109-r10, R1–R9 gastos, AUDIT_BINDING_PENDING mantido. Review canônico/CI2/mergeS(P,R), freeze main/deployment até upstream e ambos subscribers originais attempt1terminais; semcancel/rerun/dispatch.

Reader R10 só após terminal real, PR separado sob este GATE: scripts/hml/inspect-fixture-artifact.mjs e .test.mjs; workflow próprio somente se necessidade estrita comprovada, mantendo readonly. Retarget apenas IDs/hashes/size/jobs reais, validar16dados/HISTORY13/R9Doc/diagnóstico e emitir única prova técnica após validação integral. Preservar downloader/digest/captura/warnings459/FD/NOFOLLOW/prazos/bounds/CAU2; nenhuma Auth ou saída parcial.

Atualizar checkpoint com prova e próxima tarefa. Preservar18públicas/204PNG em suas origens. 184originais/24fixtures/208privados/72critérios não certificados por CI/recibos. HML somente; sem PROD/AuthAdmin/service_role/SQL/RLS/schema ou enfraquecimento de segurança.
