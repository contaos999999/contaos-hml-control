# ContaOS 4.1 — Estado vivo e protocolo de retomada entre chats

**Canal oficial de continuidade.** Documento de referência para quando uma conversa acabar, precisar trocar de chat, houver perda parcial do histórico ou outra pessoa/instância assumir o trabalho. **Atualizar o checkpoint ao terminar qualquer bloco de correções.**


## 0. ESTADO VIVO — atualizado em 04/11/2026 após GOV-004

**Estas informações prevalecem sobre snapshots históricos mais abaixo; conferir HEADs e checks a cada novo chat.**

| Item | Última confirmação no GitHub |
| --- | --- |
| Frontend canônico | `contaos999999/contaos-hml-control`, `main` no commit `f9b46b9e07823bb291a1c5efe2a67dfd23e36727` (baseline deste GOV-005) |
| Backend normativo | `contaos999999/develop`, branch `main`, `cb65f4980f4eeca6ccd33caf6198a801b7e60328` (somente leitura para frontend) |
| PLAN funcional | `docs/frontend/planos/PLANO_ATIVO.json` = `SEM_PLANO_ATIVO`; não editar src/public/config sem PLAN validado e CI anterior |
| Fonte canônica | `FONTE CANÔNICA PASS`, 25 documentos e catálogo 100/97 no run do PR #14; revalidar a cada BUILD |
| LOCK-TYPES-01 | `types.ts` blob `8ea7750b75fd9d76b29c36ce7613392e3ab65e19`, intacto |
| GOV-003 | PR #14 mesclado em `31eb0a3e7f0dca0f70420eeeab2ded1b69fcab2d`, Auto-Lock agora abre PR de reparo; não faz push direto nem merge automático |
| GOV-004 | PR #15 mesclado em `f9b46b9e07823bb291a1c5efe2a67dfd23e36727`, evidências em issue #16 e `docs/frontend/auditorias/GOV_004_CERTIFICACAO_BRANCH_2026-11-03.md` |
| Ruleset | `ContaOS-Zero-Drift-main` ID `26495643` ACTIVE, alvo `main`, 2 required checks, PR obrigatório, 0 revisões, sem bypass, sem exclusão/force push |
| Provas positivas/negativas | T02 escrita direta bloqueada HTTP 409; T03 merge com CI FAIL bloqueado HTTP 405; T04 merge PR #15 com CI verde e 0 reviews |
| Auto-Lock | Execução sem drift `41762615464` SUCCESS; **criação de PR por drift real NÃO TESTADA** |
| Proteção force push/deletion | Regras ACTIVE verificadas por API, sem tentativa destrutiva real em `main` |
| HML E2E autenticado | Ainda NÃO VERIFICADO nesta linha de trabalho; evitar tocar Supabase sem autorização específica |

**Próxima tarefa funcional:** issue #6 (teste ADM-01 possivelmente flutuante) somente **se a falha for reproduzida**. A hipótese de colisão de substring `c9` com UUID não foi demonstrada: o teste atual já verifica por igualdade arrays de `p_ids_contratos_ativar/revogar`. Sem FAIL reproduzível, não alterar código funcional nem mascarar o teste; registrar evidência e investigar outras pendências de frontend. Issues #2/#5 e backend #33–#35 requerem E2E externo, não converter MOCK em PASS.

**Política permanente:** frontend GitHub, Lovable só sincronização/visualização; zero aprovações de revisão obrigatórias para PR, mas gates específicos BRAND-01 continuam. PRD 4.1, 39 etapas, 416 critérios, 100 prompts, 97 atômicos, proteção `types.ts` e ZERO-DRIFT inalterados. Sem BUILD ou inspeção de Supabase/backend/PROD neste GOV-005.

## ADR-DEV-002 — validação obrigatória antes de qualquer BUILD

**GATE BLOQUEANTE:** usar [ADR-DEV-002](ADR-DEV-002-PROMPT-PLAN-GATE-BUILD-TESTEC.md). Em cada prompt: **PROMPT → PLAN → VALIDAÇÃO → commit isolado do PLAN e CI aprovado → BUILD somente frontend via GitHub → CI/Zero-Drift → Teste C independente somente leitura → dossiê → novo checkpoint**. Sem `docs/frontend/planos/PLANO_ATIVO.json` previamente VALIDADO, proibido editar `src/`, `public/` ou configuração do app. Backend `contaos999999/develop` e Supabase não entram em uma tarefa frontend. Aprovação humana específica permanece obrigatória quando o pacote exigir.

