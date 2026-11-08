# ContaOS 4.1 | Trilha A | GATE separado de navegação contextual

Data: 07/11/2026, Bahia. Issue #317. Emenda técnica do plano mestre único, sem nova frente ou certificação. **Estado: GATE documental; RED/BUILD bloqueados até revisão, checks obrigatórios SUCCESS no mesmo HEAD e merge deste GATE.**

## 1. Baseline e evidências anteriores

PLAN #318 integrado no commit `4818e68c17799102e7ef50a8e26659e6ab07aaf2`, HEAD `99248f40a65753c86512f3fe657e4b896036ff35`. Workflows `42432453545` (Zero-Drift/Teste C) e `42432453567` (LOCK-TYPES) SUCCESS nesse HEAD. Merge foi confirmado pelo GitHub. Este GATE não reutiliza esses checks como aprovação do seu próprio HEAD.

Backend normativo `42a737acdcdb17f3b0684e8daf82f042696eb9ea`: snapshot e ack iguais, 25 blobs e catálogo preservados. Contexto canônico previamente lido na execução coordenadora; conferir novamente os blobs antes do BUILD. ZIP mestre original SHA256 `5ee115d12e263d98068288b6bb722f5f303f2d19e1e4c0b5e930e69da03621da` disponível e conferido. Tipos congelados `8ea7750b75fd9d76b29c36ce7613392e3ab65e19` conferidos. Fontes: PRD 01, Premissas 02, Arquitetura 03, Frontend 06 §§9/11/15/16, Zero-Drift 07, NFR 11 e BRAND 19/20; inventário 100/97 preservado, sem renumeração.

Plano mestre: `P0_V1_PLANO_UNICO_AUDITORIA_CORRECAO_CERTIFICACAO_2026-11-05.md`, PLAN #299 e GATE #300. O regular 75/V1-23 continua como tarefa mestre e o requisito transversal de navegação já autorizado permanece dentro da V1. BRAND-01/000 e NFRs de usabilidade/acessibilidade, rastreabilidade e segurança aplicáveis são preservados; nenhuma autorização de avançar versões ou dispensar requisito.

## 2. Hipótese e gate de decisão

A Sidebar usa `Link` do TanStack para o menu comum e `<a href>` para destinos contextuais já existentes. Uma âncora HTML comum não delega a transição ao roteador. A hipótese do PLAN é perda da continuidade da aplicação ao navegar pelo contexto, ainda sem reprodução autenticada em HML. **Não tratar hipótese como defeito visual confirmado por screenshot.**

Os testes legados de AppShell/visualShell substituem `Link` por âncora através de mock global; não podem provar essa transição. Por isso o único novo arquivo de teste autorizado usa o roteador real com histórico em memória e a Sidebar real. Não substituir nem enfraquecer os testes anteriores. Rotas sintéticas somente no fixture de teste, nunca no aplicativo.

Se não houver RED funcional reproduzível, encerrar a hipótese e não modificar produto. Se houver RED, corrigir somente a integração do link contextual ao roteador, preservando href, destino, rótulo, ordem, capacidades retornadas e callback móvel. Não ampliar para refactor de menu, foco global, estado de sessão ou autorização.

## 3. Escopo fechado desta emenda

BUILD posterior pode alterar SOMENTE:
- `src/components/layout/ContaOSSidebar.tsx`;
- `src/test/sidebarRouter.test.tsx` (novo teste real do TanStack).

Documentação desta etapa:
- este GATE;
- `docs/frontend/planos/PLANO_ATIVO.json`;
- `docs/frontend/ESTADO_E_RETOMADA_CONTAOS_4_1.md` para checkpoint após evidência.

A allowlist ativa fica limitada a esses cinco caminhos e ao documento mestre referenciado. O restante do plano mestre permanece histórico, mas não autoriza mudanças de código fora desta subtarefa. **Proibidos:** backend #139, Supabase, Auth, RPC, RLS, Storage, dados, regras de negócio, outras telas, assets, tokens, header/AppShell, menuV1, rotas/routeTree, dependências/lockfiles, workflows, integrações e types.ts. Sem PROD. Nenhuma chamada de rede material nos testes locais.

## 4. Contrato de comportamento e RED → GREEN

Antes do produto, commit RED independente com teste que monta RouterProvider/memoryHistory e Sidebar reais. Validar clique contextual primário e ativação por teclado equivalente ao click nativo: o evento tem navegação de documento impedida pelo roteador, location muda para o destino exato, outlet esperado aparece e estado do layout persistente não é desmontado. O callback de fechamento é chamado uma vez. Cobrir contrato, competência e contratante com destinos e permissões existentes; ausência/revogação de capacidade continua ocultando links. Testar retorno/avanço no histórico do roteador e atualização do contexto sem alterar autoridade de autorização.

