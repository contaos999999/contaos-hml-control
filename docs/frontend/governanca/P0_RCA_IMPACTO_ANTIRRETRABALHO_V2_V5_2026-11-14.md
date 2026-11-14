# P0-RCA-001 — Protocolo obrigatório de causa raiz, análise de impacto e antirregressão (V2–V5)

**Origem:** diretriz expressa do titular em 14/11/2026, decorrente das falhas recorrentes, retrabalho e consumo excessivo de tempo/tokens na implementação da V1. **Estado:** documento integrado à main pela PR #659/merge `77bb34cd00afc863bd31055984b7275a4eb0310d`, com revisão independente formal da PR #659 não demonstrada; automação do P0-RCA exige CI/revisão/merge próprios sob PLAN #660. Não certifica versões nem autoriza PROD.
**Abrangência:** toda atividade de desenvolvimento, correção, integração, teste, auditoria e certificação da V2, V3, V4 e V5; transversal também na auditoria global. Cobre falhas críticas, pequenas e intermitentes. **Não revoga** regras P0 existentes, PRD, segurança, HML, PLAN/GATE, aprovação humana, LOCK, GOV-020, BRAND-01 ou testes obrigatórios.

## I. Regra constitucional
Não autorizar BUILD de correção com causa-raiz apenas plausível, não reproduzida ou sem vínculo causal documentado, salvo contenção urgente explicitamente rotulada como temporária, autorizada e sem violação de controles. A análise antecedente é proporcional ao risco, **não superficial em falhas pequenas**; quanto maior a criticidade e blast radius, maior a profundidade da prova.
Nenhum defeito será considerado resolvido pela remoção isolada do sintoma: exigir teste que demonstre eliminação da causa e teste de ausência das regressões identificadas no grafo de impacto. É proibido reduzir teste, silenciar erro, relaxar permissão/guard ou alterar expectativas sem justificativa funcional para forçar PASS.

## II. Procedimento obrigatório por falha (RCA → IMPACTO → RED → BUILD → GREEN → AUDIT)
**RCA-01 — Baseline e sintoma:** registrar ID, categoria, gravidade, ambiente, HEAD frontend/backend, último merge, condições, esperado×observado, logs/trace sanitizados, repetibilidade, casos afetados e evidências. Diferenciar erro de código, contrato, dados, autenticação, CI, infraestrutura, ferramenta e caso de teste.
**RCA-02 — Causa raiz confirmada:** seguir caminho da entrada ao efeito e testar hipóteses concorrentes. Quando aplicável empregar 5 Porquês, árvore de falhas, bissecção, delta de commits, trace das chamadas frontend→RPC→banco e inspeção de cache. Exigir observação que falha antes e deixa de falhar após a correção, e justificar por que causas alternativas foram descartadas. "Plausível" ou "provavelmente" não autoriza implementação.
**RCA-03 — Mapa de impacto antes da solução:** inventariar componentes e consumidores diretos/indiretos por grafo; telas, roteamento, CRUD, relacionamentos, regras temporais, auth, RBAC/RLS, caches, APIs, migrations, Edge/Queue, documentos, BRAND, NFR, jobs, integrações com versões anteriores. Identificar novas falhas possíveis, impacto no certificado e como observá-las.
**RCA-04 — Projeto da correção:** comparar alternativas, escolher menor mudança **completa** que elimina causa e mantém invariantes, dependências e contratos. Escopo fechado de arquivos/ações, rollback e migração com evidência de compatibilidade; agrupar falhas que compartilham causa num único PLAN de subsistema, sem tornar PR grande demais para revisão.
**RCA-05 — RED causal:** reproduzir falha por teste focado e negatives sobre novos riscos; teste de regressão permanente com ID apontando RCA, contrato e origem. Falha não reproduzível requer investigação adicional e não conserto imaginado.
**RCA-06 — BUILD e GREEN:** alterar apenas escopo aprovado; rodar primeiro teste causal e negativos, depois contratos e grafo de dependentes, segurança e regressão; executar suites integrais, Teste C e CI em pontos canonicamente exigidos. O resultado GREEN inclui inexistência de regressões introduzidas.
**RCA-07 — Auditoria independente:** auditor verifica a cadeia causal, hipóteses, diff, risco de erro novo, provas e regressão de versões anteriores; revisão somente estética ou "passou teste" não é suficiente.
**RCA-08 — Registro e aprendizado:** atualizar ledger de defeitos, causa raiz, correções, testes antirregressão, versões impactadas, custo mensurável e lições sistemáticas. O aprendizado deve afetar preflight/template/teste, não virar nota isolada.

