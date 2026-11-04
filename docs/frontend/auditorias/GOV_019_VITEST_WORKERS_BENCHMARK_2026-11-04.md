# GOV-019 — Experimento controlado Vitest 2 workers

**04/11/2026, Brasília | Estado: experimento no CI, não conclusivo até logs e dois checks verdes.**

## Fonte e condições
Frontend main pré-ensaio `953ee28c95230d75a128ffed852d30060a7533a2` (GOV-017 PR #39 completo, GOV-019 PLAN PR #40 integrado); backend norma `contaos999999/develop@a10d3b1a1a14276c017027f93ec2a7aace4d6cb6`, `types.ts` certificado imutável.

Baseline com um worker: run `41874233461`, `29 Test Files passed`, `828 Tests passed`, `Duration 78.74s` (step ~79s). Outras duas medições anteriores: 71s e 83s.

## Instrumentação
PR de experimento altera somente o passo `Full regression serial` do workflow da qualidade para:
- três iterações consecutivas de `bunx vitest run --maxWorkers=2`;
- `set -euo pipefail` para falhar imediatamente ao menor teste reprovado;
- logs marcados `GOV-019 INICIO REPETICAO i/3` e `GOV-019 PASS REPETICAO i/3 SEGUNDOS=n`;
- todas as execuções devem reportar **29 arquivos e 828 testes PASS**. Sem selecionar suites menores ou desligar testes.
- Todos os outros passos, check names e políticas permanecem iguais; o Teste C em PR com alteração somente do workflow da qualidade pode declarar N/A, mantendo o status check obrigatório.

## Gates para adoção
Aprovar a adoção somente depois de: 3/3 suites PASS sem flakiness; contagem de 29/828 em todas, tempos comparáveis e idealmente menores; CI completo com TypeScript, build e Zero-Drift verdes; segunda revisão de workflow trocando 3 execuções por uma única execução `--maxWorkers=2` no mesmo PR, CI SUCCESS novamente; merge sem bypass; observar pós-merge.

**Estado inicial:** aguardando a primeira corrida no PR de experimento. Sem afirmar economia ou estabilidade até os logs reais.

## Riscos e rollback
A concorrência pode provocar race, OOM, conflito de estado global ou flakiness nos testes. Se ocorrer, não aprovar adoção; restaurar `--maxWorkers=1` por PR e registrar FAIL, sem alterar software/DB/Auth. Nenhum impacto sobre identidade visual, tipos, segredos, backend, ambiente PROD ou cobertura Teste C.

## Resultado do ensaio 3×2 workers — verificado no GitHub

Run PR #41: [#41875827954](https://github.com/contaos999999/contaos-hml-control/actions/runs/41875827954), job `126734821357`, dois checks SUCCESS, incluindo quality, TypeScript e build, sem alterar backend.
| Repetição | Test files PASS | Testes PASS | Vitest reportou | Wall time instrumentado | Resultado |
| --- | ---: | ---: | ---: | ---: | --- |
| 1 | 29 | 828 | 64,12 s | 65 s | PASS |
| 2 | 29 | 828 | 64,69 s | 65 s | PASS |
| 3 | 29 | 828 | 62,69 s | 63 s | PASS |

**Mediana instrumentada: 65s**, contra baseline do run 41874233461 **~79s**, redução observada **14s (~17,7%)**. O teste de estresse foi de três repetições completas, sem falhas, contagens iguais, sem desligar suite ou mover código. Não há garantias absolutas de estabilidade futura; monitorar após merge.

**Configuração permanente proposta:** passo único `bunx vitest run --maxWorkers=2` no mesmo PR #41 após a repetição 3/3. Novo commit `50c488e4e0c6f90d806353993dd3b15941d9ef59` implementa esse delta. Exigir novamente ambos os checks SUCCESS no commit **final** antes do merge. A auditoria de navegador do PR pode ser escopo N/A por ser exclusivamente CI, sem alterar os 192 cenários anteriores. Sem Teste C completo autenticado HML.

**Pós-merge:** registrar SHA real e CI depois da integração; até lá NÃO declarar configuração permanente em main.

