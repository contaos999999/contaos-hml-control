# PROMPT 31 / V1-10 — Central de documentos do contrato — BUILD

- Baseline funcional: `e10f7973260df0c455bb66baa091e5c9b3124efe` (V1-09). HML `gklhhhyosgasnyoxlrui`; PROD intocado; nenhum backend alterado.
- Rota: `/contratos/:id/documentos` (`ssr:false`, `noindex`).
- Checkpoint intermediário: `d5cb64abc4bf95fe3b0c96834ebb708ba760475f`; delta de auditoria aplicado depois dele (item sugerido real, configuração de upload dinâmica, sem N+1).

## Arquivos

Novos: `src/routes/contratos_.$id_.documentos.tsx`, `src/components/contratos/DocumentosContrato.tsx`, `src/lib/contratos/documentosDados.ts`, `src/test/documentosContrato.test.tsx`, este documento.
Alterados (só o link "Documentos", tirando o "Em breve"): `VisaoGeralContrato.tsx`, `BaseNormativaContrato.tsx`, `OrcamentoContrato.tsx`, `RegrasContrato.tsx`.
Testes antigos alterados só na asserção "Documentos — Em breve" → link: `contratoDetalhe.test.tsx`, `baseNormativa.test.tsx`.
`src/routeTree.gen.ts`: regenerado automaticamente pelo framework.
`src/integrations/supabase/types.ts`: restaurado ao blob de `e10f797` (drift de plataforma); diff final = 0 bytes.

## Contrato backend lido (somente leitura, antes dos adaptadores)

- `criar_documento_contrato_completo` → `privado.criar_documento_contrato_v111` → retorno jsonb `{id_documento,id_versao,numero_versao,id_arquivo,id_job,vigencia_inicio,vigencia_fim}`; PT400 para fim sem início / fim < início; PT404; 42501.
- `adicionar_versao_documento_contrato` → `privado.adicionar_versao_documento_contrato_v110` → `{id_documento,id_versao,numero_versao,id_arquivo,id_job}`; PT400 quando falta motivo (versão > 1).
- `confirmar_upload_arquivo` → uuid; valida path, extensão, MIME, tamanho real, SHA-256.
- O adaptador `lerRetornoDocumento` exige `id_documento,id_versao,numero_versao,id_arquivo`; qualquer outro formato vira erro.
- `sugestoes_extracao_documento.id_requisito_sugerido` FK → `requisitos_competencia.id`.
- `configuracao_upload` (SELECT authenticated): extensões, MIMEs, máximo 524288000, limiar resumível 104857600.

## Matriz requisito → arquivo → teste → evidência

