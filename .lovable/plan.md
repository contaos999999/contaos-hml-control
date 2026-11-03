# PROMPT 31 / V1-10 — Central de Documentos do Contrato — PLAN (revisado)

Base: HEAD `b70e631` (working tree com drift de plataforma conhecido em `types.ts`). HML somente. Nenhum backend alterado.

## 0. Estado verificado no HML (leitura)

- `documentos_contrato`: id, id_organizacao, id_contrato, tipo, titulo, categoria, situacao (`ativo|inativo|substituido`), versao_atual, versao_registro, criado_em, atualizado_em.
- `versoes_documento`: id, id_documento_contrato, numero_versao, id_arquivo, hash, motivo_substituicao, metadados_extraidos (jsonb), enviado_por, criado_em.
- `arquivos`: bucket, path, nome_original, mime, tamanho, sha256, status_seguranca (`pendente|aprovado|quarentena|bloqueado`), origem, criado_por, criado_em.
- `processamentos_documento`: id_versao_documento, etapa, status (`pendente|processando|concluido|falhou|cancelado`), tentativas, erro_codigo, erro_detalhe, resultado, iniciado_em, concluido_em.
- `configuracao_upload`: limiar resumível 104.857.600 B (100 MB), máximo 524.288.000 B (500 MB), 11 MIMEs permitidos, extensões permitidas.
- RPCs: `criar_documento_contrato(p_id_contrato,p_tipo,p_titulo,p_categoria,p_id_arquivo,p_chave_idempotencia) -> jsonb`; `adicionar_versao_documento_contrato(p_id_documento,p_id_arquivo,p_motivo,p_chave_idempotencia) -> jsonb`; `confirmar_upload_arquivo(p_id_organizacao,p_id_contrato,p_path,p_nome_original,p_mime,p_tamanho,p_sha256,p_origem) -> uuid`.
- `storage.objects`: apenas policy SELECT (`contaos_storage_select`), que nega quarentena/bloqueado. Sem INSERT para authenticated — upload somente por token assinado do Edge.
- `sugestoes_extracao_documento` (RLS SELECT): id_versao_documento, tipo (`classificacao|clausula|obrigacao|prazo|documento_exigido|restricao|metadado|regra_candidata`), categoria_sugerida, id_requisito_sugerido, conteudo, pagina, trecho_fonte, confianca (0–1), status (`pendente|aprovada|rejeitada|substituida`), revisado_por, revisado_em, metadados.
- `paginas_documento` (RLS SELECT): id_versao_documento, numero_pagina, texto_extraido, hash_texto. `fragmentos_documento` (RLS SELECT): pagina_inicio, pagina_fim, indice_fragmento, texto.
- RPC `revisar_sugestao_extracao(p_id_sugestao, p_aprovar, p_conteudo_revisado?, p_categoria_revisada?, p_id_requisito_revisado?) -> jsonb` (já presente em `types.ts`).
- `types.ts` ainda não contém as duas RPCs novas de documento. `tus-js-client` não está instalado.
- Navs: "Documentos" aparece como "Em breve" em VisaoGeral, BaseNormativa, Orcamento e Regras.

## 1. Matriz requisito → implementação → teste

Definições conforme PRD Mestre 4.1 (pacote oficial `ContaOS_4_1_BRAND_FINAL`, lido neste turno). Os arquivos `08A_REQUISITOS_001_024_4_1.md` e `11_RNF_PERFORMANCE_CONCORRENCIA_RESILIENCIA_4_1.md` do repositório `contaos9999/develop` não puderam ser abertos daqui (repositório privado); o texto do PRD Mestre foi usado e deve coincidir com eles.

Acesso ao contrato (gate) é premissa transversal da tela, não requisito V1-CON: getUser→/login; org→/selecionar-organizacao; `obterContrato`+classificador; 403/404 bloqueiam sem nenhuma consulta de documentos (T-gate sem sessão, sem org, 403, 404; `from` nunca chamado).

