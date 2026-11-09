# PLAN C-CHAT-001 — Frontend contextual da Trilha C

Autorização: determinação expressa do titular para execução da Trilha C, correção do Zero-Drift e preservação das Trilhas A e B. Fonte backend: PR contaos999999/develop#179, integrada, com escopo PLAN e não BUILD.

## Escopo estritamente aditivo
- `src/components/copiloto/CopilotoContrato.tsx`: chat contextual com envio de pergunta e sessão por contrato, fontes exibidas, erros recuperáveis e limpeza de estado após troca de organização/contrato/logout.
- `src/components/layout/ContaOSAppShell.tsx`: ponto de montagem já permitido no PLAN anterior; nas áreas autenticadas sob contexto autorizado, sem alterar menus, rotas ou regras das telas existentes.
- `src/test/copilotoContrato.test.tsx`: testes de envio, isolamento de estado e regressão.
- `docs/frontend/planos/PLANO_ATIVO.json`: adição dos três caminhos C, sem remoção de caminhos anteriores nem alterações de permissões do backend.

## Limites e critérios
Nenhuma chamada OpenAI diretamente no navegador. Edge `copilot-query` existente é o único endpoint; JWT, contrato e RLS validados no backend. Nenhuma resposta pode aprovar ou liberar competências. Não duplicar tabelas existentes. Nenhuma alteração em `types.ts`, assets BRAND ou PROD. Zero-Drift, LOCK-TYPES, Vitest, TypeScript e Teste C são obrigatórios. Merge apenas após checks verdes, revisão e prova HML. A PR frontend #377 não certifica OpenAI nem cobertura autenticada das 27 telas.

## Rollback
Reverter os commits do futuro BUILD separado que substituirá a PR histórica #377; sem migração, sem mutação de dados, sem impacto na certificação da Trilha B. Preservar checkpoints e provas anteriores.


ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE (OBRIGATÓRIO)
Sem alterações de marca oficial, tipos gerados, backend ou créditos Lovable.

## Emenda de cobertura contextual, execução autorizada em 08/11/2026

A requisição expressa exige chat nas 27 páginas. A árvore existente contém 28 rotas (24 áreas privadas e 4 de acesso/seleção), além do drawer V117. O BUILD não criará rotas para ajustar contagens. A matriz de Teste C deve mapear cada superfície real, sem promover rotas sem sessão a PASS autenticado.

- Montagem única no AppShell após sessão/organização verificadas, invisível nas rotas de acesso; sem duplicar componentes nas páginas. Menu móvel aberto mantém o painel desmontado, preservando inert/foco da Trilha A.
- Reutilizar resolverContextoRbac para contratos e competências. Em competência, resolver o contrato pela consulta RLS já existente e obter referência autorizada somente se necessária ao filtro temporal já suportado pela Edge. Falha ou contexto obsoleto bloqueia envio.
- Nas listas, cadastros e administração sem contrato na rota, exigir seleção explícita de contrato da organização ativa obtido pela Data API sob JWT/RLS. Não selecionar o primeiro contrato automaticamente. Não carregar lista global de tenants e não enviar id_organizacao ao modelo. O contrato escolhido não é autorização: Edge revalida acesso material em toda pergunta.
- Nenhuma chamada OpenAI sem contrato autorizado. Em ausência de contratos ou permissão, estado informativo com envio bloqueado. Nenhuma busca global nem fallback de autorização.
- Chave de montagem deve incluir revisão de sessão, organização e contexto de rota. Troca de usuário/organização/contrato/competência/logout invalida de forma síncrona requisições e histórico local; resposta tardia não pode reaparecer. Não guardar tokens ou mensagens em localStorage.
- Preservar respostas como texto escapado e fontes/páginas da Edge; informar revisão humana, incerteza e fallback. Não disponibilizar DML, aprovação ou liberação por chat.

## RED/GREEN e provas exigidas para o BUILD posterior