## III. Anti-loop e escalonamento
- **Até uma segunda tentativa da mesma causa:** exigir nova evidência diagnóstica antes de editar; duas tentativas que não eliminem a falha **acionam REVISÃO CAUSAL AMPLIADA** e suspendem patches adicionais naquele defeito até nova hipótese testável.
- **Qualquer regressão nova causada pelo patch:** tratar como falha de desenho de impacto, registrar nova aresta/dado omitido; parar a cadeia de correções reativas e reexaminar o conjunto; considerar revert do patch se for seguro. Não remendar silenciosamente por cima.
- **Retry sem delta causal verificável é proibido.** Exceções de sistemas externos transitórios exigem classificação, janela definida e prova da condição externa; nunca presumir que novo retry corrige problema estrutural.
- **Classe sistêmica:** falhas repetidas em diferentes telas do mesmo subsistema apontam para componente central, contrato ou invariantes compartilhados. Exigir investigação agregada e correção na origem, em vez de repetir patch local em cada tela.
- **Segurança crítica:** conter risco com medida autorizada, bloquear fluxo afetado e preservar evidências; não sacrificar controles de segurança para manter ritmo.
- **Sem causa confirmada:** status DIAGNÓSTICO, não BUILD aprovado nem CERTIFICADO.

## IV. Economia de tokens, créditos e testes sem redução de qualidade
1. Uma única recuperação de baseline e fontes canônicas por checkpoint/HEAD, revalidando apenas diffs e fontes alteradas. Leitura integral obrigatória é preservada quando o gate exigir.
2. Busca orientada por erro e dependências: arquivo/trecho relevante→mapa do fluxo→ampliação deliberada; não reler todo repo de forma cega.
3. Decompor implementação e auditoria em agentes/sessões independentes, com artefatos e HASH/HEAD estáveis; auditor não reexecuta sem necessidade toda descoberta do implementador.
4. Evitar tarefas duplicadas no Lovable/Codex/terminal, mensagens de tentativa em processamento e pipelines repetidos antes de delta.
5. Testes em camadas: RED causal→unitário direcionado→contrato/segurança→regressão por impacto→suite completa e Teste C nos gates obrigatórios. Não confundir teste focal com certificação final.
6. Prompts curtos com contexto exato, contrato de entrada/saída, arquivos e critérios; checkpoint GitHub continua como fonte de verdade. Preservar evidências válidas e jamais declarar PASS por cópia do histórico.
7. Custos/tokens são métricas opcionais **somente quando mensuráveis**. Não inventar números, nem trocar menor custo por menor cobertura.

## V. Política de prevenção obrigatória
Toda classe de defeito resolvida deve produzir ao menos um dos seguintes mecanismos duráveis, com justificativa: teste de regressão, validação de contrato, invariant assert, guard negativo, ferramenta de lint/typing, checklist de planejamento ou monitoramento de runtime. A prevenção deve ser proporcional ao mecanismo real e nunca alargar permissões de acesso.
Antes de novos módulos/telas, realizar **PREFLIGHT DE INTEGRIDADE:** baseline da versão herdada, contratos, types bloqueados, routes geradas, dependências, matriz RBAC/RLS, dados, migrações, CI/runners, deploy/credenciais e limites externos. Se um pré-requisito estiver bloqueado, resolver a origem antes de desenvolver consumidores dependentes.

