# Integração funcional V1: Fase 3, cadastros e relacionamentos (PLAN/GATE)

> PLAN/GATE documental prévio ao BUILD. Não é certificado de execução e não cria workflow, fixture, usuário nem evidência por si só. Fonte normativa: plano mestre `docs/frontend/planos/PLANO_MESTRE_AUDITORIA_INTEGRACAO_FUNCIONAL_V1_7_FASES.md` (seções 13.5, 16 e 18), aceito integralmente pelo titular e integrado pelas PRs #653 (`fe94015`) e #654 (`58097ad`).

## 1. Entrada e dependências

| Item | Valor |
|---|---|
| Fase 1 | CERTIFICADA, `fase1/CERTIFICADO.md`, inventário de 27 telas e 577 relações |
| Fase 2 | CERTIFICADA, PR #652 (`b2feca7`), ledger v5 52/52 |
| Plano mestre | v1.1 aceito, seção 18 |
| Matriz | `docs/frontend/planos/INTEGRACAO_V1_7_FASES_MATRIZ_EXECUCAO_PROPOSTA.csv`, blob `bb7ce43f9c334f2f03e9aafab405addadfe5e19a`, 138 linhas, coluna `caso_fase3` |
| Baseline main deste PLAN | `58097ad4a0d4126856072bba6dc6e8f5b2994552` |
| Produto HML certificado na F2 | `e6c8cb06dac2a6cdc225b0705ef984ed3e398d97`, deployment `dpl_9t3QDhWhNt1jiTQvewhUKanSm6Dz` |
| HML Supabase | `gklhhhyosgasnyoxlrui`; PROD proibido |

## 2. Decisões do titular nesta conversa (13/11/2026, Bahia)

1. **Organização sintética nova e exclusiva da Fase 3**, criada pelo MASTER via SYS04 (`criar_organizacao`). A organização `e87f7e68-c5ae-4077-943b-02a4afd8b6ee` da Trilha A não recebe mutação; serve apenas de alvo "de outra organização" em negativos de leitura.
2. **Limpeza por isolamento, não por exclusão.** Pela regra constitucional 10, documentos e versões não são apagados. Cleanup = todos os dados da Fase 3 confinados à organização da Fase 3, sessões encerradas (logout comprovado) e inventário final de IDs no relatório. Nenhuma exclusão física.
3. **Autorizado um segundo usuário sintético da HML**, sem perfil inicial, para os 26 casos que partem de ADM01 (`salvar_vinculo_usuario_adm`) e para uso futuro na Fase 5. Credenciais só em secrets do GitHub; nunca em arquivo, log, relatório ou chat.

## 3. Escopo dos casos

São 138 posições `IFV1-F3-Cxxxx`, uma por linha da matriz: 120 OBRIGATORIA (`dados_esperados`) e 18 CONDICIONAL (`auditoria_esperada`, todas com destino V123).

As 138 conexões saem de 20 produtores. Cada produtor é exercido o mínimo necessário, em ordem de dependência. Em seguida cada conexão é observada na tela consumidora de destino.

| Ordem | Origem | Produtor | Conexões |
|---:|---|---|---:|
| 1 | SYS01 | `listar_organizacoes_disponiveis` (login) | 2 |
| 2 | SYS04 | `criar_organizacao` | 1 |
| 3 | SYS04 | `preferencia_de_organizacao_selecionada` | 25 |
| 4 | ADM01 | `salvar_vinculo_usuario_adm` (2º usuário) | 26 |
| 5 | V102 | `contratantes` | 4 |
| 6 | V103 | `atualizar_contratante` | 5 |
| 7 | V105 | `contratos` | 4 |
| 8 | V106 | `atualizar_contrato_v1` | 11 |
| 9 | V108 | `publicar_versao_proposta_v108` | 4 |
| 10 | V107 | `definir_aplicabilidade_fonte_v107` | 7 |
| 11 | V109 | `executar_comando_lista_v1` | 6 |
| 12 | V110 | `criar_documento_contrato_completo` | 3 |
| 13 | V111 | `adicionar_versao_documento_contrato` | 5 |
| 14 | V113 | `criar_competencia` | 9 |
| 15 | V115 | `criar_documento_competencia_v115` | 6 |
| 16 | V116 | `solicitar_analise_competencia` | 5 |
| 17 | V117 | `registrar_revisao_requisito_v117` | 5 |
| 18 | V118 | `aprovar_parecer_interno` | 3 |
| 19 | V119 | `registrar_apresentacao` | 3 |
| 20 | V122 | `registrar_relatorio_historico_hml` | 4 |

