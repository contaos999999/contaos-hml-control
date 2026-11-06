# EMENDA AO PLANO ÚNICO P0 V1 — ADM-01 / Matriz RBAC persistente
Data: 06/11/2026. **Documento somente de PLAN/GATE, não é BUILD, teste funcional ou certificado.**
Plano-mãe imutável: `docs/frontend/planos/P0_V1_PLANO_UNICO_AUDITORIA_CORRECAO_CERTIFICACAO_2026-11-05.md`.
Versão corrente V1; V2 proibida até certificação V1. Prompt regular **75/V1-23**, requisito transversal obrigatório Sidebar/AppShell sem renumeração. Atômicos **000/BRAND-01, 020,021,022,023** e RNFs transversais **085–096** conforme `PLANO_ATIVO.json`. As 25 fontes canônicas têm recibo em `PLANO_ATIVO.json`; antes do BUILD revalidar suas SHAs contra HEAD e não presumir que um recibo histórico prova contratos alterados.

## 0. Baseline e lacuna reproduzida

- Frontend `contaos999999/contaos-hml-control` `main@be842a39a413c8ef53c71412ff83be3b0a49b8a9`; backend `contaos999999/develop` `main@6fe3764b6b9c5c6989e8aa138a0fa7b1461b00c7` pós-PR #81; HML `gklhhhyosgasnyoxlrui`.
- A tela `src/components/administracao/usuarios/AdminUsuarios.tsx` realiza administração ADM-01, mas não apresenta nem chama `obter_matriz_rbac_master` ou `atualizar_matriz_rbac_master`. O `ContaOSAppShell` libera o link “Usuários” via `validar_administrador_organizacao`; usuários administradores de uma organização **não** equivalem a MASTER global.
- Backend já implementou a matriz `20261106014102_p0_v1_rbac_persistente.sql` e deploy do assinador Edge `storage-sign-upload` v5, `verify_jwt=true`, com código idêntico ao GitHub; paridade de 126 migrations aprovada no run 42149828772. Evidências parciais no PR #81 do backend.
- HML real, somente leitura: 48 recurso/ação, 10 perfis × 48 = 480 permissões; `privado.rbac_versoes` persiste versão e `privado.rbac_comandos` controla replay. Mudanças de matriz durante teste sintético exigem revalidação, nunca cache de privilégio como autoridade.
- Existe PR #176 aberto no frontend sobre Novo Contratante/MASTER: **não tocar** `src/components/contratantes/NovoContratante.tsx`, testes daquela tela nem seus arquivos de planejamento.

## 1. Gate FRONTEND ↔ BACKEND: contrato efetivo (sem novas APIs)

| Requisito V1 | Contrato existente | Prova | Classificação |
| --- | --- | --- | --- |
| MASTER consulta matriz persistente | `public.obter_matriz_rbac_master()` → JSON `{schema_versao:'rbac-v1',versao,permissoes:[{perfil,recurso,acao,permitido}]}` | Migration backend `20261106014102`, HML com 480 combinações | PASS estrutural, JWT E2E pendente |
| MASTER edita permissões | `public.atualizar_matriz_rbac_master(p_versao_esperada bigint,p_request_id uuid,p_alteracoes jsonb)` → `{schema_versao:'rbac-v1',versao,request_id,evento_id}` | RPC existente, versão otimista e idempotência por `request_id` | PASS contratual, E2E concorrente pendente |
| Não MASTER não altera matriz | Verificação autoritativa `privado.usuario_e_administrador_master()`, erro SQLSTATE `42501` | Função de backend; alerta Advisor não equivale a bypass | PASS estrutural, negativa JWT pendente |
| Persistência/auditoria | `privado.rbac_permissoes_perfis`, `privado.rbac_comandos`, `privado.rbac_versoes`, audit event | SQL em HML/PR #77 | PASS estrutural, histórico funcional pendente |
| Menu e tela de administração | `/administracao/usuarios` existente; menu admin separado por capacidade | Testes e componentes frontend | Lacuna UI: não consome RPC da matriz |
| Novo contrato, organização e aprovação especializada | Permissões existentes RLS/RPC e segregação de `direcao_aprovador` | Migração RBAC: restrição adicional; MASTER não concede aprovação especializada | NÃO alterar / manter regressão |

**Não há lacuna backend identificada para a consulta e edição RBAC proposta.** Toda suspeita nova durante BUILD suspende o item dependente e aplica ADR-DEV-002, sem invocar migration ou relaxar segurança.