| Requisito | Comportamento | Arquivo | Teste (`documentosContrato.test.tsx`) |
|---|---|---|---|
| Gate (sessão/org/contrato) | sem sessão → /login; sem org → /selecionar-organizacao; 403/404 sem consulta de negócio | DocumentosContrato | "sem sessão…", "sem organização…", "403…", "UUID inválido…" |
| V1-CON-001 | tipo, título, categoria, vigência, observações por `criar_documento_contrato_completo`; lista mostra vigência/versão/observações | ambos | "dois arquivos…", "mostra vigência…", "fim de vigência sem início…", "fim antes do início…" |
| V1-CON-002 | indicador "N sugestões sem vigência" (somente leitura) | documentosDados.obterResumos | "indicadores somente leitura…" |
| V1-CON-004 | indicador "N sugestões de IA pendentes de revisão humana"; nenhuma decisão na V1-10 | idem | "indicadores…", "não oferece revisão/vigência…" |
| V1-CON-005 | V1-10 não cria nem aprova regra; garantia no trigger backend | — | "não oferece revisão/vigência…" (scan de fonte) |
| V1-DOC-001 | envio múltiplo, validação UX por `configuracao_upload`, Storage privado por autorização temporária, TUS 6 MB acima do limiar | ambos | "validação UX usa a configuração…", "configuração alterada…", "falha da configuração bloqueia só o envio…", "arquivo inválido…", "TUS…" |
| V1-DOC-002 | Classificação (IA) com categoria e % de confiança + `Item sugerido: <código> — <descrição>` via uma `.in()` em `requisitos_competencia`; não resolvido → "Item sugerido indisponível" | ambos | "item sugerido real…", "item não resolvido…" |
| V1-DOC-003 | nova versão com motivo obrigatório (UX + PT400), versão anterior preservada | ambos | "exige motivo…" |
| V1-DOC-004 | indicador "Metadados extraídos: disponíveis/pendentes" | ambos | "indicadores…" |
| V1-DOC-005 | SHA-256 no navegador enviado na confirmação; hash curto + completo na dica; data/hora BR | ambos | "dois arquivos…" (p_sha256), "mostra vigência… hash" |
| Segurança de arquivo | quarentena/bloqueado: sem download, metadados visíveis; download só se aprovado, por `storage-sign-download`, só https | ambos | "quarentena…", "download aprovado…", "download negado…" |
| Idempotência | chave por item; mesma chave no retry; após upload confirmado reutiliza `id_arquivo` sem reenviar bytes; trava contra duplo clique | DocumentosContrato | "dois arquivos…" (duplo clique), "retry após upload confirmado…" |
| Erros RPC | 42501, PT400, PT404, PT409 e jsonb inválido em PT-BR | documentosDados | "PT400… 42501…", "retorno jsonb fora do contrato…" |
| NFR-005 polling | só com pendente/processando; 5/10/20/40/60 s; pausa com aba oculta; atualização manual | ambos | "backoff…", "processando…" |
| NFR-009 paginação | 25 por página, `range` + `count exact`, filtros no servidor (ilike escapado, eq) | documentosDados | "consulta colunas explícitas…", "filtros vão ao servidor…" |
| Desempenho (sem N+1) | uma consulta de sugestões por `.in(id_versao_documento)` em lotes de 1000 até esgotar; agregação local; uma `.in()` de requisitos | documentosDados | "indicadores…" (1 consulta, sem head/count) |
| Escopo | "Abrir detalhe — Em breve" desabilitado; Competências Em breve; sem `revisar_sugestao_extracao`/`definir_vigencia_sugestao_extracao` | DocumentosContrato | "não oferece…", "Competências continua…" |

## TDD

- RED inicial: `bunx vitest run src/test/documentosContrato.test.tsx` → falha de importação (módulos inexistentes), 0 testes.
- GREEN inicial: 27/27 (após o próprio teste novo aguardar indicadores assíncronos).
- RED do delta: 6 falhas / 25 aprovados (indicadores sem N+1, item sugerido real, item indisponível, validação por configuração, configuração alterada, falha de configuração).
- GREEN do delta: 31/31.

## Resultados finais (reais)

- Focado: 31/31. Suíte: 464/464 (20 arquivos).
- `npx tsc --noEmit`: exit 0. `npm run build`: exit 0.
- ESLint arquivos novos: 0. Global: 8.962 erros / 9 avisos (= baseline); arquivos antigos alterados com a mesma contagem da base.
- Scan estático nos arquivos novos: sem `service_role`, secrets, `as any`, `.insert/.update/.delete/.upsert(`, `getPublicUrl`, bucket público, RPCs de sugestão. Um único `as unknown as` (fronteira tipada das RPCs ausentes do `types.ts` certificado).
- Security Scan: 0 Critical/High; 1 Info preexistente (proteção de senha vazada).
- Visual (dados simulados): 1440/1280/768/390 em claro e escuro, sem rolagem horizontal, ordem de Tab coerente, status sempre com texto + ícone.

## Riscos e limitações

- R1 TUS com `x-signature` não provado contra Storage HML real (sem sessão real); se recusado, aparece erro PT-BR, sem proxy.
- R2 Sessão externa: RLS/RPC reais verificados só por simulação.
- R3 SHA-256 calcula o arquivo inteiro na memória do navegador (até o limite configurado).
- R4 O campo de data nativo segue o idioma do navegador (o navegador de teste estava em inglês e mostrou mm/dd/yyyy).
- R5 No tema escuro, o cabeçalho reutiliza o padrão herdado das V1-06..09 (fora do escopo).
- R6 O filtro por status de segurança não foi incluído (seria preciso join `!inner`); nada é filtrado no navegador.

## Separação

- V1-10 (este BUILD): central, filtros, paginação, envio múltiplo, documento-base completo, nova versão, segurança/processamento, indicadores somente leitura, download.
- V1-11 (não implementado): detalhe, histórico de versões, cadeia completa, metadados formatados, painel de extração com página/trecho, definir vigência, revisão humana.
- V1-12 (não implementado): Competências.
