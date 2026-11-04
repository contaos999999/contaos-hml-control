# PROMPT 39 / V1-18 — PLAN de implementação: Parecer interno

**Data:** 04/11/2026 (horário de Brasília). **Estado:** PLAN documental; BUILD NÃO INICIADO.  
**Branch:** `plan/prompt-39-v1-18-parecer-20261104`.  
**Frontend HEAD basal:** `15bf2aa6fab6b4c9e262a7d74b6a2ea422419e1f` (CI frontend `41842635961`: SUCCESS).  
**Normativo HEAD atual:** `contaos999999/develop@a10d3b1a1a14276c017027f93ec2a7aace4d6cb6` (alterações RNF de auditoria com CI `41850409052`: SUCCESS).  
**Fonte original:** `Manual_Mestre_Prompts_4_1_100_PRD.docx`, PROMPT 39, V1-18, e `FE_v4_Manual_Integral_Lovable_Supabase.docx`.  
**PRD:** ContaOS 4.1, matriz 96/96, 84 RF + 12 NFR, 25 fontes canônicas, catálogo 100 prompts e 97 atômicos.  

## A. PROMPT literal e rastreabilidade

**PROMPT regular 39, V1-18 — Parecer interno**: construir tela `/competencias/:id/parecer`, acesso de auditoria/aprovação, consumindo `competencias/resultados` e operações oficiais de análise/parecer do Supabase, com loading, vazio, negado e erro, sem secret, sem update direto de status e sem backend paralelo.

**Atômicos mapeados no catálogo oficial:** `000` BRAND-01; `021` = V1-AUD-002 (diferenciação determinístico/semântico); `022` = V1-AUD-003 (criticidade); `023` = V1-AUD-004 (evidência/fonte/localização/ação sugerida).  
**Requisitos correlatos, sem expansão de escopo:** V1-AUD-001 (reprodutibilidade/contexto de análise), governança de parecer e portão 100%, V1-AUD-005 (histórico e reanálise), NFR-005/007/008/009/010, segregação de funções e rastreabilidade. Não criar requisito novo.  
**Último passo demonstrado:** PROMPT 38/V1-17 (drawer `RequirementDrawer`, teste `requisitoDetalhe.test.tsx`, integração à V1-16). Não reconstruir V1-17.  
**Passo seguinte, após V1-18 certificada:** PROMPT 40/V1-19, Wizard de apresentação, dependente do parecer aprovado e do portão oficial; NÃO iniciar no mesmo BUILD.

## B. Estado e fonte canônica

- O frontend está em `contaos999999/contaos-hml-control/main`; Lovable apenas sincronização/visualização; Supabase HML é o único backend.
- `CONTEXT_CANONICO_4_1_SNAPSHOT.json` referia o commit `cb65f498...`, enquanto o backend normativo avançou a `a10d3b1...`. A árvore atual foi confrontada: **25/25 blobs canônicos idênticos**, catálogo `docs/prompts/PROMPT_TRACKS_4_1.json` blob `e54e49e626e65a9c94c81709180fd192a1f0c079` idêntico. **Apenas o HEAD de referência precisa ser atualizado, sem reescrever regras.**
- Fonte original regular SHA-256 `8a15d96568d021ac86fdd45e79038e2cb969d69c12b2edb84f012a6129b8940e`; atômicos SHA-256 `d9faaae47de4b697b18ad7fb71e4738384514936813cd5b18779f4cb8aed83b8`.
- Types Supabase congelados em blob `8ea7750b75fd9d76b29c36ce7613392e3ab65e19` verificado no HEAD; não regenerar.

## C. Contratos existentes identificados no frontend (não prova de HML autenticado)

1. `obter_visao_geral_competencia(p_id_competencia)` já consumido por `competenciaVisaoGeralDados.ts`. `allowed_actions.abrir_parecer` orienta UX; backend/RLS continua autoridade.
2. Tabela `pareceres_internos` consta no `types.ts`: `id, id_competencia, id_contrato, id_organizacao, autor, texto, status, versao, hash, criado_em, aprovado_por, aprovado_em`. Consultar **com RLS e id_competencia**, por paginação `range` e ordem determinística (`versao` desc, `id` desc); não usar `select('*')`, não assumir existência de linhas.
3. RPC existente `solicitar_parecer_interno({p_id_competencia})` retorna string. Tratar como solicitação e reconciliar por leitura após envio; não inferir que string seja conteúdo de parecer ou aprovação.
4. RPC existente `aprovar_parecer_interno({p_id_parecer,p_aprovar,p_fundamento?})` retorna void; a UI deve exigir confirmação explícita, tratar erro/ambiguidade e recarregar dado autoritativo.
5. **Não há RPC tipada de edição manual de texto** na referência congelada. Não editar `pareceres_internos` pela Data API para contornar governança. Se o fluxo exigir redação/edição no cliente, registrar suspeita e solicitar autorização específica para investigação de backend HML em tarefa separada, sem alterar banco.
6. Não inventar `allowed_actions` específico para aprovação: utilizar as decisões e erros oficiais do backend. Exibir botão condicionado a contexto conhecido apenas como UX; o backend deve recusar perfil inelegível.

