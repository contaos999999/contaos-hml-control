<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

# ContaOS 4.1 — Regras Constitucionais e Premissas Permanentes

## P0 — PRIORIDADE ZERO: ORDEM DE DESENVOLVIMENTO POR VERSÃO (NOVO, VINCULANTE)

**ANTES de qualquer leitura de prompt, PLAN, GATE, BUILD, revisão, GitHub, Lovable, CI, Supabase ou certificação**, LEIA INTEGRALMENTE: `docs/frontend/governanca/P0_PRIORIDADE_ZERO_ORDEM_POR_VERSAO_4_1.md` e `docs/frontend/governanca/P0_ORDEM_POR_VERSAO_4_1.json`; confirme o checkpoint GitHub e o status de certificação da versão corrente. Esta decisão expressa de 04/11/2026 é **regra constitucional aditiva de PRIORIDADE ZERO** para **sequenciamento e certificação**, sem revogar as demais restrições técnicas, segurança ou aprovações.

**NUNCA mais seguir 00→99 como ordem automática de execução do frontend.** Exigir conclusão integral e certificação da versão anterior antes de mudar de versão: **V1 (43/V1-22, 75/V1-23 + auditoria 00–42) → CERTIFICAR V1 → V2 (44–49,76–77) → CERTIFICAR V2 → V3 (50–55,78–79) → CERTIFICAR V3 → V4 (56–59,80–83) → CERTIFICAR V4 → V5 (60–66,84–89) → CERTIFICAR V5 → TRANSVERSAIS E CERTIFICAÇÃO GLOBAL (67–74 e 90–99) → GO/NO-GO; **PROD só com autorização expressa**.

**Todos os 100 regulares 00–99 e 97 atômicos 000–096 continuam obrigatórios integralmente**, com rastreabilidade e evidência. 000 = BRAND-01; 001–084 = 84 RF distribuídos por versões; 085–096 = 12 NFR transversais. Não marcar um prompt como executado ou certificado somente por aparecer no catálogo, por tela existente ou por mock. O **próximo regular autorizado é 43/V1-22**, depois 75/V1-23; **V1 AINDA NÃO CERTIFICADA**. Não iniciar V2 antes do certificado de V1 com CI e PR efetivamente integrados.

**Controle técnico:** `scripts/p0-version-order-gate.mjs`, autotestes e workflow Zero-Drift. Divergência ou salto de versão = **FAIL/NO-GO sem bypass**. Atualizar a matriz de execução e o checkpoint somente com evidências verificadas. A comprovação operacional RLS HML A/B continua facultativa pós-99 e não bloqueante isolada ao desenvolvimento, conforme decisão anterior; todos os demais controles permanecem.



Ambiente: HML. Supabase oficial conectado: `gklhhhyosgasnyoxlrui`.

## Regras constitucionais

1. Supabase é a única fonte de verdade.
2. Toda tabela de negócio exposta usa RLS e grants mínimos.
3. O frontend nunca recebe secret key, senha de banco ou chave privada.
4. CRUD simples pode usar Data API com RLS.
5. Transições críticas usam RPC/Database Function ou Edge Function autenticada.
6. `PODE APRESENTAR AO CONTRATANTE` somente com 100,00% dos requisitos obrigatórios e aplicáveis conformes.
7. `PODE REAPRESENTAR AO CONTRATANTE` somente com 100% dos apontamentos da rodada tratados.
8. `VALIDADA` somente após parecer final favorável do contratante.
9. Alerta histórico transversal de outro contrato é informativo e não integra o portão de 100% por si só.
10. Documentos não são sobrescritos; nova correção = nova versão.
11. IA não cria obrigação sem fonte, escopo e aprovação humana.
12. Uma tarefa não pode alterar área fora do escopo.
13. Se precisar de algo não autorizado, PARE e explique.
14. Entre alternativas igualmente conformes ao pacote 4.1, usar sempre a que consome menos créditos do Lovable.

## Premissas adicionais permanentes

