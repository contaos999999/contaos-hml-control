# ContaOS 4.1 — Auditoria independente de equivalência de processo: Lovable × GitHub
**Data:** 03/11/2026 · **Natureza:** comparação normativa e de controles concretos, não certificação funcional integral · **Escopo de alteração:** repositório frontend exclusivamente.

## 1. Resposta à decisão do responsável
**Objetivo:** preservar exatamente todas as exigências do desenvolvimento anterior (PRD Mestre 4.1, Premissas, Arquitetura, Zero-Drift, Manual de Ambiente, PROMPTs regulares 00–99, atômicos 000–096, identidade visual BRAND-01, RNFs, segurança, auditoria/fontes/rastreabilidade, validação de PLAN e Teste C), modificando **somente o executor do código frontend**: Lovable AI → desenvolvimento direto no GitHub. Supabase permanece autoridade exclusiva do backend.

**Veredicto do exame:** equivalência de **regras normativas e tecnologia da aplicação** no âmbito analisado, com gates documentais/CI adicionais instalados no GitHub; **equivalência operacional de todas as provas NÃO CERTIFICADA** devido a limitações externas de branch protection, navegação visual independente, acesso autenticado A/B e validação humana/semântica que o CI não consegue substituir.

## 2. Baselines e verificação real
| Elemento | Fonte confirmada |
| --- | --- |
| Código React/TypeScript, componentes, rotas e dependências | Repo `contaos9999/contaos-hml-control`, HEAD `21416e1685f00344cd7e8e790a507fbfed3a53cc`; **nenhum arquivo de implementação `src/**` ou `public/**` foi alterado na conversão de processo** |
| Lovable conectado (apenas visualização/sincronização) | Projeto `b113dd59-6caf-4c92-8302-457a037a0c6f`; `latest_commit_sha` consultado = **o mesmo SHA do GitHub frontend**, comprovando sincronização nesse instante |
| Normas canônicas | `contaos9999/develop` HEAD `cb65f4980f4eeca6ccd33caf6198a801b7e60328`, **não alterado nesta auditoria** |
| Contexto canônico | `docs/frontend/CONTEXT_CANONICO_4_1_SNAPSHOT.json`: 25 documentos `00–20` com `08A–08D` e Git blob SHA individual |
| Catálogo original | `docs/prompts/PROMPT_TRACKS_4_1.json` no repo normativo: 100 regulares 00–99, 97 atômicos 000–096, 96 requisitos PRD/NFR; proveniência de DOCX/ZIP por SHA-256. Essa conferência de índice **não equivale à prova de 100/97 implementados** |
| Rito de mudança | `docs/frontend/ADR-DEV-001-GITHUB-DIRETO.md`, `ADR-DEV-002-PROMPT-PLAN-GATE-BUILD-TESTEC.md`, `AGENTS.md` e Project Knowledge do Lovable |
| CI do PLAN documental | https://github.com/contaos9999/contaos-hml-control/actions/runs/41732038105 — SUCCESS |
| CI do guard de paridade final | https://github.com/contaos9999/contaos-hml-control/actions/runs/41733336741 — SUCCESS |
| Suíte da versão auditada | 13/13 cenários sintéticos de guard; 812/812 Vitest em 28 arquivos; lint, TypeScript, build e Zero-Drift PASS |
| `types.ts` protegido | Blob `8ea7750b75fd9d76b29c36ce7613392e3ab65e19`; Auto-Lock já provou recuperação em push real https://github.com/contaos9999/contaos-hml-control/actions/runs/41725182728 |
| Plano ativo | `SEM_PLANO_ATIVO`; nenhum novo BUILD de aplicação autorizado |

## 3. Matriz de equivalência

