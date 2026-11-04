# ADR-DEV-002 — Rito obrigatório PROMPT → PLAN → VALIDAÇÃO → BUILD → TESTE C

**Status:** APROVADA pelo responsável pelo ContaOS 4.1 · **Data:** 03/11/2026 · **Escopo:** somente frontend.

## Invariantes antes de qualquer ação

**Fonte de verdade do frontend:** `contaos999999/contaos-hml-control`. O Lovable fica conectado para sincronização e visualização, **sem utilização da IA de BUILD**. A arquitetura, PRD 4.1, Premissas, NFRs, PROMPTs regulares 00–99, prompts atômicos 000–096, BRAND-01, manual de ambientes, requisitos funcionais, fontes, rastreabilidade e Zero-Drift são vinculantes.

**Escopo fechado:** NÃO alterar Supabase HML ou PROD; nem schema, migrations, RLS, grants, RPCs, Edge Functions, Storage, triggers, policies, Auth, dados, segredos, chaves, integrações protegidas ou contratos de API. Nenhuma alteração no repositório backend `contaos999999/develop` faz parte de uma tarefa exclusivamente frontend. **Não editar ou regenerar** `src/integrations/supabase/types.ts`: blob imutável `8ea7750b75fd9d76b29c36ce7613392e3ab65e19`. Se o plano demandar backend, marcar **BLOQUEADO / ALTERAÇÃO FORA DO ESCOPO**, não executar backend silenciosamente.

**Mudança localizada:** arquivos e comportamentos que não constarem expressamente do plano validado permanecem idênticos; nenhum refactor oportunista ou alteração de marca, rotas, dependências, Design System, permissões e lógica de cálculo sem requisito autorizado.

## 1. PROMPT (não é BUILD)

- Identificar a etapa regular (00–38 no inventário atual) e os prompts atômicos vinculados; ler critérios oficiais e evidências já existentes. Não confundir o catálogo 00–99 com 39 etapas já inventariadas.
- Registrar a dor ou FAIL reproduzível, os requisitos originais literais, a origem do PRD/arquitetura, a versão Git SHA e o resultado esperado; proibir funcionalidades ou regras inferidas sem fonte.
- Se a etapa estiver pronta no escopo e só faltar evidência externa, não modificar código por modificar; registrar NÃO VERIFICADO e o bloqueio.

## 2. PLAN (antes de alterar código)

- Gerar documento do prompt em `docs/frontend/planos/` usando `TEMPLATE_PROMPT_PLAN_GATE.md`.
- Explicitar **arquivos exatos** autorizados e lista de arquivos proibidos; baseline de commit, diff esperado, módulos/rotas/telas, impactos transversais, PRD e atômicos, fluxo de dados, contrato de RPC existente (somente consumo), RLS avaliada sem mudanças, segurança, acessibilidade e rollback.
- Apresentar estratégia TDD (RED → GREEN), testes focados, regressão de 812 testes ou resultado atual, lint, TS, build, Zero-Drift, teste visual em 1440/1280/768/390, claro/escuro, cenários loading/empty/error/negado, PT-BR, data/hora BR e BRL, BRAND-01.
- **Economia Lovable:** usar leitura, desenvolvimento e commits GitHub. Reutilizar > estender > criar; não executar suíte duplicada sem necessidade, mas não omitir nenhum gate obrigatório.

## 3. VALIDAÇÃO FORMAL DO PLAN — bloqueante

Validar em ordem, com PASS/FAIL/NÃO VERIFICADO e referências:
1. fidelidade aos documentos oficiais e à versão atual, sem inventar requisito;
2. escopo e lista fechada de arquivos, com **zero alterações backend/PROD/types.ts**;
3. Zero-Drift, BRAND-01 e NFRs transversais;
4. menor alteração suficiente, reutilização de componentes, nenhuma dependência não aprovada;
5. testes TDD, segurança (RLS/tenant via backend existente), UX/a11y/idioma, CI, Teste C independente e evidências por critério;
6. compatibilidade com código atual, ausência de conflitos com outro PLAN e rollback específico;
7. eventuais exigências de aprovação humana do pacote. Para mudanças visuais BRAND-01, **a aprovação humana explícita do PLAN permanece obrigatória**.

**Somente todos os gates aplicáveis PASS** = `VALIDADO`. Caso contrário, `REPROVADO` ou `BLOQUEADO`, revisar o PLAN, sem BUILD. Quando o pacote **não exigir aprovação humana**, a validação técnica integral pode aprovar o PLAN autonomamente, registrando responsável, critérios e provas; a autorização geral de execução do usuário não substitui aprovações específicas exigidas por documento.

**Separação obrigatória de commits:** primeiro publicar o PLAN validado e `docs/frontend/planos/PLANO_ATIVO.json` em commit exclusivamente documental. O CI do PLAN deve estar verde **antes** do commit que modifica código. O guard automatizado bloqueia alterações de `src/`, `public/` e configuração do aplicativo sem PLAN previamente VALIDADO no SHA de base e sem allowlist explícita de arquivos.

## 4. BUILD no GitHub, fiel ao PLAN aprovado

