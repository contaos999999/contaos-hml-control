# PROMPT 28 / FE V1-07 — Contrato — Base normativa (plano canônico V107)

Substitui integralmente o plano readonly anterior. Base funcional: 9c26e97e. Backend: migration `20261102215515_v107_base_normativa_autorizada.sql` (main 06d65093). Issues: frontend #24, backend #25. HML gklhhhyosgasnyoxlrui; PROD intocado. **BUILD só após confirmação externa de restore verde.**

## 1. Rastreabilidade (sem cobertura fictícia)
| Ref | Parcela nesta tela | Fora desta tela |
|---|---|---|
| PROMPT 28 / FE V1-07 | rota, leitura, gestão por RPC | — |
| V1-CON-001 (001) documentos-base | cadastrar/editar fonte, registrar versão por texto/arquivo aprovado | cadastro de documentos de competência |
| V1-CON-002 (002) vigência | inicio/fim por versão, exibição e registro | regra temporal aplicada a competências (V1-08+) |
| V1-CON-004 (004) extração assistida | nenhuma | depende V1-08/09/10; sem OCR/IA/filas |
| V1-CON-005 (005) documento/página/trecho | exibir `id_arquivo`/metadados oficiais quando presentes; ausência declarada | página/trecho estruturado não existe no contrato desta tela |
| NFR-005 | PT-BR, DD/MM/AAAA, America/Sao_Paulo, status literal | — |
| NFR-007 / NFR-008 | conflito 409 (CAS), idempotência, auditoria/correlation_id do backend | — |
| NFR-009 | paginação server-side 25 | — |

## 2. Gate e autorização
Sessão `getUser` (ausente → /login; erro → retry sem signOut) → preferência de organização (ausente → /selecionar-organizacao) → `uuidValido`/`uuidCanonico` (inválido não consulta) → `obterContrato(id, signal)` reutilizado sem alteração (classificador `classificar_acesso_contrato_v106` só após zero linhas; nunca em erro) → 403/404/consistência/erro. Só então carga normativa, usando `contrato.id_organizacao` do backend. Sem gate de perfil local; RLS/RPC são autoridade.

## 3. Leituras (Data API, SELECT)
```text
Q-F fontes_normativas
  select id,id_organizacao,id_contrato,tipo,titulo,referencia,descricao,situacao,versao_registro,criado_em,atualizado_em  {count:'exact'}
  .eq(id_organizacao, org)
  escopo: contrato → .eq(id_contrato,id) | global → .is(id_contrato,null) | ambos → .or(`id_contrato.eq.${id},id_contrato.is.null`) (id UUID canônico validado)
  situacao opcional .eq(situacao, s)
  .order(titulo).order(id).range(p*25, p*25+24).abortSignal
Q-V versoes_fontes_normativas (só ao abrir fonte)
  select id,id_fonte,versao,inicio_vigencia,fim_vigencia,id_arquivo,hash,aprovado_por,aprovado_em,criado_em {count:'exact'}
  .eq(id_fonte, f).order(versao,desc).order(id).range(25)
Q-A aplicabilidades_fonte (1 por página de versões; sem N+1)
  select id,id_fonte_versao,aplicavel,fundamento,aprovado_por,aprovado_em,atualizado_em
  .eq(id_contrato,id).in(id_fonte_versao, idsDaPagina)
Q-T versoes_fontes_normativas select conteudo_texto,metadados .eq(id, v).maybeSingle()   (só ao expandir UMA versão; exibição limitada a 5.000 caracteres com aviso)
Q-Arq arquivos select id,nome_original,mime,tamanho,status_seguranca,criado_em
  .eq(id_organizacao,org) + (fonte do contrato: .eq(id_contrato,id) | fonte global: .is(id_contrato,null)).order(criado_em,desc).order(id).range(25)  (só no diálogo de versão por arquivo; sem path na UI)
  ou .eq(id, idArquivo).maybeSingle() para acompanhar status
```
Sem `!inner`, sem prefetch, sem filtro local como autorização. Query keys: `['bn-fontes',uid,org,contrato,escopo,situacao,pagina]`, `['bn-versoes',uid,org,contrato,fonte,pagina]`, `['bn-aplic',uid,org,contrato,ids]`, `['bn-texto',uid,org,versao]`, `['bn-arquivos',uid,org,contrato,pagina]`; sem placeholderData; remount por key e AbortSignal (anti-stale A→B).

