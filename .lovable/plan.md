# PROMPT 31 / V1-10 — Central de Documentos do Contrato — PLAN

Base: HEAD `b70e631` (working tree com drift de plataforma conhecido em `types.ts`). HML somente. Nenhum backend alterado.

## 0. Estado verificado no HML (leitura neste turno)

- `documentos_contrato`: id, id_organizacao, id_contrato, tipo, titulo, categoria, situacao (`ativo|inativo|substituido`), versao_atual, versao_registro, criado_em, atualizado_em.
- `versoes_documento`: id, id_documento_contrato, numero_versao, id_arquivo, hash, motivo_substituicao, metadados_extraidos (jsonb), enviado_por, criado_em.
- `arquivos`: bucket, path, nome_original, mime, tamanho, sha256, status_seguranca (`pendente|aprovado|quarentena|bloqueado`), origem, criado_por, criado_em.
- `processamentos_documento`: id_versao_documento, etapa, status (`pendente|processando|concluido|falhou|cancelado`), tentativas, erro_codigo, erro_detalhe, resultado, iniciado_em, concluido_em.
- `configuracao_upload`: limiar resumível 104.857.600 B (100 MB), máximo 524.288.000 B (500 MB), 11 MIMEs permitidos.
- RPCs: `criar_documento_contrato(p_id_contrato,p_tipo,p_titulo,p_categoria,p_id_arquivo,p_chave_idempotencia) -> jsonb`; `adicionar_versao_documento_contrato(p_id_documento,p_id_arquivo,p_motivo,p_chave_idempotencia) -> jsonb`; `confirmar_upload_arquivo(... p_origem default 'upload_usuario') -> uuid`.
- `storage.objects`: só existe policy SELECT (`contaos_storage_select`) que nega quarentena/bloqueado. Não há policy INSERT para authenticated — upload só via token assinado do Edge (correto).
- `types.ts` ainda não contém as duas RPCs novas.
- Navs: "Documentos" aparece como "Em breve" em VisaoGeral, BaseNormativa, Orcamento e Regras.

## 1. Matriz requisito → implementação → teste

| Requisito | Implementação | Teste (documentosContrato.test.tsx) |
|---|---|---|
| V1-CON-001/002 (acesso/escopo contrato) | Gate idêntico V1-07/08/09: getUser→/login; org→/selecionar-organizacao; `obterContrato`+classificador; 403/404 bloqueiam sem nenhuma query de documentos | T-gate-1..4 (sem sessão, sem org, 403, 404; `from` nunca chamado) |
| V1-CON-004 (documentos do contrato) | DocumentTable + FilterBar + Pagination server-side | T-lista, T-filtro, T-pag |
| V1-CON-005 (histórico/versões) | VersionDrawer com versões imutáveis, hash, origem, usuário, data, motivo | T-versoes |
| V1-DOC-001 (upload) | UploadDropzone + UploadProgress, presign→Storage→confirmar→criar | T-up-pequeno, T-up-resumivel, T-mime, T-tamanho |
| V1-DOC-002 (versionamento) | MetadataForm "Nova versão" com motivo obrigatório → `adicionar_versao_documento_contrato` | T-versao, T-versao-replay, T-motivo-vazio |
| V1-DOC-003 (segurança/quarentena) | ProcessingStatus mostra status_seguranca; DownloadAction desabilitada em quarentena/bloqueado/pendente; texto "não liberado para análise" | T-quarentena, T-bloqueado, T-pendente-sem-IA |
| V1-DOC-004 (processamento assíncrono) | ProcessingStatus por versão atual; refetch com backoff | T-proc-estados, T-backoff |
| V1-DOC-005 (metadados extraídos) | Bloco "Metadados extraídos" renderizando chaves de `metadados_extraidos`/`resultado` sem inferência; vazio = "Nenhum metadado extraído ainda" | T-metadados, T-metadados-vazio |
| NFR-003/004 (segurança, sem segredo) | Só anon client + JWT; Edges oficiais; nunca exibir path/token/signed_url | T-sem-path-token; scan estático |
| NFR-005 (desempenho) | Página 25, count exact, colunas explícitas, sem dataset inteiro | T-range(0,24) |
| NFR-007/008/009 (a11y, responsivo, PT-BR) | labels, aria-live, progressbar, Dialog/Sheet Radix, datas BR | T-a11y; browser 4 larguras |
| NFR-010 (auditoria/idempotência) | chave idempotente por intenção; auditoria fica no RPC | T-replay-criacao, T-retry |
| BRAND-01 | Header com `ContaOSMarca`, tokens existentes | T-marca |
| Zero-Drift | diff restrito, types.ts somente sincronizado | gate diff |

