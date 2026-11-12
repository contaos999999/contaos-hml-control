# Certificado da Fase 1: inventário e matriz de integração funcional V1

Decisão técnica: **PASS no escopo estático da Fase 1**, com eficácia após revisão independente, checks exigidos no mesmo HEAD e merge protegido. O recibo de encerramento no PR deve conter o SHA integrado, runs, resultados e readback. Sem esse recibo, este arquivo é uma decisão técnica pendente de integração.

## Critérios de aceite

| Critério aprovado | Evidência produzida |
|---|---|
| 27/27 telas do núcleo inventariadas | `TELAS.csv` e `inventario.json`; 23 V1 + SYS01/SYS04/SYS05/ADM01 |
| Nenhuma superfície omitida por contagem histórica | SYS02/SYS03 também inventariadas; 29 superfícies, 28 rotas, 26 privadas; V117 é drawer |
| Rota, componente, módulo e função | Inventário por tela com entrypoint, dependências e fontes seladas |
| Tabelas, RPCs, Edges e consultas | 204 referências; 54 nomes RPC e respectivas definições normativas; 171 fontes frontend seladas |
| Produtores, consumidores e vínculos | 577 relações com origem, destino, classe, invariante, referência e fase de execução futura |
| Relações obrigatórias, condicionais e N/A | Arestas classificadas e 812 pares direcionados, incluindo N/A de ligação direta com justificativa |
| Grafo e identificação de órfãs | Grafo integral no JSON; vista `GRAFO.mmd`; nenhuma superfície de grau zero no mapa estático |
| Verificação reproduzível | `verificar.py --verificar`; 19 testes incluindo 14 negativos de integridade |
| Preservação dos controles anteriores | Produto, tipos, backend, workflows, dependências e PROD sem alteração; CI obrigatório preservado |

As referências de módulos são conservadoras, não um callgraph executado. O inventário não converte referência de RPC ou existência de rota em prova de runtime. Não é certificado de navegação autenticada, CRUD integrado, RLS, E2E, V2 ou PROD. As Fases 2–7 continuam com gates próprios.

R-01: upload físico E2E/arquivo grande e retomada. R-02: worker/filas E2E em fluxo integral. R-03: isolamento real multiusuário/organização em todos os domínios. As três permanecem no escopo exato do certificado V1 anterior e não viram PASS_REAL nesta fase.

Baseline frontend `90ae86432e617b880d603cff379878e623612a73`; baseline normativo `5eca44aebead3183e81b5c1af0d1dffa5fb8feb6`; HML `gklhhhyosgasnyoxlrui`. Qualquer alteração posterior de fontes exige avaliar impacto e regenerar o mapa afetado. Próxima tarefa: Fase 2, navegação funcional autenticada.
