# PROMPT 32 / V1-11 — Detalhe e versões de documento — PLAN

Baseline funcional: `e2551e5` (V1-10 certificado). `types.ts` deve ficar byte a byte igual a `e10f797`. HML `gklhhhyosgasnyoxlrui`, só consumo. PROD intocado. V1-12 fora do escopo.

## 1. Fatos do backend confirmados agora (somente leitura)

- RLS SELECT `privado.usuario_tem_acesso_contrato(id_contrato)` em `versoes_documento`, `processamentos_documento`, `paginas_documento`, `fragmentos_documento` e `sugestoes_extracao_documento`. O papel `authenticated` tem SELECT nessas tabelas e também em `arquivos` e `requisitos_competencia`.
- `definir_vigencia_sugestao_extracao(p_id_sugestao uuid, p_vigencia_inicio date, p_vigencia_fim date) → jsonb`. Wrapper SQL invoker → `privado..._v111` SECURITY DEFINER com `FOR UPDATE`.
  - Códigos: PT404 (não encontrada), 42501 (sem acesso ou perfil), PT409 (já revisada), PT400 (início ausente, ou fim antes do início).
  - Retorno: `{status: 'atualizada'|'sem_alteracao', vigencia_inicio, vigencia_fim}`.
  - EXECUTE: authenticated sim, anon não.
- `revisar_sugestao_extracao(p_id_sugestao uuid, p_aprovar boolean, p_conteudo_revisado text, p_categoria_revisada text, p_id_requisito_revisado uuid) → jsonb`. Wrapper → `privado.revisar_sugestao_extracao` com `FOR UPDATE`.
  - Retorno: `{status: 'rejeitada'|'aprovada', id_regra_rascunho?, mensagem}`.
  - Material: insere em `regras_conformidade` com `situacao='rascunho'` e `efeito_portao=false`. Metadado: mescla `metadados->'campos'` na versão. Classificação: grava a categoria no documento.
  - EXECUTE: authenticated sim, anon não.
- **Divergência registrada (não é lacuna):** as exceções de `revisar_sugestao_extracao` não definem `errcode` (vêm como P0001), apesar de o enunciado citar PT404/42501/PT409. Mitigação na interface:
  - qualquer erro de revisão faz refetch da sugestão antes de liberar uma nova tentativa;
  - a mensagem exibida sai de uma lista fixa em PT-BR, comparando o texto do backend com as quatro frases conhecidas e caindo numa mensagem genérica;
  - texto bruto nunca é exibido.
- `fragmentos_documento.embedding` é legível, mas nunca será selecionado: colunas sempre explícitas.

## 2. Matriz requisito → dado/RPC → componente → teste

| Requisito | Dado / RPC | Componente | Teste (`documentoDetalhe.test.tsx`) |
|---|---|---|---|
| Gate V1-11 | UUIDs → `getUser` → preferência → `obterContrato` → `documentos_contrato` `.eq(id).eq(id_contrato)` | Rota + `DocumentoDetalhe` | sem sessão, sem organização, UUID inválido, 403 contrato, documento de outro contrato = 404 sem consultas de detalhe |
| V1-DOC-001 / NFR-003 | `arquivos.status_seguranca` + Edge `storage-sign-download({id_arquivo})` | Painel Versão → Baixar | aprovado abre URL https; pendente, quarentena e bloqueado desabilitam com texto; nada de bucket/path no DOM |
| V1-DOC-002 | sugestões `tipo='classificacao'` + `requisitos_competencia` `.in('id')` | Sugestões | categoria + "Item sugerido: código — descrição" + confiança em %; não resolvido = "indisponível" |
| V1-DOC-003 | `versoes_documento` paginado, `numero_versao DESC, id DESC`, `motivo_substituicao` | Histórico de versões | página 20, atual marcada "Versão atual", motivo visível, selecionar não chama RPC |
| V1-DOC-004 | `versoes_documento.metadados_extraidos` | Metadados | renderização chave/valor como texto, rótulos PT-BR para chaves conhecidas, objetos aninhados recursivos, ausente = "Sem metadados extraídos" |
| V1-DOC-005 | `hash`, `criado_em`, `enviado_por`, `arquivos.{sha256,origem,nome,mime,tamanho,criado_por}` | Cadeia de evidência | "Você" quando igual a `auth.uid()`, caso contrário UUID abreviado + tooltip; `hash≠sha256` → alerta "Inconsistência entre hash da versão e do arquivo", sem afirmar causa |
| V1-CON-002 | `vigencia_inicio/fim` + `definir_vigencia_sugestao_extracao` | Diálogo Definir vigência | PT400 início/fim, PT409 → refetch, `sem_alteracao`, `atualizada` |
| V1-CON-004 | sugestões de todos os tipos | Sugestões (selo "Sugestão de IA" separado de "Decisão humana: aprovada/rejeitada por … em …") | lista os tipos clausula, obrigacao, prazo, documento_exigido, restricao, regra_candidata, metadado e classificacao |
| V1-CON-005 | `pagina`, `trecho_fonte` | Bloco "Fonte" somente leitura | material sem página ou trecho: aprovar bloqueado com motivo; sem vigência: aprovar bloqueado + "Definir vigência" |
| NFR-005 | `processamentos_documento` da versão selecionada, `criado_em DESC, id DESC`, página 10 | Processamento | status texto + ícone; polling só pendente/processando, backoff 5/10/20/40/60 s, pausa com a aba oculta, botão Atualizar |
| NFR-007 / NFR-008 | duas RPCs | Diálogos | duplo clique = 1 chamada; erro ou PT409 → refetch antes de reabilitar; segunda revisão após `status≠pendente` não é oferecida |
| NFR-009 | todas as listas com `.range` + `count:'exact'` | todas | versões 20, processamentos 10, páginas 10, fragmentos 20, sugestões 20; arquivos e requisitos com um `.in()` por página; nenhuma consulta por item |
| NFR-010 | mapa de erros | todas | erros PT-BR, sem token/path/stack; texto extraído renderizado como texto puro |
| BRAND-01 | `ContaOSMarca`, tokens, shadcn | todas | 1440/1280/768/390, claro e escuro |