A ordem 9→10 (versão proposta antes da aplicabilidade) e as demais dependências finas serão confirmadas no BUILD pelo código das telas. Uma divergência vira emenda deste PLAN, nunca um atalho.

## 4. Semântica de cada caso

Para cada `IFV1-F3-Cxxxx`:

1. **Positivo:** o produtor da origem cria ou associa a entidade sintética pela **interface real**, como o MASTER, na organização da Fase 3. O caso abre a tela de destino, por menu ou rota direta conforme a Fase 2, e confirma por IDs e enums que a entidade aparece vinculada à organização, ao contratante, ao contrato e à competência corretos. A confirmação se repete após recarga.
2. **Negativos, por produtor, aplicados às conexões do produtor:**
   - **referência inexistente:** rota de destino com UUID sintético inexistente deve resultar em estado vazio ou não encontrado, nunca em dado de outra entidade;
   - **relação de outra organização:** rota de destino com ID de entidade da organização `e87f7e68`, sendo a organização da Fase 3 a selecionada, deve ser negada ou vazia, sem vazamento;
   - **duplicidade:** onde o contrato do produtor define unicidade, a segunda tentativa deve ser rejeitada, sem segundo registro.
3. **CONDICIONAL (18, V123 eventos de auditoria):** registrar a condição objetiva (o evento de auditoria do produtor é exibido em V123 para a organização da Fase 3) e decidir `APLICAVEL` ou `N_A_JUSTIFICADO` com fonte no código. `N_A_JUSTIFICADO` exige justificativa e aprovação no certificado e não conta como PASS.
4. **Consumidor de infraestrutura compartilhada** (por exemplo `consultar_permissoes_efetivas`): a prova representativa é a tela de destino refletir o vínculo, sem mutação artificial.

Erros são classificados em `UI`, `VALIDACAO`, `BACKEND` ou `PERMISSAO`. Defeito de produto encontrado exige PLAN de correção separado, sem adaptar o teste.

## 5. Gate quantitativo (seção 16.2 do plano mestre)

- 138/138 posições com estado terminal `PASS`, `FAIL`, `BLOCKED` ou `N_A_JUSTIFICADO`.
- `FAIL = 0`, `BLOCKED = 0`, `PASS = 100%` dos aplicáveis.
- Negativos de todos os 20 produtores aplicáveis executados e bloqueados.
- Zero mutação fora da organização da Fase 3. Zero erro global de transporte, HTTP ou página, salvo exceções já certificadas (logout 204 da R14).
- Logout comprovado ao fim de cada execução.

## 6. Pré-condição externa (ação do titular depois do merge deste PLAN)

O conector Supabase desta sessão não cria usuários de Auth, e inserir em `auth.users` por SQL não é permitido. O titular cria o usuário:

1. Supabase HML `gklhhhyosgasnyoxlrui` → Authentication → Add user: e-mail sintético exclusivo, senha forte, "Auto Confirm User". Nenhum perfil e nenhum vínculo inicial.
2. No GitHub `contaos999999/contaos-hml-control` → Settings → Environments → `hml`, criar os secrets `CONTAOS_HML_SYNTHETIC_2_EMAIL` e `CONTAOS_HML_SYNTHETIC_2_PASSWORD`. A Fase 3 consome **somente o e-mail**; a senha fica reservada para a Fase 5.
3. Informar "usuário criado" na conversa. O agente não lê nem exibe os valores.

Sem isso, os 26 casos de ADM01 ficam `BLOCKED` e a Fase 3 não certifica.

## 7. Arquitetura e arquivos fechados

