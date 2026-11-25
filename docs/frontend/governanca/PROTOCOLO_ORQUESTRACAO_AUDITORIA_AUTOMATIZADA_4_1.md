# Protocolo persistente de orquestração e auditoria — ContaOS 4.1

**Vigência:** aplicável no HEAD da `main` que integrar este protocolo após revisão e checks exigidos; enquanto apenas em branch/PR, permanece proposta sem vigência presumida. Não cria serviço contínuo, altera perfis Codex, amplia permissões ou modifica regras de proteção.

**Revisão normativa 1.1, 21/11/2026 — P0-EFIC-001:** exceção **somente** para aprovação formal de PLANs exclusivamente documentais, com provas operacionais futuras de ativação explicitamente bloqueadas. O histórico original permanece recuperável no Git. Esta revisão não altera o veredito do auditor, não concede `PASS` fictício e não modifica exigências para BUILD, segurança, produto ou PROD. Sua eficácia só começa após integração protegida na `main`.

## Emenda do titular de 25/11/2026 — revisão assistida pré-PROD

Até a entrada em produção, a revisão técnica de PLAN, BUILD, atestação, promoção e certificação segue a modalidade **assistida**. O titular autorizou o registro pelo agente em sessão GitHub autenticada como `Edivan5002`, com permissão efetiva no repositório. A autorização é permanente para essa etapa e dispensa a confirmação individual da seção 9. Os BUILDs da missão são publicados por `contaos9999` para preservar a elegibilidade da conta revisora. [Decisão do titular na Issue #708](https://github.com/contaos999999/contaos-hml-control/issues/708#issuecomment-7166602376).

A revisão identifica a modalidade assistida, a PR e o HEAD exato, confere a base viva, analisa o diff e o escopo autorizado, verifica os resultados materiais e os checks exigidos e registra a conclusão fundamentada sob a conta autenticada. Um novo HEAD ou uma base divergente exige nova conferência antes da revisão ou do merge. A suficiência das provas governa o parecer e a autorização de merge.

Esta emenda rege a modalidade e a autorização de registro das revisões pré-PROD nas seções seguintes. Permanecem exigíveis as validações técnicas, as evidências por SHA, a elegibilidade do revisor, a proteção de branch, o merge protegido e o readback. O Teste C conserva seu contrato técnico. A certificação LIVE e o GATE PROD seguem os próprios marcos e autorizações.

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

Registre todos os achados e evidências, agrupe-os por causa raiz, encaminhe-os ao implementador e siga PLAN/escopo aprovado. Execute testes causais, negativos e regressões aplicáveis; publique atualização apenas pelo fluxo protegido. Para BUILD/código, segurança e certificação, aguarde os checks do novo HEAD e rode nova análise independente nesse HEAD. **Para PLAN exclusivamente documental**, aplique a excepcionalidade controlada da seção 9.1: após duas rodadas sucessivas de `CHANGES_REQUESTED` com causas distintas ou inconformidades relativas a execução futura, **suspenda o loop de reauditoria integral automática**, consolide o delta e classifique o achado pela etapa em que a prova é materialmente possível. Não use essa classificação para ocultar falha de segurança, contradição documental ainda existente ou requisito operacional efetivamente aplicável ao PLAN. Não reexecute sem hipótese causal nova; também não declare `PASS` sem parecer correspondente.

## 8. BLOCKED

Identifique o bloqueio e separe falhas corrigíveis de dependências externas. Investigue alternativas permitidas; resolva o que couber e só peça intervenção se faltar credencial, permissão, ferramenta ou decisão humana. Preserve a execução e retome com nova evidência. BLOCKED nunca vira PASS por interpretação; requer nova auditoria depois da resolução.

## 9. Parecer independente e revisão formal

Um `PASS` é parecer técnico automatizado, não revisão formal humana. Na via padrão de BUILD/código, segurança, fluxos operacionais e certificação, o parecer independente `PASS` no HEAD válido continua obrigatório. Na exceção documental descrita na seção 9.1, um `CHANGES_REQUESTED` permanece íntegro e pode fundamentar **revisão formal condicionada** exclusivamente do PLAN, nunca certificação de BUILD ou ativação. Verifique que parecer, hash, HEAD/base, checks e PR continuam válidos. Identifique autor e conta revisora elegível; use comparação de login case-insensitive: autora `edivan5002` exige `contaos9999`; autora `contaos9999` exige `edivan5002`; outros autores exigem revisor distinto com permissão. Informe a conta necessária e peça ao titular que alterne-a se preciso. Não leia tokens nem use conta diferente da identidade efetivamente autenticada. Só após confirmar `gh api user --jq .login`, elegibilidade, integridade do parecer e HEAD/base atuais, chame `-Acao Revisar` para preparar/validar a decisão. Se a conta elegível já estiver disponível em conexão GitHub autenticada, pode-se usar essa integração para registrar a revisão autorizada, após confirmar a identidade real e permissões nela e repetir os mesmos gates de HEAD/base/hash/checks/reviews. Registre explicitamente esse caminho alternativo; não atribua à conta do CLI a identidade da conexão e não exporte tokens. A simulação do modo Revisar não equivale a envio formal por esse modo.

Para a revisão assistida pré-PROD, aplique a autorização de registro da emenda de 25/11/2026. Nas demais modalidades, solicite autorização expressa final com o parecer e a decisão concreta prontos. Em cada modalidade, registre a conclusão sustentada pelo parecer pela conta elegível autenticada. Após o envio autorizado, confirme no GitHub que a revisão foi registrada e continua válida para o HEAD atual.

## 9.1. Exceção proporcional para PLAN exclusivamente documental (P0-EFIC-001)

**Finalidade:** impedir ciclos indefinidos de pareceres `CHANGES_REQUESTED` em PR que **apenas aprova plano/manifesto de implementação futura**, sem modificar código executável, guard, workflow, credencial, ruleset, configuração de segurança, permissão, banco ou produto. A independência da análise, a segregação de funções e a revisão formal continuam obrigatórias. **O requisito universal de obter um novo `PASS` automático após toda emenda do PLAN fica substituído, apenas nessa classe, pela decisão fundamentada do revisor elegível nos termos abaixo.**

**Elegibilidade cumulativa, aferida no HEAD vivo da PR:**

1. O diff paginado contra a base protegida confirma **somente documentos** de PLAN/manifesto/emenda, com escopo identificado e sem comandos, configuração executável, mudanças operacionais ou impacto no produto. Uma PR com BUILD, alteração de gate, workflow ou segurança **não se qualifica**.
2. Existe **ao menos uma análise independente real** da mesma PR, com relatório e metadados preservados (HEAD, base, RunId e hashes recuperáveis), e os sucessivos `CHANGES_REQUESTED` foram examinados **integralmente**, por causa raiz. Nenhum relatório anterior é recarimbado como `PASS` do HEAD novo. A própria revisão formal documenta o **delta atual**, os achados resolvidos, as limitações do parecer anterior e os resultados de CI atuais.
3. Todo achado originalmente impeditivo **aplicável ao documento atual** foi corrigido e verificado no texto consolidado. Um cenário cuja execução exige instalação ainda inexistente, identidade/testbed autorizado adicional ou prova de runtime da **futura ativação** deve ser especificado como condição testável no BUILD/ativação, com responsável, evidência exigida e **estado `BLOCKED_EXTERNAL/NO-GO` de ativação**, sem substituir um ensaio por outro. Não é permitido postergar falha de segurança já presente, adulteração, aprovação indevida, contradição conhecida ou violação de escopo do próprio PLAN.
4. HEAD da PR, base viva e regras de proteção revalidados; checks exigidos reais `success`, nenhum `skipped` usado como evidência de teste que não ocorreu; ausência de bypass, permissões ampliadas ou merge não protegido. O revisor é **outra identidade elegível**, distinta do autor, e registra revisão fundamentada, por commit específico, com a lista de evidências reusadas, o motivo da aceitação documental e os bloqueios de ativação.
5. O titular concede **autorização expressa final e específica** para o evento formal `APPROVE` nessa modalidade. Sem essa autorização, o registro permitido é `COMMENT`, e não `APPROVE`.

**Efeito e limites:** satisfeitos os cinco critérios, o revisor pode registrar `APPROVED — ACEITE DOCUMENTAL CONDICIONADO` sem exigir que o auditor execute sucessivamente uma sessão completa até emitir `PASS`. Essa decisão **não altera o `CHANGES_REQUESTED` histórico**, não equivale a parecer independente `PASS`, não certifica funcionalidade e não autoriza ativação. O manifesto de BUILD permanece com `ativacao_autorizada=false`; o início da implementação continua sujeito à base/allowlist autorizadas, testes e revisão próprios. N17(c), quando depender de **terceiro autor previamente autorizado** e duas reviews elegíveis, é prova de **ativação em fila isolada**, não do aceite documental do PLAN. Sem topologia/prova operacional autorizadas, a ativação permanece `NO-GO`. Não criar identidade, App, acesso ou runner adicional por inferência.

**Registro operacional:** o controlador local 3.1.4, modo `-Acao Revisar`, permanece estrito e **não deve ser adulterado ou receber `PASS` sintético**. Nesta exceção, utilizar exclusivamente a integração GitHub da identidade revisora realmente autenticada, conforme a via alternativa já prevista na seção 9, publicando review no HEAD real e conferindo readback. Anexar ou referenciar ao comentário da PR o relatório histórico e o termo de aceitação proporcional. Qualquer alteração que deixe de ser apenas documental retorna automaticamente ao rito padrão de `PASS` independente, sem exceção.

## 10. Merge protegido

Depois da revisão formal, confirme novamente HEAD/base, aprovação válida, checks exigidos, ausência de impedimentos e regras atuais de proteção. Faça merge somente pelo mecanismo canônico permitido e apenas quando os gates autorizarem; nunca ignore proteção ou use bypass. Confirme no GitHub o resultado, o novo HEAD de `main` e controles pós-merge. Mudança de HEAD invalida evidência vinculada ao SHA antigo conforme o protocolo aplicável.

## 11. Persistência e checkpoint

Este documento e a referência única em `AGENTS.md` tornam o procedimento persistente apenas após merge protegido. Não duplique o protocolo em instruções concorrentes nem altere `config.toml` ou os cinco perfis neste escopo. Após cada integração, registre repositório, HEAD, PR/commit, identidade e revisão formal (se houver), testes/checks, auditoria/RunId/hashes, última etapa provada, pendências e próxima ação em `docs/frontend/ESTADO_E_RETOMADA_CONTAOS_4_1.md`. Só chame checkpoint de integrado depois de confirmar o conteúdo no GitHub/main.

## 12. Limite de automação

O ciclo roda enquanto a sessão ativa e as ferramentas autorizadas estiverem disponíveis. Não instalar serviço, tarefa agendada, credencial ou acesso irrestrito. Aprovação formal e decisões reservadas ao titular continuam humanas. Nunca declare conclusão sem evidências verificáveis de integração e revisão exigida.

## 13. Relatório de sessão

Classifique cada etapa como `CONCLUÍDA`, `PENDENTE` ou `BLOQUEADA` e reporte evidência/link/HEAD, perfis e permissões verificados, controlador/worktree, testes, pareceres, reviews efetivamente registrados, arquivos/PRs/commits, riscos corrigidos, pendências, estado da persistência e próxima ação. Separe auditoria técnica, review formal e merge.


## 14. Emenda CSDI proposta (PR #692, 21/11/2026)

**PROPOSTA NÃO VIGENTE.** Substituir, após aprovação e integração, o requisito de parecer externo independente no gate de certificação semântica por Certificação Semântica Definitiva Interna (CSDI). A CSDI exige pré-auditoria adversarial, pré-certificação BUILD autenticada, inventário exaustivo de cláusulas e regras, sete eixos, adjudicação das interações, ambiguidades resolvidas, provas positivas e negativas LIVE, segunda leitura crítica interna, recibo autenticado e consumidor fail-closed. A falta de parecer externo não bloqueará o gate semântico após migração, mas ausência de prova semântica sempre bloqueará. BUILD PRE_CERTIFICATION_ONLY não é SEMANTIC_COMPLETENESS=PASS. Revisões formais humanas de outros gates, N17(c), App privilegiado, fila real, HML/RLS, PROD, merge protegido e ativação continuam exigíveis. Até o merge, aplicar o rito vigente. Ver a emenda proposta e inventário na PR #692.
