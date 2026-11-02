# PROMPT 25 / V1-04 — Contratos (`/contratos`) — Plano mínimo frontend

## Escopo (Zero-Drift)
- Criar `src/lib/contratos/contratosDados.ts`
- Criar `src/components/contratos/ListaContratos.tsx`
- Criar `src/routes/contratos.tsx` (`createFileRoute("/contratos")`, `ssr: false`, head próprio "Contratos — ContaOS", noindex)
- `src/routeTree.gen.ts` somente auto-gerado
- Criar `src/test/contratos.test.tsx`
- Não tocar: SYS-04 (preferência/OrganizationSelector/selecionar-organizacao), V1-01/02/03, ADM, shared UI, client Supabase, `types.ts`, package.json, backend/Supabase/PROD.

## Backend consumido (sem lacuna)
`public.contratos` com RLS ativa e `contratos_select` via `privado.usuario_tem_acesso_contrato(id)`, já auditado (escopo restrito/total/outra org PASS). Leitura simples paginada = Data API com RLS (regra 4). Sem tabela, RPC, Edge, policy ou migration.

## Fluxo de dados
1. Sessão: `supabase.auth.getUser()`; ausente → `/login`; erro técnico → retry sem logout.
2. Preferência: `obterPreferenciaOrganizacao(idUsuario)`; ausente → `/selecionar-organizacao`.
3. Q1 gate de contexto (padrão V1-01, não autoritativo): `organizacoes.select('id').eq('id', org).maybeSingle()`; null/401/403/42501/PGRST301 → denied; demais → erro. Q2 só após Q1 positivo.
4. Q2: `contratos.select('id,id_organizacao,numero,objeto,situacao,criticidade,inicio,fim,valor_global', {count:'exact'}).eq('id_organizacao', org).order('numero',{ascending:true}).order('id',{ascending:true}).range((p-1)*25, p*25-1).abortSignal(signal)`. Sem joins, sem query por linha.
5. Classificação de erro Q2: 401/403/42501/PGRST301 → denied; outros → erro técnico PT-BR genérico (nunca code/details/hint).

## Multi-organização
- Query key: `["contratos", idUsuario, idOrganizacao, pagina]`; sem `placeholderData`/`keepPreviousData`.
- Página é estado local resetado para 1 quando `idOrganizacao` muda (key de componente = `idUsuario:idOrganizacao`), garantindo loading explícito e zero linhas da org anterior.
- `signal` do TanStack Query repassado ao `abortSignal`; resposta tardia de A fica presa à key de A e nunca é renderizada em B.
- Troca de organização continua pelo fluxo SYS-04 existente (`queryClient.clear()`); a tela só oferece link "Selecionar organização".

## UI / estados
- Um H1 "Contratos"; contexto da organização ativa; link "Selecionar organização".
- Estados distintos: loading (`role=status`), empty ("Nenhum contrato autorizado nesta organização."), denied ("Você não tem acesso…"), erro técnico com "Tentar novamente", success.
- ≥768: tabela com `caption`/`th scope` — Número, Objeto, Situação, Criticidade, Vigência (`DD/MM/AAAA – DD/MM/AAAA`, "—" se nulo), Valor global (BRL `Intl` pt-BR). <768: cards com os mesmos campos.
- Situação/criticidade exibidas literalmente do dado oficial (rótulo textual, não só cor), sem cálculo.
- Paginação "Anterior/Próxima" ≥44px, "Página X de Y", total; desabilitadas nos limites.
- Tooltip acessível apenas em "Criticidade" (hover+foco, toque) se agregar compreensão; nenhum link para detalhe/criação (V1-05/06 fora).

## TDD (BUILD posterior)
RED primeiro (módulos ausentes), depois GREEN:
1. Data API: colunas exatas, eq org, ordens numero+id, range 0..24 / 25..49, count, abort; classificação denied vs erro.
2. Sessão ausente → /login; erro sessão → retry; sem preferência → /selecionar-organizacao; Q1 negativo → denied e zero Q2.
3. A → B → A: dados de A somem, loading, página volta a 1, nova query por org, simétrico.
4. Resposta tardia de A (promise adiada) não sobrescreve B.
5. RLS vazio (0 linhas) = empty; 403/42501 = denied; nunca confundidos.
6. A11y: um H1, labels, status `role=status`/`alert`, teclado na paginação, alvos ≥44px; responsividade 1440/1280/768/390 via browser controlado sem overflow.
7. Scan do novo domínio: zero `.insert/.update/.delete/.upsert/.rpc/functions.invoke`.

## Teste C separado (sem auto-fix)
Suíte completa, `tsgo --noEmit`, build, scan de secrets, Playwright 4 viewports, HEAD/git status inicial e final.

## Lacunas
Nenhuma de backend. Observação herdada fora de escopo: `<html lang="en">` global (não será alterado).
