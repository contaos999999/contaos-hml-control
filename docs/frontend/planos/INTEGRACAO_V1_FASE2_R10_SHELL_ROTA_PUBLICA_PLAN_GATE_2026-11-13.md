# Fase 2 R10: remontagem da rota de origem ao sair do AppShell e autoligação de V117

## Estado terminal R9, sem certificação

A Fase 2 continua NÃO CERTIFICADA. Cadeia integrada na `main`:
- PLAN R9: #633, merge `06974978325f54d8e86ca1f27b8e1ec339687b2d` (commit do PLAN `771a3e0`).
- BUILD R9: #634, merge `7dac99000bbe67543e51cb220ee3f7372a7fea7d`.
- REQUEST R9: #635, merge `ccd14b1113cdd24c7ae72bc2cd2a29d7de44bc74`. A revisão canônica é a `5888791638` (última de `contaos9999`/`Edivan5002` no HEAD, conferida pela API antes do merge).

HML sem mudança: `dpl_CRTez9i1BPWHgE7BP7sNwvQoC3hh`, fonte `3638cdd381cb911f6bdc115169891a25479b7a25`.

Execuções:
- Auth `43401890915`, attempt 1. Preflight `131806508325` SUCCESS (ledger v2 validado antes das credenciais). Job privado `131807145427` FAILURE.
- Fixtures `43401890719`: SUCCESS.

Artefato `14027480344` (`trilha-a-private-43401890915-1`, 1896 bytes, retenção até 11/02/2027), metadados registrados antes do download:
- ZIP `sha256:f3e5f1aab6f6a1667f58aa85b18dd1e17b86c4334fd0f6ecde40c5d4e07005f1`, CRC válido, dois membros, `SHA256SUMS` OK.
- `report.json` `fd96cd9713d5e7ab3be2174a33192b145dbdc138516242244eb4967771438860`, schema `contaos.navigation.audit.v4`, `ledgerSha256` `35297ac5…`, `resumeFrom` 30, `harnessSha` `ccd14b1…`.
- Resumo: 19/19 observados, 15 PASS, 4 FAIL, `runComplete=false`, `cumulativeMatrixComplete=false`.
- Sessão, MASTER, organização e **logout `true`**; `fenceDiagnostic` nulo; `transportErrors` 3; `httpErrors` 3; `pageErrors` 0; mutações bloqueadas 0.

| Índices | Casos | Resultado |
|---|---|---|
| 30 | V112/390 | PASS (falhou na R8) |
| 35-38 | V115 e V116 nas duas larguras | PASS. O índice 35 confirma a correção do preflight de `POST` |
| **39-40** | **V117 nas duas larguras** | **FAIL `NAVIGATION_ROUTE`** em `LINK_RETURN_SOURCE`, depois do 9º link (destino V116) |
| 41-44 | V118 e V119 | PASS |
| **45-46** | **V120 nas duas larguras** | **FAIL `NAVIGATION_CASE`**, um `POST` `API_RPC` `ABORTED` em `LINK_CLICK` para `SYS04` em cada largura |
| 47-52 | V121, V122, V123 | PASS |

R9 está consumida, sem rerun, replay nem reuso de nonce.

## Causa de V120 (e do padrão SYS04 desde o R6)

**Evidência da instrumentação R9** (marcadores fechados do job privado):
- endpoint `rpc:obter_visao_geral_competencia` (RPC da própria rota de origem, chamada por `CompetenciaProtocolo` com `AbortSignal`);
- `navigationRequest=NO`, `frame=MAIN`, `documentRequestsSinceClick=0`: não houve navegação de documento;
- abortado 87 ms (1440) e 132 ms (390) depois do clique.

O auditor só clica depois de a rede ficar estável (`waitNavigationControl` → `waitNavigationStable`). Logo o pedido nasceu **depois** do clique, na própria rota de origem, e foi abortado pelo `cleanup` do efeito quando a rota saiu de cena.

