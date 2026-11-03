# PROMPT 38 / V1-17 — Detalhe do requisito (drawer na Análise)

Base: `main` `d7a418bbd96f065c839191ae03b2f2b818d649b8` (conferido como HEAD). `types.ts` conferido no blob `8ea7750b75fd9d76b29c36ce7613392e3ab65e19`. Backend HML congelado; PROD intocado. BUILD só após o último CI verde do backend (teste concorrente em execução) e aprovação deste plano.

## Verificado antes do plano
- HML expõe `public.obter_detalhe_requisito_v117(p_id_competencia uuid, p_id_requisito uuid, p_evidencias_offset int, p_evidencias_limite int, p_historico_offset int, p_historico_limite int, p_apontamentos_offset int, p_apontamentos_limite int)` e `public.solicitar_reanalise_requisitos(p_id_competencia uuid, p_requisitos uuid[])` — assinaturas idênticas ao contrato informado.
- `CompetenciaAnalise.tsx:748` `RequirementTable`; `:816` usa `l.allowed_actions.abrir_requisito` e hoje mostra "Em breve" (staged V1-16).
- `documentosDados.ts:793` exporta `baixarDocumento(idArquivo)`; rótulo `aprovado` existe no mapa de `status_seguranca` (`:150`).

## Escopo (arquivos exatos)
Criar:
- `src/lib/competencias/requisitoDetalheDados.ts` — adapter RPC estreito, tipos, parser fail-closed, sanitização de erros, `solicitarReanaliseRequisito`.
- `src/components/competencias/RequirementDrawer.tsx` — drawer (Sheet existente) + subcomponentes locais `SourceReference`, `EvidenceList`, `ResultBadge`, `AuditTimeline` (no mesmo arquivo ou em `src/components/competencias/requisito/*`, específicos desta tela).
- `src/test/requisitoDetalhe.test.tsx`.
- `docs/frontend/lovable/PROMPT-38-V1-17-detalhe-requisito.md`.
Alterar (hunk mínimo, só após GREEN do drawer):
- `CompetenciaAnalise.tsx`: trocar "Em breve" por botão "Abrir requisito" que abre o drawer com `r.id_requisito` quando `allowed_actions.abrir_requisito === true`; repassar callback de recarga V1-16 existente.
- `competenciaAnalise.test.tsx`: atualizar asserção staged → botão + drawer.
Proibidos: rota nova, `routeTree.gen.ts`, `supabase/**`, `client.ts`, `types.ts` (salvo restauração byte a byte ao blob), UI compartilhada, `styles.css`, `public/brand/**`, package/lock, AGENTS, V1-15, PROD.

## Adapter e parser fail-closed
- Leitura: `supabase.rpc("obter_detalhe_requisito_v117", {...})` com offsets independentes e limites fixos 25; `AbortSignal`.
- Rejeita (estado "erro de contrato", sem dados parciais): `schema_versao !== "v117-v1"`; `competencia.id`/`requisito.id` não-UUID ou diferentes dos IDs solicitados; arrays ausentes; paginação sem `offset/limite/total` inteiros ≥0; `allowed_actions` sem os três booleans; `na_validade` não-null quando resultado ≠ `nao_aplicavel`, ou sem `valido` boolean quando N/A (`false` é válido como valor e significa "N/A inválido").
- `execucao_atual`, `resultado_atual`, `resultado_referencia`, `documento` aceitam `null` explicitamente; nenhum valor é derivado.
- `resultado_atual` vazio em reanálise parcial NÃO vira "sem resultado": o estado exibido usa `resultado_referencia` e mostra separadamente a última execução global.
- Erros mapeados em PT-BR sem mensagem bruta: 42501/401/403 → sem permissão; PT404 → não encontrado; PT400 → solicitação inválida; PT409 → "já existe análise ativa com escopo diferente"; demais → genérico com "Tentar novamente".

## Estados da UI (todos vindos do backend)
loading · erro/403/404 · sem resultado (`resultado_referencia === null`) · conforme · não conforme · inconclusivo · não aplicável válido (`na_validade.valido === true`) · não aplicável inválido (`valido === false`, com indicadores `possui_fundamento`/`possui_evidencia` exibidos como dados). `ResultBadge` só traduz o literal do backend em texto + ícone (não só cor); fallback literal para valor desconhecido.

