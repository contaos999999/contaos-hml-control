# PROMPT 36 / V1-15 — Competência: Documentos — PLAN

Base: `77ffd79` (árvore equivalente a `b5fe91f`). `types.ts` deve terminar no blob `8ea7750b75fd9d76b29c36ce7613392e3ab65e19`.

## 1. Backend certificado encontrado (HML, somente leitura)

| RPC | Args | Retorno | anon / authenticated |
|---|---|---|---|
| `obter_documentos_competencia_v115` | `p_id_competencia, p_documentos_offset=0, p_documentos_limite=25, p_requisitos_offset=0, p_requisitos_limite=25` | jsonb | false / true |
| `criar_documento_competencia_v115` | `p_id_competencia, p_tipo, p_titulo, p_categoria, p_id_requisito, p_id_arquivo, p_chave_idempotencia` | jsonb | false / true |
| `adicionar_versao_documento_competencia_v115` | `p_id_documento, p_id_arquivo, p_motivo, p_chave_idempotencia` | jsonb | false / true |
| `confirmar_upload_arquivo` | `p_id_organizacao, p_id_contrato, p_path, p_nome_original, p_mime, p_tamanho, p_sha256, p_origem` | uuid | false / true |

Leitura (`schema_versao='v115-v1'`): `competencia{id,id_contrato,id_organizacao,competencia_referencia,situacao,...}`, `estado_documental ∈ error|processing|missing_docs|complete`, `resumo{documentos_total, requisitos_documentais_total, _aplicaveis, _pendentes}`, `documentos[]` (requisito, versao{numero_versao,hash,motivo_substituicao,metadados_extraidos,id_arquivo}, arquivo{nome_original,mime,tamanho,sha256,status_seguranca}, processamento{status,etapa,erro_codigo,...}), `documentos_paginacao`, `requisitos_documentais[]` (`atendido`, `tipos_esperados`, aplicavel/impeditivo/criticidade), `requisitos_paginacao`, `capacidades{pode_enviar,pode_nova_versao,motivo_nova_versao_obrigatorio}`.
Erros: `PT400` paginação, `PT404` competência inexistente, `42501` sem acesso.
As três RPCs `_v115` **não constam** em `types.ts` (protegido) → adapter local tipado, mesmo padrão `rpcV110` já certificado (cast localizado, sem tocar tipos).

## 2. Arquivos

Criar:
- `src/routes/competencias_.$id_.documentos.tsx` — `createFileRoute("/competencias_/$id_/documentos")` → URL `/competencias/$id/documentos`; `ssr:false`; head PT-BR (title, description, og, twitter).
- `src/components/competencias/CompetenciaDocumentos.tsx` — tela + componentes locais `RequiredDocumentsSummary`, `DocumentTable`, `UploadDropzone`, `ProcessingStatus`, dialog Nova versão.
- `src/lib/competencias/competenciaDocumentosDados.ts` — adapter V1-15 (somente leitura de shape, chamadas, classificação de erro).
- `src/test/competenciaDocumentos.test.tsx`.
- `docs/frontend/lovable/PROMPT-36-V1-15-competencia-documentos.md`.

Alterar (mínimo):
- `src/lib/contratos/documentosDados.ts` — **somente** extrair a orquestração já existente (validar → hash → `storage-sign-upload` → simples/TUS → `confirmar_upload_arquivo`) para uma função exportada `enviarArquivoCertificado(org, contrato, file, config, opcoes)` **se** hoje ela estiver inline em `DocumentosContrato.tsx`; V1-10 passa a chamá-la (comportamento idêntico). Se já existir como função reutilizável, nenhum hunk neste arquivo.
- `src/components/contratos/DocumentosContrato.tsx` — só a troca da sequência inline pela chamada à função extraída (se aplicável).
- `src/components/competencias/CompetenciaVisaoGeral.tsx` — aba "Documentos" vira `<Link to="/competencias/$id/documentos">` após V1-15 GREEN; Análise/Parecer/Apresentação e ações seguem "Em breve".
- `src/test/competenciaVisaoGeral.test.tsx` — hunk mínimo da asserção da aba (Documentos = link; demais staged). Aprovar o PLAN autoriza este hunk (o arquivo de teste não está na lista literal; mesmo padrão aprovado em V1-12).
- `src/routeTree.gen.ts` — automático.