- Editar **somente** os arquivos allowlisted, em commit(s) mínimos, sem Lovable BUILD; testes TDD RED antes da implementação e GREEN depois.
- Se houver desvio, conflito, necessidade de novo arquivo, alteração de contrato ou falha de premissa: **parar**, atualizar PLAN e submeter nova validação antes de prosseguir.
- Nunca alterar PRD, tipos gerados, regras de portão 100%, estados oficiais de apresentação/reapresentação, RLS por artifício do frontend ou fonte de dados.

## 5. VALIDAÇÃO DO BUILD E TESTE C INDEPENDENTE

- Executar lint/format, testes focados e regressão, `tsc --noEmit`, build, varredura de segredo, `scripts/frontend-zero-drift.mjs`, guard de escopo e CI do SHA final.
- Verificar alterações pelo diff de arquivos, hash do `types.ts`, marca e inexistência de backend alterado. Qualquer CI FAIL = NÃO APROVADO.
- Depois, auditoria **separada, somente leitura**, da versão **exata** que passou no CI. Navegador 4 larguras × 2 temas + estados aplicáveis, teclado/labels, contraste real quando necessário, pt-BR, BRL, bordas e overflow; preservar capturas, hashes e logs em meio durável.
- Autorização e operações autenticadas somente com identidade HML autorizada. Telas com MOCK ficam **explicitamente MOCK**, não substituem E2E real nem RLS A/B.
- Em falha do Teste C, abrir novo PLAN corretivo (não editar durante a auditoria); reaplicar todos os gates até resultado PASS verificável.


## Protocolo de exceção condicionada: lacuna REAL de backend (somente com autorização do usuário)

O trabalho normal e ativo é **EXCLUSIVAMENTE FRONTEND**. Supabase HML é a **única autoridade do backend e dos dados**; nunca simular no frontend decisão, permissão, cálculo, portão de 100% ou dado que a arquitetura delega ao backend. Não criar fallback que oculte erro ou burle RLS/RPC.

**Gate 0 — Suspeita no frontend, sem acessar o fluxo de desenvolvimento do backend:** documentar reprodução e exigência normativa, RPC/contrato existente consumido, respostas/erros obtidos legitimamente no frontend, risco e evidências sanitizadas. Distinguir defeito de UI/contrato mal consumido de lacuna realmente atribuível ao backend. **Não corrigir nem investigar diretamente o backend sem consentimento.**

**Gate 1 — AUTORIZAÇÃO HUMANA ESPECÍFICA E BLOQUEANTE:** antes de mudar o foco para o repositório `contaos999999/develop` ou um branch de desenvolvimento dele, e antes de examinar schema, funções, políticas ou dados para confirmar a suspeita, **solicitar ao usuário autorização expressa para realizar a investigação no backend HML**, identificando o caso e o limite. O repositório chamado `develop` tem branch padrão `main` neste snapshot: não confundir nome do repositório com nome de branch. **Sem autorização: BLOQUEADO, permanecer frontend e não tocar Supabase ou repo backend.**

**Gate 2 — Investigação somente leitura após autorização:** confirmar/descartar a lacuna na fonte autorizada, com evidências de schema, RPC, RLS, fonte normativa, testes e isolamento. Se não existir lacuna real, registrar conclusão e voltar imediatamente ao frontend, sem BUILD backend.

**Gate 3 — Se a lacuna for REAL:** elaborar PROMPT específico de backend e PLAN versionado no fluxo backend, com arquivos exatos, requisitos PRD/Premissas/NFRs/atômicos, migrations, segurança, RLS, rollback, plano de teste e não alteração de PROD; submeter validação técnica completa e eventuais aprovações humanas obrigatórias. **Não executar BUILD com PLAN reprovado, parcial ou sem autorização aplicável.**

**Gate 4 — BUILD backend limitado e certificação:** somente após PLAN VALIDADO, implementar exclusivamente no ambiente Supabase HML pela fonte canônica, registrar migração/código e commit no GitHub, validar CI, RLS com usuários A/B quando aplicável, regressões, isolamento, segurança e fontes; executar Teste C/auditoria independente quando pertinente. Sem prova real, marcar NÃO VERIFICADO e não declarar resolução integral.

**Gate 5 — Retorno obrigatório:** registrar conclusão e pendências no GitHub, confirmar hash/CI, encerrar escopo de backend, **retomar o frontend no repositório `contaos999999/contaos-hml-control`** e continuar o PLAN frontend de onde parou. Reavaliar contrato, controles e impacto visual; backend não autoriza BUILD frontend fora de PLAN validado.

Em nenhuma hipótese esse protocolo modifica ou relativiza **PRD 4.1, Premissas, arquitetura, PROMPTs regulares 00–99, atômicos 000–096, identidade visual BRAND-01, requisitos não funcionais, Zero-Drift, auditoria, fontes/rastreabilidade e Supabase como fonte única do backend**. Não misturar commits de backend com o frontend, não tocar PROD ou gerar `types.ts` por conveniência. A autorização para investigar não implica automaticamente aprovação de um plano que exija consentimento adicional.


