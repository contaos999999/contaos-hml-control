# Fase 2 R6: quiescência móvel antes da troca de rota

## Estado e evidência terminal R5

A autorização expressa do titular permanece vigente para concluir e certificar a Fase 2 sem contornar controles. Este PLAN é documental e não executa Auth, fixtures, deploy ou produto.

O BUILD R5 foi integrado pela PR #616 no merge `d268bc1b1620d667e9885337d33eefdc5b8cf8ff`. O REQUEST R5 foi integrado pela PR #617 no merge normal `52598a8e0b6b43b51fdee6ffc3b274a13adb6fea`, com pais `d268bc1b1620d667e9885337d33eefdc5b8cf8ff` e `31311af72a1a41a135f02bbb1d19a977e6482c42`, diff exclusivo do JSON, revisão canônica `5881037572` e checks obrigatórios aprovados.

Fixtures `43294734335` attempt 1 terminou SUCCESS, com preparador SKIPPED. Auth `43294734581` attempt 1 teve preflight `131449896759` SUCCESS e job privado `131450554732` FAILURE. O nativo pré-secrets passou 8/8. O artefato oficial `13980362527`, 2079 bytes, digest `sha256:bf2ae1e54f7ba034ec9d2232ba2b6abceb63d2c4afda927d65f423ed6daf0bf1`, foi registrado antes da aquisição, teve ZIP/CRC válidos, dois membros seguros e `report.json` SHA-256 `aac9f7de346d1f297501802e23815e129b8283f06f7fd54b913c12984a583afa`.

O relatório `contaos.navigation.audit.v3` registrou 32/52 casos: 30 PASS e 2 FAIL, sem erro HTTP de status, page error ou mutação bloqueada. Em V107/390, duas leituras GET REST foram abortadas durante LINK_CLICK→SYS04 e o caso encerrou `NAVIGATION_CASE`. Em V113/390, uma leitura GET REST abortada na mesma troca de rota levou a `FENCE_DRAIN_TIMEOUT`. O logout também ficou false por DRAIN. R5 está consumida, não certifica e não admite rerun, replay ou reinterpretação.

## Diagnóstico a provar e escopo fechado

O contrato atual exige 500 ms sem mudança de rede antes de liberar um controle. As três falhas ocorreram exclusivamente no percurso móvel por menu, depois da validação do controle e no instante da troca de rota. V107 possui duas consultas TanStack que consomem AbortSignal; V113 possui uma, correspondendo à cardinalidade observada. Isso sustenta a hipótese causal de uma leitura tardia iniciada entre a janela mínima de quietude e o clique que desmonta a origem. O RED deve reproduzir a corrida com componentes/observador originais e pedido GET REST atrasado; se não reproduzir, o BUILD não pode avançar por suposição.

PLAN: este arquivo, `PLANO_ATIVO.json`, prefixo aditivo do checkpoint mestre e ledger terminal R5. BUILD posterior: somente `scripts/hml/authenticated-visual-audit.mjs` e `scripts/hml/authenticated-visual-audit.test.mjs`.

O BUILD poderá: tornar parametrizável, com limites fechados, a duração mínima de quietude do observador; exigir uma janela móvel reforçada imediatamente antes do clique de link aberto pelo menu; manter a mesma deadline absoluta de 15 s; avançar a nonce ativa exclusivamente para `integracao-v1-fase2-nav-20261112-r6`; marcar R5 consumida; exigir este PLAN integrado na ancestralidade. Não poderá ignorar `requestfailed`, remover contadores, aceitar aborto, limpar falha, aumentar deadline, repetir caso, alterar aplicação, silenciar console ou fabricar PASS.

Proibido mudar `src/**`, `public/**`, marca, rotas, tipos, dependências/lock, YAML/workflows, backend, SQL, RLS, RPC, Auth, Storage, Edge, deployment, environment, segredo ou PROD. Tipos `8ea7750b75fd9d76b29c36ce7613392e3ab65e19` imutáveis. R1–R5 consumidas. Produto HML `024a232c5bdb717e556d9ff16ca000e1ae65b0cb` e deployment `dpl_FZgy7ARPgbQAbnGVVtbegFi4htXW` permanecem fixos.

## Sequência, RED, GREEN e gates

1. Integrar este PLAN por PR protegida após revisão e Zero-Drift/LOCK, com readback.
2. RED causal: no browser nativo original, abrir o menu móvel, agendar GET REST depois da quietude padrão e provar que o controle antigo libera o clique cedo, produz aborto/erro. Provar separadamente que um aborto verdadeiro continua fatal e que timeout/deadline continuam fechados.
3. GREEN mínimo: o clique do menu móvel só pode ocorrer depois da janela reforçada contínua e da cerca drenada; qualquer mudança reinicia a contagem dentro da deadline original. Nenhum erro é dispensado. Repetir o RED até obter zero aborto, zero timeout e retorno pelo histórico.
4. Teste C/revisão independente: validar o fluxo real de menu, link, retorno, foco, logout, 1440/390 e controles de rede. Testes históricos R1–R5, replay, revisão canônica e invariantes de segurança permanecem verdes.
5. Rodar suítes completas auditor/preparador, nativas 18 + NAV8, produto, lint/formato do delta, typecheck/build/routeTree, Zero-Drift, LOCK e quatro workflows do HEAD BUILD. Revisão final com zero Critical/Important; merge protegido e push checks.
6. Abrir REQUEST R6 isolada, sete chaves, pai igual ao merge BUILD R6. Publicar COMMENT byte-exato no HEAD real: `{"schema":"contaos.single-request.review.v1","request_id":"integracao-v1-fase2-nav-20261112-r6","head_sha":"<HEAD_REAL_DO_PR>","critical":0,"important":0,"decision":"APROVAVEL"}`. Confirmar literal e commit_id por readback antes do merge.
7. Congelar main/deployment até Fixtures/Auth originais attempt 1 terminais. Sem rerun, dispatch, cancelamento, repetição automática ou Auth paralelo.
8. Somente com execução privada real: registrar metadados antes do download; conferir digest, ZIP, CRC, membros, manifesto, schema, hashes, nativas, 52/52 PASS, logout true e zero HTTP/transport/page errors. Emitir certificado apenas por PR final protegida e confirmar readback na main.

## Aceitação, segurança e rollback

O BUILD é aceito somente se a corrida for reproduzida antes da correção, a janela reforçada impedir a corrida sem ignorar falhas e todos os controles anteriores passarem. O resultado final exige 52/52 PASS, logout true, zero erros e certificado integrado. Qualquer nova falha consome R6 e exige novo diagnóstico governado.

Rollback somente por nova PR, sem reativar nonce consumida. Zero-Drift, LOCK, RBAC, RLS, isolamento entre organizações e economia Lovable permanecem obrigatórios. Nenhuma alteração de negócio, deploy ou PROD é autorizada.