| Requisito (texto canônico resumido) | Implementação | Teste (documentosContrato.test.tsx) |
|---|---|---|
| V1-CON-001 — Cadastro de documentos-base (contrato, proposta, aditivos, legislação, portarias, decretos, resoluções, manuais, listas, instruções…) com categoria, vigência, versão e observações | MetadataForm com tipo (lista dos tipos de documento-base), título, categoria; versão gerida pelo backend (`versao_atual`). **Vigência e observações: LACUNA DE BACKEND** — `documentos_contrato` não tem colunas de vigência/observações e `criar_documento_contrato` não recebe esses parâmetros (verificado) | T-cadastro-tipo-categoria, T-versao-exibida; vigência/observações bloqueadas pela lacuna |
| V1-CON-002 — Vigência temporal: cada regra extraída deve ter início e, quando aplicável, fim de vigência | Exibir início/fim da vigência de cada sugestão extraída. **LACUNA DE BACKEND** — `sugestoes_extracao_documento` não tem colunas de vigência (só `regras_preventivas`, já exibida em V1-09); usar `metadados` jsonb seria inventar contrato | bloqueado pela lacuna |
| V1-CON-004 — Extração assistida: IA sugere cláusulas, obrigações, prazos, documentos exigidos e restrições | Painel "Extração assistida (IA)" por versão: `sugestoes_extracao_documento` paginada (25), filtro por tipo (`clausula`, `obrigacao`, `prazo`, `documento_exigido`, `restricao`), conteúdo, confiança (%), status; rótulo "Sugestão de IA — requer decisão humana", separado de dado objetivo e decisão humana. Aprovar/Rejeitar/Aprovar com ajuste somente via `revisar_sugestao_extracao`; revisado_por/revisado_em exibidos. Indisponível se status_seguranca ≠ aprovado | T-ia-lista, T-ia-filtro-tipo, T-ia-rotulo, T-ia-aprovar-rpc, T-ia-rejeitar, T-ia-ajuste, T-ia-bloqueada-quarentena, T-ia-dupla-submissao, T-ia-409 |
| V1-CON-005 — Fonte obrigatória: toda regra automática mantém vínculo com documento, página e trecho | Cada sugestão mostra documento + versão + página + `trecho_fonte`; "Ver na página" abre `paginas_documento` daquela página (lazy) com trecho destacado. Sem página ou sem trecho: aprovação desabilitada, motivo "Sem fonte vinculada" (backend continua autoridade) | T-fonte-vinculo, T-fonte-pagina-lazy, T-fonte-ausente-bloqueia |
| V1-DOC-001 — Anexação múltipla: PDF, XLSX, CSV, DOCX, imagens e formatos configurados, limites de tamanho e validação de segurança | UploadDropzone `multiple`; fila por arquivo; pré-validação PT-BR por MIME/extensão/tamanho de `configuracao_upload` (Edge é autoridade); status_seguranca visível; pendente/quarentena/bloqueado sem download e sem IA | T-multiplo (3 arquivos, 1 rejeitado, 2 enviados), T-mime, T-extensao, T-tamanho, T-quarentena, T-bloqueado, T-pendente |
| V1-DOC-002 — Classificação automática: sugerir categoria e item da lista de verificação pelo conteúdo e nome | Sugestões `tipo='classificacao'`: `categoria_sugerida` e `id_requisito_sugerido` (item da lista, nome resolvido por leitura RLS), confiança e fonte, rotuladas "Classificação automática (IA)", separadas do que o usuário informou; ausente = "Classificação pendente"; aceitação só via `revisar_sugestao_extracao` (com `p_categoria_revisada`/`p_id_requisito_revisado` no ajuste) | T-classificacao, T-classificacao-item-lista, T-classificacao-pendente, T-separacao-humano-ia |
| V1-DOC-003 — Versionamento: nova versão não apaga a anterior e exige motivo quando a competência já estiver em análise | "Nova versão" → `adicionar_versao_documento_contrato`; motivo sempre solicitado na tela (backend decide a obrigatoriedade e a tela exibe a recusa); VersionDrawer lista todas as versões somente leitura | T-versao, T-motivo-recusado-backend, T-historico-preservado |
| V1-DOC-004 — Metadados extraídos: CNPJ, CPF, fornecedor, nº do documento, datas, valores, competência, banco, agência, conta e outros por tipo | Bloco "Metadados extraídos" com rótulos PT-BR para as chaves conhecidas (CNPJ/CPF formatados, datas DD/MM/AAAA, valores R$, competência MM/AAAA) e chaves extras exibidas como vieram; fonte: `versoes_documento.metadados_extraidos` + sugestões `tipo='metadado'` com página/trecho; nada inventado; vazio = "Nenhum metadado extraído ainda" | T-metadados-formatacao, T-metadados-extra, T-metadados-vazio |
| V1-DOC-005 — Integridade: resumo criptográfico, data, usuário, origem e versão (cadeia de evidência) | SHA-256 no navegador enviado ao `confirmar_upload_arquivo`; drawer mostra por versão hash, origem, enviado_por, data/hora BR, motivo e número | T-hash-enviado, T-cadeia |
| NFR-003 — Transferência direta cliente-Storage com autorização temporária | Upload por token assinado do Edge; download por signed_url temporária; nunca proxy | T-sem-proxy, T-download-edge; scan |
| NFR-004 — Multipart: upload fracionado, retry e retomada | TUS oficial em blocos de 6 MB quando `usar_upload_resumivel=true`, retry e retomada por offset (seção 4) | T-resumivel-6mb, T-retry, T-retomada-offset |
| NFR-005 — Assincronicidade: OCR, IA, embeddings e relatórios não ocupam a requisição web | Tela apenas cria o job via RPC e acompanha status; refetch com backoff, sem polling agressivo | T-proc-estados, T-backoff, T-sem-espera-sincrona |
| NFR-007 — Concorrência: ações críticas com transação/lock; edições comuns com controle otimista | Lock dentro das RPCs; PT409/obsoleto → bloqueia submissão e pede "Recarregar" (padrão V1-08); botões desabilitados durante envio | T-conflito-409, T-dupla-submissao |
| NFR-008 — Idempotência: comandos repetíveis sem efeito duplicado | Chave por intenção (retry técnico = mesma chave; nova após sucesso); retry de RPC reusa id_arquivo confirmado | T-replay-criacao, T-replay-versao, T-retry-upload |
| NFR-009 — Paginação: grandes coleções sem volume ilimitado | 25 por página em documentos, versões e sugestões; `range`, `count exact`, filtros no servidor | T-range(0,24), T-pagina-2, T-filtro-servidor |
| NFR-010 — Observabilidade: métricas de API, banco, Queues, Edge, Cron e Storage em produção | Requisito de plataforma/backend; a tela contribui apenas com erros classificados (código, etapa, chave de idempotência, sem path/token/URL). Métricas de produção: N/A nesta tela e PROD proibido nesta fase | T-erro-detalhado-sem-segredo |
| BRAND-01 / a11y / responsivo | `ContaOSMarca`, tokens existentes, Radix, 4 larguras | T-marca, T-a11y; Playwright |
| Zero-Drift | diff restrito; types.ts somente sincronizado | gate diff |

