# PLAN R7: seleção da lista existente e conclusão das fixtures HML

Issue #317, prioridade 0. Autorização contínua para corrigir, testar e concluir os 184 casos originais, preservando aprovações. Este PLAN não executa Auth: exige GATE separado, RED, BUILD, GREEN, revisão independente e merge protegido.

## Âncoras e evidência

Main 2b5ac396d12ea4c71fd1b46f8fcb2f1d3f5992d1; backend observado 0e85578323ae272ba79915f9b872386d437cbc83, delta desde5459536e7f7121e2f26758841acd520f84e0ad9d sob revisão e reancoragem normativa antes do BUILD. Produto HML437c788e32f0325dd15c9d2e7277c10129bcb462/deployment dpl_F3CjrU8Q3iXrKz1YS7KfDs3VXAzp, sem mudança de produto proposta. Revalidar alias/HEADs/CI antes de etapas dependentes.

BUILD459 integrado; inspeção original42593378561/job129080113108 SUCCESS verificou artefato R6run42585173702/art13658434738/ZIP SHA25610e55ed5856aac2879188ab5f2df3b1f4a98b180de21dd7abcb470c162f9d68c. Report1813bytes/SHA8fd354bf2177f47a7b124a9d53e606de91880a45b2d94daebe46185403ebbeff, receipts55bytes/SHAfc28878b2cf8ba5df6acb7d838fa8a3b930544bb4e5af3288847db0fd24ddeaf. R6falhou FLOW_BUTTON_UNAVAILABLE no caminho SOURCE_AND_LIST/RECOVERY_READ/SOURCE_UI_CONTROL/SOURCE_UI_CONTROL: ledger8anteriores, zero novas armadas, recibos[], logout verificado, cleanupnull, bindingsnull. Saldo16 de teto24. Não repetir R1–R6 nem oito operações confirmadas.

Causa demonstrada em fonte e reprodução inerte: Painel real de GerenciarListas envolve spanLista selecionada+select+todosoptions em label; Playwright1.58.2 inclui textos das options no label, logo getByLabel exact não acha o controle mesmo com optionR5 presente. O loop interpreta ausência como falta da lista e tenta paginação anterior. Total/página real R6 não foram capturados: não inferir. Cache/refetch/timeout/backend139 não são causas demonstradas.

## Correção fechada

Primeira fase apenas scripts/hml/prepare-visual-fixtures.mjs, respectivo.test.mjs, scripts/hml/authenticated-visual-audit.mjs e respectivo.test.mjs. Helper listSelectionControl dentro da região literal Gestão de listas: texto exato Lista selecionada único/visível, parent::label único, select filho direto único/visível/habilitado. Estrutura ausente, duplicada, tag errada ou disabled bloqueia FLOW_LIST_UI_MISSING. Trocar somente quatro usos do seletor de lista, sem relaxar field global.

Validar option do UUID oficial com cardinalidade1 antes de selecionar; duplicata bloqueia. Paginar somente com controle válido e option ausente, preservando limites/unicidade/GETs/RPCs/freshness/replay. Sem recriação de lista, refetch, retry, goto, injeção DOM, alteração de produto ou timeout.

Estender primeira das duas provas nativas sourceforms com Painel/label/select/paginação extraídos por AST da fonte real e Playwright1.58.2. Demonstrar RED antigo com option presente mas lookup exato ausente; GREEN helper correto. Totais1/25/26/51, fronteiras página anterior, duplicação label/option, escopo/tag/disabled. Manter duas provas sourceforms e quinze execuções nativas totais; novas asserções não viram contagem fictícia. RED deve chegar ao browser, não falhar antes por import/sintaxe.

## Recuperação R6 e orçamento

Documento literal contaos.fixture.recovery-r6.v1 de dez campos/2599bytesASCII/canônico SHA25698136adfe0c84c274ca31534b847b640a35f2577d2ad6197e451324a51ac7e03. Blobs recovery-r6.json5eb3018862434f41814453d2f7a17494afb2b95b, report-r6.json877e9e79a0aebc244d202a439804124840321de5, receipts-r6.json5333e626432c5a1ae15756c0f54b0e80b25ef158. Conferidos independentemente contra prova original.