- Obedecer PRD 4.1, Premissas, Arquitetura, Zero-Drift, matriz 96/96, PROMPT 00–99 e prompts atômicos 000–096.
- HML somente; PROD proibido nesta fase.
- Backend Supabase certificado deve ser consumido, não reconstruído.
- Nenhuma tabela, migration, RLS, Edge Function, Auth, Storage ou backend paralelo sem tarefa/autorização específica.
- Frontend em PT-BR, datas/horas brasileiras e moeda BRL.
- Tooltips acessíveis como componente padrão quando houver ganho real de compreensão, com hover + foco no desktop e alternativa por toque no mobile.
- Tudo deve ser documentado, registrado e versionado no GitHub.
- Design System oficial: Executive Command Center + Audit Workspace.
- Playwright, acessibilidade, responsividade 1440/1280/768/390 e Zero-Drift fazem parte do critério de pronto.
- **Economia de créditos Lovable é regra canônica de execução:** inspecionar e planejar fora do Lovable quando ferramentas diretas do GitHub/Supabase forem suficientes; agrupar instruções compatíveis em um único turno; evitar mensagens, retries, planos, scans ou builds duplicados; não reenviar turno ainda em processamento; preferir GitHub para documentação/diff/rastreabilidade e Supabase direto para inspeção/provas de backend; reservar Lovable para alterações e validações que realmente dependam do editor/runtime/frontend Lovable.
- Economia nunca pode reduzir fidelidade ao PRD, segurança, TDD, Teste C, Zero-Drift, rastreabilidade, cobertura, acessibilidade, responsividade ou critérios de aceite. Se a opção mais barata for tecnicamente inferior ou incompleta, ela é proibida.

## Complemento canônico — ContaOS Brand v1.0 / PROMPT 000

Antes de qualquer alteração de identidade visual, logo, símbolo, cores, tipografia, favicon, PWA, sidebar, login, header, tokens, manifest, metadata ou aplicação de marca, o agente deve ler integralmente no repositório `contaos999999/develop`:

- `19_IDENTIDADE_VISUAL_OFICIAL_BRAND_1_0.md`;
- `20_PROMPT_000_BRAND_01.md`.

O `PROMPT 000 / BRAND-01` é transversal e exclusivamente visual. Os prompts 001–096 permanecem os 96 prompts PRD/NFR existentes, sem renumeração, e a cobertura funcional permanece 96/96.

Regras obrigatórias para BRAND-01:
- executar PLAN antes de BUILD e aguardar aprovação do PLAN;
- utilizar apenas assets oficiais da ContaOS Brand v1.0;
- integrar a marca ao Design System existente, sem criar sistema paralelo;
- preservar integralmente rotas, conteúdo funcional, permissões, regras de negócio, estados, cálculos, integrações e backend;
- não usar a tarefa visual para refatorar ou corrigir área não relacionada;
- validar 1440 / 1280 / 768 / 390, dark mode, acessibilidade, favicon e PWA;
- executar a fase TESTE sem alterar código;
- se qualquer necessidade ultrapassar o escopo visual, PARE e reporte LACUNA ou CONFLITO;
- em conflito estético com arquitetura, comportamento ou Design System, o pacote 4.1 prevalece.


## LOCK-TYPES-01 — tipos Supabase congelados, proteção obrigatória

- O código `src/integrations/supabase/types.ts` é **imutável** no blob Git `8ea7750b75fd9d76b29c36ce7613392e3ab65e19`, certificado no commit `ad0b933943d4b69f7a9f23f203e4cff1211b4902`. Não editar, regenerar, substituir, formatar ou reescrever esse caminho em nenhum PLAN, BUILD, TESTE ou auditoria.
- A ferramenta Lovable pode regenerar tipos por mecanismos internos; isso **não equivale a autorização**. Antes de declarar qualquer gate PASS, conferir `git hash-object src/integrations/supabase/types.ts`. Havendo drift, restaurar o blob imutável e comprovar novo SHA e CI. Nunca mudar a constante do verificador para esconder drift.
- O workflow `.github/workflows/contaos-types-autolock.yml` detecta drift e, quando necessário, **propõe reparo exclusivamente por branch e PR com CI**, sem push direto, sem bypass e sem merge automático na `main`. A execução limpa do workflow (run 41762615464) e o fixture de restauro foram aprovados; a criação efetiva de PR pelo bot após drift real **não foi testada**. Falhas exigem tratamento, nunca silêncio.
- O frontend consome apenas o Supabase HML oficial; não criar backend paralelo, não desconectar integração, não tocar PROD e não usar geração de tipos como justificativa para migration sem autorização.
- Mudança legítima de tipos só mediante mudança formal de contrato/schema, atualização rastreável do blob certificado, validação de todos os usos, CI e Teste C independente. Ver `docs/frontend/LOCK-TYPES-01.md`.


