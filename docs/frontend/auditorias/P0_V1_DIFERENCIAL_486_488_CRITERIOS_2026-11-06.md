# P0 V1 — diferencial de proveniência 486 × 488 critérios (06/11/2026)

**Natureza da prova:** reconciliação **documental de índices**. NÃO é homologação nem autorização para remover critérios, reordenar IDs, marcar PASS ou alterar a matriz existente. As descrições do PROMPT 75 abaixo são **resumos verificados** no dossiê do manual DOCX recuperado; o texto original primário não está materializado como blob Git em `main`, logo cotejo literal adicional permanece necessário.

## De onde vêm os dois totais

| Universo | Origem documentada | Quantidade |
| --- | --- | ---: |
| Históricos regulares 00–38 | `docs/prompts/MATRIZ_416_CRITERIOS_STATUS_E_PROVAS_2026-11-03.json` / frontend matriz histórica | 416 |
| Regulares 39–43 | 5 grupos de 12 no protocolo originalmente verificado para o regular 41 | 60 |
| Regular 75 / V1-23 | 10 verificações próprias descritas na seção “FONTE ORIGINAL DO PROMPT 75 RECUPERADA E CONFERIDA” | 10 |
| **Universo literal V1 declarado em checkpoint** | 416 + 60 + 10 | **486** |
| Matriz histórica normalizada | 416 + 6 × 12, com aplicação do protocolo do PROMPT 41 ao 75 | **488** |

**Conclusão sobre a diferença:** a discrepância aritmética de **2** advém de 12 itens normalizados para o regular 75, em contraste com as 10 verificações descritas para ele no manual recuperado. **Isso NÃO significa que os itens 11 e 12 da matriz possam ser removidos, nem que exatamente dois itens sejam supérfluos.** As listas têm granularidade e terminologia diferentes.

## Crosswalk provisório 75: resumo do manual x categorias normalizadas da matriz

| Resumo do teste original 75, conforme dossiê | Itens normalizados relacionados (índices 1–12) | Avaliação da equivalência |
| --- | --- | --- |
| 1. Schema | 1 (rota abre), talvez documentação de integração; não há item específico de colunas/FKs/índices | **LACUNA de prova específica de schema** |
| 2. Isolamento A/B | 3 (bloqueio de não autorizado) | **PARCIAL:** negação por perfil não prova tenant A/B |
| 3. Perfil | 2 (autorizado), 3 (negado) | **PARCIAL:** dupla de perfis e autorização backend devem ser comprovadas |
| 4. Fluxo autorizado | 1 (rota abre), 2 (uso permitido) | **PARCIAL:** abertura de rota não prova fluxo completo |
| 5. Bloqueio de UPDATE direto | 6 | **Correspondência semântica**, prova de execução ainda exigida |
| 6. Auditoria sem segredos | 5 (requisição), 11 (console) | **PARCIAL:** inclui também payload antes/depois/metadados e logs |
| 7. Estados | 4 | **Correspondência semântica**, Teste C privado pendente |
| 8. Quatro larguras | 7 (1440 e 1280), 8 (768), 9 (390) | **Uma exigência original desdobrada em três índices normalizados** |
| 9. Teclado/foco | 10 | **Correspondência semântica**, WCAG real pendente |
| 10. Security view sem novo Critical | 12 (security scan) | **PARCIAL:** escopo da “security view” e do scan precisam ser conferidos |

O normalizado #1 “rota abre” é útil como requisito transversal, mas não substitui automaticamente o teste de schema. O normalizado #11 “console sem erros ou logs sensíveis” é útil, mas não substitui revisão de payloads auditáveis. Os itens de largura #7–9 são subconjuntos de um mesmo requisito original. Não existe bijeção 10→12 sem perda de exigências.

## Decisão de governança para o fechamento

1. **Conservar os 488 registros** da matriz histórica e suas provas existentes, sem deletar, renumerar ou sobrescrever o texto fonte.
2. Manter o marcador de proveniência `DOZE_CRITERIOS_NORMALIZADOS_NAO_TRANSCRICAO_LITERAL_INTEGRAL` do regular 75. NÃO marcar nenhum dos doze como transcrição literal ou `certified=true`.
3. Abrir correspondência própria dos **10 testes do PROMPT 75**, com evidência por cenário que cubra schema, isolamento A/B, perfis, fluxo, bloqueio de atualização, logs/payload, estados, responsividade, acessibilidade e Security view. Se prova histórica cobrir parte do item, citar SHA/CI e limitar escopo.
4. Rever a identidade literal dos 39–43 contra os originais DOCX antes de presumir que doze títulos genéricos correspondem textualmente à fonte específica.
5. O número **486** representa o universo declarado no checkpoint de recuperação do manual; a reconciliação semântica detalhada da fonte primária e a comprovação dos critérios ainda estão **PENDENTES**. A conta aritmética, isoladamente, não habilita certificado V1.

## Fontes versionadas

- `docs/frontend/auditorias/P0_V1_RASTREABILIDADE_COMPLETA_2026-11-05.json` (45 regulares, 488 itens, 75 com 12 normalizados e `certified=false`).
- `docs/frontend/auditorias/P0_V1_CRITERIOS_FINAIS_E_LIMITES_2026-11-05.md` (protocolo 12 categorias do PROMPT 41 estendido aos seis módulos).
- `docs/frontend/planos/PROMPT_75_V1_23_TRILHA_AUDITORIA_PLAN_2026-11-04.md` (verificação do manual DOCX recuperado e dez verificações do PROMPT 75).
- `docs/frontend/ESTADO_E_RETOMADA_CONTAOS_4_1.md` (registro 486/488, histórico de autoria e limites de prova).
- `docs/prompts/PROMPT_TRACKS_4_1.json` no backend canônico (inventário 100/97 com limitação de conteúdo original).

**V1: NÃO CERTIFICADA. V2 e PROD: BLOQUEADAS.**

## ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE

Documento sem alteração visual, código, marca, rota, backend, banco, hashes canônicos ou tipos. Reaproveita os registros existentes e não promove testes simulados a provas reais.
