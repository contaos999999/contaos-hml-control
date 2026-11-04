# P0-VERSION-FIRST-001 — Regra canônica de PRIORIDADE ZERO: desenvolver e certificar por versão

**Decisão expressa do responsável pelo ContaOS 4.1, 04/11/2026 (Brasília). VIGÊNCIA: imediata após merge protegido.** Esta regra é **aditiva**, obrigatória para qualquer pessoa, agente de IA, plugin, automação, Lovable, GitHub, Supabase, CI, documentação e ferramenta de desenvolvimento do ContaOS. **Não revoga nem relaxa PRD, segurança/RLS, TDD, BRAND-01, GOV-020, Zero-Drift, bloqueio de tipos, 25 fontes canônicas, 100 regulares/97 atômicos, RNFs, ruleset ou aprovação humana quando exigida.**

## A ordem de execução mudou; o conteúdo dos prompts NÃO

**PRIORIDADE ZERO = ORDEM FUNCIONAL V1 → V2 → V3 → V4 → V5 → CERTIFICAÇÃO GLOBAL**, e **NÃO** a ordem numérica simples dos prompts regulares. É proibido abrir PLAN/GATE/BUILD de uma versão seguinte enquanto a versão anterior não tiver **todas as telas e requisitos aplicáveis entregues, testados, auditados, validados e certificado próprio integrado ao GitHub**, com CI e Teste C. Nenhuma declaração verbal, mock, número do prompt ou tela isolada equivale a certificação.

Os **100 prompts regulares 00–99** e os **97 prompts atômicos 000–096** permanecem integralmente obrigatórios. Cada ID requer rastreabilidade com o texto original e evidência individual de execução/avaliação e decisão. **Atômicos não são 97 telas extras**; são 1 BRAND-01 + 84 requisitos funcionais + 12 RNFs, aplicados no PLAN, BUILD e certificação pertinente, inclusive se um mesmo requisito impactar várias telas. O caderno atômico 000–096 não pode ser reduzido a “lista conferida” como se isso provasse 97/97 testes.

## Cronograma CANÔNICO de execução dos regulares ainda restantes

O bloco **00–42** constitui o histórico legado de implementação; sua conclusão individual e certificação retroativa **não podem ser presumidas** só porque o PROMPT 42 foi integrado. A última entrega funcional comprovadamente integrada antes da decisão P0 foi **42/V1-21**, PR #62, checkpoint PR #63, frontend `main@bd3b0631837f404e569d94b4a80deeba306877a9`.

| Ordem de execução | Versão / bloco | IDs regulares exigidos | Quantidade restante |
| --- | --- | --- | ---: |
| 1 | **Fechar V1** | **43/V1-22; 75/V1-23**. Revisar/certificar retrospectivamente 00–42 | 2 |
| 2 | **Fechar V2**, só após certificado V1 | 44, 45, 46, 47, 48, 49, 76, 77 | 8 |
| 3 | **Fechar V3**, só após certificado V2 | 50, 51, 52, 53, 54, 55, 78, 79 | 8 |
| 4 | **Fechar V4**, só após certificado V3 | 56, 57, 58, 59, 80, 81, 82, 83 | 8 |
| 5 | **Fechar V5**, só após certificado V4 | 60, 61, 62, 63, 64, 65, 66, 84, 85, 86, 87, 88, 89 | 13 |
| 6 | **Auditar todo o sistema V1–V5**, após certificação V5 | 67–74 e 90–99, **todos, sem exclusões** | 18 |
| | **Total de regulares ainda a executar** | 43–99 reorganizados por versão | **57** |

O PROMPT 74 contém GO/NO-GO intermediário no manual. Quando executado após as cinco versões, sua conclusão **não substitui** a certificação final do PROMPT 99. O PROMPT 89 é funcionalidade complementar V5-11, não uma tela adicional inventada. Caso uma atividade transversal seja necessária à segurança de versão em andamento, **realize a verificação técnica aplicável antes do certificado**, mas registre o regular 67–74/90–99 apenas quando sua etapa global for formalmente executada; não duplique efeitos nem antecipe o GO de produção.

## Ordem e responsabilidade dos 97 atômicos

- **000**: BRAND-01; obrigatório transversal e verificação a cada tela e certificação visual.
- **001–024**: 24 requisitos V1; exigidos para certificar V1, inclusive correspondências retroativas.
- **025–043**: 19 requisitos V2; exigidos para certificar V2.
- **044–054**: 11 requisitos V3; exigidos para certificar V3.
- **055–074**: 20 requisitos V4; exigidos para certificar V4.
- **075–084**: 10 requisitos V5; exigidos para certificar V5.
- **085–096**: 12 requisitos não funcionais, de NFR-001 a NFR-012; transversais em **todas as versões** e reavaliados integralmente no bloco de certificação global, com ensaios operacionais quando exigidos.

