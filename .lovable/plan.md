# PROMPT 31 / V1-10 — Central de Documentos do Contrato — PLAN canônico

Base funcional: `e10f7973260df0c455bb66baa091e5c9b3124efe` (V1-09 certificado). Drift conhecido no main: só `.lovable/plan.md` e `types.ts` (+137, plataforma). HML somente; PROD intocado; nenhum backend alterado.

## 1. Inventário backend HML (lido neste turno)

Tabelas (RLS SELECT authenticated; nenhuma escrita direta):
- `documentos_contrato`: id, id_organizacao, id_contrato, tipo, titulo, categoria, situacao (`ativo|inativo|substituido`), versao_atual, versao_registro, vigencia_inicio, vigencia_fim, observacoes, criado_em, atualizado_em. CHECK: fim exige início e fim ≥ início.
- `versoes_documento`: id, id_documento_contrato, numero_versao, id_arquivo, hash, motivo_substituicao, metadados_extraidos, enviado_por, criado_em.
- `arquivos`: id, nome_original, mime, tamanho, sha256, status_seguranca (`pendente|aprovado|quarentena|bloqueado`), origem, criado_por, criado_em (bucket/path nunca exibidos).
- `processamentos_documento`: id_versao_documento, etapa, status (`pendente|processando|concluido|falhou|cancelado`), tentativas, erro_codigo, iniciado_em, concluido_em.
- `sugestoes_extracao_documento`: id_versao_documento, tipo (`classificacao|clausula|obrigacao|prazo|documento_exigido|restricao|metadado|regra_candidata`), categoria_sugerida, id_requisito_sugerido, conteudo, pagina, trecho_fonte, confianca (0–1), status (`pendente|aprovada|rejeitada|substituida`), vigencia_inicio, vigencia_fim, revisado_por, revisado_em, metadados.
- `paginas_documento`: id_versao_documento, numero_pagina, texto_extraido, hash_texto.
- `itens_lista` (somente para resolver nome do item sugerido em V1-DOC-002, leitura por id).
- `configuracao_upload`: limiar resumível 100 MB, máximo 500 MB, MIMEs/extensões permitidos (pré-validação UX; Edge é autoridade).

RPCs (todas SECURITY INVOKER, execute só authenticated — verificado):
- `confirmar_upload_arquivo(p_id_organizacao,p_id_contrato,p_path,p_nome_original,p_mime,p_tamanho,p_sha256,p_origem) -> uuid`
- `criar_documento_contrato_completo(p_id_contrato,p_tipo,p_titulo,p_categoria,p_vigencia_inicio,p_vigencia_fim,p_observacoes,p_id_arquivo,p_chave_idempotencia) -> jsonb` — caminho usado para criar documento-base (substitui o uso de `criar_documento_contrato`, que não recebe vigência/observações e NÃO será chamado).
- `adicionar_versao_documento_contrato(p_id_documento,p_id_arquivo,p_motivo,p_chave_idempotencia) -> jsonb`
- `definir_vigencia_sugestao_extracao(p_id_sugestao,p_vigencia_inicio,p_vigencia_fim) -> jsonb`
- `revisar_sugestao_extracao(p_id_sugestao,p_aprovar,p_conteudo_revisado?,p_categoria_revisada?,p_id_requisito_revisado?) -> jsonb`

Edges: `storage-sign-upload` (JWT; devolve bucket/path/token/signed_url/usar_upload_resumivel) e `storage-sign-download` (JWT; signed_url temporária; Storage nega quarentena/bloqueado). `storage.objects` só tem policy SELECT; não há INSERT para authenticated (upload só por token assinado).

Formato do jsonb de retorno das RPCs: wrappers delegam a funções privadas; as chaves serão lidas no BUILD por inspeção read-only (`pg_get_functiondef` das privadas) antes do código, e o adaptador exige-as estritamente (formato diferente = erro, sem palpite).

## 2. Matriz requisito → UI → backend → teste

