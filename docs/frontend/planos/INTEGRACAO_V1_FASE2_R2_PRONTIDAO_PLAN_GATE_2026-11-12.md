# Fase 2 R2: prontidão real de navegação e diagnóstico fechado

> Execução inline pelo implementador, com revisão independente antes dos merges. Autorização expressa reiterada do titular para concluir a Fase 2 sem perguntas e sem contornar controles. Este PLAN/GATE é anterior ao BUILD e não certifica execução.

**Objetivo:** corrigir o contrato de prontidão do instrumento, preservar a falha R1 e executar um sucessor governado de 52 cenários somente após testes e gates.

**Arquitetura:** manter produto e backend, fonte de autoridade das permissões, inalterados. Aguardar estados finais observáveis da UI e dos menus antes de agir, drenar a cerca original e revalidar contexto. Manter diagnósticos finitos de operação, transporte, cerca e logout para não perder a causa de uma falha.

**Stack:** Node 24, Bun fixado pelo instalador existente, Playwright/Chromium original do CI, React e componentes ContaOS reais. Sem dependências ou YAML novos.

**Especificação:** Issue #604, PLAN Fase 2 #595 e emendas #596/#599/#600; checkpoint #605 integrado em `36a73d483bad43c53823f5bbfa35aa071afdb134`; Fase 1 certificada e oito certificações anteriores preservadas. PRD/Premissas/Arquitetura, 25 fontes canônicas verificadas no backend `5eca44aebead3183e81b5c1af0d1dffa5fb8feb6`, P0/LOCK/Zero-Drift e ADR-DEV-002 permanecem vinculantes.

## Evidência e diagnóstico

R1: AUTH `43157856422`, attempt1, harness `1a7b55cdad67fc2f639fa2abfb5faff04062d08a`; FIXTURES `43157856534` terminal SUCCESS com preparador SKIPPED. Artefato `13917231956`, ZIP 1.496 bytes/SHA256 `f08392462141b97763d9c8c4cf6918dad91a4c7bbb617fe556c4397495ca79a0`; report SHA256 `3d994303537f7e06d3c57b1dc1f1f69c763739edc6194909f331a69ac6cb348c`. Metadata registrada antes do download oficial, ZIP/CRC/membros/manifest/identidade conferidos e revisão independente registrada no #605.

Resultado imutável: 52 esperados, 33 observados, 2 PASS, 31 FAIL, 19 não executados; session/MASTER/organização true, logout false, HTTP 1, páginas 0, mutações bloqueadas 0. Não converter R1 em PASS nem repetir sua nonce.

Constatações comprovadas: 18 falhas LINK/MENU têm entrada e retorno concluídos, portanto falham no segundo clique; 12 STATE falham na validação do pai após voltar. `ready()` admite h1 provisório e “Verificando sessão…” e valida uma única fotografia. Shell libera sua estrutura antes de terminar contexto/RBAC/administração; `count()` imediato não aguarda o controle. O Playwright pode retornar imediatamente para um loadState `networkidle` já alcançado em SPA, sem comprovar o término de novos efeitos React.

O gatilho específico BFCache/visibility e a causa do HTTP 1/cerca em V114 são hipóteses, não fatos estabelecidos. R1 perdeu a causa concreta ao convertê-la em NAVIGATION_RUNTIME e interromper antes do último marcador. Reproduzir separadamente, sem classificar aborts como sucesso ou editar a cerca. Não há defeito de produto comprovado que autorize editar `src/**` neste plano.

## Restrições e arquivos fechados

