# PROMPT 36 / V1-15 — Competência: Documentos

Base: `77ffd79` (árvore V1-14 equivalente a `b5fe91f`). Plano aprovado: `.lovable/plan/prompt-36-v1-15-competência-documentos-plan-2026-11-03.md` (com correção de `tipos_esperados`).

## Backend consumido (certificado, não alterado)
- `obter_documentos_competencia_v115` (paginação 25/25, `estado_documental`, `capacidades`)
- `criar_documento_competencia_v115`, `adicionar_versao_documento_competencia_v115` (idempotentes, retorno `id_documento/id_versao/numero_versao/id_arquivo`)
- `confirmar_upload_arquivo`, Edges `storage-sign-upload` / `storage-sign-download`

## Arquivos
Criados: `src/routes/competencias_.$id_.documentos.tsx`, `src/components/competencias/CompetenciaDocumentos.tsx`, `src/lib/competencias/competenciaDocumentosDados.ts`, `src/test/competenciaDocumentos.test.tsx`, este documento.
Alterados: `src/lib/contratos/documentosDados.ts` (extração de `enviarArquivoCertificado`, pipeline único), `src/components/contratos/DocumentosContrato.tsx` (passa a chamar a função extraída; comportamento idêntico), `src/components/competencias/CompetenciaVisaoGeral.tsx` (aba Documentos vira link; Análise/Parecer/Apresentação e ações seguem "Em breve"), `src/test/competenciaVisaoGeral.test.tsx` (hunk da aba), `src/routeTree.gen.ts` (automático).

## Decisões
- Estado documental, contadores, `atendido`, capacidades e motivo obrigatório: somente backend; nenhum recálculo.
- Tipo do documento: `tipos_esperados` não vazio é autoritativo (rótulo V1-10 ou o próprio valor); vazio → `TIPOS_DOCUMENTO` V1-10.
- Erros: 42501/401/403 → sem permissão; PT404 → não encontrada; 23505 → duplicada; PT409/40001 → conflito; P0001/PT400/outros → genérico. Nunca texto bruto.
- Chave idempotente por tentativa lógica; retry manual reutiliza chave e não reenvia bytes; trava contra duplo clique.
- Abrir: download assinado V1-10; quarentena/bloqueado/pendente desabilitam. Sem rota V1-11 (semântica diferente).
- Polling apenas em `processing`, backoff V1-10 (5s→60s), para em terminal/unmount.

## Evidências (TDD)
- RED: suíte V1-15 falhou por módulos ausentes; aba Documentos falhou antes do link.
- GREEN: V1-15 33/33; V1-14 32/32; regressão V1-15+V1-14+V1-13+V1-12+V1-11+V1-10 176/176; suíte serial 609/609 (25 arquivos), exit 0.
- Lint arquivos alterados/criados: 0 erros. Scan estático: sem `service_role`, `getPublicUrl`, `sb_secret`.
- Reuso comprovado: teste estático garante que os arquivos V1-15 importam `documentosDados` e não contêm `storage-sign-*`, TUS, `uploadToSignedUrl`, `MIMES_POR_EXTENSAO`, `CHUNK_TUS`, `crypto.subtle`.
- Browser: `/competencias/abc/documentos` em 1440/1280/768/390 claro/escuro: mensagem sanitizada, sem overflow, zero requisições ao Supabase. Estados autenticados verificados apenas por testes com fixture (sem sessão HML real).
- `types.ts` restaurado ao blob `8ea7750b75fd9d76b29c36ce7613392e3ab65e19`. Zero diff em `supabase/**`, package/lock, client, `components/ui`, `styles.css`, `public/brand`, AGENTS.
- Reverificação 03/11/2026 11:36 UTC: suíte serial 609/609; V1-15 33/33; lint 0; scan 0 ocorrências; build automático OK; Security Scan: 1 aviso informativo de Auth (senha vazada), fora do escopo. `tsc --noEmit` manual não executado (gate externo). Teste C pendente (turno read-only).

## Correção mínima pós-auditoria — 03/11/2026

Solicitação: A) parser fail-closed para os quatro números de resumo, três capacidades booleanas e quatro flags booleanas de cada requisito; B) reset de vínculo/tipo/tentativa lógica quando o requisito selecionado deixa a página recebida; C) spy direto do pipeline V1-10 e download, além do scan estático. Sem expansão funcional ou visual; backend HML congelado. Referência auditada: `aadada7d0f1f2514c1b6b8d8494268285d75d8b1`.