1. Testes de contexto por contrato e competência; estado sem contrato e seletor RLS; lista vazia/403/erro bloqueiam envio; não enviar tenant nem chave OpenAI.
2. Corridas: resposta pendente após troca de organização, contrato, competência, usuário ou logout; descarte verificado após resolução real da Promise, sem assert prematuro. Bloqueio síncrono de duplo envio.
3. Histórico/sessão restritos ao mesmo contexto; fontes e HTML malicioso tratados como texto; fallback/timeout recuperáveis, sem conteúdo anterior em novo contexto.
4. Regressão AppShell/RBAC/menu/teclado e CI completo com tipos imutáveis. Quatro larguras e dois temas; não substituir provas A/B já válidas.
5. HML deve comprovar OPTIONS/CORS de origem exata, JWT ausente/inválido/revogado negados, dois usuários/organizações sintéticos próprios e negativos contrato/sessão/fontes cruzados, OpenAI real e fallback, sem publicar credenciais/PII.
6. Teste C independente do frontend efetivamente servido, com SHA de origem/deployment e screenshots/SHA256. Job documental selecionado sem browser é N/A de escopo e não prova de produto.

## Impedimentos comprovados e ordem

Em c3143edc, Zero-Drift42532656429 e LOCK42532656433 SUCCESS. Implantação Vercel FAILURE por api-deployments-free-per-day; nenhum bypass ou upgrade financeiro automático. Integração e BUILD aguardam resolução do status vermelho. Edge HML v3/JWTtrue não possui geração OpenAI implantada e OPTIONS observado HTTP405 sem CORS; isso impede declarar chat funcional no navegador. Corrigir no repositório backend sob plano próprio da #180 antes da prova autenticada, sem relaxar JWT/RLS ou wildcard CORS.

## Emenda C13 persistente, 09/11/2026: PLAN condicional, BUILD bloqueado

Esta emenda detalha o C13 já autorizado pelo titular e não autoriza Auth, fixtures, implantação ou auditoria por si. A prova API 42571726664 permanece em execução no backend5459536e7f7121e2f26758841acd520f84e0ad9d, Edge v7/JWTtrue. Três turnos reais gpt-4.1-mini com fontes persistidas foram observados, incluindo o nome Plano Aurora no segundo turno. Isso não equivale a API_PASS_UI_PENDING: expiração natural, limpeza independente e recibo POST ainda são obrigatórios. PR379/head dd27b7e2f059cc71cff21c1d4dbe38a24e6d4261 permanece congelada até o encerramento integral dessa prova. Nenhum resultado futuro é presumido.

### Diagnóstico e comportamento previsto

A PR379 implementa perguntar e memória local. Faltam retomada canônica de sessões/histórico paginado, encerramento real, flags e placeholders de conteúdo revogado, revalidação do cache e reconciliação após resposta incerta. O frontend deve consumir exclusivamente as quatro ações autenticadas já existentes de copilot-query: listar_sessoes, historico, encerrar_sessao e perguntar. Não haverá consulta direta às tabelas brutas de chat nem chamada OpenAI pelo navegador.