## ADR-DEV-001 — GitHub como editor canônico do frontend (APROVADA EM 03/11/2026)

- **Decisão expressa do responsável:** programar, corrigir e testar o frontend React/TypeScript **diretamente no GitHub** `contaos999999/contaos-hml-control`, com branch/PR quando viável, commits rastreáveis e CI. O agente de desenvolvimento do Lovable deixa de ser necessário para BUILD.
- **Supabase HML** `gklhhhyosgasnyoxlrui` continua backend exclusivo; migrations/RLS/RPC/Storage/Edge são governados por `contaos999999/develop` com testes. **PROD proibido** nesta etapa.
- **Lovable permanece conectado exclusivamente para sincronizar e visualizar** o projeto (e inspecionar quando realmente necessário). Não solicitar IMPLEMENTAÇÃO/BUILD ao agente Lovable nas próximas correções. Mudança espontânea de plataforma não é autorização, tratar como drift.
- Fluxo: identificar prompt/atômicos → PLAN → código GitHub → TDD RED/GREEN → lint/typecheck/testes/build/segurança → Zero-Drift e hash bloqueado do `types.ts` → Teste C independente, visual 1440/1280/768/390 claro/escuro → registrar evidências/commit por prompt. CI e MOCK não substituem E2E autenticado.
- Não forçar push nem reescrever histórico sincronizado com Lovable. Proteger escopo e a marca BRAND-01. Só pedir intervenção por impedimento externo ou risco que exija autorização distinta.
- **Continuidade entre chats:** o registro mestre de retomada é `docs/frontend/ESTADO_E_RETOMADA_CONTAOS_4_1.md`. No início de novo chat, **ler os HEADs atuais nos dois repositórios antes de agir**; depois ler o registro e as matrizes de evidência. Não confiar apenas na memória do chat.
- Detalhamento: `docs/frontend/ADR-DEV-001-GITHUB-DIRETO.md`.


## ADR-DEV-002 — Rito formal obrigatório para TODA correção frontend

1. **PROMPT**: identificar critério original/atômicos e FAIL real; registrar baseline e fontes.
2. **PLAN**: redigir plano por prompt com lista fechada de arquivos, dados, UI, testes, rollback; backend/RLS/RPC/Auth/Storage/schema, PROD e `types.ts` expressamente PROIBIDOS.
3. **VALIDAÇÃO DO PLAN ANTES DO BUILD**: conferir PRD 4.1, arquitetura, NFRs 000–096, BRAND-01, segurança, Zero-Drift, TDD, impacto mínimo, CI e Teste C. **QUALQUER gate FAIL/NÃO VERIFICADO aplicável = NÃO IMPLEMENTAR.** Em caso nominal e sem aprovação humana específica, aprovar tecnicamente e registrar no GitHub; para BRAND-01 e outras aprovações obrigatórias, solicitar aceite explícito.
4. **COMMIT DOCUMENTAL PRÉVIO**: criar `docs/frontend/planos/PROMPT_...md` e marcar `docs/frontend/planos/PLANO_ATIVO.json` `VALIDADO` antes do BUILD; esperar CI verde do plano. A CI reprova fonte de app sem plano validado **no commit de base**.
5. **BUILD**: alterar somente caminhos allowlisted, via GitHub direto, TDD RED/GREEN. Se precisar mudar escopo ou backend, **PARAR** e revalidar o plano, sem executar mudança proibida.
6. **TESTES E TESTE C**: CI, lint, tipos, build, regressão, segurança, hash tipos certificado, 4 larguras × 2 temas, acessibilidade, estados, Teste C independente e imutável. Evidência MOCK ≠ E2E real.
7. **REGISTRO E RETOMADA**: commit/testes/evidências por prompt e `ESTADO_E_RETOMADA_CONTAOS_4_1.md` atualizado.

