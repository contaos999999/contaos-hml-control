# Fase 3: fluxos de rede dos produtores mutantes (levantamento do BUILD-2b-2)

**Revisão 3, 14/11/2026.** A revisão 2 (PR #678, APPROVE 5906090998) substituiu a revisão 1, que contava pré-requisitos sem inventariar cada requisição; a R1 da #678 (review 5905890909) mostrou que isso repetia a causa das rodadas R1 e R2 do BUILD-2b-2a: desenhar a cerca antes de conhecer o fluxo inteiro (NR-008). A revisão 3 (PR #679) cumpre as obrigações M1 e M4 da review 5906090998: anota o efeito assíncrono de V115 e põe a tabela da seção 3 na ordem dos produtores. Também corrige a faixa citada de V115, achada na conferência das fontes. O executor tem um teste que liga cada fluxo declarado a uma linha desta tabela.

**Fontes lidas, sem nenhuma escrita:**
- **Frontend:** `src/**` na main `02de927`.
- **Backend:** definições das funções (`pg_get_functiondef`, esquemas `public` e `privado`), gatilhos, `configuracao_upload`, `cron.job` e contagens agregadas do Supabase HML `gklhhhyosgasnyoxlrui`. A leitura foi autorizada pelo titular ("Autorizo só leitura (Recomendado)").

Este documento não tem pendência aberta. Toda afirmação traz a fonte.

## 1. Lista fechada de origens dos valores variáveis

Cada campo variável do corpo de uma requisição tem exatamente uma destas origens. A cerca de mutação (BUILD-2b-2) tipa cada posição por passo com esta lista.

| Origem | Significado | Exemplo |
|---|---|---|
| `gerado_ui` | Chave nova criada pela UI no primeiro envio da intenção (`crypto.randomUUID`). Não pode coincidir com nenhuma entidade conhecida, com a organização F3, com a `e87f7e68` nem com valor já usado | `p_request_id` de V106 |
| `gerado_harness` | Conteúdo escolhido pelo executor: textos e datas sintéticos, o arquivo sintético de texto (R-01), seu nome, tamanho e SHA-256 | `p_razao_social`, `p_sha256` |
| `inventario` | ID de entidade criada por intenção anterior da F3 e registrada no livro | `p_id_contrato` |
| `derivado` | Valor do backend que a UI do MASTER lê na organização F3 antes do envio (versão, hash, `atualizado_em`, IDs de execução, resultado, requisito e parecer). Fica registrado no livro como referência observada | `p_versao_esperada`, `p_id_parecer` |
| `capturado` | Valor devolvido por um passo anterior da mesma ação | `path` e `token` da Edge, `p_id_arquivo` |
| `vinculado` | Valor de um envio anterior da mesma intenção, reaproveitado no reenvio. O livro o resolve por um evento de vínculo; uma chave nova no reenvio é recusada | chave idempotente reaproveitada |
| `usuario_sintetico` | ID e e-mail do 2º usuário sintético (ADM01). O par é conferido pela releitura de `listar_usuarios_vinculos_adm` e registrado no livro | `p_id_usuario`, `p_email` |

Campos com valor fixo no código (enums, `p_timezone`, `p_origem`, `p_acao`, `p_tipo`, `mime`) não são variáveis. A cerca os compara literalmente.

## 2. Passos compostos reutilizados

**Upload simples (`UP`).** Usado por V108, V110, V111, V115 e o pré-requisito de V122. Tem três requisições, que contam dentro da ação que consome o arquivo (PLAN §12.3).

| Passo | Alvo e método | Fonte | Campos variáveis e origem |
|---|---|---|---|
| UP1 | `POST functions/v1/storage-sign-upload` | `src/lib/contratos/documentosDados.ts:441-457`; em V108, `src/lib/contratos/baseNormativaDados.ts:173-176` | `id_organizacao` e `id_contrato` `inventario`; `nome_arquivo` e `tamanho` `gerado_harness`; `mime` literal `text/plain` |
| UP2 | `PUT storage/v1/object/upload/sign/contaos-documentos/<path>?token=<token>` (`uploadToSignedUrl`) | `documentosDados.ts:454-462`; `baseNormativaDados.ts:179-185` | `path` e `token` `capturado` de UP1. O `path` segue `^<org F3>/uploads/<uuid v4>/<nome>$` (`privado.confirmar_upload_arquivo`). O corpo são os bytes `gerado_harness` |
| UP3 | `rpc confirmar_upload_arquivo` | `documentosDados.ts:643-660`; `baseNormativaDados.ts:194` | `p_id_organizacao` e `p_id_contrato` `inventario`; `p_path` `capturado`; `p_nome_original`, `p_tamanho` e `p_sha256` `gerado_harness`; `p_mime` e `p_origem` literais. Devolve `id_arquivo` (`capturado`) |

**Pré-condições do upload:**
- `configuracao_upload` aceita a extensão `txt` e o MIME `text/plain`;
- o limiar resumível é de 104.857.600 bytes, então o arquivo sintético mínimo nunca recebe `usar_upload_resumivel`;
- se a Edge pedir TUS, `enviarArquivo` de V108 recusa com o código `resumivel`, e `enviarArquivoCertificado` iria para o TUS. A cerca bloqueia nos dois casos (`F3_UPLOAD_RESUMABLE`);
- o arquivo nasce com `status_seguranca = 'pendente'` (`privado.confirmar_upload_arquivo`).

**Reenvio do upload.** O UP3 não tem chave. `enviarArquivoCertificado` guarda o estado de cada etapa (`EstadoEnvio`, `documentosDados.ts:665-724`) e não repete etapa concluída. O `enviarArquivo` de V108 não guarda estado. Um UP incerto exige releitura e nunca é reenviado.

## 3. Requisições por produtor

Coluna "Chave no reenvio": `sem chave` significa reenvio proibido, só releitura (PLAN §7.2). `vinculado` significa que a UI reaproveita a mesma chave na nova tentativa da mesma intenção.

| Ordem e ação | Alvo e método | Fonte | Campos variáveis e origem | Chave no reenvio | Pré-condição do backend | Espera |
|---|---|---|---|---|---|---|
| 2 SYS04, principal | `rpc criar_organizacao` | `src/lib/organizacao/criarOrganizacaoDados.ts:35-40` | `p_razao_social`, `p_nome_fantasia` e `p_cnpj` `gerado_harness`; `p_timezone` literal | sem chave | Sessão ativa. Cria a organização, o vínculo `administrador` do MASTER, `recursos_organizacao` e, por gatilho, `configuracoes_automacao`. Não semeia regras de conformidade nem regras preventivas (`privado.criar_organizacao`, `privado.criar_configuracao_automacao_padrao`) | não |
| 4 ADM01, principal | `POST functions/v1/admin-invite-user` → `rpc salvar_vinculo_usuario_adm` | `src/components/administracao/usuarios/ContractScopeDialog.tsx:141-199`; `src/lib/administracao/admUsuariosRpc.ts:183-230` | Convite: `id_organizacao` `inventario`; `email` `usuario_sintetico`; `nome` `gerado_harness`; `chave_idempotencia` `gerado_ui`. Vínculo: `p_id_organizacao` `inventario`; `p_id_usuario` `capturado` do convite, igual ao `usuario_sintetico`; `p_email` `usuario_sintetico`; `p_perfil` literal `leitor`; `p_versao_esperada` nulo; `p_chave_idempotencia` `gerado_ui` | `vinculado`: mesma chave enquanto o payload for o mesmo (`src/lib/administracao/intencaoIdempotente.ts`) | Política do `leitor` e matriz RBAC fixadas no BUILD-2a | não |
| 4 ADM01, variante sem convite | só `rpc salvar_vinculo_usuario_adm` | `ContractScopeDialog.tsx:151-169`: com a identidade já obtida para o mesmo e-mail, o convite não sai de novo | como acima; `p_id_usuario` `vinculado` à identidade obtida no 1º envio | `vinculado` | idem | não |
| 5 V102, principal | `POST rest/v1/contratantes?select=id,razao_social,situacao` | `src/lib/contratantes/novoContratanteDados.ts:127-148` | `id_organizacao` `inventario`; demais campos `gerado_harness`. Devolve `id` | sem chave | RLS da Data API | não |
| 6 V103, principal | `rpc atualizar_contratante` | `src/lib/contratantes/editarContratanteDados.ts:94-115` | `p_id_organizacao` e `p_id_contratante` `inventario`; `p_versao_esperada` `derivado`; campos editados `gerado_harness` | sem chave; a versão esperada recusa a 2ª aplicação | versão esperada igual à atual | não |
| 7 V105, principal | `POST rest/v1/contratos` (sem RETURNING) | `src/lib/contratos/novoContratoDados.ts:107-129` | `id_organizacao` e `id_contratante` `inventario`; demais campos `gerado_harness`. O ID só existe por releitura (`derivado`) | sem chave | O gatilho `pos_processar_contrato_criado_v105` só escopa o criador e audita. Não semeia regras | não |
| 8 V106, principal | `rpc atualizar_contrato_v1` | `src/lib/cadastros/cadastroOperacionalDados.ts:195-232`; `src/components/cadastros/GerenciarCadastro.tsx:190-202` | `p_id_organizacao` e `p_id_contrato` `inventario`; `p_versao_esperada` `derivado`; `p_alteracoes` e `p_motivo` `gerado_harness`; `p_request_id` `gerado_ui` | `vinculado`: `enviar(comando)` reaproveita o comando | versão esperada | não |
| 9 V108, pré-requisito 1 | `rpc salvar_proposta_orcamentaria_v108` | `src/components/contratos/OrcamentoContrato.tsx:971-990, 1044-1058` | `p_id_contrato` `inventario`; `p_id_proposta` e `p_versao_esperada` nulos; `p_titulo` `gerado_harness`; chave `gerado_ui` | `vinculado`: mesmos argumentos, mesma chave (`useEnvio`) | nenhuma | não |
| 9 V108, pré-requisito 2 | `UP` (via `enviarArquivo`) → `rpc registrar_versao_proposta_v108` | `OrcamentoContrato.tsx:1130-1147, 1600-1625` | `p_id_proposta` `inventario`; vigência `gerado_harness`; `p_id_arquivo_origem` `capturado` do UP; chave `gerado_ui` | `vinculado` no RPC; UP sem chave | arquivo do mesmo contrato, `pendente` ou `aprovado` | não |
| 9 V108, pré-requisito 3 | `rpc salvar_linha_orcamentaria_v108` | `OrcamentoContrato.tsx:1268-1301` | `p_id_versao_proposta` `inventario`; `p_id_linha` e `p_versao_esperada` nulos; valores `gerado_harness`; chave `gerado_ui` | `vinculado` | versão em rascunho | não |
| 9 V108, principal | `rpc publicar_versao_proposta_v108` | `OrcamentoContrato.tsx:1500-1513` | `p_id_versao` `inventario`; `p_hash_esperado` `derivado`; `p_fundamento` `gerado_harness`; chave `gerado_ui` | `vinculado` | rascunho com vigência, ao menos uma rubrica e documento-base com `status_seguranca = 'aprovado'` (`privado.publicar_versao_proposta_v108`) | **sim, W1** (verificador do documento-base) |
| 10 V107, pré-requisito 1 | `rpc salvar_fonte_normativa_v107` | `src/components/contratos/BaseNormativaContrato.tsx:852-942` | `p_id_organizacao` e `p_id_contrato` `inventario`; `p_id_fonte` e `p_versao_esperada` nulos; textos `gerado_harness`; `p_situacao` literal; `p_chave_idempotencia` `gerado_ui` | `vinculado`: chave do diálogo até `renovar` | nenhuma | não |
| 10 V107, pré-requisito 2 | `rpc registrar_versao_fonte_v107` | `BaseNormativaContrato.tsx:1098-1106` | `p_id_organizacao` e `p_id_fonte` `inventario`; vigência e `p_conteudo_texto` `gerado_harness`; `p_id_arquivo` nulo (origem texto); chave `gerado_ui` | `vinculado` | nenhuma | não |
| 10 V107, pré-requisito 3 | `rpc aprovar_versao_fonte_v107` | `BaseNormativaContrato.tsx:1366-1371` | `p_id_versao` `inventario`; `p_hash_esperado` `derivado`; `p_fundamento` `gerado_harness`; chave `gerado_ui` | `vinculado` | hash igual, vigência e origem texto ou arquivo aprovado | não |
| 10 V107, principal | `rpc definir_aplicabilidade_fonte_v107` | `BaseNormativaContrato.tsx:1465-1472` | `p_id_contrato` e `p_id_versao` `inventario`; `p_aplicavel` literal `true`; `p_atualizado_em_esperado` `derivado` (nulo na 1ª vez); `p_chave_idempotencia` `gerado_ui` | `vinculado` | versão aprovada (`privado.definir_aplicabilidade_fonte_v107`) | não |
| 11 V109, principal | `rpc executar_comando_lista_v1` com `p_acao = criar_lista` | `src/lib/contratos/listaOperacionalDados.ts:276-317`; `src/components/contratos/GerenciarListas.tsx:490-546` | `p_id_contrato` `inventario`; `p_id_lista` e `p_versao_esperada` nulos; `p_payload` (nome, vigência) e `p_motivo` `gerado_harness`; `p_request_id` `gerado_ui`. Devolve `id_versao` | `vinculado`: o comando revisado é o reenviado | nenhuma | não |
| 11 V109, pré-requisito 1 | mesmo RPC, `p_acao = salvar_item` | `GerenciarListas.tsx:517-530` | `p_id_lista` e `p_payload.id_versao` `inventario`; `p_versao_esperada` `derivado`; `p_payload.id_fonte_versao` `inventario` (versão aprovada em V107); `obrigatorio` e `aplicavel` literais `true`; `regra_validacao` literal `{"documento":{"obrigatorio":true}}`; código e descrição `gerado_harness`; `p_request_id` `gerado_ui` | `vinculado` | item material exige fonte aprovada e vigente (`privado.crud_lista_mutar_v1`) | não |
| 11 V109, pré-requisito 2 | mesmo RPC, `p_acao = publicar_versao` | `GerenciarListas.tsx:506-514` | `p_id_lista` e `p_payload.id_versao` `inventario`; `p_versao_esperada` `derivado`; `p_request_id` `gerado_ui` | `vinculado` | vigência e ao menos um item | não |
| 12 V110, principal | `UP` → `rpc criar_documento_contrato_completo` | `src/lib/contratos/documentosDados.ts:755-774`; `src/components/contratos/DocumentosContrato.tsx:976-988` | `p_id_contrato` `inventario`; metadados `gerado_harness`; `p_id_arquivo` `capturado`; `p_chave_idempotencia` `gerado_ui` | `vinculado` (`prog.current[item].chave`); UP retomável | arquivo do contrato, não `quarentena` nem `bloqueado` (`privado.v110_validar_arquivo_contrato`); enfileira o processamento documental | não |
| 13 V111, principal | `UP` → `rpc adicionar_versao_documento_contrato` | `documentosDados.ts:776-791`; `DocumentosContrato.tsx:985` | `p_id_documento` `inventario` (documento de V110); `p_id_arquivo` `capturado`; `p_motivo` `gerado_harness`, obrigatório a partir da 2ª versão; chave `gerado_ui` | `vinculado` | como V110 (`privado.adicionar_versao_documento_contrato_v110`) | não |
| 14 V113, principal | `rpc criar_competencia` | `src/lib/contratos/novaCompetenciaDados.ts:65-75` | `p_id_contrato` `inventario`; `p_competencia_referencia` `gerado_harness` (1º dia do mês corrente) | sem chave | RBAC e 1º dia do mês. O snapshot pega itens de versões publicadas de listas ativas cuja vigência cobre o mês, mais regras de conformidade do contrato e regras preventivas da organização (`privado.criar_competencia`). Na organização F3 só o item de V109 entra: **1 requisito** | não |
| 15 V115, principal | `UP` → `rpc criar_documento_competencia_v115` | `src/lib/competencias/competenciaDocumentosDados.ts:299-317`; `src/components/competencias/CompetenciaDocumentos.tsx:467-471` | `p_id_competencia` `inventario`; `p_id_requisito` `derivado` (requisito do snapshot, lido na UI); `p_id_arquivo` `capturado`; tipo e título `gerado_harness`; chave `gerado_ui`. Devolve `id_versao` (vai ao inventário) | `vinculado` (`tent.current.chave`) | requisito da competência com `regra_validacao.documento.obrigatorio = true` (`privado.v115_requisito_exige_documento`); arquivo não `quarentena` nem `bloqueado`; enfileira o processamento documental (`documents`) e grava `processamentos_documento` `pendente`, sem espera própria (V117 exige só o arquivo `aprovado`, W2) | não |
| 16 V116, principal | `rpc solicitar_analise_competencia` | `src/lib/competencias/competenciaAnaliseDados.ts:188-197` | `p_id_competencia` `inventario`; `p_tipo` literal `completa` | sem chave; o backend devolve a execução pendente existente | situação que permite análise; enfileira a análise (`privado.solicitar_analise_competencia`) | não para o caso de V116 (§10); W3 para V117 |
| 17 V117, principal | `rpc registrar_revisao_requisito_v117` | `src/lib/competencias/revisaoRequisitoDados.ts:112-177`; `src/components/competencias/RevisaoRequisito.tsx:177-210` | `p_id_competencia` `inventario`; `p_id_requisito`, `p_id_execucao_esperada`, `p_id_resultado_esperado` e `p_hash_esperado` `derivado`; `p_resultado` literal `conforme`; justificativa `gerado_harness`; `p_evidencias[0].id_versao_documento` `inventario` (versão de V115); `p_request_id` `gerado_ui` | `vinculado`: o comando preparado é o reenviado | `pode_revisar` exige a última execução `concluida`, do tipo `completa` ou `reanálise`, com hash igual ao atual e sem execução pendente (`privado.contexto_revisao_v117`). A evidência precisa de arquivo `aprovado` | **sim, W3** (análise) e **W2** (verificador do arquivo de V115) |
| 18 V118, pré-requisito 1 | `rpc solicitar_parecer_interno` | `src/lib/competencias/parecerInternoDados.ts:136-146` | `p_id_competencia` `inventario` | sem chave; o job tem chave `parecer:<competência>:<versão>` | portão liberado (`privado.solicitar_parecer_interno`); enfileira o job de IA | **sim, W4** (parecer gerado) |
| 18 V118, principal | `rpc aprovar_parecer_interno` | `parecerInternoDados.ts:150-166` | `p_id_parecer` `derivado` (parecer gerado pelo job, lido na UI); `p_aprovar` literal `true`; `p_fundamento` `gerado_harness` | sem chave | autor diferente do aprovador. O job grava `autor` nulo (`pareceres_internos.autor` sem default; os 5 pareceres do HML têm `autor` nulo), então o MASTER pode aprovar | não |
| 19 V119, pré-requisito 1 | `rpc aprovar_apresentacao` | `src/lib/competencias/apresentacaoDados.ts:56-70` | `p_id_competencia` `inventario`; `p_fundamento` `gerado_harness` | sem chave | portão em 100%, parecer aprovado e última execução `concluida` do tipo `completa` ou `reanálise` com hash igual ao atual (`privado.aprovar_apresentacao`). A V117 grava uma execução `reanálise` `concluida` com o hash vigente e não altera nada que entre no snapshot (`privado.registrar_revisao_v117`, `privado.snapshot_contexto_competencia`). Por isso **não há reanálise adicional** | não |
| 19 V119, principal | `rpc registrar_apresentacao` | `apresentacaoDados.ts:88-104` | `p_id_competencia` `inventario`; `p_idempotency_key` `gerado_ui`; protocolo e forma `gerado_harness` | `vinculado`: chave conservada até reconciliação explícita | situação `pode_apresentar_contratante` | não |
| 20 V122, pré-requisito 1 | `UP` → `rpc criar_documento_contrato_completo` (tipo `outro`, categoria `historico`) | `src/components/contratos/ImportarHistorico.tsx:134-152` | como V110; chave `gerado_ui` (`t.comando`) | `vinculado`; UP retomável | como V110 | não |
| 20 V122, principal | `rpc registrar_relatorio_historico_hml` → `rpc enfileirar_ingestao_historica_hml` | `ImportarHistorico.tsx:180-191`; `src/lib/contratos/ingestaoHistoricoDados.ts:72-90` | Registro: `p_id_arquivo` `inventario`; `p_competencia` `gerado_harness`; `p_tipo` literal. Enfileiramento: `p_id_relatorio` `capturado`; `p_id_versao_documento` `inventario` | sem chave; a UI guarda `t.relatorio` e `t.execucao` e não repete etapa concluída; o registro é idempotente por arquivo | arquivo `aprovado` (`public.registrar_relatorio_historico_hml`); a UI só libera com segurança `aprovado` e processamento `concluido` (`podeFinalizarIngestao`) | **sim, W1** (verificador) e **W5** (processamento documental) |

A ordem 3 (preferência) é local e não envia mutação. As linhas seguem a ordem dos produtores e, dentro de cada produtor, a de execução: pré-requisitos antes da principal, salvo em V109, cuja principal (`criar_lista`) cria a lista que os pré-requisitos completam. O pré-requisito de V122 roda logo depois de V105 (seção 4); os drivers de V110 e V111 não podem depender da contagem de documentos do contrato (M4).

## 4. Esperas assíncronas

O executor espera só por leitura, pela UI do MASTER. O prazo conta a partir do selo da requisição que disparou o processo.

| Espera | O que espera | Disparo | Observável na UI | Prazo | Código se vencer | Código se recusar ou falhar |
|---|---|---|---|---:|---|---|
| W1 | `status_seguranca = 'aprovado'` do documento-base de V108 e do arquivo de V122 | UP3 | estado do arquivo na tela do produtor | 8 min | `F3_WAIT_VERIFICADOR_PRAZO` | `F3_WAIT_VERIFICADOR_RECUSA` (`quarentena` ou `bloqueado`) |
| W2 | idem, para o arquivo de V115 usado como evidência em V117 | UP3 de V115 | evidência selecionável na V117 | 8 min | `F3_WAIT_VERIFICADOR_PRAZO` | `F3_WAIT_VERIFICADOR_RECUSA` |
| W3 | execução de V116 `concluida`, com `pode_revisar` verdadeiro | V116 | V116 e contexto da V117 | 6 min | `F3_WAIT_ANALISE_PRAZO` | `F3_WAIT_ANALISE_FALHA` |
| W4 | parecer gerado pelo job de IA | V118 pré-requisito 1 | lista de pareceres | 6 min | `F3_WAIT_PARECER_PRAZO` | `F3_WAIT_PARECER_FALHA` |
| W5 | processamento documental `concluido` do arquivo de V122 | V122 pré-requisito 1 | estado na importação de histórico | 8 min | `F3_WAIT_PROCESSAMENTO_PRAZO` | `F3_WAIT_PROCESSAMENTO_FALHA` |

**Base dos prazos.** No HML, as 16 análises `completa` concluídas levaram p50 26 s, p95 35 s e no máximo 37 s. Não há série histórica legível do verificador nem do parecer: os eventos de auditoria de arquivo só registram `UploadArquivoConfirmado`, e o parecer não emite evento de criação. Por isso esses prazos são margens fixas, não medidas.

**Caminho crítico.** O pré-requisito de V122 roda logo depois de V105, para que W1 e W5 corram durante os demais produtores. W2 e W3 correm em paralelo depois de V115 e V116. No pior caso, as esperas somam 8 (W1 de V108) + 8 (máximo de W2 e W3) + 6 (W4) = 22 minutos, dentro do prazo de 40 minutos da sessão. O prazo da sessão sempre prevalece: o que ele cortar fica com `F3_SESSION_DEADLINE`.

## 5. Números

- **Pré-requisitos:** 3 (V107) + 3 (V108) + 2 (V109) + 1 (V118) + 1 (V119) + 1 (V122) = **11**. Cada um é uma ação própria, com fluxo próprio no executor.
- **Por execução:** 1 (SYS04) + 1 (ADM01) + 16 produtores + 11 pré-requisitos + até 10 duplicidades = **até 39**.

## 6. Estado do HML lido em 14/11/2026 (base da conferência antes do REQUEST)

- **Crons ativos e sem falha em 24 h:** `contaos-workers-rapidos` (a cada 20 s), `contaos-workers-pesados` e `contaos-worker-historico-v1-22` (a cada minuto), mais `contaos-saude-operacional` (a cada 5 min). Última execução às 16h45 UTC.
- **Itens legados parados, fora da organização F3:** 2 arquivos `pendente` e 2 em `quarentena`, todos de 08/11 e 09/11, e 1 análise `completa` `pendente` desde 08/11. A `jobs_dlq` está vazia.
- **Processamento documental:** 49 registros `concluido`, o último em 09/11.

Um cron que roda sem falha não prova que cada item é processado, e os itens legados mostram isso. A conferência do PLAN (seção 9, passo 4-A, e seção 12.4) usa esta base.

## 7. Riscos de caso registrados (não alteram orçamento nem esperas)

- **C0321 (V111 → V117).** `obter_detalhe_requisito_v117` lista as evidências, o histórico e os apontamentos do requisito. Uma evidência precisa ser versão de documento da competência (`privado.registrar_revisao_v117`), e a versão de documento do contrato criada por V111 não pode ser citada. A fonte lida não mostra caminho para a V111 aparecer no detalhe do requisito. O driver de V117 confere a tela real. Se o vínculo não for visível, vale a seção 4 do PLAN: defeito classificado e PLAN de correção separado, sem adaptar o teste.
- **Situação da competência depois da análise.** `aprovar_apresentacao` aceita `em_analise`, `em_reanalise`, `pendente_correcao` ou `rascunho`. O worker de análise roda fora do SQL lido. Se ele deixar outra situação, V119 fica `BLOCKED` com a mensagem do backend classificada, sem reenvio.

## R5.1 — contrato de vínculo completo e identidade, 15/11/2026

found sóconfirma comtodosbindsduráveis dofluxo; resendnãoapaga historiadotentativaanterior, partialuncertain/rejectedpermanece registrável. Cada derivedrefere exatamente aentityIddo inventorydeclaradoalémorigem/org/tipo/versão. Regrano livro/replay/ledger, nãosó nafence; negativosA/B, positivosA/A,estados/rollback/replay e80F3PASS. Fontes/produtores/orçamento/esperas/obrigações anterioresnãoalterados. RCA/recibos emPR679_R5_RCA_2026-11-15.md; execuçãoHMLF3pendente.
