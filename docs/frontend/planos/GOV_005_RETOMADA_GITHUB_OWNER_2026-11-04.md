# GOV-005 — PLAN documental de retomada GitHub ContaOS 4.1

**Data do registro:** 04/11/2026 · **Área:** governança documental de frontend, sem BUILD funcional.
**Frontend base main:** `f9b46b9e07823bb291a1c5efe2a67dfd23e36727`.
**Repositório normativo (SOMENTE LEITURA):** `contaos999999/develop`, branch `main`, commit `cb65f4980f4eeca6ccd33caf6198a801b7e60328`.
**Fonte:** ADR-DEV-001, ADR-DEV-002, AGENTS.md, checkpoint atual, PRs #14/#15, relatório GOV-004, issue #16.

## PROMPT — desvio factual comprovado
O texto de retomada que circula entre conversas e documentos permanentes possui referências operacionais `contaos9999/*` anteriores à migração para a organização `contaos999999`, além de descrições obsoletas sobre branch protection inexistente e Auto-Lock com push direto, contrariadas pelo HEAD e GOV-004. O `PLANO_ATIVO.json` permanece `SEM_PLANO_ATIVO`, de modo que não haverá alteração funcional. A issue frontend #6 descreve hipótese de flaky test por substring `c9`; o teste atual em `src/test/admUsuarios.test.tsx` compara arrays `p_ids_contratos_ativar/revogar` por igualdade estrita e a causa ainda não está reproduzida. **Não corrigir código de teste sem prova nova.**

## PLAN — escopo fechado e implementação
Atualizar exclusivamente os caminhos de proprietário e a situação operacional atual, **sem adulterar acontecimentos históricos**, nos arquivos:
1. `AGENTS.md`;
2. `docs/frontend/ADR-DEV-001-GITHUB-DIRETO.md`;
3. `docs/frontend/ADR-DEV-002-PROMPT-PLAN-GATE-BUILD-TESTEC.md`;
4. `docs/frontend/planos/TEMPLATE_PROMPT_PLAN_GATE.md`;
5. `docs/frontend/ESTADO_E_RETOMADA_CONTAOS_4_1.md`;
6. `docs/frontend/LOCK-TYPES-01.md`;
7. `docs/frontend/HML_E2E_PRECONDICOES_2026-11-03.md`.

Registrar em checkpoint:
- PR #14 (GOV-003) merge `31eb0a3e7f0dca0f70420eeeab2ded1b69fcab2d`, Auto-Lock por branch+PR, 0 reviews; fonte canônica live PASS; ZERO-DRIFT.
- PR #15 (GOV-004) merge `f9b46b9e07823bb291a1c5efe2a67dfd23e36727`; ruleset `ContaOS-Zero-Drift-main` ID `26495643` ACTIVE, target main, bypass vazio, zero aprovações exigidas, dois checks; push direto recusado HTTP 409, merge com CI vermelho recusado HTTP 405, merge verde com 0 reviews autorizado; Auto-Lock execução sem drift `41762615464`.
- T05/T06 comprovados via configuração ACTIVE e não via tentativas destrutivas. Caminho real de PR do bot quando há drift ainda NÃO TESTADO. E2E HML real não executado nesta retomada.
- Fonte única do frontend é GitHub, Lovable para sincronização/visualização; backend normativo não será modificado.
- Próximo candidato issue #6 exige reprodução de FAIL; não corrigir hipoteticamente UUID se os arrays de IDs estão corretos.
- Referências antigas em citações de logs e commits são históricas, mas URLs canônicas devem apontar ao owner atual quando possível.

**Proibidos em absoluto:** `src/**`, `public/**`, `package.json`, `bun.lock`, `.github/workflows/**`, `supabase/**`, banco HML/PROD, `types.ts`, migrations, Auth, RLS, RPC, segredos, conteúdo normativo no repo `develop` e alterações de UI/Marca.
Nenhuma atualização de `PLANO_ATIVO.json` (esta é uma tarefa exclusivamente documental), nem alteração de status que simule aprovação de tarefa funcional.

## VALIDAÇÃO TÉCNICA
- [PASS] Owner verificado: organização `contaos999999`, repositórios privados acessíveis e seus HEADs conferidos.
- [PASS] Escopo exclusivamente documental; nenhum backend, PROD, pacote, frontend, testes ou `types.ts` será editado.
- [PASS] BRAND-01 / identidade / UX / acessibilidade / PT-BR: preservados, sem mudança visual.
- [PASS] Zero-Drift: não alterar rotas, ativos, interfaces, tokens ou testes; CI deverá passar no SHA do plano e da atualização.
- [PASS] Segurança: manter 0 revisões obrigatórias exclusivamente como regra do GitHub estabelecida pelo titular; não confundir com aprovações específicas de BRAND-01, que permanecem aplicáveis.
- [PASS] TDD: N/A por ausência de código funcional; validação por diffs textuais, links/SHAs, CI e arquivo protegido.
- [PASS] Teste C visual: N/A quando job indicar alterações exclusivamente documentais; nunca relatar N/A como captura visual real.
- [PASS] Rollback: revert do commit documental por novo PR e checks, sem reescrita de histórico.
- [PASS] Plano autoriza apenas os sete arquivos acima, sem novas dependências ou execução Lovable BUILD.
- [NÃO VERIFICADO] Ruleset no futuro: evidência vale para o momento da leitura; checar novamente antes de qualquer PR futuro.

## Ordem de execução
1. Commit exclusivamente deste PLAN.
2. Abrir PR documental e exigir CI verde do PLAN antes de editar os sete arquivos.
3. Atualizar cada arquivo apenas nas passagens obsoletas; preservar texto oficial e histórico, apenas anotar mudança de contexto.
4. CI completo, revisão de diff, comparação de blobs `types.ts`, Zero-Drift. Sem alterações técnicas.
5. Atualizar evidências no PR, fazer merge somente se exigências do ruleset estiverem satisfeitas.

## ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE (OBRIGATÓRIO)
Marca ContaOS Brand v1.0 / BRAND-01. Não tocar identidade visual, assets oficiais, rotas, componentes, contratos de API ou Design System. Reutilizar > estender > criar. A tarefa é atualização documental com impacto visual N/A; Teste C visual dinâmico N/A quando não houver alteração de UI. GitHub como fonte de alteração; Lovable apenas sincronização/visualização. Não dispensar gates de segurança e checks. Custo Lovable: zero mensagens de BUILD. O texto não aprova nenhuma alteração funcional nem substitui gates de BRAND-01 que exijam aprovação específica.