Rótulos oficiais: "Aprovada em …" só com `aprovado_em`; vigência nunca implica aprovação; aplicabilidade "Aplicável/Não aplicável" só com registro aprovado; global sem registro aprovado = "Sem aplicabilidade aprovada para este contrato". Texto: "Texto registrado (não constitui aprovação normativa)". Escopo visível: badge "Do contrato" / "Global da organização".

## 4. Mutações (somente RPCs V107; nenhum DML direto)
| Ação | RPC | Campos enviados | Nunca enviar |
|---|---|---|---|
| Nova fonte | `salvar_fonte_normativa_v107` | org, contrato (ou null p/ global), fonte=null, tipo, titulo, referencia, descricao, situacao='rascunho', versao_esperada=null, chave | aprovado_*, hash |
| Editar metadados | idem | fonte, campos, versao_esperada=versao_registro lida, chave | — |
| Alterar situação | idem | situacao nova + versao_esperada; aviso "ativação exige versão aprovada; requer administrador" | — |
| Nova versão | `registrar_versao_fonte_v107` | org, fonte, inicio, fim?, id_arquivo? (só status `aprovado`), conteudo_texto?, metadados `{}`, chave | versao, hash |
| Aprovar versão | `aprovar_versao_fonte_v107` | org, versao, hash_esperado (o exibido), fundamento obrigatório, chave | ator/data |
| Aplicabilidade | `definir_aplicabilidade_fonte_v107` | org, contrato, versao, aplicavel, fundamento, atualizado_em_esperado (lido ou null), chave | aprovado_* |

- Aprovação: diálogo de revisão mostra hash, origem (texto/arquivo), vigência e exige fundamento + confirmação explícita.
- Idempotência: `crypto.randomUUID()` por intenção ao abrir diálogo; estável em retry; renovada após sucesso, cancelamento ou alteração material de campo.
- Respostas: sucesso → toast/aria-live com `correlation_id`, invalidação das keys afetadas, foco devolvido ao gatilho. PT409 → "Registro alterado por outra pessoa" + botão Recarregar e revisar (sem reenvio automático). PT400 → validação sanitizada. PT404 → registro obsoleto, recarregar. 42501/403 → "Você não tem permissão para esta ação". Rede/outros → erro técnico + retry com mesma chave. Nunca code/hint/stack.
- Perfis explicados em texto de ajuda (fonte/versão: administrador, gestor_contrato, juridico_conformidade; aprovação/aplicabilidade: administrador, direcao_aprovador; situação: administrador; Master reconhecido no backend). Botões ficam disponíveis a todos os leitores; o backend nega. Nenhum gate local.

## 5. Arquivo (reuso Edge existente)
- Upload: `storage-sign-upload` → se a resposta trouxer `usar_upload_resumivel=true`, PARAR e exibir "Upload retomável não está disponível nesta tela." (nunca tentar upload simples acima do limiar). Caso contrário `supabase.storage.uploadToSignedUrl(path, token, arquivo)` com path/token retornados pelo Edge → `confirmar_upload_arquivo(p_id_organizacao, p_id_contrato, p_path, p_nome_original, p_mime, p_tamanho, p_sha256 (SubtleCrypto), p_origem='upload_usuario')` → uuid. `p_id_contrato` = id do contrato para fonte do contrato e `null` para fonte global (nullable; path por organização). Path nunca exibido na UI. Arquivo exibido "Em análise de segurança"; não selecionável até `status_seguranca='aprovado'`; rejeitado exibido literal. Botão "Atualizar status" (Q-Arq por id), sem polling contínuo. Mesmo escopo arquivo×fonte permanece validado por `registrar_versao_fonte_v107`.
- Download: somente clique explícito → `storage-sign-download({id_arquivo})` → abre URL assinada retornada; nunca URL arbitrária.
- **Limitação parada:** upload retomável não implementado nesta tela (interrompido por `usar_upload_resumivel=true`).
- Contrato exato de request/response dos Edges será lido do backend/documentação na abertura do BUILD (sem alterar); se divergir do exposto, parar esse subcaminho.

