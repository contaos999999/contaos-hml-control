# PROMPT 29 / V1-08 — Contrato — Orçamento

Ambiente: HML (`gklhhhyosgasnyoxlrui`). PROD proibido. Somente frontend.

## Rastreabilidade
- Regular: PROMPT 29 / V1-08.
- Atômicos: 001 V1-CON-001, 002 V1-CON-002, 003 V1-CON-003, 004 V1-CON-004, 005 V1-CON-005.
- Transversais: NFR-007 (concorrência otimista/PT409), idempotência, NFR-009 (paginação 25), RLS, auditoria (`correlation_id`), PT-BR/BRL, a11y, BRAND-01, Zero-Drift.
- Plano aprovado: `.lovable/plan/prompt-29-v1-08-contrato-orçamento-plan-2026-11-03.md`.

## Arquivos
- Novos: `src/routes/contratos_.$id_.orcamento.tsx`, `src/components/contratos/OrcamentoContrato.tsx`, `src/lib/contratos/orcamentoDados.ts`, `src/test/orcamento.test.tsx`, este documento.
- Alterados (mínimo): `VisaoGeralContrato.tsx` e `BaseNormativaContrato.tsx` (link "Orçamento"); `src/test/contratoDetalhe.test.tsx` e `src/test/baseNormativa.test.tsx` (asserções de navegação atualizadas para o novo link).
- Gerado automaticamente: `src/routeTree.gen.ts`.
- Intocados: `types.ts`, cliente/auth Supabase, `styles.css`, `package.json`, `AGENTS.md`, assets de marca, backend.

## Backend consumido (V108, sem alteração)
- Leituras RLS: `propostas_orcamentarias`, `versoes_proposta`, `linhas_orcamentarias`, `arquivos` (somente id, nome, mime, tamanho, status_seguranca, criado_em); colunas explícitas, `range(0,24)`, ordem estável.
- Gate: `obterContrato` (V1-06) com `classificar_acesso_contrato_v106` só após zero linhas.
- Escritas: `salvar_proposta_orcamentaria_v108`, `registrar_versao_proposta_v108`, `salvar_linha_orcamentaria_v108`, `remover_linha_orcamentaria_v108`, `publicar_versao_proposta_v108`, via fronteira tipada única `as unknown as`.
- Upload/download: pipeline V1-07 (`storage-sign-upload` → signed upload → `confirmar_upload_arquivo`; `storage-sign-download` por clique).

## Resultados do BUILD
- RED: módulo inexistente (falha esperada).
- GREEN: focado 22/22; suíte 406/406; `npx tsc --noEmit` exit 0; build exit 0.
- Browser 1440/1280/768/390 com sessão e dados simulados: sem overflow, H1 único "Orçamento", marca Mono Branco 131 px (≥sm) e símbolo 32 px (390), publicar bloqueado com documento pendente, sem path/token no DOM, Esc devolve foco ao gatilho, console sem erros.

## Limitações
- Supabase externo: o navegador de teste usa sessão/dados simulados; prova visual, não de RLS/RPC real.
- Upload retomável não suportado (interrompe com mensagem PT-BR).
- Teste C pendente (turno separado, read-only).

## Remediação controlada do BUILD — 03/11/2026

Base pré-Prompt29: `b6be5319e6381ca7c337dba66d891b6d7871514b`.
HEAD de entrada: `5c3ccd210e8c423deae15617f90ebb3057e9bacb`.
HEAD após código/testes, antes deste registro: `cf29b89c7856faab3e826c638a2bfd09b8dc4773`.

