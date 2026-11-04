# GOV-006 — PLAN / reavaliação da paridade Lovable × GitHub (04/11/2026)

## PROMPT e baseline
Atualizar **documentação**, sem editar aplicação, após auditoria técnica que constatou que o parecer de 03/11/2026 contém pendências de governança agora superadas. Frontend HEAD de partida: `79eec9b810b722cb2626f03039cac30b68a1dfce`. Fonte normativa `contaos999999/develop` HEAD `cb65f4980f4eeca6ccd33caf6198a801b7e60328`. Lovable projeto `b113dd59-6caf-4c92-8302-457a037a0c6f` retorna `latest_commit_sha=b8ca8b99b31c65ceccfe6091b5e7bcaad1cf80f0`. O GitHub atual está 37 commits à frente deste SHA, todos em arquivos de CI/governança/documentação, sem diff em `src/**` ou `public/**`. O dado Lovable é metadado de commit e não prova sozinho falha de sincronização do editor ou runtime.

## Fatos verificados
1. Ruleset `ContaOS-Zero-Drift-main` ID `26495643` em `active`, alvo branch padrão, PR e 2 checks obrigatórios, `required_approving_review_count=0`, proibição de `deletion` e `non_fast_forward`, bypass vazio. GOV-004: tentativa de push direto HTTP 409, tentativa de merge com CI FAIL HTTP 405, PR #15 CI verde + 0 revisões mesclado.
2. Fonte remota `contaos999999/develop` validada em CI por token `CONTAOS_CANONICAL_READ_TOKEN`, 25 documentos/100/97. O gate força a consulta em BUILD funcional, mas a leitura semântica e a autenticação de decisões humanas específicas não podem ser inferidas apenas do manifesto.
3. GitHub Teste C **existe**: `.github/workflows/contaos-teste-c-independente.yml` e `scripts/testc/visual-audit.mjs`. Run real `41737621829` SUCCESS, 184 combinações, 24 screenshots/24 PASS públicos, 152 protegidos sem sessão + 8 drawer sem sessão, 0 falhas públicas. Artefato `13280975443` ainda não expirado, expira em **03/12/2026**; 30 dias de retenção não constituem arquivo permanente. Contraste WCAG especializado permanece `NÃO VERIFICADO`.
4. Lovable marcou SHA `b8ca8b99...`; GitHub HEAD `79eec9b8...`. Compare direto provou 37 commits de governança sem alteração funcional src/public; estado de sincronização de metadados `NÃO VERIFICADO`, não `FALHA DE CÓDIGO`.
5. O blob de `types.ts` segue `8ea7750b75fd9d76b29c36ce7613392e3ab65e19`. Auto-Lock sem drift foi executado com sucesso; criação de PR por drift real não testada.
6. Backend/RLS real A/B, recuperação de senha, CRUD/upload real não certificados, e não autorizaram testes nesta tarefa.
7. 39 etapas e 416 critérios rastreados não significam 100 prompts nem todas as etapas materialmente concluídas.

## PLAN de documentação — escopo fechado
Arquivos permitidos:
- `docs/frontend/AUDITORIA_PARIDADE_LOVABLE_GITHUB_2026-11-03.md`: incluir nota de revisão no início e seção complementar de fatos atuais, mantendo o parecer histórico preservado.
- `docs/frontend/ESTADO_E_RETOMADA_CONTAOS_4_1.md`: anexar no estado vivo referência ao adendo, Lovable HEAD informado e risco de expiração do artefato.
- `docs/frontend/planos/GOV_006_REAVALIACAO_PARIDADE_2026-11-04.md`: este PLAN.

**Proibidos:** qualquer outro arquivo, `src/**`, `public/**`, `.github/**`, `scripts/**`, `package.json`, `bun.lock`, `types.ts`, Backend Supabase HML/PROD, repo `contaos999999/develop`, Lovable BUILD, credenciais e dados reais.

## GATE de validação técnica
- PRD/Premissas/Arquitetura: PASS quanto à preservação documental, nenhuma alteração normativa.
- BRAND-01, Zero-Drift e UX: PASS ausência de mudanças visuais e funcionais, sem atribuir homologação visual plena.
- Escopo: PASS; allowlist de 3 documentos e nenhum arquivo da aplicação.
- Segurança: PASS; registro de provas HTTP 409/405 e configurações ACTIVE sem ensaios destrutivos.
- CI, TDD e Teste C: plano CI PASS requerido antes de atualização; TDD de código N/A; Teste C visual N/A por mudança documental. **N/A não é PASS visual.**
- Risco de dados/infra: PASS, nenhum acesso ou mutação Supabase.
- Aprovações: sem review de PR exigida por ruleset; aprovações específicas BRAND-01 não substituídas, mas não aplicáveis a atualização documental.
- Rollback: reverter em PR documental com checks, sem force push.
- Economia Lovable: alteração exclusiva GitHub; nenhum build pela IA Lovable.

## Sequência
1. Criar este PLAN em commit documental isolado, abrir PR, aguardar CI verde.
2. Atualizar apenas auditoria e checkpoint, com rigor histórico e sem promover `NÃO VERIFICADO` a `PASS`.
3. Executar CI no novo SHA e verificar diff e hash de `types.ts`.
4. Com checks obrigatórios aprovados, mesclar PR e registrar evidências.

## ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE (OBRIGATÓRIO)
Marca ContaOS Brand v1.0/BRAND-01, sem modificações; preservar assets, tokens, rotas, UI, dependências, estado, cálculos e backend. Reutilizar > estender > criar. Teste C e homologações autenticas permanecem obrigações próprias; mudança documental não as conclui. GitHub direto e Lovable somente sincronização/visualização, zero mensagens BUILD.