**Mecanismo no código** (`src/components/layout/ContaOSAppShell.tsx`):
- o shell decide o layout por `useRouterState(s => s.location.pathname)`;
- no TanStack Router, `location` muda no **início** da navegação, enquanto a árvore ainda renderiza os matches antigos até a nova rota carregar;
- `/selecionar-organizacao` (SYS04) é a única rota de destino interno fora do shell (`rotaSemSidebar`). No clique, `rotaSemSidebar(pathname)` passa a `true` e o shell troca a árvore inteira por `<>{children}</>` enquanto `children` ainda é a página antiga;
- a página antiga é **desmontada e remontada** em outra posição da árvore, o efeito roda de novo (getUser e RPC) e, quando a nova rota é confirmada, milissegundos depois, o efeito é limpo e o pedido abortado.

Isso explica por que todas as falhas desse tipo desde o R6 têm destino SYS04 e por que são intermitentes (dependem de o RPC já ter partido quando a nova rota é confirmada). É um defeito real de produto: remontagem espúria, pedido duplicado e cancelado.

A hipótese só é aceita como causa se o RED de produto (item 1) a reproduzir com o TanStack Router real.

## Causa de V117

V117 é o drawer de requisito sobre a rota de análise (`/competencias/<id>/analise`), que o catálogo mapeia para V116. O link "Análise da competência" de V117 aponta para a **própria rota**. O executor descarta autoligações só por `dest === item.surface`, sem a equivalência V117→V116 que `returnNavigationSource` já usa. O clique não cria entrada nova no histórico, e o `goBack` seguinte volta para uma rota anterior, o que dá `NAVIGATION_ROUTE`. É defeito do harness, determinístico nas duas larguras.

## BUILD R10

1. **Produto (TDD).** Teste novo com o TanStack Router real (`src/test/appShellTransicaoRotaPublica.test.tsx`): uma rota de origem com efeito que conta montagens e inícios de pedido; navegação para uma rota pública com carregamento pendente. RED na `main`: a origem monta duas vezes. Controle: navegação para rota interna monta uma vez. GREEN mínimo no `ContaOSAppShell`: o layout e o efeito de RBAC passam a usar o caminho da rota **renderizada** (último match confirmado), e não o da navegação pendente. Sem mudança visual, de marcação, de rotas, de permissão ou de backend. Os testes atuais do AppShell continuam verdes.
2. **Harness.** Autoligação de V117 descartada pela mesma equivalência V117→V116, com teste. Instrumentação: o detalhe de transporte passa a registrar também o início do pedido relativo ao clique (negativo quando anterior), só número.
3. **Nonce** `integracao-v1-fase2-nav-20261113-r10`, R9 consumida, este PLAN como ancestral.

## Publicação, reancoragem e reexecução completa

4. Publicar somente o merge do BUILD R10 no projeto HML existente, pelo mecanismo canônico já autorizado; comprovar READY, SHA de origem, deployment, assets e probe público.
5. PR de pins: `NAVIGATION_DEPLOYMENT` com o novo SHA de produto e o novo deployment; ledger v3 encadeado ao v2 (`35297ac5…`) com **`SUPERSEDED` de todos os 33 PASS**, `changeSha` igual ao merge do BUILD R10; 52 pendentes e retomada no índice 1. Os 15 PASS da R9 não entram no ledger: são do produto anterior.
6. REQUEST R10 de sete chaves, revisão canônica por último, conferência pela API e merge commit. Auth attempt 1 automática executa os 52 casos; a `main` fica congelada até o fim.
7. Certificação somente com 52/52 PASS no ledger, controles globais (sessão, MASTER, organização, logout, zero erros) verificados nessa execução final e PR de certificado integrada.

## Proibições

Continua proibido:
- ignorar `ABORTED`, suprimir `requestfailed`, zerar contadores, relaxar deadlines ou desabilitar o fence;
- alterar backend, SQL, RLS, RBAC, Auth, Storage, Edge, segredos, YAML, lockfile, branch protection, `types.ts` ou PROD;
- alterar marca, rotas, permissões, marcação visual ou configuração Vercel além do mecanismo canônico de publicação.

Zero-Drift, LOCK, isolamento e fail-closed continuam obrigatórios. PLAN, BUILD, pins e REQUEST são integrados por merge commit. Rollback apenas por nova PR.
