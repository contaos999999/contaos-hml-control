# DRAFT: vínculo pós-R2 das fixtures e auditoria somente leitura

Estado: proposta preparatória, NÃO AUTORIZA BUILD, Auth, execução ou merge durante freeze R2. Base documental observada bc14a9e232bf5abab07f71635866ea586e4ade37. Não altera request428, nonce R2, recibos ou fonte de produto. Não repete PLAN322/323/324.

## Autoridade existente e lacuna exata

P0_TRILHA_A_24_FIXTURES_PLAN_2026-11-08.md blob7a64981523e089d517db0b2723c9c61407bbd3d1 e GATE correspondente blob2de63c01afb64b4e733c5deb144ba8aa62d4124a já exigem PR distinto após recibos reais revisados para ligar V117/V119/V120. TRILHA_A_FIXTURES_RETOMADA_DIAGNOSTICO_GATE_2026-11-09.md blob09467c352153ea8d2d82bb9eae511b9589900d57 preserva auditoria AUDIT_BINDING_PENDING.

No código observado0f53, privateCases mantém V117/V119/V120 com path=null; requireSingleRequestOperation("audit") falha incondicionalmente. fixtureBindingReceipt valida formato, mas admite resultado parcial e campos opcionais; sua existência isolada NÃO prova binding completo nem capacidade atual. Esta emenda concreta deve fechar esses vínculos após R2. Nenhum ID novo será inferido ou escolhido por ordem.

## Pendências impeditivas, preenchidas somente por prova real

| Campo | Estado atual desta proposta | Prova exigida |
|---|---|---|
| r2_run / attempt / workflow / request_merge / nonce | PENDENTE | run original do request428, tentativa única, ancestry e nonce efetivamente consumido |
| artifact_id / ZIP_SHA256 / report_SHA256 / receipts_SHA256 / manifest | PENDENTE | download e conferência independente de cada membro; resultado parcial preservado |
| completed / logoutVerified / primaryFailure / cleanupFailure | PENDENTE | report real; sucesso exige completed e logout, sem falha desconhecida ocultada |
| executor_HEAD / frontend_SHA / deployment / backend_source | PENDENTE | origem exata do run e observação atual, sem herdar deployment por conveniência |
| org / contract / source / sourceVersionId / listId / listVersionId / itemId | PENDENTE_REAL_RECEIPT | contexto fixo do GATE373, fonte e relações oficiais revalidadas; não preencher por UUID plausível |
| outubro id / requirementId / documentId / documentVersionId / executionId / opinionId | PENDENTE_REAL_RECEIPT | competência2026-10-01 única e requisito AUD-A-TXT-001 efetivamente vinculado |
| setembro id / presentationId / packageId / packageHash | PENDENTE_REAL_RECEIPT | competência2026-09-01 única, apresentação e pacote oficiais imutáveis |
| estados e allowed_actions atuais | PENDENTE_ORDINARY_READ | caminhos oficiais sob sessão própria/contexto fixo, sem SQL/Auth capture |
| catálogo pós-fixture V109/V112/V117/V119/V120/V123 | PENDENTE | bytes técnicos aprovados, IDs/relacionamentos/datas reais e origem por campo |
| nonce audit / request_parent / CI / review | PENDENTE_DECISAO_FECHADA | nonce literal único definido na emenda final após inventário histórico; nenhuma execução automática deste draft |

R1 permanece histórico consumido, com duas operações confirmadas; R2 não será repetido para obter bindings. Se R2 parcial, só superfícies materialmente comprovadas podem ser propostas, sem transformar partial em confirmed. Uma emenda posterior deverá explicitar eventual execução parcial; este draft não a concede.

## Vínculo fechado das 24 combinações