## Conteúdo do drawer
1. Requisito: código, descrição, categoria, obrigatório/aplicável/impeditivo, criticidade, efeito no portão (texto do backend), regra de validação e condição de aplicabilidade.
2. `SourceReference`: fonte tipo/referência/detalhe, origem tipo/id/versão, `hash_snapshot`.
3. Resultado de referência: resultado, mecanismo, confiança, justificativa, fundamento, `hash_evidencias`, data; bloco separado "Última execução global" (`execucao_atual`, tipo/status/motor/modelo/versões/horários). Separação visual entre dado objetivo, saída de IA e decisão.
4. `EvidenceList` (paginada): página, trecho, tipo, referência externa, hash, data, documento (nome, versão, hash versão, status). Ações: "Ver trecho" (expande texto); "Baixar" só se `documento.id_arquivo` presente e `status_seguranca === "aprovado"`, chamando `baixarDocumento(documento.id_arquivo)` — nunca `id_versao_documento`, nunca URL pública. Edge é autoridade final; erro mostrado sanitizado.
5. Apontamentos (paginados): descrição, severidade, status, origem, regra violada, ação sugerida, fonte, datas.
6. `AuditTimeline` (paginada): cada resultado com execução, motor/provedor/modelo/prompt, hash entrada, horários.
Datas em `America/Sao_Paulo` `DD/MM/AAAA HH:mm` com helper existente.

## Reanálise deste requisito
- Botão visível/habilitado somente com `allowed_actions.reanalisar === true` (sem inferência local).
- `solicitar_reanalise_requisitos(idCompetencia, [idRequisito])`; ref síncrona impede segunda chamada (duplo clique = 1 RPC).
- UUID retornado aceito como execução (nova ou pendente idempotente).
- Timeout/erro ambíguo: nenhuma segunda escrita; uma única leitura de reconciliação do detalhe; mensagem conforme o que o backend mostrar.
- Sucesso: recarrega o drawer e chama a recarga da visão V1-16 existente (que já aplica o polling `atrasoPolling`).
- `solicitar_analise_competencia` não é usado no drawer.

## Gates e concorrência
- UUID inválido (competência ou requisito) → bloqueia antes de `getUser`/RPC.
- Ordem: UUID → `getUser` → preferência de organização só como contexto → RPC.
- Estado, offsets e autorização chaveados por `idCompetencia:idRequisito`; troca A→B (competência ou requisito) limpa tudo, aborta a leitura anterior e descarta respostas/escritas tardias; `enviando` só é limpo se a chave ainda for a mesma.

## Acessibilidade e marca
Sheet (Radix) com `aria-labelledby`, foco inicial no título, foco devolvido ao botão de origem, Esc fecha, tabulação presa; título do drawer é `h2` (página mantém `h1` único); `aria-live="polite"` para carregando/resultado da reanálise; tooltips existentes em termos técnicos (hash, mecanismo, confiança) com hover/foco/toque. Tokens e marca existentes; validar 1440/1280/768/390 claro/escuro (drawer em tela cheia a 390).

## TDD
RED antes de produção em `requisitoDetalhe.test.tsx`: cada estado de resultado; N/A válido e inválido; `resultado_atual` vazio com referência presente; duas execuções com referências distintas; documento ausente, não aprovado, aprovado (spy em `baixarDocumento` com `id_arquivo`, nunca `id_versao_documento`); 3 paginações independentes; parser fail-closed (schema, IDs, arrays, paginação, allowed_actions, na_validade); `reanalisar=false`; PT409; duplo clique; timeout ambíguo (1 escrita + 1 leitura); troca A/B; UUID inválido sem getUser/RPC; erros sanitizados; foco/Esc. GREEN mínimo, depois hunk do V1-16.
Após GREEN: focused V1-17, V1-16 (126/126 referência + ajustes), regressão V1-15..V1-10, suíte serial `--maxWorkers=1` (739 + novos), eslint, static scan (sem `getPublicUrl`, `createSignedUrl`, `service_role`, cálculo de portão/percentual/stale, `solicitar_analise_competencia` no drawer), Security Scan, browser, build automático; diff final com zero caminhos protegidos e `types.ts` no blob. Teste C read-only em turno separado.

## Desvios/observações de contrato
- `allowed_actions.abrir_requisito` é global na leitura V1-16 (não por linha); o botão aparece em todas as linhas quando `true`, sem inferência por requisito.
- O critério "status aprovado" do download é usado apenas como pré-condição de exibição do botão, assumindo o literal `aprovado` do mapa V1-10; o Edge continua decidindo.
- BUILD condicionado ao CI verde do teste concorrente, ainda não confirmado por mim.
