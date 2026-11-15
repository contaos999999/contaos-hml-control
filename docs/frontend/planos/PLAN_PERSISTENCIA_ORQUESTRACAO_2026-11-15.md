# PLAN documental — persistência da orquestração automatizada ContaOS 4.1

**Estado:** PLAN documental prévio de correção da governança da PR682. Validação técnica nominal proposta; eficácia somente após revisão, CI e merge protegido desta PR de PLAN. Nenhum hook ou protocolo executado por esta PR.

## Objetivo

Persistir em fonte versionada a instrução do titular para orquestrar reconhecimento, diagnóstico, implementação, testes, segurança, PR, auditoria isolada, correções, revisão formal autorizada, merge protegido e checkpoint, sem replicar o protocolo em múltiplos hooks.

## Baseline e escopo

Baseline histórico de desenho: `main@5bbadb225b52f71b1a8383f36b63e3ede9e11a2d`, após integração do PLAN #681. O `AGENTS.md` já contém um hook “Integração operacional — auditoria automatizada por PR”; o PLAN #681 (merge `5bbadb225b52f71b1a8383f36b63e3ede9e11a2d`) autoriza a instalação 3.1, não este novo protocolo. Confirmar HEAD remoto, checkpoint, fontes P0 e plano ativo na abertura da PR que executar este PLAN.

### Allowlist de BUILD

1. `AGENTS.md` — substituir somente a seção existente “Integração operacional — auditoria automatizada por PR” por hook conciso que referencia o protocolo abaixo; remover duplicidade, sem alterar outras regras.
2. `docs/frontend/governanca/PROTOCOLO_ORQUESTRACAO_AUDITORIA_AUTOMATIZADA_4_1.md` — adicionar este protocolo consolidado.
3. `docs/frontend/ESTADO_E_RETOMADA_CONTAOS_4_1.md` — registrar o protocolo e etapa como “integrado” somente no próprio merge comprovado; até então, registrar proposta/PR e pendência, preservando o histórico.

Este arquivo de PLAN e o GOV_PLAN da PR são documentos de controle pré-BUILD, não caminhos de BUILD. Não editar config.toml, agentes, controlador, workflows, código de aplicação, backend, tipos, regras de proteção, certificados ou manifestos existentes. PR documental em branch dedicada e PR protegida; sem escrita direta na main.

## Critérios de aceite

- Hook único em `AGENTS.md` aponta para o protocolo consolidado e mantém a chamada `Analisar` após checks, a sessão nova Codex/read-only, a leitura/hashes do parecer, os ciclos corretivos e a fronteira entre PASS técnico e revisão formal.
- Protocolo cobre os cinco perfis já existentes e suas fronteiras; execução integral e contínua apenas dentro da sessão e permissões ativas; nenhum serviço ou acesso amplo.
- Antes da auditoria: PR/HEAD/base/autor confirmados, checks do HEAD esperados, controlador/worktree/perfil verificados e auditoria exclusiva serializada. Durante/depois: processo/metadados, RunId, hashes e identidade verificados; parecer ligado ao HEAD/base atual, sem reaproveitar SHA antigo.
- CHANGES_REQUESTED volta ao rito permitido, executa teste causal/regressão, aguarda CI e reaudita SHA novo. BLOCKED é classificado e resolvido quando permitido; dependência externa é escalada precisamente. Nenhum estado é promovido sem nova evidência.
- PASS leva à validação de checks/reviews, identificação de identidade distinta do autor e conta elegível, autenticação real por `gh api user`, e preparação da revisão formal. O envio de qualquer decisão requer autorização humana expressa; `APPROVE` nunca automático.
- Merge só após review válida e confirmação atual dos checks/proteções, pelo mecanismo canônico; sem bypass. Resultado e novo HEAD precisam ser lidos do GitHub.
- Checkpoint distingue proposta, branch, review, merge e integração e só marca integrado após confirmar HEAD/conteúdo em `main`.
- Auditoria de diff confirma que somente os três caminhos allowlisted mudaram; nenhuma certificação anterior é reaberta ou modificada.

## Verificação e riscos

Teste documental: comparação do diff com allowlist; validação de links/caminhos citados; busca por duplicação de hook; conferir expressões que poderiam sugerir review/merge automáticos; verificar que identidade é comparada sem distinção de caixa e sempre contra `gh api user`. Não criar teste de aplicação para alteração exclusivamente documental.

