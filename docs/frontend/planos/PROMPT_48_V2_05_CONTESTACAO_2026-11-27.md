# PLAN P0 48 · V2-05 Contestação e mapa de evidências

27/11/2026. O [plano executivo #825](https://github.com/contaos999999/contaos-hml-control/pull/825), a matriz de 26/11/2026 e o [recibo 47 #841](https://github.com/contaos999999/contaos-hml-control/pull/841) habilitam este PLAN. O [recibo backend #241](https://github.com/contaos999999/develop/pull/241) vincula o contrato efetivo em HML ao snapshot `6998cf2625c3affe0313e2472ffaa0de78693c3a`, com os 25 documentos e o catálogo original 100/97 preservados. [Checkpoint oficial](https://github.com/contaos999999/contaos-hml-control/issues/708#issuecomment-7221831705)

## Contrato e fluxos

- Abrir V2-05 no apontamento de V2-03. Preservar organização, contrato, competência, rodada, item, navegação e foco. Cancelar leitura anterior na troca de item, rota ou sessão.
- Ler o histórico paginado, versão corrente, recomendação fundamentada, mapa, documentos elegíveis, estado da minuta e capacidades no contrato oficial. Exibir indisponibilidade e negação com bloqueio das ações. Manter histórico e desfechos já registrados com acesso de leitura no contexto autorizado.
- Solicitar a minuta assistida com versão esperada e chave de intenção estável. Exibir a síntese, fundamento, pedido e referências retornados pela fonte oficial. Quando houver fila, refletir o estado informado pelo backend. A minuta e recomendação permanecem sujeitas a decisão humana, com registro de autoria e momento.
- Salvar a nova versão com mapa sustentado por evidência documental elegível, referenciada por versão e página. Exibir arquivo, posição e acesso autorizado à fonte V111 ou V115. Conferir escopo e recibo em leitura após mutação. Tratar retry, conflito, versão superada, evidência revogada e mapa insuficiente. Preservar a revisão como parte do histórico da versão.
- Usar a RPC de revisão com fundamento e versão exata, segundo as capacidades retornadas. Exibir aceite ou devolução e atualizar o item e a avaliação oficial do portão da rodada. Rastrear versão, evidência e decisão em V123 com os identificadores da operação. A integração de escrita do desfecho externo pertence ao regular 77.
- Atômicos diretos 000 e 037–039. Relações I09, I10, I13, I19, C03, C16 e C32. Jornadas J06, J08, J09, J11 e J12.

## Allowlist fechada da BUILD

- `src/components/diligencias/ApontamentoDiligencia.tsx`
- `src/components/diligencias/ContestacaoDiligencia.tsx`
- `src/lib/diligencias/contestacaoDiligenciaDados.ts`
- `src/test/v2-48-contrato.test.ts`
- `src/test/v2-48-tela.test.tsx`
- `scripts/testc/visual-audit.mjs`
- `scripts/testc/visual-audit.test.mjs`
- `scripts/testc/v2-integracao-visual.mjs`
- `docs/frontend/rca/P0_RCA_ATIVO.json`

## Testes e integração

RED no GitHub para `V2-05 registra o painel de contestação no Teste C`. GREEN com casos positivos e negativos de recomendação, minuta, revisão, escopo, mapa, versões e trilha. Validar concorrência, repetição de intenção, perda de resposta, troca de contexto e preservação das telas V2-01 a V2-04 e regressões V1. Teste C em 1440, 1280, 768 e 390 por dois temas, com atualização de estado, teclado, foco, rótulos e screenshots.

A BUILD requer o PLAN integrado, o [preflight de contrato](../auditorias/preflight/V2_PROMPT48_CONTRATO_2026-11-27.json), RCA, Zero-Drift, LOCK-TYPES, P0-NR, Teste C e revisão assistida de Edivan5002 no HEAD exato. Após merge protegido, conferir pais, árvore e blobs e integrar recibo próprio. O rollback do incremento frontend será por PR e preservará o histórico oficial.

## ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE (OBRIGATÓRIO)

CODE_FIXTURE. LIVE `NOT_RUN`. PROD `NO-GO`.
