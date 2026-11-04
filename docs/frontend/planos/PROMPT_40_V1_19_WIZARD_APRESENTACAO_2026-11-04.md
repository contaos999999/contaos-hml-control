# PROMPT 40 / V1-19 — PLAN: Wizard de apresentação

**Data:** 04/11/2026, horário de Brasília. **MODO PLAN: nenhum BUILD neste PR.** Planejamento originado do `Manual_Mestre_Prompts_4_1_100_PRD_original.docx`, parágrafos 2243–2302: rota `/competencias/:id/apresentar`, acesso aprovador, RPCs oficiais `aprovar_apresentacao` e `registrar_apresentacao`; sem criar backend. PRD e matrizes 4.1, BRAND-01, fonte normativa, Zero-Drift, NFR, segurança e política de custos Lovable prevalecem.

## A. Fonte canônica e checkpoint de entrada
- Frontend BASE DE PREPARAÇÃO `contaos999999/contaos-hml-control/main@953ee28c95230d75a128ffed852d30060a7533a2` (GOV-017 PR #39 concluído e GOV-019 PLAN #40 integrado). **Não integrar este PLAN em main até o PR #41 GOV-019 Vitest 2 workers estar concluído, integrado e HEAD revalidado.**
- Fonte normativa/backend `contaos999999/develop/main@a10d3b1a1a14276c017027f93ec2a7aace4d6cb6`; frontend snapshot `docs/frontend/CONTEXT_CANONICO_4_1_SNAPSHOT.json`: 25 arquivos 00–20/08A–08D, regular 00–99 (100 originais), atômicos 000–096 (97), crosswalk regular **40** → **000 (BRAND-01), 067**. `types.ts` hash git blob certificado `8ea7750b75fd9d76b29c36ce7613392e3ab65e19`, imutável.
- Última funcionalidade V1-18: PR #30, marca reparada via GOV-017 PR #39, crivo estático PASS, visual privado HML NÃO VERIFICADO. Não refazer PROMPT 39.
- Revalidar na hora do GATE: HEAD normativo vivo igual ao snapshot; CI PLAN 2 checks SUCCESS; conferir evolução real do frontend após PR #41 e ajustar baseline por novo PR/commit, sem copiar SHA desatualizado.

## B. Objeto, papéis e operações autorizadas
**Usuário aprovador**: acesso efetivo determinado exclusivamente por RLS/SQL e campo `allowed_actions.apresentar` de `obter_visao_geral_competencia(p_id_competencia)`. O frontend não autoriza pela própria classificação de perfil nem pelo percentual (100% é condição necessária, não autorização suficiente).
RPCs existentes no client congelado:
- `aprovar_apresentacao({p_id_competencia, p_fundamento?}) -> Json`: aprovação humana, verificação de contexto/parecer/portão no banco, mudança crítica apenas pelo banco. O retorno deve ser validado e a visão geral relida antes de prosseguir.
- `registrar_apresentacao({p_id_competencia, p_idempotency_key, p_protocolo?, p_forma_apresentacao?, p_id_comprovante_arquivo?}) -> UUID`: registro e congelamento atômico do pacote no Supabase. Nunca update direto em `competencias`, `pacotes_competencia`, `apresentacoes_contratante`.
- `obter_visao_geral_competencia` (somente leitura tipada via `src/lib/competencias/competenciaVisaoGeralDados.ts`) retorna dados, bloqueios, `allowed_actions` e estado oficial, sem reconstruir portão localmente.
- Após resultado ambíguo, não reenviar mutação automaticamente. Idempotency key estável em `useRef` por intenção e competência; alteração de intenção somente por nova ação expressa, nunca por render; 409/conflito exige verificar estado remoto. Evitar tokens/segredos no frontend.
- Dados opcionais de protocolo/forma (textos, limites e sanitização), comprovante UUID apenas se previamente existente e autorizado: **não implementar upload ou Storage neste prompt**.
- Estado final apenas após confirmação RPC e releitura. Com retorno positivo de `registrar_apresentacao`, exibir ID oficial e registrar que snapshot imutável foi criado pelo backend, sem inventar URL V1-20 se ainda não existir.

## C. Interface proposta e estados
`/competencias/:id/apresentar`: wizard institucional reutilizando header com `ContaOSMarca`, tokens do Design System, `Button`, `Alert`, `Dialog`, loaders e UX dos módulos V1-14/V1-18. Duas etapas:
1. **Revisão de prontidão e aprovação:** resumo backend da competência, referência do período, requisitos, bloqueios e versão existente; botão de aprovação com confirmação e fundamento opcional, **somente quando `allowed_actions.apresentar` autorizar**. Quando situação oficial for `pode_apresentar_contratante`, encaminhar ao registro. Percentual nunca habilita ação sozinho.
2. **Confirmação e protocolo:** campos de protocolo e forma de apresentação, confirmação humana, botão de registro com chave de idempotência; após mutação, mostrar ID oficial sem forjar data ou status. Pacote pode ser pré-visualizado apenas como **resumo não imutável** usando os dados de visão geral; congelamento real ocorre exclusivamente pela RPC de registro, não há dry-run/snapshot prévio certificado.
Estados obrigatórios: carregando, sessão ausente/redirecionar login, organização ausente, dados inválidos/não encontrados, sem permissão 401/403/42501, bloqueios materiais, vazio, aprovação em processamento, registro em processamento, conflito 409, erro técnico sem mensagens sensíveis, sucesso confirmado; botão desabilitado durante envio, idempotência e reconciliação com nova leitura. Português do Brasil, data/hora Brasília, responsivo 1440/1280/768/390, `aria-live`, roles, `labels`, ordem de tabulação, focus e sem scroll horizontal. A visibilidade do botão não substitui backend/RLS.

## D. Escopo técnico fechado de BUILD (após PLAN e GATE separados)
Arquivos novos:
- `src/lib/competencias/apresentacaoDados.ts`: tipagem, validação de UUID/retornos, RPCs, classificação de erro, chave estável, sem escrever RLS ou client.
- `src/components/competencias/CompetenciaApresentar.tsx`: wizard e estados com componentes Design System; `ContaOSMarca`.
- `src/routes/competencias_.$id_.apresentar.tsx`: rota privada e metadados PT-BR.
- `src/test/competenciaApresentar.test.tsx`: testes de adaptador e UI com Supabase mock, sem elevar mock a teste HML E2E.
- `docs/frontend/auditorias/PROMPT_40_V119_IDENTIDADE_E_TESTES_2026-11-04.md`: evidências e ressalvas.
Arquivos alteráveis:
- `src/components/competencias/CompetenciaVisaoGeral.tsx`: habilitar navegação para rota V1-19 somente via `allowed_actions.apresentar` (não inventar ação por percentual).
- `src/test/competenciaVisaoGeral.test.tsx`: cobertura do botão condicional quando aplicável.
- `src/routeTree.gen.ts`: manter geração sincronizada de rota pelo TanStack Router.
- `src/test/brand.test.tsx`: adicionar V1-19 ao inventário BRAND e garantir identidade sem paleta paralela.
- `scripts/testc/visual-audit.mjs` e `scripts/testc/visual-audit.test.mjs`: incluir superfície privada V119, passar de **24×4×2=192** para **25×4×2=200** combinações, sem apagar quaisquer cenários nem declarar HML real verificado.
- `docs/frontend/ESTADO_E_RETOMADA_CONTAOS_4_1.md`: checkpoint pós-integração.

**Expressamente proibidos:** `supabase/**`, `src/integrations/supabase/**`, migrations, RLS/RPC/Edge/Auth/Storage, PROD, segredos, `src/styles.css`, assets oficiais da marca, libs/lockfiles, arquitetura global, contratos normativos e arquivos não listados.

## E. Matriz requisitos → teste → evidência
| Requisito | Evidência necessária |
| --- | --- |
| Acesso aprovador/sem permissão | testes 401/403/42501, `allowed_actions.apresentar` false, sem fake empty; HML RLS real identificado como NÃO VERIFICADO se sem fixture |
| Pré-condições e aprovação | `aprovar_apresentacao` mock tipado, mesmo ID/org, confirmação explícita, reread após mutação, nenhum UPDATE direto |
| Registro | `registrar_apresentacao` RPC, key estável, proteção dupla submissão, conflito/erro ambíguo não reenviado, resultado UUID validado |
| Fonte/captura e histórico | resumo fonte `obter_visao_geral_competencia`; não afirmar pacote congelado antes de registro; relatório de auditoria |
| Estilos e identidade | BRAND-01, tokens existentes, logo transparente no cabeçalho, nenhum CSS/paleta paralela, 4 larguras × 2 temas |
| Testes | TDD RED/GREEN, `bunx vitest run --maxWorkers=2` integral, TypeScript, build, lint, Zero-Drift; Teste C 200 combos e capturas |
| Segurança e qualidade | source scope gate 25/25 e 100/97, blob frozen types intacto, CI do mesmo SHA 2 checks SUCCESS, sem segredos/logs sensíveis, rollback PR |

## F. Gates e triagem de backend
- **Lacuna de contrato de backend?** Nenhuma demonstrada: RPCs `aprovar_apresentacao` e `registrar_apresentacao` existem no client congelado e na fonte normativa; `allowed_actions.apresentar` existe no overview. **Nenhuma investigação/mudança operacional de HML autorizada por este PLAN.**
- **Limitação de prévia imutável:** não há RPC certificada de snapshot dry-run no contrato frontend; UX mostrará resumo não imutável e declarará congelamento apenas após `registrar_apresentacao`. Se exigência nova de prévia byte a byte surgir, classificar LACUNA e pedir aprovação antes de backend.
- Gate 1: PR deste PLAN somente docs, 2 checks SUCCESS, integrar após GOV-019 PR #41 verde e integrados.
- Gate 2: `PLANO_ATIVO.json` regular 40/atômicos 000/067, 25 documentos, fonte normativa viva, allowlist exata e CI do PLAN, `VALIDADO`, em commit PR separado e 2 checks SUCCESS.
- Gate 3: BUILD TDD primeiro e Teste C independente, 200 combinações, 2 checks SUCCESS, crivo visual com sessão real classificada honestamente. Integração sem bypass e checkpoint.
- **Aprovação humana BRAND:** não exigida para simples reuso do símbolo oficial, sem alteração direta da marca; a aprovação de GOV-017 é específica à variante SVG e já foi concluída.
- Rollback via PR removendo rota e navegação V1-19, repondo árvore gerada e regressão, sem modificar dados ou pacote imutável no Supabase.

## ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE (OBRIGATÓRIO)
Marcas e Design System: ContaOS Brand v1.0/BRAND-01/atômico 000; preservar SVG transparente GOV-017 e todas as marcas certificadas, cores/tokens, sem hardcodes e nenhuma dependência visual extra. Prioridade reutilizar > estender > criar. Economia: sem reenviar prompt Lovable, GitHub e Supabase existentes, menor delta e nenhum build duplicado. Não alterar backend sob pretexto de frontend, nem classificar Teste C privado não autenticado como PASS real. O crivo de identidade visual é obrigatório após cada módulo.