| Requisito | Comportamento UI | Backend real | Teste |
|---|---|---|---|
| V1-CON-001 documentos-base com categoria, vigência, versão, observações | MetadataForm: tipo (contrato, proposta, aditivo, legislação, portaria, decreto, resolução, manual, lista de verificação, instrução, outro), título, categoria, vigência início/fim (DD/MM/AAAA), observações; lista mostra versão atual, vigência e observações | `criar_documento_contrato_completo`; leitura `documentos_contrato` | T-criar-completo (args exatos), T-vigencia-fim-sem-inicio (UX bloqueia + PT400 backend exibido), T-fim-antes-inicio, T-lista-colunas |
| V1-CON-002 regra extraída com início e fim de vigência | V1-10: indicador por documento "N sugestões sem vigência" (contagem server-side `head:true`), somente leitura. Definir vigência e revisar ficam em V1-11 | colunas vigencia_* de `sugestoes_extracao_documento` | T-indicador-sem-vigencia; edição testada em V1-11 |
| V1-CON-004 IA sugere cláusulas, obrigações, prazos, documentos exigidos, restrições | V1-10: indicador "N sugestões de IA pendentes de revisão humana" (contagem server-side por documento, rótulo IA); sem lista nem decisão. Painel completo e revisão em V1-11 | `sugestoes_extracao_documento` (status=pendente) | T-indicador-ia-pendente, T-ia-sem-acao-na-central |
| V1-CON-005 vínculo documento/página/trecho | V1-10 não cria nem aprova regra; nenhuma ação de regra nesta tela. Exibição de página/trecho e bloqueio sem fonte ficam em V1-11; garantia material no backend (trigger em `regras_conformidade`) | colunas pagina/trecho_fonte; trigger | T-sem-acao-de-regra (nenhuma chamada a `revisar_sugestao_extracao`/`definir_vigencia_sugestao_extracao`) |
| V1-DOC-001 anexação múltipla, formatos, limites, segurança | Dropzone `multiple`; fila com progresso por arquivo; rejeição PT-BR por MIME/extensão/tamanho; Storage privado por signed upload; status de segurança visível | Edge upload + `confirmar_upload_arquivo`; `configuracao_upload` | T-multiplo, T-mime, T-extensao, T-tamanho, T-edge-recusa |
| V1-DOC-002 classificação automática (categoria e item) | V1-10: coluna "Classificação (IA)" com a categoria sugerida de maior confiança e % (rótulo IA, separada da categoria informada), ou "Classificação pendente"; aceitar/ajustar fica em V1-11 | `sugestoes_extracao_documento` tipo=classificacao | T-classificacao-coluna, T-classificacao-pendente, T-separacao-humano-ia |
| V1-DOC-003 versionamento sem apagar anterior; motivo quando exigido | V1-10: ação "Nova versão" por linha (upload + motivo) → RPC; recusa do backend por motivo exibida em PT-BR; coluna versão atual. Histórico completo das versões fica em V1-11 | `adicionar_versao_documento_contrato` | T-versao, T-motivo-recusado, T-replay-versao |
| V1-DOC-004 metadados extraídos por tipo | V1-10: indicador "Metadados extraídos: disponíveis / pendentes" da versão atual; exibição completa formatada em V1-11 | `versoes_documento.metadados_extraidos` (só presença) | T-indicador-metadados |
| V1-DOC-005 hash, data, usuário, origem, versão | V1-10: SHA-256 calculado no navegador e enviado na confirmação; linha mostra hash abreviado (tooltip completo), data/hora BR e nº da versão atual. Cadeia completa por versão em V1-11 | `confirmar_upload_arquivo`; `arquivos`/`versoes_documento` | T-hash-enviado, T-hash-linha |
| NFR-003 transferência direta | Bytes direto navegador→Storage; download por signed_url sob clique | Edges | T-sem-proxy, T-download-edge |
| NFR-004 multipart/retry/retomada | TUS oficial em blocos de 6 MB quando `usar_upload_resumivel=true` | Storage TUS + token Edge | T-resumivel-6mb, T-retomada-offset, T-retry |
| NFR-005 assincronicidade | Tela só cria job via RPC e acompanha status com backoff | `processamentos_documento` | T-proc-estados, T-backoff |
| NFR-007 concorrência | PT409/stale → bloqueia, "Recarregar" invalida intenção (padrão V1-08) | locks nas RPCs | T-conflito-409 |
| NFR-008 idempotência | Chave por intenção; retry técnico mesma chave; nova após sucesso; retry reusa id_arquivo | p_chave_idempotencia | T-replay-criacao, T-retry-upload, T-double-click |
| NFR-009 paginação | 25 por página em documentos, versões, sugestões; `range`+`count exact`; filtros no servidor | PostgREST | T-range(0,24), T-pagina-2, T-filtro-servidor |
| NFR-010 observabilidade | Erros classificados (código, etapa, chave) em "Detalhes técnicos", sem path/token/URL; métricas de produção são da plataforma (PROD fora da fase) | auditoria nas RPCs | T-erro-sem-segredo |
| BRAND-01 | `ContaOSMarca`, tokens existentes, dark mode herdado | — | T-marca; Playwright claro/escuro |
| Zero-Drift | diff restrito; `types.ts` = e10f797 | — | gate diff |