## 2. Escopo mínimo do BUILD, a adicionar à allowlist do PLANO_ATIVO em PR documental separado

1. `src/lib/administracao/rbacRpc.ts` (NOVO): transporte Supabase RPC por cast restrito para os dois nomes existentes (types.ts congelado), schema `rbac-v1` validado, validação defensiva de 480 entradas e formato de versão. Falha fechada; distinguir `42501`, `PT409`, conexão/erro e incompatibilidade. Sem tokens, senhas, dados sensíveis ou `service_role`.
2. `src/components/administracao/usuarios/MatrizPermissoes.tsx` (NOVO): painel para MASTER na rota ADM-01 já existente, agrupar 48 ações por recurso e filtrar 10 perfis; controles acessíveis por linha/perfil, loading/negado/erro/conflito/sucesso, contraste e tabulação. Salvar alterações somente sob ação explícita do MASTER, com `p_versao_esperada` e UUID de idempotência; após êxito reconsultar matriz do backend. Nunca assumir privilégio pelo painel.
3. `src/components/administracao/usuarios/AdminUsuarios.tsx` (existente): integrar seção/painel RBAC sem retirar gerenciamento de usuários; a seção aparece somente quando `obter_matriz_rbac_master` confirma MASTER, não apenas `validarAdministrador`. Não alterar o login ou a regra existente de Usuários/Auditoria.
4. `src/test/rbacMatriz.test.tsx` (NOVO): RED/GREEN de contratos e UI, MASTER positivo, administrador comum/erro 403, JWT revogado, resposta inválida, conflito de versão PT409, replay/idempotência, chamada única e ausência de mutação em falha, troca de organização e sessão, estados de teclado/foco; regressão sem modificar o backend.
5. `src/test/admUsuarios.test.tsx` (existente): apenas as asserções da nova seção, se indispensáveis ao teste integrado. Qualquer outro arquivo exige aditivo documental prévio e CI.

**Proibidos:** `src/integrations/supabase/types.ts` (blob congelado `8ea7750b75fd9d76b29c36ce7613392e3ab65e19`), qualquer `supabase/**`, `src/routes/**`, `src/routeTree.gen.ts`, `public/**`, tokens Brand, scripts/gates, PR #176, `contaos999999/develop` e PROD. Como não há nova rota, **GOV-020 não autoriza editar árvore gerada**. Manter menu global existente; acesso ao painel pelo item “Usuários” já autorizado, sem link exclusivo MASTER criado sem novo gate.

## 3. Segurança, interface e TDD

- O frontend não deve usar `user_metadata` nem perfis locais para autorizar gravação, nem persistir cache de matriz como decisão de segurança. Sem concessão por erro ou ausência de sessão. Backend RLS/RPC é autoridade. Não utilizar `service_role` no navegador.
- A pesquisa por perfil não deve editar linhas invisíveis por engano. Cada checkbox deve ter rótulo que nomeie perfil, recurso e ação, guardar estado de alteração e alertar em `PT409` para recarregar antes de nova tentativa. Nunca gerar `request_id` novo no replay da **mesma** tentativa lógica.
- Mudança de sessão/organização desmonta ou invalida estado de edição, bloqueia respostas assíncronas antigas, preserva foco e não reusa matriz de outro usuário. Nem admin organizacional nem auditor podem visualizar a matriz administrativa global.
- Fase RED: suite de `rbacMatriz.test.tsx` deve falhar antes de alteração de produção; guardar CI/log. Fase GREEN: implementação mínima, casos positivos/negativos, depois todas as suítes e typecheck. Não chamar mock de prova JWT real.
- Visual: **reutilizar** Button, Card, Checkbox, Select, Alert e tokens existentes, fundo e marca inalterados. Responsividade `1440/1280/768/390`, claro/escuro, foco/teclado, aria-live, estados vazios/conflito e Teste C independente no mesmo SHA. Sem redesign e sem nova dependência.
- Rollback: revert exclusivo do PR frontend do BUILD, sem alterar storage, Auth, grants, RLS, migration, tipos ou o código Lovable. Preservar a trilha auditada no backend.

## 4. Validação formal do PLAN (não confundir com validação do BUILD)

