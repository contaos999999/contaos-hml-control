# PR679 — Emenda R5: fechamento das causas e regressões

Estado: VALIDADO tecnicamente. Eficácia para BUILD condicionada à integração deste PLAN com CI, auditoria independente e revisão formal autorizada. Nenhuma correção executável nesta PR documental. Não aprova retroativamente R1–R4 e não certifica a Fase3.

PR documental [687](https://github.com/contaos999999/contaos-hml-control/pull/687). Primeiro commit de PLAN `5c061350cd36a03e9bcf8a6d44ae5bdb59f138ad`: quatro checks PASS; [Zero-Drift43702328082](https://github.com/contaos999999/contaos-hml-control/actions/runs/43702328082) SUCCESS com regressão completa/build/typecheck; Teste C documental sem evidência visual. Vinculação dessa CI no PLANO_ATIVO antecede qualquer BUILD; o novo HEAD que publica esta prova precisa de seus próprios checks e auditoria antes da revisão/merge. CI42372512665 do mestre é histórica e não foi usada para provar esta emenda.

## Contexto, autorização e baseline

O titular autorizou concluir a instalação da auditoria automatizada e depois resolver os achados da PR679. Instalação concluída: PR684 merge `e3f42b393eeb64355e81c92e928093485608ba95`; controlador instalado3.1.4 SHA256 `9165f22dd011ae3a5aacdfd8f16eca6c0b715cec9822fc48fc16a51c7f194d91`. Recibos integrais publicados na PR686, HEAD `532597d5c45f54da26bc792e22d0880f6e66d7df`; auditoria R2 PASS RunId `20261115T093730374Z-532597d5c45f-860901f78f5046799c2e824c7a78d335`, parecer SHA256 `FB29D7AAEB630A4FB5DE08139D3F6B745CADBA2D31079E0A2668E51035EE173F`; review5910101529 APPROVED Edivan5002 após autorização específica; merge protegido `02361d2397919a3d711948294f97029aad5a5841`. Quatro checks pertinentes pós-merge SUCCESS. Recibos em `docs/frontend/auditorias/instalacao-automatizada-v3_1_4/RCA_E_EVIDENCIAS.md`. Não repetir auditorias válidas dessa instalação.

Baseline main `02361d2397919a3d711948294f97029aad5a5841`; PR679 OPEN, autor Edivan5002, HEAD `9c0ed0f0ddfc0fc91512dff2e290e0a8d6826c71`, base gravada obsoleta `20d4ad96fd1f7ec02baa3bd618532385065a729b`. Antes de BUILD receber a main que integrar este PLAN por merge, sem rebase/force/squash. O SHA efetivo dessa integração será a baseline da prova V1. Manter o HEAD9c e seu CI como ancestrais para RCA verificável.

Fonte normativa somente leitura: `contaos999999/develop@1504af465b45afc846458d00e5cb63513fa298ed`. `context_pack_version=4.1`, `context_read_acknowledged=true`; lidos os25 documentos00–20/08A–08D e conferidos os25 blobs contra `CONTEXT_CANONICO_4_1_SNAPSHOT.json`, além de P0 ordem/NR/ledger, RCA, ADR-DEV-002 e PLAN Fase3 §7.2/7.3/7.6/9/12. Usar lista nominal/fingerprint do snapshot, sem segunda fonte normativa. Contexto75/V1: integração Fase3 pendente, preservar certificações anteriores; não iniciar V2 nem certificar100 regulares/97 atômicos por este trabalho. BRAND-01 lido e preservado. Aplicabilidade: drivers dos fluxos F3 ADM01/V1-02/03/05/06, regressão de teste V1-15/V1-10 e governança; NFR de segurança, idempotência, rastreabilidade e testes. Sem mudança funcional/UI.

## P0-NR e análise causal ampliada

NR008 CONHECIDO: reincidência da classe livro/fence e proveniência escolhida pelo chamador. Recuperados PLAN678, review R3 [5906840506](https://github.com/contaos999999/contaos-hml-control/pull/679#pullrequestreview-5906840506), implementação R4 e testes antes de propor nova tentativa. R4 não fechou a classe inteira. Corrigir a regra central compartilhada por livro, relatório e replay, em vez de mais uma validação apenas na saída do executor. NR001/005/006 CONHECIDOS: base viva, allowlist prévia e prova acessível ao auditor; nenhum retry sem delta ou hash local isolado como prova. NR009 pertence à instalação já integrada; preservar registro histórico sem promover status sem protocolo próprio.

Confirmação diagnóstica no Windows/Node24.22.3, sobre blobs exatos de9c em TEMP, import real por file URL, sem rede/secret/HML. Resultado SHA256 `62bc755e74375d49367212a3c5309476788bbe6dd56aedcb78d5c1739974b076`. O arquivo local não é requisito de acesso do auditor: os contratos, entradas e resultados reproduzíveis estão abaixo; BUILD acrescentará testes versionados e recibos integrais, não somente caminhos locais.

| Classe | Reprodução e resultado observado em9c | Causa / hipótese descartada |
|---|---|---|
| Livro incompleto | Criar organização F3 por produtor2; selar ADM01/produtor4, bind apenas passo0 dos2 declarados, uncertain, reconcile(found=true). Livro confirma; validateF3Ledger aceita replay. Controle com2 binds também aceita. | found não exige vínculo completo; não é apenas relatório/fence, pois livro e replay aceitam. |
| Identidade derivada | Criar dois registros A/B do produtor5, segundo como prerequisito; produtor6 recebe p_id_contratante=A e p_versao_esperada referenciada a B, mesma origem/org/tipo. bind e replay aceitam. Controle A/A aceita. | Valida origem de cada ref separadamente, sem igualdade com a referência declarada em derived. Não é tenant ou origem incorreta. |
| M4 Windows | import(path absoluto C:\...) retorna ERR_UNSUPPORTED_ESM_URL_SCHEME; import(pathToFileURL(path).href) carrega o mesmo módulo. Teste M4 copia node_modules e usa .pathname no fallback. | URL de módulo não portável e preparação excessiva; dependências não podem simplesmente ser omitidas: auditor importa typescript/jsdom/parse5. |
| Teste React | [Zero-Drift43637544739](https://github.com/contaos999999/contaos-hml-control/actions/runs/43637544739), SHA9c: teste “paginação remove requisito selecionado: reseta vínculo, tipo e tentativa antes de enviar”, competenciaDocumentos.test.tsx:766, encontra alerta anterior no queryByText imediato;1265 PASS/1FAIL. | select sem opção já parece vazio antes de efeito que reiniciaEnvio terminar. Falta sincronização da asserção; não há prova de defeito no componente. Intermitência local não invalida o RED real de CI. |
| JSON | Em9c, integracao_funcional_fase3_r1 contém duas chaves build2b2a_revisoes; parse mantém sóR3/R4 e perdeR1/R2. Blob bruto SHA25644504096307fc0e2b22f66a4c12c57074c8b61a5b82b413798de6f8c536c065a. | JSON.parse aceita duplicata; não é divergência visual nem autorização para apagar histórico. |

Não declarar que75 testes anteriores provam execução Windows/M4. Conservar evidências antigas como históricas e acrescentar ressalva e resultados novos reais. R1/R2/R3/R4,37 mutantes antigos e obrigações menores permanecem rastreáveis, sem convertê-los em PASS global.

## Escopo fechado e emenda expressa

Este PLAN **emenda a proibição src/** do §7.6 do PLAN Fase3 exclusivamente para `src/test/competenciaDocumentos.test.tsx`, teste existente e sem alterar produção. Não autoriza qualquer outro src. A correção da duplicata em PLANO_ATIVO é explícita e limitada ao membro acima. Uma única emenda anterior ao BUILD fecha as cinco causas e preserva9c como ancestral do RED React; separar a correção React em branch sem esse ancestral impediria a prova causal do gate RCA.

Allowlist BUILD679, exatamente10 arquivos:

1. `scripts/hml/integracao-v1-fase3.mjs`: regras centrais de completude e identidade derivada.
2. `scripts/hml/integracao-v1-fase3.test.mjs`: RED/GREEN, replay, propriedades, mutações, M4 e detector de duplicatas.
3. `src/test/competenciaDocumentos.test.tsx`: somente aguardar remoção do alerta antigo; preservar demais asserts/mocks/casos.
4. `docs/frontend/planos/PLANO_ATIVO.json`: consolidar uma chave R1–R4 sem perda e acrescentar R5/provas, preservar escopos históricos e emenda prévia.
5. `docs/frontend/auditorias/integracao-funcional-v1/fase3/BUILD2B2_DRIVERS.md`: estado e provas novas, preservar histórico.
6. `docs/frontend/auditorias/integracao-funcional-v1/fase3/F3_FLUXOS_PRODUTORES.md`: contrato e evidências por classe.
7. `docs/frontend/auditorias/integracao-funcional-v1/fase3/PR679_R5_RCA_2026-11-15.md`: RCA/impacto/RED/GREEN/mutações/CI e recibos verificáveis.
8. `docs/frontend/rca/P0_ESCOPO_V1_ATIVO.json`: prova v2 exigida pelo gate existente, apenas o teste TSX em escopo.
9. `docs/frontend/governanca/P0_NR_001_LEDGER.json`: aprendizagem/barreiras de NR008 com estado honesto, preservar NR009 e demais entradas.
10. `docs/frontend/ESTADO_E_RETOMADA_CONTAOS_4_1.md`: prepend de situação atual e próxima ação; preservar histórico.

Esta PR de PLAN altera somente este documento, `P0_GOV_PLAN_679.json`, `PLANO_ATIVO.json` (pré-autorização do único teste e vínculo à emenda) e checkpoint. Não modifica código nem corrige ainda a duplicata que existe somente na branch679. GOV679 passa a apontar esta emenda; a revisão APPROVED e merge desta PR tornam o novo escopo eficaz, nunca a autodeclaração approved isolada.

Proibidos: componentes de produção, UI/rotas/brand/assets, routeTree, workflows/guards/proteções, dependências/locks, outros scripts, backend/Supabase/schema/RLS/RPC/Edge/Auth/Storage, execução REQUEST real, dados/usuários HML e PROD. types.ts congelado no blob `8ea7750b75fd9d76b29c36ce7613392e3ab65e19`. Nenhuma redução de testes, sandbox ou Teste C. Se surgir necessidade externa aos10 arquivos, suspender BUILD e emendar previamente.

## Desenho, impacto e antirregressão

1. found exige ao menos vínculo válido e todos os passos declarados duráveis. Usar histórico de binds, não apenas sendBinds: resend zera o contador da tentativa, mas late-found pode reconciliar envio anterior completo. uncertain/reject parcial continua possível; o livro deve preservar fatos aceitos observados, inclusive entidades estrangeiras/duplicadas, sem descarte seletivo. Operação inválida faz rollback transacional do evento. Relatório e ledger usam a mesma regra.
2. Cada campo derived deve referir exatamente entityId do campo inventory indicado no contrato daquele passo, além dos controles existentes de origem/org/tipo/versão. A/A válido; A/B inválido mesmo ambos aprovados na mesma origem. Casos negativos cobrem demais fluxos com derived, reenvio e replay; não duplicar regra somente no fence.
3. M4 usa fileURLToPath para caminhos e pathToFileURL para import; fixture temporário liga node_modules existente por junction Windows/symlink apropriado, sem copiar árvore nem alterar dependências. Cleanup limita-se ao diretório TEMP resolvido e ao link; comprovar alvo de dependências íntegro e não remover recursivamente alvo compartilhado. Não editar authenticated-visual-audit ou package. Fixture sem deps deve falhar com diagnóstico claro, sem instalar durante auditoria.
4. React: waitFor da remoção do alerta após paginação, mantendo reset vínculo/tipo/tentativa, tentativa vazia impedida, exatamente duas chamadas/upload no fluxo completo e chave nova. Não relaxar assert, aumentar timeout global ou alterar componente para satisfazer teste. Repetir o caso para observar estabilidade, além de suíte relacionada completa.
5. JSON: uma chave com histórico cronológico literalR1/R2/R3/R4 e R5. Detector por objeto lexical, combinado com parser sintático; duplicata dentro do mesmo objeto deve falhar, mesma chave em objetos irmãos deve passar; incluir aninhamento/escapes. Não usar reviver que recebe dado já sobrescrito ou set global. Aplicar ao PLANO_ATIVO real no teste versionado.

Mapa de impacto: regras centrais afetam createF3IntentBook, relatório/fence/replay e consumidores dos drivers; falso bloqueio em resend/late-found é o principal risco. Testes completos, interleavings, reset da tentativa e rollback previnem. Derivados afetam V1-03/V1-06; positivos dos demais passos impedem quebra indevida. M4 afeta apenas preparo de fixture; checagem de alvo e execução nativa Windows impedem dano ao node_modules. React afeta apenas sincronização de teste; cobertura de contagem/erro/vínculo preserva a semântica. JSON afeta prova documental e leitores last-wins; consolidar texto sem resserialização que apague duplicatas silenciosamente. Segurança, permissões, contrato de backend e persistência permanecem intactos por diff.

## RED → GREEN → AUDIT e gates

Antes de implementar, adicionar negativos para found parcial/sem vínculo, derivado A/B, replay equivalente, M4 Windows e duplicata por objeto. Executar sobre9c e preservar saída RED; controles positivos devem passar. RED React é o run43637544739 acima, sem fabricar intermitência determinística. Depois aplicar mudanças mínimas; todos os negativos passam por rejeição esperada e positivos permanecem válidos. Propriedades: ordens/interleavings legais, invariantes de completude/proveniência após replay e imutabilidade do estado em evento rejeitado. Mutações mínimas removem cada guarda central e devem morrer no teste correspondente, sem substituir os37 anteriores.

V1scope schema contaos.p0.v1-scope-proof.v2, versaoV1/prompt75: baseline.frontend_sha será o merge-base real com a main integrada deste PLAN; backend_sha normativo acima, sem inspeção backend. escopo contém apenas TSX. itens incluem RCA/reprodução/hipóteses/solução/rollback/impacto/RED/GREEN/negativos/regressão conforme gate atual. RED run_url43637544739 e run_sha9c, caso textual da falha; conferir ancestralidade e logs autenticados. GREEN pode usar nome completo Vitest4 (describe + espaço + caso), comprovado por execução, não reutilizar nome inadequado para forçar PASS. Nenhuma alteração do gate para dispensar prova.

Sequência obrigatória: CI desta PR documental verde → registrar run de CI do PLAN nesta emenda/PLANO_ATIVO antes de BUILD → auditoria instalada3.1.4 no HEAD final com base viva/hashes → autorização específica da revisão formal e merge protegido → merge main na679 → RED/BUILD/GREEN → lint/typecheck/build, suíte node F3, suíte React e regressão apropriada, gates de escopo/RCA/version/routeTree/LOCK/NR → push/CI679 → auditoria independente completa → tratar todos os achados por classe → autorização específica de review por contaos9999 (autor679 éEdivan5002) → merge protegido e checks pós-merge/checkpoint.

Teste C independente continua obrigatório; mudanças de drivers/testes/documentos não mudam UI: testes visuais1440/1280/768/390×claro/escuro de produto são N/A por ausência de alteração visual, não PASS visual ou E2E autenticado. Verificar o check e seu escopo real, sem contornar skip indevido. Não executar teste de escrita dentro da auditoria read-only; preparar provas previamente. CI/MOCK não certificam REQUEST real F3.

Validação nominal do PLAN: PRD/premissas/arquitetura/atômicos/brand/segurança/NFR/Zero-Drift/TDD/CI planejada/Teste C planejado/rollback PASS para este desenho fechado, conforme fontes acima. Não equivale a resultados GREEN de BUILD ou à integração deste PLAN. Autorizações específicas de revisão permanecem obrigatórias. Nenhuma alteração visual exige novo aceite BRAND-01.

Rollback: antes de merge, revert dos commits de BUILD na própria branch, preservando histórico; após merge, PR de revert com mesmos gates. Não alterar main diretamente, não remover controles, não reverter tipos/backend. Evidência adversa reabre análise do conjunto, sem remendo por sintoma. Conclusão somente após integração efetiva e provas atuais, nunca por parecer local ou PR aberta.

## ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE (OBRIGATÓRIO)

Preservar integralmente ContaOS Brand v1.0/BRAND-01, Design System e comportamento. Economia por GitHub direto e correção única por causa; nenhuma chamada de BUILD ao Lovable, nenhuma redução de fidelidade, segurança, acessibilidade ou Teste C.
