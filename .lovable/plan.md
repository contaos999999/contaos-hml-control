# PROMPT 29 / V1-08 — Contrato — Orçamento (PLAN)

Ambiente HML (`gklhhhyosgasnyoxlrui`). PROD proibido. Somente frontend.

## 1. Rastreabilidade
- Regular: PROMPT 29 / V1-08.
- Atômicos: 001 V1-CON-001 (contexto do contrato/gate), 002 V1-CON-002 (navegação de seções), 003 V1-CON-003 (proposta estruturada: grupo, rubrica, subrubrica, mensal, anual, remanejamento, limite %, observações, documento-base, versões/vigência), 004 V1-CON-004 (versionamento/publicação imutável), 005 V1-CON-005 (histórico e rastreabilidade).
- Transversais: NFR-007 concorrência otimista (`p_versao_esperada`, PT409), idempotência (`p_chave_idempotencia`), NFR-009 paginação 25, RLS, auditoria (`correlation_id` como protocolo), PT-BR/BRL/datas, a11y/responsividade, BRAND-01, Zero-Drift.

## 2. Diagnóstico do estado atual (auditado)
- Existem: `contratos_.$id.tsx` (V1-06), `contratos_.$id_.base-normativa.tsx` (V1-07, `ssr:false`, noindex), `contratoDetalheDados.ts` (`obterContrato` + classificador V106 após zero linhas), `baseNormativaDados.ts` (adaptador `as unknown as` tipado, mapeamento PT409/PT400/PT404/42501, `enviarArquivo`/`baixarArquivo`).
- `VisaoGeralContrato.tsx:23` e `BaseNormativaContrato.tsx:43` listam "Orçamento" em `SECOES_FUTURAS` com selo "Em breve".
- Não existe rota/componente de orçamento.
- Backend V108 confirmado por consulta ao catálogo: as 5 RPCs existem com as assinaturas exatas informadas, todas retornando `jsonb`.
- Colunas confirmadas:
  - `propostas_orcamentarias`: id, id_organizacao, id_contrato, titulo, situacao (rascunho|ativa|substituida|encerrada), versao_atual, versao_registro, criado_em, atualizado_em.
  - `versoes_proposta`: id, id_proposta, numero_versao, vigencia_inicio, vigencia_fim, valor_total, hash, situacao (rascunho|publicada|substituida), aprovado_por, aprovado_em, criado_em, id_arquivo_origem.
  - `linhas_orcamentarias`: id, id_versao_proposta, codigo, grupo, rubrica, subrubrica, descricao, valor_mensal_previsto, valor_anual_previsto, permite_remanejamento, limite_remanejamento_percentual (0–100), observacoes, versao_registro, criado_em.
- Lacunas de backend: nenhuma.

## 3. Arquivos
Criar:
- `src/routes/contratos_.$id_.orcamento.tsx` (rota irmã, `ssr:false`, head próprio + `robots noindex`).
- `src/components/contratos/OrcamentoContrato.tsx`.
- `src/lib/contratos/orcamentoDados.ts`.
- `src/test/orcamento.test.tsx`.
- `docs/frontend/lovable/PROMPT-29-V1-08-orcamento.md`.

Alterar (mínimo): `VisaoGeralContrato.tsx` e `BaseNormativaContrato.tsx` — remover "Orçamento" de `SECOES_FUTURAS` e inserir `Link` para `/contratos/$id/orcamento`.

Gerado automaticamente: `src/routeTree.gen.ts` (nunca manual).

Intocados: `types.ts`, cliente/auth Supabase, `styles.css`, `package.json`, `AGENTS.md`, `public/brand`, `baseNormativaDados.ts` (apenas importado: `enviarArquivo`, `baixarArquivo`, mapeador de erro se exportado; se não exportado, duplicação mínima local em vez de alterar V1-07), migrations/backend, demais features.

## 4. Dados (orcamentoDados.ts)
Leituras Data API + RLS, colunas explícitas, `.range(0,24)`, `count: 'exact'`:
- Proposta do contrato: `propostas_orcamentarias` select colunas acima, `eq id_contrato`, order `criado_em desc, id desc` (paginada; normalmente 1).
- Versões (sob demanda): `versoes_proposta` `eq id_proposta`, order `numero_versao desc, id desc`.
- Rubricas da versão selecionada: `linhas_orcamentarias` `eq id_versao_proposta`, order `grupo, rubrica, subrubrica, id`.
- Documento-base: `arquivos` select apenas `id, nome_original, mime, tamanho, status_seguranca, criado_em` por `in(id, ids da página)` — uma consulta por página (sem N+1); nunca `path`.
- Contrato: `obterContrato` existente (classificador V106 só após zero linhas).

Escritas: somente as 5 RPCs V108 via fronteira `rpcV108 = supabase.rpc.bind(supabase) as unknown as RpcV108` com tipos estruturais locais (args exatos, nulos onde o backend aceita: `p_id_proposta`, `p_id_linha`, `p_versao_esperada`, `p_codigo`, `p_subrubrica`, `p_descricao`, valores, limite, observações, `p_vigencia_fim`). Sem `as any/as never`.
- Chave idempotente `crypto.randomUUID()` gerada por intenção; preservada em retry de transporte; renovada quando o payload material muda.
- Erros: PT409 → "conflito" (botão Recarregar, sem reenvio); PT400 → validação; PT404 → ausente/obsoleto; 42501 → sem permissão; demais → genérico. Mensagens PT-BR, sem texto cru do servidor.
- `correlation_id` do retorno exibido como protocolo.
- Upload: reutiliza `enviarArquivo` (sign-upload → signed upload → SHA-256 → `confirmar_upload_arquivo` com `p_id_contrato` do contrato), interrompe se `usar_upload_resumivel`. Download só por clique (`baixarArquivo`).

