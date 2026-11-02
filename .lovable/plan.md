# PROMPT 24 / V1-03 — Editar contratante (plano mínimo frontend)

Backend HML certificado tratado como contrato (RPC `atualizar_contratante`, `v103-v1`). Nenhuma alteração em Supabase/backend/RLS/Edge/Auth/Storage/PROD.

## A) Arquivos

| Arquivo | Ação | Papel |
|---|---|---|
| `src/routes/contratantes_.$id.editar.tsx` | criar | `createFileRoute("/contratantes_/$id/editar")` → URL `/contratantes/$id/editar`, irmã de `/contratantes` (mesma convenção `_` de `contratantes_.novo.tsx`, sem Outlet em V1-01). `ssr:false`, head PT-BR: `Editar contratante — ContaOS`, description/og/twitter, `robots=noindex`. |
| `src/components/contratantes/EditarContratante.tsx` | criar | Tela, estados, formulário, conflito. |
| `src/lib/contratantes/editarContratanteDados.ts` | criar | GET read-only, RPC save, classificação de erros, payload. |
| `src/test/editarContratante.test.tsx` | criar (primeiro) | TDD. |
| `src/routeTree.gen.ts` | auto-gerado | Não editado à mão. |
| `src/integrations/supabase/types.ts` | modificar só bloco `Functions` | Adicionar exatamente `atualizar_contratante` (9 args, `Returns: Json`). Confirmado: assinatura ausente hoje. |

Reuso por import (sem modificar V1-02): `consultarVinculoProprio`, `vinculoPermiteCadastro`, `validarFormulario`, `TIPOS_PESSOA`, tipo `FormularioContratante`/`CampoFormulario` de `novoContratanteDados.ts`; `obterPreferenciaOrganizacao` de SYS-04. Mensagens próprias `MENSAGENS_V103` (não reaproveitar `MENSAGENS_V102`, para não acoplar copy).

Não tocados: V1-01, V1-02, SYS-01..05, ADM-01, `components/ui`, `client.ts`, `package.json`, `__root.tsx`, migrations. Nenhum link novo na lista (V1-01 certificada) — tela acessada pela URL; registrar como pendência de navegação.

## B) Camada de dados (`editarContratanteDados.ts`)

```text
type ContratanteEdicao = { id; id_organizacao; tipo_pessoa; documento|null; razao_social;
  nome_fantasia|null; contato: {email?,telefone?}; situacao; versao_registro: number; atualizado_em }
type TipoErroV103 = "negado"|"nao_encontrado"|"conflito"|"duplicado"|"invalido"|"erro"
class ErroV103 { tipo }
```

- `classificarErroV103({error,status})`: `42501`/`PGRST301`/401/403 → negado; `PT409` → conflito; `PT404` → nao_encontrado; `23505` → duplicado; `PT422`/`23502`/`23514` → invalido; resto/rede/500 → erro. `status` lido no nível superior da resposta (lição SYS-05).
- `buscarContratante(org, id)`: exatamente
  `from("contratantes").select("id,id_organizacao,tipo_pessoa,documento,razao_social,nome_fantasia,contato,situacao,versao_registro,atualizado_em").eq("id_organizacao",org).eq("id",id).maybeSingle()`; `null` → `nao_encontrado`; exceção → `erro`.
- `formularioDe(c)`: converte registro → `FormularioContratante` (nulos → `""`, `contato.email/telefone` → strings).
- `montarArgsAtualizacao(org,id,versaoLida,f)`: 9 args; `p_versao_esperada = versaoLida` sem aritmética; `p_documento`/`p_nome_fantasia` = trim ou `""`; `p_razao_social` trim; `p_contato` só com email/telefone preenchidos; `p_tipo_pessoa`, `p_situacao`.
- `atualizarContratante(args)`: único `supabase.rpc("atualizar_contratante", args)`; valida `schema_versao === "v103-v1"` e `contratante.versao_registro` numérico, senão `erro`.

## C) Fluxo e estados (`EditarContratante.tsx`)

```text
getUser ─ erro → "erro_sessao" (retry, sem logout)
        ─ null → navigate /login
pref org ausente → /selecionar-organizacao
gate consultarVinculoProprio+vinculoPermiteCadastro ─ negativo/negado → "negado" (zero GET, zero RPC)
                                                    ─ erro → "erro" + retry
GET registro ─ nao_encontrado → "nao_encontrado" | negado → "negado" | erro → "erro"+retry
            ─ ok → "formulario" (versaoLida = versao_registro)
submit ─ validarFormulario falha → aria-invalid, foco 1º campo, zero RPC
       ─ ref síncrono + disabled/aria-busy ("salvando")
       ─ ok → "sucesso" (form desmontado, foco no h2/status)
       ─ conflito → painel de conflito
       ─ duplicado → erro no campo Documento + foco
       ─ invalido → alerta, form permanece | negado → "negado" | erro → alerta genérico, form permanece
```

