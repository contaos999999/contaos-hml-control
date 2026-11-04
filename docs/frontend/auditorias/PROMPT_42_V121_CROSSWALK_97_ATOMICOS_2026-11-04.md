# PROMPT 42 / V1-21 — triagem semântica individual dos 97 atômicos

**Base:** frontend `main@e12bf962d83b347f1c168c3e7541172d9ae35df4`; normativo `develop/main@a10d3b1a1a14276c017027f93ec2a7aace4d6cb6`; catálogo `docs/prompts/PROMPT_TRACKS_4_1.json` blob `e54e49e626e65a9c94c81709180fd192a1f0c079`.

Original do PROMPT regular 42 inspecionado nos parágrafos 2363–2422 de `Manual_Mestre_Prompts_4_1_100_PRD.docx`, SHA-256 `8a15d96568d021ac86fdd45e79038e2cb969d69c12b2edb84f012a6129b8940e`; caderno atômico original SHA-256 `d9faaae47de4b697b18ad7fb71e4738384514936813cd5b18779f4cb8aed83b8`. Estes hashes correspondem ao catálogo de proveniência. Sem materialização de transcrição integral no repositório.

**Escopo:** V1-21 Histórico do contrato `/contratos/:id/historico`, apresentação somente leitura dos registros históricos existentes. V1-22/PROMPT 43 é importação/ingestão. Não executar processamento IA, alterar status/ranking, promover regras ou importar documentos no V1-21.

**Resultado da triagem individual (não certificação de implementação):** APLICÁVEL 7; NÃO IMPLEMENTAR NA V1-21 84; TRANSVERSAL 4; CONDICIONAL 2 = 97 IDs distintos. A correspondência direta do catálogo é 000 e 006–010; requisitos de paginação, isolamento e resiliência são igualmente analisados semanticamente. O catálogo global mantém `full_crosswalk_verified=false` e não foi modificado.

