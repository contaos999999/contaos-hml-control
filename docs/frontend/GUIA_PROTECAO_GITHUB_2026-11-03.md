# Proteção obrigatória de branch no GitHub — ContaOS 4.1

**Situação verificada:** repositório `contaos9999/contaos-hml-control` é privado, `main protected=false`. O conector GitHub é capaz de editar arquivos, mas não oferece administração de branch protection/rulesets. É necessária ação do titular no GitHub.

## 1. Compatibilidade e custo
Para regras obrigatórias em repositório **privado de conta pessoal**, o GitHub exige **GitHub Pro** (ou plano Team/Enterprise conforme tipo de conta). No GitHub Free, regras de proteção são aplicáveis em repositórios públicos, mas não justificam tornar o ContaOS público. Fonte: https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets

## 2. Passo a passo do administrador
1. Abra o [repositório frontend](https://github.com/contaos9999/contaos-hml-control), vá a **Settings → Rules → Rulesets → New ruleset → New branch ruleset**.
2. Nome: `ContaOS-Zero-Drift-main`. **Enforcement status: Active**. Target branches: **Include main**.
3. Habilite **Restrict deletions**, **Block force pushes** e **Require a pull request before merging**. Não libere bypass genérico ou exceção ampla à IA.
4. Em **Require status checks to pass**, escolha os nomes **exatamente como aparecem nos checks do PR #11**. Devem existir o job `ContaOS Frontend Zero-Drift` e o job `ContaOS Teste C Independente`, possivelmente prefixado com nome do workflow reutilizável. Não configurar nome inexistente.
5. Configure revisão humana real quando houver segundo colaborador autorizado: 1 aprovação independente, dismiss stale approvals e conversas resolvidas. O próprio autor do PR não conta como revisor de si mesmo. Não exigir uma pessoa inexistente sem primeiro conceder acesso ao revisor.
6. Configure restrição de bypass de administrador **quando disponível**. Salve e teste em PR separado: tentativa de merge sem CI/revisão deve ser rejeitada, e após aprovação real, permitida.

## 3. INTERAÇÃO CRÍTICA com a recuperação do types.ts
O workflow existente `.github/workflows/contaos-types-autolock.yml` restaura o `types.ts` certificado por **push direto na main**. Um ruleset que proíba todos os pushes diretos pode impedir o Auto-Lock e deixar a regeneração do Lovable sem correção.

**NÃO ativar uma proteção restritiva em produção de desenvolvimento sem antes aprovar e testar a migração do Auto-Lock para PR automatizado de reparo, ou exceção estreita para identidade autenticada do bot, quando tecnicamente viável.** A migração exigirá novo PLAN técnico do frontend, validação, BUILD, ensaio em branch temporária e registro no GitHub. Nunca desative a trava nem amplie permissões para “resolver” o conflito.

## 4. Critério de pronto
`PASS` somente com: ruleset ACTIVE em `main`; checks obrigatórios reais; rejeição comprovada de PR negativo; aprovação humana por identidade verificável; e Auto-Lock compatível e testado. Até lá: `NÃO VERIFICADO`. GitHub Actions pós-push não é bloqueio pré-merge.