- V117: oito combinações1440/1280/768/390 ×light/dark; /competencias/{outubro_real}/analise e abertura do drawer real do requirementId aprovado. Exigir execução atual e requisito/resultado/contexto de revisão coerentes. Rota de análise aberta sem drawer não cobre V117.
- V119: oito combinações na /competencias/{outubro_real}/apresentar, após aprovação institucional já feita pelo preparador. Expectativa planejada explícita: outubro em pode_apresentar_contratante, análise atual/parecer aprovado e aprovação_apresentacao_atual=true, SEM registrar_apresentacao para outubro. A UI real ainda exige allowed_actions.apresentar=true e mostra v119-resumo mais v119-registrar (Etapa2de2), não a Etapa1deaprovação. Exigir essa correspondência no recibo e observação ordinária; se ação negada ou estado diferente, bloquear e registrar o real, sem inventar preview ou aceitar página de erro. O auditor NÃO aprova, registra ou modifica outubro.
- V120: oito combinações na /competencias/{setembro_real}/apresentacoes/{presentationId_real}; competência, apresentação, packageId e hash coincidem com recibo e leitura oficial. Página vazia/erro/protocolo alheio não cobre o caso.

Fonte planejada conferida sem HML: prepare-visual-fixtures.mjs present(c,register) aprova as DUAS competências via aprovar_apresentacao quando necessário; retorna para outubro quando register=false, e somente setembro segue registrar_apresentacao. O estado confirmed exige outubro=pode_apresentar_contratante e setembro=aguardando_contratante+presentation/package/hash. CompetenciaApresentar.tsx (blobb10326ea08648e14b4bf1616499fa09a2ac898d5) distingue aprovação institucional de registro final: prontoRegistro depende de pode_apresentar_contratante, e allowed_actions.apresentar controla acesso. Portanto aprovação já existe em outubro; apresentação registrada/pacote não são presumidos para ele. R2 pode falhar ou produzir resultado diferente: recibo real continua soberano.

IDs somente de recibos revisados e leitura ordinária coerente; divergência, ausência, duplicidade, stale ou unknown bloqueiam. Binding estático não substitui revalidação do estado no run futuro. Revalidação significa reutilizar exclusivamente as leituras ordinárias já aprovadas e efetivamente emitidas pela UI/SDK no contexto fixo, com métodos, endpoints, corpo, parâmetros/paginação e política existentes: observar obter_visao_geral_competencia do wizard quando permitido pela política atual, sem introduzir chamada paralela ou transport novo. O recibo, allowed_actions ou esta frase não autorizam nenhuma observação nova: SQL, RPC/query/coluna/endpoint/paginação fora da allowlist exigem GATE específico anterior. Se a evidência necessária não estiver nas leituras autorizadas, marcar BLOQUEADO_OBSERVACAO_NAO_AUTORIZADA e elaborar emenda fechada; não executar para descobrir.

## Catálogo e privacidade após as fixtures

GATE389 cobre somente os dois intervalos antigos V109, não novos registros. GATE391 cobre catálogo SYS04 fechado; V112 possui projeção ARIA específica; V123 deve refletir o conjunto efetivamente retornado depois das fixtures, nunca presumir que continua10eventos. Toda mudança de campos visíveis exige registro novo ou emenda fechada compatível com seus gates.

Scanner sensível original primeiro; depois reconhecimento de campo/contexto/proveniência exatos. Nenhuma regex global UUID/data/palavra, masking, corte de DOM, filtro de UI, mudança de RLS ou liberação de vizinhos desconhecidos. Nome repetido não identifica card: preservar bijeção ordenada e subtree/multiset aprovados. Actor UUID operacional pseudônimo tem escopo consentido, não é declaração synthetic nem lookup de identidade. Sem Authresponse/headers/cookies/storage/trace/HAR/PIIbruta. Recibos técnicos minimizados não autorizam exportar conteúdo desconhecido.

## Complemento pós-R3: campos afetados e limites das rotas