## VI. Entregável obrigatório por correção
Ficha RCA com:
- ID, criticidade, status; data, versões e HEADs; sintomas e passos de reprodução;
- evidência da causa e das hipóteses descartadas; árvore de dependência e blast radius;
- matriz "mudança → possíveis novas falhas → teste preventivo", incluindo interação V1–V5;
- alternativas e justificativa da solução escolhida; allowlist e rollback;
- testes RED, GREEN, negativos, contratos, regressão e Teste C quando aplicáveis;
- resultados, artifacts, SHA, PR/CI, revisão independente e risco residual;
- melhoria de prevenção incorporada e próximo passo.

Não exigir documentação repetitiva manual para cada asserção. A ficha pode referenciar testes e logs existentes; o requisito é **prova causal e impacto**, não burocracia redundante.

## VII. Critérios de aceite e medição
Métricas rastreáveis: porcentagem de correções com RCA demonstrado; regressões causadas por patches; reincidência da mesma causa; retries sem delta; número de ciclos necessários por defeito; execução desnecessária de suites; dados de consumo de token apenas se obtidos de fonte real.
**Metas obrigatórias:** 100% de correções com RCA e análise de impacto proporcionais; 0 retries cegos; 0 regressões conhecidas e impeditivas integradas; 0 alteração de contrato/RBAC/RLS para satisfazer testes sem autorização. Não prometer "zero falhas futuras", impossível de garantir; exigir prevenção verificável dos riscos conhecidos.
**Regra de parada:** FAIL de RCA, impacto, regressão ou segurança = NO-GO naquele BUILD/merge/certificação. Nunca considerar economia como motivo de bypass.

## VIII. Integração acumulada como norma de qualidade
A cada versão: certificado individual + certificado interno + certificado acumulado com todas as anteriores, na sequência do [Plano Único V2](../planos/P0_V2_PLANO_UNICO_CERTIFICACAO_INTEGRACAO_CUMULATIVA_2026-11-14.md). O guard P0 de versões deverá ser ampliado por PLAN técnico próprio e testes negativos antes de ser declarado automatizado. O certificado funcional V1 existente permanece válido; a auditoria interna V1 em curso não será declarada concluída por inferência.
A cadeia de rastreabilidade contempla origem e predecessores **reais**, até V1 quando houver dependência, sem fabricar elos. Zero objetos obrigatórios órfãos e zero regressões conhecidas impeditivas.

## IX. Adoção, revisão e limites
Esta emenda documental será efetiva **somente após PR, checks exigidos, auditoria independente e merge na main**, preservando a cronologia e a proteção existente. Uma futura tarefa de reforço de automação do gate deve ser planejada separadamente, não disfarçada como simples documento. Não altera produto nem produção e não certifica a V2.

## X. Emenda de 14/11/2026: alcance estendido à V1 e a toda revisão

Por diretriz expressa do titular, em 14/11/2026, às 00h10 (Bahia), este protocolo passa a valer também para a integração funcional V1 em curso (fases 3 a 7 do plano mestre), sem esperar a V2, e para toda revisão independente, de qualquer versão. A transcrição fiel da diretriz, com a grafia original anotada, está no `AGENTS.md`, seção P0-RCA-001.

Caso que motivou a extensão: a PR #658 (BUILD-2b-1 da Fase 3) passou por sete rodadas de revisão. O registro está em `docs/frontend/auditorias/integracao-funcional-v1/fase3/BUILD2B1_INFRA.md`, seção "Causa raiz das rodadas de revisão". Três causas de projeto, tratadas como classe, encerraram o ciclo:
1. regras reimplementadas no validador em vez de replay;
2. referências escolhidas por quem chama;
3. fato observado tratado como erro.

O teste de propriedade com semente fixa e o teste de mutação passaram a ser a prova de que a correção fecha a classe e não abre falha nova.