**Total imutável = 1 + 24 + 19 + 11 + 20 + 10 + 12 = 97.** Cada PLAN deve mapear seu prompt regular aos atômicos diretamente aplicáveis, aos transversais pertinentes, exclusões justificadas, RNF e provas, sem alterar os IDs ou usar correlação estrutural como homologação.

## Gates de saída de V1, V2, V3, V4 e V5: NENHUM SALTO

Para cada versão, consolidar **certificado versionado em GitHub** antes de abrir PLAN da versão seguinte:
1. Inventariar **todas** as telas e prompts dessa versão e o histórico herdado; apontar evidência de cada regular, sem marcar 00–42 como 100% certificado por presunção.
2. Confirmar os atômicos próprios, BRAND-01 e NFRs aplicáveis com matriz ID→implementação→teste→resultado. **FAIL/NÃO VERIFICADO obrigatório impede certificado PASS**; itens legítimos não aplicáveis devem justificar N/A.
3. Validar contratos reais do Supabase HML e autoridade RLS/ACL, sem fabricar resultados de E2E autenticado; separar certificação já existente de evidência ainda não obtida. Manter decisão expressa: prova operacional RLS HML A/B entre organizações **NÃO VERIFICADA, FACULTATIVA APÓS REGULAR 99 E NÃO BLOQUEANTE ISOLADAMENTE ao desenvolvimento**; outros controles não dispensados.
4. Testar TDD, regressão, segurança, idempotência/concorrência conforme necessidade, PT-BR, acessibilidade, responsividade 1440/1280/768/390, claro/escuro, BRAND-01 e GOV-020. Exigir **dois checks CI obrigatórios SUCCESS no mesmo SHA**, Teste C independente, evidências/artefatos, escopo e rollback.
5. Emitir parecer **PASS**, **NO-GO** ou **PENDENTE** com lacunas e impedimentos; certificar PASS **somente com provas verificáveis** e PR integrado à main. Não tratar um checkpoint ou plano como substituto de teste.
6. Se NO-GO, **corrigir dentro da versão atual** via novo PLAN/GATE/BUILD até certificá-la. Não pular para a versão seguinte, ainda que o próximo número regular pertença a ela.

## Gate final de todo o ContaOS

Após V5 certificada, executar e evidenciar **todos os regulares 67–74, 90–99**; conferir **100/100 regulares com evidências**, **97/97 atômicos examinados e comprovados em seu escopo**, **84/84 RF**, **12/12 NFR**, integridade de fontes, segurança, testes reais aplicáveis, backup/restore, cadeia de evidência, proteção da marca e Zero-Drift. Emitir **GO/NO-GO para produção** com ressalvas honestas. **PROD não será alterado/promovido automaticamente**; promoção exige rito próprio e aprovação expressa do responsável. Teste opcional HML A/B pós-99 permanece marcado conforme decisão do titular, sem falsificar prova.

## Precedência, ferramenta de acompanhamento e bloqueio automático

- P0 tem precedência **somente para sequenciamento e certificação por versão**, por decisão mais recente e expressa do titular. **Regras técnicas/legais/de segurança existentes não são substituídas**; eventual conflito deve gerar PLAN e decisão documentada, não bypass.
- **Leitura obrigatória, antes de qualquer PLAN ou código:** `AGENTS.md`, **este documento**, `docs/frontend/governanca/P0_ORDEM_POR_VERSAO_4_1.json`, `docs/frontend/ESTADO_E_RETOMADA_CONTAOS_4_1.md`, o manifesto do PLAN, os 25 documentos e fontes canônicas atuais. Conferir HEAD dos dois repositórios e não confiar só na memória.
- **Controle de CI:** `scripts/p0-version-order-gate.mjs` e testes negativos verificam inventário completo, sequência V1→V5, atômicos, certificado de versão anterior e próximo regular aplicável; o workflow Zero-Drift executa esse guard. Não remover ou relaxar a regra para acelerar.
- O registro estruturado é `P0_ORDEM_POR_VERSAO_4_1.json`: atualizar recibos de integração e certificados **somente com PRs, commits, CI e arquivos de evidência reais**. Estado inicial: **V1 ainda NÃO CERTIFICADA**, próximo regular 43/V1-22, depois 75/V1-23. Atualizar checkpoint a cada bloco; bloquear V2 até a certificação V1.
- Não executar novamente um prompt concluído com prova ainda válida; revisitar retroativamente o que carecer de evidência. Não confundir identificação de 100/97 com execução integral de 100/97.

**SISTEMA DE FONTES:** catálogo original `contaos999999/develop/docs/prompts/PROMPT_TRACKS_4_1.json`, commit `a10d3b1a1a14276c017027f93ec2a7aace4d6cb6`; manual regular SHA256 `8a15d96568d021ac86fdd45e79038e2cb969d69c12b2edb84f012a6129b8940e`, caderno atômico SHA256 `d9faaae47de4b697b18ad7fb71e4738384514936813cd5b18779f4cb8aed83b8`.
