# Emenda do GATE Trilha A: localização do executor privado

Base: GATE #333 integrado em 9fb3852, PLAN #332 integrado em 52f6fa95. Escopo exclusivamente documental. Não altera implementação, proteção de branch, workflows existentes, backend ou PROD.

O detector do Teste C existente inclui qualquer caminho scripts/testc/. Colocar o novo auditor privado nesse diretório acionaria automaticamente as 18 provas públicas já aprovadas, contrariando a instrução expressa de não repeti-las sem regressão. Não houve mudança de produto público que justifique essa repetição.

## Substituição fechada de caminhos

- scripts/testc/authenticated-visual-audit.mjs → scripts/hml/authenticated-visual-audit.mjs.
- scripts/testc/authenticated-visual-audit.test.mjs → scripts/hml/authenticated-visual-audit.test.mjs.

O workflow novo continua .github/workflows/contaos-trilha-a-authenticated.yml. Ele executará os testes próprios sem secrets em PR e a auditoria privada somente por disparo manual na main, com environment hml e proveniência/proteção nativa antes de credenciais. Todas as demais condições dos PRs #332 e #333 permanecem integrais. Os dois caminhos novos substituem os anteriores no manifesto ativo; documentos históricos são preservados.

Os checks existentes continuam exigidos e seus arquivos não serão alterados. O Teste C público aplica sua regra de escopo existente; N/A nesse job não certifica privadas. Exigir também o CI próprio do harness no mesmo HEAD, revisão independente e os controles negativos aprovados antes de merge. Não suprimir FAIL, mudar o detector ou dispensar teste de produto.

## Histórico parcial e ordem de execução

RED remoto 3fd4cfad; GREEN parcial 5f46c822 com 52/52 provas locais, incluindo proxy TCP real sem encaminhar bytes aos destinos negados; regressão de 42 suítes/1.165 testes e TypeScript aprovados. Ainda faltam proteção nativa em Chromium, runner e workflow autenticado. Nenhuma credencial foi transmitida pela CI e o BUILD não está concluído.

O código parcial está na branch build/trilha-a-authenticated-audit-20261108, ainda sem PR para não acionar a auditoria pública antes desta emenda. Depois de CI, revisão e integração desta emenda: mover os dois arquivos por novo commit, sem reescrever histórico; conferir que o diff final não modifica scripts/testc/, produto ou workflow público; continuar TDD e revisão antes de qualquer merge do BUILD ou login real.

Revisão independente da emenda: APROVÁVEL, sem Critical/Important. A aprovação limita-se à localização; V1, 232 casos, 72 critérios e WCAG continuam não certificados. PROD proibido.
