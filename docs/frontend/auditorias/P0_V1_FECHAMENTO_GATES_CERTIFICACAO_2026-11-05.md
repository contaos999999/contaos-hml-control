# ContaOS 4.1 — Dossiê P0 de fechamento verificável da Versão 1
Data de corte: 05/11/2026, Brasil. Escopo exclusivo HML/frontend e registros GitHub. Documento **não é certificado de produção** nem declaração de testes não executados.

## 1. Decisão expressa do titular
O titular solicitou concluir e certificar V1 com **exatamente três ressalvas** admitidas, sem rebaixar os demais requisitos:
- R-01 — upload real ponta a ponta (arquivo, armazenamento e retorno real).
- R-02 — processamento efetivo do worker/filas em fluxo real.
- R-03 — isolamento real entre usuários, inclusive ensaio autenticado multiusuário.

Status dessas três: `RESSALVA_ACEITA_TITULAR / PROVA_REAL_NAO_EXECUTADA`. A dispensa não significa `PASS_REAL` e não equivale a autorização para PROD ou teste inseguro.

**Decisão técnica atual:** `NO_GO_CERTIFICACAO_INTEGRAL_V1` porque existem outros critérios obrigatórios não comprovados, descritos abaixo, para os quais o titular **não concedeu dispensa**. Regra P0 da ordem V1→V5 continua ativa; V2 bloqueada. Não alterar `certificacao_versionada_v1` para PASS sem termo fundamentado e PR/CI integrado.

## 2. Referências e evidências que efetivamente passaram
| Item | Prova | Classificação |
| --- | --- | --- |
| Frontend V1-23, permissões Usuários/Auditoria | PLAN #142, CI 42023718476 SUCCESS; BUILD #143, CI 42024071024 SUCCESS e merge `3949d90c090267b18c39af37a13936598f3cedde` | PASS_BUILD |
| 35 suites/883 testes anteriores | CI 42024071024; 883/883 PASS | PASS_VITEST |
| Troca de organização na mesma rota, sem autorização obsoleta | PLAN #144, CI 42026152943 SUCCESS, merge `c332e8d2a6a7a7cf28cb2c8b123ce9c966957aba`; BUILD #145, CI 42026795811 SUCCESS, merge `2c39c06c606c942e8d89180c3f0f6649add5cacf` | PASS_BUILD |
| 35 suites/886 testes após correção | Run 42026795811, 886/886 PASS; Teste C independente SUCCESS | PASS_VITEST_E_TESTEC_PUBLICO |
| Main e regras de merge | Ruleset #26495643 `ContaOS-Zero-Drift-main` ativo, `~DEFAULT_BRANCH`, pull_request, status checks, non_fast_forward e deletion | PASS_RULESET |
| Sincronização Lovable/GitHub | `Lovable.get_project` identificou projeto `b113dd59-6caf-4c92-8302-457a037a0c6f`, `latest_commit_sha` exatamente igual a `2c39c06c606c942e8d89180c3f0f6649add5cacf` | PASS_SNAPSHOT_SINCRONISMO |
| Supabase HML e capacidade Auditoria | Ref `gklhhhyosgasnyoxlrui`, PostgreSQL 17.11, 0 tabelas públicas sem RLS na consulta; `pode_consultar_auditoria_organizacao` com EXECUTE anon=false, authenticated=true | PASS_ESTRUTURAL (não prova RLS autenticada) |
| Contraste público | GOV-014 120/120 elementos AA por medição pixel; não abrange telas privadas | PASS_ESCOPADO_PUBLICO |
| Evidências Teste C arquivadas | GOV-010 atestou dois ZIPs originais e respectivos hashes presentes na Biblioteca em 04/11, sem garantia de retenção permanente; Teste C atual mantém artefato Actions temporário | PASS_ARQUIVAMENTO_PONTUAL |
| Backend | `contaos999999/develop` main `3aa4af7a292b80243045e0a426ee6399ba948ff2`, CI Zero-Drift 42013508780 SUCCESS | PASS_CI_BACKEND |
| P0 sequência V1 | scripts/p0-version-order-gate.mjs, 100 regulares e 97 atômicos mantidos sem renumeração | PASS_POLITICA (não é certificado de cobertura integral) |

### Limitações materiais das provas
Teste C de 24 cenas públicas por quatro larguras e dois temas é uma execução real de navegador **sem autenticação**; não é prova visual/acessibilidade da experiência privada. O Teste C e Vitest não substituem a verificação operacional de SYS-03, NFR nem a evidência por critério. O histórico backend `96/96` de 02/11 é HML escopado e não resolve automaticamente os NFRs amplos do DOCX original.