1. Listar sessões do contrato/contexto autorizado com seleção explícita, página inicial20 e limite máximo50 conforme contrato do servidor, usando somente os cursores devolvidos. Nova conversa limpa a seleção e cria sessão apenas ao enviar. Retomar exige selecionar uma sessão própria. Nenhuma escolha automática da sessão mais recente depois de resultado incerto.
2. Histórico começa nos20 itens mais recentes, exibidos em ordem cronológica; carregar anteriores usa o cursor canônico, antepõe itens com deduplicação por ID e preserva a posição de leitura. Atualizar/reabrir retorna à página recente e permite carregar anteriores novamente. Não usar timestamps do navegador como cursor.
3. Encerrar conversa chama encerrar_sessao, respeita a confirmação canônica e idempotência do backend, e mantém a sessão encerrada somente para leitura. Fechar o painel apenas oculta a interface. Nova conversa é uma ação separada. A UI não apresenta encerramento confirmado enquanto a requisição estiver incerta.
4. Validar os DTOs em runtime, inclusive flags incerteza, conflito_historico e baixa_confianca como boolean|null conforme o contrato; null legado significa desconhecido, nunca certeza. Conteúdo histórico null, fontes removidas e indisponibilidade aparecem como placeholder explícito, sem recompor texto de cache ou inferir flags por regex. Fontes atuais e texto escapado seguem o backend.
5. Reabrir painel, retornar ao primeiro plano e atualizar manualmente ocultam conteúdo/fontes previamente exibidos até nova leitura canônica. Revogação observada ou erro de autorização limpa o cache sensível. Sem evento de revogação, não se promete invalidação instantânea enquanto a tela permanece aberta. Durante pergunta pendente, retorno ao primeiro plano oculta histórico antigo e agenda leitura canônica após seu encerramento, sem repetir a pergunta.
6. Toda ação assíncrona usa a geração de usuário, organização, contrato, competência, revisão de autenticação e sessão selecionada. Troca de contexto/logout invalida síncronamente a geração, aborta transportes e limpa entradas, mensagens, fontes e cursores; Promise tardia não pode restaurar conteúdo. Preservar trava síncrona de envio duplo. Abertura do menu móvel preserva inert/foco existentes e desmontagem já prevista, sem impedir a retomada persistente posterior.
7. O transporte UI terá limite50s para cobrir o deadline45s existente do servidor e5s de margem; nenhum prazo/backend/modelo/quota é alterado. Timeout/erro de rede produz estado de resultado incerto: abort não significa rollback. Reconciliar por lista/histórico, sem retry automático nem reenvio silencioso. Se o primeiro envio não retornar ID, oferecer seleção explícita das sessões próprias; não adivinhar qual recebeu a gravação. Reenvio somente por ação consciente após reconciliação.
8. Estados vazio, carregando, erro, pronto, encerrado e resultado incerto devem ser acessíveis por teclado, com foco/Escape e tokens visuais existentes. Contexto sem contrato autorizado bloqueia todas as operações pertinentes. Preservar o RBAC, a seleção RLS explícita e as regras das Trilhas A e B.

### Escopo futuro fechado e sequência

O futuro BUILD poderá propor somente CopilotoContrato.tsx, a integração contextual já existente em ContaOSAppShell.tsx, copilotoContrato.test.tsx e, se necessário para DTO/transportes, src/lib/copiloto/copilotoApi.ts e src/test/copilotoApi.test.ts. Esses dois caminhos novos são apenas planejados aqui e não são adicionados ao allowlist global nesta emenda. A PR379 deve incorporar a main viva por merge preservando o Shell atual e mudanças A/B, nunca copiar o Shell antigo sobre a main. Resolver conflitos com revisão das diferenças e testes de regressão. Não modificar types.ts, routeTree, rotas, backend, Auth, RLS, schema, dependências, assets/identidade ou PROD.

Ordem: integrar esta emenda documental somente após CI e revisão independente; aguardar API_PASS_UI_PENDING comprovado e limpeza/POST da execução congelada; integrar GATE separado com caminhos fechados e âncoras vivas; produzir RED causal no HEAD de integração da PR379; implementar o mínimo; executar GREEN/regressões/CI e revisão independente; integrar somente com todos os controles aplicáveis; realizar publicação HML e auditoria autenticada sob requisição própria aprovada, com novas fixtures legítimas e limites explícitos. Nenhum destes documentos libera a requisição R5 da Trilha A, reutiliza usuários de prova em quarentena ou transforma reserva de orçamento em autorização UI.

### Testes e comprovação

RED/GREEN deve cobrir DTO válido/inválido, boolean|null e placeholder; listagem/histórico/cursor/retomada após desmontagem; paginação/dedup/posição; encerramento idempotente e nova conversa; troca de sessão/contexto/logout com Promises resolvidas depois da invalidação; revogação com cache ocultado durante atualização; falha de autorização e fontes removidas; timeout seguido de reconciliação sem segundo POST perguntar; foco/menu móvel e contexto atual do Shell. Asserções causais precisam observar o efeito tardio, não só abort chamado. Testes locais de transporte não comprovam eficácia do modelo nem HML.

