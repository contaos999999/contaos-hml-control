# PROMPT 22 / V1-01 — Contratantes (somente leitura)

## 1. Auditoria do código atual
- **O que ainda não existe:**
  - Rota `/contratantes`, componente, camada de acesso e teste de contratantes.
  - As rotas `/contratantes/novo` e `/contratantes/$id/editar` não estão na árvore de rotas. Por isso, **nenhum botão Novo ou Editar** será criado: um link sem rota seria enganoso e não compila na árvore tipada. Os botões ficam para V1-02/V1-03.
- **O que já existe e será reaproveitado:**
  - `src/integrations/supabase/types.ts` já tipa `contratantes` e `organizacoes`. Não muda.
  - O padrão SYS-05 (`Dashboard.tsx`): `supabase.auth.getUser()`.
    - Usuário null sem erro vai para `/login`.
    - Erro técnico mostra erro com "Tentar novamente", sem deslogar.
  - Sem preferência de organização (`obterPreferenciaOrganizacao(user.id)`), vai para `/selecionar-organizacao`.
  - A classificação de acesso negado usa `status` 401/403 do topo da resposta e `code` 42501/PGRST301, com React Query (`useQuery`).
  - O padrão ADM-01 (`administracao.usuarios.tsx`): `ssr:false`, `head()` PT-BR com `noindex`, workspace denso, retorno de foco e alvos de 44 px.
- **Backend HML (leitura de `pg_policies`):**
  - `contratantes_select` usa `privado.usuario_tem_acesso_organizacao(id_organizacao)`.
  - `organizacoes_select` usa a mesma função, `privado.usuario_tem_acesso_organizacao(id)`.
  - A função exige sessão ativa e vínculo ativo e vigente.
- **Conflito ou lacuna:** nenhuma LACUNA DE BACKEND (ver item 4).
- **Fora de escopo, só registro:** o `<html lang>` global está "en", definido no root. Não será alterado neste prompt.

## 2. Arquivos
**Criar:**
- `src/routes/contratantes.tsx`: rota com `ssr:false` e `head` único PT-BR (title, description, og:*, twitter:card, noindex).
- `src/components/contratantes/ListaContratantes.tsx`: tela.
- `src/lib/contratantes/contratantesDados.ts`: acesso à Data API, tipos, sanitização da busca e formatação pura.
- `src/test/contratantes.test.tsx`: TDD.

**Modificar:** só `src/routeTree.gen.ts`, por regeneração automática.

**Não tocar:**
- `__root.tsx`, `router.tsx`, `start.ts` e o layout global.
- Os arquivos de `src/integrations/supabase/*`.
- SYS-01–05 (login, esqueci, redefinir, selecionar organização, dashboard) e ADM-01 (`administracao/*`).
- `src/components/ui/*`, `package.json`, `supabase/*` e migrations.

## 3. Queries da Data API (exatas)
**Q1 — verificação de acesso** (mesmo predicado RLS da tabela):
```text
supabase.from("organizacoes").select("id").eq("id", idOrganizacao).maybeSingle()
```

**Q2 — listagem**, executada só se Q1 retornar a linha:
```text
TAMANHO_PAGINA = 25 ; from=(pagina-1)*25 ; to=from+24
supabase.from("contratantes")
  .select("id,razao_social,nome_fantasia,documento,tipo_pessoa,situacao,atualizado_em", { count: "exact" })
  .eq("id_organizacao", idOrganizacao)
  [.eq("situacao", "ativo"|"inativo")           se filtro != todos]
  [.or(`razao_social.ilike.${p},nome_fantasia.ilike.${p},documento.ilike.${p}`)   se busca]
  .order("razao_social", { ascending: true })
  .order("id", { ascending: true })
  .range(from, to)
```
- Sem `select('*')`, sem `contato` (dado pessoal não necessário) e sem `versao_registro` (uso só em V1-03).
- **Busca segura no `.or()`:** o valor passa por `montarPadraoBusca(texto)`.
  1. Faz trim e limita a 100 caracteres.
  2. Escapa `\`, `%` e `_` (curingas do LIKE).
  3. Monta `*texto*` (curinga do PostgREST).
  4. Envolve em aspas duplas, escapando `"` e `\`.
  - Assim, vírgula, parênteses e pontos do usuário não quebram nem injetam filtros na sintaxe do `or`.
  - Testes explícitos para `a,b`, `x)`, `razao_social.eq.1`, `%_`, `"`.