### RED real → GREEN
- RED às 11:49:54 UTC, antes de modificar produção: V1-15 **13 FAIL / 35 PASS**, exit 1. A: 11 testes por campo autoritativo e um teste de erro na tela falharam; B: teste de paginação falhou porque a mensagem/tentativa anterior permaneceu. Valores ausentes, null, strings e números no lugar de booleanos; números não finitos também rejeitados. C: spies pass-through já passaram sem mudar produção.
- GREEN A: os 12 testes de shape/erro passaram após validação estrita; zero/false válidos preservados sem recálculo.
- GREEN B: reset de `idReq`, `tipo` e `env.reiniciar` no efeito dependente da página/seleção. Callback de reset estabilizado apenas para dependência correta do efeito. Teste confirma que envio sem novo tipo não cria documento nem reenvia bytes; seleção nova usa novo vínculo e chave diferente. Na primeira execução GREEN, o teste tentou selecionar `nota_fiscal` no catálogo genérico que não possui esse valor; corrigida somente a entrada do teste para `contrato`, existente no catálogo V1-10, sem criar catálogo ou ampliar produção.
- GREEN final V1-15: **48/48**, exit 0. Spies diretos `vi.spyOn(documentosDados, "enviarArquivoCertificado")` e `vi.spyOn(documentosDados, "baixarDocumento")` observam chamadas reais com organização/contrato/arquivo corretos, confirmação e download assinado; restaurados após cada teste.
- Regressão V1-14/V1-13/V1-12/V1-11/V1-10: **143/143**, cinco arquivos, exit 0.
- Suíte completa serial `bunx vitest run --maxWorkers=1`: **624/624**, 25 arquivos, exit 0. Após ajuste de dependência do efeito sem mudança funcional, V1-15 novamente **48/48**.
- Lint dos três arquivos de código/teste: **0 erros / 0 avisos**. `git diff --check`: limpo. Verificação automática mais recente observada: **build OK**, 11:52:32 UTC. Build/typecheck manuais não executados por restrição do ambiente; gate externo se exigidos separadamente.
- Scan estático: **PASS**, nenhum TUS, `storage-sign-*`, MIME próprio, `uploadToSignedUrl`, `getPublicUrl`, `crypto.subtle`, `service_role` ou `sb_secret_` nos dois arquivos V1-15; teste estático permanece na suíte.
- Security Scan executado às 11:52:26 UTC: completo, **1 informativo** sobre proteção contra senhas vazadas, sem alteração de Auth (fora do escopo). Scanner `wiz` não executado por conector não configurado; demais scanners reportaram sucesso. Não declarar ausência absoluta de riscos.

### Diff e integridade
- Diff de código contra referência auditada: `src/components/competencias/CompetenciaDocumentos.tsx` **+12/-3**; `src/lib/competencias/competenciaDocumentosDados.ts` **+34/-12**; `src/test/competenciaDocumentos.test.tsx` **+140/-0**; este documento recebe somente esta seção de evidências.
- Diff integral de código SHA-256: `513b5cceb562408b5208fdecacb8ce9a839004627b52acd4eef9aeedb0eb3175` (patch de três arquivos contra referência auditada).
- Na entrada, HEAD `ca8662f53c99ce5d80b68bec852acf81d2074ed2` diferia da referência auditada somente por regeneração de `types.ts` (+235 linhas). Restaurado byte a byte pelo blob obrigatório **`8ea7750b75fd9d76b29c36ce7613392e3ab65e19`**; hash confirmado e diff zero contra referência auditada.
- Zero diff contra referência auditada em `supabase/**`, `package.json`, `bun.lock`, `client.ts`, `types.ts`, `public/brand/**`, `src/components/ui/**` e `src/styles.css`. Nenhum arquivo V1-10 de produção alterado nesta correção.
- As evidências funcionais desta correção são testes com fixtures/mocks, não upload real autenticado HML. Nenhum browser autenticado ou nova certificação visual nesta correção sem alteração visual. Nenhum Teste C executado; permanece reservado a outro turno read-only.
- SHA candidato final deve ser o HEAD imutável contendo esta seção e as correções, informado no fechamento após o versionamento automático; não é inventado dentro do próprio documento (evita autorreferência do hash).

## Delta final pré-Teste C — 03/11/2026

Base candidata: `da1d17aa7c0841fb3f299a096653e044cd74c134`. Escopo exclusivo: validação fail-closed de `tipos_esperados` e uso do Dialog existente para Nova versão. Nenhum backend, regra de negócio, catálogo, identidade visual, token ou shared UI alterado.

