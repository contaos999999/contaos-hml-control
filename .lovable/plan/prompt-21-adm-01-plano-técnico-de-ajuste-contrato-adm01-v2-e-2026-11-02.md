# PROMPT 21 / ADM-01 — Plano técnico de ajuste (contrato ADM01-v2 + Edge admin-invite-user)

## 0. Auditoria do código atual (lida neste turno)

O ADM-01 já foi construído (último commit `f877b2a`). Existe hoje:

- `src/routes/administracao.usuarios.tsx`: rota `ssr:false`, `head()` PT-BR, `noindex`.
- `src/components/administracao/usuarios/`: `AdminUsuarios`, `UserMembershipTable`, `RoleSelect`, `ContractScopeDialog`, `InviteLinkUserForm`, `AuditDrawer`.
- `src/lib/administracao/`: `admUsuariosRpc.ts` (4 RPCs), `deltaEscopo.ts`, `intencaoIdempotente.ts`.
- Testes: `src/test/admUsuarios.test.tsx` (538 linhas) e `src/test/admUsuariosLogica.test.ts`.

Diferenças em relação à especificação deste turno:

1. **`validar_administrador_organizacao` não é chamada.** Hoje o 403 só aparece por erro da RPC de lista. A função existe em `types.ts`.
2. **A Edge `admin-invite-user` não é usada.** `InviteLinkUserForm` só vincula conta existente, e o PT404 vira "conta inexistente".
3. **Versões aceitas:** a lista e a auditoria aceitam também `adm01-v1`. Pela especificação, qualquer valor diferente de `adm01-v2` é incompatibilidade técnica.
4. **Tamanho das páginas:** hoje 25/25/20, dentro dos limites (100/100/50). Fica como está.
5. **Erros da Edge** (409 CONFLITO_IDEMPOTENCIA / OPERACAO_EM_PROCESSAMENTO, 422, 413) ainda não são classificados.
6. O restante (delta ativar/revogar, `versao_registro`, PT409, chave por intenção, PT404 contextual, reset ao voltar de todos→específico) já está implementado e testado. Fica preservado.

## 1. Arquivos a modificar (somente estes)

| Arquivo | Responsabilidade |
|---|---|
| `src/lib/administracao/admUsuariosRpc.ts` | Adicionar `validarAdministrador(org)`. Exigir só `adm01-v2` em todas as RPCs. Adicionar `convidarUsuario(body)` via `supabase.functions.invoke("admin-invite-user")`. Adicionar `classificarErroConvite(status, codigo)`, novos tipos de erro e mensagens PT-BR. |
| `src/components/administracao/usuarios/AdminUsuarios.tsx` | Nova fase "validando acesso": a lista só é chamada se `validar_administrador_organizacao` devolver `true`. `false` ou 42501/401/403 levam ao 403 dedicado, sem dados. |
| `src/components/administracao/usuarios/InviteLinkUserForm.tsx` | Campos e-mail (obrigatório) e nome (opcional), com labels reais. O texto passa a "Convidar ou vincular usuário". |
| `src/components/administracao/usuarios/ContractScopeDialog.tsx` | No modo "novo": passo 1 chama a Edge (chave de convite própria); com 200, passo 2 chama `salvar_vinculo_usuario_adm` (chave de vínculo própria, `p_id_usuario` = id devolvido pela Edge, `p_versao_esperada=null`). Estados neutros para OPERACAO_EM_PROCESSAMENTO. |
| `src/test/admUsuarios.test.tsx` | Novos testes RED (seção 6). |
| `src/test/admUsuariosLogica.test.ts` | Testes de classificação da Edge e da versão estrita. |

Nenhum arquivo novo. `routeTree.gen.ts` não muda.

## 2. Fluxo de dados e autorização

```text
getUser ─┬─ AuthSessionMissingError / sem user ──> /login
         ├─ outro erro ──> erro genérico + Tentar novamente
         └─ ok ──> obterPreferenciaOrganizacao(user.id)
                    ├─ ausente ──> /selecionar-organizacao
                    └─ org ──> rpc validar_administrador_organizacao(org)
                                ├─ false | 42501 | 401/403 ──> 403 dedicado (sem dados)
                                ├─ erro técnico ──> erro genérico + retry
                                └─ true ──> rpc listar_usuarios_vinculos_adm(...)
```

- A preferência é só conveniência. Toda RPC revalida no backend, e um 403 em qualquer RPC posterior também leva ao estado negado.
- A query key inclui `idUsuario`+`org`. Não há cache entre organizações.
- Perfis vêm só de `perfis_disponiveis`. Contratos vêm só da RPC de escopo, com baseline em `selecionado`.

**Convite (modo novo):**
1. Validação local: e-mail não vazio e com formato básico. O resto fica com o backend (422).
2. `functions.invoke("admin-invite-user", { body: { id_organizacao, email, nome?, chave_idempotencia: chaveConvite } })`. O JWT segue pelo cliente existente.
3. Com 200 (`USUARIO_EXISTENTE` ou `USUARIO_CONVIDADO`): avisar qual dos dois em PT-BR e chamar `salvar_vinculo_usuario_adm` com os 10 argumentos.
4. Se o passo 2 falhar, não repetir o convite. O retry reenvia só o vínculo, com a mesma chave de vínculo e o id já obtido.

**Mensagens dos códigos da Edge:**
- 401: mensagem de sessão inválida e link para entrar.
- 403: negado.
- 409 CONFLITO_IDEMPOTENCIA: conflito. A chave cai e a próxima tentativa explícita gera chave nova.
- 409 OPERACAO_EM_PROCESSAMENTO: aviso neutro, envio bloqueado e botão "Consultar novamente", que reenvia uma única vez com a mesma chave.
- 422: validação.
- 413: dados grandes demais.
- 500 ou rede: genérico.
- Nunca mostrar o `message` técnico.

