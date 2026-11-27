# PLAN P0 47 · V2-04 Plano de ação

27/11/2026. O [plano executivo #825](https://github.com/contaos999999/contaos-hml-control/pull/825) e o [recibo 46 #837](https://github.com/contaos999999/contaos-hml-control/pull/837) habilitam o regular 47. A [BUILD backend #237](https://github.com/contaos999999/develop/pull/237) e o recibo [backend #238](https://github.com/contaos999999/develop/pull/238) comprovam o contrato HML. Snapshot em `270c2bf56b566d05143a5835e3cc2714769cf74d`, com 25 blobs normativos e catálogo 100/97 sem divergência. [Checkpoint oficial](https://github.com/contaos999999/contaos-hml-control/issues/708#issuecomment-7215362611)

Os seis workflows do candidato documental passaram no HEAD `dbd70ca1fcd6298dc35c86a54b2849b19b0e6254`. [CI do PLAN](https://github.com/contaos999999/contaos-hml-control/actions/runs/45979562816)

## Contrato e integração

- O plano de ação abre em painel lateral no item exato de V2-03. A navegação conserva a rodada, a competência, a organização, a página do ciclo e o foco de retorno. Trocas de sessão, rota e organização cancelam as consultas e descartam os dados anteriores.
- `obter_plano_acao_diligencia_v2` informa páginas, responsáveis, dependências, prazos, prioridades e capacidades, com RLS, papel e atribuição. Usar as situações e a ordenação da fonte oficial. Tratar carregamento, vazio, negação, inconsistência de resposta, erro e recuperação.
- Usar `salvar_tarefa_diligencia_v2`, `submeter_solucao_tarefa_diligencia_v2` e `revisar_solucao_tarefa_diligencia_v2` com versão esperada e chave estável para cada intenção. Em perda de resposta, repetir a mesma chave e o mesmo corpo. A criação e a edição distinguem os tipos canônicos, o tipo complementar, o responsável, o plano, o prazo, a prioridade e as dependências. As operações preservam o apontamento e a rodada de origem.
- Ler a evidência vigente da competência em `obter_documentos_competencia_v115`, conferindo escopo, ID, número e hash. Paginar e oferecer navegação autorizada para a V115. Submeter apenas a versão selecionada. Distinguir evidência pendente, insuficiente, falha, reenvio e revisão humana com fundamento. Conferir o recibo e reler a situação do apontamento e da rodada da fonte oficial. O portão de reapresentação usa a avaliação backend da rodada e a reanálise exigida.
- Usar a preferência existente de notificação para atribuição e alteração de prazo. A preferência específica do papel ativo de um usuário tem precedência quando configurada. Comprovar a trilha de auditoria em V123 com IDs de evento, tarefa e correlação sob a permissão oficial da tela. A prova de transporte e fila usa identidades e dados sintéticos.

## Allowlist fechada da BUILD

- `src/components/diligencias/ApontamentoDiligencia.tsx`
- `src/components/diligencias/PlanoAcaoDiligencia.tsx`
- `src/lib/diligencias/planoAcaoDiligenciaDados.ts`
- `src/test/v2-47-contrato.test.ts`
- `src/test/v2-47-tela.test.tsx`
- `scripts/testc/visual-audit.mjs`
- `scripts/testc/visual-audit.test.mjs`
- `scripts/testc/v2-integracao-visual.mjs`
- `docs/frontend/rca/P0_RCA_ATIVO.json`

## Provas e rollback

- Registrar RCA e obter RED no GitHub com o caso `V2-04 registra o painel do plano de ação no Teste C`. GREEN para os 12 critérios originais, os atômicos 033–036 e as relações I06, I07, I08, I12, C17 e C31 das jornadas J05, J07, J09 e J12. Exigir negações cruzadas por rodada, item, ator, organização, contrato, competência e versão.
- Confirmar efeito único no retry e revalidação após conflito. Preservar o detalhe de V2-03 e o retorno a V2-02. Teste C com componentes de produção e CODE_FIXTURE em 1440, 1280, 768 e 390, claro e escuro, com navegação, teclado, rótulos, foco, mensagens e screenshots. Preservar as regressões cumulativas V1, F2 e V2-01 a V2-03.
- Os gates incluem Zero-Drift, LOCK-TYPES, P0-NR, CI, revisão assistida de Edivan5002 no HEAD exato, merge protegido e readback. Integrar o recibo regular em PR própria após a BUILD. Rollback isolado por PR do incremento, conservando o histórico oficial de tarefas e o acesso a V2-03.

## ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE (OBRIGATÓRIO)

CODE_FIXTURE. LIVE `NOT_RUN`. PROD `NO-GO`.