Proibidos: `supabase/**`, `client.ts`, `types.ts`, `components/ui/**`, `styles.css`, `public/brand/**`, package/lock, AGENTS, PROD.

## 3. Adapter `competenciaDocumentosDados.ts`

- `lerDocumentosCompetencia(id, offDocs, offReqs, signal)` → chama RPC com limite `PAGINA_DOCS` (25, importado de V1-10) e valida `schema_versao`; shape inválido → `erro`.
- `criarDocumentoCompetencia({idCompetencia,tipo,titulo,categoria,idRequisito|null,idArquivo,chave})` e `adicionarVersaoCompetencia({idDocumento,idArquivo,motivo|null,chave})` → retorno validado por `lerRetornoDocumento` reutilizado (se o jsonb V1-15 tiver o mesmo contrato; caso contrário, validador local mínimo dos campos retornados).
- `classificarErroV115(e)`: `42501`/401/403 → `sem_permissao`; `PT404` → `nao_encontrado`; `23505` → `duplicada`; `PT409`/40001 → `conflito`; P0001/PT400/outros → `erro` genérico; sempre mensagem fixa PT-BR, nunca texto do Postgres.
- Reutiliza de V1-10 sem redefinir: `PAGINA_DOCS`, `CHUNK_TUS`, `MIMES_POR_EXTENSAO`, `obterConfiguracaoUpload`, `motivoInvalido`, `aceiteDe`, `formatarBytes`, `sha256Hex`, `autorizarUpload`, `enviarSimples`, `enviarTus`, `confirmarUpload`, `baixarDocumento`, `atrasoPolling`, `ROTULO_SEGURANCA`, `ROTULO_PROCESSAMENTO`, `ROTULO_TIPO`, `TIPOS_DOCUMENTO`, `hashCurto`, `MENSAGENS_V110`.

## 4. Fluxo e estados

Gate: UUID inválido → "Competência não encontrada", **zero** `getUser`/preferência/RPC. Válido → `getUser()` → preferência de organização (só contexto de navegação, nunca autorização) → `obter_documentos_competencia_v115`. 403 → tela "Sem permissão" (nunca vazio); PT404 → não encontrada; transporte → erro sanitizado + "Tentar novamente".

- `RequiredDocumentsSummary`: rótulo do `estado_documental` exatamente como veio (missing_docs/processing/complete/error mapeados a texto PT-BR fixo + ícone, não só cor); contadores de `resumo`; lista paginada (25) de `requisitos_documentais` com `atendido` do backend. Nenhum cálculo local.
- `DocumentTable`: paginação server-side 25 (`documentos_paginacao.total`), colunas tipo/título/requisito/versão/arquivo/segurança/processamento/hash curto/atualizado (DD/MM/AAAA HH:mm); campo ausente → "—". Tabela em área rolável no 390.
- `ProcessingStatus`: badge de `processamento.status` + `status_seguranca`, `aria-live="polite"`.
- Polling: somente quando `estado_documental==='processing'`; `atrasoPolling` (5s→60s) de V1-10; para em estado terminal, erro ou unmount (AbortSignal).
- Loading/empty (sem documentos ≠ sem permissão)/saving/sucesso com `role="status"`.

## 5. Upload, criação, idempotência