## 5. UX / componentes
- Gate: verificando sessão → carregando contrato → 403 / 404 / erro com Tentar novamente → conteúdo.
- Cabeçalho com `ContaOSMarca` (padrão atual), H1 único "Orçamento", contexto (número/objeto do contrato), nav de seções (Visão geral, Base normativa, Orçamento `aria-current="page"`, demais "Em breve").
- Resumo da proposta: título, situação oficial (texto do domínio + selo com texto), versão atual (backend), atualizado em. Empty real: "Nenhuma proposta orçamentária" + Criar proposta (diálogo título → `salvar_proposta_orcamentaria_v108`). Editar título com `p_versao_esperada = versao_registro`.
- Versões: lista paginada sob demanda; rascunho/publicada/substituída distinguidos por texto + selo; vigência DD/MM/AAAA; valor total R$; documento-base com `status_seguranca` (pendente/processando/aprovado/rejeitado).
- Nova versão (diálogo): vigência início/fim + documento-base (selecionar existente da página ou enviar novo) → `registrar_versao_proposta_v108`. Botão oculto/desabilitado com explicação se já houver rascunho (backend é autoridade).
- Rubricas da versão selecionada: tabela paginada (≥768) / cartões (390) com grupo, rubrica, subrubrica, código (opcional, "gerado automaticamente" quando ausente), mensal R$, anual R$, remanejamento Sim/Não, limite %, observações.
- Criar/editar rubrica (diálogo) somente em rascunho; limite % exibido só quando "permite remanejamento"; código opcional. Remover com AlertDialog de confirmação.
- Publicar (AlertDialog crítico): hash do servidor (exibido, não calculado), vigência, documento-base e status, nº de rubricas e soma exibida da página (rotulada como informativa), fundamento obrigatório (textarea com label) + checkbox de confirmação → `publicar_versao_proposta_v108(p_hash_esperado = hash lido)`. Desabilitado visualmente se documento não aprovado ou sem rubricas, com aviso "o servidor decide".
- Pós-publicação: sem ações de mutação nas rubricas dessa versão.
- Tooltips só em: hash, limite de remanejamento, versão atual.
- Formatação: `Intl` pt-BR, BRL, datas DD/MM/AAAA, data-hora brasileira.

## 6. Estados
Verificando sessão, carregando contrato, carregando orçamento, empty real, sucesso (com protocolo), erro + retry, 403, 404, validação por campo, salvando/processando (botões desabilitados, `aria-busy`), conflito PT409 (Recarregar), arquivo pendente/processando/aprovado/rejeitado. Empty nunca exibido quando há erro/403.

## 7. Segurança / Zero-Drift
Sem `.insert/.update/.delete/.upsert` nas tabelas de orçamento; sem path/token/signed URL em DOM/log; sem secrets; `types.ts` intacto; nenhuma autoridade de hash/versão/situação/aprovação no React; nada fora dos arquivos listados.

## 8. BRAND-01
`ContaOSMarca` existente (mono-branco em fundo escuro já integrado), tokens semânticos existentes, sem nova paleta/hardcode, sem sidebar/AppShell/PWA. Validar leitura da marca em 1440/1280/768/390.

## 9. Responsividade / a11y
Sem overflow horizontal em 390 (tabela → cartões); H1 único; labels associados; `aria-current`; status com texto; foco visível; Esc fecha diálogo e devolve foco ao gatilho; nomes acessíveis em ações de ícone; teclado completo; campos monetários com sufixo/prefixo R$ e descrição.

## 10. TDD
RED primeiro (rota/módulo inexistentes). Testes em `orcamento.test.tsx`: rota/head/noindex; sessão/organização; gate 403/404 V106 (classificador só após zero linhas); colunas explícitas, range 0–24, ordens estáveis; empty vs erro/403; versões e rubricas só sob demanda, arquivos em uma consulta por página; args exatos das 5 RPCs; chave idempotente renovada vs preservada; PT409 sem reenvio; campos V1-CON-003 e código opcional; arquivo pendente bloqueia publicar, aprovado habilita; sem path/token; publicação exige fundamento+confirmação, envia hash do servidor; pós-publicação sem mutações; paginação; nav nas 3 telas; ContaOSMarca; foco/Esc; scan estático (sem mutações diretas, sem `as any/as never`, `types.ts` sem `_v108`). GREEN: focado, suíte completa, `npx tsc --noEmit`, build, browser 4 larguras.

## 11. Teste C (turno separado, read-only, sem auto-fix)
12 gates exigidos (rota, perfil autorizado, não autorizado bloqueado, loading/empty/error, sem secret, sem update direto, 1440/1280, 768, 390, teclado/foco/labels, console limpo, Security Scan sem novo Critical/High) + 13 BRAND-01 + 14 Zero-Drift (diff restrito aos arquivos da seção 3).

## 12. Riscos
- Supabase externo sem sessão real no sandbox: prova de RLS/RPC real limitada; browser usa sessão simulada — reportado como limitação.
- `types.ts` não contém V108: mitigado pela fronteira tipada única.
- Plataforma pode recriar entradas em `types.ts` em commits automáticos: verificar diff antes de concluir.

**PLAN: APROVÁVEL**