## 3. Fluxo V1-10

```text
gate: getUser -> /login | org -> /selecionar-organizacao | obterContrato+classificador -> 403/404 sem outra consulta
lista: documentos_contrato .eq(id_contrato) [ilike titulo][eq tipo][eq categoria][eq situacao]
       order atualizado_em desc, id desc; range 25; count exact
       + versão atual / arquivo / processamento via .in() (1 query cada)
upload (por arquivo da fila):
  validar UX -> storage-sign-upload
    false: storage.from(bucket).uploadToSignedUrl(path, token, file)
    true : TUS 1.0 via fetch (sem pacote novo) em
           https://gklhhhyosgasnyoxlrui.storage.supabase.co/storage/v1/upload/resumable
           headers: Tus-Resumable, Upload-Length, Upload-Metadata(bucketName, objectName=path, contentType),
                    x-signature=<token do Edge>, apikey publishable; PATCH 6 MB; HEAD retoma
  -> sha256 -> confirmar_upload_arquivo -> id_arquivo
  -> novo: criar_documento_contrato_completo | nova versão: adicionar_versao_documento_contrato
processamento: refetch só com pendente/processando; backoff 5,10,20,40,60 s; pausa com aba oculta
indicadores por linha (contagens server-side, head:true, só ids da página): sugestões IA pendentes,
  sugestões sem vigência, classificação de maior confiança, presença de metadados
detalhe: "Abrir detalhe" = item V1-11 marcado "Em breve" (sem rota nova, sem drawer)
download: botão só se status_seguranca=aprovado -> storage-sign-download -> abre https signed_url
```

Se o Storage HML recusar `x-signature` no TUS, declaro LACUNA, paro só esse caminho e mantenho bloqueio PT-BR — sem proxy, sem policy nova.

## 4. Estados UI

loading (skeleton), empty (com ação enviar), error + retry, denied/403, not found/404, uploading (progressbar com `aria-valuenow`), processing, quarantine/blocked ("Bloqueado pela verificação de segurança — download e análise indisponíveis"; metadados visíveis), success (toast + `aria-live`), conflict/stale (PT409, recarga segura), validação PT-BR. Status por texto+ícone+borda; tooltips em segurança, processamento, confiança, hash, vigência (hover+foco; toque no mobile).

## 5. V1-10 × V1-11 × V1-12

- V1-10 Central de documentos: lista/filtros/paginação, upload múltiplo, criação de documento-base completo, nova versão, status de segurança e processamento, indicadores somente leitura de IA/vigência/classificação/metadados, download.
- V1-11 Detalhe/versões de documento (NÃO implementado aqui): histórico de versões, cadeia de evidência completa, metadados formatados, painel de extração com página/trecho, definir vigência, revisão humana. Na V1-10 aparece só "Abrir detalhe — Em breve" desabilitado com tooltip; quando V1-11 existir, vira link.
- V1-12 Competências: segue "Em breve" no nav, intocado.
- V1-10 não chama `definir_vigencia_sugestao_extracao` nem `revisar_sugestao_extracao`; ficam inventariadas para V1-11.

## 6. Arquivos