### Escopo e correções
- Somente os cinco arquivos autorizados nesta remediação: `types.ts`, `orcamentoDados.ts`, `OrcamentoContrato.tsx`, `orcamento.test.tsx` e este documento.
- `types.ts` restaurado byte a byte via `git show` da base certificada, sem regeneração deliberada; `cmp` exit 0 e `git diff b6be5319e6381ca7c337dba66d891b6d7871514b..HEAD -- src/integrations/supabase/types.ts` com 0 bytes após a restauração registrada automaticamente.
- Propostas: `criado_em DESC, id DESC`; versões: `numero_versao DESC, id DESC`. Rubricas mantêm todos os quatro critérios ASC.
- Gerenciador de chave mantém retries técnicos da intenção pendente, renova em mudança material e expõe `concluir()`. Sucesso e erros não técnicos encerram a chave anterior.
- PT409/conflito e PT404/obsoleto bloqueiam submissão no botão e na função de envio, inclusive submissão programática do formulário. Recarregar invalida a intenção, limpa/refaz consultas e fecha o diálogo; uma ação reaberta usa a revisão atualizada e chave nova. Não há reenvio automático.
- Os testes antigos `contratoDetalhe.test.tsx` e `baseNormativa.test.tsx` NÃO foram editados nesta remediação (diff contra HEAD de entrada: 0 bytes). Suas alterações anteriores são atualização de expectativa de navegação exigida pelo requisito aprovado: Orçamento deixa “Em breve” e passa a link ativo, sem remoção de cobertura, sem skip e sem enfraquecimento de assertions.

### RED / GREEN e validações frescas
- RED antes das correções de produção: 6 FAIL / 21 PASS em 27 testes; dois desempates incorretos, expectativa antiga de ordenação corrigida, dois bloqueios ausentes e `concluir()` inexistente. Evidência: `/tmp/v108-remediation-red.log`.
- GREEN focado final: 27/27; suíte completa final: 411/411 em 18 arquivos. Evidências: `/tmp/v108-remediation-final-focus.log`, `/tmp/v108-remediation-final-suite.log`.
- Compilação/verificação de tipos automáticas do ambiente: `build OK`, inclusive após GREEN em 00:48:20 UTC. Os comandos manuais `npx tsc --noEmit` e `npm run build` não foram executados: o ambiente proíbe duplicar essas verificações e as executa automaticamente. Não se atribui exit 0 a comandos não executados.
- Lint global executado: FAIL preexistente, 9.214 erros e 9 avisos. Comparativo dos arquivos de código contra HEAD de entrada: dados 31→31 e componente 217→216, todos `prettier/prettier`, sem erro novo de regra não visual. Teste autorizado formatado: 50→0, lint isolado exit 0. Não houve auto-fix fora do teste autorizado. Evidências: `/tmp/v108-lint/`, `/tmp/v108-remediation-final-lint.log`.
- Secret scan do diff/arquivos V1-08: 0 correspondências para chaves privadas, `sk-*`, `sb_secret_*` e atribuições literais de credenciais; teste estático também GREEN. Não equivale a prova absoluta de ausência de qualquer segredo.
- Security Scan em 00:46:39 UTC: completo, 0 Critical/High, 1 Info (proteção de senha vazada desativada), sem alteração de Auth; Wiz não executado por conector não configurado.
- Browser 1440/1280/768/390 com fixture existente: sem overflow horizontal, PT409 impede a segunda chamada mesmo com carga alterada e submissão programática; Recarregar fecha o diálogo sem RPC; reabertura envia revisão 2 com chave nova e sucesso lido na tela. Há exatamente uma resposta HTTP 409 simulada com mensagem de rede esperada no console por largura; nenhum erro JavaScript observado. Não declarar console totalmente sem erros no cenário negativo.
- Evidências temporárias: `/tmp/browser/v108-remediation/result.log` e capturas por largura (`*-page.png`, `*-conflict.png`, `*-success.png`). São fixture visual/fluxo, não prova de sessão real, RLS ou RPC real: sessão gerenciada indisponível (`external_unmanaged`).

### Zero-Drift e rastreabilidade
- Diff desta remediação contra HEAD de entrada restrito aos cinco arquivos permitidos; nenhum backend, migration, RLS, RPC, Edge Function, Auth, RBAC, styles, package, AGENTS, marca, route tree ou navegação alterado neste turno.
- Diff agregado contra a base inclui os arquivos de implementação/navegação/testes antigos e plano/route tree já existentes antes da remediação; não confundir esse histórico com novas alterações deste turno.
- Versionamento feito pelo fluxo automático do projeto, sem comandos Git de commit/push/checkout. A publicação/sincronização remota no GitHub não foi comprovada independentemente; o HEAD final deve ser conferido após o registro automático deste documento.
- FASE C oficial NÃO executada. BUILD corrigido; permanecem as limitações de lint global, execução manual de comandos proibida pelo ambiente, sessão real e confirmação remota descritas acima.
