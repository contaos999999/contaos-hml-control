# Fase 2 R8: investigação causal do fence de navegação V110/390

## Estado terminal R7, sem certificação

A Fase 2 continua NÃO CERTIFICADA. PLAN R7 #621, BUILD R7 #622 (merge `3638cdd381cb911f6bdc115169891a25479b7a25`), pins do auditor #624 (merge `e1dee125da4fd1b1d75759fc1ed682937edc6a46`) e REQUEST R7 #625 (merge `a3b6c34936a095fdca98bb79c3f21d28ed0e3979`) foram integrados à main protegida. HML READY: `dpl_CRTez9i1BPWHgE7BP7sNwvQoC3hh`, fonte `3638cdd381cb911f6bdc115169891a25479b7a25`.

Zero-Drift pós-REQUEST `43357838939` SUCCESS, LOCK `43357838882` SUCCESS, Fixtures `43358055500` SUCCESS. Auth `43358055422`, attempt 1, job privado `131665158901`, FAILURE. O preflight de unicidade `131664709750` passou. O log confirma 21 casos NAVIGATION FINISH PASS, incluindo V107/390 e V110/1440; V110/390 falhou em `LINKS/LINK_CLICK` destino `SYS04`, após três `GET` `API_REST` `ABORTED`, com `FENCE_DRAIN_TIMEOUT` e `NAVIGATION_INCOMPLETE`. Os 30 casos seguintes não foram executados. A causa raiz ainda NÃO está comprovada.

Artefato privado parcial imutável: `14008077669`, `trilha-a-private-43358055422-1`, SHA256 ZIP `c8153ae6e306ad7fa2129f06302de078e98f4ecbfa116b52f34434f91128a9c3`; `sha256sum --check SHA256SUMS` confirmou `report.json: OK`. Preservar artefato, não inserir dados privados no repositório. R7 consumida; sem rerun, replay, dispatch ou reuso de nonce.

## Investigação obrigatória antes do BUILD

1. Reconstituir a sequência temporal V110/390: rota anterior, clique SYS04, commit de pathname, unmount/remount dos componentes, cancelamentos reais de fetch e eventos CDP `Network.requestWillBeSent`, `loadingFailed`, `Fetch.requestPaused`, `Fetch.continueRequest`, terminalidade, frame/loader/generation e associações pendentes. Comparar com V110/1440, V107/390 e com os logs R6/R7.
2. Inspecionar `createRequestLifecycle` e `drain()` em `scripts/hml/authenticated-visual-audit.mjs`: o drain aguarda `active.size === 0`, `activity.active === 0` e `activity.pendingNetwork === 0` por até 10 segundos. Determinar por teste reproduzível qual contador permaneceu ativo e por quê. O timeout é sintoma, não prova de defeito do auditor nem do produto.
3. Distinguir rigorosamente: (a) requisição abortada pelo app durante navegação legítima mas ainda contabilizada como pendente; (b) requisição efetivamente não terminal ou erro real de rede; (c) associação CDP fora de ordem; (d) remount ou fetch disparado antes/depois do commit da rota. Não inferir causa apenas pela presença de `ABORTED`.
4. Produzir RED determinístico com instrumentação de teste segura e sintética, sem segredos, demonstrando o defeito na mesma sequência de eventos. Preservar no teste as asserções de que falhas reais de transporte, requests não terminais, frame estranho e ausência de provas CDP continuam bloqueantes.
5. Se a causa for produto, propor correção mínima no shell/fluxo de dados com teste DOM e rede. Se a causa for instrumentação, corrigir a máquina de estados de ciclo de vida com prova positiva de terminalidade e testes adversariais. Se não houver causa demonstrável, NÃO iniciar BUILD R8: registrar bloqueio e aprofundar diagnóstico.

## GATE e escopo autorizado

Esta PR é exclusivamente PLAN documental; NÃO altera código, nonce, auditor, workflows, REQUEST, deployment ou configuração. BUILD posterior requer integração deste PLAN, PR própria, testes RED/GREEN e revisão independente. Escopo candidato, sujeito à prova causal: `scripts/hml/authenticated-visual-audit.mjs`, `scripts/hml/authenticated-visual-audit.test.mjs`, e, somente se comprovado defeito de produto, `src/components/layout/ContaOSAppShell.tsx` e `src/test/appShellSidebar.test.tsx`. Mudanças adicionais exigem revisão explícita do PLAN antes do BUILD.

Proibido ignorar `ABORTED`, suprimir `requestfailed`, alterar deadline para mascarar defeitos, zerar contadores, desabilitar fence, aceitar rede não terminal, remover asserções, alterar RLS/RBAC, backend, SQL, Auth, segredos, YAML, lockfile, branch protection ou PROD. Zero-Drift, LOCK, isolamento de organizações e fail-closed são obrigatórios.

## Sequência de entrega e aceite

1. Integrar PLAN R8 por PR protegida com revisão independente, Zero-Drift e LOCK e readback da main.
2. Produzir RED reproduzível e relatório causal verificável; revisão independente da causa e do risco de segurança.
3. BUILD R8 mínimo, testes focais e adversariais, suíte do auditor, Teste C se código de produto for tocado, typecheck, build, Zero-Drift/LOCK e revisão independente sem Critical/Important. Merge protegido e readback.
4. Se houver alteração de produto, publicar somente BUILD R8 aprovado no projeto HML e comprovar READY, SHA, deployment e probe. Se não houver alteração de produto, justificar reutilização do deployment READY anterior e manter pin imutável. Reancorar pins em PR separada somente se necessário.
5. Avançar nonce para `integracao-v1-fase2-nav-20261113-r8` em BUILD aprovado, registrar R7 consumida e amarrar ancestralidade ao PLAN integrado; validar explicitamente os testes de unicidade/nonce.
6. Criar REQUEST R8 isolada de sete chaves, `approved_parent_sha` igual ao HEAD real da main antes da REQUEST, revisão canônica JSON pela identidade exigida no auditor, CI e merge protegidos. Congelar main/HML e aguardar Auth/Fixtures attempt 1 automáticos, sem disparos manuais.
7. Certificar apenas após artefato completo validado (ZIP/CRC, SHA256SUMS, manifesto, schema), 52/52 PASS, `matrixComplete=true`, sessão/MASTER/organização e logout verificados, zero HTTP/transport/page errors, zero mutações bloqueadas, e PR final de certificação integrada à main.

## Regra de parada

Qualquer falha R8 mantém a Fase 2 aberta e consome a nonce respectiva. Nenhum PASS parcial substitui certificação global. Rollback apenas por nova PR protegida.
