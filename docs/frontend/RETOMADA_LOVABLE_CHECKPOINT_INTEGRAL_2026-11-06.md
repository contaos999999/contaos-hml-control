# ContaOS 4.1 — checkpoint integral e roteiro de retomada pelo Lovable
Registro: 06/11/2026, America/Bahia (evidências técnicas com timestamps de 07/11/2026 UTC).
Natureza: documentação de continuidade e plano de transição do executor. NÃO é certificado, deploy, teste novo nem alteração de controles.
Autorização: pedido do titular nesta conversa para registrar detalhadamente no GitHub onde paramos, a ordem por prioridade e a retomada do frontend pelo Lovable substituindo GitHub Actions.

## 1. Decisão operacional e limites precisos
O titular escolheu retornar ao agente Lovable para desenvolver o frontend. Esta decisão substitui a preferência anterior de ADR-DEV-001 que reservava BUILD ao editor GitHub. GitHub permanece repositório e trilha de versionamento; Supabase próprio permanece o único backend; não migrar dados para Lovable Cloud.
Separar quatro funções: editor (Lovable), versionamento (GitHub), execução de testes/deploy (executor a demonstrar), proteção de merge (ruleset GitHub). Trocar editor não substitui automaticamente as outras três.
Objetivo: conduzir todo o escopo pelo Lovable, reutilizando 100% do planejamento e das provas válidas. A capacidade de executar 100% das tarefas, especialmente PostgreSQL/Docker/restore/JWT e emissão de checks de PR, NÃO foi demonstrada. Não prometer equivalência automática.
Aprovação da mudança de editor não autoriza remover checks, criar aprovação fictícia, desativar ruleset, afrouxar RLS, expor secrets, reescrever migration ou chamar teste do próprio BUILD de revisão independente. A transição deve preservar critérios e demonstrar o novo executor antes de substituir formalmente o antigo.
Esta rodada registra e prepara a retomada. Não inicia BUILD no Lovable, não altera Knowledge, branch protection, workflows, Auth, banco ou produção.

## 2. Endereços e baseline imutável
| Elemento | Referência confirmada |
|---|---|
| Frontend | contaos999999/contaos-hml-control, main |
| Frontend HEAD consultado | 71362700c83adf438170c2fe9ed35f79601472e7, merge PR249 |
| Último BUILD funcional frontend | PR248, HEAD 0af23c4e55895f33269f7b7a987ef9fd14a05eee, merge 23d120f94e295f8031ade24ab785eaa39343c070 |
| Backend/normas | contaos999999/develop, main |
| Backend HEAD consultado | 4fec09bf5cab5afc776192b9bef6e70728e1a058, merge PR96 |
| Backend PR96 HEAD | be4a64c09db90f622be1858ec5780a90e3ca62c3 |
| Supabase HML exclusivo | gklhhhyosgasnyoxlrui |
| Lovable projeto existente | b113dd59-6caf-4c92-8302-457a037a0c6f |
| Editor | https://lovable.dev/projects/b113dd59-6caf-4c92-8302-457a037a0c6f |
| Preview informado pela API | https://id-preview--b113dd59-6caf-4c92-8302-457a037a0c6f.lovable.app |
| Lovable latest_commit_sha informado agora | 6b0343b2be5009a13f54a99e897ab27e410c9853 |
| Lovable agentFinished informado | true; estado do projeto ready |
| types.ts blob congelado | 8ea7750b75fd9d76b29c36ce7613392e3ab65e19 |
| Fingerprint canônico backend | c5dc0a97dd3a371fbdfbbd425c3fd31089e2d82f7c51a7458f0ecaedc2330088 |

HEADs mudam após novos commits. Na retomada, obter refs reais de main, não inferir HEAD por busca de commits. Os SHAs acima são baseline desta consulta.
A API Lovable informa SHA diferente do GitHub: paridade de fonte/branch NÃO COMPROVADA. Metadados podem estar atrasados; não afirmar que o editor perdeu código nem fazer reset por isso. Comparar arquivos reais e branch conectada antes do primeiro BUILD. NÃO desenvolver sobre 6b0343b2 antes de reconciliar com 71362700 e preservar PRs228–249.

## 3. Onde paramos exatamente
1. Código de listas versionadas aprovado/integrado no backend PR96.
2. Restore isolado da main run42321620622 e Zero-Drift main42321620487 foram observados com sucesso no navegador autenticado.
3. Orquestrador ContaOS CRUD Listas HML run42321885307 falhou ANTES de iniciar o job canonical-deploy. A anotação observada foi: “The job was not started because recent account payments have failed or your spending limit needs to be increased.”
4. Houve retry e a mesma anotação foi observada. Consulta mais recente desta rodada: canonical-deploy failure, job128268995016; real-jwt skipped, job128269004178. O conector só confirmou estados, não forneceu nova anotação.
5. Isto comprova bloqueio relacionado ao sistema de cobrança na tentativa observada. NÃO comprova dívida, cartão recusado, orçamento exato nem franquia esgotada. Nenhum dado financeiro foi alterado.
6. Última leitura HML disponível nesta conversa: migration20261106230839 aplicada; migration20261107001620 ausente. Atualizar leitura antes de qualquer deploy, pois estado remoto pode mudar.
7. Portanto: novas APIs de listas não comprovadas em HML; JWT listas não executados; frontend de gestão de listas ainda não liberado para operação.
8. Última etapa comprovada: BUILD backend de listas integrado + diagnóstico do bloqueio externo. Próxima tarefa: reconciliar fonte Lovable/GitHub e demonstrar executor equivalente; depois implantar migration exata e executar JWT antes de integrar UI listas.
9. CRUD GLOBAL INCOMPLETO; V1 NÃO CERTIFICADA; V2–V5 e PROD não liberadas.

