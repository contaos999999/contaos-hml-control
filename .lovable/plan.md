# PROMPT 23 / V1-02 — Novo contratante (`/contratantes/novo`)

## Auditoria (estado atual confirmado)
- `/contratantes` existe como rota plana `src/routes/contratantes.tsx` (`ssr:false`, head PT-BR/noindex), renderizando `ListaContratantes` **sem `<Outlet />`**. Um arquivo `contratantes.novo.tsx` viraria filho dela e renderizaria a lista. Por isso a nova rota usa o arquivo **não aninhado** `contratantes_.novo.tsx`, e o arquivo da V1-01 não muda.
- `src/lib/contratantes/contratantesDados.ts` já tem `ErroContratantes`, classificação denied/erro, rótulos de tipo e situação em PT-BR. Esses rótulos serão reaproveitados por import, sem alterar o arquivo.
- O padrão de sessão, preferência e logout vem de `ListaContratantes`/`Dashboard`: `auth.getUser()`, `obterPreferenciaOrganizacao(user.id)`, `queryClient.clear()` + `signOut()`.
- `types.ts` já tipa `vinculos_usuarios` (perfil, ativo, inicio_em, fim_em) e `contratantes.Insert`. Nenhuma alteração de tipos.

## A) Arquivos
| Arquivo | Ação | Papel |
|---|---|---|
| `src/routes/contratantes_.novo.tsx` | criar | rota `/contratantes/novo`, `ssr:false`, head próprio (`Novo contratante — ContaOS`, description, og, twitter:card, noindex) |
| `src/components/contratantes/NovoContratante.tsx` | criar | tela: sessão → organização → gate UX → formulário → saving → sucesso/erros |
| `src/lib/contratantes/novoContratanteDados.ts` | criar | `consultarVinculoProprio`, `vinculoPermiteCadastro(v, agora)`, `validarFormulario`, `montarPayload`, `inserirContratante`, `classificarErroInsert`, `MENSAGENS_V102` |
| `src/test/novoContratante.test.tsx` | criar | testes RED/GREEN |
| `src/routeTree.gen.ts` | regenerado automaticamente | sem edição manual |

Não haverá botão "Novo contratante" na lista da V1-01, para não alterar o escopo certificado. Se você quiser esse link, ele pode ser autorizado à parte.

## B) Fluxo de autorização e dados
```text
getUser() ── erro ──> erro de sessão + "Tentar novamente" (sem logout)
   │ null ──> /login
   v
preferência(user.id) ── ausente ──> /selecionar-organizacao
   v
Q-gate: vinculos_usuarios.select('perfil,ativo,inicio_em,fim_em')
        .eq('id_organizacao', org).eq('id_usuario', user.id).maybeSingle()
   ├ 401/403/42501/PGRST301 -> NEGADO (403 dedicado, sem formulário)
   ├ outro erro/rede        -> ERRO genérico + retry
   ├ null / inativo / inicio_em > agora / fim_em <= agora / perfil fora de {administrador, gestor_contrato} -> NEGADO
   v
FORMULÁRIO  (o gate é só UX; a autoridade é a RLS do INSERT)
```
- O gate usa React Query com chave `["v102","vinculo",userId,org]`. Sem `placeholderData`.
- O INSERT é uma `useMutation` sem cache de lista.

**INSERT exato**
```ts
supabase.from("contratantes").insert({
  id_organizacao, tipo_pessoa, documento, razao_social, nome_fantasia, contato, situacao,
}).select("id,razao_social,situacao").single()
```
- `id_organizacao` vem só da preferência validada pelo gate. Não há campo visível nem editável para ela.
- Nunca enviar `id`, `versao_registro`, `criado_em`, `atualizado_em`.
- Sem RPC, Edge, update, delete, upsert, service_role, auth.admin ou auth.users.

**Montagem do payload**
- `razao_social`: trim, obrigatório.
- `tipo_pessoa`: obrigatório, um destes valores: `juridica` (Pessoa jurídica), `fisica` (Pessoa física), `orgao_publico` (Órgão público), `outro` (Outro). Não vem pré-selecionado.
- `documento`: trim; vazio vira `null`. Nenhuma remoção de caracteres e nenhuma validação de CPF/CNPJ.
- `nome_fantasia`: trim; vazio vira `null`.
- `contato`: monta `{email?, telefone?}` só com as chaves preenchidas (após trim); se as duas estiverem vazias, envia `{}`.
  - E-mail tem validação básica de formato (`^[^\s@]+@[^\s@]+\.[^\s@]+$`).
  - Telefone recebe só trim, com placeholder `(11) 91234-5678`.
- `situacao`: `ativo` (padrão) ou `inativo`.

## C) Erros (sem code/details/hint/constraint visíveis)
| Origem | Resultado |
|---|---|
| 401/403/42501/PGRST301 no INSERT | estado NEGADO "Você não tem permissão para cadastrar contratantes nesta organização."; formulário removido, sem retry de envio |
| 23505 | alerta "Já existe um contratante com este documento nesta organização."; o formulário continua, com foco no Documento |
| 23502/23514 | "Alguns campos estão inválidos. Revise e tente novamente." |
| 500/rede/outros | "Não foi possível cadastrar o contratante agora. Tente novamente em instantes."; o formulário continua para nova tentativa manual |

O status HTTP é lido no topo da resposta, como na correção da SYS-05.

