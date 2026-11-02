# PROMPT 22 / V1-01 — Contratantes (somente leitura)

## Auditoria do código atual
- Não existe rota `/contratantes`, componente, camada de acesso nem teste sobre contratantes. Também não existem `/contratantes/novo` ou `/contratantes/:id/editar` (nada a reportar sobre rotas futuras).
- `src/integrations/supabase/types.ts` já tipa `contratantes` com as 11 colunas auditadas. Não precisa mudar.
- Padrões a reutilizar:
  - **Sessão:** `Dashboard.tsx` faz `supabase.auth.getUser()`. Usuário null sem erro vai para `/login`; erro técnico mostra erro com "Tentar novamente".
  - **Organização:** `obterPreferenciaOrganizacao(user.id)`; sem preferência vai para `/selecionar-organizacao`.
  - **Acesso negado:** a classificação usa `status` 401/403 do nível superior da resposta e `code` 42501/PGRST301 (correção do FAIL do SYS-05).
  - **Dados:** React Query (`useQuery`) com chave que inclui a organização; rota com `ssr:false` e `head()` PT-BR com `noindex`, como em `administracao.usuarios.tsx`.
- Conflitos: nenhum. Observação: não há menu global com link para Contratantes. Não vou criar esse link (layout global fora de escopo); a rota fica acessível pela URL.
- Backend: sem LACUNA, conforme a auditoria HML informada.

## A) Arquivos (somente estes)
- Criar `src/routes/contratantes.tsx` (rota, `ssr:false`, `head` único PT-BR).
- Criar `src/components/contratantes/ListaContratantes.tsx` (tela).
- Criar `src/lib/contratantes/contratantesDados.ts` (acesso à Data API + tipos + rótulos/formatação pura).
- Criar `src/test/contratantes.test.tsx` (TDD).
- `src/routeTree.gen.ts`: só a regeneração automática.
- Nenhum outro arquivo.

## B) Camada de acesso — contrato
```text
type TipoPessoa = "juridica" | "fisica" | "orgao_publico" | "outro"
type Situacao = "ativo" | "inativo"
type Contratante = { id; razao_social; nome_fantasia: string|null; documento: string|null;
                     tipo_pessoa: string; situacao: string; versao_registro: number }
type FiltroSituacao = "todos" | "ativo" | "inativo"
type ParametrosLista = { idOrganizacao: string; pagina: number (>=1); busca: string; situacao: FiltroSituacao }
type PaginaContratantes = { itens: Contratante[]; total: number; pagina: number; totalPaginas: number }
class ErroContratantes { tipo: "negado" | "erro" }
TAMANHO_PAGINA = 25
listarContratantes(p): Promise<PaginaContratantes>
escaparPadraoIlike(texto): string        // escapa \ % _
rotuloTipoPessoa(t), rotuloSituacao(s), formatarDocumento(d)
```
- Valores desconhecidos de tipo ou situação são exibidos com o texto literal do backend, sem inventar significado.
- `versao_registro` fica só no tipo, sem uso (NFR-007).

## C) Query exata
```text
from = (pagina-1)*25 ; to = from+24
supabase.from("contratantes")
  .select("id,razao_social,nome_fantasia,documento,tipo_pessoa,situacao,versao_registro", { count: "exact" })
  .eq("id_organizacao", idOrganizacao)
  [.eq("situacao", situacao)               se situacao != "todos"]
  [.ilike("razao_social", `%${escaparPadraoIlike(busca.trim())}%`)  se busca.trim() != ""]
  .order("razao_social", { ascending: true })
  .order("id", { ascending: true })
  .range(from, to)
```
- Sem `select('*')`, `.or()`, RPC, Edge ou escrita.
- Resposta: `{ data, error, status, count }`.
  - **Negado:** `error` com `status` 401/403 ou `code` 42501/PGRST301 lança `ErroContratantes("negado")`.
  - **Erro:** qualquer outro `error`, `data` que não seja array ou `count` nulo lança `ErroContratantes("erro")`.
  - `totalPaginas = max(1, ceil(count/25))`.
  - **Página além do fim** (`count>0` e itens vazios após o total encolher): a tela volta para a última página válida e refaz a consulta. Nunca mostra empty falso.
  - **Erro de faixa inválida (PGRST103 / 416):** tratado igual ao caso acima, voltando à última página.
- Array vazio com `count=0` é empty legítimo, nunca negado.
- **Busca:** debounce de 300 ms e trim. Busca e filtro reiniciam na página 1.
- **Chave React Query:** `["contratantes", idOrganizacao, pagina, busca, situacao]`; `placeholderData` mantém a página anterior durante a navegação.

## D) Componentes e estados
- **Cabeçalho:** h1 "Contratantes" e descrição "Consulte os contratantes cadastrados na organização selecionada." Link "Painel" e botão "Sair", como no Dashboard. Nenhum botão de criar ou editar.
- **Filtros:** região com h2 "Filtros".
  - Campo "Buscar por razão social" (com label).
  - Select "Situação" com Todos, Ativos e Inativos.