## 2. Arquivos

Criar:
- `src/routes/contratos_.$id_.documentos.tsx` — rota `ssr:false`, head PT-BR, valida UUID, renderiza componente.
- `src/components/contratos/DocumentosContrato.tsx` — gate, layout, nav, DocumentTable, FilterBar, Pagination, UploadDropzone/UploadProgress, ProcessingStatus, VersionDrawer (Sheet), DownloadAction, MetadataForm (Dialog).
- `src/lib/contratos/documentosDados.ts` — consultas, adaptadores estritos, upload pequeno/resumível, RPCs, download, classificação de erros, backoff.
- `src/test/documentosContrato.test.tsx` — RED/GREEN.
- `docs/frontend/lovable/PROMPT-31-V1-10-documentos.md` — prompt, plano, decisões, testes, evidências, lacunas.

Modificar (mínimo):
- `src/integrations/supabase/types.ts` — SINCRONIZAR com schema HML gerado (só acrescenta as 2 RPCs + eventual drift oficial); nenhuma edição manual inventada; cliente/URL/env intocados.
- `VisaoGeralContrato.tsx`, `BaseNormativaContrato.tsx`, `OrcamentoContrato.tsx`, `RegrasContrato.tsx` — "Documentos" vira link real (retira só esse "Em breve"; "Competências" segue futuro).
- Testes antigos (`contratoDetalhe`, `baseNormativa`, `orcamento`, `regrasContrato`) somente se assertarem "Documentos — Em breve"; alteração limitada a essa asserção, justificada no doc.

Proibidos: `supabase/**` (migrations, functions, config), `client.ts`, `package.json`/lockfile, `src/styles.css`, `src/components/ui/**`, `public/brand/**`, `ContaOSMarca.tsx`, `AGENTS.md`, `routeTree.gen.ts` (auto), outras rotas/telas.

## 3. Interfaces e contratos

```text
listarDocumentos({contrato, busca, tipo, situacao, statusSeguranca, pagina}, signal) -> Pagina<DocumentoLinha>
  from documentos_contrato select colunas explícitas .eq(id_contrato) [.ilike(titulo, %busca% escapado)] [.eq(tipo)] [.eq(situacao)]
  order atualizado_em desc, id desc; range(p*25, p*25+24); count exact
obterVersaoAtual(ids[]) -> versoes_documento .in(id_documento_contrato) para versao_atual da página (1 query)
  + arquivos .in(id) (status_seguranca, nome, mime, tamanho, sha256) + processamentos_documento .in(id_versao_documento)
listarVersoes(idDocumento, pagina) -> versoes_documento order numero_versao desc, id desc; range 25 + arquivos/processamentos
enviarArquivo(org, contrato, file, {onProgresso, signal}) -> idArquivo
criarDocumento({contrato, tipo, titulo, categoria, idArquivo}, chave) -> {idDocumento, idVersao}
adicionarVersao({idDocumento, idArquivo, motivo}, chave) -> {idDocumento, idVersao}
baixarArquivo(idArquivo) -> abre signed_url https (já existente; reexportado ou reutilizado)
validarArquivoLocal(file, cfg) -> erro PT-BR | null  (cfg lido de configuracao_upload via SELECT RLS; o Edge segue autoridade)
classificarErro(e) -> negado(42501/401/403) | nao_encontrado(P0002/PT404) | conflito(PT409) | validacao(22023/23514/PT400) | resumivel | rede | erro
```

Filtro `statusSeguranca` é aplicado via join embutido do PostgREST somente se a FK `versoes_documento→arquivos` permitir `!inner`; caso contrário o filtro fica fora (registrado no doc) — sem filtrar no cliente.

Adaptador do jsonb das RPCs: exige `id_documento`/`id_versao` (ou nomes reais confirmados no BUILD pelo tipo gerado + leitura `pg_get_functiondef` read-only); formato diferente = erro, nunca palpite.

## 4. Upload, confirmação, criação/versão, download

