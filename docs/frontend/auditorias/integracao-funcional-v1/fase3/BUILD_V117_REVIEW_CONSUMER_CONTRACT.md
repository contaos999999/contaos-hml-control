# F3 CODE — V117 revisão e consumidor de análise

Missão F3-138-CODE-CERTIFICATION. Este incremento fecha a validação de resultado do comando `registrar_revisao_requisito_v117` dentro da cadeia produtor/consumidor, sem substituir os demais drivers ou declarar os cinco caseIds de V117 como PASS.

Origem normativa: `F3_CASES.json` (produtor 17, cinco vínculos); fonte real: `src/lib/competencias/revisaoRequisitoDados.ts`. A implementação somente validará a correlação entre o comando, a resposta da RPC e o contexto da organização/competência/requisito, incluindo rejeição de UUID externo, replay e IDs incorretos. O envio autenticado e o readback de todos os consumidores serão integrados em incremento posterior, e nenhuma execução HML LIVE será antecipada ao GATE PROD.

Arquivos escopados: executor F3 existente, seus testes e este documento. CI, revisão independente, PLAN P0 protegido, revisão e merge na main são obrigatórios. Preservar F1/F2, matriz/ledger e políticas RLS sem alteração.