Criar:
- `src/routes/contratos_.$id_.documentos.tsx` — rota `ssr:false`, head PT-BR, UUID.
- `src/components/contratos/DocumentosContrato.tsx` — gate, layout, DocumentTable (com indicadores), FilterBar, Pagination, UploadDropzone/UploadProgress, ProcessingStatus, DownloadAction, MetadataForm (novo documento / nova versão). Sem VersionDrawer nem painel de extração (V1-11).
- `src/lib/contratos/documentosDados.ts` — consultas, adaptadores, upload/TUS, RPCs tipadas localmente, erros, backoff.
- `src/test/documentosContrato.test.tsx`.
- `docs/frontend/lovable/PROMPT-31-V1-10-documentos.md`.

Alterar (só o link "Documentos", retirando o "Em breve" correspondente): `VisaoGeralContrato.tsx`, `BaseNormativaContrato.tsx`, `OrcamentoContrato.tsx`, `RegrasContrato.tsx`. Testes antigos apenas se assertarem "Documentos — Em breve", alteração restrita à asserção e justificada no doc.

## 7. Proibidos

`src/integrations/supabase/types.ts` (resultado final = e10f797), `client.ts`, `supabase/**`, migrations, RLS, grants, Auth, Edges, secrets, `package.json`/lock, `src/styles.css`, `src/components/ui/**`, `public/brand/**`, `ContaOSMarca.tsx`, `AGENTS.md`, `routeTree.gen.ts` (auto), qualquer outra rota/tela, `criar_documento_contrato` (substituída pela completa), escrita direta em tabelas, cálculo de portão no React.

## 8. Tipos sem tocar `types.ts`

`documentosDados.ts` declara interfaces locais de argumentos/retorno das RPCs novas e um único helper `rpcDocumentos(nome, args)` com cast mínimo `as unknown as` concentrado em um ponto (padrão já usado em V1-09), documentado; leituras usam `.select` com colunas explícitas e adaptadores que validam campos (sem `as any`).

## 9. Drift

BUILD passo 0: `git show e10f797:src/integrations/supabase/types.ts > src/integrations/supabase/types.ts`. Final: `git diff e10f797 -- src/integrations/supabase/types.ts` = 0 bytes (repetido antes de reportar SHA).

## 10. TDD e verificação

1. RED: teste novo importando módulos inexistentes → falha registrada.
2. GREEN mínimo: dados → componente → rota → navs.
3. Negativos obrigatórios: sem sessão, sem organização, 403, 404, tenant (lista só com `id_contrato` do gate; nenhuma consulta sem ele), MIME/tamanho inseguro, quarentena/bloqueado, download negado pelo Edge, RPC inválida (PT400/42501), idempotência/double click, vigência do documento ausente/inválida (fim sem início, fim < início), conflito/stale, e garantia de que a Central não oferece ação sobre sugestão sem página/trecho ou sem vigência (nenhuma ação de regra na V1-10; validação de fonte/vigência das sugestões testada em V1-11).
4. Comandos: `bunx vitest run src/test/documentosContrato.test.tsx`; `bunx vitest run`; `npx tsc --noEmit`; build em cópia temporária; eslint global (baseline 8.962, 0 novos) e 0 por arquivo novo; scan rg (service_role, secret, `as any`, `.insert/.update/.delete/.upsert(`, Edges não oficiais, bucket público); Security Scan; Playwright 1440/1280/768/390 claro e escuro com fixture; `git diff --stat e10f797` restrito à lista.
5. Teste C em turno separado, read-only, árvore imutável.

## 11. Riscos

- R1 TUS assinado depende de `x-signature` aceito pelo Storage HML; sem sessão real a prova fica LIMITADA.
- R2 Sem sessão real (`external_unmanaged`): RLS/RPC reais só por fixture; registrado.
- R3 SHA-256 de até 500 MB em memória no navegador; dentro do limite configurado.
- R4 Chaves do jsonb das RPCs confirmadas por leitura no BUILD.
- R5 Filtro por status de segurança só se join `!inner` funcionar; senão omitido e registrado (nunca no cliente).

Todos os requisitos têm contrato backend existente e verificado.

PLAN: APROVÁVEL
