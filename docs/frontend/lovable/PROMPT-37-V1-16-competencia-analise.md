# PROMPT 37 / V1-16 — Competência: Análise — BUILD

- Base operacional: `cdfbc59be69007b844391d63f32f28894b56d2b1` (árvore = V1-15 `87d5905d`).
- PLAN aprovado: `.lovable/plan/prompt-37-v1-16-competência-análise-plan-2026-11-03.md`.
- Backend HML congelado: nada em `supabase/**`. PROD intocado.
- `src/integrations/supabase/types.ts`: a plataforma o regenerou antes do BUILD. Foi restaurado ao blob `8ea7750b75fd9d76b29c36ce7613392e3ab65e19` antes do código de produção e conferido de novo ao final.

## Contrato lido antes do RED (pg_get_functiondef, somente leitura)
- `obter_analise_competencia_v116` devolve `schema_versao='v116-v1'` e `competencia`.
- O campo de estado é **`estado_analise`**, com `stale` booleano.
- `percentual` é sempre numérico, porque o backend aplica `coalesce(...,0)`.
- `blocking_summary` é a saída de `avaliar_portao_conformidade`, com `total`, `conformes_ou_na_validos`, `pendentes`, `nao_conformes`, `inconclusivos`, `em_analise`, `nao_conformidades_bloqueantes`, `percentual` e `liberado`.
- Também devolve `allowed_actions`, `mecanismos`, `resultados`, `execucoes` e `apontamentos`, cada lista com seu `*_paginacao`.
- **Observação de contrato:** sem execução, o backend devolve `mecanismos = {}`.
  - Nesse caso o parser aceita `{}` e o representa como `null` ("Sem execução registrada"), sem inventar zeros.
  - Com execução, ou com qualquer chave presente, as 4 contagens são obrigatórias (fail-closed).
  - Isso segue a resposta real do backend e não é LACUNA.
- Filtros: criticidade e busca afetam resultados **e** apontamentos; resultado e mecanismo afetam só resultados; status afeta só apontamentos.

## Arquivos
Criados:
- `src/routes/competencias_.$id_.analise.tsx`
- `src/components/competencias/CompetenciaAnalise.tsx`, com AnalysisHeader, AsyncJobStatus, PercentGauge, BlockingSummary, MecanismosResumo, FilterBar (inline em ≥1024 e Sheet existente abaixo disso), RequirementTable, ApontamentosBloco e HistoricoExecucoes.
- `src/lib/competencias/competenciaAnaliseDados.ts`
- `src/test/competenciaAnalise.test.tsx`
- este documento

Alterados:
- `CompetenciaVisaoGeral.tsx`: "Análise" virou link `/competencias/$id/analise`; Parecer e Apresentação continuam "Em breve".
- O hunk correspondente em `competenciaVisaoGeral.test.tsx`.
- `routeTree.gen.ts`: atualizado automaticamente.

## Decisões
- Uma RPC agregada por ciclo, via cast local tipada estreita, sem fetch/REST.
- Limites fixos: resultados 25, execuções 10, apontamentos 25.
- Gate: UUID inválido → zero Auth, preferência e RPC.
- A autorização, o estado, os filtros, os offsets, a busca e os avisos ficam vinculados ao `idC`. Assim, A→B começa limpo, e uma resposta tardia de A é abortada e ignorada.
- Erros:
  - 42501/401/403/PGRST301 → sem acesso.
  - PT404 → não encontrada.
  - PT400, transporte e demais → genérico.
  - O texto bruto nunca é exibido.
- `stale`, percentual, portão, `allowed_actions` e mecanismos só são exibidos. Não há comparação de hash, fórmula nem regra de liberação no client; o scan estático no teste comprova.
- Ações:
  - `completa` / `reanálise`, com trava por ref (duplo clique = 1 chamada) e refetch.
  - Erro ambíguo leva a uma leitura de reconciliação. Leitura com queued/processing ou nova `execucao_atual` = reconciliada; caso contrário, ou se a leitura falhar, mensagem sanitizada. Sem segunda escrita.
  - `solicitar_reanalise_requisitos` não é usado.
- Abrir requisito:
  - `allowed=true`: "Em breve" com `aria-disabled`, sem href nem handler (V1-17 fora do escopo).
  - `false`: "Indisponível".
- Polling só em queued/processing, com `atrasoPolling` importado da V1-10 (5s→60s). Para no estado terminal, no unmount e na troca de id.

## TDD
- **RED 1:** `bunx vitest run src/test/competenciaAnalise.test.tsx`, exit 1. Falhou no import, porque os módulos de produção não existiam.
- **GREEN 1:** 91/92. O único FAIL era um defeito do teste: a preferência de organização fica em `sessionStorage`, não em `localStorage`. Corrigi o teste e o resultado ficou em 92/92.
- **RED 2 (V1-14):** `bunx vitest run src/test/competenciaVisaoGeral.test.tsx`, exit 1, 1 FAIL. A aba Análise ainda não era link.
- **GREEN 2:** 32/32.
- **Correção de tipagem:** a verificação automática acusou erros. No componente, o estreitamento do estado foi corrigido com `estado.tipo !== "ok" ? null`; no teste, `meta[...]` passou a usar acesso por índice. Os testes não mudaram de comportamento.

## Verificação
- V1-16: 92/92.
- V1-14: 32/32.
- Suíte serial `--maxWorkers=1`: 26 arquivos e 737/737, exit 0. Inclui V1-15, V1-14, V1-13, V1-12, V1-11 e V1-10.
- eslint dos arquivos alterados: exit 0, depois de rodar o prettier nos arquivos novos.
- Static scan (service_role, sb_secret, getPublicUrl, dangerouslySetInnerHTML, fetch, REST, mutação direta, incremental): nenhuma ocorrência.
- Security Scan: 1 Info preexistente (Auth sem bloqueio de senhas vazadas), fora do escopo. Wiz não configurado.
- Navegador, UUID inválido real, 1440/1280/768/390 × claro/escuro:
  - Mensagem exibida, H1 único, `scrollWidth` igual à largura e 0 requisições ao Supabase.
  - O foco vai para "Voltar".
  - Estados autenticados foram cobertos só com mocks, sem sessão real em HML.
- `tsc --noEmit` e build manual: gate externo pendente. Vale a verificação automática do build.
- Caminhos protegidos (supabase, integrations, ui, styles, brand, package/lock, AGENTS, arquivos V1-15): zero diff contra `cdfbc59b`.
- Teste C: não executado; fica para um turno separado.
