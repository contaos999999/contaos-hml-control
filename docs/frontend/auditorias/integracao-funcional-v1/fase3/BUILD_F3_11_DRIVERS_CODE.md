# F3 CODE | Liberação dos 11 drivers solicitados

**Escopo fechado:** SYS04 preferência local, V107, V108, V109, V110, V111, V115, V117, V118, V119 e V122.

Fonte única do fluxo: `F3_FLUXOS_PRODUTORES.md` revisão 3, com 11 pré-requisitos, uploads UP, esperas W1–W5, livro de intenções e cerca de mutação. Objetivo: expor 11 drivers CODE reais, compatíveis com a interface, e provas positivas/negativas que impeçam falso PASS, incluindo catálogo e consumidores já existentes. O resultado de cada driver deve ser somente a execução verificável de seus contratos, e não uma certificação antecipada de fase.

**Regra de liberação:** só declarar liberado cada driver se houver implementação de seu comando e de todos os pré-requisitos exigidos, controle de mutação/isolamento sem bypass, testes CODE positivos e negativos, regressões/CI e revisão independente no HEAD. Caso contrário, deixar explicitamente PENDENTE; não preencher lacunas com mocks ou declarações. HML autenticado LIVE e contraprovas pós-V5 somente.

**Protegido:** catálogo 138, ledger CODE, backend, políticas RLS, main e certificado permanecem intocados até provas válidas.
