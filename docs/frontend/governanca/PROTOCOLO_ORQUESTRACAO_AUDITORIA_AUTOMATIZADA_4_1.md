# Protocolo persistente de orquestração e auditoria — ContaOS 4.1

**Vigência:** aplicável no HEAD da `main` que integrar este protocolo após revisão e checks exigidos; enquanto apenas em branch/PR, permanece proposta sem vigência presumida. Não cria serviço contínuo, altera perfis Codex, amplia permissões ou modifica regras de proteção.

## Fonte, escopo e eficácia

Esta é a proposta normativa da PR682 para operacionalizar o ciclo de orquestração, auditoria, revisão formal e checkpoint. Sua eficácia requer revisão e integração protegida, como indicado acima. Ela não concede autorização para enviar revisões em nome do titular: cada envio continua sujeito à autorização expressa aplicável e à identidade real elegível.

Fonte prévia integrada: [instruções originais da instalação](../auditorias/instalacao-automatizada-v3_1/fontes/PLANO_COMPLETO_CONTAOS_AUDITORIA_V2.md), preservadas pela PR681 em main5bbadb225b52f71b1a8383f36b63e3ede9e11a2d, SHA256bea4d94cc595810bb82c5b8b90aee5c1101bb6a69fe496d403c9e227edc37cbe. A Etapa6, linhas84–94, define explicitamente os dois pares de contas usados na seção9 deste protocolo; a Etapa7 exige confirmação formal, e a Etapa8 descreve o acionamento pelo orquestrador. A fonte e os trechos podem ser conferidos no blob Git desse commit. A PR682 detalha esse rito sem alterar proteções, atribuições dos agentes ou certificações. Não se presume autorização histórica nem futura para decisões específicas a partir da mera existência deste protocolo.

## 1. Fontes e início da sessão

Use o GitHub real de `contaos999999`, o repositório frontend `contaos999999/contaos-hml-control`, o repositório backend identificado nas fontes vigentes, HEADs confirmados, PRs/revisões/checks, manifestos, `AGENTS.md`, LOCK, Zero-Drift e checkpoint integrado. Relatos e memória servem apenas como pistas, nunca como prova. No início, confirme os HEADs remotos relevantes, o estado da PR e checkpoint/certificações; preserve certificados válidos e não reabra trabalho sem motivo causal.

## 2. Cinco perfis fixos

Reutilize os perfis `investigador`, `implementador`, `testador`, `seguranca` e `auditor` conforme suas atribuições instaladas. Antes de delegar, confirme configuração, carregabilidade e limites de sandbox; não recrie nem altere perfis sem escopo e PLAN próprios. O implementador não certifica a própria alteração. O auditor trabalha numa sessão Codex nova e read-only na worktree `contaos-auditoria`.

## 3. Ciclo de trabalho

Siga os gates canônicos aplicáveis nesta ordem: reconhecimento, diagnóstico/RCA, PLAN validado, implementação limitada, testes, segurança, PR, checks, auditoria separada, correções e nova auditoria, revisão formal autorizada, merge protegido e checkpoint. Falha conhecida exige prevenção comprovada antes de nova tentativa. Falha nova exige RCA, impacto, RED, GREEN, AUDIT e registro preventivo. Sem prova, marque `NÃO_VERIFICADO`, `PENDENTE` ou `BLOCKED`; não infira PASS.

## 4. Limites

Trabalhe apenas no ambiente autorizado. HML é o único ambiente permitido nesta fase; PROD é proibido. Não acesse tecnicamente backend, schema, RPC, RLS ou dados sem autorização específica. Preserve `src/integrations/supabase/types.ts` no blob certificado, RLS/RBAC, isolamento, Zero-Drift, branch protection, histórico publicado e evidências imutáveis. Nunca faça push forçado, bypass, merge automático pelo controlador ou aprovação automática.

## 5. Disparo da auditoria

Depois de concluir implementação e testes pertinentes e abrir/atualizar a PR, resolva pelo GitHub seu número, HEAD, base e autor. Confirme controlador local `C:\Users\ediva\Projetos\ContaOS-4.1\scripts\auditar-pr.ps1`, versão/hash, perfil auditor e worktree `C:\Users\ediva\Projetos\ContaOS-4.1\contaos-auditoria`. Confira que a worktree é limpa e isolada. Aguarde checks correspondentes ao HEAD submetido e invoque `-Acao Analisar` pelo orquestrador, com o número real; não solicite ao titular que execute o comando quando a sessão tiver permissões adequadas. Não rode auditorias concorrentes na worktree compartilhada.

## 6. Integridade da execução

A auditoria deve ocorrer em nova execução do Codex com perfil explicitamente `auditor`, sandbox read-only, na worktree isolada e no HEAD exato da PR. Confirme no processo/metadados perfil selecionado, modelo se houver override, worktree, modo, HEAD, base, identidade, horário, hashes e RunId. O orquestrador lê o parecer integral e os metadados e verifica seus hashes; depois consulta novamente GitHub para comparar HEAD/base remotos, checks exigidos, reviews e estado da PR. Relatório de SHA anterior não vale para o atual. Se HEAD/base mudar durante ou após análise, não reutilize PASS: reavalie os checks e execute nova análise conforme o delta e o protocolo.