Controles negativos: Ctrl/Meta/Shift/Alt e botão diferente do primário conservam semântica nativa (não interceptar como SPA); não inventar handler genérico preventDefault nem atribuir essa cobertura ao navegador/HML. Callback móvel e destino mantêm o comportamento anterior. Sem argumento de que teste unitário com memória comprova scroll/refresh, sessão ou WCAG real.

No GREEN, menor alteração suficiente, reutilizando `Link` já importado e mantendo demais props/classes. Caso TypeScript exija informação de rota, usar contrato tipado dos destinos já existentes; não `any`, não rota nova, não supressão de erro e não editar gerador.

## 5. Validação e revisão

Exigir testes dirigidos reais e regressões existentes de Sidebar/AppShell/visualShell/RBAC, depois suíte Vitest completa, tsc, build, lint/Prettier focal, Zero-Drift, scope gate, Context freshness, P0/version-order, GOV-020 e hash dos tipos. Instalação canônica usa lock congelado no CI; dependências locais não substituem essa prova. Registrar contagens reais, comandos e commits RED/GREEN, sem antecipar totais.

Revisão independente do diff e testes antes de integrar BUILD. No mesmo HEAD final, Zero-Drift, Teste C independente e protect-types devem ser SUCCESS. Se algum FAIL, ler logs e corrigir dentro do escopo; ausência de check não autoriza merge. Teste C é separado, somente leitura, e não altera produto durante a auditoria.

Visual real continua 1440/1280/768/390 × claro/escuro. Provas públicas históricas ficam preservadas nos respectivos HEADs; este GATE não comprova páginas privadas. Navegação autenticada pelo contexto, foco após transição, scroll/refresh/back, header/sidebar persistentes e isolamento continuam exigidos no HML; se indisponíveis, registrar NÃO VERIFICADO. Não interpretar event.preventDefault ou state persistente do fixture como homologação visual.

## 6. Rollback e sequência

Rollback do produto, se necessário: novo commit/PR que restaure apenas Sidebar ao conteúdo anterior, com CI, sem reescrever histórico e sem desfazer gates/evidências. Novo arquivo de regressão é preservado conforme decisão de reversão; não excluir testes para fabricar verde.

Sequência: PLAN #318 integrado → este GATE/revisão/CI/merge → RED commit → BUILD mínimo → GREEN/revisão/CI → Teste C/auditoria → checkpoint integrado. Caso dependência documental da Trilha B ainda esteja bloqueada, executar os testes independentes da Trilha A e registrar somente a dependência privada específica.

Certificação permanece **NÃO VERIFICADA**: 28 rotas + drawer = 29 superfícies/232 casos, 72 itens BRAND, 208 casos privados sem sessão histórica. CRUD global e integração/rastreabilidade/auditoria aguardam certificação visual; V1 não certificada, V2–V5 e PROD bloqueados.

ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE (OBRIGATÓRIO)
Marca: ContaOS Brand v1.0 / BRAND-01; ler 19_IDENTIDADE_VISUAL_OFICIAL_BRAND_1_0.md e 20_PROMPT_000_BRAND_01.md para qualquer alteração frontend. Preservar assets oficiais, ContaOSMarca, Design System e tokens (REUTILIZAR > ESTENDER > CRIAR), componentes e estados; sem hardcodes, redesign ou bibliotecas paralelas. PLAN deve informar baseline visual, riscos e matriz de aceite; BUILD deve manter consistência; TESTE/TESTE C devem provar 1440/1280/768/390 nos temas claro/escuro, acessibilidade, marca e estados, sem alterações durante Teste C. Se prompt não envolver frontend, declarar impacto visual N/A justificado e garantir ausência de alteração visual.
Economia Lovable: checar turno/estado/commit antes de enviar; usar GitHub e Supabase diretamente quando possível; consolidar instruções; executar o menor delta; reutilizar testes/evidências válidos; não reenviar turno pendente nem duplicar builds/scans; nunca pular aprovação humana obrigatória, TDD, segurança, CI, Zero-Drift, fidelidade ao PRD, validação visual ou Teste C separado.
Entregar evidências e classificar: IDENTIDADE VISUAL PASS/FAIL/NÃO VERIFICADO/N/A; ECONOMIA LOVABLE CONFORME/NÃO CONFORME; ZERO-DRIFT PASS/FAIL. Sem prova não declarar PASS.
