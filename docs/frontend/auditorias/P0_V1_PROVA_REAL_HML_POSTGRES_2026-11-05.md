# ContaOS 4.1 — prova real de banco HML via DATABASE_URL existente
Data: 05/11/2026. Escopo: PostgreSQL de homologação, somente leitura. Referência Supabase: `gklhhhyosgasnyoxlrui`.

## Fonte e autorização
O titular confirmou que `CONTAOS_HML_DATABASE_URL` já estava disponível nos GitHub Actions Secrets e autorizou a execução automática das provas reais em HML, sem expor o valor. O ambiente `hml` foi utilizado; nenhum secret foi criado, copiado para PR ou revelado.

- Frontend PR [#164](https://github.com/contaos999999/contaos-hml-control/pull/164) mesclado na main em `6281e05f9bcc9462625d92666917d0371e9d707a`, CI de PR [42064495566](https://github.com/contaos999999/contaos-hml-control/actions/runs/42064495566) com ambos required checks SUCCESS.
- Workflow live HML: [42064796959](https://github.com/contaos999999/contaos-hml-control/actions/runs/42064796959), job `127375836160`, `SUCCESS`. Usou `DATABASE_URL: ${{ secrets.CONTAOS_HML_DATABASE_URL }}`, `PGSSLMODE=require`, validação de host/scheme/user/ref/port/path e conexão real `psql`.
- SQL canônico: `tests/hml/p0-v1-live-db-guards-readonly.sql`, executado por `.github/workflows/contaos-p0-v1-live-db-hml.yml` sob três `BEGIN TRANSACTION READ ONLY` com `ROLLBACK`; sem qualquer DDL/DML, sem uso PROD.

## Resultados operacionais verificados no log
| Verificação | Resultado real |
| --- | --- |
| Acesso ao Session Pooler HML via secret já existente | PASS — `SELECT 1` autenticado no PostgreSQL |
| SECURITY DEFINER no schema public | PASS — 32 totais; 9 executáveis por `authenticated`; 0 por `anon` |
| `search_path` das nove funções privilegiadas | PASS — fixado como vazio na configuração da função |
| RLS em tabelas `public` e `storage` | PASS — nenhum objeto `pg_tables` com `rowsecurity=false` |
| Bucket documental e view sensível | PASS — `contaos-documentos.public=false`; `v_central_excecoes_financeiras` com `security_invoker=true` |
| Nove RPCs chamadas realmente sob `SET LOCAL ROLE anon` | PASS — 9/9 rejeitadas com SQLSTATE `42501`; não houve escrita |
| Role `authenticated` sem JWT | PASS — `auth.uid() IS NULL`; prova negativa de ausência de identidade, **não é um login Auth** |
| Mutação persistente ou mudança PROD | NÃO EXECUTADA; read-only e três `ROLLBACK` |

**Frase conclusiva do log:** `P0_V1_DB_HML_REAL_READONLY_PASS: catalog, 9 anon denials, missing JWT correctly distinguished`.

## Limites obrigatórios da evidência
- Conectar ao banco com `CONTAOS_HML_DATABASE_URL` demonstra autenticação PostgreSQL. **Não gera JWT nem substitui uma sessão autenticada emitida pelo Supabase Auth.**
- Testes HTTP reais sem login (9/9 negativas/ocultação) já foram executados em [42063335906](https://github.com/contaos999999/contaos-hml-control/actions/runs/42063335906), mas o job geral **falhou fechado** porque `CONTAOS_HML_TEST_EMAIL` e `CONTAOS_HML_TEST_PASSWORD` ou `CONTAOS_HML_SERVICE_ROLE_KEY` não estavam disponíveis no environment `hml`.
- O conector Supabase disponível não oferece ação direta para emissão/provisionamento de token de usuário em Auth, e GitHub não dispõe de mutação de Secrets nesta conexão. O titular autorizou testes automáticos, mas isso não equivale a fornecer ou criar secret inexistente.
- Para executar `B02`, configurar via UI do GitHub apenas credenciais sintéticas autorizadas na sessão de homologação, **sem divulgar valores aqui**; o workflow `contaos-p0-v1-jwt-real-hml.yml` está integrado e executa quando há segredo disponível. Para testes positivos por perfil, também vincular perfis/fixtures sintéticos via API oficial e registrar resultados. O simples login temporário sem perfil não satisfaz `B02` integralmente.
- A ressalva R03 sobre isolamento multiusuário continua separada; não confundir com autorização entre perfis dentro da mesma organização.

## Estado de certificação e continuidade
`PASS_B01_POSTGRES_SQL_REAL` — evidência completa no escopo do banco (conexão, ACL anon, RLS e busca fixa). `B02_JWT_PENDENTE_IDENTIDADE_SINTETICA` — sem falsa certificação. As três ressalvas R01 upload real, R02 worker real e R03 isolamento real continuam aceitas, não testadas. Aviso Auth de senha vazada permanece exceção de plano Free, não corrigido. A V1 global não está certificada; PROD intocada; V2 bloqueada.

**Próxima ação:** após disponibilizar exclusivamente credenciais de identidade sintética HML por fluxo seguro, executar matriz de JWT/perfil real das nove RPCs, preservar relatório expurgado e reconciliar as demais provas V1. Não repetir o teste PostgreSQL já aprovado, exceto se houver drift de schema/roles.

## ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE (OBRIGATÓRIO)
Registro de evidência somente documental, sem código de frontend, BRAND-01, AppShell, assets, RPCs, banco, Auth, types congelados ou PROD.
