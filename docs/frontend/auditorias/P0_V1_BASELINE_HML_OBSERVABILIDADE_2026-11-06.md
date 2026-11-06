# P0 V1 — auditoria independente HML, observabilidade e reconciliação de PRs (06/11/2026)

**Escopo:** somente leitura em Supabase HML `gklhhhyosgasnyoxlrui` e documentação no GitHub. **Não é certificado V1, prova de carga, backup/restore nem ensaio SYS-03.** Nenhuma DDL, DML, Auth mutável, reset de senha, criação de conta, Storage, Edge ou PROD nesta rodada.

## Fontes e HEADs

- Frontend: `contaos999999/contaos-hml-control@df6ea5ef3403b7612afa257f105d9d65a7f8c1ce`; CI [42161554610](https://github.com/contaos999999/contaos-hml-control/actions/runs/42161554610) **SUCCESS**.
- Backend: `contaos999999/develop@67668c61054405368d5c7895f5087ccfa9eb9dfc`; CI [42158143278](https://github.com/contaos999999/develop/actions/runs/42158143278) **SUCCESS**.
- Snapshot `docs/frontend/CONTEXT_CANONICO_4_1_SNAPSHOT.json` corresponde ao HEAD backend. Conforme checkpoint anterior, 25 fontes e catálogo 100/97 inalterados. Nenhum novo certificado de versão foi emitido.
- BUILD frontend válido: [PR #183](https://github.com/contaos999999/contaos-hml-control/pull/183), 36 suítes e 921 testes locais PASS, CI [42157723794](https://github.com/contaos999999/contaos-hml-control/actions/runs/42157723794) com dois checks obrigatórios SUCCESS. Não duplicar BUILD.
- Provas nove RPCs: [backend PR #85](https://github.com/contaos999999/develop/pull/85), 377/377 cenários JWT aprovados, com alcance e ressalvas explicitados no relatório fonte.

## Reconciliação de implementações concorrentes, sem reescrever história

- PR frontend [#182](https://github.com/contaos999999/contaos-hml-control/pull/182): **CLOSED sem merge**. Cinco arquivos já possuem implementação e testes mais extensos no main via #183. Branch/commits preservados como histórico TDD RED/GREEN; não mesclar código obsoleto.
- PR frontend [#176](https://github.com/contaos999999/contaos-hml-control/pull/176): **CLOSED sem merge**. Dois casos RED MASTER sem vínculo e negativa 42501 com vínculo legado encontram equivalentes GREEN no main, incorporados pelo PR #177. Branch preservada.
- Nenhuma alteração em tipos congelados, BRAND-01, rotas, RLS, matrizes ou segredo foi feita para encerrar os PRs.

## Releitura independente do estado da segurança do HML

Consultas exclusivamente agregadas, sem exibir identificadores, endereços de email, dados pessoais, tokens ou senhas.

| Objeto / verificação | Resultado SQL |
| --- | ---: |
| Contas de testes com `raw_user_meta_data.scope LIKE 'P0%'` | 56 |
| Contas sintéticas bloqueadas (banned_until futuro) | 56 |
| Contas sintéticas não bloqueadas | 0 |
| Sessões dessas contas em `auth.sessions` | 0 |
| Vínculos ativos dessas contas | 0 |
| Concessões MASTER ativas dessas contas | 0 |
| Ações RBAC distintas (recurso/ação) | 48 |
| Perfis RBAC | 10 |
| Combinações RBAC | 480 |
| `privado.rbac_versoes.versao` | 5 |
| Políticas de `public` citando `rbac_permite` | 52 |
| Nove funções privilegiadas, EXECUTE por `authenticated` | 9 |
| Nove funções privilegiadas, EXECUTE por `anon` | 0 |

Detalhamento das 56 contas sintéticas bloqueadas, por metadado de escopo: `P0-POST-RLS-JWT` (13), `P0-RBAC-BUILD` (14), `P0-RBAC-NINE` (14), `P0-RETRY68` (3) e `P0-V1-RBAC` (12). Metadado serve **somente para identificar fixtures na auditoria**, nunca para conceder autorização. Contas preservadas em quarentena; não reativar nem reutilizar.

**Advisor security (06/11/2026):** nove avisos `authenticated_security_definer_function_executable` continuam presentes porque chamadas autenticadas dessas RPCs são intencionais, com testes JWT individuais sob RBAC. Aviso não foi apagado artificialmente; auditoria funcional documentada não altera o diagnóstico estrutural. Cinco INFO de tabelas privadas com RLS e sem policy permanecem sujeitas a grants negados. Aviso de proteção contra senhas vazadas desabilitada permanece aberto, sem alegar correção.

## Telemetria real agregada do gateway Supabase

Leitura do log `edge_logs` em janela padrão de 24 horas fornecida pelo serviço. A classificação agrupa somente classes de rotas, **sem extrair parâmetros, dados ou identificadores**. Durações abaixo são do cabeçalho `x_envoy_upstream_service_time`, em milissegundos; não representam latência total no navegador.

| Grupo | Requisições | HTTP 2xx | HTTP 4xx | HTTP 5xx | P95 upstream com duração disponível |
| --- | ---: | ---: | ---: | ---: | ---: |
| RPC REST | 1.057 | 550 | 507 | 0 | 272,5 ms (1.036 medições) |
| Auth login/token | 70 | 70 | 0 | 0 | 1.675,8 ms (65 medições) |
| REST outras | 182 | 169 | 13 | 0 | 114,0 ms (157 medições) |
| Outras rotas | 316 | 312 | 4 | 0 | 178,4 ms (305 medições) |

HTTP 4xx não equivale a defeito automaticamente: os testes de autorização exercitam negações intencionais. O recorte não inclui percentis end-to-end, carga simultânea, crescimento, disponibilidade, RPO/RTO, recuperação, logs históricos além da janela ou prova por tela. O P95 de login é superior a 800 ms na métrica upstream observada, mas **não** pode ser usado isoladamente para declarar FAIL ou PASS de RNF sem definição da meta/rota/cenário e medição ponta a ponta. Não houve observação agregada de requisição `/auth/v1/recover` na janela consultada; isto **não comprova** que SYS-03 funcione ou falhe.

## Gates ainda NÃO VERIFICADOS

1. **SYS-03 real:** utilizar exclusivamente identidade HML sintética *nova* com email alias controlado, distinto de contas Auth reais. Testar solicitação, recebimento, link válido, usado/expirado, atualização de senha e novo login; preservar link/tokens somente em meio protegido; teste de envio SMTP deve ser efetivamente executado, não inferido pela presença da caixa Gmail conectada.
2. **Teste C privado/WCAG:** executar com identidade HML própria, autenticação real, quatro larguras (1440,1280,768,390) × claro/escuro, rotas privadas, estados, foco, teclado, contraste, evidência e SHA imutável. Teste C público e mocks não são equivalentes.
3. **RNFs operacionais:** medir latência end-to-end por rota e metas 500/800ms do PRD, observabilidade por amostra, execução concorrente/volume, além de backup/restore **isolado com dados sintéticos e comprovação pós-restauração**. A reconstrução local de schema do workflow `restore-isolado.yml` não basta, por si, para certificar restauração de dados e RPO/RTO.
4. **Rastreabilidade:** reconciliar 486 critérios literais V1 recuperados das fontes com os 488 registros históricos sem apagar nenhum; marcar PASS apenas mediante evidência individual válida. Atômicos 000–024 e RNFs 085–096 seguem obrigatórios.
5. Preservar exclusivamente as três ressalvas anteriormente autorizadas: R01 upload físico E2E, R02 worker E2E, R03 isolamento real entre usuários; não ampliar ressalvas nem converter ausência de prova em PASS.

## Continuidade P0

**Última etapa nova comprovada nesta rodada:** reconciliação segura dos PRs concorrentes; consulta independente da quarentena/versão RBAC/políticas e telemetria de janela de 24h. **Próximo trabalho obrigatório:** preparar gate para identidades sintéticas SYS-03/Teste C privado e ensaio de backup com dados sintéticos, com runner próprio, validação de escopo e cleanup; executar os testes reais antes de certificar. Não repetir 377 JWT já aprovados, nem BUILD #183, nem paridade 126/126. V1 **NÃO CERTIFICADA**, V2 bloqueada, PROD intocada.

## ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE

Auditoria somente-leitura e documento. Sem intervenção Lovable ou custo adicional; sem alterações de código, layout, Brand, rotas, types.ts, Auth, RLS, Storage, Edge ou dados no HML.
