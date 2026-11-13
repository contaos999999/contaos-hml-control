# Fase 2 R7: fechamento do menu móvel somente no commit da rota

## Estado terminal R6

A Fase 2 permanece não certificada. O BUILD R6 foi integrado pela PR #619 no merge `70179cf4b8cb36a0a2d9a19134cf0b13a59deeaf`. A REQUEST R6 foi integrada pela PR #620 no merge `7c3a8fda149d705adb906b1f10a53e20869018cc`, com diff exclusivo do JSON, revisão canônica `5884323862`, Zero-Drift/LOCK da PR e pós-merge aprovados. Fixtures `43339435100` terminou SUCCESS e Auth `43339435026` attempt 1 teve preflight `131603750091` SUCCESS e job privado `131604313438` FAILURE.

O artefato oficial `14000041669`, nome `trilha-a-private-43339435026-1`, 1770 bytes, foi registrado antes do download com digest `sha256:ee9bd6b955b11b88a9fbd84e5d2b89d0fdaaaea95be74d43519d9c658335f566` e retenção até `2027-02-11T00:44:18Z`. O ZIP conferiu digest, CRC e dois membros seguros. `SHA256SUMS` confirmou o `report.json` em `7b2ad73ade4d61441a9033e2faf897fe7e59ca0376eda2cdad559f7157eeafaa`.

O relatório `contaos.navigation.audit.v3` registrou 20/52 observados, 19 PASS e um FAIL. Sessão, MASTER e organização foram verificados; houve zero erro HTTP de status, page error e mutação bloqueada. V107/390 falhou em `LINK_CLICK` para SYS04 com duas leituras GET REST abortadas e `FENCE_DRAIN_TIMEOUT`. A matriz foi interrompida e logout ficou false. R6 está consumida e não admite rerun, replay ou reinterpretação.

## Causa provada e hipótese mínima do BUILD

Os logs mostram V107/1440 PASS às `01:05:16Z`; em V107/390, as duas leituras GET REST surgem imediatamente após `LINK_CLICK` às `01:05:27Z`, são abortadas juntas e a cerca expira. A cardinalidade coincide com as duas leituras da página V107. O reforço R6 comprovou que não existia leitura pendente antes do clique, portanto a origem é posterior à liberação do controle.

O shell móvel chama `setMovelAberto(false)` no `onClick` do link enquanto o `pathname` ainda é V107. Esse fechamento antecipado produz um commit intermediário da árvore antiga antes de o roteador confirmar SYS04. O próprio shell já possui a distinção `fechamentoPorNavegacao` e um efeito dependente de `pathname` que fecha o menu, mas o handler móvel fecha antes desse efeito. Desktop não percorre esse ramo e passou. A correção mínima é marcar a intenção de navegação no clique, manter o diálogo aberto e deixar exclusivamente o commit do novo `pathname` fechá-lo. Escape, botão Fechar e mudança para desktop continuam fechando imediatamente e restaurando foco como hoje.

## Escopo e proibições

PLAN/GATE documental: este arquivo, `PLANO_ATIVO.json`, prefixo do checkpoint mestre e ledger terminal R6. BUILD posterior, após integração deste plano:

- `src/components/layout/ContaOSAppShell.tsx`;
- `src/test/appShellSidebar.test.tsx`;
- `scripts/hml/authenticated-visual-audit.mjs`;
- `scripts/hml/authenticated-visual-audit.test.mjs`.

O produto poderá somente substituir o fechamento antecipado dos links móveis por um marcador de navegação e deixar o efeito de `pathname` concluir o fechamento. O auditor poderá somente avançar a nonce para `integracao-v1-fase2-nav-20261113-r7`, marcar R6 consumida e exigir o SHA deste PLAN integrado. Nenhum aborto, requestfailed, contador, cerca, deadline ou erro poderá ser ignorado, reclassificado ou limpo.

Proibido alterar backend, SQL, RLS, RPC, Auth, Storage, Edge, tipos congelados, dependências/lock, YAML/workflows, rotas, marca, permissões, organização, deployment, environment, segredo ou PROD. O produto HML atual permanece `024a232c5bdb717e556d9ff16ca000e1ae65b0cb` até existir BUILD de produto aprovado, publicado no projeto HML existente e comprovado por identidade pública. R1–R6 estão consumidas.

## RED, GREEN, Teste C e integração

1. Integrar este PLAN/GATE por PR protegida, revisão independente, Zero-Drift e LOCK, com readback da `main`.
2. RED de produto com o AppShell real: abrir o menu móvel, clicar em link e provar que a implementação atual remove o diálogo antes de qualquer commit de `pathname`, expondo a árvore da rota antiga. O teste deve observar comportamento DOM, não texto-fonte nem mock do handler.
3. GREEN mínimo: no clique, registrar a navegação sem fechar o diálogo; antes da mudança de `pathname`, o diálogo e o fundo inerte permanecem; após rerender no novo `pathname`, o efeito fecha o diálogo, restaura overflow e não devolve foco à rota antiga. Escape, botão Fechar e breakpoint desktop permanecem verdes.
4. RED/GREEN do auditor: R6 deve ficar histórica e rejeitada; R7 exige este PLAN ancestral. Abortos GET/POST, timeout, deadline, fence e requestfailed continuam fatais. Não adicionar retry de caso ou tolerância de transporte.
5. Rodar suíte focal AppShell/auditor, produto completo, auditor/preparador completos, Teste C, typecheck, build, lint/formato, routeTree, nativas 18 + NAV8, Zero-Drift e LOCK. Revisão independente exige zero Critical/Important antes do merge protegido.
6. Publicar somente o merge BUILD aprovado no projeto HML existente, sem alterar configuração além do mecanismo canônico já autorizado; comprovar READY, source SHA, deployment, módulos/assets e probe público. Reancorar os pins do auditor somente por PR subsequente se o protocolo exigir SHA/deployment novos, sem executar Auth antes dessa integração.
7. Criar REQUEST R7 isolada com sete chaves e `approved_parent_sha` igual ao merge BUILD final. Publicar revisão COMMENT JSON canônica byte-exata ancorada ao HEAD real; ler corpo e `commit_id` antes do merge. Congelar `main` e deployment até Fixtures/Auth attempt 1 terminais, sem rerun, dispatch ou cancelamento.
8. Registrar metadados do artefato antes do download. Certificar somente com ZIP/CRC/manifesto/schema/hashes válidos, 52/52 PASS, `matrixComplete=true`, logout true, sessão/MASTER/organização verificadas e zero HTTP/transport/page errors e mutações bloqueadas. O certificado exige PR final protegida e readback na `main`.

## Rollback e aceitação

Rollback somente por nova PR. Se o RED não provar o fechamento pré-commit, o BUILD fica bloqueado e a hipótese deve ser revista. Se qualquer teste ou execução HML falhar, R7 é consumida e a Fase 2 permanece aberta. Zero-Drift, LOCK, RBAC, RLS, isolamento entre organizações, segurança de foco e evidência privada imutável são condições de aceite, não itens opcionais.
