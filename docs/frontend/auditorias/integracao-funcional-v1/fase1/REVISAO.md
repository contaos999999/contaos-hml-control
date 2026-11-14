# Revisão independente e tratamento da Fase 1

Revisão somente leitura, em contexto independente, do intervalo frontend `90ae86432e617b880d603cff379878e623612a73..33786df7020b766241ef3b5e3c12ac59b13cedaf`. Backend confirmado pelo revisor: `5eca44aebead3183e81b5c1af0d1dffa5fb8feb6`.

Resultado original: zero Critical, cinco Important, um Minor. Não houve aprovação presumida. Os cinco Important foram tratados em uma única passagem de correção documental, sem editar produto.

| Achado independente | Tratamento | Prova |
|---|---|---|
| Sete retornos competência → contrato ausentes | Acrescentados V114–V120 → V106, condicionais ao contexto e permissão, com âncoras no menu e resolução backend | `test_menu_competencia_retorna_contrato` RED → GREEN |
| Join de contratante omitido em V106 | Extraída relação PostgREST com FK explícita; mapeada V103 → V106 | `test_join_contratante_no_detalhe`, `test_edicao_contratante_reflete_detalhe` RED → GREEN |
| Alimentação do painel confundida com menu | Relações de dados V105/V106/V113 → SYS05, para validação nas fases 3–6 | `test_mutacoes_alimentam_painel` RED → GREEN |
| Remoção coordenada de RPCs/conexões aceita | Expectativas reconstruídas a partir do código e catálogo normativo independente selado por SHA256; não derivadas da entrada submetida | `test_catalogo_rpc_removido_bloqueia`, `test_remover_todas_relacoes_dados_bloqueia` RED → GREEN |
| Identidade/declarações/âncoras insuficientes | Comparação completa de telas, rotas, componentes, runtime, definições, pares e justificativas; consumidor do contratante usa SELECT, menus apontam à declaração real | Cinco negativos de componente/rota/runtime/definição/classe RED → GREEN; inspeção dirigida das âncoras corrigidas |

A execução RED ampliada teve 19 testes, 11 falhas esperadas e oito sucessos; confirmou precisamente as lacunas antes da correção. A execução GREEN subsequente teve 19/19 PASS, zero falhas. A nova extração distingue SELECT com FK de pseudo-seletores CSS, e as vistas CSV são regeneradas/comparadas com o JSON.

Minor tratado: JSON formatado em várias linhas com indentação, mantendo tamanho inferior a 1 MiB para consulta pelo GitHub. Nenhum Minor diferido.

Questões que o revisor deixou fora do julgamento: alcançabilidade autenticada, execução real de consultas, paridade do deployment de RPC/Edge, propagação runtime de cache, eficácia RLS, upload/worker e Fases 2–7. Decisão: são provas futuras do plano aprovado, corretamente não certificadas pela Fase 1. O custo de inferir sua aprovação seria uma certificação funcional falsa; por isso todas as relações mantêm `NAO_EXECUTADO_FASE1`.

Não se usou a revisão como substituto dos checks obrigatórios. Os resultados finais de CI e integração pertencem ao recibo do PR. A aprovação técnica é limitada ao inventário estático após as correções e suas provas, sem reabrir as oito certificações anteriores.
