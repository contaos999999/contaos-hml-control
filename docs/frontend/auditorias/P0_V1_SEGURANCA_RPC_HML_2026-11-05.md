# P0 V1 — análise de risco e provas das 9 RPCs privilegiadas HML
Data: 05/11/2026. Inspeção direta do Supabase **HML** `gklhhhyosgasnyoxlrui`, banco PostgreSQL 17.11. Sem DDL, sem dados sintéticos, sem Auth real e sem PROD.

## Decisão de segurança
O Security Advisor reportou nove avisos `authenticated_security_definer_function_executable` (WARN). Eles existem porque essas RPCs **intencionalmente** atendem `authenticated` e rodam com `SECURITY DEFINER`. O simples aviso não é prova de vulnerabilidade. Remover todos os EXECUTE sem modelar outra API quebraria a aplicação; converter wrappers para INVOKER sem conceder schema privado quebraria permissões, e conceder EXECUTE direto ao schema privado seria incompatível com privilégio mínimo.

## Evidência por RPC
| Função public | Papel da guarda | Negativa efetiva `anon` | Helper privado (MD5 de definição) |
|---|---|---|---|
| `adicionar_versao_documento_competencia_v115` | public -> privado | PASS: execução negada 42501 | 83f3b8de460f1ef0ed21a6605acb4a98 |
| `criar_documento_competencia_v115` | public -> privado | PASS: execução negada 42501 | 0f88b21681ddb3a33618be0f9a569c11 |
| `enfileirar_ingestao_historica_hml` | guarda direta | PASS: execução negada 42501 | não aplicável |
| `obter_analise_competencia_v116` | guarda direta | PASS: execução negada 42501 | não aplicável |
| `obter_detalhe_requisito_v117` | guarda direta | PASS: execução negada 42501 | não aplicável |
| `obter_documentos_competencia_v115` | public -> privado | PASS: execução negada 42501 | df6b4bf3a6061b68593e2c5b5304945a |
| `obter_visao_geral_competencia` | public -> privado | PASS: execução negada 42501 | 444993d03e36b81f03202f92316e5284 |
| `registrar_relatorio_historico_hml` | guarda direta | ACL PASS; teste direto não executado (limitação da ferramenta) | não aplicável |
| `vincular_tratamento_historico_hml` | guarda direta | PASS: execução negada 42501 | não aplicável |

**Resultado:**
- Auditoria PostgreSQL por catálogos `pg_proc` e ACL: **9/9** RPCs: `anon EXECUTE=false`, `authenticated EXECUTE=true`, `search_path` vazio. Nenhuma delas ficou pública a usuário não autenticado.
- Chamadas reais SQL sob `SET LOCAL ROLE anon` em transação READ ONLY: **8/9** bloquearam com SQLSTATE 42501, conforme o desenho previsto. A chamada negativa de `registrar_relatorio_historico_hml` foi bloqueada pelo controle de segurança da ferramenta, não pela função; não relatar PASS dinâmico dessa chamada.
- Quatro wrappers públicos delegam a funções `privado`: cada helper tem `anon EXECUTE=false` e `authenticated EXECUTE=false`, `search_path` vazio e verificações de `auth.uid()`, perfil e contrato; três helpers também exigem sessão ativa. O quarto (`obter_visao_geral_competencia`) usa uid + contrato + perfil.
- Cinco funções com validação direta verificam identidade e contexto de acesso. Classificação: **guarda estática identificada**, não equivalência com JWT autenticado real.
- 117 tabelas públicas e 0 sem RLS, 183 policies públicas, constatado no HML. Não equivale a testes A/B do titular.
- A exceção do décimo WARN é `auth_leaked_password_protection`, que depende de recurso Pro/above e permanece FORA do escopo técnico por decisão expressa do titular; verificar quando houver elegibilidade, sem assinalar PASS.

## O que foi resolvido e o que não pode ser inventado
**PASS de configuração/negativa sem sessão:** ACL, ausência de `anon` no conjunto de nove, search_path, guards dos helpers e oito negativas 42501.

**Não comprovado:** execução positiva de cada função com identidade HML de teste, negativas de perfis internos, revogação de sessão, concorrência, cross-tenant; sobretudo não declarar que o isolamento multiusuário (R-03) foi testado. Falta ambiente controlado para esses cenários, ainda que a presença das guardas torne o desenho consistente. Como não há indício de falha de configuração nos testes executados, **nenhuma migration insegura ou ad hoc foi feita**.

## Política de decisão
- Os nove WARN podem permanecer enquanto as funções forem a API intencional de negócio com guarda de identidade. Tratar cada uma como **exceção de projeto monitorada** com nova revisão se houver alteração de DDL, ACL, schema, Auth ou helpers.
- Se um futuro teste autenticado demonstrar bypass, abrir PLAN backend, teste RED e corrigir antes de liberar V1/PROD.
- Não transpor o status estrutural para `SEGURANCA_100_PASS`: a certificação integral depende dos ensaios operacionais não abrangidos pelas ressalvas.
- Referências Supabase: https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable e https://supabase.com/docs/guides/auth/password-security.


## Ensaio adicional read-only: papel authenticated sem JWT

No Supabase HML foram executadas consultas SQL em transação `READ ONLY`, com `SET LOCAL ROLE authenticated`, **sem qualquer JWT** e usando UUID inexistente e fixo. Resultado:

| RPC | Resposta | Interpretação restrita |
| --- | --- | --- |
| `obter_detalhe_requisito_v117` | 42501 acesso negado | PASS de negativa sem sessão |
| `enfileirar_ingestao_historica_hml` | P0001 Sessão necessária | PASS de negativa sem sessão |
| `obter_analise_competencia_v116` | PT404 competência não encontrada | Consulta retorna inexistência antes da guarda; não demonstra autorização de identidade real |
| `obter_documentos_competencia_v115` | PT404 competência não encontrada | Mesma limitação |
| `obter_visao_geral_competencia` | P0001 competência não encontrada | Mesma limitação |

Os resultados não equivalem a E2E JWT e nem a prova de bloqueio de todos os perfis. A verificação de ausência de dados por UUID inexistente é limitada e não constitui teste de uma linha existente. Nenhuma gravação executada.

**Fechamento da frente segurança:** `PASS_CONFIG_ACL_E_NEGATIVAS_DISPONIVEIS; PENDENTE_AUTORIZACAO_AUTENTICADA`. O alerta de senhas vazadas permanece excepcionalmente fora do escopo por decisão do titular, sem marcar remediado.

## ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE (OBRIGATÓRIO)
Auditoria somente leitura, sem impacto em BRAND-01, sem build Lovable, sem toques em HML/PROD, types imutável. Evidência por função acima é reprodutível com `pg_proc`, `has_function_privilege` e consultas controladas; nenhum token/senha armazenado.