## 4. Registro do que já foi entregue: não refazer
Os resultados abaixo vêm dos checkpoints/manifestos consultados; preservar seus limites. Código, CI, SQL simulado, JWT HTTP e UI autenticada são provas diferentes.
| Entrega | Evidência e resultado documentados | Limite |
|---|---|---|
| Sidebar/AppShell, sessão e menu | histórico PR98–114 e correções posteriores | Não presumir WCAG privado integral |
| Matriz RBAC frontend | PR183 merge ead42939425b9369ca5f23f361f749894b6bc635; CI42157723794 | Não remover matriz nem hardcodar MASTER |
| RBAC backend e nove RPCs | provas reais JWT377/377; merge normativo67668c61054405368d5c7895f5087ccfa9eb9dfc | Criação documental positiva usou replay; upload/worker não certificados |
| Lista contratos/contratantes navegáveis | PR228 merge7e300a2e430bf2f2e99c202638bdfb2aab9844a5; CI42273689419 | UI privada posterior ainda deve ser comprovada |
| Padrão visual/header organizacional global | PR229 mergec8797e50efeb2ff92809f6cf3f7a43181374eee9; CI42280224929 | PR226 antigo fechado sem merge; NÃO reaplicar sua branch |
| Apresentação → protocolo | PR230 merge23a5abe5b6bbc85eddb720d2f6a1401f5be671a7; CI42281441878 | Preservar pacote/snapshot do backend |
| Competência → documentos/análise | PR231 merge4fc0b9f0e5a1ac0a0519194f0fe939dbb347c767; CI42282432096 | Ações condicionadas ao allowed_actions |
| Plano CRUD transversal | PR233 merge371eeeb0a416f17d4acafa143bcad5f895782046 | Abrange todos os cadastros permitidos, por versão |
| Editar contratante com capacidade backend | PLAN234/BUILD235; mergec782188fc48fe907027242b014d8ab22f2de97af; CI42304938668;949 testes | Lint legado tinha dívida de formatação |
| Criar organização pelo frontend | PLAN237/BUILD238; mergeaf23f3afa87e6331573f4870e22a58bcddfe8b1f; CI42307438846;961 testes | criar_organizacao sem chave idempotente: não retry cego |
| Nova competência por capacidade efetiva | PLAN239/BUILD240; mergecd13443bc26ba48482f35c709cef5fb3ee313963; CI42308147045;966 testes | Preservar snapshot, contrato/org e MASTER sem vínculo local |
| Capacidades contratos/histórico | PLAN242/244 e retificações; BUILD247 merge73d870e2e00a9c0225b31590ee1d5a6dcf13db29;42 testes;974 regressão | BUILD245 foi substituído; não ressuscitar |
| Backend cadastros org/contrato | PLAN90/92, BUILD91, fixes93/94; deploy42314729963, JWT42314717439=50/50 | UI privada não decorre de JWT API |
| Frontend editar/transicionar org/contrato | PR248 merge23d120f94e295f8031ade24ab785eaa39343c070; CI42316728042;1017/1017 em39suítes;tsc/build | Teste C público, UI privada NÃO VERIFICADA |
| Checkpoint frontend | PR249 integrado71362700c83adf438170c2fe9ed35f79601472e7 | Suas linhas antigas de próxima lacuna backend foram superadas pelo PR96 SOMENTE em Git |
| Backend listas | PLAN95/BUILD96, merge4fec09bf5cab5afc776192b9bef6e70728e1a058 | HML deploy/JWT pendentes |
| Restore dados sintéticos | run42168969390, duas instâncias, uma tabela,126 migrations; artifact13480626051 | Não prova backup integral/PITR/RPO/RTO |
| Custódia/Auto-Lock/marca | histórico no checkpoint mestre e dossiês GOV015/017/020 | Não repetir provas válidas; Auto-Lock automático depende de executor disponível |

Backend cadastros: migration20261106230839 SHA25611c789eee5ed03dce4944f0572a08cf7e02ea540bd28ab1799bfa043f8f3af92; paridade127/127 registrada.
Report JWT50 SHA25614a9fc945e6785341df28f768ce4965423565d1a3edb33823e9e75f8d7aef5f8, artifact13550107369; quarentena4 contas banidas,0sessões,0MASTER,0vínculosativos,2orgsinativas.
Não executar novamente suites caras sem mudança que invalide a prova; novas mudanças exigem regressões pertinentes.