## Quando houver suspeita de lacuna no backend

O desenvolvimento permanece **somente frontend**. Documentar o sintoma com provas do frontend e **pedir autorização ao responsável ANTES de passar ao fluxo do repositório `contaos999999/develop` para analisar Supabase HML**. Autorizada a investigação, checar backend read-only; se confirmada lacuna real, PROMPT backend → PLAN → gate validado → BUILD limitado HML → testes e certificação → GitHub → **retorno ao frontend**. Sem aprovação explícita, não investigar nem modificar backend. PRD, Premissas, prompts 00–99 e 000–096, NFRs, BRAND-01, auditoria/fontes e Zero-Drift continuam absolutos.

## Verificação canônica de paridade antes de abrir novo PROMPT

- Verificar SHA HEAD atual do repositório normativo `contaos999999/develop`; confrontar `docs/frontend/CONTEXT_CANONICO_4_1_SNAPSHOT.json` (25 documentos) e `docs/prompts/PROMPT_TRACKS_4_1.json` (100 regulares / 97 atômicos). Divergência de fonte = PLAN BLOQUEADO até atualização controlada do snapshot.
- Exigir manifesto `PLANO_ATIVO.json` VALIDADO, leitura declarada das fontes, origem SHA e cláusula literal Zero-Drift §11.3 no PLAN. Não basta CI verde de código.
- CI verifica aprovação prévia e allowlist, inclusive branch PR. **Teste C real/screenshot/contraste, autorização HML A/B e branch protection não são substituídos por esse gate de texto**.
- Fonte do saneamento documental: `docs/frontend/planos/GOV_001_PARIDADE_LOVABLE_GITHUB_2026-11-03.md`.

## 1. Regra de retomada: nunca recomeçar nem adivinhar

No **primeiro turno de todo novo chat**, acessar pelo conector GitHub:
- Frontend (código canônico): https://github.com/contaos999999/contaos-hml-control
- Backend, governança e dossiês: https://github.com/contaos999999/develop
- Este arquivo: https://github.com/contaos999999/contaos-hml-control/blob/main/docs/frontend/ESTADO_E_RETOMADA_CONTAOS_4_1.md
- Fonte oficial dos 416 critérios: https://github.com/contaos999999/develop/blob/main/docs/prompts/CRITERIOS_ORIGINAIS_39_PROMPTS_2026-11-03.json
- Matriz de prova (39 × 416): https://github.com/contaos999999/develop/blob/main/docs/prompts/MATRIZ_416_CRITERIOS_STATUS_E_PROVAS_2026-11-03.json
- Tracker: https://github.com/contaos999999/develop/blob/main/docs/prompts/PLANO_SANEAMENTO_39_PROMPTS_2026-11-03.json
- Dossiês dos PROMPTs 00–38: https://github.com/contaos999999/develop/tree/main/docs/prompts/evidencias_individuais
- ADR oficial: `docs/frontend/ADR-DEV-001-GITHUB-DIRETO.md` e `AGENTS.md`.

**Obrigatório:** verificar HEAD da branch `main` de ambos os repositórios, commits recentes, diff desde último checkpoint, CI do SHA atual, issues abertas e hash do `types.ts`. **O estado real dos repositórios tem precedência sobre o snapshot desta página e sobre a memória do chat.** Não atualizar o backend pela IA Lovable.

## 2. Snapshot de início — 03/11/2026