- PLAN: este documento, adição em `docs/frontend/planos/PLANO_ATIVO.json`, prefixo aditivo de `docs/frontend/ESTADO_E_RETOMADA_CONTAOS_4_1.md` e os dois registros R1 em `docs/frontend/auditorias/integracao-funcional-v1/fase2/`.
- BUILD: somente `scripts/hml/authenticated-visual-audit.mjs` e `scripts/hml/authenticated-visual-audit.test.mjs`.
- Request posterior: somente o JSON original `docs/frontend/auditorias/TRILHA_A_SOLICITACAO_UNICA.json`, sete campos, em PR isolado.
- Resultados/certificado: diretório Fase 2 já autorizado e prefixo aditivo ao checkpoint.
- Proibidos: app `src/**`, rotas geradas, marca/assets/CSS, tipos congelados `8ea7750b75fd9d76b29c36ce7613392e3ab65e19`, dependências/lock, YAML/workflows, backend/SQL/RLS/Auth/Storage/Edge, PROD e aquisição manual de credenciais.
- Preservar funções e validadores nativos originais, sourceOrdering/preflightDrain, políticas de request/response, descarte de PII, proxy/CSP, deadlines e limites. Nenhuma whitelist de erro para obter PASS.
- HML permanece produto `024a232c5bdb717e556d9ff16ca000e1ae65b0cb`, deployment `dpl_FZgy7ARPgbQAbnGVVtbegFi4htXW`, origem exata `https://contaos-41-hml.vercel.app`. Como o produto não muda, não republicar. Confirmar identidade/publicação/SSR/bytes pelos gates originais antes de credenciais. Defeito de produto ou publicação exige outro PLAN prévio.

## Foco da revisão

1. Menu, conteúdo e permissões ainda pendentes após voltar/reload: aguardar estado final, sem fabricar liberação.
2. Permissão negada, controle inexistente ou contexto errado permanentes: continuar FAIL dentro do prazo atual.
3. Novos reads após um `networkidle` antigo: não navegar antes da prontidão e drenagem da cerca original.
4. Falha HTTP, transporte ou CDP: preservar contadores e motivo fechado, interromper quando a cerca falhar.
5. Falha de logout: registrar causa e manter false; fechamento do contexto não equivale a logout.

## Tarefa 1: reprodução anterior à correção

Arquivos de teste: apenas o mjs de testes autorizado; compilações e fixtures temporárias fora de `src/**`.

- [ ] Reproduzir em componentes reais Shell/sidebar/header e V106 a ida/volta/reload com autorização sintética assíncrona controlada. Demonstrar que o estado transitório satisfaz a espera antiga e que a contagem do segundo clique ocorre antes do controle final. Registrar RED, sem login HML.
- [ ] Cobrir separadamente atraso de permissões, atraso administrativo e “Verificando sessão…”, incluindo negação permanente e resposta de contexto anterior, em 1440/390.
- [ ] Reproduzir leitura atrasada/transição com a cerca nativa real em servidor offline. Abort/HTTP/CDP continuam FAIL. Se a causa do HTTP R1 não for reproduzida, registrá-la como desconhecida e acrescentar diagnóstico; não inventar uma correção causal.

## Tarefa 2: prontidão NAV específica e testes

Interfaces nos dois mjs: `navigationObservationReady(surface, observation)` (pura, estado final estrito), `waitNavigationReady(page, fence, surface, path, theme)` (somente observação) e `waitNavigationControl(page, fence, path, width, menu)` (controle existente pronto antes do clique). A admissão privada continua exclusivamente em `runNavigationAudit` após os gates.

- [ ] Escrever testes RED de estado provisório, menus/RBAC atrasados, retorno, reload e contexto inválido. Nenhum teste cria permissão ou altera fonte de produto.
- [ ] Implementar espera condicional de conteúdo e menu final, contexto/organização/rota/tema corretos; aguardar o controle antes de contar/clicar, drenar e revalidar imediatamente antes da ação. Usar os limites atuais de 15 segundos por espera, sem sleeps arbitrários, retry de negócio, login adicional ou aumento de deadlines. Manter `settleVerifiedPage` e a cerca originais.
- [ ] Exercitar o helper real em fixture offline dos componentes originais. Mocks fechados somente de infraestrutura já usada pelos testes nativos (cliente/Auth sintéticos, router, preferência organizacional, adapters RBAC/administração, header quando necessário ao isolamento, copiloto sem IO); o teste de header real usa transporte sintético. Shell/sidebar/menu/V106 e seus estados permanecem reais. Fixture não é prova privada ou RBAC de backend.
- [ ] Acrescentar suplemento nativo NAV ao comando original `--native-guard`, depois das 18 provas originais, com recibo separado `.audit-work/navigation-native-proof.json`, schema `contaos.navigation.native.v1`, modo offline explícito e harness SHA real. Falha do suplemento deve falhar o comando. Não alterar schema, contagens, casos ou resultado das 18 provas originais. Não criar novo caminho de credenciais/CLI/YAML.
- [ ] Confirmar GREEN e regressão completa. Fonte de app igual ao produto aprovado é requisito; defeito real de produto bloqueia este BUILD e exige novo PLAN.