Esta emenda não revoga nem relaxa nenhum item anterior deste documento, nem as demais regras P0.

## XI. Prova técnica RCA v2 e certificação live (emenda corretiva da revisão #5903137025)

Após a integração protegida do BUILD #661, a implementação técnica deverá obedecer ao esquema `contaos.p0.rca-report.v2` (nunca aceitar a antiga ficha v1 como prova de execução).

**Classificação de escopo:** alterações de produto V2–V5 não podem ser classificadas como V1 apenas pelo `PLANO_ATIVO.prompt_id`. O guard cruza paths com marcas V1–V5, allowlist da V1 comprometida **antes do BUILD**, baseline do Git e a matriz por arquivo `escopo[{arquivo,versao,justificativa}]`. Código novo não classificado ou V2+ sob PLAN 75 é NO-GO. Alteração legítima da V2 em consumidores da V1 requer cobertura explícita do impacto e regressão. A dispensa V1 é apenas para escopo pré-aprovado e sem arquivos identificados como V2–V5.

**Ficha RCA operacional:** `P0_RCA_ATIVO.json` somente por PLAN V2–V5, alterada no mesmo diff do BUILD, deve conter `schema`, `versao`, `prompt_id`, `baseline.frontend_sha`, `baseline.backend_sha`, `escopo` por arquivo, itens RCA com `causa.status=CONFIRMADA`, alternativas descartadas, `impacto.riscos[].teste_preventivo`, `testes.red/green/negativos/regressao` e rollback. Cada caso contém `id`, `runner` (node/vitest), `arquivo` e `caso` exato. RED contém adicionalmente `run_url` e `run_sha`. O CI verifica HEAD backend vivo com token canônico, baseline frontend pela base Git e a existência do caso testável, consulta logs de um RED que de fato falhou no SHA ancestral e executa os casos GREEN/negativos/regressão no HEAD auditado. Nome do teste sem execução comprovada não é evidência.

**Certificado cumulativo e autenticação live:** status PASS não equivale a texto em JSON; `scripts/p0-evidence-live-gate.mjs` exige para certificados novos revisão independente APPROVED no HEAD do PR, PR efetivamente merged à main, SHA do merge ancestral da main, workflow Zero-Drift e job Teste C SUCCESS no mesmo SHA, SHA256 das provas e correspondência binária dos artefatos com o arquivo existente no HEAD revisado. Exige todas as Fases 1–6 antes da Fase 7 interna/cumulativa (e fases 1–7 antes de um certificado funcional V2–V5 na Fase 8), com recibos por fase em `fases_anteriores`. Falta de token, API indisponível, fonte posterior ao PR, hash diferente ou review de autoria própria = FAIL, nunca PASS presumido. A comprovação V1 funcional histórica é preservada dentro de seu escopo, sem exigir migração fictícia.

Os validadores verificam evidências **que existem e podem ser testadas**; não substituem a auditoria de qualidade semântica dos casos, da integridade clínica/financeira nem a revisão independente do código. As suites e CHECKs existentes, Teste C, RBAC/RLS, HML-only e PROD proibido permanecem.


## XII. Fechamento técnico exigido na revisão independente #5903386404

**Eficácia:** somente após aprovação independente de Edivan5002, CI do HEAD aprovado e merge protegido da PR #661. A alteração de gate não certifica, por si, V1-interna ou V2–V5.

### Escopo V1 e governança

PLAN_ATIVO 75 não autoriza automaticamente implantação V2 em arquivo antigo ou em scripts. Alterações novas de aplicativo V1 devem entregar, no próprio diff, docs/frontend/rca/P0_ESCOPO_V1_ATIVO.json (schema contaos.p0.v1-scope-proof.v1), com baseline SHA, allowlist aprovada, mapa exato de arquivos V1, justificativas e testes reais executados no CI. Referências V2–V5 adicionadas ao diff bloqueiam classificação V1. A análise semântica do código continua obrigatória na revisão independente; uma mera declaração textual não a substitui. Certificações históricas continuam válidas em seu escopo.