- **Executor mutante novo**, separado do auditor somente leitura: `scripts/hml/integracao-v1-fase3.mjs` e `scripts/hml/integracao-v1-fase3.test.mjs`. Ele reutiliza do preparador e do auditor (import, sem duplicar) a cerca nativa, o proxy de destino, o login MASTER, a seleção de organização, o logout e o padrão de livro de intenções com recibos `sealed`/`confirmed`/`uncertain`. Cada mutação tem `requestId` idempotente e reconciliação antes de repetir, e nenhuma intenção incerta é reenviada sem readback.
- **Orçamentos:** no máximo 60 intenções de negócio no total da Fase 3 e 30 por execução; prazo de 45 min por execução no job; ledger incremental `fase3/F3_LEDGER.json` append-only com SHA-256 fixado no código (regra C da Fase 2: casos PASS com proveniência compatível são preservados; controles globais nunca são herdados).
- **Workflow:** novo escopo fechado selecionado exclusivamente pelo nonce `integracao-v1-fase3-rel-20261113-r1` no JSON de sete campos de `docs/frontend/auditorias/TRILHA_A_SOLICITACAO_UNICA.json`. A operação é `fixtures`, já existente no protocolo para a trilha mutante (`audit` continua somente leitura); o escopo F3 é resolvido pelo nonce e não amplia o escopo de fixtures da Trilha A. Autoriza-se alterar `.github/workflows/contaos-trilha-a-fixtures.yml` **somente** para: (a) incluir os dois novos caminhos no filtro `paths`; (b) expor `CONTAOS_HML_SYNTHETIC_2_EMAIL` ao job `hml` como env; (c) invocar o novo executor quando o escopo F3 for resolvido pelo request. Nenhuma outra mudança de YAML, permissão ou environment.
- **Artefatos:** `F3_CASES.json` (catálogo derivado da matriz, conferido por SHA-256), `F3_REPORT.json` (recibo por caso com os campos da seção 16.2: `caseId`, `sourceConnectionId`, `phase`, `origin`, `destination`, `classification`, `applicability`, `operation`, `expected`, `observed`, `status`, `frontendSha`, `backendSha`, `harnessSha`, `deploymentId`, `workflowRunId`, `artifactId`, `sha256`, `reviewId`, `cleanupStatus`) e `SHA256SUMS`. Só IDs, enums, contadores e booleanos: sem DOM, texto livre, HTML, PNG, HAR, cookie, JWT, credenciais ou e-mail.
- **Resultados e certificado:** `docs/frontend/auditorias/integracao-funcional-v1/fase3/**`, entrada em `PLANO_ATIVO.json` e prefixo no checkpoint `ESTADO_E_RETOMADA_CONTAOS_4_1.md`.
- **Proibidos:** `src/**`, `src/integrations/supabase/types.ts` (LOCK), `src/routeTree.gen.ts`, dependências e lockfile, backend, SQL, RLS, RPC, Auth config, Storage, Edge e PROD. Supabase só leitura por este agente.

## 8. Sequência governada

1. **PLAN (este documento):** PR documental, revisão independente, checks, merge protegido e readback.
2. **Pré-condição do titular** (seção 6).
3. **BUILD:** executor, testes, ajuste de YAML autorizado e catálogo `F3_CASES.json`. TDD RED→GREEN com negativos de protocolo: nonce antigo, consumido, desconhecido ou manual; escopo forjado; caso fora da matriz; catálogo incompleto, duplicado ou com hash divergente; falso PASS; campo livre ou credencial em relatório; intenção além do orçamento; mutação em organização diferente da F3; reenvio de intenção incerta sem readback. Suíte completa, lint, 18 nativas, checks no mesmo HEAD, revisão independente e merge.
4. **Pins:** deployment HML fixado por SHA (Ignored Build Step) e ledger inicial vazio com SHA fixado.
5. **REQUEST:** JSON de sete campos com pai igual ao merge do BUILD, revisão canônica JSON como última review no HEAD, merge com merge commit. Execução Auth automática attempt 1, sem dispatch, rerun ou cancelamento.
6. **Evidência:** download e verificação do artefato (CRC, `SHA256SUMS`, schema, catálogo), ledger atualizado por PR. Falha parcial preserva os PASS e abre sucessor só por novo PLAN, BUILD ou REQUEST, com novo nonce.
7. **Certificado da Fase 3:** 138/138 terminais conforme a seção 5, revisão independente do artefato e certificado integrado por PR protegido com readback.

## 9. Riscos e limites

- **V116 (`solicitar_analise_competencia`)** pode depender de worker ou filas (R-02). A Fase 3 prova o vínculo criado e observável; o fluxo completo do worker continua na Fase 6. Se o vínculo depender de conclusão assíncrona, o caso registra a condição e o PLAN é emendado.
- **V122 (`registrar_relatorio_historico_hml`)** é produtor específico de HML; a mutação permanece na organização da Fase 3.
- Upload físico (R-01) não é exigido; documentos usam o caminho mínimo aceito pela tela. O upload E2E continua na Fase 6.
- Isolamento completo entre organizações e perfis (R-03) é da Fase 5; aqui só há negativos de leitura sem vazamento.

## 10. Rollback

Rollback por PR dos arquivos do BUILD. Dados já criados permanecem isolados na organização da Fase 3, sem exclusão, e são inventariados no relatório. Nonce consumido nunca é reutilizado.

## ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE

Somente instrumento de auditoria e documentação; marca ContaOS Brand v1.0, Design System e assets preservados. Impacto visual N/A. Nenhum uso do agente Lovable.
