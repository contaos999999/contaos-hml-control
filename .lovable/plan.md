# PROMPT 20 / SYS-05 Dashboard — PLAN

## Rastreabilidade

- Prompt regular: PROMPT 20.
- Prompt atômico: nenhum aplicável em 001–096. O 096 / V5-12 (Painel Executivo) pertence ao PROMPT 88 e fica fora deste escopo.
- A LACUNA DE BACKEND anterior foi resolvida. Confirmado no HML, somente leitura: `public.obter_resumo_dashboard(p_id_organizacao uuid) returns jsonb`.
  - `SECURITY INVOKER`, `search_path=""`.
  - anon sem EXECUTE; authenticated com EXECUTE.
  - Sem sessão ou sem acesso à organização, levanta `42501`.
  - Retorna `schema_versao: "sys05-v1"`.

## 1. Arquivos exatos

| Arquivo | Operação |
|---|---|
| `src/routes/index.tsx` | Substituir o placeholder. `ssr: false` e `head()` próprio em PT-BR (title, description, og:title, og:description, og:type, twitter:card) |
| `src/components/dashboard/Dashboard.tsx` | Novo. Orquestra sessão, preferência, RPC e estados |
| `src/components/dashboard/dashboardFormatacao.ts` | Novo. Só formatação de apresentação: datas BR e rótulo de `tipo` |
| `src/integrations/supabase/types.ts` | Inserir **apenas** `obter_resumo_dashboard: { Args: { p_id_organizacao: string }; Returns: Json }` em `Functions`, ao lado de `obter_saude_operacional`. Nada mais regenerado |
| `src/test/dashboard.test.tsx` | Novo |
| `src/routeTree.gen.ts` | Não deve mudar, porque a rota `/` já existe |

Não serão tocados: `__root.tsx`, `router.tsx`, `client.ts`, middleware, SYS-01/02/03/04, `preferenciaOrganizacao.ts`, backend, Auth e `package.json`.

## 2. Operações Supabase

1. `supabase.auth.getUser()`, com o mesmo critério do SYS-04:
   - `AuthSessionMissingError` (ou `session_not_found`), ou nenhum erro com `user` nulo: vai para `/login`.
   - Outro erro, ou Promise rejeitada: estado de erro com retry, sem logout.
2. `obterPreferenciaOrganizacao(user.id)`. Se for `null`, vai para `/selecionar-organizacao` (com `replace`).
3. `supabase.rpc("obter_resumo_dashboard", { p_id_organizacao })`, via `useQuery`.
   - Chave: `["sys05", "resumo", user.id, idOrganizacao]`, `retry: false`.
   - Chamada uma única vez por montagem.
4. `supabase.auth.signOut()`, só no botão Sair.

Não há escrita, outra RPC, consulta a tabelas brutas nem uso de `obter_saude_operacional`.

## 3. Componentes (todos em `Dashboard.tsx`)

- **`DashboardShell`:** cabeçalho executivo próprio da página (sem mudar o layout global).
  - Marca ContaOS e nome fantasia (ou razão social) da organização.
  - Situação da organização, em texto exato.
  - "Atualizado em {gerado_em}", exibido literalmente porque já vem em padrão BR.
  - Ações: "Trocar organização", que é um `Link` para `/selecionar-organizacao`, e "Sair".
- **`ResumoKpis`:** 6 indicadores lidos literalmente de `resumo`.
  - Rótulos: Contratos visíveis, Contratos ativos, Competências em fluxo, Competências que exigem atenção, Itens com prazo vencido e Atenções abertas.
  - Formato `pt-BR` com `toLocaleString`.
  - Tooltip acessível com a definição de cada KPI (hover, foco e toque).
  - Sem soma, derivação ou cor decidida no React.
- **`DistribuicaoSituacao`:** usado duas vezes, para contratos e para competências.
  - Tabela simples com Situação e Quantidade, na ordem do backend.
  - Situação em texto exato do domínio.
- **`ProximosPrazos`:** lista na ordem do backend.
  - Campos: título, tipo, contrato (`contrato_numero`), prazo `dd/mm/aaaa`, status e criticidade em texto exato.
- **`AtencoesPrioritarias`:** lista na ordem do backend.
  - Campos: descrição, tipo, contrato, severidade e status em texto exato, prazo (se houver) e `criado_em` em `dd/mm/aaaa HH:mm` no horário de Brasília.
- Itens **sem link** para rotas futuras.
- **Formatação** (`dashboardFormatacao.ts`):
  - `formatarDataBr("YYYY-MM-DD")` monta a data por string, sem ajuste de fuso.
  - `formatarDataHoraBr(ISO)` usa `Intl` com `America/Sao_Paulo`.
  - Valor inválido ou nulo mostra "—".
  - `rotuloTipo` traduz o código para PT-BR: competência, tarefa de diligência, não conformidade, apontamento interno, apontamento do contratante. Um código desconhecido aparece como veio. Isso é apresentação, não reclassificação.

## 4. Estados