Leitura via React Query (padrão SYS-05/V1-01), keys `["v103","vinculo",user,org]` e `["v103","contratante",user,org,id]`, sem `placeholderData`. Save via chamada direta (não `useMutation` com retry; `retry:false` em tudo).

Sucesso: `role="status"` "Contratante atualizado com sucesso.", razão social e "Versão N" vinda do retorno do backend; botão/link `Voltar para contratantes` → `/contratantes`. Cancelar no form → `/contratantes`, zero RPC.

## D) Estratégia de conflito (PT409)

- Painel `role="alertdialog"`/região `role="alert"` com título "Este contratante foi alterado por outra pessoa", distinto do alerta genérico. Foco move para o título.
- Sem retry, sem reenviar, sem merge, sem "salvar assim mesmo". Formulário local preservado intacto (campos desabilitados enquanto o painel está aberto, valores visíveis).
- `Recarregar versão atual`: chama `buscarContratante(org,id)` (refetch forçado); só em sucesso substitui formulário + `versaoLida` e mostra aviso "Seus dados locais foram substituídos pela versão atual (versão N). Revise e salve novamente."; foco no aviso; save só por novo clique manual.
- Reload `nao_encontrado`/`negado`/`erro`: mensagem dedicada dentro do painel; formulário e versão locais não alterados; retry do reload disponível em erro.
- `Cancelar`: fecha painel, mantém formulário local como estava, sem chamada, foco volta ao botão Salvar.

## E) Responsividade / A11y

Mesmo layout/tokens de V1-02 (Executive Command Center): coluna única em 390, grid 2 colunas ≥768, largura máxima em 1280/1440, sem overflow horizontal. Um H1 "Editar contratante"; labels associados, `required/aria-required`, `aria-invalid`+`aria-describedby`, foco visível, Enter submete, alvos ≥44px. Tooltips apenas em "Versão do registro" (explica concorrência) — hover+foco e toque, alvo 44×44. Mensagens nunca exibem code/details/hint/stack.

## F) TDD

RED: criar só `src/test/editarContratante.test.tsx`, rodar `bunx vitest run src/test/editarContratante.test.tsx`; falha esperada por módulo ausente. Depois produção (GREEN), mesmo comando até verde.

Casos: sessão null → /login; erro getUser → retry sem signOut; sem org → /selecionar-organizacao; gate negativo → negado com zero `from("contratantes")` e zero `rpc`; GET com colunas exatas + `.eq` org e id; null → não encontrado; 403/42501/PGRST301 → negado (nunca não encontrado); 500 → erro; pré-preenchimento incl. contato; validação local; RPC com 9 args exatos e `p_versao_esperada` = versão lida (ex.: 7, nunca 8); strings vazias `""`; duplo clique → 1 RPC; sucesso mostra versão do backend; PT409 → 1 única RPC, valores locais preservados; reload sucesso substitui form/versão e próxima RPC só após clique usa nova versão; reload 404/negado/erro preserva valores; Cancelar conflito preserva; 23505 → foco Documento; PT422 → form permanece; Cancelar form → /contratantes sem RPC; schema_versao inválida → erro; varredura estática dos novos arquivos: zero `.update(/.insert(/.delete(/.upsert(/functions.invoke/service_role/localStorage`, único `.rpc` = `atualizar_contratante`.

Verificação do BUILD: teste focado, suíte completa, `tsgo --noEmit`, log de build automático, browser controlado 1440/1280/768/390 (sessão simulada, interceptação, sem tocar HML), diff restrito aos arquivos da tabela A.

## G) Teste C posterior (turno separado)

Rota/head, sessão/org, gate, GET, 404 vs denied vs erro, save RPC versão exata, PT409 + reload + cancelar, duplicado/422, quatro larguras, teclado/foco/labels, console, suíte/typecheck/build, Security Scan sem novo Critical, Git limpo. Evidência RLS/PT409 real = backend certificado (9/9); browser = CONTROLADO.

## Lacunas / pontos de atenção

- Sem link "Editar" na lista V1-01 (fora do escopo; exigiria alterar arquivo certificado). Registrar para decisão futura.
- `types.ts` é "gerado"; a edição manual limita-se a refletir a assinatura certificada e pode ser sobrescrita por regeneração equivalente.
- `<html lang="en">` global permanece pendência fora do escopo.