| ID | Exigência canônica | Aplicabilidade | Justificativa / alcance exato |
|---|---|---|---|
| 000 | BRAND-01 | APLICÁVEL | Design System e marca oficial, 1440/1280/768/390, claro/escuro, teclado, PT-BR. |
| 001 | V1-CON-001 | NÃO IMPLEMENTAR NA V1-21 | Base normativa/contratual pertence às rotas V1-06 a V1-10, não à consulta histórica. |
| 002 | V1-CON-002 | NÃO IMPLEMENTAR NA V1-21 | Base normativa/contratual pertence às rotas V1-06 a V1-10, não à consulta histórica. |
| 003 | V1-CON-003 | NÃO IMPLEMENTAR NA V1-21 | Base normativa/contratual pertence às rotas V1-06 a V1-10, não à consulta histórica. |
| 004 | V1-CON-004 | NÃO IMPLEMENTAR NA V1-21 | Base normativa/contratual pertence às rotas V1-06 a V1-10, não à consulta histórica. |
| 005 | V1-CON-005 | NÃO IMPLEMENTAR NA V1-21 | Base normativa/contratual pertence às rotas V1-06 a V1-10, não à consulta histórica. |
| 006 | V1-HIS-001 | APLICÁVEL | V1-21 mostra registros de cargas anteriores e contexto de competências; anexação/importação propriamente dita é V1-22 (PROMPT 43). |
| 007 | V1-HIS-002 | APLICÁVEL | Exibir relatório preservado e seus apontamentos individuais, com paginação e links de origem quando autorizados. |
| 008 | V1-HIS-003 | APLICÁVEL | Exibir relação oficial de apontamentos, respostas e desfechos sem deduzir ou sintetizar automaticamente. |
| 009 | V1-HIS-004 | APLICÁVEL | Exibir somente sugestões/regras preventivas do backend; aprovação, promoção e geração de regras não são ações desta tela. |
| 010 | V1-HIS-005 | APLICÁVEL | Apresentar precedentes do contrato atual, com fonte e resultado oficiais; sem pesquisa transversal V4 ou ranqueamento local. |
| 011 | V1-CHK-001 | NÃO IMPLEMENTAR NA V1-21 | Checklist e portões pertencem ao workflow de análise, não ao histórico de relatórios. |
| 012 | V1-CHK-002 | NÃO IMPLEMENTAR NA V1-21 | Checklist e portões pertencem ao workflow de análise, não ao histórico de relatórios. |
| 013 | V1-CHK-003 | NÃO IMPLEMENTAR NA V1-21 | Checklist e portões pertencem ao workflow de análise, não ao histórico de relatórios. |
| 014 | V1-CHK-004 | NÃO IMPLEMENTAR NA V1-21 | Checklist e portões pertencem ao workflow de análise, não ao histórico de relatórios. |
| 015 | V1-DOC-001 | NÃO IMPLEMENTAR NA V1-21 | Ciclo de documentos e upload/versões pertence ao módulo documental; V1-21 consulta apenas registros derivados. |
| 016 | V1-DOC-002 | NÃO IMPLEMENTAR NA V1-21 | Ciclo de documentos e upload/versões pertence ao módulo documental; V1-21 consulta apenas registros derivados. |
| 017 | V1-DOC-003 | NÃO IMPLEMENTAR NA V1-21 | Ciclo de documentos e upload/versões pertence ao módulo documental; V1-21 consulta apenas registros derivados. |
| 018 | V1-DOC-004 | NÃO IMPLEMENTAR NA V1-21 | Ciclo de documentos e upload/versões pertence ao módulo documental; V1-21 consulta apenas registros derivados. |
| 019 | V1-DOC-005 | TRANSVERSAL | Somente preservar e exibir referências/hashes já retornados pelo backend; não alterar documentos nem cadeia de custódia. |
| 020 | V1-AUD-001 | NÃO IMPLEMENTAR NA V1-21 | Execução de auditoria e resultados de competência pertencem a outras rotas. |
| 021 | V1-AUD-002 | NÃO IMPLEMENTAR NA V1-21 | Execução de auditoria e resultados de competência pertencem a outras rotas. |
| 022 | V1-AUD-003 | NÃO IMPLEMENTAR NA V1-21 | Execução de auditoria e resultados de competência pertencem a outras rotas. |
| 023 | V1-AUD-004 | NÃO IMPLEMENTAR NA V1-21 | Execução de auditoria e resultados de competência pertencem a outras rotas. |
| 024 | V1-AUD-005 | NÃO IMPLEMENTAR NA V1-21 | Execução de auditoria e resultados de competência pertencem a outras rotas. |
| 025 | V2-DIL-001 | NÃO IMPLEMENTAR NA V1-21 | Ciclo externo de diligências, planos, contestações e aprendizado posterior não é função do histórico V1-21. |
| 026 | V2-DIL-002 | NÃO IMPLEMENTAR NA V1-21 | Ciclo externo de diligências, planos, contestações e aprendizado posterior não é função do histórico V1-21. |
| 027 | V2-DIL-003 | NÃO IMPLEMENTAR NA V1-21 | Ciclo externo de diligências, planos, contestações e aprendizado posterior não é função do histórico V1-21. |
| 028 | V2-DIL-004 | NÃO IMPLEMENTAR NA V1-21 | Ciclo externo de diligências, planos, contestações e aprendizado posterior não é função do histórico V1-21. |
| 029 | V2-PRO-001 | NÃO IMPLEMENTAR NA V1-21 | Ciclo externo de diligências, planos, contestações e aprendizado posterior não é função do histórico V1-21. |
| 030 | V2-PRO-002 | NÃO IMPLEMENTAR NA V1-21 | Ciclo externo de diligências, planos, contestações e aprendizado posterior não é função do histórico V1-21. |
| 031 | V2-PRO-003 | NÃO IMPLEMENTAR NA V1-21 | Ciclo externo de diligências, planos, contestações e aprendizado posterior não é função do histórico V1-21. |
| 032 | V2-PRO-004 | NÃO IMPLEMENTAR NA V1-21 | Ciclo externo de diligências, planos, contestações e aprendizado posterior não é função do histórico V1-21. |
| 033 | V2-ACT-001 | NÃO IMPLEMENTAR NA V1-21 | Ciclo externo de diligências, planos, contestações e aprendizado posterior não é função do histórico V1-21. |
| 034 | V2-ACT-002 | NÃO IMPLEMENTAR NA V1-21 | Ciclo externo de diligências, planos, contestações e aprendizado posterior não é função do histórico V1-21. |
| 035 | V2-ACT-003 | NÃO IMPLEMENTAR NA V1-21 | Ciclo externo de diligências, planos, contestações e aprendizado posterior não é função do histórico V1-21. |
| 036 | V2-ACT-004 | NÃO IMPLEMENTAR NA V1-21 | Ciclo externo de diligências, planos, contestações e aprendizado posterior não é função do histórico V1-21. |
| 037 | V2-CONTEST-001 | NÃO IMPLEMENTAR NA V1-21 | Ciclo externo de diligências, planos, contestações e aprendizado posterior não é função do histórico V1-21. |
| 038 | V2-CONTEST-002 | NÃO IMPLEMENTAR NA V1-21 | Ciclo externo de diligências, planos, contestações e aprendizado posterior não é função do histórico V1-21. |
| 039 | V2-CONTEST-003 | NÃO IMPLEMENTAR NA V1-21 | Ciclo externo de diligências, planos, contestações e aprendizado posterior não é função do histórico V1-21. |
| 040 | V2-CONTEST-004 | NÃO IMPLEMENTAR NA V1-21 | Ciclo externo de diligências, planos, contestações e aprendizado posterior não é função do histórico V1-21. |
| 041 | V2-KB-001 | NÃO IMPLEMENTAR NA V1-21 | Ciclo externo de diligências, planos, contestações e aprendizado posterior não é função do histórico V1-21. |
| 042 | V2-KB-002 | NÃO IMPLEMENTAR NA V1-21 | Ciclo externo de diligências, planos, contestações e aprendizado posterior não é função do histórico V1-21. |
| 043 | V2-KB-003 | NÃO IMPLEMENTAR NA V1-21 | Ciclo externo de diligências, planos, contestações e aprendizado posterior não é função do histórico V1-21. |
| 044 | V3-PREV-001 | NÃO IMPLEMENTAR NA V1-21 | Controles e alertas financeiros preventivos não são calculados no histórico V1-21. |
| 045 | V3-PREV-002 | NÃO IMPLEMENTAR NA V1-21 | Controles e alertas financeiros preventivos não são calculados no histórico V1-21. |
| 046 | V3-PREV-003 | NÃO IMPLEMENTAR NA V1-21 | Controles e alertas financeiros preventivos não são calculados no histórico V1-21. |
| 047 | V3-PREV-004 | NÃO IMPLEMENTAR NA V1-21 | Controles e alertas financeiros preventivos não são calculados no histórico V1-21. |
| 048 | V3-PREV-005 | NÃO IMPLEMENTAR NA V1-21 | Controles e alertas financeiros preventivos não são calculados no histórico V1-21. |
| 049 | V3-PREV-006 | NÃO IMPLEMENTAR NA V1-21 | Controles e alertas financeiros preventivos não são calculados no histórico V1-21. |
| 050 | V3-PREV-007 | NÃO IMPLEMENTAR NA V1-21 | Controles e alertas financeiros preventivos não são calculados no histórico V1-21. |
| 051 | V3-ALT-001 | NÃO IMPLEMENTAR NA V1-21 | Controles e alertas financeiros preventivos não são calculados no histórico V1-21. |
| 052 | V3-ALT-002 | NÃO IMPLEMENTAR NA V1-21 | Controles e alertas financeiros preventivos não são calculados no histórico V1-21. |
| 053 | V3-ALT-003 | NÃO IMPLEMENTAR NA V1-21 | Controles e alertas financeiros preventivos não são calculados no histórico V1-21. |
| 054 | V3-ALT-004 | NÃO IMPLEMENTAR NA V1-21 | Controles e alertas financeiros preventivos não são calculados no histórico V1-21. |
| 055 | V4-INT-001 | NÃO IMPLEMENTAR NA V1-21 | Inteligência estruturada/transversal V4 não é habilitada por esta tela histórica do contrato. |
| 056 | V4-INT-002 | NÃO IMPLEMENTAR NA V1-21 | Inteligência estruturada/transversal V4 não é habilitada por esta tela histórica do contrato. |
| 057 | V4-INT-003 | NÃO IMPLEMENTAR NA V1-21 | Inteligência estruturada/transversal V4 não é habilitada por esta tela histórica do contrato. |
| 058 | V4-INT-004 | NÃO IMPLEMENTAR NA V1-21 | Inteligência estruturada/transversal V4 não é habilitada por esta tela histórica do contrato. |
| 059 | V4-PREC-001 | NÃO IMPLEMENTAR NA V1-21 | Inteligência estruturada/transversal V4 não é habilitada por esta tela histórica do contrato. |
| 060 | V4-PREC-002 | NÃO IMPLEMENTAR NA V1-21 | Inteligência estruturada/transversal V4 não é habilitada por esta tela histórica do contrato. |
| 061 | V4-PREC-003 | NÃO IMPLEMENTAR NA V1-21 | Inteligência estruturada/transversal V4 não é habilitada por esta tela histórica do contrato. |
| 062 | V4-PREC-004 | NÃO IMPLEMENTAR NA V1-21 | Inteligência estruturada/transversal V4 não é habilitada por esta tela histórica do contrato. |
| 063 | V4-TRV-001 | NÃO IMPLEMENTAR NA V1-21 | Inteligência estruturada/transversal V4 não é habilitada por esta tela histórica do contrato. |
| 064 | V4-TRV-002 | NÃO IMPLEMENTAR NA V1-21 | Inteligência estruturada/transversal V4 não é habilitada por esta tela histórica do contrato. |
| 065 | V4-TRV-003 | NÃO IMPLEMENTAR NA V1-21 | Inteligência estruturada/transversal V4 não é habilitada por esta tela histórica do contrato. |
| 066 | V4-TRV-004 | NÃO IMPLEMENTAR NA V1-21 | Inteligência estruturada/transversal V4 não é habilitada por esta tela histórica do contrato. |
| 067 | V4-TRV-005 | NÃO IMPLEMENTAR NA V1-21 | Inteligência estruturada/transversal V4 não é habilitada por esta tela histórica do contrato. |
| 068 | V4-TRV-006 | NÃO IMPLEMENTAR NA V1-21 | Inteligência estruturada/transversal V4 não é habilitada por esta tela histórica do contrato. |
| 069 | V4-TRV-007 | NÃO IMPLEMENTAR NA V1-21 | Inteligência estruturada/transversal V4 não é habilitada por esta tela histórica do contrato. |
| 070 | V4-TRV-008 | TRANSVERSAL | Vedar consulta e exibição cross-organização; V1-21 usa somente contrato e tenant ativos, sem inteligência transversal V4. |
| 071 | V4-COP-001 | NÃO IMPLEMENTAR NA V1-21 | Inteligência estruturada/transversal V4 não é habilitada por esta tela histórica do contrato. |
| 072 | V4-COP-002 | NÃO IMPLEMENTAR NA V1-21 | Inteligência estruturada/transversal V4 não é habilitada por esta tela histórica do contrato. |
| 073 | V4-COP-003 | NÃO IMPLEMENTAR NA V1-21 | Inteligência estruturada/transversal V4 não é habilitada por esta tela histórica do contrato. |
| 074 | V4-COP-004 | NÃO IMPLEMENTAR NA V1-21 | Inteligência estruturada/transversal V4 não é habilitada por esta tela histórica do contrato. |
| 075 | V5-CCM-001 | NÃO IMPLEMENTAR NA V1-21 | Compliance contínuo/portal de evidências V5 é fluxo separado. |
| 076 | V5-CCM-002 | NÃO IMPLEMENTAR NA V1-21 | Compliance contínuo/portal de evidências V5 é fluxo separado. |
| 077 | V5-CCM-003 | NÃO IMPLEMENTAR NA V1-21 | Compliance contínuo/portal de evidências V5 é fluxo separado. |
| 078 | V5-CCM-004 | NÃO IMPLEMENTAR NA V1-21 | Compliance contínuo/portal de evidências V5 é fluxo separado. |
| 079 | V5-REG-001 | NÃO IMPLEMENTAR NA V1-21 | Compliance contínuo/portal de evidências V5 é fluxo separado. |
| 080 | V5-REG-002 | NÃO IMPLEMENTAR NA V1-21 | Compliance contínuo/portal de evidências V5 é fluxo separado. |
| 081 | V5-REG-003 | NÃO IMPLEMENTAR NA V1-21 | Compliance contínuo/portal de evidências V5 é fluxo separado. |
| 082 | V5-AUDPORT-001 | NÃO IMPLEMENTAR NA V1-21 | Compliance contínuo/portal de evidências V5 é fluxo separado. |
| 083 | V5-AUDPORT-002 | NÃO IMPLEMENTAR NA V1-21 | Compliance contínuo/portal de evidências V5 é fluxo separado. |
| 084 | V5-AUDPORT-003 | NÃO IMPLEMENTAR NA V1-21 | Compliance contínuo/portal de evidências V5 é fluxo separado. |
| 085 | NFR-001 | NÃO IMPLEMENTAR NA V1-21 | RNF operacional de infraestrutura sem necessidade de funcionalidade nova na tela read-only V1-21. |
| 086 | NFR-002 | NÃO IMPLEMENTAR NA V1-21 | RNF operacional de infraestrutura sem necessidade de funcionalidade nova na tela read-only V1-21. |
| 087 | NFR-003 | CONDICIONAL | Download/abertura de documento original apenas se houver fluxo de URL temporária já certificado; não presumir endpoint. |
| 088 | NFR-004 | NÃO IMPLEMENTAR NA V1-21 | RNF operacional de infraestrutura sem necessidade de funcionalidade nova na tela read-only V1-21. |
| 089 | NFR-005 | TRANSVERSAL | Exibir status de processamento oficial e mensagens de andamento, sem executar OCR/IA no request. |
| 090 | NFR-006 | NÃO IMPLEMENTAR NA V1-21 | RNF operacional de infraestrutura sem necessidade de funcionalidade nova na tela read-only V1-21. |
| 091 | NFR-007 | NÃO IMPLEMENTAR NA V1-21 | RNF operacional de infraestrutura sem necessidade de funcionalidade nova na tela read-only V1-21. |
| 092 | NFR-008 | NÃO IMPLEMENTAR NA V1-21 | RNF operacional de infraestrutura sem necessidade de funcionalidade nova na tela read-only V1-21. |
| 093 | NFR-009 | APLICÁVEL | Paginação server-side de relatórios, apontamentos e listas, com limites por solicitação e filtros tenant/contrato. |
| 094 | NFR-010 | CONDICIONAL | Observabilidade backend é obrigação sistêmica, sem novas métricas/client instrumentation nesta tela sem autorização. |
| 095 | NFR-011 | TRANSVERSAL | Erros de rede e recuperação por recarregamento sem retry automático de ação crítica. |
| 096 | NFR-012 | NÃO IMPLEMENTAR NA V1-21 | RNF operacional de infraestrutura sem necessidade de funcionalidade nova na tela read-only V1-21. |