Norma detalhada: `docs/frontend/ADR-DEV-002-PROMPT-PLAN-GATE-BUILD-TESTEC.md`. O backend `contaos999999/develop` **não deve ser alterado por tarefas exclusivamente frontend**.


### ESCALONAMENTO DE LACUNA REAL DE BACKEND (APROVAÇÃO HUMANA)

- Durante o frontend, se surgir **possível** problema de backend, DOCUMENTAR evidência obtida no frontend e **PARAR**. Antes de migrar o foco para `contaos999999/develop` e investigar Supabase HML, **pedir e receber autorização explícita do usuário**; sem ela, somente frontend, nenhuma inspeção técnica de schema/RPC/RLS nem modificação backend.
- Autorizado, investigar backend **somente leitura** e confirmar a lacuna REAL. Se falso alarme, registrar e retomar frontend. Se real, abrir PROMPT + PLAN backend, validar contra PRD 4.1, premissas, PROMPTs 00–99, atômicos 000–096, BRAND-01/NFRs/Zero-Drift/auditoria/fontes. Só após gate PASS (e autorização adicional quando requerida), BUILD limitado no Supabase HML com testes, CI e certificação individual. Registrar GitHub e retornar frontend.
- Backend tem autoridade absoluta sobre regras de acesso, cálculos e dados, sem fallback frontend. PROD e alteração de `types.ts` continuam proibidos. Ver `docs/frontend/ADR-DEV-002-PROMPT-PLAN-GATE-BUILD-TESTEC.md`.


## GOV-004 — Proteção atual da main (evidência oficial)

- Fonte: `https://github.com/contaos999999/contaos-hml-control/rules/26495643`; ruleset `ContaOS-Zero-Drift-main` **ACTIVE** na branch padrão, conforme auditoria GOV-004 em 04/11/2026.
- Exigir PR e dois checks: `ContaOS Frontend Zero-Drift` e `Auditoria de navegador independente (somente leitura) / ContaOS Teste C Independente`; **0 aprovações de PR** por decisão do responsável, sem revisor convidado. Não confundir essa regra de branch com aprovações humanas específicas exigidas por outros gates do PRD/BRAND-01.
- Proibir exclusão, force push (non-fast-forward) e bypass amplo (`bypass_actors=[]`, `current_user_can_bypass=never`).
- GOV-004: T02 escrita direta bloqueada HTTP 409; T03 merge de CI FAIL bloqueado HTTP 405; T04 PR #15 com CI verde e zero revisões mesclado. Force push/exclusão comprovados por configuração ACTIVE, **não por ensaio destrutivo na main**.
- Rastreabilidade: `docs/frontend/auditorias/GOV_004_CERTIFICACAO_BRANCH_2026-11-03.md`, PR #15 e issue #16. Autenticado HML A/B não integra essa auditoria.


## GOV-020 — geração determinística das rotas TanStack (obrigatório)

- O arquivo `src/routeTree.gen.ts` é gerado automaticamente pelo TanStack Router, **nunca deve ser editado manualmente** nem removido do versionamento para contornar drift.
- Em qualquer PLAN que inclua criar, remover ou renomear `src/routes/**`, incluir explicitamente na allowlist a saída `src/routeTree.gen.ts` e a prova GOV-020; registrar por PR o arquivo da árvore gerada pelo `bunx vite build`, no mesmo commit/BUILD autorizado.
- O CI executa `node --test scripts/route-tree-drift-gate.test.mjs` e `node scripts/route-tree-drift-gate.mjs` **depois da geração e antes da regressão longa**. Divergência do gerador significa FAIL; o CI não corrige, não comita e não faz push.
- O Teste C independente repete a verificação após iniciar Vite dev e mantém o gate final de árvore de trabalho inteiramente limpa; não substituir nenhum dos dois checks ou flexibilizar o Zero-Drift.
- Casos negativos obrigatórios: nome/ordem alterado, árvore excluída e arquivo não versionado devem retornar FAIL. Todos os demais gates de PLAN, escopo, fonte canônica, Brand v1.0, `types.ts`, segurança e CI permanecem ativos. Ver `docs/frontend/governanca/GOV_020_GERACAO_DETERMINISTICA_ROTAS_2026-11-04.md`.
