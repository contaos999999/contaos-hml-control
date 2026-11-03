# PROMPT 32 / V1-11 — Detalhe e versões de documento — BUILD

Baseline funcional: `e2551e5` (V1-10 certificado). HML `gklhhhyosgasnyoxlrui`, só consumo. PROD intocado. `src/integrations/supabase/types.ts` idêntico a `e10f797` (diff 0 bytes).

## Arquivos
- Novos: `src/routes/contratos_.$id_.documentos_.$idDocumento.tsx`, `src/components/contratos/DocumentoDetalhe.tsx`, `src/lib/contratos/documentoDetalheDados.ts`, `src/test/documentoDetalhe.test.tsx`, este documento.
- Alterados: `DocumentosContrato.tsx` (botão "Abrir detalhe — Em breve" virou link real; filtros e página da Central viajam em search params e voltam iguais); `contratos_.$id_.documentos.tsx` (só `validateSearch`); `documentosContrato.test.tsx` (só a asserção do botão); `routeTree.gen.ts` (automático).

## Backend lido (somente leitura, antes do código)
- RLS SELECT `usuario_tem_acesso_contrato(id_contrato)` em versões, processamentos, páginas, fragmentos e sugestões; `authenticated` com SELECT nelas e em `arquivos`/`requisitos_competencia`.
- `definir_vigencia_sugestao_extracao`: `FOR UPDATE`; PT404/42501/PT409/PT400; retorno `{status: atualizada|sem_alteracao}`.
- `revisar_sugestao_extracao`: `FOR UPDATE`; retorno `{status: aprovada|rejeitada, id_regra_rascunho, mensagem}`; material gera `regras_conformidade` `rascunho`, `efeito_portao=false`.
- Divergência registrada: as exceções de `revisar_sugestao_extracao` não têm SQLSTATE próprio (P0001). A tela compara com as quatro frases conhecidas, mostra só mensagens fixas em PT-BR e refaz a leitura antes de liberar nova tentativa.

## Matriz requisito → arquivo → teste
| Requisito | Implementação | Teste (`documentoDetalhe.test.tsx`) |
|---|---|---|
| Gate | UUIDs → `getUser` → organização → `obterContrato` → documento `.eq(id).eq(id_contrato).maybeSingle()` | rota/noindex; sem sessão; sem organização; UUID inválido; 403; outro contrato |
| V1-DOC-001 / NFR-003 | download só `aprovado`, por `storage-sign-download` e URL https | aprovado; quarentena/bloqueado/pendente |
| V1-DOC-002 | categoria + item via um `.in()` em `requisitos_competencia` + confiança | lista paginada… item real |
| V1-DOC-003 | versões `numero_versao DESC, id DESC`, 20/página, "Versão atual", motivo | versões paginadas…; selecionar sem RPC |
| V1-DOC-004 | metadados recursivos como texto, rótulos PT-BR, vazio explícito | metadados; sem metadados |
| V1-DOC-005 | cadeia: arquivo, MIME, tamanho, origem, data, "Você"/UUID abreviado, hashes, motivo; alerta de divergência sem atribuir causa | cadeia; hash divergente |
| V1-CON-002 | diálogo "Definir vigência" (início obrigatório, fim opcional) | PT400; fim antes; sem_alteracao; PT409 |
| V1-CON-004 | todos os tipos; selo "Sugestão de IA" separado de "Decisão humana" | material mostra fonte… |
| V1-CON-005 | página/trecho somente leitura; aprovação material bloqueada sem fonte ou vigência | material sem fonte/vigência |
| Perfil (UX) | `vinculos_usuarios` lido uma vez (`select perfil`, `id_usuario`=auth.uid(), `id_organizacao` ativa, `maybeSingle`); ações só para `administrador`, `direcao_aprovador`, `gestor_contrato`, `prestacao_contas`, `juridico_conformidade`, `auditor` (mesmo conjunto das duas RPCs); carregando/erro/sem vínculo = somente leitura | perfil para revisão humana (4 testes) |
| Revisão | aprovar/rejeitar só `pendente` e perfil permitido; material → "regra em rascunho para revisão material" | aprovar material; classificação/rejeição; P0001; erro desconhecido |
| NFR-005 | processamento da versão, polling 5/10/20/40/60 s só pendente/processando, pausa em aba oculta, "Atualizar processamento" | processamento |
| NFR-007/008 | trava contra duplo clique; refetch após qualquer erro antes de reabilitar | duplo clique = 1 chamada; PT409/P0001 refetch |
| NFR-009 | versões 20, processamentos 10, páginas 10, fragmentos 20 (filtro de página no servidor), sugestões 20 (status/tipo no servidor); arquivos e requisitos com um `.in()` | ranges, orders e `.in()` verificados |
| NFR-010 | erros PT-BR fixos; `erro_codigo` não exibido; texto extraído como texto puro; sem bucket/path | erro desconhecido; texto puro; sem bucket |
| Zero-Drift | sem escrita direta, `embedding`, service_role, `as any`, `itens_lista`, `dangerouslySetInnerHTML` | escopo e Zero-Drift |