## 5. Fontes que devem viajar com a retomada
Frontend:
- AGENTS.md; docs/frontend/ADR-DEV-001-GITHUB-DIRETO.md; docs/frontend/ADR-DEV-002-PROMPT-PLAN-GATE-BUILD-TESTEC.md.
- docs/frontend/ESTADO_E_RETOMADA_CONTAOS_4_1.md: preservar integralmente seu histórico, ler as entradas recentes e usar este registro para a correção do estado atual.
- docs/frontend/planos/PLANO_ATIVO.json: prompt75 VALIDADO documentalmente; há subcampos históricos desatualizados. Não converter tudo em PASS nem substituir o arquivo por um resumo.
- docs/frontend/planos/P0_V1_PLANO_UNICO_AUDITORIA_CORRECAO_CERTIFICACAO_2026-11-05.md e emendas. Não reconstruir do zero.
- docs/frontend/governanca/P0_PRIORIDADE_ZERO_ORDEM_POR_VERSAO_4_1.md e P0_ORDEM_POR_VERSAO_4_1.json.
- docs/frontend/CONTEXT_CANONICO_4_1_SNAPSHOT.json; docs/frontend/LOCK-TYPES-01.md.
- docs/frontend/auditorias/P0_V1_RASTREABILIDADE_COMPLETA_2026-11-05.json.
- docs/frontend/auditorias/P0_V1_CRITERIOS_FINAIS_E_LIMITES_2026-11-05.md.
- docs/frontend/auditorias/P0_V1_DIFERENCIAL_486_488_CRITERIOS_2026-11-06.md.
- docs/frontend/auditorias/P0_V1_INVENTARIO_OPERACOES_2026-11-06.json.
- docs/frontend/auditorias/P0_SYS03_HML_E2E_RESULTADOS.md; P0_V1_BASELINE_HML_OBSERVABILIDADE_2026-11-06.md.
Backend:
- AGENTS.md, 00_AI_LEIA_ANTES_DE_ALTERAR.md e TODAS as 25 fontes listadas nele, incluindo 08A–08D e 19/20. Lista obrigatória/fingerprint estão no manifesto; ler arquivos integrais, não somente trechos de busca.
- AI_CONTEXT_MANIFEST.md; docs/tasks/active-task.json; docs/CERTIFICACAO_BACKEND_HML_4_1.md.
- docs/prompts/PROMPT_TRACKS_4_1.json; docs/prompts/P0_PRIORIDADE_ZERO_ORDEM_POR_VERSAO_4_1.md.
- docs/backend/P0_CRUD_LISTAS_PLAN_2026-11-07.md e todos os arquivos da seção7.
- Normas e pacote mestre originais são fontes; o histórico desta conversa não substitui leitura nem atesta cobertura.
Pacote BRAND SHA2565ee115d12e263d98068288b6bb722f5f303f2d19e1e4c0b5e930e69da03621da.
Manual100 SHA2568a15d96568d021ac86fdd45e79038e2cb969d69c12b2edb84f012a6129b8940e.
Caderno97 SHA256d9faaae47de4b697b18ad7fb71e4738384514936813cd5b18779f4cb8aed83b8.

## 6. Prioridades de retomada e entregáveis
Cada fase pertence ao mesmo plano mestre. Não iniciar a próxima dependente sem prova de saída. Trabalhos frontend independentes podem avançar sem fingir deploy de listas.
| Prioridade | Trabalho | Saída objetiva |
|---|---|---|
| P0-A | Reancorar código, branch conectada e instruções Lovable | Fonte atual preservada, diff/SHAs, nenhum rollback de entregas |
| P0-B | Demonstrar execução equivalente fora de Actions | Matriz gate→comando→executor→artefato→SHA→resultado; limites explícitos |
| P0-C | Implantar e provar backend listas | Uma migration exata, paridade128/128 se pré-estado 127, APIs/ACL/JWT/quarentena PASS |
| P0-D | Frontend listas versionadas | Fluxo completo na rota existente, capacidades backend, testes e UI real |
| P0-E | Inventário CRUD global V1 e lacunas restantes | Matriz de TODAS entidades/telas/ações, permitidas ou proibidas com fundamento |
| P0-F | Provas privadas e qualidade transversal | Navegação MASTER/perfis, padrão visual e WCAG, SYS03, RNFs e evidências |
| P0-G | Certificação individual V1 | 45 regulares V1/legado,24RF+BRAND+12NFR,486/488 reconciliados; certificado real ou NO-GO |
| P1 | V2→V3→V4→V5, uma por vez | Certificado anterior efetivamente integrado antes de cada versão |
| P2 | Auditoria global100/97 e GO/NO-GO | Sem promoção PROD automática |

### P0-A: sincronização e instruções antes de BUILD
- [ ] Conferir main frontend/backend atuais por refs e estado do projeto Lovable; não iniciar turno duplicado.
- [ ] Confirmar branch conectada. Se preview estiver no antigo PR226/6b0343b2, preservar branch/diff e selecionar a fonte atual por integração suportada; não force-push, reset destrutivo, remix ou recriação.
- [ ] Comparar arquivos de PRs228–249 no editor, especialmente AppShell/header, GerenciarCadastro, capacidades, OrganizationSelector, RegrasContrato, testes e pacote. Só metadado não prova sync.
- [ ] Ler Knowledge existente inteiro. Ele ainda contém “Frontend SÓ GitHub; Lovable só sincronização/visualização, sem BUILD”. Preparar emenda mínima dessa cláusula com a decisão atual, preservando os demais itens. Não substituir Knowledge integralmente sem mesclar.
- [ ] Atualizar orientação de AGENTS/ADR por plano documental: Lovable pode editar e testar frontend; GitHub continua fonte versionada. Esta mudança de editor foi pedida; transição de checks continua dependente da equivalência demonstrada.
- [ ] Reancorar snapshot normativo: backend atual4fec09bf difere da referênciabfd741d do frontend; comparar25blobs e contratos novos, registrar revisão de contexto. Não apenas trocar um SHA para fazer o guard passar.
- [ ] Conferir types.ts pelo hash e assets oficiais; manter bun.lock e routeTree gerado. Se drift transitório do Lovable, reparar o blob exato sem alterar constante do verificador.
- [ ] Saída: relatório de paridade com HEAD/branch, arquivos/diff, Knowledge vigente e lista de gates ainda pendentes. Nenhuma feature antes disto.