## D. Arquivos exatos autorizáveis no BUILD posterior (não alterar agora)

**Criar:**
- `src/lib/competencias/parecerInternoDados.ts`: adapter tipado local (sem alterar `types.ts`), sanitização de erros, paginação e validação fail-closed;
- `src/components/competencias/CompetenciaParecer.tsx`: apresentação, histórico, solicitação e aprovação condicionadas;
- `src/routes/competencias_.$id_.parecer.tsx`: route e metadados `noindex`, SSR desligado como nas rotas protegidas;
- `src/test/competenciaParecer.test.tsx`: RED/GREEN de contrato, permissão, concorrência e UX.

**Alterar minimamente:**
- `src/components/competencias/CompetenciaVisaoGeral.tsx`: substituir somente aba futura Parecer por navegação real, preservando `Apresentação` futura e `allowed_actions.abrir_parecer`;
- `src/test/competenciaVisaoGeral.test.tsx`: regressões de aba, não autorização e status;
- `src/routeTree.gen.ts`: **somente atualização automática pelo gerador TanStack no build**, nunca editar manualmente.

**Proibidos:** `supabase/**`, `src/integrations/supabase/**` (especialmente `types.ts`), `.env*`, `public/**`, `src/components/ui/**`, `src/styles.css`, `package.json`, `bun.lock`, `src/routes/__root.tsx`, Auth, tema/tokens/brand/rotas preexistentes, workflows não previstos, PROD, dados reais. Nenhum commit de backend.

## E. Fluxo da tela planejada

1. Validar UUID antes de qualquer chamada; autenticar `getUser`; obter organização em contexto pelos helpers atuais, nunca por UUID de query isolado.
2. Ler visão geral autoritativa e últimos pareceres RLS; conferir competência/contrato/organização e formatos esperados. Falha de contrato é erro seguro em PT-BR, sem fallback permissivo.
3. Exibir identificação da competência, status do parecer, versão, texto/autor/data/hora e histórico paginado de versões; apontamentos com criticidade, mecanismo e origem podem ser apresentados **somente quando vierem de consultas oficiais já existentes** e não reinterpretados no cliente.
4. Ação **Solicitar parecer** usa apenas RPC oficial, bloqueia duplo clique, mostra estado de processamento e faz uma leitura de reconciliação em caso de timeout ambíguo, sem reenviar mutação automaticamente.
5. Ação **Aprovar ou reprovar**: diálogo de confirmação/fundamento quando aplicável; RPC `aprovar_parecer_interno`, distinção UX entre perfil e autorização real, sem `.update({status})`, sem antecipar status nem liberar apresentação localmente. Se o backend rejeitar por hash obsoleto, perfil ou segregação de funções, refletir mensagem amigável e preservar histórico.
6. Estados exigidos: loading, sem parecer, versão disponível, processamento, sucesso, conflito/versão obsoleta, 401, 403, 404, 409/erro, sessão expirada, acessibilidade, offline/interrupção e correlação de request sem log sensível.
7. Foco/teclado/labels, mensagens `aria-live`, alvos de toque, confirmação com foco restaurado. PT-BR, datas `DD/MM/AAAA`, horários `America/Sao_Paulo`, moeda BRL quando existente.

## F. TDD, segurança e critérios de aceite

