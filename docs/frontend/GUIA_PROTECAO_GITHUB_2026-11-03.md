# Proteção obrigatória de branch no GitHub — ContaOS 4.1

**Situação verificada:** repositório `contaos999999/contaos-hml-control` é privado; a proteção efetiva da `main` exige confirmação em Settings → Rules → Rulesets. O conector não expõe leitura/edição do ruleset. O conector GitHub é capaz de editar arquivos, mas não oferece administração de branch protection/rulesets. É necessária ação do titular no GitHub.

## 1. Compatibilidade e custo
Para regras obrigatórias em repositório **privado de uma organização**, o GitHub exige **GitHub Team** ou **Enterprise** para repositório privado de organização; GitHub Pro é plano pessoal e não substitui a assinatura da organização. No GitHub Free, regras de proteção são aplicáveis em repositórios públicos, mas não justificam tornar o ContaOS público. Fonte: https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets

## 2. Passo a passo do administrador
1. Abra o [repositório frontend](https://github.com/contaos999999/contaos-hml-control), vá a **Settings → Rules → Rulesets → New ruleset → New branch ruleset**.
2. Nome: `ContaOS-Zero-Drift-main`. **Enforcement status: Active**. Target branches: **Include main**.
3. Habilite **Restrict deletions**, **Block force pushes** e **Require a pull request before merging**. Não libere bypass genérico ou exceção ampla à IA.
4. Em **Require status checks to pass**, escolha os nomes **exatamente como aparecem nos checks do PR #14**. Devem existir o job `ContaOS Frontend Zero-Drift` e o job `ContaOS Teste C Independente`, possivelmente prefixado com nome do workflow reutilizável. Não configurar nome inexistente.
5. Configure revisão humana real com **1 aprovação independente** e um segundo colaborador autorizado (senão o merge ficará legitimamente bloqueado). Exigir descarte de aprovações obsoletas e conversas resolvidas. O próprio autor do PR não conta como revisor de si mesmo. Não exigir uma pessoa inexistente sem primeiro conceder acesso ao revisor.
6. Configure restrição de bypass de administrador **quando disponível**. Salve e teste em PR separado: tentativa de merge sem CI/revisão deve ser rejeitada, e após aprovação real, permitida.

## 3. INTERAÇÃO CRÍTICA com a recuperação do types.ts
O workflow original fazia push direto à main. O GOV-003 modifica o Auto-Lock para gerar um PR de reparo em branch temporária, sem merge automático, exigindo os checks e a revisão do ruleset. Um ruleset que proíba pushes diretos à main deixa de bloquear essa proposta de reparo, mas o bot precisa ter permissão de criar branch, abrir PR e solicitar CI.

**NÃO ativar a proteção restritiva antes de o PR #14 concluir CI e haver validação das permissões de criação de PR/checks pelo bot.** O GOV-003 contém o PLAN técnico, BUILD e ensaios unitários; um PR real de reparo ainda requer um drift controlado autorizado e prova do workflow. Não conceder bypass à identidade do bot nem relaxar a trava para resolver um eventual bloqueio.

## 4. Critério de pronto
`PASS` somente com: ruleset ACTIVE em `main`; checks obrigatórios reais; rejeição comprovada de PR negativo; aprovação humana por identidade verificável; e Auto-Lock compatível e testado. Até lá: `NÃO VERIFICADO`. GitHub Actions pós-push não é bloqueio pré-merge.

## 5. Configuração adicional para o Auto-Lock por PR

No repositório frontend, abrir **Settings → Actions → General → Workflow permissions** e verificar **Allow GitHub Actions to create and approve pull requests**. A opção permite criar PR com o `GITHUB_TOKEN`, mas **não** autoriza o workflow a aprovar ou mesclar PR, que continuarão fora do código. Como PR criado por `GITHUB_TOKEN` não dispara automaticamente eventos de CI de PR, o reparo deverá solicitar `workflow_dispatch` na mesma branch (permissão Actions:write). O titular confirma que os checks estão publicados no SHA correto. Se a organização bloquear a opção, o workflow falhará de maneira explícita; não criar bypass nem usar token mais amplo.

O `GITHUB_TOKEN` nunca pode receber bypass das proteções da `main`. Configurar required checks conforme nomes efetivamente publicados no PR e ter revisor independente habilitado. O conector atual **não consegue verificar/editar o ruleset nem os secrets**. Não declarar ACTIVE sem prova.

Referências oficiais: https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets e https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/enabling-features-for-your-repository/managing-github-actions-settings-for-a-repository