### P0-B: substituir a EXECUÇÃO sem perder proteção
GitHub Actions é atualmente o orquestrador. Lovable não é comprovadamente um runner compatível nem emissor dos checks exigidos. Fazer teste de capacidade em ambiente privado; não inserir senha PostgreSQL ou token GitHub no chat.
O secret CONTAOS_HML_DATABASE_URL existente no Actions NÃO é automaticamente legível ou disponível no Lovable. Não extraí-lo por logs/workflows e não expô-lo no React. Se necessário provisionamento, usar somente formulário seguro backend aprovado.
Inventário mínimo de equivalência:
| Controle existente | Substituto exigido no novo executor |
|---|---|
| Checkout commit imutável | Fonte exata com SHA registrado e diff limpo |
| Context Gate e scope | Mesmos scripts, base de diff correta e fonte canônica autenticada |
| Ordem V1→V5 e rastreabilidade | Mesmos testes/gates e matrizes, sem dispensas novas |
| types/brand/secrets | Hash bloqueado e guard íntegro em toda entrega; Auto-Lock sem Actions não pode ser presumido ativo |
| Instalação/build/testes | Dependências congeladas e comandos reais com códigos de saída |
| Teste C | Sessão/processo separado, fonte somente leitura e mesmo SHA; não deixar o implementador modificar fonte durante avaliação |
| Playwright/axe/screenshots | Quatro larguras×dois temas, evidências privadas e hashes |
| SQL/concorrência/restore | PostgreSQL/CLI/Docker ou capacidade equivalente demonstrada; duas instâncias isoladas e nenhuma produção |
| Deploy | SHA/hash/manifesto,uma pendente,paridade e contrato preservados |
| JWT | Auth HTTP real, perfis/tenants e cleanup independente; claims simuladas não equivalem |
| Proteção de merge | Checks legítimos no SHA requerido, de integração autorizada; não publicar “success” manual com base no relato do agente |

O ruleset frontend registrado exige PR e dois checks no mesmoSHA: ContaOS Frontend Zero-Drift e Auditoria de navegador independente (somente leitura) / ContaOS Teste C Independente; sem bypass amplo. Conferir configuração atual antes de qualquer migração.
Se Lovable não puder emitir checks confiáveis ou executar uma suite, registrar impedimento técnico exato e manter merge/certificação bloqueados. Pode preparar BUILD isolado e preview, mas não chamar isso de main integrada.
Não desligar ruleset para viabilizar Git sync direto; não relaxar assertions que buscam check-runs. Mudanças de governança/integração devem ser próprias e equivalentes, nunca feitas silenciosamente em tarefa funcional.
Não usar porta pública de app para expor runner administrativo nem criar painel que execute SQL arbitrário.
Saída: tabela com suporte COMPROVADO/NÃO SUPORTADO/NÃO VERIFICADO, versões, logs sanitizados e artefatos por gate. Só então declarar se todo o fluxo cabe no Lovable. Caso não caiba, documentação preserva o escopo integral e a dependência externa, sem promessa falsa de100%.

Comandos frontend copiados do workflow vigente, a executar na fonte correta:
```bash
bun install --frozen-lockfile
node --test scripts/p0-version-order-gate.test.mjs
node --test scripts/p0-v1-traceability-gate.test.mjs
node scripts/p0-v1-traceability-gate.mjs
node scripts/p0-version-order-gate.mjs
node --test scripts/frontend-scope-gate.test.mjs
node --test scripts/types-autolock-workflow.test.mjs
node scripts/frontend-scope-gate.mjs
node --test scripts/context-freshness-gate.test.mjs scripts/testc/visual-audit.test.mjs
node scripts/context-freshness-gate.mjs
node --test scripts/route-tree-drift-gate.test.mjs
bunx vite build
node scripts/route-tree-drift-gate.mjs
bunx vitest run --maxWorkers=2
bunx tsc --noEmit -p .
node scripts/frontend-zero-drift.mjs
git hash-object src/integrations/supabase/types.ts
git diff --exit-code --
```
FRONTEND_DIFF_BASE deve apontar para a base aprovada real. Token de leitura canônica, se exigido, somente em segredo protegido; não desabilitar check por falta de token.
Executar também lint/prettier exatamente conforme .github/workflows/contaos-frontend-zero-drift.yml, além dos arquivos modificados. Não confundir lint focal com lint global limpo; dívida legada deve constar do relatório.
Teste C deve reproduzir .github/workflows/contaos-teste-c-independente.yml: Playwright1.64.1,axe-core4.14.0,pngjs7.0.0 isolados sem reescrever lock; Vite4173; variáveis CONTAOS_PLAYWRIGHT_MODULE,CONTAOS_AXE_SOURCE_PATH,CONTAOS_PNG_MODULE,CONTAOS_TESTC_BASE_URL,CONTAOS_TESTC_HEAD_SHA,CONTAOS_TESTC_OUTPUT; script scripts/testc/visual-audit.mjs; SHA256SUMS e árvore fonte limpa.
package.json contém @playwright/test1.58.2 para outros testes. NÃO harmonizar versões por conveniência: distinguir suites e confirmar contrato/compatibilidade. A capacidade de instalar/rodar estes binários no Lovable ainda deve ser demonstrada.

