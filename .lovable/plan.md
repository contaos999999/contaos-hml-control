# PROMPT 37 / V1-16 — Competência: Análise — PLAN

## Fatos confirmados antes deste PLAN
- HEAD `cdfbc59b`; `types.ts` blob `8ea7750b75fd9d76b29c36ce7613392e3ab65e19`.
- HML: `obter_analise_competencia_v116` (12 args exatos do contrato), `solicitar_analise_competencia(uuid,text)` e `solicitar_reanalise_requisitos(uuid,uuid[])` existem; authenticated EXECUTE true, anon false.
- `types.ts` contém `solicitar_analise_competencia`, mas não `obter_analise_competencia_v116`. Por isso a leitura usa uma fronteira local tipada.
- `atrasoPolling` (5s→60s) é exportado por `src/lib/contratos/documentosDados.ts:352` e será importado, sem copiar a constante.
- V1-14 (`CompetenciaVisaoGeral.tsx:415`): `ABAS_FUTURAS = ["Análise","Parecer","Apresentação"]`; Documentos já é link (`:432`).

## Arquivos
Criar:
- `src/routes/competencias_.$id_.analise.tsx`: URL `/competencias/$id/analise`, `ssr:false`, head PT-BR único (title, description, og:*, twitter:card).
- `src/components/competencias/CompetenciaAnalise.tsx`: tela, mais os subcomponentes internos `AnalysisHeader`, `PercentGauge`, `BlockingSummary`, `AsyncJobStatus`, `FilterBar`, `RequirementTable`, `MecanismosResumo`, `ApontamentosBloco` e `HistoricoExecucoes`. Arquivo único, para menor diff, no padrão da V1-15.
- `src/lib/competencias/competenciaAnaliseDados.ts`: adapter, parser e mapas de rótulo PT-BR.
- `src/test/competenciaAnalise.test.tsx`
- `docs/frontend/lovable/PROMPT-37-V1-16-competencia-analise.md`

Alterar após GREEN:
- `CompetenciaVisaoGeral.tsx`: tirar "Análise" de `ABAS_FUTURAS` e criar o link `/competencias/$id/analise`; Parecer e Apresentação continuam "Em breve".
- `competenciaVisaoGeral.test.tsx`: só o hunk correspondente.
- `routeTree.gen.ts`: atualizado automaticamente.

