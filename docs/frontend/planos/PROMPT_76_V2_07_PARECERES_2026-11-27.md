# PLAN P0 76 · V2-07 Pareceres do contratante

27/11/2026. O [plano executivo #825](https://github.com/contaos999999/contaos-hml-control/pull/825), a matriz de 26/11/2026 e o [recibo 49 #847](https://github.com/contaos999999/contaos-hml-control/pull/847) habilitam o regular 76. O [recibo backend #247](https://github.com/contaos999999/develop/pull/247) confirma o contrato aplicado em HML e fixa o snapshot `471da904421768743edf2a9114611af3a0f03439`. [Checkpoint oficial](https://github.com/contaos999999/contaos-hml-control/issues/708#issuecomment-7228564614)

## Contrato e navegação

- Abrir `/competencias/:id/pareceres-contratante` por V2-01 e pelo protocolo V120. Vincular o contexto inicial à apresentação exata quando a origem for V120. Confirmar organização, contrato, competência, vínculo e sessão antes de aceitar a apresentação. Disponibilizar a apresentação e seu protocolo original ao consultar o parecer.
- Exibir consultas paginadas de pareceres e apresentações no escopo vigente. Pareceres têm chave UUID, referências de organização, contrato, competência, ciclo, apresentação, arquivo e ator, classificação, datas de emissão e recebimento, número e metadados de extração. O preflight lista constraints, índices e grants. Preservar RLS e checagem servidor. As mutações passam pelo RPC `registrar_parecer_contratante`. As consultas de extração passam por `obter_processamento_parecer_v2`. O cliente não acessa a fila de forma direta.
- Reusar a autorização, envio privado, retomada e confirmação do adaptador de documentos. Verificar aprovação do arquivo e o escopo exato antes do registro. Na perda de resposta, preservar os dados da intenção e reenviar apenas o mesmo pedido, conforme a garantia idempotente do backend. Bloquear envio simultâneo e descartar respostas obsoletas após rota, sessão ou organização mudarem.
- Registrar classificação, indicação de parecer final favorável, número, data de emissão e prazo. Exibir retorno de aprovação, espera de análise do arquivo, conflito e falha. Apresentar o ciclo e seu prazo quando houver rodada, com acesso a V2-02 e aos apontamentos do mesmo ciclo em V2-03. Exibir fila enfileirada, em processamento, concluída, falha, cancelada ou indisponível e atualização sob demanda. Parecer final favorável pode dispensar extração. Preservar a leitura de registros legados sem apresentação.
- Provar os atômicos 000 e 025–032. Jornadas J02, J03, J04, J05 e J12. Relações I03, I04, I05, I16, C08, C09, C10 e C30. A integração material com a linha do tempo fica condicionada à entrega do regular 77.

## Caminhos autorizados na BUILD

- `src/routes/competencias_.$id_.pareceres-contratante.tsx`
- `src/routeTree.gen.ts`
- `src/components/diligencias/DiligenciasCompetencia.tsx`
- `src/components/competencias/CompetenciaProtocolo.tsx`
- `src/components/diligencias/PareceresContratante.tsx`
- `src/lib/diligencias/pareceresContratanteDados.ts`
- `src/test/v2-76-contrato.test.ts`
- `src/test/v2-76-tela.test.tsx`
- `scripts/testc/visual-audit.mjs`
- `scripts/testc/visual-audit.test.mjs`
- `scripts/testc/v2-integracao-visual.mjs`
- `docs/frontend/rca/P0_RCA_ATIVO.json`

## Testes e integração

RED `V2-07 registra a rota de pareceres e sua prova visual`. A árvore TanStack é gerada pelo Vite e conferida no CI. GREEN deve cobrir a migração e catálogo autenticados, RLS no escopo, perfil sem permissão, registro autorizado e vínculo com a apresentação, proibição de DML direto, auditoria, concorrência, arquivo privado, lista e formulário com carregamento, vazio, erro, 403, sucesso e conflito. O Teste C verifica teclado, foco, rótulos, captura e estados em 1440, 1280, 768 e 390 nos dois temas. A consulta oficial de segurança HML após a migração retornou um aviso INFO e dois WARN, sem Critical. Conservar a cobertura V1 e V2-01 a V2-06.

O [preflight](../auditorias/preflight/V2_PROMPT76_CONTRATO_2026-11-27.json), RCA, regressões, Zero-Drift, LOCK-TYPES, P0-NR, Teste C e revisão assistida Edivan5002 no HEAD exato condicionam a BUILD. Conferir pais, árvore e blobs na main e integrar recibo próprio. Rollback frontend por PR do incremento, preservando os registros emitidos e a migração autenticada.

## ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE (OBRIGATÓRIO)

CODE_FIXTURE. LIVE `NOT_RUN`. PROD `NO-GO`.