`capacidades.pode_enviar=false` → Dropzone desabilitado com motivo "Bloqueado pelo backend".
Fluxo: `obterConfiguracaoUpload` → `motivoInvalido` → `sha256Hex` → `storage-sign-upload` → simples ou TUS (se `resumivel`) → `confirmar_upload_arquivo(competencia.id_organizacao, competencia.id_contrato, ...)` → `criar_documento_competencia_v115`.
- Requisito: select só com itens de `requisitos_documentais` retornados (opcional); backend revalida.
- Tipo: se o requisito selecionado tiver `tipos_esperados` não vazio, o seletor de tipo oferece **exatamente** esses valores do backend (fonte autoritativa), com rótulo amigável via `ROTULO_TIPO` quando existir e fallback para o próprio valor retornado — sem catálogo local inventado. Se `tipos_esperados` vier vazio (ou sem requisito), reutiliza `TIPOS_DOCUMENTO` do V1-10. Trocar o requisito reinicia o tipo. Teste dedicado: tipos do backend exibidos literalmente (incluindo valor sem rótulo conhecido) e fallback ao catálogo genérico quando vazio.
- Chave idempotente `crypto.randomUUID()` gerada ao iniciar a tentativa lógica e mantida em ref até sucesso ou troca de arquivo/metadados; retry manual reutiliza a mesma chave; botão bloqueado enquanto pendente; sem retry automático.
- Nenhum byte por RPC; bucket privado; nunca `getPublicUrl`.

## 6. Nova versão e Abrir

- Nova versão: dialog com mesma pipeline; motivo exigido na UI somente se `capacidades.motivo_nova_versao_obrigatorio=true` (senão opcional, enviado `null` se vazio); chave idempotente estável; histórico não é sobrescrito (backend cria nova versão).
- Abrir: `baixarDocumento(versao.id_arquivo)` (storage-sign-download, só URL https). `status_seguranca ∈ quarentena|bloqueado` → botão desabilitado com motivo. Não reaproveita rota V1-11 (documento de contrato ≠ documento de competência); nenhuma tela nova.

## 7. TDD (RED antes de produção)

Mocks de supabase como nas suítes V1-10/V1-14. Casos:
1. UUID inválido: zero getUser/preferência/rpc/functions.
2. Ordem do gate; 42501 → sem permissão (não vazio); PT404; transporte → erro sanitizado sem texto bruto.
3. RPC chamada com offsets e limites 25; paginação de documentos e requisitos altera só o offset correspondente.
4. Summary para cada um dos 4 estados vindos do backend; fixture incoerente (ex.: `missing_docs` com 0 pendentes) mostra o estado do backend.
5. Capacidades false → Enviar/Nova versão bloqueados.
6. Reuso: `vi.spyOn` no módulo `documentosDados` prova que `autorizarUpload`/`enviarTus`/`confirmarUpload`/`sha256Hex`/`baixarDocumento` são chamados; teste estático: o arquivo V1-15 não contém `tus`/`storage-sign-upload`/`MIMES_` próprios.
7. Upload → confirmar (org/contrato da competência) → criar V1-15 com chave; retry após erro reutiliza a mesma chave; duplo clique = 1 chamada.
8. Nova versão: motivo obrigatório só quando a capacidade manda; chave estável.
9. Download assinado; quarentena/bloqueado desabilita.
10. Polling só em `processing`, backoff, para em terminal/unmount.
11. V1-14: Documentos é link; demais "Em breve".
Regressão: V1-14/V1-13/V1-12/V1-11/V1-10 + suíte serial completa (`--maxWorkers=1`).

## 8. Validação e Zero-Drift

Lint dos alterados; scan estático (sem secrets, `service_role`, `getPublicUrl`); Security Scan; browser 1440/1280/768/390 × claro/escuro sem overflow horizontal, foco visível, labels, alvo 44px, ContaOSMarca/tokens existentes. `tsc`/build manual: gate externo se o ambiente bloquear. Restaurar `types.ts` ao blob baseline se regenerado. Teste C separado read-only.

## 9. Riscos

- Shape de retorno das RPCs de escrita V1-15 não inspecionado em detalhe: validar no BUILD por leitura do `pg_proc`; se divergir de `lerRetornoDocumento`, validador local mínimo.
- Se a orquestração de upload V1-10 estiver inline no componente, o refactor de extração toca V1-10; mitigado por regressão V1-10 integral.

PLAN: APROVÁVEL