Risco principal é persistir diretriz fora de seu domínio ou duplicar comportamento do controlador. Mitigação: manter o controlador como mecanismo executável sob sua própria versão, referenciar um protocolo único, não ampliar CLI neste PLAN e revisar o diff completo antes da PR. Risco residual: disponibilidade contínua limitada à sessão ativa e às ferramentas autorizadas.

## Revisão, integração e rollback

Exigir checks de branch atuais, Zero-Drift/P0-NR/LOCK e Teste C quando aplicável à alteração documental, além de revisão independente. Não enviar decisão formal até autorização humana específica; não fazer merge sem os controles aplicáveis. Rollback por PR reversa limitada aos três caminhos, com nova versão documental e sem remover histórico/evidência.

## Próximas ações permitidas depois da validação do PLAN

1. Criar/validar o GOV_PLAN vinculado à PR futura, com estes três caminhos exatos.
2. Aplicar o hook único e adicionar protocolo/checkpoint na branch autorizada.
3. Executar validações de escopo documental, abrir/atualizar PR e aguardar checks.
4. Rodar auditoria independente do HEAD exato e tratar resultados.
5. Preparar revisão formal; solicitar ao titular somente a autorização final específica para registrar a decisão.
6. Integrar pelo fluxo protegido e confirmar checkpoint remoto.

## Emenda de gate prévio — reapresentação protegida da PR682

Baseline atual conferido mainf538d967dd974b7cd8243a3407a0736b64580db3, com instalação680 já integrada. Esta PR contém somente este PLAN e P0_GOV_PLAN_682.json. Não altera AGENTS, protocolo, checkpoint, perfis, controlador, workflows ou aplicação; não é BUILD. Segue o mesmo mecanismo documental prévio utilizado no PLAN681.

A auditoria R3 da PR682 no HEAD30161d949eeba6dfa1d0b87c50578b8a1a955a6d emitiu CHANGES_REQUESTED porque a proposta documental afirmava exigir GOV_PLAN prévio sem comprovar sua integração. Não atribuir aprovação retroativa àquele HEAD. Causa: confundiu-se candidatura documental com o cumprimento do rito prévio que o próprio PLAN estabeleceu; as revisões anteriores não fecharam toda a classe de governança/proveniência.

Correção: integrar este PLAN e o GOV_PLAN682 pela PR protegida; somente depois atualizar a branch682 com a main e reapresentar seu BUILD documental em novo commit, com checks e nova auditoria. O GOV_PLAN682 aprovado vincula exatamente AGENTS.md, protocolo MD e checkpoint MD. Nenhum manifest de certificação ou plano funcional de frontend é alterado. O PLAN pertence à main antes da reapresentação; não é um arquivo adicional de BUILD da682.

Gate técnico nominal: fonte integrada681/sha5bbadb2 e snapshot normativo1504af465b45afc846458d00e5cb63513fa298ed; sem delta técnico ou visual, BRAND/IDENTIDADE VISUAL N/A. Escopo, fontes, autorização de instalação/orquestração, isolamento, revisão formal, ausência de PROD/backend/types e rollback conferidos. Esta validação nominal não é review formal nem substitui o CI/auditor/review/merge desta PR.

RED documental: ausência de GOV_PLAN682 no commit-base da proposta R3. GREEN exigido antes de reapresentar: git show main:P0_GOV_PLAN_682.json aprovado/pr_number682 com três caminhos exatos e PLAN integrado; base atualizada; diff682 limitado a esses caminhos; readback remoto, checks atuais e auditoria nova. O R3 e todos os pareceres anteriores permanecem imutáveis. Teste C visual N/A documental, nunca tratar SKIPPED como E2E. Rollback por nova PR documental, sem bypass ou reescrita.

Prevenção: nenhuma futura proposta pode declarar gate prévio cumprido apenas por trazer o próprio PLAN no mesmo diff de BUILD. Primeiro conferir a existência do artefato aprovado no HEAD remoto main e a allowlist vinculada ao número real; então reapresentar o BUILD. O rito desta PR de PLAN é documental, não requer outro GOV_PLAN recursivo para si e não modifica código/hook.