| Área | Identificação e estado |
| --- | --- |
| Frontend | `contaos999999/contaos-hml-control`, branch `main`; HEAD verificado antes da ADR: `174512a2d2cc978f9c04da54bd8096ad2e47408d` (o SHA **muda** com este documento) |
| Backend/documentação | `contaos999999/develop`, branch `main`; último HEAD observado: `75a62cce775989017c7723b9206b3358161b40a3` |
| Supabase HML | Projeto `gklhhhyosgasnyoxlrui`; PROD proibido |
| Lovable, somente visualização/sincronização | Projeto `b113dd59-6caf-4c92-8302-457a037a0c6f`; https://lovable.dev/projects/b113dd59-6caf-4c92-8302-457a037a0c6f |
| Tipos Supabase | `src/integrations/supabase/types.ts` bloqueado no blob `8ea7750b75fd9d76b29c36ce7613392e3ab65e19` |
| Auto-Lock | Regeneração indevida do Lovable foi **reparada automaticamente**, workflow https://github.com/contaos999999/contaos-hml-control/actions/runs/41725182728 |
| CI frontend | Último SHA imutável auditado sem alteração funcional `c36c9c817ec97948885acbf8330181d6a7e325e9`, CI SUCCESS https://github.com/contaos999999/contaos-hml-control/actions/runs/41720206213. Push do Lovable com types divergente `4f8326...` teve CI FAIL https://github.com/contaos999999/contaos-hml-control/actions/runs/41725182737 **antes do Auto-Lock**; o commit do bot restaurou o arquivo, mas deve ser verificado novo CI conforme a regra. |
| CI backend | `75a62cce775989017c7723b9206b3358161b40a3` SUCCESS https://github.com/contaos999999/develop/actions/runs/41726627573 |
| Inventário | **39 prompts** `00–38` e **416 critérios** originais; **não há documentação de 49 itens**. Não inventar dez pendências. |
| Provas parciais | 15 prompts de backend têm migrations aplicadas e RLS presente; HML: 117/117 tabelas públicas RLS, 183 policies. Matriz registra **36 gates com PASS delimitado** e **69 gates de responsividade com evidência visual MOCK**; nenhuma certificação integral universal. |
| Frontend | 23 telas SYS01–ADM01 e V1-01–V1-17 implementadas; 812 testes em 28 arquivos no CI aprovado do SHA `ad0b933...`. Teste C visual reportou **23/23 sem falha**, 184 capturas base + 70 extras (**254**), todas originais efêmeras em `/tmp`, sem pacote de imagens durável. |
| Segurança e autenticação | E2E de dois tenants **não executado**; HML tinha quatro organizações, **zero contratos** e **um usuário com vínculo ativo**. A recuperação SYS-03 com e-mail real também não foi testada. |
| PROD | Nenhuma alteração aprovada/realizada nesta linha de trabalho. |

## 3. Pendências documentadas, sem fingir encerramento

- Frontend: https://github.com/contaos999999/contaos-hml-control/issues/6 — teste flutuante ADM-01; https://github.com/contaos999999/contaos-hml-control/issues/2 — E2E ADM-01; https://github.com/contaos999999/contaos-hml-control/issues/5 — E2E cadastro contratante.
- Backend/governança: https://github.com/contaos999999/develop/issues/33 — SYS03 e-mail real; https://github.com/contaos999999/develop/issues/34 — arquivar 254 capturas e contraste WCAG; https://github.com/contaos999999/develop/issues/35 — duas identidades HML e contratos de teste para RLS A/B.
- Seis WARN de SECURITY DEFINER requerem verificação contextual de acesso, não revogação automática. Proteção contra senha vazada desabilitada no Auth requer painel administrativo/credenciais.
- Teste C com dados MOCK **não** homologa controles de acesso reais nem leitura/escrita efetiva. Qualquer evidência externa que não estiver acessível deve ser rotulada NÃO VERIFICADA.
- Toda correção frontend deve ser feita **no GitHub, sem BUILD do Lovable**. O Lovable pode continuar regenerando `types.ts` internamente; conferir sempre o blob e o Auto-Lock.

## 4. Próxima ação padrão para continuar automaticamente (avaliar após estado vivo do item 0)

1. Conferir HEADs, diffs, CI, issues e dossiês. Não repetir implementações já presentes.
2. Escolher a pendência **comprovada e solucionável diretamente**, por exemplo estabilizar o teste ADM-01 da issue #6 após reproduzir sua falha; sem inventar defeito. Fazer correção mínima por GitHub, TDD e CI, atualizar dossiê e issue.
3. Paralelamente preparar evidências duráveis e ensaios visual/segurança que não necessitem de terceiros. Para A/B, E2E de e-mail e funções administrativas restritas, documentar a condição externa e pedir apenas a intervenção indispensável, sem expor segredos.
4. Antes de encerrar cada bloco: atualizar **este documento**, tracker, matriz e dossiês pertinentes, com SHA real, status de CI, testes, ações e impedimentos. Manter registros históricos, não substituir evidência antiga por aprovação artificial.