| Camada ou regra | Lovable anteriormente | GitHub direto após saneamento | Resultado |
| --- | --- | --- | --- |
| Runtime React + TypeScript | Código React/TS na árvore ligada ao Lovable | Mesma árvore e versões; apenas autoria muda | **Equivalente no código** |
| Backend Supabase HML exclusivo | Única fonte e autoridade do negócio, RLS/RPC | Sem alteração; UI consome contratos autoritativos existentes | **Mesma exigência** |
| PRD/Premissas/Arquitetura | Hierarquia absoluta 4.1 | Hierarquia mantida em AGENTS/ADR; 25 fontes canônicas em snapshot | **Mesmo requisito** |
| Prompts regulares 00–99, atômicos 000–096 | Dois conjuntos cumulativos | Mesmo índice original 100/97, prova SHA e crosswalk por PROMPT antes do BUILD | **Mesmo catálogo; correlação semântica individual continua obrigatória** |
| PLAN antes do BUILD | Plan Mode, revisão/aprovação do plano | Documento do PLAN + gate VALIDADO + CI em commit anterior ao primeiro BUILD | **Mesmo rito, implementação de aprovação diferente** |
| Aprovação humana específica | Gate de aprovação do Lovable quando aplicável | Autorização humana obrigatória em BRAND-01 e demais hipóteses previstas, evidência no PLAN; autorização de backend previamente solicitada | **Mesma exigência; prova de concessão precisa verificação independente** |
| Arquivos permitidos, menor diff, proibição backend | Plano com allowlist, fonte de verdade Supabase | `frontend-scope-gate.mjs` recusa código sem PLAN, arquivos fora da lista, migrations/integração, exige PR validado | **Reforço automatizado no CI** |
| Context Gate original | Documentos 00–20, 08A–08D e manifesto da tarefa | Snapshot de 25 Git blobs + declaração de leitura, fonte e commit SHA exigidos para PLAN | **Alinhado no gate local; HEAD remoto exige consulta em cada novo PLAN** |
| Bloco literal transversal de Zero-Drift | Exigido no texto de cada PROMPT/PLAN/BUILD/TESTE | Template inclui íntegra do §11.3, guard bloqueia PLAN sem título literal | **Requisito preservado** |
| BRAND-01 / identidade oficial | Assets/tokens oficiais, mínimo delta, 4 breakpoints × 2 temas | Mesmos assets e `ContaOSMarca`, guard de brand/CI, revisão visual ainda obrigatória | **Igual regra, prova de browser pendente por feature futura** |
| NFR, segurança, rastreabilidade, fontes | Auditoria e matriz de critérios | Matriz/dossiês continuam, lint/TS/Vitest/build/guard; dados, status e cálculos do Supabase | **Igual exigência; testes positivos/negativos reais dependem do caso** |
| TDD RED→GREEN e regressão | Testes locais + CI | Estratégia de TDD exigida por PLAN, 812 regressões/CI verdes; RED/GREEN futuro deve ser registrado por mudança | **Igual regra; CI por si só não prova histórico RED** |
| Teste C read-only e independente | Browser isolado do Lovable; 254 capturas anteriores, temporárias | Teste C obrigatório em SHA imutável com screenshots duráveis e 4×2; **não é executado automaticamente pelo workflow GitHub** | **PENDENTE comprovação do executor independente** |
| Segurança de branch | Governança/CI, Lovable Git sync | CI pós-push + Auto-Lock, branch `main` sem proteção efetiva verificada | **PENDENTE branch protection obrigatória** |
| Sincronização Lovable | Plataforma edita e pode regenerar `types.ts` | GitHub é editor canônico, Lovable apenas visualiza; sua integração **ainda pode regenerar types** | **Risco de plataforma remanescente, mitigado por Auto-Lock** |
| Produção | Proibida na fase HML | Proibição mantida; nenhum deploy/prod alterado nesta auditoria | **Idêntico** |

## 4. Lacunas residuais, sem homologação artificial

