# ContaOS 4.1 - Instalacao definitiva da auditoria automatizada (versao revisada)

**Ponto de partida:** os cinco perfis foram registrados e a delegacao testada. Nao repita as etapas anteriores.

## Objetivo
Manter investigador, implementador, testador, seguranca e auditor. O orquestrador deve, apos criar uma PR, iniciar uma execucao separada do Codex em `contaos-auditoria`, produzir parecer tecnico fundamentado e, se PASS, indicar a troca manual para a conta GitHub revisora. A unica decisao manual recorrente deve ser autenticar/selecionar a conta e confirmar ou recusar o review formal. Nao exigir uma segunda auditoria tecnica manual, mas nao confundir isso com revisao humana independente.

O controlador **nao executa merge**, nao cria approvals sem consentimento e nao modifica branch protection.

## Etapa 1 - Conferir instalacoes
No VS Code, Ctrl+J, terminal PowerShell:

```powershell
codex --version
git --version
gh --version
gh auth status
gh api user --jq .login
```

Se algum comando nao funcionar, corrigir a instalacao antes de continuar. Nao compartilhar tokens.

## Etapa 2 - Worktree exclusiva

```powershell
cd "$HOME\Projetos\ContaOS-4.1\contaos-hml-control"
git worktree list
```

Se `contaos-auditoria` nao existir:

```powershell
git fetch origin
git worktree add --detach "..\contaos-auditoria" origin/main
```

Nao descartar alteracoes existentes. O controlador verifica limpeza da worktree e carrega o HEAD exato da PR.

## Etapa 3 - Instalar controlador revisado
Baixar `auditar-pr-v2.ps1` fornecido junto com este plano. No terminal:

```powershell
New-Item -ItemType Directory -Force "$HOME\Projetos\ContaOS-4.1\scripts"
Copy-Item "$HOME\Downloads\auditar-pr-v2.ps1" "$HOME\Projetos\ContaOS-4.1\scripts\auditar-pr.ps1"
Test-Path "$HOME\Projetos\ContaOS-4.1\scripts\auditar-pr.ps1"
code "$HOME\Projetos\ContaOS-4.1\scripts\auditar-pr.ps1"
```

A resposta do `Test-Path` deve ser `True`. Se o navegador salvou em outra pasta, ajuste o caminho da origem.

## Etapa 4 - Checagem sem auditoria
Liste PRs:

```powershell
gh pr list --repo contaos999999/contaos-hml-control --state open
```

Escolha PR de teste. Substitua 123 pelo numero confirmado:

```powershell
powershell.exe -NoProfile -File "$HOME\Projetos\ContaOS-4.1\scripts\auditar-pr.ps1" -Pr 123 -Acao Verificar
```

Esse modo nao executa Codex nem registra review.

## Etapa 5 - Auditoria tecnica automatizada

```powershell
powershell.exe -NoProfile -File "$HOME\Projetos\ContaOS-4.1\scripts\auditar-pr.ps1" -Pr 123 -Acao Analisar
```

O controlador consulta PR e HEAD, prepara worktree isolada, executa `codex exec --sandbox read-only`, salva metadados e parecer e confere novamente HEAD e base. O relatorio fica em:

`$HOME\Projetos\ContaOS-4.1\auditorias\PR-123\parecer.md`

O veredito sera `PASS`, `CHANGES_REQUESTED` ou `BLOCKED`. O parecer deve conter evidencias. Nao ha envio automatico de approval.

## Etapa 6 - Troca de conta (manual)

```powershell
gh auth status
```

Para revisar PR criada por `edivan5002`:

```powershell
gh auth switch --hostname github.com --user contaos9999
```

Para revisar PR criada por `contaos9999`:

```powershell
gh auth switch --hostname github.com --user edivan5002
```

Confira:

```powershell
gh api user --jq .login
```

Se a conta ainda nao existir no GitHub CLI, use `gh auth login` e autorize no navegador. Duas contas nao garantem independencia humana.

## Etapa 7 - Registrar revisao formal (manual e confirmada)

Depois de ler o parecer e validar os controles:

```powershell
powershell.exe -NoProfile -File "$HOME\Projetos\ContaOS-4.1\scripts\auditar-pr.ps1" -Pr 123 -Acao Revisar
```

O script verifica: HEAD e base inalterados, integridade do parecer, identidade autorizada e distinta do autor, e, se PASS, checks obrigatorios. Para PASS exige que o usuario digite `APROVAR`; para CHANGES_REQUESTED, `SOLICITAR`. BLOCKED nunca gera approval.

Registro enviado a partir da conta autenticada; o corpo identifica que a analise foi efetuada pelo Codex. Nenhum merge e realizado.

## Etapa 8 - Integrar chamada automatica ao orquestrador
Inicie Codex na pasta principal:

```powershell
cd "$HOME\Projetos\ContaOS-4.1\contaos-hml-control"
codex
```

Envie ao Codex:

> Consulte o protocolo canônico antes de qualquer alteração. Os cinco agentes existentes devem permanecer. Após implementação, testes, checks e abertura de PR, identifique o número e o HEAD da PR e invoque o arquivo local `scripts/auditar-pr.ps1` do diretório pai `ContaOS-4.1`, em modo `Analisar`. Aguarde a execução, leia o relatório e confirme HEAD. Com CHANGES_REQUESTED, devolva os achados ao implementador e reinicie o ciclo; com BLOCKED, pare a certificação; com PASS, apresente o parecer e informe qual conta revisora usar. Nunca execute o modo Revisar nem `gh pr review --approve` sem autorização expressa. Nunca modifique main diretamente nem contorne regras protegidas. Primeiro demonstre, em modo leitura, que o script está no local esperado e que a chamada é possível.

A instrução em sessão não fica automaticamente permanente. Para persistência, preparar alteração mínima no mecanismo canônico de instruções (`AGENTS.md` ou equivalente), abrindo PR protegida, sem sobrescrever protocolos.

## Etapa 9 - Teste de aceitação
Conferir evidências de cada item:

1. Orquestrador encontra uma PR aberta e HEAD válido.
2. Invoca controlador `-Acao Analisar` sem comando manual adicional.
3. Codex auditor inicia nova execução na worktree `contaos-auditoria`.
4. `metadata.json` e `parecer.md` foram gerados; SHA256 registrado.
5. HEAD remoto ainda confere.
6. CHANGES_REQUESTED/BLOCKED nao permitem APPROVE.
7. Conta GitHub revisora e verificada e diferente do autor.
8. `-Acao Revisar` pede sua confirmacao antes do envio.
9. GitHub confirma a revisao ligada a PR.
10. Nenhum merge ou relaxamento de LOCK/Zero-Drift/branch protection foi executado.

Para confirmar a revisao:

```powershell
gh pr view 123 --repo contaos999999/contaos-hml-control --json reviews,headRefOid,url
```

## Etapa 10 - Integracao e checkpoint
Somente depois de cumpridas as regras reais do repositorio, conduzir merge pelo fluxo protegido existente. Confirmar HEAD da main, checks e evidencias; atualizar checkpoint canônico via PR, se exigido, e provar integracao. O controlador nao realiza isso por si.

## Limites honestos
- O controlador foi escrito e inspecionado nesta conversa, mas **nao foi executado em Windows nem contra o GitHub real**.
- O Codex em sandbox read-only pode ficar impedido de executar testes que gravam arquivos; resultados nao executados devem aparecer como nao comprovados.
- Acesso a GitHub nos comandos do auditor pode depender de permissoes/rede; o script evita presumir resultados nao consultados.
- A automacao por orquestrador funciona quando a sessao esta ativa; monitoramento com PC desligado requer GitHub Actions ou outro executor.
- Aprovar com login diferente satisfaz uma identidade GitHub distinta quando elegivel, mas nao atesta revisao humana independente. O review deve descrever a analise automatizada com transparencia.
- O plano nao muda regras canônicas nem certificacoes sem PR/revisao/integracao.

## Referencias
- https://cli.github.com/manual/gh_pr_checks
- https://cli.github.com/manual/gh_pr_review
- https://developers.openai.com/pt-BR/docs/sandboxing
