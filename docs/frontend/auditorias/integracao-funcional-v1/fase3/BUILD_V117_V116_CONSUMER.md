# F3 CODE — Consumidor V116 do comando V117
Incremento de causa raiz única: ausência de verificação entre o resultado novo da revisão V117 e a leitura da análise V116.
Não cria evidência autenticada, não marca caseId como PASS, não altera ledger ou matriz.
Código e testes: função assertF3V117V116ConsumerReadback em integracao-v1-fase3.mjs e testes de contrato negativos/positivos em integracao-v1-fase3.test.mjs.
Exige leitura V116 de mesma competência e requisito, mesma execução nova e identificador do resultado igual ao recebido pelo comando V117. A leitura da coleção precisa ser autoritativa e completa quanto àquele requisito, sem aceitar resultado stale.
Os testes usam fixtures CODE; a certificação funcional da ligação C0458 exige evidência independente de acionamento da UI original e leitura pelos perfis MASTER e leitor em fase admissível. Execução autenticada HML LIVE somente após V5, conforme ratificação no checkpoint #708.