Zero toque em: supabase/**, client.ts, types.ts (salvo restauração ao blob), ui/**, styles.css, public/brand/**, package/lock, AGENTS, PROD e arquivos V1-15.

## Adapter (`competenciaAnaliseDados.ts`)
- `lerAnaliseV116(id, params, signal)`: chama `supabase.rpc("obter_analise_competencia_v116", {...})` por uma cast estreita `as unknown as RpcV116` (padrão V1-11/V1-15).
  - Envia sempre os 12 parâmetros.
  - Limites fixos: resultados 25, execuções 10, apontamentos 25.
  - Filtros vazios vão como `null`.
  - Uma chamada por ciclo, sem N+1 e sem fetch/REST manual.
- `solicitarAnalise(id, tipo: "completa" | "reanálise")`: chama a RPC tipada já existente e retorna o uuid. Não há chave de idempotência; a concorrência é decidida pelo backend.
- `parseAnaliseV116(raw)`: retorna `LeituraV116 | null`, fail-closed. Exige:
  - `schema_versao === "v116-v1"`.
  - `estado` ∈ {not_analyzed, queued, processing, failed, complete, stale}.
  - `stale` booleano.
  - `percentual` sempre numérico finito (0 é válido). Se vier ausente, `null` ou não numérico, o parser falha.
  - `allowed_actions` com 3 booleans.
  - Paginações (total/offset/limite numéricos) dos três conjuntos.
  - Arrays em resultados, execuções e apontamentos.
  - `mecanismos` com 4 contagens numéricas.
  - Para cada resultado: `mecanismo` dentro dos 4 valores exatos e `criticidade` válida.

  Qualquer campo ausente ou inválido faz a leitura inteira valer `null` e cai no erro genérico. 0 e false válidos são preservados. Campos opcionais de evidência e reprodutibilidade (versões do motor, regras e modelo, hash, horários, fonte, página, trecho, regra, ação, confiança, `erro_codigo`) são exibidos só se vierem como string ou número, e omitidos quando ausentes.
- `sanitizarErroV116`:
  - 42501/401/403 → `sem_permissao`.
  - PT404 → `nao_encontrada`.
  - PT400, transporte e demais → `erro` genérico PT-BR.
  - Nunca devolve o `message` bruto.
- Rótulos PT-BR:
  - Estados: Não analisada, Na fila, Processando, Falhou, Concluída, Desatualizada.
  - Criticidade: Crítica, Alta, Média, Baixa, Informativo.
  - Mecanismo: Determinístico, Semântico, Humano, Não identificado.
  - Valor desconhecido de rótulo → texto literal.

## Gate e navegação (padrão final V1-15)
1. `isUuid(id)` falso: zera tudo, mostra "não encontrada" e não chama getUser, preferência nem RPC.
2. Ordem: sessão → preferência de organização (só contexto) → leitura V1-16.
3. A autorização fica vinculada ao recurso (`idAutorizado === id`). O estado guarda `idRecurso` e só é renderizado quando `idRecurso === id`. Isso evita dados de A no primeiro render de B.
4. Troca A→B, no mesmo commit: reset de offsets, filtros, busca, polling e envio, com `AbortController` e um sinal de vivo. Uma resposta tardia de A é descartada.

## Filtros e paginação
- `FilterBar`: resultado, criticidade, mecanismo, status do apontamento e busca. Todos são parâmetros da RPC; não há filtro local.
  - `p_filtro_resultado` e `p_filtro_mecanismo`: zeram somente `p_resultados_offset`.
  - `p_filtro_criticidade`: zera `p_resultados_offset` e `p_apontamentos_offset`.
  - `p_busca` (aplicar ou limpar): zera `p_resultados_offset` e `p_apontamentos_offset`.
  - `p_filtro_apontamento_status`: zera somente `p_apontamentos_offset`.
  - O offset de execuções é independente.
- Busca aplicada por botão ou Enter, para evitar uma RPC por tecla.
- Os controles Anterior e Próxima usam total, offset e limite do backend.
- O refetch do mesmo recurso mantém filtros e offsets.

## Estados e UI
- `AnalysisHeader`: competência e situação, se o backend fornecer; `AsyncJobStatus`; execução atual; ações.
- `AsyncJobStatus`: os 6 estados, cada um com ícone e texto e `role="status"`/`aria-live="polite"`. Em failed, mostra `erro_codigo` só como código.
- `PercentGauge`: mostra `percentual` do backend formatado em pt-BR, com `role="meter"`. Não faz cálculo.
- `BlockingSummary`: lista itens e contagens de `blocking_summary` como vierem. Não decide liberação.
- `RequirementTable`: resultados da execução atual com requisito, código, descrição, resultado, criticidade, mecanismo, confiança, justificativa e evidência resumida. `nao_identificado` aparece como "Não identificado".
  - 1440/1280: tabela.
  - 768: filtros em painel recolhível (Sheet existente) e tabela com rolagem controlada.
  - 390: cards, sem ocultar informação crítica.
- `MecanismosResumo`: as 4 contagens do backend, incluindo zero.
- `ApontamentosBloco` e `HistoricoExecucoes`: paginados. O histórico mostra versões, hash e horários (DD/MM/AAAA HH:mm) quando fornecidos. Não mistura resultados antigos na tabela atual.
- Estados de loading, erro, sem permissão e não encontrada.
- Acessibilidade:
  - H1 único.
  - Labels em todos os filtros.
  - Foco visível.
  - Alvos de 44px.
  - Status nunca só por cor.
- Tooltips onde agregam (mecanismo, confiança, desatualizada).
- BRAND-01: só tokens e componentes existentes, sem hardcode de cor.

## Ações
- `executar_analise` / `reanalisar` falsos: nenhum botão executável, só um texto informativo de bloqueio.
- Verdadeiros: os botões chamam `solicitarAnalise(id, "completa")` ou `solicitarAnalise(id, "reanálise")`.
  - Uma trava local (ref) garante 1 chamada em duplo clique.
  - Ao receber o uuid, faz refetch e entra no polling se o estado for queued ou processing.
  - Se o backend devolver uma execução existente, a tela apenas reconcilia pelo refetch.
  - Erro ou timeout ambíguo na solicitação: antes de mostrar falha, faz uma leitura V1-16 de reconciliação.
    - Se a leitura mostrar queued/processing ou uma `execucao_atual` diferente da anterior, a solicitação conta como reconciliada (aviso informativo e polling).
    - Só quando a leitura confirma que não há nova execução, ou também falha, aparece a mensagem sanitizada.
    - Não há retry automático da RPC de escrita nem regra paralela de concorrência.
- `solicitar_reanalise_requisitos`: NÃO é chamado neste prompt.
- `abrir_requisito`:
  - true: controle "Abrir requisito · Em breve" com `aria-disabled`, sem href, onClick ou RPC, porque V1-17 está fora do escopo.
  - false: texto "Indisponível".
- Nenhuma ação depende de percentual, contagem ou estado derivado local.

## Polling
- Somente quando `estado` ∈ {queued, processing}, com `atrasoPolling(n)` importado da V1-10.
- Para em failed/complete/stale/not_analyzed, em erro, no unmount e na troca de id. A leitura em voo é abortada.

## TDD (BUILD futuro)
- RED primeiro, registrando comando, falhas e exit code. Depois GREEN mínimo. Cada correção posterior ganha um RED próprio.
- Casos, com mocks de `supabase.auth`, `rpc` e preferência:
  1. UUID inválido: zero getUser, preferência e RPC. Também válido → `abc`.
  2. Ordem do gate; 42501/401/403, PT404, PT400 e transporte sanitizados; o texto bruto do banco não aparece.
  3. Parser fail-closed campo a campo, incluindo `percentual` ausente/null/não numérico; fixtures com 0/false válidos são preservadas.
  4. Os 6 estados, incluindo fixture incoerente (ex.: `complete` com percentual 0 e bloqueios) renderizada literalmente.
  5. `stale` só do backend; teste com hashes divergentes e `stale=false` mostra o estado do backend.
  6. Percentual e bloqueio só do backend.
  7. Os 3 offsets são independentes; parâmetros enviados à RPC conferidos. Resultado e mecanismo zeram só resultados; criticidade e busca zeram resultados e apontamentos; status de apontamento zera só apontamentos; execuções nunca são zeradas por filtro.
  8. A→B: offsets 0, filtros limpos, nenhum DOM de A, A tardia descartada; também A→inválido→B.
  9. Os 4 mecanismos; `nao_identificado` nunca vira determinístico.
  10. Evidência, criticidade, apontamentos e histórico, com campos ausentes omitidos.
  11. `allowed_actions` false → sem botão; true → botão.
  12. `completa` / `reanálise`; duplo clique = 1 chamada; retorno de execução existente reconciliado; a RPC incremental nunca é chamada. Erro/timeout ambíguo: uma leitura de reconciliação. Leitura com queued/processing ou nova execução = reconciliada, sem erro. Leitura sem nova execução, ou com falha = mensagem sanitizada. Nenhuma segunda chamada de escrita.
  13. Polling: backoff 5s→60s com fake timers; para no estado terminal, no unmount e na troca de id.
  14. Abrir requisito em breve: sem href e sem handler; false → bloqueado.
  15. V1-14: Análise vira link; Parecer e Apresentação continuam staged.
  16. Scan estático no próprio teste: arquivos V1-16 sem comparação de hash, sem derivação de stale, sem fórmula de percentual, sem fetch/REST, getPublicUrl, dangerouslySetInnerHTML, `.from(` de escrita, service_role ou `solicitar_reanalise_requisitos`.

## Verificação
- V1-16 focado.
- Regressão V1-15 a V1-10.
- Suíte serial com `--maxWorkers=1`.
- eslint dos arquivos alterados.
- Static scan.
- Security Scan, com o Info preexistente reportado separadamente.
- Navegador em 1440/1280/768/390, claro e escuro. UUID inválido de verdade; estados autenticados por intercept/mocks, declarados como tais.
- `tsc` e build manual: gate externo se o ambiente bloquear.
- Diff final completo, zero alteração nos caminhos protegidos e `types.ts` restaurado ao blob antes do commit.
- Teste C em turno separado.

## Limites
- V1-17 (detalhe do requisito e reanálise incremental) e V1-18/V1-19 não são antecipados.
- Se o shape real da RPC divergir deste contrato na leitura de definição pré-RED, PARE e reporte LACUNA, sem ajustar o backend.