A base vigente deve ser comprovada pelo OID vivo de `refs/heads/<baseRefName>`, consultado diretamente no GitHub; `baseRefOid`/`pull.base.sha` registrados na PR não são prova suficiente do HEAD atual da branch. O orquestrador compara a ref viva antes e depois de Analisar e imediatamente antes da revisão/merge, registra o OID e bloqueia o reaproveitamento do parecer se houver divergência. Enquanto uma versão do controlador não comprovar essa consulta, o orquestrador deve executar essa verificação explícita por API autenticada; não declarar que o controlador sozinho garante frescor da base.

## 7. CHANGES_REQUESTED

Registre todos os achados e evidências, agrupe-os por causa raiz, encaminhe-os ao implementador e siga PLAN/escopo aprovado. Execute testes causais, negativos e regressões aplicáveis; publique atualização apenas pelo fluxo protegido. Aguarde checks do novo HEAD e rode nova análise isolada nesse HEAD. Repita enquanto houver correção permitida e evidência para avançar; não enfraqueça gates nem faça retry sem delta causal.

## 8. BLOCKED

Identifique o bloqueio e separe falhas corrigíveis de dependências externas. Investigue alternativas permitidas; resolva o que couber e só peça intervenção se faltar credencial, permissão, ferramenta ou decisão humana. Preserve a execução e retome com nova evidência. BLOCKED nunca vira PASS por interpretação; requer nova auditoria depois da resolução.

## 9. PASS e revisão formal

PASS é parecer técnico automatizado, não revisão formal humana. Verifique que parecer, hash, HEAD/base, checks e PR continuam válidos. Identifique autor e conta revisora elegível; use comparação de login case-insensitive: autora `edivan5002` exige `contaos9999`; autora `contaos9999` exige `edivan5002`; outros autores exigem revisor distinto com permissão. Informe a conta necessária e peça ao titular que alterne-a se preciso. Não leia tokens nem use conta diferente da identidade efetivamente autenticada. Só após confirmar `gh api user --jq .login`, elegibilidade, integridade do parecer e HEAD/base atuais, chame `-Acao Revisar` para preparar/validar a decisão. Se a conta elegível já estiver disponível em conexão GitHub autenticada, pode-se usar essa integração para registrar a revisão autorizada, após confirmar a identidade real e permissões nela e repetir os mesmos gates de HEAD/base/hash/checks/reviews. Registre explicitamente esse caminho alternativo; não atribua à conta do CLI a identidade da conexão e não exporte tokens. A simulação do modo Revisar não equivale a envio formal por esse modo.

Antes de enviar `APPROVE`, pare com o parecer e a decisão concreta prontos e peça autorização expressa final para registrar essa decisão formal pela conta autenticada. Sem essa autorização, cancele; jamais preencha `APROVAR` por inferência, faça impersonação ou envie `CHANGES_REQUESTED` sem autorização expressa correspondente. Após envio autorizado, confirme no GitHub que a revisão foi registrada e continua válida para o HEAD atual.

## 10. Merge protegido

Depois da revisão formal, confirme novamente HEAD/base, aprovação válida, checks exigidos, ausência de impedimentos e regras atuais de proteção. Faça merge somente pelo mecanismo canônico permitido e apenas quando os gates autorizarem; nunca ignore proteção ou use bypass. Confirme no GitHub o resultado, o novo HEAD de `main` e controles pós-merge. Mudança de HEAD invalida evidência vinculada ao SHA antigo conforme o protocolo aplicável.

## 11. Persistência e checkpoint

Este documento e a referência única em `AGENTS.md` tornam o procedimento persistente apenas após merge protegido. Não duplique o protocolo em instruções concorrentes nem altere `config.toml` ou os cinco perfis neste escopo. Após cada integração, registre repositório, HEAD, PR/commit, identidade e revisão formal (se houver), testes/checks, auditoria/RunId/hashes, última etapa provada, pendências e próxima ação em `docs/frontend/ESTADO_E_RETOMADA_CONTAOS_4_1.md`. Só chame checkpoint de integrado depois de confirmar o conteúdo no GitHub/main.

## 12. Limite de automação

O ciclo roda enquanto a sessão ativa e as ferramentas autorizadas estiverem disponíveis. Não instalar serviço, tarefa agendada, credencial ou acesso irrestrito. Aprovação formal e decisões reservadas ao titular continuam humanas. Nunca declare conclusão sem evidências verificáveis de integração e revisão exigida.

## 13. Relatório de sessão

Classifique cada etapa como `CONCLUÍDA`, `PENDENTE` ou `BLOQUEADA` e reporte evidência/link/HEAD, perfis e permissões verificados, controlador/worktree, testes, pareceres, reviews efetivamente registrados, arquivos/PRs/commits, riscos corrigidos, pendências, estado da persistência e próxima ação. Separe auditoria técnica, review formal e merge.