1. **Branch protection:** o GitHub retornou 403 na leitura/configuração de proteção; `main` aparece `protected=false`. O guard roda **depois** do push; não impede um ator com escrita direta de publicar commit inicial defeituoso. Para garantir status check antes do merge, habilitar ruleset/branch protection com permissão/plano adequados e obrigar PR.
2. **Teste C independente sem Lovable BUILD:** nenhuma Action executa Playwright/browser completo com 4×2 temas/estados/screenshots em artefato durável. O processo exige um **executor independente** (Playwright/GitHub Actions ou ferramenta equivalente) antes do PASS visual. O relato anterior do Lovable usou MOCK e imagens em `/tmp`, não arquivadas; ele não equivale a E2E autenticado real.
3. **HML E2E real:** não existe prova atual de A/B entre organizações, upload e recuperação real de senha com titulares; a existência de 812 testes não substitui RLS/tenant real. Ref. pendências `contaos9999/develop#33`, `#34`, `#35`; requer pré-condições autorizadas.
4. **Fonte viva do backend:** o snapshot documental fixa 25 blobs no HEAD fonte verificado, mas o CI do frontend não compara automaticamente o HEAD privado remoto. É obrigatório conferir novamente no começo de cada PLAN, sem investigar schema/RLS/RPC sem autorização.
5. **Correlações semânticas dos 100/97:** o índice oficial documenta integridade numérica, mas algumas relações entre requisitos transversais e telas ainda exigem revisão do texto integral em cada prompt. O gate não converte um mapeamento estrutural por tela em certificação material.
6. **Aprovação humana/CI do PLAN:** os campos `PASS` e URL do CI no manifesto exigem confirmação externa de quem decidiu e se o run corresponde ao SHA do PLAN. O script não consegue provar sozinho autenticidade da decisão humana ou o sucesso do URL registrado.
7. **Proteção de plataforma:** o gerador de `types.ts` não foi desativado dentro do Lovable; Auto-Lock corrigiu um incidente real, mas não elimina drift transitório no editor.

## 5. Regra operacional final imutável

**PROMPT regular + TODOS os atômicos pertinentes → leitura/citação das fontes canônicas/SHAs → PLAN sem editar aplicação → VALIDAÇÃO com todas as exigências oficiais e aprovações humanas específicas → commit documental do PLAN e CI SUCCESS → BUILD mínimo no GitHub apenas de caminhos allowlisted → TDD/segurança/regressão/CI/Zero-Drift → TESTE C separado READ-ONLY em SHA fixo, visual e E2E quando aplicáveis → evidência SHA e dossiês → checkpoint e próximo PROMPT.**

Se qualquer requisito exigir mudança em Supabase: **PARAR e solicitar autorização expressa do responsável antes de passar ao fluxo do repositório backend para investigar**. Depois, somente se comprovada lacuna real, PROMPT/PLAN/validação/BUILD limitados em HML, certificação e retorno obrigatório ao frontend. Nenhum refactor/desvio do PRD, premissas, regras de 100%, prompts e identidade é permitido.

## 6. Conclusão técnica
- **Não há razão técnica para esperar diferença de resultado da aplicação em commits com a mesma árvore de código**, independentemente da IA autora. As regras do projeto não mudam com o editor.
- **Não é correto certificar equivalência operacional 100% ou homologação de 39/39 apenas porque o novo pipeline está verde**. Os controles de browser, sessão real, upstream vivo e aprovação/branch precisam provas adicionais.
- O procedimento GitHub ficou **pelo menos tão explícito e controlado documentalmente** quanto a fase anterior, e possui guardas automáticos novos. A exigência de qualidade e do PRD é idêntica, mas a ferramenta de execução do Teste C e o enforcement pré-merge ainda precisam de solução própria.

**Alterações nesta auditoria:** somente arquivos de governança/CI no repo frontend; código funcional `src/**`, design `public/**`, backend Supabase HML e PROD preservados. Não confundir análise documental do repositório canônico com investigação técnica do backend HML.