## Requisitos transversais além dos números

- **Autorização:** leitura exclusivamente com usuário autenticado, contrato validado por `obterContrato` e verificação da organização corrente. Filtros `id_organizacao` e `id_contrato`; backend/RLS é autoridade. Nenhum dado de outro contrato nem organização.
- **Privacidade:** não exibir automaticamente trecho integral/fundamentação sensível ou objetos `Json` arbitrários; links/download somente quando backend autorizar explicitamente. Dados oficiais e texto simples protegido por React.
- **Não falsificar histórico:** não sintetizar respostas/desfechos, score/criticidade, origem documental, nem gerar regra preventiva no navegador. Distinguir fonte do relatório e estados em processamento.
- **Volumetria:** paginação real no backend para relatórios, apontamentos e precedentes, sem N+1 ilimitado e sem carregar todos os dados para filtrar no browser.
- **Segurança operacional HML A/B:** permanece `NÃO VERIFICADO`, facultativo após regular PROMPT 99 conforme decisão expressa do titular; não bloqueante isolado, sem dispensar revisão estática e testes frontend.
- **QA:** exigir PLAN→GATE→BUILD TDD RED/GREEN, RNF, BRAND-01, 4 larguras×2 temas, GOV-020, CI e Teste C independente em SHA fixo. Nunca alegar E2E HML privado a partir de mocks.

## Conclusão

**Triagem de aplicabilidade 97/97 documentada.** A fonte integral do PROMPT 42 foi lida do ZIP autenticado, mas o teste operacional multi-tenant não foi realizado; a prova permanece pendência facultativa pós-99. O PLAN e o GATE de BUILD permanecem etapas separadas; esta matriz não autoriza implementação ou merge por si.