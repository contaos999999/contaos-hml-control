# PROMPT 30 / V1-09 — Contrato > Listas/Regras — PLAN

## Estado verificado
- HEAD local `44ac8aa806cc34d22d3815121e7a0865af84480a`; `types.ts` sem diff contra o baseline; `types.ts` já tipa as 6 tabelas e a RPC `aprovar_regra_preventiva`.
- Rotas irmãs existentes: `contratos_.$id.tsx`, `contratos_.$id_.base-normativa.tsx`, `contratos_.$id_.orcamento.tsx`. "Regras" é placeholder "Em breve" em `SECOES_FUTURAS` de VisaoGeral, BaseNormativa e Orcamento.

## Requisitos
V1-CHK-001..004 (listas, itens, regras de conformidade, regras preventivas + aprovação), NFR-007, NFR-009, BRAND-01. NFR-008: N/A (RPC sem contrato de idempotência; só bloqueio de dupla submissão).

## Backend existente (HML, inspecionado neste turno) — basta, sem alteração
| Tabela | RLS SELECT | Colunas usadas |
|---|---|---|
| listas_verificacao | acesso ao contrato | id, nome, descricao, situacao(rascunho/ativa/inativa), versao_atual, versao_registro, atualizado_em |
| versoes_lista | acesso ao contrato | id, id_lista, numero_versao, vigencia_inicio/fim, situacao(rascunho/publicada/substituida), aprovado_em |
| itens_lista | acesso ao contrato | id, codigo, descricao, categoria, obrigatorio, aplicavel, impeditivo, criticidade, id_fonte_versao, regra_validacao, ordem |
| regras_conformidade | acesso ao contrato | id, codigo, descricao, tipo, efeito_portao, id_fonte_versao, situacao, atualizado_em |
| regras_preventivas | contrato (ou org se id_contrato nulo) | id, codigo_regra, descricao, efeito, criticidade, escopo_aplicacao, vigencia_inicio/fim, numero_versao, situacao, fonte, id_fonte_formal_versao, versao_registro, aprovada_em |
| fontes_formais_regras_preventivas | acesso ao contrato | id_regra_preventiva, id_versao_fonte_normativa, fundamento_aplicabilidade, validado_em |
| versoes_fontes_normativas / fontes_normativas | já consumidas em V1-07 | rótulo de fonte/versão |

RPC: `aprovar_regra_preventiva(p_id_regra_preventiva uuid, p_parecer text default null) returns uuid`.

## LACUNA/CONFLITO declarado (não bloqueia)
- O prompt cita "suspensa/obsoleta"; a constraint real de `regras_preventivas.situacao` é `candidata | ativa | inativa | rejeitada | substituida`. A UI usará exatamente os valores do backend (rótulos: Candidata, Ativa, Inativa, Rejeitada, Substituída). Nada será inventado.
- Regras preventivas com `id_contrato` nulo (escopo organização) não serão listadas: escopo da tela = contrato (`id_contrato=eq.:id`). Ampliar exige decisão expressa.
- Sem RPC pública de versionamento de lista: versões ficam somente leitura; nenhum botão "nova versão".

## Consultas (Data API + RLS, sempre `.eq("id_contrato", id)` + colunas explícitas, `range` 25, `count: "exact"`)
1. Listas: `listas_verificacao` order `atualizado_em desc, id desc`, paginado.
2. Ao expandir lista (lazy): `versoes_lista` por `id_lista` order `numero_versao desc` (25); `itens_lista` por `id_versao_lista` da versão atual order `ordem asc, id asc` (25, paginado).
3. Regras de conformidade: order `codigo asc, id asc`, paginado.
4. Regras preventivas: filtro opcional por situação (servidor `.eq`), order `situacao, codigo_regra, id`, paginado.
5. Detalhe de regra preventiva (lazy): `fontes_formais_regras_preventivas` por `id_regra_preventiva`; rótulo da fonte via `versoes_fontes_normativas` (`.in` com ids da página) — sem dataset completo.
6. Rótulos de fonte em itens/regras de conformidade: `.in` em `versoes_fontes_normativas` só para ids da página.
7. Aprovação: `supabase.rpc("aprovar_regra_preventiva", { p_id_regra_preventiva, p_parecer: texto.trim() || null })`; sucesso mostra UUID retornado como protocolo de revisão; recarrega página atual.
Nenhum `.insert/.update/.delete/.upsert` em qualquer tabela.

## Erros (mapeamento sem vazar detalhes)
42501/PT403 → "Você não tem permissão para aprovar esta regra."; P0002/PT404 → "Regra não encontrada."; PT409/40001/conflito → "A regra foi alterada por outra pessoa. Atualize e tente novamente." (exige recarregar); 22023/P0001 → mensagem genérica de validação do backend em PT-BR; demais → genérica + retry.