R3 ainda não fornece bindings finais neste draft. Não executar consultas, consumir nonce ou atualizar catálogo por inferência. Preservar exatamente184casos originais e seu ledger;24fixtures são três superfícies×8 dentro desse escopo. Run124histórico:96PASSauto provisórios+8FAIL_UI+56PII+24FIXTURE=184; resultados posteriores devem permanecer separados por origem/HEAD/run, sem reatribuir PASS ou certificar qualquer caso por este draft. Nenhuma liberação de AUDIT_BINDING_PENDING até recibos reais e vínculos fechados.

| Superfície/campo afetado | Registro posterior exigido | Limite |
|---|---|---|
| V107 atualizado_em da fonte após ativação | valor técnico observado oficialmente, formatoUI real e proveniência vinculada à operação/registro real | não copiar timestampR1/R2, não globalregexdate |
| V109 lista nova criada/reconciliada pelas fixtures | listId/listVersionId/itemId e nome/descrição/datas/estado efetivamente visíveis da lista nova | listaantiga1613484c-87ee-4276-a464-d1a378134fc9 NÃO presumida alterada; GATE389 antigo não autoriza nova lista |
| V112 linhas2026-09/2026-10 | IDs técnicos, meses, estados, datas, ordem e projeçãoARIA reais das duas novas linhas | manter todaslinhas/background íntegros e desconhecidos bloqueados |
| V117 drawer de requisitoOct | competência/análise/execução/requisito/resultado efetivos e DOM completo de drawer+análiseOct ao fundo | não cortar ou ocultar background para passar scanner; não usar requisitoNov por conveniência |
| V114/V115/V116/V118 da matriz | continuam competência históricaNov59072760-4420-4598-82dd-367f41a79e89 | R3 não autoriza mutarNov nem trocar essas rotas porSep/Oct implicitamente |
| V123 novos eventos apósfixtures | rito/catalogação separado433 e dados atuais revisados | este draft não antecipaaceite nem repete descobertaV123 |

A topologia de rotas da auditoria permanece a aprovada: somente V117/V119 usamOct e V120 usaSep nos vínculos propostos. A necessidade de backgroundOct emV117 não troca V116 formal da matriz, que continuaNov. OutrosIDs só mudam com prova e GATE específico; nenhum alias/routing por semelhança.

### Recibos não equivalem a catálogo de conteúdo

safeReceipt minimiza IDs sem semântica de roles e contém hashes de payload; esses hashes não revelam timestamps/bytes visíveis nem provam coluna/role de cada UUID. fixtureBindingReceipt atribui roles técnicas de fonte/lista/item/competências/documentos/execução/parecer/apresentação/pacote, mas não transporta timestamps. Nenhum dos dois fornece sozinho catálogo completo de privacidade da UI.

Portanto o documento de aceitação posterior deve distinguir: (a) ID e role comprovados pelo binding; (b) operação/proveniência/hashes do recibo; (c) valor/timestamp e contextoDOM realmente vistos por leitura ordinária oficial já autorizada. Campos ausentes permanecem PENDENTE. Usar exclusivamente UI/SDK e observaçõesjáaprovadas, método/endpoint/corpo/cols/paginação fechados. Nem receipt nem role/allowed_actions autorizam novaSQL/RPC/query ou rede. Se não houver prova no conjunto existente, preparar GATE específico de leitura mínima ANTES de ler, preservando classificação/PII e semAuthcapture.

Não inferir datas por relógio do run, hashes por descrição, nomes por template ou situação por sucesso de mutação. Validar sourceformat/fuso/tamanho e relações atuais; scanneroriginalprimeiro e unknownneighborsbloqueiam. Esses vínculos são pendências de evidência, não motivo para remover barreiras.

## GATE final e BUILD posterior separados

Este draft deve permanecer aberto até os campos impeditivos serem preenchidos e revistos. O GATE final deverá versionar catálogo/recibo técnico novo em docs/frontend/auditorias/evidencias/, com schema fechado e hashes reais, sem modificar seis/sete recibos históricos. CI e revisão independente no HEAD final, integração coordenada APÓS encerrado freezeR2; só então BUILD.