Validar origem, hashes, raws e semântica zero novas/ledger8/recibos vazios/logouttrue antes de login/broker e recuperação runtimeSource. Mesmas proteções Node contra Proxy/getter e erro fechado RECOVERY_R6_LEDGER se necessário. Preservar históricos bytes, oito confirmações/saldo16, sem replay. Acrescentar receipts-r6.json e recovery-r6.json ao manifesto atual: dez dados+SHA256SUMS, onze membros. Report15campos/recovery10 mantidos.

Registrar nonce único trilha-a-fixtures-20261109-r7 e ancestralidade GATE. AUTO_DISCOVER/source437 diferente harness é intencional; frontend_sha/deployment_id vazios no request. AUDIT_BINDING_PENDING permanece. Nenhum novo token/segredo.

## Sequência executável

1. GATE documental separado fecha quatro paths, fixtures, nonce, provas e fase posterior do leitor; PLANO_ATIVO/ESTADO preservam C13 e histórico, reancoram backend após delta/normativas.
2. RED CI real; implementar correção mínima, testes Node/nativos15, produto1169/42, lint/format/Zero-Drift/LOCK-TYPES/Teste C aplicáveis. Revisão independente no HEAD final e merge protegido.
3. Solicitação R7 em PR distinto, JSON sete campos apenas, pai main realmente aprovado. Dois CIs e review canônico commit-pinned. Merge normal, congelar main/deployment até execução original attempt1 terminal. Não cancelar, repetir ou disparar workflow alternativo.
4. Conferir resultado técnico real, intenções/logout/bindings. Manter etapas normais existentes: reutilizar Oct/Sep/lista/fonte; análise institucional e aprovações verídicas; registrar somente Sep, Oct disponível para apresentar. Sem mutar competência históricaNov.
5. Após R7 terminal, PR separado sob o mesmo GATE para retarget estático do leitor existente, somente scripts/hml/inspect-fixture-artifact.mjs, .test.mjs e .github/workflows/contaos-trilha-a-fixture-inspection.yml se necessário. Substituir apenas metadados reais pinados do R7 (run/artifact/head/upstream/nome/tamanho/digest/jobs/status), acrescentar dois históricosR6 e enum novo conhecido. Sem IDs inventados, leitor genérico, controlador, novo workflow, criptografia ou Auth. CI/revisão/merge protegido precedem pushmain que lê artefato somente leitura. Provas R6 históricas preservadas.
6. Root/revisor conferem bytes/hash/recibos; atualizar checkpoint GitHub. Bindings finais exigem GATE próprio antes de liberar auditoria208. Concluir184 exige nova evidência individual e revisão, não apenas finalizar fixtures.

## Preservação e DoD

18 provas públicas PR324/18PASS mantidas; Run124204PNG/102DOM e respectivas306hashes/revisão já aprovadas não serão refeitas sem regressão. Separar24casos dependentes de fixture dos demais; 184originais não equivalem a todos208privados nem232teóricos. Manter V114/V115/V116/V118 históricos e C13 sem interferência. Nenhum PROD, SQL/AuthAdmin/service_role/RLS/schema/RPC/deps/types/lock/SRC/public alterado. Backend139 somente dependência demonstrada.

Fotos/DOM privados e SHA256 serão produzidos por auditoria autenticada após bindings/GATE, sem publicação PII, credenciais, cookie/storage/HAR ou logs sensíveis. Critérios72, BRAND-01/AppShell/sidebar/organização/status/MASTER/navegação/acessibilidade exigem prova individual. Não declarar184encerrados/72PASS/V1certificada antes do DoD integral. Falhas reais geram diagnóstico/correção e checkpoint, não relaxamento de segurança ou sucesso fictício.