## Paridade documentada com Context Gate e Prompt Crosswalk canônicos

O frontend no GitHub usa como referência **imutável por commit** `docs/frontend/CONTEXT_CANONICO_4_1_SNAPSHOT.json`, que registra os **25 documentos** `00–20`, `08A–08D` e os blobs Git do repositório normativo `contaos999999/develop`. O mesmo registro referencia o índice original dos **100 prompts 00–99 e 97 atômicos 000–096**, preservando SHA-256 das fontes. Não renumera, omite, amplia nem reinterpreta requisitos.

**Antes do PLAN:** ler integralmente as fontes canônicas aplicáveis e consultar a versão HEAD de `contaos999999/develop`. Se o HEAD da fonte difere do snapshot, **não aprovar** um novo PLAN; atualizar o snapshot documental com procedência e validar de novo. O CI do frontend não consegue consultar automaticamente a branch privada de outro repositório sem credencial entre repositórios; por isso exige registro do commit SHA e dos 25 blobs, e a conferência do HEAD ao início de cada tarefa permanece obrigação humana/agent. Registrar declaração de leitura, autor, data, documentos, SHA fonte e prova da correlação regular/atômico, incluindo todos os transversais relevantes ou justificativa de exclusão.

**No PLAN:** usar o bloco literal `ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE (OBRIGATÓRIO)` do §11.3 em texto completo, não apenas menção ou link. Declarar a estratégia de economia (sem utilização de BUILD Lovable), a matriz BRAND-01, 4 resoluções × 2 temas, TDD e teste C separado. O manifesto `PLANO_ATIVO.json` exige todos os gates `PASS` e evidência verificável do CI do commit de PLAN, anterior ao BUILD. Um mero preenchimento de `PASS` não comprova execução, portanto a validação técnica precisa conferir a fonte, o resultado e a autoria antes de autorizar. A aprovação humana exigida por mudanças BRAND-01/escopo restrito nunca é suprida por aprovação técnica automática.

**Branch/PR:** o gate agora localiza o commit documental anterior ao **primeiro BUILD na branch**, evitando falsa recusa de um PLAN válido em PR sem aceitar commits com PLAN e BUILD juntos. O CI continua posterior ao commit, mas o ruleset `ContaOS-Zero-Drift-main` está **ACTIVE** e exige PR com checks verdes antes do merge (GOV-004, ruleset ID 26495643). Atualmente são **zero revisões obrigatórias de PR**, sem bypass; isso não elimina aprovações específicas de BRAND-01 quando previstas no PRD.

**Teste C:** a auditoria visual read-only em navegador, screenshots e hashes arquivados duravelmente, teste com sessão real quando exigido e segurança RLS A/B continuam obrigatórios **fora do CI unitário**. Se ferramenta independente estiver indisponível, classificar `NÃO VERIFICADO`, jamais homologado 100%. O Lovable pode ser visualizador passivo, mas não autor de código.

**Limitações de prova:** este gate documental não demonstra, por software, que o autor leu semanticamente cada documento, não mede sozinho contraste nem certifica o backend. A fonte e o PRD são sempre superiores ao manifesto.

## 6. FECHAMENTO E PASSAGEM DE CHAT

- Registrar evidência por PROMPT regular e atômico, base/HEAD, diff, PLAN validado, CI, Teste C, SHA, gate Zero-Drift, arquivos inalterados e impedimentos em `contaos999999/develop` apenas quando uma tarefa documental separada autorizar atualização do tracker; **não fazer mudanças de backend por esse registro**.
- Após concluir, atualizar `docs/frontend/ESTADO_E_RETOMADA_CONTAOS_4_1.md` no próprio repo frontend, com próxima tarefa real.
- **Nunca declarar 100%/39 de 39** com prova MOCK ou parcial. Se bloqueado por backend, reportar impedimento e solicitar autorização específica, não ultrapassar o frontend.

## 7. Regras de aplicação do guard

`scripts/frontend-scope-gate.mjs` reprova arquivos de backend e exige plano validado **no commit base** para mudanças da aplicação. A exceção operacional à mudança de `types.ts` é apenas a **autorrestauração para o blob certificado** pelo Auto-Lock; não autoriza edição funcional. O guard é um controle **CI posterior ao push**, não uma regra obrigatória de aprovação de PR por branch protection, que depende das permissões da conta.

A leitura desta ADR é **obrigatória a cada retomada**. Prevalecem os critérios oficiais do PRD 4.1 e aprovações específicas mais restritivas.


## Atualização de contexto — GOV-005, 04/11/2026

As referências canônicas de repositório após a transferência são `contaos999999/contaos-hml-control` (frontend) e `contaos999999/develop` (backend normativo, SOMENTE LEITURA em tarefas de frontend). A política GitHub é PR obrigatório, 2 required checks e 0 reviews; não dispensa aprovação humana explicitamente exigida pelo PLAN para alteração BRAND-01. A GOV-004 comprovou bloqueio de escrita direta e CI negativo, e merge com zero reviews. Nenhuma alteração no rito de PLAN anterior ao BUILD ou na autoridade do Supabase HML.