- **Documento:** a busca usa o texto como foi digitado. Não há normalização local de CNPJ/CPF além de ser texto.

## 4. Como separar acesso negado de vazio (backend existente)
Q1 consulta `organizacoes`, cuja policy SELECT usa **a mesma função** `usuario_tem_acesso_organizacao` que a de `contratantes`.
- **Q1 com 1 linha:** o usuário tem acesso. Se Q2 vier com `count=0`, é **vazio legítimo**.
- **Q1 com 0 linhas sem erro:** **acesso negado**. Q2 nem é executada.
- **Q1 ou Q2 com erro:** `status` 401/403 ou `code` 42501/PGRST301 é **acesso negado**; qualquer outro erro, falha de rede, `data` inválido ou `count` nulo é **erro técnico**.
- O backend decide; a tela só lê o resultado. Sem RPC nova, Edge, `auth.users` ou cálculo local de permissão.
- Sem RPC de autorização também. `validar_administrador_organizacao` é de admin e não serve para leitores.

## 5. Paginação e query keys
- Página fixa de 25 (≤100), paginação real com `.range` e `count:"exact"`. Botões "Anterior" e "Próxima", texto "Página X de Y" e total de registros. Sem rolagem infinita.
- Busca (debounce de 300 ms) e filtro voltam à página 1; trocar de página mantém busca e filtro.
- Página além do fim (o total encolheu): volta para a última página válida e refaz a consulta, nunca mostra vazio falso.
- **Chaves:**
  - Acesso: `["contratantes","acesso", userId, orgId]`.
  - Lista: `["contratantes","lista", userId, orgId, situacao, busca, pagina]`.
  - Com usuário e organização na chave, a troca de organização não reaproveita dados da anterior.
  - `placeholderData` só mantém a página anterior **da mesma organização e filtros**.
- "Sair" usa o fluxo existente: `queryClient.clear()`, `signOut` e `/login` com `replace`.

## 6. Componentes, estados, responsividade e acessibilidade
- **Cabeçalho:** h1 "Contratantes", descrição curta e o nome da organização (do Q1? não: só `id` é lido; o nome não é exibido para não ampliar a consulta). Links "Painel" e "Selecionar organização", e botão "Sair".
- **Filtros:** seção com h2 "Filtros".
  - Campo "Buscar por razão social, nome fantasia ou documento".
  - Select nativo "Situação" com Todos, Ativos e Inativos.
  - Botão "Limpar filtros".
- **Lista:** seção com h2 "Contratantes cadastrados", com "N contratante(s)" numa região `aria-live="polite"`.
- **Estados:**

| Estado | O que aparece |
|---|---|
| Verificando sessão | `role=status` "Verificando sessão…" |
| Carregando | skeleton e `role=status` "Carregando contratantes…" |
| Vazio sem filtro | "Nenhum contratante cadastrado nesta organização." |
| Vazio com filtro | "Nenhum contratante encontrado para os filtros aplicados." e "Limpar filtros" |
| Acesso negado | `role=alert` "Você não tem acesso aos contratantes desta organização." e link "Selecionar outra organização" |
| Erro | `role=alert` "Não foi possível carregar os contratantes agora. Tente novamente em instantes." e "Tentar novamente" |
| Sucesso | tabela ou cards e paginação |

- **Campos exibidos:**
  - **Razão social**.
  - **Nome fantasia:** "—" se vazio.
  - **Documento:**
    - 14 dígitos: máscara CNPJ, só exibição.
    - 11 dígitos: máscara CPF.
    - Outros formatos: texto original.
    - Vazio: "Não informado".
  - **Tipo:** Pessoa jurídica, Pessoa física, Órgão público, Outro. Valor desconhecido aparece literal.
  - **Situação:** badge com texto e ícone, Ativo/Inativo. Valor desconhecido aparece literal.
  - **Atualizado em:** `DD/MM/AAAA HH:mm`, America/Sao_Paulo.