| Estado | Comportamento |
|---|---|
| verificando sessão | "Verificando sessão…" com `aria-live`, sem ações |
| sem sessão | vai para `/login` |
| sem preferência | vai para `/selecionar-organizacao` |
| loading RPC | skeleton contextual com "Carregando resumo…" |
| empty real | o retorno é válido, mas `resumo.contratos_visiveis === 0` e as listas vêm vazias. Ainda mostra organização, KPIs zerados e orientação neutra: "Ainda não há contratos ou itens visíveis para esta organização." Cada lista vazia mostra "Nenhum item no momento." Esta é só a regra de exibição: o React lê o número que o backend entregou e não recalcula nada |
| denied | 401, 403, `42501` ou `PGRST301`: "Acesso negado a esta organização.", com "Selecionar outra organização" e "Sair". Nunca aparece como empty |
| error | 500, rede ou `schema_versao` diferente de `sys05-v1`: mensagem genérica em PT-BR com "Tentar novamente" (refaz a sessão ou a RPC, conforme a origem). Sem texto técnico |
| success | todos os blocos |
| processing | Sair fica desabilitado durante o `signOut`, sem duplo envio |

## 5. Responsividade

- **1440 e 1280 px:** cabeçalho em uma linha. KPIs em grade de 3 colunas e 2 linhas. Distribuições lado a lado. Prazos e atenções em 2 colunas.
- **768 px:** KPIs em 2 colunas. Distribuições e listas em uma coluna.
- **390 px:** KPIs em 1 ou 2 colunas compactas. Ações do cabeçalho quebram de linha com áreas de toque de pelo menos 44 px. Listas empilhadas sem truncar prazo, status, severidade ou criticidade (quebra de linha). Sem rolagem horizontal; tabelas viram lista de pares.
- Visual "Executive Command Center": tokens existentes, densidade moderada, sem neon ou glassmorphism, sem excesso de cards.

## 6. Acessibilidade

- Um único `h1` ("Painel da organização"). Cada bloco é uma `section` com `aria-labelledby` e `h2`.
- KPIs em `dl`. Distribuições em tabela com `caption` e `th`.
- Status em texto, nunca só por cor.
- Foco visível em "Trocar organização", "Sair", "Tentar novamente" e nos gatilhos de tooltip, alcançáveis por Tab.
- `aria-live="polite"` para verificando e carregando; `role="alert"` para denied e error.

## 7. Testes

**`src/test/dashboard.test.tsx` (Vitest, com Supabase e router mockados):**
1. Sem preferência, vai para `/selecionar-organizacao`, e a RPC não é chamada.
2. `AuthSessionMissingError` vai para `/login`.
3. Erro técnico de `getUser` mostra erro e retry, sem navegar e sem `signOut`.
4. Preferência de outro usuário é ignorada e leva a `/selecionar-organizacao`.
5. A RPC é chamada **uma vez** com `{ p_id_organizacao: <preferência> }`.
6. O retorno oficial é exibido literalmente: KPIs propositalmente inconsistentes (ex.: `contratos_ativos` maior que `contratos_visiveis`) aparecem como vieram, provando que não há recálculo.
7. A ordem de prazos e atenções é preservada como veio.
8. Empty real mostra organização, zeros e orientação, e não aparece como denied.
9. 42501 e 403 mostram denied com as duas ações, sem o texto de empty e sem vazar a mensagem técnica.
10. 500 e rede mostram a mensagem genérica, e o retry chama a RPC de novo.
11. `schema_versao` inesperado vira erro genérico.
12. `prazo "2026-11-05"` aparece como `05/11/2026`, e `criado_em` ISO aparece como `dd/mm/aaaa HH:mm`.
13. "Trocar organização" aponta para `/selecionar-organizacao`; Sair chama `signOut` uma vez e vai para `/login`.

**Verificações gerais:**
- Regressão completa (SYS-01/02/03/04 e `app-routing`), typecheck e build.
- Varredura sem secret: nenhum `insert`, `update`, `delete` ou `upsert`, e nenhum `rpc` além de `obter_resumo_dashboard`.

**TESTE oficial C, em turno separado:**
- Rota real sem sessão vai para `/login`.
- Playwright com interceptação controlada do Auth e da RPC em 1440x900, 1280x720, 768x1024 e 390x844. Isso é evidência visual; a RLS real é a certificada no backend.
- Estados, teclado, console e rede (só a chave publishable).
- Security scan.
- `git status` igual antes e depois.

## Riscos e observações

- **Preferência inválida:** se apontar para uma organização sem acesso, a RPC devolve 42501 e a tela mostra denied com "Selecionar outra organização". A preferência não é apagada localmente; a autoridade é o backend.
- **SYS-01:** com um único vínculo, o login vai direto para `/` sem ter gravado preferência, então o SYS-05 redireciona para `/selecionar-organizacao` (um clique extra). Isso está conforme a regra recebida e não altera o SYS-01.
- **Cabeçalho do root:** o `__root.tsx` continua com o título genérico. O `index.tsx` passa a ter `head()` próprio.
