# Preflight da sequência de regulares V2 CODE

O PLAN #828 integra a extensão aditiva para os dois gates do P0. Sem a extensão, a leitura do recibo do regular preservava o próximo ID 44. A prova RED do GitHub, no HEAD `87c478cea636c363ec327ee76cf3b5b80a736800`, observou `44 !== 45` no teste nomeado. A BUILD de Diligências já havia entrado na main com RCA e Teste C. [Run RED](https://github.com/contaos999999/contaos-hml-control/actions/runs/45864497542) · [BUILD 44](https://github.com/contaos999999/contaos-hml-control/pull/827)

| Entrada | Verificação executável |
| --- | --- |
| Âncora histórica | O blob P0 e o recibo V1 mantêm a identidade e a leitura em ambos os gates. Sem o recibo V1 efetivo, a sequência V2 não carrega. |
| Progressão | Sequência vazia admite 44. Recibo válido do 44 muda a posição para 45. Salto, duplicata, falta de bytes, hash divergente e arquivo fora de caminho interrompem a leitura. |
| Revisão e CI | A vinculação usa PR, revisão assistida no HEAD, pais e árvore do merge, ancestralidade e RCA operacional da mesma execução. A identidade e os hashes são verificados em GitHub REST. |
| Prova visual | O job Playwright, as capturas e a verificação de fontes integram a tentativa do Teste C da BUILD. Identidade e digest do artefato, SHA do checkout e sua árvore precisam coincidir. |
| Certificados | Regulares não ativam A, B ou C. Base V1 permanece válida e V3 continua condicionada às três certificações. LIVE NOT_RUN. PROD NO-GO. |

Os autotestes exercitam leitura ausente ou corrompida e autenticidade negativa, inclusive quando jobs genéricos ficam verdes. O arquivo de progressão entra vazio. O primeiro recibo passa por PR documental própria, após confirmar o material oficial e os blobs na main.

## Reprodução do modo isolado do RCA

O primeiro GREEN candidato executou as suítes de ordem e proveniência normalmente. O RCA falhou ao selecionar os casos com `--experimental-test-isolation=none`. Nesse modo, `process.argv[1]` chega com um caminho relativo. Prefixá-lo com `file://` transformava `scripts` em host inválido em Linux antes da declaração do subteste. O segundo RED comprovou `ERR_INVALID_FILE_URL_HOST` no GitHub. Os dois pontos de entrada agora convertem o argumento com `pathToFileURL`. A prova usa o comando isolado e exige a linha TAP dos dois casos nomeados. [Primeiro candidato](https://github.com/contaos999999/contaos-hml-control/actions/runs/45865235014) · [RED do runner](https://github.com/contaos999999/contaos-hml-control/actions/runs/45865583578)
