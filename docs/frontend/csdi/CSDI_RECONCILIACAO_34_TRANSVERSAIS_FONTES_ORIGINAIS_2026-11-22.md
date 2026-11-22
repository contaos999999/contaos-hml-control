# CSDI — Reconciliação dos 34 prompts regulares de escopo transversal

## Proveniência literal comprovada

O pacote mestre ZIP original foi localizado na Biblioteca do usuário e seus bytes foram verificados em 22/11/2026. SHA-256 ZIP: `5ee115d12e263d98068288b6bb722f5f303f2d19e1e4c0b5e930e69da03621da`. Manual 100 prompts: `8a15d96568d021ac86fdd45e79038e2cb969d69c12b2edb84f012a6129b8940e`. Caderno 97 atômicos: `d9faaae47de4b697b18ad7fb71e4738384514936813cd5b18779f4cb8aed83b8`. A extração local conferiu 100 cabeçalhos regulares distintos 00–99 e 97 cabeçalhos atômicos distintos 000–096, sem lacunas ou duplicações.

## Classificação de escopo, sem inventar equivalências 1:1

| IDs regulares | Quantidade | Classificação | Justificativa baseada nos títulos e objetivos originais |
|---|---:|---|---|
| 00–15 | 16 | fundação backend e contratos | Prompts originais 00–15: constituição, PostgreSQL, identidade, contratos, normas, documentos, competências, portões, histórico, filas, diligências, financeiro, RAG, conformidade, API e hardening |
| 67–74 | 8 | provas transversais e gates | Prompts originais 67–74: Zero-Drift, isolamento, portões, documentos/filas, financeiro/RAG, security scan, smoke HML e GO/NO-GO |
| 90–99 | 10 | auditorias globais e certificação | Prompts originais 90–99: requisitos, NFR, épicos, telas, relatórios, notificações, LGPD, regressão, carga/backup e certificação |

Os 34 prompts não são requisitos atômicos autônomos e não devem ser convertidos em mapeamentos 1:1 fictícios. São instruções de fundação, segurança, testes ou certificação com aplicabilidade transversal a vários requisitos. A resolução de **categoria de escopo** não substitui a adjudicação de cada cláusula, exceção, interação e critério de aceite em sete eixos.

## Estado verificável

- **Fonte literal recuperada e SHA-256 validado:** PASS (ZIP e ambos DOCX).
- **Cobertura numérica dos originais:** PASS (100 regulares, 97 atômicos).
- **Classificação dos 34 itens transversais:** DOCUMENTADA, sem alterar o catálogo canônico do backend.
- **Reconciliação semântica integral de 197 textos contra 25 documentos:** NÃO CERTIFICADA.
- **SEMANTIC_COMPLETENESS:** INCONCLUSIVE; PR #692 bloqueada.

A verificação literal ocorreu no ambiente de trabalho, não no runner do GitHub Actions; para CI reproduzível os bytes devem ser disponibilizados por artefato autenticado ou blob autorizado, sem reescrever os originais.