## 3. Itens NÃO dispensados que impedem o termo final
| ID | Lacuna ainda aberta | Condição para aprovação |
| --- | --- | --- |
| B-01 | SYS-03 (PROMPT 18): recuperação real de senha, com entrega de e-mail, link válido/expirado/reutilizado e novo login. Backend issue #33. Não se confunde com R-03. | Conta HML de teste e caixa sob controle do titular; evidências sanitizadas. Não enviar senha/token ao GitHub, chat ou logs |
| B-02 | WCAG/BRAND-01 em telas privadas autenticadas: foco, teclado, leitor de tela, contraste e estados dinâmicos; 160 combinações protegidas fora dos testes públicos. Backend issue #34, fronteira não coberta por R-01/R-02/R-03. | Teste C autenticado e relatório com artefatos/hash por viewport; preservar marca |
| B-03 | Matriz retroativa dos PROMPTs 00–42 e atuais 43/75 por critério; versão de 03/11 tem 416 critérios nos PROMPTs 00–38, sendo 218 `NÃO_VERIFICADO_INDIVIDUALMENTE` no snapshot histórico. Parte das provas pode ter sido produzida posteriormente, mas **não houve reconciliação individual de 100% dos critérios nesta rodada**. | Cruzar cada critério com prova recente + SHA e registrar PASS real, PASS escopado ou N/A justificado, sem inferência |
| B-04 | Auditoria NFR-001..012, issue backend #36: meta original p95 leitura <=500ms e comando <=800ms não corresponde ao limiar legado k6 p95<1000; saturação de pool, alertas, backup/PITR/RPO, caos e disponibilidade sem prova suficiente. R-01/R-02 podem cobrir apenas os respectivos cenários de upload/worker, **não o restante dos NFRs**. | Plano canônico RNF, ensaio real de carga/backup e observabilidade, evidências e limites separados |
| B-05 | Segurança: Supabase Advisor HML relata 9 avisos WARN `authenticated_security_definer_function_executable` e 1 WARN `auth_leaked_password_protection`. As 9 funções estão bloqueadas para `anon`, autorizadas para `authenticated`, com `search_path` vazio; quatro são invólucros para funções privadas. **Aviso não é, por si só, vulnerabilidade**, porém ainda falta conclusão por função das validações de acesso e configuração de proteção de senha. | Revisão de risco e do helper privado sem DDL improvisado; saneamento apenas sob PLAN específico; configurar política Auth por canal autorizado e rever Advisor |
| B-06 | Recuperação real Auto-Lock após drift em condições efetivas e recuperação/versionamento durável além da retenção dos artifacts; GOV-010 só comprova arquivamento pontual. | Ensaios controlados de recuperação e restauração de evidência, com PR/CI e hashes, nunca alterar blob types certificado sem autorização |
| B-07 | Homologação operacional final de BR/teclado, links diretos, perfil e transição, fora dos mocks. Não presumir pass de JWT real pelo teste unitário. A parcela estritamente 'isolamento entre usuários' fica em R-03, **mas testes que não envolvem esse isolamento continuam exigíveis**. | Resultado e evidência em HML com identidades controladas, não necessariamente dois usuários para fluxos individuais |

## 4. Estado atual e medidas já tomadas
- Corrigido risco de privilégios obsoletos no menu após troca de organização mesmo mantendo a rota. A função de preferência local emite evento somente ao trocar valor; o AppShell invalida gerações de requests pendentes e reconsulta permissões. Sem confiar no storage como autorização; RLS permanece autoridade.
- PR #145 passou Zero-Drift, escopo, typecheck, build, Vitest 886/886 e Teste C independente. Main pós-merge `2c39c06c606c942e8d89180c3f0f6649add5cacf`. Run de confirmação pós-merge `42027384536` estava em fila na primeira consulta, acompanhar até conclusão antes de certificar.
- Issues frontend #10 e #16 sobre regras de branch encerradas após confirmar diretamente ruleset ativo e controles do GitHub. Issues sobre E2E/Auth/contraste/segurança continuam abertas por ausência de prova final.
- Consulta HML de 05/11: 3 usuários Auth, 4 organizações, 0 contratos e 1 vínculo ativo. Essas contagens não contêm identificação de pessoas; não foi criada fixture nem alterado backend ou produção.
- Lovable identificou sincronização exata com o HEAD da main no instante da verificação.
- Supabase HML sem modificações. Nenhum segredo exposto.

## 5. Sequência de fechamento SEM solicitar novas dispensas
1. Proteger a situação já aprovada, confirmar dois checks pós-merge e arquivar evidências do novo HEAD.
2. Executar SYS-03 E2E com uma conta fictícia e caixa de correio controlada, usar links sem compartilhamento de tokens. Se indisponível, manter B-01 como bloqueio real e registrar pré-requisito.
3. Executar auditoria privada acessível do Teste C/axe e teclado com sessão HML controlada; sem sessão não marcar como executado.
4. Consolidar integralmente os critérios V1, 12 NFRs e avisos de segurança por evidência, usar classificação item a item, corrigir falhas efetivas sob PLAN/BUILD próprios.
5. Verificar recuperação Auto-Lock, arquivo de evidências e restauração, com data/sha/artefatos.
6. Somente com todos B-01..B-07 resolvidos e apenas R-01..R-03 pendentes, emitir `CERTIFICADA_V1_COM_3_RESSALVAS` por PR, CI com dois checks verdes e HEAD confirmado; preservar bloqueio de PROD e manter as ressalvas para o gate futuro de produção.

## 6. Fontes rastreáveis
- Frontend PRs [#142](https://github.com/contaos999999/contaos-hml-control/pull/142), [#143](https://github.com/contaos999999/contaos-hml-control/pull/143), [#144](https://github.com/contaos999999/contaos-hml-control/pull/144), [#145](https://github.com/contaos999999/contaos-hml-control/pull/145).
- CI [42026795811](https://github.com/contaos999999/contaos-hml-control/actions/runs/42026795811) e [42024620823](https://github.com/contaos999999/contaos-hml-control/actions/runs/42024620823).
- Backend [issue #33](https://github.com/contaos999999/develop/issues/33), [#34](https://github.com/contaos999999/develop/issues/34), [#36](https://github.com/contaos999999/develop/issues/36), norma `docs/prompts/P0_PRIORIDADE_ZERO_ORDEM_POR_VERSAO_4_1.md`.
- Frontend `docs/frontend/auditorias/GOV_014_MEDICAO_CONTRASTE_2026-11-04.md`, `docs/frontend/auditorias/GOV_010_ATESTADO_TECNICO_ARQUIVAMENTO_2026-11-04.md`, `docs/frontend/ESTADO_E_RETOMADA_CONTAOS_4_1.md`.