- **Tooltip:** só em "Situação", explicando que reflete o cadastro oficial (hover, foco e toque).
- **Responsividade:**
  - 1440/1280: tabela com 6 colunas.
  - 768: tabela; Nome fantasia e Atualizado em quebram linha.
  - 390: lista de cards (`<ul>` com `<dl>`) com razão social, documento, situação e tipo. Filtros empilhados, paginação com 44 px.
  - `break-words` e nenhuma rolagem horizontal.
- **Acessibilidade:**
  - Um h1 e h2 por seção, labels reais.
  - Tabela com `<caption class="sr-only">` e `scope="col"`.
  - Foco visível, ordem de Tab lógica, Enter e Espaço nos botões, alvos ≥44 px.
  - Paginação em `<nav aria-label="Paginação">`.

## 7. TDD (RED antes da produção, depois GREEN mínimo)
Testes em `src/test/contratantes.test.tsx`, com mock do cliente que registra chamadas:
1. A rota renderiza o h1, e o `head` tem título único.
2. `getUser` null leva a `/login`; erro técnico do `getUser` mostra retry sem redirecionar.
3. Sem preferência leva a `/selecionar-organizacao`.
4. Q1 retorna a linha e Q2 vem `[]` com count 0: aparece vazio legítimo.
5. Acesso negado, nunca vazio: Q1 retorna null sem erro, e Q2 **não** é chamada. O mesmo para Q1 ou Q2 com 403 sem code, 401, 42501 e PGRST301.
6. Q2 exata: tabela, colunas do `select`, `count:"exact"`, `eq id_organizacao`, duas `order` e `range(0,24)`.
7. Busca e filtro mandam `.or` com o padrão sanitizado ou `eq situacao` e voltam a `range(0,24)`. Entradas maliciosas (`a,b`, `x)`, `razao_social.eq.1`, `%_`, `"`) geram um único valor entre aspas, escapado.
8. "Próxima" pede `range(25,49)` e mantém busca e filtro; "Anterior" desabilitado na página 1; página além do fim volta à última válida.
9. Rótulos PT-BR; máscara CNPJ/CPF sem alterar o valor enviado ou recebido; "Não informado"; data em America/Sao_Paulo.
10. Erro 500, rede, `data` inválido e `count` nulo mostram a mensagem genérica, sem código técnico; "Tentar novamente" refaz a consulta.
11. O mock não recebe `insert`/`update`/`delete`/`upsert`/`rpc`/`functions.invoke`; nenhum link para `/contratantes/novo` ou editar; varredura do código-fonte sem service_role, sb_secret, auth.admin e auth.users.
12. Trocar a preferência de organização gera nova chave e não mostra linhas da organização anterior.
13. Em 390, os cards mostram razão social, documento e situação.

Comandos:
- RED: `bunx vitest run src/test/contratantes.test.tsx` (falha esperada por módulo ou comportamento ausente; registrar).
- GREEN: o mesmo arquivo, depois `bunx vitest run` (suíte completa) e `tsgo --noEmit`, e o log de build automático.

## 8. Validação posterior (Teste Oficial C, outro turno)
- Navegador em 1440/1280/768/390 com sessão controlada e interceptação para a tela.
- Isolamento RLS só por evidência HML real.
- Teclado, foco, console e network sem escrita.
- Regressão SYS-01..05, ADM-01, suíte, typecheck, build e Security Scan.

## 9. Confirmações
- Backend, schema, RLS, Auth, Edge, Storage e PROD intocados.
- Nenhuma RPC/Edge nova e nenhuma RPC usada.
- Zero escrita (INSERT/UPDATE/DELETE/UPSERT).
- Zero secret, service_role, auth.admin e auth.users.
- Nenhum botão ou link para rotas inexistentes de criar ou editar.
- Rastreabilidade:
  - **Aplicados:** 093 (paginação) e 094 (sem detalhe técnico).
  - **Respeitados:** 085 (sem estado crítico local); 091/092 sem mecanismo novo por ser leitura.
  - **Não aplicáveis:** demais atômicos.