| Gate | Teste/critério (o que deve ser comprovado) |
|---|---|
| TDD RED | Testes da rota, parser, histórico, recusa de UUID, RLS-negado simulado, botão desativado e RPC falham antes do código novo |
| TDD GREEN | Testes focados V1-18; preservação dos testes V1-14/V1-16/V1-17, com falha fechada |
| Negativos | UUID inválido = zero chamada; 401/403 não vira vazio; 409 não sobregrava; RPC erro não vira aprovação; double click = uma mutação |
| Autoridade | Não enviar `service_role`, não alterar status crítico por Data API, não inferir 100% nem aprovação |
| Segurança | Sem secret, sem XSS ao exibir parecer, sem dados cruzados por UUID/URL, controle de acesso backend obrigatório |
| Dados | Paginação server-side padrão 25 (limite máximo 100), filtros sem carregamento global; abort de chamadas obsoletas |
| Qualidade | ESLint, prettier, TypeScript, build, suíte total atual, bundle e scan de segurança |
| CI | Scope Gate, Source Freshness, Frontend Zero-Drift, Types Auto-Lock, Teste C independente após BUILD |
| Teste C | 1440/1280/768/390 × claro/escuro, loading/vazio/erro/negado/sucesso, navegação, foco/teclado, contraste e captura SHA |
| HML real | RLS A/B, fluxo de aprovação e segregação de funções com usuários reais autorizados: **NÃO VERIFICADO** até ensaio específico |
| Continuidade | Dossiê V1-18 e checkpoint com HEAD, commits, run IDs, resultados e próxima etapa V1-19 |

A aprovação do PLAN **não** comprova que o backend HML responde, nem autoriza tocar Supabase; testes com mock não devem ser contabilizados como RLS A/B real.

## G. Plano de execução em etapas fechadas

1. Conferir HEADs atuais, CI, blobs 25/25, catálogo 100/97, tipos e REGULAR 39 / atômicos 000,021–023.
2. Publicar PLAN documental e atualizar o snapshot de origem do `develop` (somente commit de referência, sem mudar hashes); CI do PLAN `SUCCESS`; PR e merge sem bypass.
3. Revisar formalmente gates técnicos e somente depois publicar `PLANO_ATIVO.json` `VALIDADO`, referenciando CI documental anterior. Se algum requisito obrigatório estiver sem fonte, permanecer `BLOQUEADO`.
4. BUILD exclusivamente frontend por GitHub: primeiro TDD RED, depois adapter e UI mínimos; CI com dois checks exigidos; sem Lovable BUILD.
5. Teste C independente read-only, capturas em quatro larguras/dois temas e regressões; testes autenticados ficam `NÃO VERIFICADOS` até prova real.
6. Registrar evidências e atualizar checkpoint; próximo PROMPT 40/V1-19 apenas após validação adequada da etapa 39.

## H. Rollback, impedimentos e decisão

Rollback: revert da PR de BUILD por nova PR, nunca force push nem edição de history; backend não é alterado.  
Impedimento específico: edição manual de parecer sem RPC tipada. **Não implementar UI de edição** sem contrato autorizado.  
Impedimento de certificação: dados/sessões HML A/B e aprovação real ainda não comprovados. Não converter mocks em PASS.  
**Decisão deste documento:** `PLAN REDIGIDO`, validação formal/CI e manifesto ativo são gates separados; **BUILD NÃO AUTORIZADO por este documento isoladamente**.

## ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE (OBRIGATÓRIO)

Marca: ContaOS Brand v1.0 / BRAND-01; ler 19_IDENTIDADE_VISUAL_OFICIAL_BRAND_1_0.md e 20_PROMPT_000_BRAND_01.md para qualquer alteração frontend. Preservar assets oficiais, ContaOSMarca, Design System e tokens (REUTILIZAR > ESTENDER > CRIAR), componentes e estados; sem hardcodes, redesign ou bibliotecas paralelas. PLAN deve informar baseline visual, riscos e matriz de aceite; BUILD deve manter consistência; TESTE/TESTE C devem provar 1440/1280/768/390 nos temas claro/escuro, acessibilidade, marca e estados, sem alterações durante Teste C. Se prompt não envolver frontend, declarar impacto visual N/A justificado e garantir ausência de alteração visual.

Economia Lovable: checar turno/estado/commit antes de enviar; usar GitHub e Supabase diretamente quando possível; consolidar instruções; executar o menor delta; reutilizar testes/evidências válidos; não reenviar turno pendente nem duplicar builds/scans; nunca pular aprovação humana obrigatória, TDD, segurança, CI, Zero-Drift, fidelidade ao PRD, validação visual ou Teste C separado.

Entregar evidências e classificar: IDENTIDADE VISUAL PASS/FAIL/NÃO VERIFICADO/N/A; ECONOMIA LOVABLE CONFORME/NÃO CONFORME; ZERO-DRIFT PASS/FAIL. Sem prova não declarar PASS.