```text
validarArquivoLocal -> storage-sign-upload {id_organizacao,id_contrato,nome_arquivo,mime,tamanho}
  usar_upload_resumivel=false: storage.from(bucket).uploadToSignedUrl(path,token,file)  (XHR? não: SDK; progresso indeterminado + etapas)
  usar_upload_resumivel=true : TUS direto ao Storage, endpoint {SUPABASE_URL}/storage/v1/upload/resumable/sign,
        header x-signature: token, apikey publishable; chunks 6 MB; PATCH com Upload-Offset;
        retomada por HEAD na mesma URL; progresso real por bytes; AbortSignal cancela.
        Implementado com fetch nativo em documentosDados.ts (sem nova dependência, sem proxy).
-> sha256 (Web Crypto; arquivos grandes lidos em fatias via digest incremental indisponível => digest único após leitura;
   limite 500 MB documentado)  -> confirmar_upload_arquivo -> idArquivo
-> criar_documento_contrato | adicionar_versao_documento_contrato com chave idempotente
```

- Chave idempotente: reutiliza `criarGerenciadorChave` do padrão V1-08 (mesma chave em retry técnico; nova após sucesso; `concluir()` explícito). Retry após falha na RPC reusa o mesmo `idArquivo` já confirmado (não reenvia bytes) e a mesma chave → backend devolve o mesmo documento.
- Falha no upload de bytes: botão "Tentar novamente" refaz presign (pequeno) ou retoma offset (TUS).
- Motivo da nova versão: obrigatório (trim ≥ 1), também validado pelo backend.
- Download: só `storage-sign-download`; botão desabilitado se status_seguranca ≠ `aprovado`, com texto; se o Edge negar, mensagem PT-BR. Nunca URL pública.
- Documento com status `pendente/quarentena/bloqueado` exibe "Aguardando verificação de segurança — não será enviado para análise"; a tela não dispara IA em nenhum caso.

## 5. Paginação, filtros, processamento

- Busca com debounce 400 ms, filtros na URL (search params validados), reset para página 1; tudo no servidor.
- Processamento: `refetchInterval` só enquanto houver status `pendente/processando` ou segurança `pendente` na página; backoff 5→10→20→40→60 s (teto), para ao concluir, ao ocultar a aba e ao sair; botão "Atualizar" manual.

## 6. Estados, a11y, responsividade

- Estados: carregando (skeleton), vazio (com CTA enviar), enviando (progressbar com `aria-valuenow`), processando, infectado/quarentena/bloqueado/erro, sucesso (toast + `aria-live`), 403, 404, conflito PT409 (bloqueia e pede recarregar), validação, retry.
- Status por texto+ícone+borda, nunca só cor; tooltips nos status de segurança, processamento e hash.
- Dropzone acessível: `<input type=file>` com label, ativável por teclado; Dialog/Sheet Radix com foco preso e Esc devolvendo foco; H1 único.
- 1440/1280/768: tabela; 390: cartões ou scroll horizontal contido, sem overflow de página.
- BRAND-01: `ContaOSMarca` no header, tokens existentes, sem cor hardcoded.

## 7. TDD e verificação

1. Sincronizar `types.ts` com schema HML (gerado) e provar diff = só entradas oficiais.
2. RED: criar teste → falha por módulos inexistentes.
3. GREEN: dados → componente → rota → navs.
4. Comandos: `bunx vitest run src/test/documentosContrato.test.tsx`; `bunx vitest run`; `npx tsc --noEmit`; build em cópia temporária; `bunx eslint` global (baseline 8.962, 0 novos) e por arquivo novo = 0; scan rg (service_role, secret, `as any`, `.insert(`/`.update(`/`.delete(`/`.upsert(` em tabelas de documento, `functions/v1` além das 2 Edges); Security Scan; Playwright 1440/1280/768/390 com fixture; `git diff --stat` restrito à lista.
5. Teste C em turno separado, read-only, árvore imutável.

## 8. Riscos e lacunas

- R1 — Upload resumível assinado: Storage HML não tem INSERT policy para authenticated, então TUS só funciona pelo endpoint `/upload/resumable/sign` com `x-signature`. Primeira etapa do BUILD faz uma prova read-safe (arquivo de teste não é gerado; só verificação de OPTIONS/HEAD do endpoint). Se o HML recusar, declaro `LACUNA DE BACKEND` e paro só esse caminho, mantendo o bloqueio PT-BR atual do V1-07 — sem proxy nem policy nova.
- R2 — Sem sessão real (`external_unmanaged`): RLS e RPC reais serão validados só por fixture; limitação registrada.
- R3 — Hash SHA-256 de arquivos até 500 MB carrega o arquivo em memória no navegador; aceitável no limite configurado, documentado.
- R4 — Formato exato do jsonb das RPCs confirmado no BUILD por leitura somente; formato inesperado = erro, sem palpite.
- R5 — Filtro por status de segurança depende de join embutido; se não suportado, filtro omitido e registrado (nunca filtrar no cliente).

PLAN: APROVÁVEL — V1-10 100% COBERTO