## Tarefa 3: diagnóstico estrito e sucessor único

- [ ] Criar testes RED para falsos PASS, campos extras/getters/proxies, diagnóstico livre, matriz incompleta e logout falso.
- [ ] Versionar apenas o relatório NAV como `contaos.navigation.audit.v2`. Acrescentar operação/subetapa e destino por enums fechados, separação de HTTP status/transportes (sem descartar o contador agregado), snapshot seguro já disponível da cerca e causa fechada de logout. Nunca exportar URLs/requests/respostas/DOM/textos/erros livres/credenciais/IDs nativos. Usar o hash do recibo suplementar NAV; preservar report/manifest R1 e schemas C8 históricos.
- [ ] Emitir marcador fechado da última linha mesmo quando a cerca encerra. Qualquer erro de rede/cerca/logout, diagnóstico não nulo, campo ausente ou um dos 52 casos incompleto impede PASS. Cleanup não reabre cerca nem cria sessão alternativa.
- [ ] Admitir exclusivamente nonce inédita `integracao-v1-fase2-nav-20261112-r2`, operação audit. Marcar R1 consumida e rejeitar R1/manual/C8/nonce desconhecida. Exigir este PLAN integrado como ancestral adicional, além de todos os gates anteriores.
- [ ] Antes das credenciais, conferir os runs R1 originais/attempt1/HEAD, jobs e metadata do artefato por GETs Actions de leitura e conferir o report/ledger selados no commit PLAN. Não redownload privado para autorizar login nem exigir artefato privado como fonte oculta. R1 é FAIL, não zero-Auth. A prova R1 fechada é adicional aos controles existentes.

## Tarefa 4: integração, execução real e certificação

- [ ] Validar duas suítes completas auditor/preparador, lint/formato, quatro workflows do BUILD no HEAD final, 18 nativas originais e suplemento NAV, regressão do produto/1258 testes/typecheck/build/escopo/P0/LOCK/rotas/Zero-Drift conforme CI. Teste C visual N/A porque o produto não mudou; preservar o delta sintético #598 e provas históricas com seus SHAs, sem reclassificá-las como atuais.
- [ ] Revisão independente sem bloqueios; merge protegido e push checks. Depois criar request isolado de sete campos com pai igual ao merge BUILD exato, comentário canônico exato e readback antes do merge.
- [ ] Congelar main/deployment até AUTH e FIXTURES originais attempt1 terminais. Somente sessão normal MASTER pelo workflow original. Sem rerun/dispatch/cancel/replay; preservar R1 como falha histórica. Se novo request falhar, novo PLAN/nonce, nunca reutilização.
- [ ] Registrar metadata real antes de obter o novo artefato pelo transporte oficial. Conferir tamanho/digest/ZIP/membros/manifest/schema/identidades/52 casos/logout/zero erros, leitura independente e nenhuma mutação válida. Artefato NAV continua somente `report.json` + `SHA256SUMS`, sem captura privada.
- [ ] Integrar relatório, matriz, certificado e checkpoint por PR/checks/revisão. Relê-los na main e registrar recibo efetivo. Só então declarar Fase 2 encerrada e certificada. Fases 3–7, ressalvas R01/R02/R03 e V2 não são certificadas por este resultado.

## Rollback e validação técnica do PLAN

Rollback por PR dos dois mjs; sem rollback de dados, sem replay de nonce. Gates PRD/arquitetura/segurança/atômicos V1 001–024, BRAND-01 e NFR 085–096 aplicáveis permanecem: PASS técnico de planejamento, condicionado à revisão, CI e merge prévio. Impacto visual/produto: N/A, fonte intacta. Economia Lovable: GitHub direto e CI existente, sem turn Lovable, backend paralelo ou validações substituídas. O usuário já autorizou execução e resolução automática dos bloqueios; nenhum aceite adicional é solicitado.
