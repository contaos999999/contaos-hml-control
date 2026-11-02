# PROMPT 26 / V1-05 — Novo contrato (`/contratos/novo`)

Base: `cee162dca96c8d0bedf77df31b9ae6d3841f4db9`. Backend HML certificado é consumido, não alterado.

## Escopo Zero-Drift (somente arquivos novos)

| Arquivo | Papel |
|---|---|
| `src/routes/contratos_.novo.tsx` | Rota não aninhada `/contratos/novo` (padrão `contratantes_.novo.tsx`); `ssr:false`; head com title `Novo contrato — ContaOS`, robots noindex |
| `src/components/contratos/NovoContrato.tsx` | ContractForm + ContratanteCombobox + DateFields + FormActions (subcomponentes no mesmo arquivo) |
| `src/lib/contratos/novoContratoDados.ts` | Gate, busca paginada de contratantes, validação, payload, INSERT, classificação de erro |
| `src/test/novoContrato.test.tsx` | TDD RED/GREEN |
| `src/routeTree.gen.ts` | Regeneração automática apenas |

Não alterados: `contratos.tsx`, `ListaContratos.tsx`, `contratosDados.ts`, V1-01..03, SYS, ADM, client, types.ts, package.json, backend. Nenhum link novo adicionado em V1-04.

## Fluxo de dados

```text
getUser() -> ausente: /login | erro: retry sem logout
obterPreferenciaOrganizacao(uid) -> ausente: /selecionar-organizacao
Gate UX: listarOrganizacoesDisponiveis() (RPC já certificada, reuso de resolverDestinoPosLogin.ts)
   linha da org ativa com perfil em [administrador, gestor_contrato, administrador_master] -> formulário
   sem linha / outro perfil -> estado "acesso negado" (não 404); erro -> retry
Formulário -> validação local -> INSERT único -> sucesso -> /contratos
```

Master não é bloqueado falsamente: o gate não lê `vinculos_usuarios`; usa a mesma RPC que reconhece `administrador_master`. RLS do INSERT continua autoridade final (403/42501 tratado mesmo se o gate passar).

## Campos (conforme `contratos.Insert` em types.ts)

Obrigatórios: `numero`, `objeto`, `id_contratante` (combobox), `inicio`.
Opcionais: `fim`, `valor_global`, `valor_mensal_referencia`, `tipo_contrato`, `unidade_vinculada`, `fonte_recurso`.
Payload = esses campos preenchidos + `id_organizacao` da org ativa. Opcionais vazios são omitidos. NÃO enviados: `situacao`, `criticidade`, `versao_registro`, `periodicidade`, `configuracao_*`, `id`, timestamps (defaults server-side). Valores BRL digitados em formato brasileiro e convertidos para number; datas via `input type=date` (ISO), exibidas em PT-BR.

INSERT exato: `supabase.from("contratos").insert(payload)` sem `.select()`, sem depender de id.

## ContratanteCombobox paginado

- Consulta própria em `novoContratoDados.ts`: `from("contratantes").select("id,razao_social,nome_fantasia,documento", { count: "exact" }).eq("id_organizacao", org).eq("situacao","ativo").order("razao_social").order("id").range(...)` com páginas de 20 e `abortSignal`.
- Busca: reutiliza `montarPadraoBusca` e `buscaContemAsterisco` do V1-01 (escape, limite 100, rejeita `*`), debounce 300ms; query key `["novoContrato","contratantes",uid,org,busca,pagina]`, sem placeholderData (sem resultados stale).
- "Carregar mais" para a próxima página; nunca carrega todos.
- `id_contratante` só vem de opção selecionada da lista retornada; não há campo de texto livre de id. Trocar busca limpa seleção inválida.
- ARIA: combobox com `aria-expanded`, `aria-controls`, listbox/option, setas/Enter/Escape, estados loading options / vazio / erro com retry.

## Validação (somente UX)

- Campos obrigatórios com `aria-required`, `aria-invalid`, `aria-describedby`; foco no primeiro inválido.
- `fim` anterior a `inicio` -> "A data de término não pode ser anterior à data de início."
- Valores numéricos >= 0 quando informados. Nenhuma regra jurídica no cliente.

## Estados e erros

loading (gate), loading options, submitting ("Salvando…", botão disabled + ref anti-reentrada), success (status acessível + navegação a `/contratos`), negado, 422, erro genérico.
Classificação: 401/403/42501/PGRST301 -> "Você não tem permissão para cadastrar contratos nesta organização."; 422/PT400/22xxx/23502/23514/23503 -> "Revise os dados informados."; 23505 -> "Já existe um contrato com este número."; demais/rede -> mensagem genérica PT-BR. Nunca exibir code/detail/hint/stack. Formulário preservado em erro.
Cancelar -> `/contratos`.

## Acessibilidade e responsividade

H1 único `Novo contrato`; labels explícitos; foco visível; alvos >= 44px; status não só por cor; tooltip acessível (foco/toque) no campo Contratante. Grid 2 colunas >= 768px, 1 coluna em 390px; validar 1440/1280/768/390 sem overflow.

## TDD

RED (falha por módulo ausente/comportamento) e depois GREEN para:
1. Combobox: consulta com `eq id_organizacao`, `range(0,19)`, busca escapada, `*` rejeitado sem consulta, "Carregar mais" pede `range(20,39)`, sem stale na troca de busca.
2. `objeto` obrigatório bloqueia INSERT.
3. `fim < inicio` bloqueia INSERT com mensagem PT-BR.
4. Payload exato (sem situacao/criticidade/versao_registro), opcionais vazios omitidos.
5. INSERT chamado sem `.select()`.
6. 403/42501 -> negado; 422/PT400 -> revisar dados; 500/rede -> genérico.
7. Double-submit -> 1 INSERT.
8. Sucesso -> navega `/contratos`; Cancelar -> `/contratos`.
9. Master com RPC `perfil='administrador_master'` e zero vínculo físico -> formulário liberado; leitor -> negado, zero INSERT.
10. Source scan: zero `.update(` `.delete(` `.upsert(` `.rpc(` próprio novo, `functions.invoke`, `service_role`, `sb_secret`, `vinculos_usuarios`.

Depois: testes focados, suíte completa, `tsgo --noEmit`, build, browser controlado 1440/1280/768/390. Teste C em turno separado.

## Critérios de parada

- Se algum campo obrigatório do Insert divergir do backend real ou o INSERT exigir RETURNING: parar, declarar LACUNA DE BACKEND.
- Se for necessário tocar arquivo fora da tabela de escopo: parar e pedir autorização.
- Qualquer FAIL obrigatório impede avanço para Teste C.

## Rastreabilidade

PROMPT 26 regular; atômico V1-05 da matriz 96/96. Sem outros atômicos aplicáveis identificados.