| Gate | Situação nesta emenda |
| --- | --- |
| Identidade V1, fontes e vinculação ao plano P0 existente | PASS com recibo histórico; **revalidar SHA de fonte no BUILD** |
| Compatibilidade RPC backend e ausência de API inventada | PASS estrutural; JWT operacional pendente |
| Escopo fechado/sem backend/PROD/types/Brand/routes | PASS documental |
| TDD negativo antes de BUILD, testes/CI, estados e rollback | PASS de planejamento; **não executados** |
| Teste C/WCAG/4×2 e evidências permanentes | PASS de planejamento; **não executados** |
| CI **deste** PLAN e atualização de `PLANO_ATIVO.json` | **PENDENTE** até PR/CI/merge |
| Autorização humana específica para mudança direta BRAND-01 | N/A (sem alteração de identidade visual) |
| CERTIFICAÇÃO V1 | **NO-GO/PENDENTE** |

**Decisão:** esta emenda é proposta documental dentro do **plano único já autorizado**. Não modificar `src/` antes de: (a) merge desta emenda com CI verde, (b) nova emenda `PLANO_ATIVO.json` com allowlist exata, validação e CI anterior ao código, (c) gates atuais do frontend/backend ainda PASS.

## 5. Continuidade e checkpoints

Backend `main@6fe3764b6b9c5c6989e8aa138a0fa7b1461b00c7`; frontend baseline `main@be842a39a413c8ef53c71412ff83be3b0a49b8a9`. A V1 ainda carece de provas reais RBAC pós-deploy, limpeza de fixtures, ADM-01, SYS-03, Teste C privado, RNFs e reconciliação individual dos 488 critérios. Reutilizar resultados válidos sem refazer PostgreSQL HML/RLS/Auto-Lock/custódia.

## ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE

Sem alterações de marca, tipos congelados, estilos globais, assets ou infraestrutura. GitHub diretamente; Lovable somente sincronização. A emenda não gera créditos de BUILD e não elimina TDD, segurança, teste real, Teste C ou CI.


## Gate de fonte viva, 06/11/2026, atualização rastreada