## 7. P0-C: contrato de backend LISTAS já programado, não redesenhar
Fonte: develop@4fec09bf, PLAN95, BUILD96.
Migration: supabase/migrations/20261107001620_p0_crud_listas_verificacao.sql.
SHA256 obrigatório:20bfbe1eea1c152c970cf0b1ae10103a1b16576586f1eb966d9738ec0e48b6c8.
Arquivo aplicado é imutável; NÃO usar apply_migration com timestamp diferente, não reparar histórico para esconder divergência, não colar apenas DDL sem mecanismo de paridade.
Arquivos existentes:
- .github/workflows/p0-crud-listas-hml.yml
- .github/workflows/p0-hml-migration-version-parity.yml
- .github/workflows/restore-isolado.yml
- supabase/tests/p0_crud_listas.sql
- supabase/tests/p0_crud_listas_concurrency.py
- supabase/tests/p0_crud_listas_jwt.py
- supabase/tests/p0_crud_listas_catalog_expected.json
- supabase/tests/history_catalog_compare.py
- docs/tasks/active-task.json
Manter14 suites históricas, catálogo exato e restore duas instâncias. Nomes de checks backend exigidos no mecanismo atual: guard, reconstruir-banco-do-zero, prova-backup-dados-sinteticos-duas-instancias.
- [ ] Comparar HML read-only com arquivos versionados; alvo ainda ausente; pré-estado 127versões; nenhuma versão remota órfã e apenas20261107001620pendente.
- [ ] Demonstrar equivalente protegido do CLI2.81.3 e dos gates atuais antes de qualquer alteração do pipeline.
- [ ] Se substituição do executor de deploy exigir modificar validações do workflow/CLI, criar tarefa backend própria, com contexto/manifesto/allowlist e prova equivalente. O plano frontend não autoriza esse patch.
- [ ] Aplicar somente arquivo testado preservando versãoCLI, SHA e histórico; pós-estado esperado128/128 se pré-estado 127 confirmado.
- [ ] Conferir duas APIs públicas INVOKER/authenticated-only, cinco helpers privados, RLS/grants/assinaturas/catálogo sem drift; não ampliar privilégios.
- [ ] Executar SQLrollback (simulado) e concorrência real de duasconexões, distinguindo de JWT.
- [ ] Executar p0_crud_listas_jwt.py com AuthHTTP real MASTER/admin/leitor/semvínculo/restrito, tenants, sessão, concorrência200/409,replay,publicação/snapshot e negativaDML.
- [ ] Executar --cleanup independentemente mesmo após falha. Banir apenasfixtures próprias,revogar sessões/MASTER/vínculos,inativarorgs; preservar eventos/snapshots.
- [ ] Guardar report sanitizado,hashes,IDs,SQL/hash,antes/depois,advisors e limitações. Não copiar fixture.json/password/tokens para Git.
O scriptJWT usa Python crypt (ausente em versões recentes dePython),psql,DATABASE_URL,RUNNER_TEMP e CONTAOS_TEST_PRIVATE_DIR sob diretório privado. Suporte dePython compatível e bcrypt deve ser verificado. Não “corrigir” eliminando os controles de diretório/segredo; eventual portabilidade é mudança técnica revisada.
O checkpoint não transfere secrets do Actions ao Lovable nem garante sua disponibilidade.

APIs canônicas:
```text
obter_lista_operacional_v1(
 p_id_organizacao uuid,p_id_contrato uuid,
 p_id_lista uuid default null,p_id_versao uuid default null,
 p_pagina_versoes integer default 0,p_pagina_itens integer default 0) -> jsonb
executar_comando_lista_v1(
 p_id_organizacao uuid,p_id_contrato uuid,p_id_lista uuid,
 p_versao_esperada bigint,p_acao text,p_payload jsonb,
 p_motivo text,p_request_id uuid) -> jsonb
```
Getter schema crud-lista-v1; ações permitidas e motivos são do backend; páginas de 25. Comando devolve contexto,header com versão,id versão/item,request_id/evento_id. Replay pode ser histórico: reconciliar por getter atual, nunca regredir cache.
Ações: criar_lista,editar_lista,criar_versao,editar_vigencia_rascunho,salvar_item,remover_item,publicar_versao,encerrar_vigencia,alterar_situacao,descartar_rascunho.
Regras exatas:
- criar_lista é a única ação com lista/versão esperada nulas; header+versão 1 rascunho,versao_atual0 até publicar.
- Um rascunho aberto por lista; cópia opcional deversão da mesma lista; número max+1 sem reuso.
- Edição/remoção deitem apenasrascunho; nunca excluir item referenciado por requisito/snapshot.
- Publicação com vigência explícita,itens,fonte formal aprovada/aplicável para itens materiais; validar DSL nativa,sem tipos desconhecidos.
- Publicadas não têm edição genérica/DELETE; encerrarvigência autorizado uma vez,fim não anterior à maiorcompetência dependente. Sem sobreposição entre versões.
- Descartar preserva versão/itens como substituida sem aprovado_em; UI rotula descartada.
- MASTER herda administrador quando o helper canônico admite; não herda perfil exclusivamente direcao_aprovador. Não exigir vínculo físico aoMASTER nem elevar usuário por user_metadata/master=true.
- Lock org → contrato→idempotência→header; versão agregada sobe exatamente1 por comando; reautorizar após espera/replay; motivos/auditoria atômicos.
- criar_competencia compartilha lockorg/contrato para snapshots consistentes. Não editar snapshots antigos.

