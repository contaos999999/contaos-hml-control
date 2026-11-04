# ContaOS 4.1 — Auditoria independente de equivalência de processo: Lovable × GitHub
> **ATUALIZAÇÃO GOV-006 (04/11/2026):** o texto de 03/11 abaixo é histórico. A constatação de `main` desprotegida e ausência de executor Playwright foi **superada** pelos GOV-003/GOV-004 e GOV-002. O parecer atualizado e suas ressalvas estão na seção 7; não reutilizar os status antigos como situação atual.

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


## 7. Reavaliação oficial GOV-006 em 04/11/2026 (prevalece sobre conclusões anteriores)

**Baseline verificado:** frontend `contaos999999/contaos-hml-control` main `79eec9b810b722cb2626f03039cac30b68a1dfce`; backend normativo, somente leitura, `contaos999999/develop` main `cb65f4980f4eeca6ccd33caf6198a801b7e60328`. O blob `types.ts` é `8ea7750b75fd9d76b29c36ce7613392e3ab65e19`. A aplicação React/TypeScript, `src/**` e `public/**`, permanece funcionalmente sem modificações nos 37 commits de governança posteriores ao SHA `b8ca8b99b31c65ceccfe6091b5e7bcaad1cf80f0`.

### 7.1. Matriz retificada das lacunas

| Lacuna registrada em 03/11 | Comprovação atual | Classificação 04/11 |
| --- | --- | --- |
| Proteção de branch inexistente | Ruleset `ContaOS-Zero-Drift-main` ID `26495643` **ACTIVE**, alvo `main`, PR, 2 required checks, 0 reviews, nenhum bypass, deletion/non-fast-forward proibidos. GOV-004: push direto 409; merge CI negativo 405; merge CI verde e 0 reviews no PR #15 | **RESOLVIDA e comprovada para regras principais**; testes destrutivos de force-push e delete não foram executados na main |
| Teste C inexistente no GitHub | Implementado no GOV-002, workflow `contaos-teste-c-independente.yml` e `scripts/testc/visual-audit.mjs`. Run `41737621829` PASS, 184 combinações, 24 capturas, 24 PASS público, 0 FAIL público. Artefato ID `13280975443` confirmado, expira em **03/12/2026** | **EXECUTOR RESOLVIDO, certificação limitada**: 152 protegidas sem sessão, 8 drawer sem sessão, contraste WCAG especializado NÃO VERIFICADO; prova expira em 30 dias |
| Fonte privada não conferida automaticamente | Context gate/100 regulares e 97 atômicos; token GitHub com leitura do repo `contaos999999/develop`; teste vivo `FONTE CANÔNICA PASS` no CI GOV-003 | **RESOLVIDA para comparação técnica de HEAD/blobs**; leitura semântica individual ainda é gate obrigatório por tarefa |
| Revisão humana no PR obrigatória | Regras da branch exigem **zero** revisões (decisão do titular); PLAN com aprovação explícita quando exigida por BRAND-01/PRD permanece | **ALINHADO**; zero reviews de PR não substituem eventual aprovação específica de produto |
| E2E real HML A/B, recuperação de senha, CRUD/upload | Não executado nesta auditoria, sem dois usuários e contratos controlados | **NÃO VERIFICADO** (também não comprovado no processo anterior; não atribuir diferença ao editor) |
| Prova contínua da sincronização Lovable | Projeto Lovable `b113dd59-6caf-4c92-8302-457a037a0c6f` informa `latest_commit_sha=b8ca8b99...`; GitHub 37 commits de governança à frente, nenhum `src/**` ou `public/**` alterado | **NÃO VERIFICADO nos metadados**, sem prova de divergência funcional nem sincronização no SHA atual |
| Auto-Lock recovery | Workflow atual na `main` abre PR de reparo, sem push direto. Run limpo `41762615464` SUCCESS | **PASS caminho sem drift; NÃO VERIFICADO criação real de PR após drift** |
| Matriz de requisitos 39/416 e 100/97 | Catálogos e matrizes permanecem, com pendências e resultados por critério | **Rastreabilidade preservada; 100% de critérios materialmente comprovados não certificado** |

### 7.2. Limites da expressão 100% equivalente

- Mesmo SHA e mesma árvore funcional de aplicação produzem o mesmo comportamento esperado independentemente da ferramenta autora, mas **não** demonstram por si só equivalência de workflow e evidência.
- O CI `SUCCESS` do Teste C em commit **somente documental** pode registrar `N/A`, logo não equivale a uma execução visual nesse commit. A execução real documentada é `41737621829`, e sua cobertura é explicitamente escopada a páginas públicas ou bloqueios sem sessão.
- O artefato existente tem retenção de 30 dias e expira em 03/12/2026. Para preservar evidência por período superior é necessário configurar arquivo durável independente, sob controle de acesso, sem dados pessoais ou tokens. Não afirmar \"permanente\" enquanto depender apenas do Actions.
- Ferramentas automáticas de acessibilidade capturam parte das violações, mas não substituem testes de contraste/instrumentação e cenários de teclado/manual aplicáveis. É obrigatório medir e registrar o escopo efetivamente analisado.
- O projeto do Lovable retorna SHA anterior; `git compare` verificou apenas alterações administrativas, então o risco é de **metadados/sincronização sem prova atual**, não de diferença demonstrada no frontend funcional.
- A validação semântica de 25 fontes, provas de aprovação humana específica e E2E com sessão real exigem procedimentos próprios. O PRD continua superior a um green CI.

### 7.3. Prioridade para alcançar equivalência operacional auditável

1. Incrementar Teste C com prova de contraste WCAG e teclado/labels para telas efetivamente renderizadas, reportando falhas em vez de inventar PASS.
2. Preservar capturas e `SHA256SUMS` em repositório/arquivo durável autorizado, ou ajustar retenção e plano de exportação, mantendo artefato original preservado até migração.
3. Comparar estado de sincronização Lovable após commits novos, sem usar a IA do Lovable para BUILD, e separar diferença de SHA administrativa de divergência funcional de UI.
4. Ampliar HML apenas com identidades autorizadas, organizações/contratos fictícios, canal de e-mail controlado e evidências reais, mediante escopo separado. Sem isso, `NÃO VERIFICADO`.
5. Ensaiar Auto-Lock completo em **ambiente isolado** que permita criar PR sem modificar `main`, nunca corromper o arquivo protegido real para simular incidente.

**Conclusão atualizada:** a troca de Lovable IA por desenvolvimento GitHub preservou código, PRD e arquitetura. Os controles de branch e executor Teste C já existem e foram exercitados; entretanto, evidência visual interna/autenticada, mensuração WCAG, retenção durável, sincronização de metadados e recuperação real do Auto-Lock ainda exigem provas. **A equivalência operacional integral NÃO está certificada.**