O inventário real é28rotas mais drawerV117:29superfícies x4larguras1440/1280/768/390 x2temas =232combinações. Rotas de acesso sem sessão são avaliadas conforme seu escopo e nunca chamadas de PASS autenticado. A auditoria deve distinguir navegação, CRUD autorizado e C13, provar o produto servido/deployment e o harness, registrar papel/contexto/fontes, screenshots originais e SHA256, e obter revisão independente das evidências. Preservar as provas A/B com sua origem. PII, fixture ausente, negado, skip ou mera presença do chat não viram PASS integral. Nenhuma certificação C/P0/V1 antes de todos os controles aplicáveis aprovados.

Rollback: reverter apenas commits do futuro BUILD C, preservando integrações A/B e o histórico documental. Não há migração nesta emenda.


## Reconciliação PR379 com main, 09/11/2026, gate pré-BUILD

Base frontend c9dc5e062885793d3ad69430b822c14f3c6f2dc8; backend 5eca44aebead3183e81b5c1af0d1dffa5fb8feb6. API final-readback42596392357 permanece API_PASS_UI_PENDING, sem repetição. PR484 já integrada em451aa3de com as seis correções e gates42645748686/42645748507; preservar seus quatro blobs C13.

Análise dos quatro commits exclusivos:440f3bd é RED histórico;3408283 implementa seleção RLS, contexto temporal, invalidação e montagem transversal;9bc106c adiciona aborto e fontes por resposta, porém seu timeout20s foi superado pelo PLAN450 e transporte50s atual;dd27b7e é merge histórico da main8666086 e não autoriza reaplicar alterações A/B. Nenhum cherry-pick cego nem restauração do componente antigo.

Resíduo funcional confirmado no AppShell: contexto sem identidade da rota pode montar uma instância nova com contrato da rota anterior antes de o efeito limpar o estado. Recuperar somente a identidade da rota resolvida e condicionar montagem à igualdade com pathname. Preservar todo o restante do Shell atual, RBAC, modal/foco/menu e os quatro blobs C13. Recuperar a cobertura contextual perdida em testes afetados, sem restaurar a política obsoleta de retry20s.

Escopo fechado: este documento;PLANO_ATIVO.json;src/components/layout/ContaOSAppShell.tsx;src/test/appShellSidebar.test.tsx;src/test/copilotoContrato.test.tsx;ESTADO_E_RETOMADA_CONTAOS_4_1.md. Todos já allowlisted. Não alterar rotas/routeTree/types/brand/dependências/backend/Auth/RLS/PROD. Atômicos e NFRs aplicáveis herdados do PLAN450: contexto autorizado, privacidade, rastreabilidade, acessibilidade e segurança; não inaugura versão ou requisito novo. Validação técnica PASS de escopo mínimo e compatibilidade com PLAN450 e PR484; não constitui teste ou certificação.

Sequência: commit documental e CI verde antes de BUILD; RED causal de navegação observando mounts durante render e descarte de contexto pendente; GREEN mínimo e testes afetados AppShell/Copiloto. Reconciliação de ancestralidade por merge verdadeiro dos quatro commits, resolvendo conflitos explicitamente pela implementação atual mais o resíduo aprovado. Zero-Drift/LOCK/Teste C exigidos no HEAD final, revisão independente antes de integração. Suítes globais impostas pelo CI não serão executadas outra vez manualmente. Não repetir provas API/HML já válidas. Nenhum deploy autorizado por este gate.

Rollback: reverter somente o delta residual de AppShell/testes/documentação, mantendo as integrações A/B e PR484. Main somente via PR protegido com gates verdes; checkpoint backend138 com HEADs/resultados/pendências. Auditoria autenticada e certificação global continuam pendentes.