## 2. Arquivos

Criar:
- `src/routes/contratos_.$id_.documentos.tsx` — rota `ssr:false`, head PT-BR, valida UUID, renderiza componente.
- `src/components/contratos/DocumentosContrato.tsx` — gate, layout, nav, DocumentTable, FilterBar, Pagination, UploadDropzone/UploadProgress, ProcessingStatus, VersionDrawer (Sheet), DownloadAction, MetadataForm (Dialog).
- `src/lib/contratos/documentosDados.ts` — consultas, adaptadores estritos, upload pequeno e TUS, RPCs, download, classificação de erros, backoff.
- `src/test/documentosContrato.test.tsx` — RED/GREEN.
- `docs/frontend/lovable/PROMPT-31-V1-10-documentos.md` — prompt, plano, decisões, testes, evidências, lacunas.

Modificar (mínimo):
- `src/integrations/supabase/types.ts` — SINCRONIZAR com schema HML gerado (as 2 RPCs + drift oficial); nenhuma edição manual; cliente/URL/env intocados.
- `VisaoGeralContrato.tsx`, `BaseNormativaContrato.tsx`, `OrcamentoContrato.tsx`, `RegrasContrato.tsx` — "Documentos" vira link real (retira só esse "Em breve"; "Competências" segue futuro).
- Testes antigos (`contratoDetalhe`, `baseNormativa`, `orcamento`, `regrasContrato`) somente se assertarem "Documentos — Em breve"; alteração limitada a essa asserção, justificada no doc.

