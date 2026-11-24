# F3 CODE — V117 revisão e consumidor de análise

Missão F3-138-CODE-CERTIFICATION. Este incremento fecha a validação de resultado do comando `registrar_revisao_requisito_v117` dentro da cadeia produtor/consumidor, sem substituir os demais drivers ou declarar os cinco caseIds de V117 como PASS.

Origem normativa: `F3_CASES.json` (produtor 17, cinco vínculos); fonte real: `src/lib/competencias/revisaoRequisitoDados.ts`. A implementação somente validará a correlação entre o comando, a resposta da RPC e o contexto da organização/competência/requisito, incluindo rejeição de UUID externo, replay e IDs incorretos. O envio autenticado e o readback de todos os consumidores serão integrados em incremento posterior, e nenhuma execução HML LIVE será antecipada ao GATE PROD.

Arquivos escopados: executor F3 existente, seus testes e este documento. CI, revisão independente, PLAN P0 protegido, revisão e merge na main são obrigatórios. Preservar F1/F2, matriz/ledger e políticas RLS sem alteração.

## Implementação verificada no diff

`assertF3V117ReviewReceipt` vincula `context`, `command` e `result` da RPC oficial `registrar_revisao_requisito_v117`, exigindo mesma organização, contrato, competência, requisito, execução esperada, resultado esperado, hash do contexto, ID da versão documental e request_id. Recusa a resposta sem identidade de execução/resultado novas. O retorno é explicitamente `CONTRACT_CORRELATED_NOT_CERTIFIED`.

O teste `F3 V117: resposta da revisão correlaciona contexto, documento e comando sem certificar caso` executa uma hipótese positiva de contrato e 24 negativas de adulteração, cruzamento de organização, comando, evidência, replay e identidade de resposta. Os dados são sintéticos, exclusivamente em teste de contrato.

**Gates que permanecem faltando:** driver autenticado pela interface original V117, contexto de análise concluída, documento da V115 aprovado, cinco consumidores V114/V116/V118/V119/V123, checks RBAC de MASTER/leitor, evidências positivas/negativas reais individualizadas, manifesto por `caseId` e parecer de certificação CODE. Este incremento não marca nenhum dos cinco casos como PASS nem autoriza emissão de certificado.