## 3. Componentes e estados

- **AdminUsuarios:** verificando sessão; validando acesso; carregando; vazio; sucesso; negado (403 dedicado, com links "Selecionar outra organização" e "Sair"); erro com retry; aviso de sucesso com `correlation_id`.
- **UserMembershipTable:** tabela ≥768 px e linhas empilhadas em 390 px. Situação em texto, não só cor. Ações Editar e Auditoria com alvo ≥44 px.
- **RoleSelect:** select com label, opções do catálogo backend.
- **ContractScopeDialog:** novo/editar; perfil; ativo/inativo; escopo todos/específico; lista paginada com busca. Estados: carregando, vazio, erro, salvando (sem atualização otimista), conflito PT409 (recarrega lista e escopo e exige nova revisão), vínculo desatualizado, validação, em processamento.
- **InviteLinkUserForm:** e-mail e nome, com ajuda textual.
- **AuditDrawer:** paginado (20). Mostra ator, data/hora pt-BR em America/Sao_Paulo, evento, antes/depois literal, `correlation_id`. Estados carregando, vazio e erro.

**Responsividade:** 1440/1280 em tabela densa; 768 em tabela com quebra de colunas; 390 em linhas empilhadas, sem overflow horizontal. Diálogo e gaveta ocupam a tela inteira no mobile.

**Acessibilidade:** um único h1; headings de seção; labels associados; foco preso e devolvido em diálogo e gaveta (Radix); `role=status` e `role=alert`; foco visível.

## 4. Idempotência e concorrência

- `intencaoIdempotente` (já existe) com dois gerenciadores independentes: `intencaoConvite` e `intencaoVinculo`.
- Mesma assinatura de payload, em retry ou duplo clique, reutiliza a chave. Qualquer edição, PT409 ou CONFLITO_IDEMPOTENCIA descarta a chave. Sucesso encerra a intenção.
- O envio fica bloqueado enquanto há requisição em voo (ref síncrono + `disabled`).
- Edição envia `versao_registro` exata. PT409 nunca sobrescreve.
- O escopo envia só o delta conhecido. Páginas não visitadas nunca viram revogação.

## 5. Matriz NFR

| NFR | Onde é atendido |
|---|---|
| 091 concorrência | `p_versao_esperada`, tratamento de PT409 e recarga obrigatória |
| 092 idempotência | duas intenções separadas (convite e vínculo) |
| 093 paginação | 25/25/20 dentro dos limites 100/100/50; nada carregado de forma implícita |
| 094 observabilidade | `correlation_id` no aviso e na auditoria; sem detalhe técnico na tela |

## 6. TDD (RED → GREEN)

**RED:** primeiro só os testes. Rodar `bunx vitest run src/test/admUsuarios.test.tsx src/test/admUsuariosLogica.test.ts` e registrar as falhas esperadas.

Novos ou ajustados:

- **T3/T4.** Validação de administrador:
  - chamada uma vez com `{p_id_organizacao}`;
  - `true` mostra a página;
  - `false` mostra 403 e a lista não é chamada;
  - 42501 mostra 403;
  - 500 mostra erro genérico.
- **T5.** `adm01-v1` na lista ou na auditoria vira erro genérico. Os argumentos de org, página e filtros são exatos.
- **T11.** O convite chama `functions.invoke` com o body exato, depois `salvar_vinculo_usuario_adm` com o id retornado e os 10 argumentos. Zero `.from(...).insert/update/delete`.
- **T12.** Com `USUARIO_EXISTENTE`, aparece o aviso correto e o vínculo é salvo.
- **T13.** Edge:
  - 409 CONFLITO_IDEMPOTENCIA: nova chave na próxima tentativa;
  - 409 OPERACAO_EM_PROCESSAMENTO: estado neutro, sem reenvio automático;
  - 422 e 413: mensagens próprias;
  - 500: genérico;
  - 401/403: tratamento correto;
  - texto técnico não aparece.
- **T10b.** As chaves de convite e de vínculo são diferentes. Uma falha no vínculo depois do convite não repete a Edge.
- Os demais testes (1, 2, 6–9, 14–17) já existem e são mantidos. Os que dependiam de PT404 "conta inexistente" no modo novo são ajustados ao novo fluxo.

**GREEN:** implementar só os arquivos da seção 1. Depois rodar:
- `bunx vitest run`, a suíte completa (regressão SYS-01..05);
- `tsgo --noEmit`;
- build;
- varredura de código (`rg`) por `service_role`, `auth.admin`, `.insert(`, `.update(`, `.delete(`, `auth.users`, `adm01-v1`.

## 7. Não será tocado

Backend, migrations, RLS, RPCs, Edge Functions, Auth config, Storage, `client.ts`, `types.ts`, `__root.tsx`, `router.tsx`, `routeTree.gen.ts`, `package.json`, `AGENTS.md`, telas SYS-01..SYS-05, layout global e componentes `ui/` (o rótulo "Close" continua como desvio conhecido). PROD não é tocado.

## 8. Confirmações

Sem backend paralelo, sem service_role no frontend, sem escrita direta em tabelas (só RPC e Edge oficiais), sem leitura de `auth.users` e nenhuma alteração em PROD. O Teste C (browser em 4 larguras, console, teclado, Security Scan, chamada real da Edge com `USUARIO_EXISTENTE` usando conta HML já existente, sem convite real) fica para um turno separado.