Proibidos: `supabase/**`, `client.ts`, `package.json`/lockfile, `src/styles.css`, `src/components/ui/**`, `public/brand/**`, `ContaOSMarca.tsx`, `AGENTS.md`, `routeTree.gen.ts` (auto), outras rotas/telas.

## 3. Interfaces e contratos

```text
listarDocumentos({contrato, busca, tipo, categoria, situacao, pagina}, signal) -> Pagina<DocumentoLinha>
  documentos_contrato, colunas explícitas, .eq(id_contrato) [.ilike(titulo, %busca% escapado)] [.eq(tipo)] [.eq(categoria)] [.eq(situacao)]
  order atualizado_em desc, id desc; range(p*25, p*25+24); count exact
complementarPagina(ids) -> versoes_documento (versão atual) + arquivos + processamentos_documento via .in(), 1 query cada
listarVersoes(idDocumento, pagina) -> versoes_documento order numero_versao desc, id desc; range 25 + arquivos/processamentos
enviarArquivo(org, contrato, file, {onProgresso, signal}) -> idArquivo
criarDocumento({contrato, tipo, titulo, categoria, idArquivo}, chave) -> {idDocumento, idVersao}
adicionarVersao({idDocumento, idArquivo, motivo}, chave) -> {idDocumento, idVersao}
baixarArquivo(idArquivo) -> storage-sign-download, abre signed_url https
validarArquivoLocal(file, cfg) -> erro PT-BR | null
classificarErro(e) -> negado | nao_encontrado | conflito | validacao | resumivel_indisponivel | rede | erro
```

- Filtro por status de segurança: aplicado no servidor via join embutido `!inner` se a FK permitir; caso contrário omitido e registrado — nunca filtrar no cliente.
- Adaptador do jsonb das RPCs: nomes de campos confirmados pelo tipo gerado e leitura read-only da função no BUILD; formato inesperado = erro, sem palpite.

## 4. Upload, confirmação, criação/versão, download

```text
para cada arquivo da fila:
validarArquivoLocal -> storage-sign-upload {id_organizacao,id_contrato,nome_arquivo,mime,tamanho}
  -> {bucket, path, token, signed_url, usar_upload_resumivel}
  false: supabase.storage.from(bucket).uploadToSignedUrl(path, token, file)
  true : TUS oficial do Supabase Storage, sem proxy:
         endpoint https://gklhhhyosgasnyoxlrui.storage.supabase.co/storage/v1/upload/resumable (hostname direto)
         POST de criação: Tus-Resumable 1.0.0, Upload-Length, Upload-Metadata (bucketName, objectName=path, contentType),
           x-signature: token assinado do Edge, apikey publishable; nunca service_role
         PATCH em blocos de exatamente 6 MB com Upload-Offset; HEAD para retomar; progresso por bytes; AbortSignal
-> sha256 (Web Crypto) -> confirmar_upload_arquivo -> idArquivo
-> criar_documento_contrato | adicionar_versao_documento_contrato com chave idempotente
```

- Biblioteca: `tus-js-client` não está instalado e `@supabase/supabase-js` não expõe TUS. Para não alterar package/lock, o cliente TUS mínimo (core 1.0: POST/PATCH/HEAD) é implementado com `fetch` nativo em `documentosDados.ts`. Nenhum pacote novo.
- Chave idempotente: padrão `criarGerenciadorChave` do V1-08 (mesma chave em retry técnico; nova após sucesso; `concluir()` explícito). Retry após falha na RPC reusa o mesmo `idArquivo` e a mesma chave → backend devolve o mesmo documento/versão.
- Falha no envio de bytes: "Tentar novamente" refaz presign (pequeno) ou retoma offset via HEAD (TUS).
- Motivo da nova versão: obrigatório na tela e validado pelo backend.
- Download: só `storage-sign-download`; botão desabilitado se status_seguranca ≠ `aprovado`, com texto explicativo; negação do Edge → mensagem PT-BR. Nunca URL pública.
- Documento pendente/quarentena/bloqueado: "Aguardando verificação de segurança — não será enviado para análise". A tela não dispara IA em nenhum caso.

