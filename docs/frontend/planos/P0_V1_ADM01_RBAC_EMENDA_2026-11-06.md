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
