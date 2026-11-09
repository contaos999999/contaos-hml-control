# PLAN: inspeção independente do artefato técnico R6 no CI

**Objetivo:** ler e conferir os recibos originais R6 sem executor Vercel, sem repetir Auth ou operações de negócio. Issue317/P0 e autorização contínua do titular. PLAN documental; GATE próprio antes de BUILD.

**Arquitetura:** workflow separado somente leitura no GitHub, Node24 e módulos nativos. Um downloader oficial fixado por commit será executado como subprocesso com saída capturada; somente após origem, digest, membros, hashes e schemas fechados aprovados o leitor emitirá os dois JSON técnicos originais. Não é outro backend nem transporte da aplicação.

**Especificação:** GATE454/BUILD455, solicitação456 e checkpoint3176735747856. Preservar oito confirmações anteriores e tratar todas as novas intenções/logout/bindings R6 como DESCONHECIDOS até conferir o artefato.

## Origem real fixada

Main/harness R6 9cd01a472146c67c4a3cae5f3d9a6b5d7448716a, request456472633d999d98922fd52a886c00a984149dd670f, paibd4a7eb60f04e3e54b83880294446cdb5be7cf2b. Run42585173702/attempt1/workflow411426169/eventworkflow_run/main/repo1442722734, privatejob129053499534, completed/failure. UpstreamZero42585029040/attempt1/push/main/headigual/success. Artifactúnico13658434738/nome trilha-a-fixtures-42585173702-1/8366bytes/notexpired/digestsha256:10e55ed5856aac2879188ab5f2df3b1f4a98b180de21dd7abcb470c162f9d68c, nove membros esperados. Produto437c788e32f0325dd15c9d2e7277c10129bcb462/HMLdpl_F3CjrU8Q3iXrKz1YS7KfDs3VXAzp.

A falha genérica FIXTURE_PREPARATION_INCOMPLETE não identifica a causa. ZIP menor/maior e conclusão do job não provam intenção zero, logout ou estado de competência. Não executar R7, compensação ou replay enquanto isso for desconhecido. Backend139 não demonstrado como dependência.

Executor originalfailed/VM13expirada; Vercel402payment_required para snapshot/criação, inclusive após término da VM. Alternativas externas não forneceram bytes verificáveis. Usar CI somente leitura resolve a inspeção técnica sem alterar cobrança, segurança, HML ou PROD.

## Escopo

Três arquivos novos, adicionados explicitamente à allowlist no GATE:
- .github/workflows/contaos-trilha-a-fixture-inspection.yml
- scripts/hml/inspect-fixture-artifact.mjs
- scripts/hml/inspect-fixture-artifact.test.mjs

Não alterar os quatro mjs do BUILD455, workflows Auth/Fixtures/Zero existentes, SRC/public, tipos, dependências/lock, Supabase/SQL/RLS/RPC, Master secrets ou deployment. Prettier frozen3.9.6 já obtido no CI pode formatar em V8; não adicionar biblioteca ao produto.

## Interface e fonte oficial do downloader

Workflowunitário em pull_request somente para os três paths; job sem environment/secrets e somente contents:read. Inspector automático em push de main somente quando um dos três paths muda, depois de CI/review/merge protegido. Não há ferramenta de dispatch disponível; não usar rerun nem novo Auth para obter leitura. Inspector usa contents:read/actions:read, GITHUB_TOKEN apenas para GETs GitHub e downloader; nenhum segredo de usuário/aplicação. Concorrência própria, cancel-in-progressfalse; job limitado.

Fonte primária lida: actions/download-artifact README e src/download-artifact.ts no commit d3f86a106a0bac45b974a628896c90dbdf5c8093 (tagv4); bundleddist Gitblob374211f852b2a8155a0211c72e85dacc81bb69f3. A action avisa com core.warning quando digestMismatch e ainda conclui SUCCESS; portanto SUCCESS isolado NÃO é verificação fail-closed.

Checkout separado desse repositório oficial no commit literal, persist-credentialsfalse, verificar HEAD/diff/bundle antes de executar dist/index.js com process.execPath. O nosso CLI captura stdout/stderr privados do subprocesso, não reemite nenhum deles. Ambiente mínimo com INPUT_ARTIFACT-IDS/INPUT_RUN-ID/INPUT_REPOSITORY/INPUT_GITHUB-TOKEN/INPUT_PATH/INPUT_MERGE-MULTIPLE fixos; omitir NODE_OPTIONS, HOME, DEBUG, GITHUB_OUTPUT e credenciais da aplicação. Sem shell, npm install, código dinâmico do artefato, ZIPparser ou criptografia próprios.

Antes do GATE, confirmar no bundle pinado a frase do digest efetivamente emitida. Exigir exatamente um SHA256 calculado igual ao literal R6 e negar qualquer warning/digestMismatch, saída ausente/duplicada, exitcode nãozero, timeout ou overflow. Timeout end-to-end30s, killSignalSIGKILL, buffer limitado, sem retry. Se fornecedor mudar formato, bloquear, não aceitar sucesso por conveniência.

## Verificação fechada

