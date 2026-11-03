# PROMPT 33 / V1-12 — Competências do contrato — PLAN

Base: `d490ebe9f90d53b7d1f5e3f26d8ef31c7b22844e`. HML apenas; PROD intocado. Somente leitura (Data API + RLS). V1-13/V1-14 fora.

## Requisitos cobertos
- Rota `/contratos/:id/competencias`, listagem e status, permissão = acesso ao contrato (RLS `usuario_tem_acesso_contrato`).
- Componentes (locais ao arquivo da feature, não shared UI): `CompetenceTable`, `StatusBadge`, `PercentGauge`, `Pagination`, `FilterBar`.
- Estados loading / empty / error (403/404/rede sanitizados) / success.
- Ações "Nova competência" e "Abrir competência": staged, não navegáveis, `aria-disabled="true"`, selo "Em breve", nome acessível explícito (ex.: "Abrir competência 03/2026 — em breve"). Sem rota, sem RPC, sem link quebrado. Compatível com o literal V1-12 (affordance presente); conexão em V1-13/V1-14.
- Status exatamente como token do backend; percentual apenas exibido.

## Decisões
- Gate idêntico ao padrão: UUID → `getUser()` (sem sessão → `/login`) → preferência de organização (contexto, não autorização; ausente → selecionar organização) → `obterContrato(id, signal)` → só então consulta competências.
- `StatusBadge` renderiza o token bruto (`rascunho`, `pode_apresentar_contratante`, …) como texto visível, com ícone/borda neutros + texto; desconhecido aparece literal com mesmo tratamento. Nenhum mapa de tradução. Cores apenas tokens existentes e nunca como único sinal.
- `PercentGauge`: barra `role="meter"` com `aria-valuenow` = valor do backend e texto `NN,NN%` (pt-BR, 2 casas); `null` → "—". Sem cálculo, sem comparação com 100, sem habilitar nada.
- Filtros server-side: competência (`input type=month`, label explícito → `YYYY-MM-01`, `.eq`) e situação (select com os 14 tokens brutos do CHECK como opção e texto; `.eq`). Alterar filtro → página 1. "Limpar filtros".
- Navegação de seções própria com "Competências" ativo (`aria-current="page"`).

## Query (única por página, sem joins/N+1)
```text
supabase.from("competencias")
  .select("id,competencia_referencia,periodo_inicio,periodo_fim,data_limite,situacao,percentual_conformidade,versao_pacote_atual,atualizado_em", { count: "exact" })
  .eq("id_contrato", contrato.id)
  [.eq("competencia_referencia", "YYYY-MM-01")] [.eq("situacao", token)]
  .order("competencia_referencia", { ascending: false })
  .order("id", { ascending: false })
  .range((p-1)*25, p*25-1)
  .abortSignal(signal)
```
Formatação: competência `MM/AAAA` (parse de string, sem fuso), datas `DD/MM/AAAA` via `formatarDataBr`.

## Arquivos
Criar:
- `src/routes/contratos_.$id_.competencias.tsx` (head próprio, `ssr:false` como irmãs)
- `src/components/contratos/CompetenciasContrato.tsx`
- `src/lib/contratos/competenciasDados.ts` — `PAGINA_COMPETENCIAS=25`, `COLUNAS_COMPETENCIA`, `SITUACOES_COMPETENCIA` (14 tokens), `type Competencia`, `type FiltrosCompetencia`, `mesParaReferencia()`, `formatarCompetencia()`, `formatarPercentual()`, `listarCompetencias(idContrato, filtros, pagina, signal)`, `classificarErroCompetencia()`
- `src/test/competenciasContrato.test.tsx`
- `docs/frontend/lovable/PROMPT-33-V1-12-competencias.md`

Modificar (somente "Competências" de "Em breve" → `<Link to="/contratos/$id/competencias">`, demais itens e Brand intactos):
- `VisaoGeralContrato.tsx` (l.23/215), `BaseNormativaContrato.tsx` (l.43/205), `OrcamentoContrato.tsx` (l.100/395), `RegrasContrato.tsx` (l.547–555), `DocumentosContrato.tsx` (l.387–389). `DocumentoDetalhe.tsx` não tem o item: não muda.
- `src/routeTree.gen.ts` apenas regeneração automática.

### Ponto que exige sua decisão
Três testes antigos afirmam que "Competências" está desabilitado e vão falhar quando virar link: `baseNormativa.test.tsx:231`, `contratoDetalhe.test.tsx:419`, `documentosContrato.test.tsx:869–875`. Proposta: alterar só essas asserções para "Competências é link para /contratos/:id/competencias" (mesmo precedente de V1-10). Aprovar o plano = autorizar esses três hunks. Sem essa autorização o item não pode virar link e o plano fica NÃO APROVÁVEL.

## TDD
1. RED: criar `competenciasContrato.test.tsx` primeiro; falha por módulos ausentes; depois falhas específicas por recurso.
2. Gates: UUID inválido sem nenhuma consulta; sem sessão → login; sem organização → selecionar; contrato 403/404 mensagem sanitizada; zero chamada `from("competencias")` antes de contrato autorizado.
3. Query: select whitelist exato, `.eq id_contrato`, filtros `.eq`, range 0–24/25–49, count exact, duas ordens desc, abortSignal; uma chamada por página.
4. Status: os 14 tokens renderizados literalmente; token desconhecido literal; texto presente (não só cor).
5. Gauge: exibe `87,50%` de 87.5, `100,00%` sem habilitar nada; null → "—".
6. Estados loading/empty/error/success; filtro reseta página; paginação anterior/próxima com rótulos.
7. Ações staged: `aria-disabled`, "Em breve", nenhuma navegação, nenhuma `.insert/.update/.delete/.upsert/.rpc`.
8. Navegação: "Competências" ativo; testes irmãos ajustados como acima.
9. A11y: H1 único, labels associados.

## Validação (BUILD)
Focado V1-12 + V1-11 + V1-10, suíte completa, `npx tsc --noEmit`, build, ESLint alterados 0 e global ≤ baseline 8.962/9, scan estático (secrets, escrita, rpc, `any`), browser fixture 1440/1280/768/390 claro/escuro (390: tabela com rolagem horizontal contida, nada oculto), Security Scan nativo.

## Zero-Drift
`types.ts` byte a byte igual a `e10f797` (restaurar se regenerado, provar diff 0). package/lock, Brand, styles, shared UI, client.ts, supabase/** com diff zero. Diff esperado: 5 novos + 5 componentes (hunk de navegação) + 3 testes antigos (hunk de asserção) + routeTree gerado.

## Riscos
- Sem sessão HML real: RLS exercida só por fixture (limitação registrada).
- SHA final depende do commit automático; types.ts pode regenerar.
- Teste C em turno separado.

PLAN: APROVÁVEL (condicionado à autorização dos três hunks de teste antigos acima)