## 5. Texto pronto para colar no novo chat

> Continue o projeto ContaOS 4.1 **de onde parou**, sem reiniciar nem presumir o contexto antigo. A decisão oficial **ADR-DEV-001** estabelece frontend corrigido/programado **diretamente no GitHub** `contaos999999/contaos-hml-control`, backend **somente Supabase HML** `gklhhhyosgasnyoxlrui` e Lovable **somente sincronização/visualização**. Primeiro leia `AGENTS.md`, `docs/frontend/ADR-DEV-001-GITHUB-DIRETO.md` e `docs/frontend/ESTADO_E_RETOMADA_CONTAOS_4_1.md` no GitHub frontend, depois o tracker das 39 etapas, os 39 dossiês, a matriz dos 416 critérios e as issues abertas no `contaos999999/develop`. Confira os HEADs e CI atuais antes de qualquer mudança. Nunca altere PROD, não regenere `types.ts` (blob `8ea7750b75fd9d76b29c36ce7613392e3ab65e19`), respeite o PRD 4.1, BRAND-01, Zero-Drift, TDD, Teste C e rastreabilidade. Resolva autonomamente a próxima pendência concreta, com correção, testes, commit e evidências por prompt, e atualize o checkpoint. Só me consulte se houver bloqueio real não solucionável.

## 6. Segurança da passagem entre chats

- Não colar secrets, tokens, JWT, senhas, links de redefinição, envs privados ou dados de pacientes/contratos no prompt de retomada.
- O novo chat pode não receber todo o histórico anterior; por isso deve se apoiar nos documentos versionados.
- O agente não trabalha em background entre chats: após abrir a nova conversa, envie o texto da seção 5. O trabalho segue **naquele turno**.
- O snapshot acima é um **ponto de partida**, não fonte eterna de verdade. A cada retomada e conclusão, registrar novas evidências e SHA atualizado.


> **REGRA DE RETOMADA ADR-DEV-002**: antes de corrigir qualquer frontend, ler `docs/frontend/ADR-DEV-002-PROMPT-PLAN-GATE-BUILD-TESTEC.md` e `docs/frontend/planos/PLANO_ATIVO.json`; realizar PROMPT → PLAN → validação (com gate registrado em commit + CI) → BUILD apenas frontend → CI → Teste C independente. Nenhuma alteração de backend, Supabase, migrations, RLS, RPC, Storage, Auth, Edge ou PROD. Caso fora de escopo, parar e comunicar.

> **OBSERVAÇÃO DE AUTORIZAÇÃO BACKEND:** se identificar possível lacuna backend, no novo chat solicitar permissão específica antes de acessar o fluxo `contaos999999/develop` para confirmar. Nunca interpretar instruções gerais de continuidade como essa permissão.


## 03/11/2026 — Auditoria de paridade Lovable × GitHub e reforço do gate
- Parecer: `docs/frontend/AUDITORIA_PARIDADE_LOVABLE_GITHUB_2026-11-03.md`.
- PLAN documentado: `docs/frontend/planos/GOV_001_PARIDADE_LOVABLE_GITHUB_2026-11-03.md`, CI https://github.com/contaos999999/contaos-hml-control/actions/runs/41732038105 **SUCCESS**.
- BUILD exclusivo de governança frontend: commit `21416e1685f00344cd7e8e790a507fbfed3a53cc`, 13/13 testes do guard, 812/812 Vitest, lint/TS/build/Zero-Drift CI https://github.com/contaos999999/contaos-hml-control/actions/runs/41733336741 **SUCCESS**.
- Fontes canônicas `00–20 + 08A–08D`: snapshot `docs/frontend/CONTEXT_CANONICO_4_1_SNAPSHOT.json`; crosswalk 100 regulares, 97 atômicos, mas não 100% execução.
- Lovable sincronizado ao mesmo SHA `21416e1685f00344cd7e8e790a507fbfed3a53cc` em consulta realizada após o CI; autor de frontend = GitHub, Lovable não usado em BUILD.
- Backend `contaos999999/develop` não alterado, HEAD `cb65f4980f4eeca6ccd33caf6198a801b7e60328`; types blob certificado. `PLANO_ATIVO.json` ainda `SEM_PLANO_ATIVO`.
- PENDENTE no snapshot de 03/11: Teste C independente durável, HML A/B e branch protection. **Atualização posterior GOV-004 no item 0: proteção da main já comprovada, e Teste C independente existe, mas os estados autenticados E2E permanecem não verificados.**
- Próxima tarefa funcional frontend exige novo PLAN validado, CI prévio e allowlist; **não modificar Supabase sem autorização humana específica**.