- CI inicial do PLAN, run 42153716551: Teste C independente SUCCESS e Frontend Zero-Drift FAIL apenas no guard `context-freshness-gate.mjs`, pois `CONTEXT_CANONICO_4_1_SNAPSHOT.json` continha HEAD antigo `3aa4af7...` (não dispensado).
- Rechecagem direta no backend `contaos999999/develop@4c21fe2961f54218891e1f1edf25ef5e21137106`: **25 de 25 documentos normativos com blobs SHA idênticos** ao snapshot, catálogo `docs/prompts/PROMPT_TRACKS_4_1.json` com blob original `e54e49e626e65a9c94c81709180fd192a1f0c079`, 100 regulares, 97 atômicos, 100 crosswalk; nenhuma fonte modificada.
- Snapshot reancorado em commit documental desta mesma branch e aguardando novamente **ambos os required checks**; o frontend não foi alterado, `src/integrations/supabase/types.ts` não foi tocado. Em caso de novo HEAD remoto antes do CI, falhar fechado e conferir mudança em vez de pular verificação.
- O BUILD ainda exige emenda de allowlist em `PLANO_ATIVO.json` com CI próprio **antes de alterar src/**, além da condição de não conflitar com PR #176. V1 permanece NÃO CERTIFICADA.

## Aditivo executivo ao plano único: matriz e navegação V1

Autorização vigente: “Execute integralmente”. A emenda PR178 já está integrada; este commit promove a allowlist anterior ao BUILD. Evidências mais recentes substituem pendências históricas acima: backend PR82 corrigiu thenable, Edgev6; PR83 registrou147cenários distintos aprovados e quarentena14contas/0sessões; PR84 prepara regressão das nove funções, em execução. Fonte backend atual 1edb2c40595e01f7e1e8c5f80160b7b3a4113c12; 25/25 blobs e catálogo intactos. Frontend baseline 6cd922a0738549d421b57a704ec17e6c6ac541cd; as alterações posteriores a be842a3 são documentais. Não tocar PR176.

### Arquitetura e decisões de implementação

Reutilizar a rota /administracao/usuarios, componentes e tokens existentes, sem nova rota ou dependência. Alternativa de nova página/árvore adicionaria governança sem benefício; tela local sem persistência não atende ADM01. Escolha técnica dentro do plano autorizado: painel MatrizPermissoes na administração e navegação contextual no shell existente.

Arquivos exatos: rbacRpc.ts, MatrizPermissoes.tsx, rbacMatriz.test.tsx (novos); AdminUsuarios.tsx, ContaOSAppShell.tsx, ContaOSSidebar.tsx, menuV1.ts, appShellSidebar.test.tsx e admUsuarios.test.tsx (existentes). Checkpoint documental autorizado. O aditivo autoriza expressamente evolução do menu, antes preservado pela proposta inicial, somente para rotas V1 existentes e sob permissões backend. Não modificar NovoContratante, seus testes/planos, backend, Auth/Storage, types.ts, assets, estilos globais, src/routes ou routeTree.gen.ts.

rbacRpc expõe obterMatrizRbac():Promise<MatrizRbac>, atualizarMatrizRbac(versao:number,requestId:string,alteracoes:PermissaoPerfil[]):Promise<ResultadoRbac>, consultarPermissoesEfetivas(org:string,contrato:string|null):Promise<PermissoesEfetivas> e resolverContextoRbac(pathname:string,org:string):Promise<ContextoRbac>. Cast restrito só para três nomes RPC existentes. Matriz exige schema rbac-v1, versão inteira positiva,480 combinações únicas dos10perfis/48ações,booleanos reais; nenhuma concessão inferida. Resposta efetiva exige schema,versão,master booleano e combinações conhecidas sem duplicação. Falha/malformado nega. Nenhum tipo gerado alterado.

Painel: obter_matriz_rbac_master decide visibilidade, não perfil local. Seleção de perfil/recurso, checkbox com rótulo completo, revisão explícita das mudanças antes de salvar, cancelamento local, indicação de impacto global. UUID lógico estável em tentativa/retry, bloqueio de edição enquanto resultado incerto; PT409 exige recarregar/revisar, sem sobrescrever. Após sucesso confirmar por nova consulta. Sessão, organização, retorno à página e resposta tardia invalidam estado e edição; geração descarta promessas antigas.

Menu: links comuns filtrados por consultar_permissoes_efetivas. Administração continua exigindo suas RPCs específicas, além da permissão correspondente. Acesso a selecionar-organizacao reaproveita seletor existente. Submenu contextual de contrato: resumo,base normativa,orçamento,regras,documentos,competências,nova competência,histórico/importação. Submenu de competência: resumo,documentos,análise,parecer,apresentação; detalhe/apresentações individuais continuam acessíveis pela lista respectiva. Contexto de competência resolve id_contrato por SELECT sob RLS e organização exata. Nunca inventar UUID, organização ou permissão. Todas as rotas existentes permanecem protegidas pelo backend; menu não concede acesso. Navegação nativa em links contextuais concretos é aceitável se preservar acesso/foco e testes, sem cast amplo de rotas. Desktop/móvel/recolhido usam o mesmo conjunto filtrado.

### Tarefas verificáveis

- [ ] RED: rbacMatriz.test.tsx falha antes da implementação em contratos inválidos/403, MASTER positivo, administrador negado, não salvar em erro, revisão/cancelamento, PT409, retry com mesmoUUID/payload, troca de sessão/org e resposta obsoleta. Teste de teclado/rótulos.
- [ ] GREEN: implementar transporte e painel mínimo, integrar AdminUsuarios sem remover administração existente. Rodar teste focado até PASS; preservar a negativa para nãoMASTER.
- [ ] RED/GREEN navegação: negar por padrão, filtrar cinco links comuns e links contextuais por ação, A/B/competência exata via RLS, não usar resultado antigo após auth/org/visibilidade. Atualizar mocks com permissões explícitas, sem liberar por fallback. Validar teclado/drawer existente.
- [ ] Regressão: baseline anterior35suites/886PASS local; rodar Vitest completo, typecheck,lint,build; hash types.ts igual8ea7750b75fd9d76b29c36ce7613392e3ab65e19. Sem editar gates para acomodar falhas.
- [ ] Dois required checks no mesmo SHA e Teste C4larguras×2temas. Evidência pública não certifica tela privada; ensaio autenticado próprio e revisão independente permanecem necessários.
- [ ] Registrar HEADs, resultados, limitações e próxima tarefa no checkpoint; merge apenas CIverde. Rollback exclusivo do PRfrontend.

### Foco da revisão

Sessão trocada no meio do save; resposta atrasada de outro contexto; resposta de matriz com entradas faltantes/duplicadas; timeout depois de commit sem criar segundoUUID; filtros ocultando alterações ainda pendentes. Cada situação tem teste no arquivo proprietário acima. Nenhuma certificação por contagem, mock ou texto de gate.

### ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE (OBRIGATÓRIO)

Preservar Brand1.0, logos, cores e tokens; usar componentes existentes. Edição direta GitHub, sem BUILD Lovable. Aprovação vigente cobre implementação funcional do plano; não há mudança da identidade. CI da emenda precisa passar antes de qualquer src novo. V1 não certificada; V2 e PROD bloqueados.