## 8. P0-D: BUILD frontend LISTAS no Lovable, após backend real
Tela existente: /contratos/$id/regras, componente src/components/contratos/RegrasContrato.tsx.
- [ ] Ler componente,helpers e src/test/regrasContrato.test.tsx atuais. Registrar PLAN com allowlist explícita dos novos adaptadores/componentes/testes; nomes novos devem ser definidos no PLAN antes de criar. Não regenerar types.ts.
- [ ] RED para ausência de gestão e para negativas/tenant/contexto/versão/replay. Confirmar falhas materiais, não assertions artificiais.
- [ ] Reutilizar editor/cartões/tabelas/dialogs/tokens; inline/drawer na rota existente,sem criar rota apenas para CRUD.
- [ ] Implementar todas as 10 ações permitidas pelo backend, com campos,confirmação,motivo,requestUUID,versão e feedback PT-BR. Mostrar por que exclusão/publicação/edição não é permitida.
- [ ] Validar schema/IDs/retorno/ações do getter; cache por usuário/org/contrato/lista/versão/página. Limpar após logout/troca; descartar resposta tardia.
- [ ] Manter rascunho em conflito409; nova leitura antes de reconciliar; sem retry automático com novoUUID após timeout incerto. Mesmo comando usa mesmoUUID; patch novo exige decisão nova.
- [ ] Preservar regra preventiva já existente e fluxos de leitura; não trocar assinatura das RPCs.
- [ ] GREEN/regressão, tipos/build/lint/guard e avaliação separada. Navegador autenticado com lista real autorizada, quatro larguras/dois temas, loading/vazio/erro/sucesso, foco/teclado/diálogos.
- [ ] Versionar código/dossiê, conferir fonte noGit e noLovable. Preview não prova merge nem deploy backend.
Não declarar listas concluídas se API implantada mas UI ausente, nem se UI mockada e backend pendente.

## 9. P0-E: CRUD global, além de organizações e contratos
Matriz obrigatória por entidade/rota: entidade;ação criar/ler/editar/ativar/inativar/excluir/encerrar/publicar/versionar;fontePRD;perfil/capacidade;estado permitido;API real/parâmetros;UI/botão/rota;versão/idempotência;auditoria;teste positivo/negativo;status;evidênciaSHA.
Cobrir: organizações,contratantes,contratos/aditivos/versões,fontes/aplicabilidades,orçamentos/rubricas,checklists/itens,competências,documentos/versões,análises/requisitos/evidências,parecer/apresentação/protocolo,histórico/respostas/desfechos/precedentes,regraspreventivas,usuários/vínculos/escopos/RBAC,auditoria.
Não assumir que toda tabela admite delete. Auditoria,história,versõespublicadas,análises e pacotes imutáveis usam retenção/novo evento/versão. Excluir rascunho sóondepermitido. Para ação proibida,exibir fundamento; para lacuna real,propor operação backend própria antes de botão inseguro.
Arquivos cadastros integrados a preservar:
- src/lib/cadastros/cadastroOperacionalDados.ts
- src/components/cadastros/GerenciarCadastro.tsx
- src/components/organizacao/OrganizationSelector.tsx
- src/components/contratos/VisaoGeralContrato.tsx
- src/test/cadastroOperacional.test.tsx
CincoRPCs jáconsumidas: obter_cadastro_operacional_v1,atualizar_organizacao_v1,alterar_situacao_organizacao_v1,atualizar_contrato_v1,alterar_situacao_contrato_v1.
Contrato crud-cadastro-v1 contém pode_editar,transicoes,exclusao_permitida=false,motivo_retencao. Não inventar delete org/contrato nem “ativo/inativo” para estados contratuais que são rascunho/ativo/suspenso/encerrado/cancelado.
A contagem antiga72RPCs porprefixo e33semreferência não é inventário semântico completo. Catálogo posterior127funçõespúblicas/102EXECUTEauthenticated também não prova49lacunasV1. Não criar funções duplicadas por contagem.
Testar operação viafront→Supabase→persistência→auditoria→releitura,além de negaçãoAPI direta. Formulárioexistente não basta.