## TDD
- RED: `bunx vitest run src/test/documentoDetalhe.test.tsx` → falha de importação (módulo `documentoDetalheDados` inexistente), 0 testes.
- GREEN: 30/30 no focado. Durante o GREEN, a asserção de `embedding` foi ajustada para olhar só as constantes de colunas, porque o regex inicial pegava o comentário do arquivo.

## Correção de perfil (pós-auditoria)
- Causa: as ações de revisão apareciam para qualquer sugestão pendente, sem considerar o perfil.
- RED: 4 falhas / 30 aprovados (`vinculos_usuarios` não era consultado; leitor via as ações).
- GREEN: 34/34. V1-10 33/33. Suíte 500/500 (21 arquivos). tsc e build exit 0; ESLint dos alterados 0; global 8.962/9.
- Navegador 1440 e 390: `gestor_contrato` vê 3 Aprovar, 3 Rejeitar, 2 Definir vigência; `leitor` vê 0 de cada, com o mesmo conteúdo e fonte.
- O backend continua a autoridade final; o tratamento de 42501/P0001/PT409 foi mantido.

## Resultados reais
- Focado V1-11: 30/30. V1-10: 33/33. Suíte: 496/496 (21 arquivos).
- `npx tsc --noEmit` e `npm run build`: exit 0.
- ESLint: arquivos novos e alterados 0; global 8.962 erros / 9 avisos (= baseline).
- Scan estático: um único `as unknown as` na fronteira das RPCs V1-11 (fora de `types.ts`); nada de service_role, secrets, `as any`, escrita direta, `getPublicUrl`, `console.log`.
- Navegador (dados simulados, nenhuma gravação): 1440/1280/768/390, claro e escuro; sem rolagem horizontal; um H1; ordem de Tab coerente; diálogo com 2 campos rotulados, `aria-live` e fechamento por ESC.

## Riscos e limitações
- Sem sessão real no sandbox: RLS e RPCs não foram exercidas contra o HML autenticado.
- O aviso de hidratação no tema escuro vem do script de teste, que força o tema.
- No tema escuro, o cabeçalho segue o padrão herdado das telas V1-06 a V1-10.
- Troca do requisito sugerido não oferecida: não há busca server-side delimitada (`p_id_requisito_revisado` enviado como `null`, preservando o sugerido).
- Sem limiar oficial de confiança: mostra só a porcentagem.

## Separação
- V1-10: Central (inalterada, só o link e o retorno com filtros).
- V1-11 (este BUILD): detalhe, versões, cadeia, processamento, metadados, páginas, fragmentos, sugestões e revisão humana.
- V1-12 Competências: não implementado; continua "Em breve".