Mudanças em scripts ou workflows sob PLAN 75 exigem um PLAN de governança previamente integrado à main, vinculado ao número da PR e com allowlist fechada. PRs futuras podem usar docs/frontend/planos/P0_GOV_PLAN_<numero>.json, com approved:true, pr_number e files, integrado por PR protegido antes do BUILD. A exceção inicial para #661 é **exclusiva da PR #661**, apoiada no PLAN #662 integrado e nos sete caminhos de governança ali relacionados. Não é autorização reaproveitável para outra PR.

### Preflight de NOVA_FUNCIONALIDADE

Aceitar somente preflight.status=VERIFICADO com baseline_sha igual ao baseline real, arquivo evidência sob docs/frontend/auditorias/preflight/ e arquivo_sha256 validado contra bytes efetivamente versionados no SHA do CI. Exigir quatro testes executáveis independentes com tipo CONTRATO, RBAC_RLS, DADOS_INTEGRIDADE e DEPENDENCIAS. Cada teste tem id, runner, arquivo e caso exato; a etapa operacional executa os quatro no HEAD e rejeita testes faltantes, skipped ou não aprovados. Texto como "preflight conferido" não é prova.

### Certificação em duas PRs protegidas: solução antideadlock

**PR A, evidências ainda PENDENTE:** gerar evidências de fases 1–6 e certificado de fase7, ou fases 1–7 e fase8 para funcional; incluir matriz, grafo e relatório autenticado de HML sob diretórios canônicos. Obter a revisão independente no HEAD da PR A, executar o Teste C realmente aplicável com Playwright e artefatos de screenshots e SHA256SUMS. Se a PR A for só documental, executar o workflow Teste C por workflow_dispatch no mesmo SHA: a dispensa por escopo administrativo nunca vira prova E2E. Integrar PR A por merge protegido, conferir recibos e provas na main. O manifesto permanece PENDENTE.

**PR B, ativação PASS:** só após o merge A preencher o manifesto com PR merge SHA de A, review APPROVED no HEAD A por autor independente, CI de A, SHA256 dos documentos, recibos das fases anteriores, teste_c_run_url da execução efetiva do Teste C no SHA de A e hml_e2e com ambiente HML_AUTENTICADO, arquivo_evidencia, arquivo_sha256, casos, run_url e tested_sha. O verificador confere no GitHub REST o workflow ContaOS Trilha A Autenticada efetivamente SUCCESS na main, job privado, etapa de auditoria com contas sintéticas, SHA256SUMS e artifact não expirado. O tested_sha deve ser ancestral do HEAD revisado sem mudanças em código, executores ou contratos desde o teste. Um relatório HML textual sem run real não certifica. O CI da PR B autentica tudo pelo GitHub REST, confirmando PR A merged na main, SHA ancestral, review, CI, steps Playwright SUCCESS, upload SUCCESS, artifact existente e relatório HML no SHA revisado. Após outro review independente de B e CI aprovado, merge protegido da ativação e readback. Essa sequência evita exigir que a PR B já esteja merged para validar a própria PR B.

Um Teste C com job SUCCESS, mas Playwright e evidências SKIPPED, permanece aceitável em PR administrativa; é NO-GO para certificado final de integração. Relatórios HML não são presumidos, e os testes só provam o que efetivamente executam. Não criar certificados artificiais nem reabrir versões já certificadas sem delta invalidante.

### Gates de aceite

Os testes negativos devem reproduzir bypass em scripts sob V1, classificação falsa de V2 em arquivo V1, preflight apenas textual, Teste C SKIPPED, artefato/HML ausente, hash e SHA incompatíveis e PR não merged. Zero-Drift e LOCK no HEAD final + nova auditoria independente APPROVED são obrigatórios antes do merge de #661. PROD proibido.