GETs somente endpoints GitHub fixos do run/artifact/lista/attemptjobs/upstream necessários. Validar repo/owner/head/event/workflow/path/attempt1/branch/status/ID/nome/tamanho/digest/notexpired e unicidade. Não seguir URLs fornecidos por campos arbitrários. Token nunca em log/arquivo ou host nãoGitHub; o downloader oficial faz o acesso ao serviço de artifacts.

Diretório fresco sob RUNNER_TEMP, caminho canônico fixo, sem symlink/hardlink/arquivo não regular, nested ou nome desconhecido. Limitar bytes individuais e totais antes de leitura. São exatamente:
report.json, receipts.json, receipts-r1.json, recovery-r2.json, receipts-r3.json, recovery-r3.json, receipts-r5.json, recovery-r5.json e SHA256SUMS.

Manifesto contém exatamente oito linhas únicas na ordem do produtor, hashes hex64 e nomes fixos; recalcular SHA256 dos oito membros. Histórico:
| Membro | SHA256 original |
|---|---|
|receipts-r1.json|381bb6f66d750a957c98727c3b1cda465dfbcbbbcbd946b5122b7b55f2a604f9|
|recovery-r2.json|d4772f47294aefa08d3683c79156414d9f5984053ea2ffe0cd8360c082527d45|
|receipts-r3.json|28c48b06d3ea9a57d7d631422d813b887c23b5c061fa127499bcf4ffef247364|
|recovery-r3.json|db27ca1ab4a4ba6da14dab4c2879670e420c969fde183f0fd6730c654c197f4f|
|receipts-r5.json|fd97a387cae0e16af65c6923f453ac83262e58447176c3c558b1c10bc15c5eeb|
|recovery-r5.json|a92027cc0a7c9e2ce97f233c7aa1920205a158282ba6b955f7279cd9d8ae2dae|

Último hash reconstruído do documento R5 literal no blob produtor72f9fe7852e2d8b9f2d9ce6451890956545680ad e SHA puro conferiu também hashes reportR5/receiptsR5. Não importar o preparador no leitor: ele importa TypeScript/JSDOM/parse5. Validador separado usa somente Nodebuiltins e snapshots fechados dos enums/formatos do produtor pinado; não duplica regra de negócio.

Report original tem15keys, diagnostics9, intentLedger8 ou null, recovery fechado, bindings fechado ou null, ids UUID operacionais limitados. Receipts têm exatamente onze campos emitidos pelo broker (sete+identity4); o optional ids de safeReceipt NÃO é emitido pelo produtor R6 e não vira campo obrigatório. Validar todas as chaves, tipos, enums reais, identidades, org/contrato/meses/roles, hashes, cardinalidade e relações, sem confiar no safeReceipt permissivo a ausências. Oito confirmações históricas/teto24/novo16 são contexto; ledgerausente ou intenção uncertain permanece UNKNOWN.

UTF8 fatal, sem BOM; report===JSON.stringify(parsed,null,2)+newline. Receipts vazios do produtor podem ser somente a forma compacta JSON.stringify(obj)+newline com array vazio; não-vazios somente pretty. Essas condições rejeitam duplicatekeys/campos sobrescritos/whitespace/trailer que poderiam ocultar PII no raw. Nunca imprimir JSONparseerror.message.

## Tarefas e critérios de prova

- [ ] GATE documental separado fecha paths, origem, fonte do downloader, permissões, limites e schemas; CI/revisão/integração antes de código.
- [ ] RED no CI sem credenciais: workflowunit scaffold e teste de comportamento ausente, sem chamar inspector em PR e sem contar import/syntaxerror como prova.
- [ ] Implementar origem/downloadcapturado/manifest/validador em Nodebuiltins. Rejeitar antes de qualquer saída: metadata divergente, toolmodificado, falta/mismatch/duplicata de digest, warning, timeout/overflow, membros a mais/symlink/UTF8/BOM/duplicatekeys, hash errado, schema extra, enum desconhecido, identidade/roles trocados, canários PII/token em qualquer campo ou erro.
- [ ] Positivo fixture técnico local derivado do formato original, negativos com zero divulgação parcial; validar count/uncertain sem converter ausência em zero.
- [ ] Somente depois de TODOS os checks emitir uma estrutura técnica fechada com origem, hashes/manifest e reportRaw/receiptsRaw UTF8 originais comprovados. Nenhum PNG/DOM/Auth/URL/payload de negócio/cookie/storage/env/childlog.
- [ ] CIunit/Zero/LOCK/lintformato aplicáveis e revisão independente no HEAD final. Integrar por merge protegido; o pushmain executa a inspeção somente leitura explicitamente autorizada por este escopo.
- [ ] Root e revisor conferem output real, hashes e proveniência; só então diagnosticar R6 e definir saldo/bindings/próxima correção. Falha do leitor permanece BLOQUEADO, sem Auth/rerun.
- [ ] Atualizar checkpoint GitHub com resultado real e próxima etapa. Preservar18públicos/Run124/C13 e não certificar184/24fixtures/72/V1 por este leitor.

O plano não autoriza publicação de mídia/DOM ou conteúdo desconhecido, novo request HML, SQL ou alterações financeiras. É um instrumento mínimo de inspeção de um único artefato técnico imutável.