## 10. P0-F: rotas, padrão transversal e provas restantes
Inventário atual documentado:28páginas=24organizacionais+4públicas/seletor. “27telas” é referência histórica, não renumerar nem criar tela para fecharcontagem.
Rotas existentes a exercitar:
```text
/
/login
/esqueci-senha
/redefinir-senha
/selecionar-organizacao
/administracao/usuarios
/administracao/auditoria
/contratantes
/contratantes/novo
/contratantes/$id/editar
/contratos
/contratos/novo
/contratos/$id
/contratos/$id/base-normativa
/contratos/$id/orcamento
/contratos/$id/regras
/contratos/$id/documentos
/contratos/$id/documentos/$idDocumento
/contratos/$id/competencias
/contratos/$id/competencias/nova
/contratos/$id/historico
/contratos/$id/historico/importar
/competencias/$id
/competencias/$id/documentos
/competencias/$id/analise
/competencias/$id/parecer
/competencias/$id/apresentar
/competencias/$id/apresentacoes/$apresentacaoId
```
Requisito detalhe pode ser superfície integrada, não inventar rota ausente. Árvore src/routeTree.gen.ts gerada porVite/TanStack; não editar à mão.
- [ ] MASTER sem vínculo tem navegação administrativa transversal conforme backend,sem assumir permissões humanas exclusivas; usuário comum só ações próprias.
- [ ] Orgselecionada validada por backend,persistência do nome/status noheader em todas páginas; sem exibir org anterior após troca/logout/resposta tardia.
- [ ] Uma marca oficial na sidebar autenticada expandida/recolhida/mobile;4 rotas públicas/seletor mantêm comportamento de marca próprio. Preservar navy/azul/teal/superfície por tokens.
- [ ] Todas as 28 rotas × 4 larguras × 2 temas = 224 combinações de acesso; diferenciar privada autenticada de redirecionamento login. O rótulo antigo do workflow “24telas” não substitui inventário.
- [ ] Estadosloading,vazio,403,erro,conflito,salvando,processando,sucesso;foco/teclado/contraste/labels/overflow/tooltipsdesktop+toque. BRAND: 72 itens individuais.
- [ ] SYS03: alias sintético controladoNOVO,e-mail realmente recebido,link válido/expirado/reutilizado e novo login; nunca redefinir conta real conectada. Testes públicos negativos anteriores não provam entrega/SMTP.
- [ ] Upload físico/worker/isolamento operacional continuam com status real. Três ressalvas R01,R02,R03 aceitas anteriormente não viram PASS, não se ampliam para outros critérios. SegurançaJWT/capacidades continua obrigatória.
- [ ] Workerhistórico tem extração conservadora pormarcadores; não alegar OCR/extração universal. Preservar revisão humana e fontes.
- [ ] RNFs:latência navegador porrota/metas500/800ms conformefonte,volume/concorrência,paginação,filas,retry/DLQ,observabilidade,timeout,resiliência,backup/restore. LogsAPIp95 não provam latência navegador;restoreuma tabela não éPITR/RPO/RTO.
- [ ] Advisors: noveRPCsSDhistóricas e proteção de senha vazada são alertas comhistórico/decisõespróprias; não remover aviso para parecer aprovado.
Fixture visual já existente nohistórico: organização “V107 concorrência”,contratante “TESTE VISUAL P0 06112026 - SEM VALIDADE” e contrato “TESTE-VISUAL-P0-06112026”. Não duplicar por falta de busca; localizar/verificar propriedade/escopo antes de reutilizar. Não alterar permissões ou registros reais para testes.

## 11. P0-G: critério de certificação e sequência integral até V5
Preservar45regularesV1(00–43 e75),24RFV1,BRAND000 e12NFR085–096. 486×488: mantertodos488registros;10testes própriosdo75 versus12normalizados não são equivalênciabiunívoca. Não deletar2itens,renumerar ou chamar contagem deprova. Provar schema,tenant/perfil,fluxo,UPDATEdiretonegado,auditoria/payloadsemsecrets,estados,larguras,teclado eSecurityview.
Certificado deve listar porID:fonte→implementação→teste→resultado→artefato/hash→SHA→limite→dispensaexpressa quando existente. Falta obrigatória semdispensa=NO-GO. Não ampliar três ressalvas nem aprovar versão integral sob ressalvas.
| Ordem | Regulares | Atômicos próprios |
|---|---|---|
| V1 atual | revisar00–42,43/V1-22 e75/V1-23 |001–024+000+085–096|
| V2 após certificadoV1 |44,45,46,47,48,49,76,77|025–043+transversais|
| V3 após certificadoV2 |50,51,52,53,54,55,78,79|044–054+transversais|
| V4 após certificadoV3 |56,57,58,59,80,81,82,83|055–074+transversais|
| V5 após certificadoV4 |60,61,62,63,64,65,66,84,85,86,87,88,89|075–084+transversais|
| Global após certificadoV5 |67–74 e90–99,todos|000–096integral|

V2:diligências/rodadas/apontamentos/ações/contestação/reapresentação/parecerfinal.
V3:importações/transações/rubricas/fornecedores/conciliação/alertas antesdefechamento.
V4:precedentes,similaridade/temporalidade,alertatransversalnãoimpeditivo,perfil/risco/grafo/copilotocomfontes.
V5:controlescontínuos/exceções/nãoconformidades/remediação/segregação,normas/riscos/API/webhooks/portal.
Emcada versão aplicarCRUDpermitido aoescopopróprio,consumindobackendexistente,reutilizando o herdado. APIsfuturas noSupabase nãoautorizam abrirV2antesdeV1.
Todos100 regulares e97 atômicos continuam obrigatórios. PROMPT74 não substitui99. GO deprodução sócom rito e autorizaçãoexpressa; este pedido não autorizaPROD.

## 12. Prompt completo para colar no Lovable: primeiro turno em PLAN

Copie o bloco abaixo no projeto existente:

```text
Continuar o ContaOS 4.1 no projeto existente b113dd59-6caf-4c92-8302-457a037a0c6f. Não criar outro projeto nem remixar.

O titular decidiu retornar ao agente Lovable para desenvolver o frontend e preparar a substituição do executor GitHub Actions, preservando os testes e as proteções. GitHub continua sendo o repositório; Supabase HML gklhhhyosgasnyoxlrui continua sendo o backend exclusivo. Não usar Lovable Cloud como backend.

MODO PLAN, sem modificar código, arquivos, banco ou configurações neste turno.

Leia integralmente a issue #250 do repositório contaos999999/contaos-hml-control e seu dossiê, o checkpoint oficial, PLANO_ATIVO, plano mestre único, P0 por versão, AGENTS, as 25 fontes canônicas do backend e os manifestos. Não trabalhar apenas com este resumo.

Baseline frontend: 71362700c83adf438170c2fe9ed35f79601472e7.
Baseline backend: 4fec09bf5cab5afc776192b9bef6e70728e1a058.
A API Lovable informou 6b0343b2be5009a13f54a99e897ab27e410c9853. Compare a branch e os arquivos reais antes de concluir que há paridade ou iniciar BUILD. Preservar as entregas frontend PR228–249 e backend PR95/96.

Knowledge e ADR anteriores proíbem BUILD no Lovable. Propor emenda mínima dessa restrição por decisão atual do titular, mantendo todas as regras de segurança, escopo, TDD, revisão e versionamento. Não remover checks nem considerar relato do próprio agente equivalente a uma revisão independente.

Entregar neste PLAN:
1. HEADs atuais, branch conectada e prova de paridade dos arquivos.
2. Entregas existentes que serão reutilizadas, sem reconstrução.
3. Matriz de capacidade real de executar os gates fora do Actions.
4. Allowlist documental e técnica mínima por fase.
5. Ordem P0-A a P0-G, dependências, testes e critérios de saída.
6. Primeira lacuna a resolver e teste RED correspondente.
7. Impedimentos concretos e autorizações específicas, se exigidas.
8. Registro de V1 não certificada e produção proibida.

Não declarar o fluxo 100% executável no Lovable sem demonstrar suporte a PostgreSQL, CLI, restore isolado, Auth/JWT, secrets protegidos, Playwright, revisão independente e checks legítimos no SHA exigido.

O backend de listas PR96 está integrado no Git. A implantação da migration 20261107001620, SHA256 20bfbe1eea1c152c970cf0b1ae10103a1b16576586f1eb966d9738ec0e48b6c8, não foi comprovada no HML. O deploy 42321885307 falhou antes de iniciar o job por anotação relacionada a cobrança; real-jwt foi ignorado. Não criar UI usando API fictícia nem aplicar SQL com outra versão. Planejar executor equivalente antes de alterar o pipeline.

Prioridade: reconciliar fontes e instruções; demonstrar executor; implantar e testar listas; integrar frontend de listas; completar CRUD permitido em todo o escopo V1; provar UI privada, SYS03 e RNFs; certificar V1 antes de V2.

ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE
ContaOS Brand v1.0: ler documentos 19/20, reutilizar assets oficiais, ContaOSMarca, tokens e componentes. Não redesenhar.
Preservar types.ts no blob 8ea7750b75fd9d76b29c36ce7613392e3ab65e19 e routeTree gerada.
Manter Auth, RLS, portões do backend, histórico, auditoria e segredo fora do cliente.
Validar 1440/1280/768/390 px nos temas claro/escuro e todos os estados aplicáveis; Teste C separado e somente leitura.
Consolidar turnos, consultar o estado antes de retry, reutilizar provas válidas e não usar Max mode sem necessidade e autorização.
Economia nunca reduz TDD, gates, segurança, acessibilidade, fonte ou prova. Sem evidência, registrar NÃO VERIFICADO.
```

## 13. Prompt reutilizável de execução por fase, após PLAN validado

```text
Executar somente a fase [P0-X], na allowlist do PLAN aprovado e sobre o SHA [SHA].

Confirmar o estado do turno anterior e a fonte atual antes de iniciar. Não duplicar BUILD.
Escrever e executar teste RED material, implementar o menor delta e executar GREEN, regressão e gates reais.
Guardar as evidências e obter avaliação separada, somente leitura, sobre o SHA final.
Atualizar o checkpoint com última etapa comprovada, próxima tarefa, impedimentos, commit e PR/merge efetivamente verificados.
Se uma dependência falhar, continuar somente trabalho independente permitido. Não inventar PASS nem reduzir proteções.
Backend só pode mudar em tarefa própria. Produção proibida; types.ts congelado.
Segredos exclusivamente por formulário seguro. Nenhum segredo no chat, React, Git ou logs.

ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE
Manter ContaOS Brand v1.0, assets, ContaOSMarca, tokens e componentes existentes.
Conferir o hash imutável de types.ts e gerar a árvore de rotas pelo mecanismo oficial.
Validar quatro larguras e dois temas, acessibilidade, estados e Teste C separado.
Reutilizar evidências válidas, consolidar instruções e evitar turnos duplicados, sem reduzir qualidade, segurança, TDD ou rastreabilidade.
```

## 14. Contrato do checkpoint a cada entrega
Registrar:data/fuso;repos/branches;HEADbase/BUILD/revisão/merge;prompt/atômicos/requisitos;arquivospermitidos/proibidos;planovalidado;RED/GREENcomandos/exitcodes;regressão/lint/build/tipos;gates;APIs/migration/hash;perfil/tenant/fixture;capturas/artefatos/sha256;limites;cleanup;CI/checksintegradosoupendentes;últimaetapaconcluída;próxima;impedimentos.
Não apagar entradas anteriores nem atualizar “integrado” antes de verificar main. Se Actions bloquear documentação, manter issuecheckpoint acessível na main e PR documental aberto; linkarambos e dizer “registrado”,não“integrado”.
Rollbackfrontend:reverter deltarevisado emcommitnovo;backend:nova migrationcorretiva/gatepróprio;nenhuma reescritadehistórico.
A mudança de executor NÃO foi implementada neste registro, e nenhum teste/deploy foi executado por este dossiê.

## ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE
Registro documental,impacto_visualN/A:nenhum asset/cor/tela alterado. GitHub/Supabase/Lovable consultadossomente parafontes/metadados;nenhumBUILD Lovable enviado. Menor deltaaditivo,semreconstruirproduto nemrepetirtestes. Prova,custódia,TDD,BRANDsegurança,12 RNFs e100/97 preservados. Resultado:identidadeN/A;economiaconforme quanto à ausência deBUILDduplicado;conformidade do novoexecutor NÃO VERIFICADA.