## D) Estados, foco e UX
- Estados: verificando sessão, erro de sessão, validando permissão, negado, erro do gate, formulário, salvando, erro de envio, duplicidade e sucesso.
- Duplo envio: um `useRef` síncrono mais o botão desabilitado com o texto "Salvando…" (`aria-busy`).
- Validação local:
  - Mostra um resumo com `role="alert"` e erros por campo (`aria-invalid` + `aria-describedby`).
  - Leva o foco ao primeiro campo inválido.
  - Não envia o INSERT.
- Sucesso:
  - O formulário é desmontado e aparece o painel "Contratante cadastrado com sucesso." (`role="status"`, aria-live), mostrando a razão social retornada.
  - O foco vai para o título do painel (`tabIndex=-1`).
  - A única ação é "Voltar para contratantes" (`/contratantes`). Não haverá "Cadastrar outro", para manter o mínimo.
- Cabeçalho segue o padrão V1-01: links Painel e Voltar para contratantes, e botão Sair que limpa o cache e chama `signOut()` antes de ir para `/login`.
- Estrutura:
  - Exatamente um h1 ("Novo contratante") e o h2 "Dados do contratante".
  - Labels reais e `required` nos campos obrigatórios. Situação mostrada com texto, não só cor.
  - Tooltips acessíveis apenas em "Documento" (duplicidade validada pela organização) e "Contato", com alvo de 44×44.
- Responsivo:
  - 1440/1280: grade de 2 colunas, máximo `max-w-3xl`.
  - 768: 2 colunas compactas.
  - 390: campos empilhados e botões com largura total.
  - Todos os alvos com no mínimo 44 px e nenhum overflow horizontal.
- Visual: o mesmo workspace sóbrio da V1-01, com tokens semânticos existentes.

## E) TDD
**RED.** Primeiro só `src/test/novoContratante.test.tsx` é criado e executado com `bunx vitest run src/test/novoContratante.test.tsx`. Ele deve falhar porque o módulo ainda não existe. Casos:
1. Head da rota: título, description PT-BR, noindex.
2. Sem sessão vai para `/login`; erro de `getUser` mostra retry sem logout.
3. Sem preferência vai para `/selecionar-organizacao`.
4. administrador e gestor_contrato com vínculo ativo e vigente veem o formulário. A consulta do gate usa exatamente as colunas e os dois `eq`.
5. Ficam em NEGADO, sem formulário e sem INSERT:
   - perfil leitor ou outro perfil;
   - vínculo inativo, expirado, futuro;
   - vínculo null.
6. Gate com 401/403/42501/PGRST301 dá NEGADO; 500 e erro de rede dão erro genérico.
7. O payload tem exatamente as 7 chaves. Documento e nome fantasia vazios viram null. Contato vazio vira `{}`; só e-mail vira `{email}`; os dois viram `{email,telefone}`. O documento é enviado literal, após trim.
8. Razão social vazia, tipo ausente ou e-mail inválido bloqueiam o INSERT e levam o foco ao primeiro campo inválido.
9. Dois cliques rápidos geram um único INSERT.
10. 23505, 23502/23514, 500 e rede mostram as mensagens amigáveis, sem código técnico no DOM.
11. INSERT com 42501 depois do gate aprovado vai para NEGADO e não há botão de reenvio.
12. Sucesso: `role=status`, foco no título, link `/contratantes`, nenhum link `/contratantes/:id` ou `/editar`.
13. Rótulos e valores oficiais de tipo e situação; Ativo é o padrão.
14. Teclado: Tab segue a ordem lógica, Enter envia, e os alvos medem pelo menos 44 px (classe/atributos).
15. Código-fonte dos novos arquivos: zero `rpc(`, `functions.invoke`, `.update(`, `.delete(`, `.upsert(`, service_role, auth.admin, auth.users, `localStorage`, `sessionStorage` (escrita) ou `placeholderData`.

**GREEN.** Só depois implementar a rota, o componente e a camada de dados. Em seguida:
- teste focado;
- suíte completa (`bunx vitest run`, regressão SYS-01..05, ADM-01, V1-01);
- `tsgo --noEmit`;
- log de build automático;
- browser controlado nas 4 larguras (sessão simulada e respostas interceptadas, sem tocar o HML) e scan focado com grep.

Teste C, Security Scan dedicado e build oficial ficam para o turno de teste.

## F) O que NÃO será tocado
- Supabase, banco, migrations (inclusive `20261102155834_v102_auditoria_criacao_contratante`), RLS, Edge, Auth, Storage e PROD.
- Cliente Supabase, `types.ts`, `__root.tsx`, router, `package.json`, componentes `ui/` compartilhados.
- SYS-01..05, ADM-01 e V1-01 (`contratantes.tsx`, `ListaContratantes.tsx`, `contratantesDados.ts`, `contratantes.test.tsx`).
- `<html lang="en">` global: fica pendente, só registrado.

## G) Confirmações
- Nenhum backend paralelo, RPC, Edge, idempotência server-side ou controle de versão na criação (091/092 não se aplicam, como definido).
- 093, 095 e 096 não se aplicam. 094 é atendido: nada técnico ou sensível em tela ou log.
- A única escrita é o INSERT autorizado em `contratantes`, protegido pela RLS. A auditoria `ContratanteCriado` é gerada pelo trigger já existente no banco.