## GOV-002 — Quatro controles de equivalência Lovable → GitHub

- **Branch exclusiva de governança:** `governance/quatro-gates-20261103`, PR #11 https://github.com/contaos999999/contaos-hml-control/pull/11. PLAN `docs/frontend/planos/GOV_002_QUATRO_GATES_2026-11-03.md`, commit somente documental `fa872871eb25472a55366bcc20d4752fb172497a`, CI do PLAN https://github.com/contaos999999/contaos-hml-control/actions/runs/41735578730 SUCCESS.
- **Teste C:** `.github/workflows/contaos-teste-c-independente.yml`, runner `scripts/testc/visual-audit.mjs` e teste unitário. 23 telas × 4 larguras × 2 temas; acesso sem credenciais; PNG somente públicos e estados de negação, hashes e relatórios em artifact por 30 dias. Sem sessão real, drawer e autorização A/B continuam NÃO VERIFICADOS. Como executar: `docs/frontend/GUIA_TESTEC_E_FONTES_2026-11-03.md`.
- **Fonte viva:** `scripts/context-freshness-gate.mjs`, verificação de HEAD/25 documentos/catálogo 100/97. O titular precisa configurar Secret `CONTAOS_CANONICAL_READ_TOKEN` read-only, restrito ao repositório normativo `develop`. Sem isso, BUILD funcional deve FAIL fechado. **A fonte normativa não foi alterada**.
- **Proteção de branch no histórico GOV-002:** precisava de admin e Auto-Lock compatível. **Situação atual: ruleset ACTIVE, sem bypass e checks obrigatórios (GOV-004, item 0).**
- **HML real:** `docs/frontend/HML_E2E_PRECONDICOES_2026-11-03.md`; nenhuma conta/contrato/arquivo criado, autorização específica pendente antes de qualquer teste de escrita, inspeção do backend ou acesso a dados.
- **Intocáveis:** `src/**`, `public/**`, `package.json`, `bun.lock`, `types.ts` certificado, todos os objetos Supabase HML, repositório `contaos999999/develop` e PROD. Retomar frontend funcional somente com PLAN por prompt 00–99 + atômicos 000–096 e CI/BRAND-01/Zero-Drift.

## Atualização GOV-003 — 03/11/2026 (registro histórico anterior ao merge do PR #14)
- Organização GitHub conectada: `contaos999999`. Frontend `contaos999999/contaos-hml-control`; repositório normativo `contaos999999/develop` (somente leitura).
- PLAN GOV-003: `docs/frontend/planos/GOV_003_RULESET_AUTOLOCK_CANONICO_2026-11-03.md`; PR de governança rascunho #14, sem merge e sem modificação de backend/PROD.
- Auto-Lock planejado por branch+PR com CI obrigatório e **0 revisões humanas obrigatórias** por decisão do titular; não fazer bypass da proteção da main. Verificar permissões Actions e checks reais de CI após BUILD.
- O secret `CONTAOS_CANONICAL_READ_TOKEN`, enforcement do ruleset, regras de branch sem revisão humana obrigatória e E2E autenticado A/B são **NÃO VERIFICADOS** enquanto não houver evidência direta. O backend e os dados HML permanecem intocados.

### Decisão de governança do titular — 03/11/2026
- O titular optou por operar a organização com um único colaborador e **Required approvals = 0** no ruleset. Exigir PR, checks verdes, bloquear exclusão/force push, nenhuma exceção ampla de bypass. Não inventar evidência de aprovação humana. Aprovações excepcionais previstas para modificações sensíveis BRAND-01/escopo específico permanecem gates distintos.
- A restauração de types.ts não poderá fazer push direto na main; o bot abre PR, solicita CI e não executa merge automaticamente. O merge pelo titular não requer segundo revisor, mas só é permitido com CI e regras efetivas.
- HML A/B fora do escopo desta tarefa a pedido do titular; não executar testes do Supabase.