- **RED real antes de produção**, 11:57:06 UTC: V1-15 **12 FAIL / 50 PASS**, exit 1. Dez casos rejeitam tipos ausentes/null/não-array ou arrays com qualquer item não-string; dois casos exigem dialog nomeado, abertura por Nova versão, fechamento por Cancelar e Escape. Listas vazias e exclusivamente de strings continuam válidas e preservadas.
- **GREEN mínimo:** `parseReq` exige `Array.isArray(t)` e `every` string, preserva `t` sem `filter`/fallback. Nova versão usa apenas `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription` existentes; abertura controlada por `versaoDe`, Cancelar/Escape fecham. Campos, mensagens, motivo condicionado às capacidades, tentativa idempotente e pipeline V1-10 permanecem; testes anteriores passam sem alteração. Conteúdo rolável limitado à altura da janela.
- V1-15 focado: **62/62**, exit 0. Regressão V1-14/V1-13/V1-12/V1-11/V1-10: **143/143**, cinco arquivos, exit 0. Suíte completa serial: **638/638**, 25 arquivos, exit 0.
- Lint dos três arquivos alterados: **0 erros/avisos**, exit 0; `git diff --check`: limpo. Scan estático **PASS**: sem pipeline TUS/storage-sign-* ou MIME próprios, URL pública ou secrets nos arquivos V1-15; spies diretos e teste de não duplicação continuam passando.
- Security Scan, 11:59:47 UTC: completo, **1 informativo** de proteção contra senhas vazadas (Auth congelado, não alterado). `wiz` não executado por conector não configurado; demais scanners com sucesso.
- Diff de código contra base candidata: `src/components/competencias/CompetenciaDocumentos.tsx` **+32/-19**; `src/lib/competencias/competenciaDocumentosDados.ts` **+2/-1**; `src/test/competenciaDocumentos.test.tsx` **+49/-0**. Este documento recebe somente esta seção.
- Na entrada, HEAD `dae0168b20eb0f3cd9ffc97f0806a400ddc3b086` continha somente regeneração adicional de `types.ts` contra a base; restaurado ao blob **`8ea7750b75fd9d76b29c36ce7613392e3ab65e19`**, hash confirmado. **Zero diff contra base candidata** em `supabase/**`, package/lock, client/types, Brand, styles e shared UI.
- Testes de interação executados com React Testing Library e fixtures/mocks, incluindo Radix real (não mockado), Cancelar/Escape e uploads compartilhados simulados. Não houve upload real autenticado HML nem certificação browser/visual nesta rodada. Build/typecheck manuais não executados por restrição do ambiente; verificação automática consultada separadamente no fechamento.
- **Teste C não executado**, reservado a outro turno read-only; SHA final real é informado no fechamento após versionamento automático desta documentação.

## Correção do primeiro desvio do Teste C — gate UUID — 03/11/2026

Base auditada: `c08638d37b27496a37ab43dc3f964bf56c75c328`. Escopo exclusivo: impedir leitura com UUID inválido após uma competência válida; neutralizar autorização/dados anteriores; provar recuperação A → inválida → B e descarte de resposta tardia de A.

- **RED real antes de produção**, 12:04:03 UTC: **2 FAIL / 62 PASS**, exit 1. Primeiro teste monta UUID válido, registra contagens de Auth/preferência/RPC/functions, troca para `abc` e detecta uma RPC adicional (2 em vez de 1). Segundo teste confirma leitura indevida de `abc` na transição com leitura A pendente.
- **GREEN mínimo:** efeito de leitura exige explicitamente `idOk && autorizado`, com `idOk` nas dependências; gate inválido limpa `autorizado` e define estado não encontrado, antes de qualquer Auth/preferência/RPC. Ordem UUID → sessão → preferência → leitura preservada. Nenhuma alteração no parser, uploader, regras ou backend.
- Testes permanentes confirmam zero novas chamadas Auth/preferência/RPC/functions em UUID inválido, ausência de resumo/documentos antigos, nova autenticação e leitura de B; resposta tardia de A (mock que continua resolvendo mesmo após abort) não sobrescreve documento/estado de B.
- V1-15 **64/64**, regressão V1-14..V1-10 **143/143** (cinco arquivos), suíte completa serial **640/640** (25 arquivos), todos exit 0. Lint dos dois arquivos de código/teste: **0 erros/avisos**; static scan **PASS**, sem pipeline/constantes próprios ou secrets nos arquivos V1-15; `git diff --check` limpo.
- Security Scan 12:06:47 UTC: completo, um **Info preexistente** de proteção contra senhas vazadas, fora do escopo V1-15; Auth não alterado. `wiz` indisponível por conector não configurado; demais scanners com sucesso.
- Diff contra base auditada: `src/components/competencias/CompetenciaDocumentos.tsx` **+7/-3**, `src/test/competenciaDocumentos.test.tsx` **+64/-0**, este documento recebe somente esta seção. `types.ts` regenerado na entrada restaurado byte a byte ao blob **`8ea7750b75fd9d76b29c36ce7613392e3ab65e19`**; zero diff contra base auditada nos caminhos congelados.
- Evidências funcionais com fixtures/mocks e React Testing Library; nenhuma sessão/upload real HML ou certificação browser visual alegada. Build/typecheck manuais não executados por restrição do ambiente; verificação automática e SHA real consultados no fechamento. **Nenhum Teste C executado neste turno de correção**; nova auditoria somente em turno read-only.