Allowlist futura proposta: scripts/hml/authenticated-visual-audit.mjs e scripts/hml/authenticated-visual-audit.test.mjs para validador de binding/proveniência, três rotas/drawer, catálogo por campo e liberação condicionada operation audit. Não modificar preparador, workflows, SRC/public, dependências, backend, tipos ou transporte. Se implementação precisar outro caminho, revisar GATE antes de editar.

Manter schema_version1 e sete chaves da solicitação; request audit será PR posterior de UM JSON, com parent/nonce/HEAD exatos e ancestralidade real. Não reutilizar automaticamente o nonce audit histórico só porque ainda consta no código. AUTO_DISCOVER vazio/vazio mantém sua prova original; pares divergentes continuam bloqueados. Preservar histórico consumido/uniqueness/paginação/replay e source freshness.

RED obrigatório: audit ainda bloqueado sembinding; recibo parcial/adulterado/origem falsa, campo extra, IDs trocados, outraorg/contrato/mês, pacote/hash divergente, execução stale, drawer ausente, vizinhoPII, nonce repetido e request sem ancestry. GREEN exige validador e Chromium source-real com casos positivos e negativos, native8+visual1+suplementos/factory atuais intactos; CI/protocolos/LOCK/review antes integração. Não chamar fixturelocal de HML.

## Auditoria208 e DoD232/72

Solicitação posterior somente leitura para208 protegidos, preservando18públicos aprovados e baseline nas respectivas origens; não repetir provas públicas para inflar contagem. Auditor não recebe política de negócio nem captura Auth. Tudo sujeito ao deployment/SSR/110/fontes e factory/fence comprovados, concurrency compartilhada, login normal e logout em finally.

Manter ledger232 por superfície/estado ×largura ×tema, V117 distinto como drawer. Reconciliar por chave com os208 protegidos e provas públicas históricas, sem reatribuir SHA/deployment antigo ao novo. Para cada linha: applicability, source/deployment/executor, artifact/member/hash PNG e DOM permitidos, métricas, revisão independente, estado PASS_REAL/FAIL/BLOQUEADO/NAO_VERIFICADO e motivo técnico. TesteC automatizado é provisório até revisão aplicável.

Inventário72canônico edd707e86cca5c62885266e603e534a8668e6504 reproduz literalmente20_PROMPT_000_BRAND_01.md blob44aa2b4cde873f1a218ef8e705fc2b5f07d4cdc5. Ledger232 b2bb5fc5657a6077a2f62d080a8904c12c0d161a histórico mantém evidências nulas; atualizá-los só em etapa posterior autorizada com evidência, sem sobrescrever origem.

| Critérios | Prova primária adicional |
|---|---|
|1–5,38,46| funcionalHML/login/logout/rotas/permissões/mobile; teclado real conforme controle |
|6–17,24–25,61–72| diff delimitado à tarefa, código/assets/dependências e integridade; reconhecer exceçãoGOV017 e não atribuir mudançasCàA |
|18| SecurityScan sem novoCritical noHEAD final |
|19–23,26–31,33–36,39–45,47,49–50| revisão visual/asset oficial/tamanhos/estados/temas; screenshots independentes |
|32,37| HTTP/favicon/cache e manifest/aplicabilidade |
|48,54| contraste contextual medido, mantendo dois critérios distintos |
|51–53| DOM/ARIA e significado não dependente de cor; teclado quando interativo |
|55–58| build/TS/lint/testes noHEAD final |
|59–60| console runtime semerro/logsensível, comprovação minimizada |

Cada um dos72 deve possuir decisão individual e referências; não converter232/232 ou208/208automáticos em72PASS.34–37PWA precisam reconciliar N/A histórico documentado e ausência manifest;20vertical exige aplicabilidade/manual;24–25preservam derivadoGOV017aprovado. N/A fundamentado não é PASS inventado.

Estado deste draft: nenhum24caso liberado, nenhum184certificado,72NAO_VERIFICADO_GLOBAL,V1NO-GO. Nenhuma escritaHML/Auth/SQL/request/merge/deploy executada por este documento.