## 3. Consultas, RPCs e Edge (colunas explícitas)

- `documentos_contrato`: `id,id_contrato,tipo,titulo,categoria,situacao,versao_atual,versao_registro,vigencia_inicio,vigencia_fim,observacoes,criado_em,atualizado_em` `.eq('id',idDoc).eq('id_contrato',id).maybeSingle()`.
- `versoes_documento`: `id,id_documento_contrato,numero_versao,id_arquivo,hash,motivo_substituicao,metadados_extraidos,enviado_por,criado_em` `.eq('id_documento_contrato',idDoc)`, ordenada, `.range` 20, count exact.
- `arquivos`: `id,nome_original,mime,tamanho,sha256,status_seguranca,origem,criado_por,criado_em` `.in('id', ids da página)`.
- `processamentos_documento`: `id,id_versao_documento,etapa,status,tentativas,erro_codigo,iniciado_em,concluido_em,criado_em,atualizado_em` `.eq('id_versao_documento',v)`, `.range` 10. `erro_detalhe` e `resultado` não entram na interface; só o `erro_codigo` mapeado para PT-BR (NFR-010).
- `paginas_documento`: `id,id_versao_documento,numero_pagina,texto_extraido,hash_texto,criado_em` `.eq(v)`, `numero_pagina ASC`, `.range` 10.
- `fragmentos_documento`: `id,id_versao_documento,pagina_inicio,pagina_fim,indice_fragmento,texto,criado_em` `.eq(v)`, filtro opcional `.lte('pagina_inicio',p).gte('pagina_fim',p)`, `indice_fragmento ASC`, `.range` 20.
- `sugestoes_extracao_documento`: `id,id_versao_documento,tipo,categoria_sugerida,id_requisito_sugerido,conteudo,pagina,trecho_fonte,confianca,status,revisado_por,revisado_em,metadados,criado_em,vigencia_inicio,vigencia_fim` `.eq(v)`, filtros `.eq('status')` e `.eq('tipo')` no servidor, `criado_em DESC, id DESC`, `.range` 20.
- `requisitos_competencia`: `id,codigo,descricao,categoria,origem_tipo,origem_id` `.in('id', ids da página)`.
- RPCs `definir_vigencia_sugestao_extracao` e `revisar_sugestao_extracao`, tipadas localmente com o mesmo padrão de fronteira já documentado em V1-10, porque não constam em `types.ts`.
- Edge `storage-sign-download` reutilizada de `documentosDados.ts` (sem duplicar).

## 4. Fluxos