## 6. Tipagem
Tabelas via `Database['public']['Tables'][T]['Row']` (Pick). As 4 RPCs V107 **não estão** em `types.ts` (verificado) e o arquivo gerado não será editado: adaptador único em `baseNormativaDados.ts` com tipos explícitos de Args/Returns dos 4 nomes, uma única fronteira de chamada tipada (precedente ADM01), sem `any`/`never` nem casts fora dela; marcado `LACUNA DE TIPOS` até regeneração.

## 7. Componentes e estados (dentro de BaseNormativaContrato.tsx)
Cabeçalho leve do contrato + navegação canônica; filtros; lista paginada; drawer de detalhe (versões, aplicabilidade, expandir texto); diálogos: Fonte (criar/editar/situação), Nova versão (texto | arquivo aprovado | upload), Aprovar versão, Aplicabilidade. Estados: verificando sessão, carregando contrato, 403, 404, inconsistência, erro+retry, lista vazia, versões vazias, upload pendente/processando/rejeitado/aprovado, salvando, 409, 400, permissão, sucesso. H1 único "Base normativa"; Esc fecha e devolve foco; aria-live; alvos ≥44px; status com texto; larguras 1440/1280/768/390.

## 8. Navegação
V1-06: "Base normativa" vira `<Link to="/contratos/$id/base-normativa">` (única mudança + teste). V1-07: "Visão geral" link, "Base normativa" `aria-current`, demais "Em breve".

## 9. Arquivos exatos
- novo `src/routes/contratos_.$id.base-normativa.tsx` (ssr:false, title "Base normativa — ContaOS", robots noindex)
- novo `src/components/contratos/BaseNormativaContrato.tsx`
- novo `src/lib/contratos/baseNormativaDados.ts`
- novo `src/test/baseNormativa.test.tsx`
- alterar `src/components/contratos/VisaoGeralContrato.tsx` (só link) e `src/test/contratoDetalhe.test.tsx` (só teste do link)
- `src/routeTree.gen.ts` (gerado), `.lovable/plan.md`
Nenhum auxiliar extra previsto; se o componente exceder legibilidade, proposta prévia: `src/components/contratos/BaseNormativaDialogos.tsx` (apenas após autorização).

## 10. TDD
RED (módulo ausente + link V1-06) → GREEN mínimo. Casos: gate sessão/org/UUID; obterContrato 403/404/classificador só zero linhas; Q-F colunas/filtros/ordem/range/página 2/global×contrato; lazy Q-V/Q-A única/Q-T sob demanda e truncada; abort/stale A→B; cada RPC com payload exato, sem aprovado_*/hash local; chave estável em retry e renovada; 400/403/404/409 sanitizados e reload; aprovação com hash_esperado e fundamento obrigatório; CAS aplicabilidade; global não aplicável sem registro; arquivo pendente não anexável; download só por id; correlation_id; navegação; a11y foco/Esc; scan sem `.insert/.update/.upsert/.delete` em tabelas normativas, sem service_role; `usar_upload_resumivel=true` interrompe sem upload; ordem exata de args de `confirmar_upload_arquivo` e `p_id_contrato=null` para fonte global. Depois focused, suíte, `npx tsc --noEmit` (exit real), build, browser 4 larguras.

## 11. Teste C (separado, read-only, 18 gates)
1 HEAD/status; 2 Zero-Drift; 3 tipagem/adaptador; 4 rota/head; 5 sessão/org/UUID; 6 obterContrato/classificador; 7 Q-F paginação/filtros/escopo; 8 versões/vigência/aprovação literal; 9 aplicabilidade/global; 10 lazy sem N+1/texto limitado; 11 RPC fonte criar/editar/situação; 12 RPC versão/arquivo pendente/aprovado; 13 aprovação hash/fundamento; 14 aplicabilidade CAS; 15 idempotência/409/400/403/404 sanitizados; 16 stale/abort/navegação; 17 a11y + 4 larguras; 18 testes/typecheck/build + HEAD final. Security Scan separado (0 Critical novo). Qualquer FAIL para sem auto-fix.

## 12. Riscos reais restantes
- RPCs V107 ausentes em types.ts (adaptador temporário tipado).
- Upload retomável parado (`usar_upload_resumivel=true` interrompe com mensagem).
- Sem endpoint de capacidade: ações aparecem a todos e o backend nega.