## 5. Paginação, filtros, processamento

- Busca com debounce 400 ms; filtros na URL (search params validados); reset para página 1; tudo no servidor.
- Processamento: `refetchInterval` só enquanto houver `pendente/processando` ou segurança `pendente` na página; backoff 5→10→20→40→60 s (teto); para ao concluir, com aba oculta e ao sair; botão "Atualizar" manual.

## 6. Estados, a11y, responsividade

- Estados: carregando (skeleton), vazio (com ação enviar), enviando (progressbar `aria-valuenow`), processando, infectado/quarentena/bloqueado/erro, sucesso (toast + `aria-live`), 403, 404, conflito PT409, validação, retry.
- Status por texto+ícone+borda, nunca só cor; tooltips em segurança, processamento, classificação e hash (hover+foco; toque no mobile).
- Dropzone acessível: `<input type=file multiple>` com label, ativável por teclado; Dialog/Sheet Radix com foco preso e Esc devolvendo foco; H1 único.
- 1440/1280/768: tabela; 390: cartões ou scroll horizontal contido, sem overflow de página.
- BRAND-01: `ContaOSMarca` no header, tokens existentes, sem cor hardcoded.

## 7. TDD e verificação

1. Sincronizar `types.ts` com o schema HML gerado; provar diff = só entradas oficiais.
2. RED: criar teste → falha por módulos inexistentes.
3. GREEN: dados → componente → rota → navs.
4. Comandos: `bunx vitest run src/test/documentosContrato.test.tsx`; `bunx vitest run`; `npx tsc --noEmit`; build em cópia temporária; eslint global (baseline 8.962, 0 novos) e 0 por arquivo novo; scan rg (service_role, secret, `as any`, `.insert(`/`.update(`/`.delete(`/`.upsert(` nas tabelas de documento, Edges além das 2 oficiais); Security Scan; Playwright 1440/1280/768/390 com fixture; `git diff --stat` restrito.
5. Teste C em turno separado, read-only, árvore imutável.

## 8. Riscos e lacunas

- R1 — TUS assinado: sem INSERT policy para authenticated, o TUS depende da autorização `x-signature` do token do Edge. Sem sessão real, a prova ponta a ponta fica LIMITADA; se o HML recusar, LACUNA e parada só desse caminho, sem proxy nem policy nova.
- R2 — Sem sessão real (`external_unmanaged`): RLS e RPCs reais validados só por fixture; limitação registrada.
- R3 — SHA-256 de até 500 MB carrega o arquivo em memória no navegador; dentro do limite configurado, documentado.
- R4 — Formato do jsonb das RPCs confirmado por leitura no BUILD; formato inesperado = erro.
- R5 — Filtro por status de segurança depende de join embutido; se não suportado, omitido e registrado.
- R6 — Classificação automática e metadados dependem do worker preencher `sugestoes_extracao_documento`/`metadados_extraidos`; a tela só exibe.

## 9. Lacunas de backend que impedem 100%

- L1 — V1-CON-001: faltam vigência (início/fim) e observações do documento-base em `documentos_contrato` e nos parâmetros de `criar_documento_contrato` / `adicionar_versao_documento_contrato`.
- L2 — V1-CON-002: faltam início/fim de vigência por regra extraída em `sugestoes_extracao_documento` (e no retorno/ajuste de `revisar_sugestao_extracao`).

Sem essas colunas/parâmetros, a tela teria de inventar campos ou gravar fora do contrato do backend — proibido. Caminho para destravar (fora deste PLAN, exige autorização específica de backend): migration HML acrescentando os campos + parâmetros opcionais nas RPCs, com teste transacional; depois disso este PLAN fica completo sem outra mudança de frontend além de exibir/enviar esses campos (já previstos no MetadataForm e no painel de extração).

Todo o restante (V1-CON-004/005, V1-DOC-001..005, NFR-003/004/005/007/008/009/010, BRAND-01, TDD, Teste C, Zero-Drift) está coberto pelo backend atual.

PLAN: NÃO APROVÁVEL — LACUNAS DE BACKEND L1 (V1-CON-001 vigência/observações) e L2 (V1-CON-002 vigência das regras extraídas)