- **Gate:** parâmetros inválidos → não encontrado, sem consultas. Sem sessão → `/login`. Sem organização → `/selecionar-organizacao`. Contrato 403/404 → mensagem sanitizada. Documento não encontrado no contrato → "Documento não encontrado ou sem acesso" (mesma mensagem para inexistente e outro tenant).
- **Seleção de versão:** padrão = versão atual (maior `numero_versao`); search param `versao` opcional. Trocar a versão só muda as consultas por versão.
- **Download:** habilitado só com `status_seguranca='aprovado'`. Chama a Edge e abre apenas URL https; erro em PT-BR.
- **Definir vigência:** diálogo Radix com início obrigatório e fim opcional, validação local de UX; chamada única com botão bloqueado. `atualizada` ou `sem_alteracao` → aviso em `aria-live` + refetch. PT409 → refetch + "já revisada".
- **Aprovar/rejeitar:** só para `status='pendente'`.
  - Classificação: campo opcional de categoria revisada e conteúdo revisado (parâmetros reais). Requisito preservado (`p_id_requisito_revisado=null`); troca de requisito fica fora, por não haver busca server-side delimitada.
  - Metadado: mostra `metadados.campos` somente leitura; sem editor granular.
  - Material: exige página, trecho e vigência. O sucesso mostra a `mensagem` do backend ("…gerou uma regra em rascunho para revisão material"), nunca "ativada".
  - Rejeição mostra a mensagem do backend da lista fixa.
  - Qualquer erro → refetch da sugestão antes de reabilitar.
- **Confiança:** só a porcentagem, sem rótulo baixo/alto (não há threshold oficial).
- **Central V1-10:** o botão desabilitado vira `Link` para a rota de detalhe, levando a busca, os filtros e a página atuais em search params; o detalhe volta com os mesmos parâmetros.

## 5. Arquivos

Criar:
- `src/routes/contratos_.$id_.documentos_.$idDocumento.tsx` (padrão un-nested já usado: `contratos_.$id_.*`)
- `src/components/contratos/DocumentoDetalhe.tsx`
- `src/lib/contratos/documentoDetalheDados.ts`
- `src/test/documentoDetalhe.test.tsx`
- `docs/frontend/lovable/PROMPT-32-V1-11-detalhe-documento.md`

Modificar:
- `src/components/contratos/DocumentosContrato.tsx`: só o link de detalhe e a leitura e escrita dos search params da Central.
- `src/routes/contratos_.$id_.documentos.tsx`: só `validateSearch` opcional, se necessário para o retorno.
- `src/test/documentosContrato.test.tsx`: só a asserção "Abrir detalhe — Em breve".
- `src/routeTree.gen.ts`: automático.

Proibidos: `supabase/**`, package/lock, `src/integrations/supabase/types.ts` (restaurar de `e10f797` se regenerado), `client.ts`, `src/styles.css`, `src/components/ui/**`, `public/brand/**`, `ContaOSMarca.tsx`, `AGENTS.md`, outras telas, roadmap.

## 6. TDD e verificação no BUILD

1. Restaurar `types.ts` de `e10f797`.
2. Criar o teste primeiro, rodar e registrar o RED (módulos ausentes).
3. GREEN mínimo.
4. Casos de teste:
   - gate e cross-tenant;
   - paginação e ausência de N+1, contando as consultas;
   - hash divergente;
   - download aprovado, quarentena e bloqueado;
   - metadados e texto puro;
   - classificação + item;
   - material bloqueado por fonte e vigência;
   - vigência PT400, PT409, `sem_alteracao` e `atualizada`;
   - aprovar e rejeitar, duplo clique e refetch após erro P0001;
   - mensagem de rascunho;
   - ausência total de `.insert/.update/.delete/.upsert`.
5. Teste focado, suíte, `npx tsc --noEmit`, build, lint (novos com 0 erros; global ≤ 8.962/9), scan estático, Security Scan, navegador em 4 larguras claro e escuro, diff restrito e `types.ts` com diff zero. Teste C em turno separado.

## 7. Riscos e mitigação

- Erros de `revisar_sugestao_extracao` sem SQLSTATE: refetch obrigatório + mensagens de lista fixa (seção 1).
- `types.ts` regenerado pela plataforma: restaurar e provar diff zero antes de encerrar.
- Texto extraído grande: paginação de 10 páginas e corte visual com "Mostrar mais" local; texto sempre como texto puro.
- Nomes de terceiros indisponíveis (RLS self-only em `usuarios`): usar UUID técnico, sem inventar nome.
- Sessão real indisponível no sandbox: browser com fixture interceptada; RLS real registrada como limitação.

## PLAN: APROVÁVEL — V1-11 100% COBERTO

Não há lacuna de backend: todas as leituras e as duas RPCs existem com RLS, grants e locks. A única divergência (exceções sem SQLSTATE em `revisar_sugestao_extracao`) é tratada só na interface, sem afetar segurança ou idempotência, já que o backend bloqueia `status≠pendente` com `FOR UPDATE`.
