# PLAN P0 49 · V2-06 Assistente de reapresentação

27/11/2026. O [plano executivo #825](https://github.com/contaos999999/contaos-hml-control/pull/825), a matriz de 26/11/2026 e o [recibo 48 #844](https://github.com/contaos999999/contaos-hml-control/pull/844) habilitam o regular 49. O [recibo backend #244](https://github.com/contaos999999/develop/pull/244) comprova o contrato aplicado em HML e vincula o snapshot `369c9b9640cb06963eda3878685417d1c815d763`, com 25 documentos e catálogo 100/97 preservados. [Checkpoint oficial](https://github.com/contaos999999/contaos-hml-control/issues/708#issuecomment-7223249635)

Os seis workflows do candidato documental passaram no HEAD `84169394f56b0e5a4259719956f78429328a95bc`. [CI do PLAN](https://github.com/contaos999999/contaos-hml-control/actions/runs/46033687040)

## Contrato e navegação

- Abrir `/diligencias/:cicloId/reapresentar` a partir de V2-02 com retorno ao ciclo. Manter o contexto da organização, contrato, competência e rodada. Reusar o cliente, as verificações de escopo, sinais de cancelamento e leitura do protocolo V120.
- Mostrar o portão oficial e os estados de carregamento, bloqueio, autorização, recuperação e conclusão. Solicitar liberação humana fundamentada. O servidor exige que a rodada esteja tratada e a reanálise corresponda ao contexto vigente. O wizard separa verificar, liberar e registrar. Não presumir liberação nem estado após resposta perdida. Confirmar a situação na releitura antes de oferecer nova liberação.
- Registrar protocolo e forma da reapresentação com chave estável por intenção. Vincular como comprovante somente arquivo já aprovado e consultável no contrato, quando informado. O backend congela o pacote e grava a nova apresentação. Confrontar o recibo retornado com ciclo, competência, tipo, rodada e hash dos pacotes. Preservar e distinguir o protocolo anterior. Exibir referências do novo protocolo, pacote, competência e ciclo. Comprovar os identificadores em V123. A linha do tempo V2-08 será comprovada integralmente na fatia responsável.
- Provar os atômicos 000 e 037–039 conforme o consumo da contestação aprovada. Relações I11, I12, I13, I14, I15, C04, C24, C25, C26 e C33.

## Caminhos autorizados na BUILD

- `src/routes/diligencias_.$cicloId_.reapresentar.tsx`
- `src/routeTree.gen.ts`
- `src/components/diligencias/CicloDiligencia.tsx`
- `src/components/diligencias/ReapresentacaoDiligencia.tsx`
- `src/lib/diligencias/reapresentacaoDiligenciaDados.ts`
- `src/test/v2-49-contrato.test.ts`
- `src/test/v2-49-tela.test.tsx`
- `scripts/testc/visual-audit.mjs`
- `scripts/testc/visual-audit.test.mjs`
- `scripts/testc/v2-integracao-visual.mjs`
- `docs/frontend/rca/P0_RCA_ATIVO.json`

## Testes e integração

RED `V2-06 registra a rota de reapresentação e sua prova visual`. A árvore TanStack é gerada pelo Vite e conferida no CI. GREEN com portão bloqueado, liberação, autorização, concorrência, idempotência, reanálise, escopo, recibo, histórico anterior e navegação. Teste C em 1440, 1280, 768 e 390 nos dois temas, com estados, teclado, foco, rótulos e capturas. Preservar as regressões V1 e V2-01 a V2-05.

O [preflight](../auditorias/preflight/V2_PROMPT49_CONTRATO_2026-11-27.json), RCA, regressões, Zero-Drift, LOCK-TYPES, P0-NR, Teste C e revisão assistida de Edivan5002 no HEAD exato condicionam a BUILD. Conferir pais, árvore e blobs após merge protegido e integrar recibo próprio. Rollback por PR do incremento, preservando os registros emitidos.

## ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE (OBRIGATÓRIO)

CODE_FIXTURE. LIVE `NOT_RUN`. PROD `NO-GO`.