- **Resultado:** h2 "Contratantes cadastrados" e o texto "N contratante(s)".
- **Estados:**
  - **verificando sessão:** "Verificando sessão…"
  - **loading:** skeleton com `role=status` e "Carregando contratantes…"
  - **empty sem filtro:** "Nenhum contratante cadastrado nesta organização."
  - **empty com filtro:** "Nenhum contratante encontrado para os filtros aplicados." e botão "Limpar filtros"
  - **denied:** "Você não tem acesso aos contratantes desta organização." com link "Selecionar outra organização". Sem botão "Tentar novamente".
  - **error:** "Não foi possível carregar os contratantes agora. Tente novamente em instantes." com botão "Tentar novamente".
  - **success:** tabela ou cards e a paginação.
- **Situação:** badge com texto "Ativo"/"Inativo" e ícone, nunca só cor.
- **Tipo:** Pessoa jurídica, Pessoa física, Órgão público, Outro.
- **Documento:**
  - 14 dígitos: máscara CNPJ, só exibição.
  - 11 dígitos: máscara CPF.
  - Outros formatos: texto original.
  - Sem documento: "Não informado".
  - Nenhuma validação jurídica.
- **Paginação:** `nav aria-label="Paginação"`, botões "Anterior"/"Próxima" desabilitados nos limites e "Página X de Y".
- **Tooltip:** só um, acessível, em "Situação", explicando que reflete o cadastro no sistema (hover, foco e toque, como em `Dica`).
- Mensagens técnicas nunca aparecem.

## E) Responsividade
- **1440/1280:** largura máxima de container e tabela com 5 colunas.
- **768:** tabela; Nome fantasia quebra linha; filtros em 2 colunas.
- **390:** lista de cards (`md:hidden` / `hidden md:table`).
  - Cada card tem Razão social (título), Documento, Situação, Tipo e Nome fantasia.
  - Filtros empilhados; paginação com botões de 44 px.
  - `break-words`, sem overflow horizontal.

## F) Acessibilidade
- Um h1 e hierarquia de h2.
- Labels associados.
- Tabela com `<caption class="sr-only">` e `scope="col"`.
- Cards em `<ul>/<li>` com `<dl>`.
- Região `aria-live="polite"` anunciando o total e a página.
- Foco visível, alvos ≥44 px e ordem de Tab lógica.
- Paginação operável por Enter e Espaço.
- Denied e error com `role="alert"`.

## G) TDD — testes RED antes da produção (`src/test/contratantes.test.tsx`)
1. Sem sessão (user null, sem erro) vai para `/login`; erro de `getUser` mostra erro e retry, sem redirecionar.
2. Sem preferência vai para `/selecionar-organizacao`.
3. Query exata:
   - `from("contratantes")` e o `select` com as colunas listadas e `count:"exact"`;
   - `eq id_organizacao`;
   - `order razao_social` e depois `order id`;
   - `range(0,24)`.
4. "Próxima" chama `range(25,49)`; "Página 2 de 3" aparece; "Anterior" desabilitado na página 1 e "Próxima" na última.
5. Filtro Ativos chama `eq("situacao","ativo")` e reinicia em `range(0,24)`; "Todos" não envia `eq` de situação.
6. Busca: `ilike` com o padrão `%texto%`, trim e volta à página 1.
   - `100%_a\b` é escapado como `100\%\_a\\b`.
   - Nunca chama `.or`.
7. Empty legítimo (`[]`, count 0) mostra a mensagem de empty; empty com filtro mostra "Limpar filtros".
8. Denied: status 403 sem code, 401, code 42501 e PGRST301 mostram denied, nunca empty.
9. Erro genérico (500, falha de rede, `data` inválido, `count` nulo) mostra a mensagem amigável, sem SQLSTATE; "Tentar novamente" refaz a consulta.
10. Página além do fim volta à última página válida.
11. Render: rótulos de tipo e situação em PT-BR, máscara CNPJ/CPF, "Não informado".
12. Mobile: com `matchMedia`/classes, os cards contêm Razão social, Documento e Situação.
13. Ausência de DML: o cliente mock não recebe `insert`/`update`/`delete`/`upsert`/`rpc`/`functions.invoke`. Nenhum link para `/contratantes/novo` ou `/editar` e nenhum botão de criar ou editar.
14. A rota `head` tem um título único.

Rodar e registrar o RED (falha por módulo ou comportamento ausente); depois GREEN mínimo.

## H) Regressão e segurança
- Teste focado, suíte completa, typecheck (`tsgo`) e log de build automático.
- Varredura do frontend de produção por service_role, sb_secret, auth.admin, auth.users, `.insert(`/`.update(`/`.delete(`/`.upsert(`, `select("*")` e `.or(` no novo módulo.
- Git diff limitado aos arquivos da seção A.
- Teste C (browser em 4 larguras, console, Security Scan) só no turno oficial posterior.

## I) Confirmações
- Backend, Supabase, RLS, Auth, Edge e PROD intocados.
- Nenhuma RPC/Edge nova ou existente usada.
- Nenhum CRUD de escrita.
- Nenhum link ou botão para criar ou editar (V1-02/V1-03 nos prompts 23 e 24).
- Layout global, cliente Supabase, SYS-01–05 e ADM-01 não alterados.
- Rastreabilidade: 093 aplicado; 085, 091 e 094 respeitados por não implementação; 001–084, 086–090, 092 e 095–096 não aplicáveis.