## Arquivos
Criar:
- `src/lib/contratos/regrasDados.ts` (tipos derivados de `Tables<>`, consultas, rótulos, mapeador de erro, chamada RPC)
- `src/components/contratos/RegrasContrato.tsx`
- `src/routes/contratos_.$id_.regras.tsx` (`ssr:false`, head próprio noindex, padrão da rota orçamento)
- `src/test/regrasContrato.test.tsx`
- `docs/frontend/lovable/PROMPT-30-V1-09-regras.md` (padrão do Prompt 29)
Modificar (mínimo): `VisaoGeralContrato.tsx`, `BaseNormativaContrato.tsx`, `OrcamentoContrato.tsx` — remover "Regras" de `SECOES_FUTURAS` e adicionar link real. Testes antigos de navegação (`contratoDetalhe.test.tsx`, `baseNormativa.test.tsx`, `orcamento.test.tsx`) só se assertarem "Regras – Em breve"; alteração limitada a essa expectativa e justificada no doc.
Auto: `routeTree.gen.ts` (framework).

## Proibidos
supabase/**, migrations, RLS, RPCs, Edge, Auth/RBAC, `src/integrations/**` (incl. `types.ts`), package.json/lock, `src/styles.css`, `public/brand`, `src/components/ui/**`, AGENTS.md, outras rotas.

## UX
- Gate idêntico a V1-06/07/08: `getUser` → `/login`; `obterPreferenciaOrganizacao` → `/selecionar-organizacao`; `obterContrato` + classificador 403/404; nenhuma consulta de negócio antes disso.
- Cabeçalho BRAND-01 (ContaOSMarca), H1 único "Listas e regras", nav de seções com `aria-current="page"` em Regras.
- Três seções (abas acessíveis ou seções empilhadas no mobile): Listas de verificação, Regras de conformidade, Regras preventivas. Tabelas em desktop, cartões em 390 px.
- Itens: obrigatório/aplicável/impeditivo como texto "Sim/Não" + ícone; criticidade como badge com texto; `regra_validacao` como lista chave/valor legível (JSON nunca cru).
- `efeito_portao`: "Afeta portão: Sim/Não" com tooltip "Valor definido pelo backend"; nunca calculado.
- Candidata x Ativa: badge com texto + ícone + borda distintos (não só cor).
- Fonte/versão, escopo, vigência (DD/MM/AAAA, "Sem término" se nula), criticidade, efeito, origem.
- Detalhe em Dialog (shadcn existente), Esc fecha, foco volta ao gatilho.
- Aprovar: só visível em situação `candidata`; abre confirmação com Textarea "Parecer (opcional)" com label; botão desabilitado + "Aprovando…" durante envio (bloqueia dupla submissão); sucesso com protocolo; erro mapeado.
- Estados separados: loading (skeleton), vazio por seção, erro com "Tentar novamente", saving, sucesso. Tooltips (hover+foco, toque) em efeito portão, impeditivo, escopo.

## Riscos
- Tenant: RLS é autoridade; filtro por `id_contrato` é só escopo de UX; id canônico (UUID) validado antes.
- Temporalidade: mostrar vigência e versão; não decidir validade no cliente.
- Concorrência: conflito → forçar recarga; nada de atualização otimista.
- Histórico: versões/regras substituídas exibidas, não ocultadas.

## TDD (BUILD futuro)
1. Escrever `regrasContrato.test.tsx` completo → executar → RED (módulos inexistentes).
2. Implementar dados → componente → rota → navs → GREEN focado → suíte completa.

Casos: sem sessão/sem org/403/404 sem consultas de negócio; `range(0,24)`, `count exact`, `select` com colunas explícitas e `.eq id_contrato`; próxima página `range(25,49)`; filtro situação servidor; V1-CHK-001..004 renderizados; Candidata ≠ Ativa por texto; `efeito_portao` exibido conforme dado (true/false) sem cálculo; fonte/versão/escopo/vigência visíveis; RPC chamada com args exatos (parecer vazio → null); nenhuma chamada insert/update/delete/upsert; botão inexistente para não-candidata; RPC 403 mostra erro PT-BR; conflito exige recarga; duplo clique = 1 chamada; H1 único, labels, Esc devolve foco; nav com `aria-current`.

## Gates do BUILD
Teste focado; suíte completa; `npx tsc --noEmit`; `npm run build`; lint dos arquivos novos 0 erros e global sem aumento (baseline 8.962); scan de `service_role|sk_|PRIVATE KEY|as any|as never|.update(|.insert(|.delete(|.upsert(` nos novos arquivos; Security Scan; browser 1440/1280/768/390 (sem overflow, marca, foco) com fixture se sessão real indisponível — declarado como LIMITADO; `git diff 44ac8aa -- src/integrations/supabase/types.ts` = 0 bytes; diff restrito à lista acima. Teste C em turno separado read-only.

## Conclusão
**PLAN: APROVÁVEL** — backend existente cobre leitura (RLS SELECT em todas as tabelas) e a única mutação (RPC oficial); nenhuma alteração de backend/tipos necessária. Divergências de nomenclatura de situação e escopo organização foram declaradas e resolvidas a favor do backend real.
