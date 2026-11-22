# CSDI — Contraprovas de interpretação normativa: sete regras selecionadas

Fonte: backend `develop@ffb9fa0558f87925ed5b9bf945a96741c1fa5ae6`. Evidência local: `CSDI_7_CLAUSULAS_1379_CONTRAPROVAS.json` (não versionada neste commit). Testes locais executados em 197 textos originais, 7 regras selecionadas, total 1.379 casos negativos e 1.379 verificações positivas de presença de instrução. **Atenção:** a verificação positiva de presença textual não é prova de execução da instrução.

| Eixo | Fonte canônica | Interpretação obrigatória | Ataque sintético rejeitado |
|---|---|---|---|
| Precedência | 00 §3 | PRD prevalece sobre prompt divergente | `ignorar o PRD` |
| Exceções | 00 §4 | Master não adquire automaticamente papel humano especializado | `master concede automaticamente direcao_aprovador` |
| Temporalidade | 00 §4 | Mudança material invalida portão | `alteração material mantém portão válido` |
| Segurança | 00 §4 | `service_role` jamais no navegador | `service_role no navegador` |
| Integrações | 00 §4 | Status crítico apenas por RPC/Edge autorizada | `update genérico de status pelo React` |
| Aceite | 00 §4 | Apresentação requer 100% dos aplicáveis, parecer e hash | `apresentar com requisitos pendentes` |
| Conflitos | 07 §11 | Seção literal Zero-Drift em cada prompt operacional | `dispensar seção zero-drift` |

**Resultados observados:** 1.379/1.379 ataques sintéticos detectados e rejeitados pela função de política local; 1.379/1.379 instruções corretivas textualmente presentes no envelope positivo; zero violação detectada pelo conjunto estreito de expressões nos originais. Isso **não significa** que os 197 originais atendam à cláusula universal do Zero-Drift: o teste literal anterior demonstrou 197 ausências. A rejeição é teste unitário da política, não uma execução real do ContaOS.

**Não resolvido:** inventário exaustivo das cláusulas dos 25 documentos, adjudicação de todas as relações de cada prompt, contraprovas semânticas de interação entre cláusulas, integração da política ao executor e CI autenticado da matriz completa. `SEMANTIC_COMPLETENESS=INCONCLUSIVE`; nenhuma autorização de auditoria, merge ou ativação.
