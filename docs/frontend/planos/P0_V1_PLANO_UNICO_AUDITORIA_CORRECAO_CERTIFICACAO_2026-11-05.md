# ContaOS 4.1 — PLANO MESTRE ÚNICO P0 DE CONCLUSÃO E CERTIFICAÇÃO DA V1
Data: 05/11/2026. Autorização expressa do titular: executar em **uma rodada coordenada e um único plano**, não fragmentar correções independentes em planos sucessivos.

## Estado e limites da autorização
- Repositório frontend: `contaos999999/contaos-hml-control`; fonte canônica/backend: `contaos999999/develop`; Supabase HML `gklhhhyosgasnyoxlrui`.
- V1-23 backend: PR #49 integrado; status **CERTIFICADA_CONDICIONADA_POR_SIMULACAO**, 10/10 matriz lógica simulada e testes estruturais. Não houve testes com sessões reais, isolamento A/B autenticado, RLS autenticada nem restore isolado. Não reclassificar como executados.
- V1-23 frontend: BUILD PR #83 integrado, CI Zero-Drift/Teste C verde; sidebar/AppShell PRs #98–#114 integrados. Não repetir implementações comprovadas.
- A certificação integral V1 **NÃO** está concedida por esta autorização de planejamento. PROD proibido. V2–V5 bloqueadas até certificado V1 integrado.
- Este plano é único, mas seus gates de PLAN → BUILD → TEST → AUDIT, PR, CI e branch protection continuam obrigatórios. Se a allowlist ativa não abranger o pacote, atualizar em PR de gate de escopo sob este plano, não improvisar mudanças fora dela.

## RODADA ÚNICA: auditoria integral → correção agrupada → teste integral → certificado
### Fase 0. Baseline e rastreabilidade (antes de alterar código)
1. Congelar HEADs dos dois repositórios e versão efetivamente aplicada no HML; ler as 25 fontes canônicas, 100 prompts regulares e 97 atômicos, com mapeamento semântico de quais pertencem à V1, sem renumerar.
2. Construir matriz `requisito V1 → regular → atômicos → RNF → tela/rota → contrato backend real → implementação frontend → teste → PR/CI → PASS/FAIL/NÃO VERIFICADO`.
3. Conferir evidências existentes, BRAND-01, sidebar, navegação, estados, históricos, administração, auditoria, acessibilidade, segurança, upload/worker, restauração, evidências permanentes, recuperação Auto-Lock e sincronização Lovable. Não tratar CI estático como teste real.
4. Identificar em **uma lista consolidada** todas as lacunas e dependências. Não desenvolver item que não esteja coberto por contrato backend efetivamente comprovado.

### Fase 1. Gate FE↔BE obrigatório para todos os itens V1
- Comparar cada ação do frontend com Supabase HML (RPC, assinatura, roles, RLS, tabelas, Storage, Auth, Edge, filas/worker, erros, idempotência, escopo A/B).
- Auditoria: RPC `public.pode_consultar_auditoria_organizacao(uuid)` já implantada; separar menu `podeGerenciarUsuarios` (admin) e `podeConsultarAuditoria` (admin/auditor/juridico_conformidade), falhar fechado, invalidar ao mudar sessão/org e proteger acesso direto. Não criar RPC fictícia nem alterar RLS.
- Se qualquer outra lacuna backend surgir: NO-GO para item dependente; apresentar impacto e opções A ampliar backend ou B adequar frontend **sem violar PRD**, solicitar decisão expressa do titular. Autorização prévia da ampliação da Auditoria não autoriza mudanças genéricas de backend.

### Fase 2. BUILD agrupado, sem retrabalho
- Uma implementação coordenada dos desvios comprovados: frontend V1-23, sidebar/AppShell, navegação e ativação progressiva, BRAND-01 fundo transparente e logos expandida/recolhida, comportamento móvel/desktop, foco/teclado, contraste, autenticação, permissões e troca de organização.
- Corrigir somente falhas demonstradas nos demais módulos V1, inclusive fluxos documentais e upload/worker quando contratos e gates autorizarem. Reutilizar código e testes já aprovados.
- TDD RED→GREEN; PR(s) técnicos podem ser separados por gate obrigatório, mas **não** novos planos por microcorreção. Proteger `src/integrations/supabase/**`, tipos certificados, SQL, segredos e PROD de alterações não autorizadas.

### Fase 3. Testes integrados e prova
- Executar lint, typecheck, build, Vitest/regressão, Zero-Drift, Teste C independente e P0 ordem de versões no HEAD exato; registrar execução e conclusão.
- Testar visual e WCAG 2.2 AA em 1440/1280/768/390, temas claro/escuro, navegação por teclado, foco, diálogos, responsividade, contraste e marca oficial.
- Testar perfis e organizações A/B, revogação, rotas diretas, race conditions, upload real, worker, isolamento e restore **quando tecnicamente viável e autorizado**. Se aceitos por simulação/dispensa, documentar por item e obter aceite explícito; nunca registrar PASS real não executado.
- Validar recuperação do Auto-Lock após drift, atualização de metadados Lovable e arquivamento de evidências; diferenciar testes estáticos de funcionais.

### Fase 4. AUDIT e decisão única
- Consolidar checklist V1 100% rastreável, HEADs/commits/PRs/checks/testes e resultado de cada requisito.
- Classificar: `PASS_REAL`, `PASS_SIMULADO_COM_ACEITE`, `ACEITE_CONDICIONADO`, `FAIL`, `NAO_VERIFICADO`. V1-23 backend conserva certificação condicionada do PR #49.
- Não certificar integralmente V1 enquanto houver requisito obrigatório FAIL/NÃO VERIFICADO sem dispensa expressa juridicamente e tecnicamente aceitável. Emitir relatório de riscos residuais e termo de certificação **somente após** gates e aceites; registrar em PR, aguardar CI verde, merge e confirmar HEAD.
- Após certificação V1 efetivamente integrada, liberar início da V2 pelo gate canônico. Nenhuma promoção PROD implícita.

## Governança operacional
- Prioridade P0, plano mestre único; correções agrupadas por dependência e revisão geral, não uma proteção por vez.
- Evidência anterior válida deve ser reutilizada. Status NÃO VERIFICADO não vira PASS por presunção.
- O plano não modifica `PLANO_ATIVO.json` automaticamente: primeiro validar CI e conformidade do plano, depois promover a tarefa ativa por gate próprio.
- Ao finalizar cada fase atualizar checkpoint de continuidade, com última etapa comprovada e próxima tarefa, sem perder rastreabilidade.

## Anexo executável de aceite — BUILD agrupado da Auditoria (05/11/2026)
**Evidências integradas:** plano mestre PR #130 CI 42013946647; auditoria PR #131 CI 42014564846; plano ativo PR #132 CI 42014956515; inspeção HML PR #133 CI 42015435635. O HML confirmou as duas RPCs existentes, SECURITY INVOKER STABLE, EXECUTE somente authenticated. **Isso não comprova JWT/RLS E2E.**

### Contrato fechado do BUILD (sem novas migrations)
| Item | Alteração frontend | Aceite automatizado |
|---|---|---|
| CAP-01 | `admUsuariosRpc.ts`: `podeConsultarAuditoria(org)` invoca `pode_consultar_auditoria_organizacao` com `p_id_organizacao` e aceita exclusivamente boolean true | true permite, false/erro/retorno malformado nega; sem fallback admin |
| CAP-02 | `ContaOSAppShell.tsx`: estado `administrador` continua exclusivo para Usuários; novo estado `auditoriaPermitida` somente para Auditoria | admin: ambos; auditor/jurídico: somente Auditoria; comum: nenhum |
| CAP-03 | Desktop e menu móvel filtram `MENU_ADMIN_V1` por capacidade por item, inclusive recolhido | links sem duplicação, `aria-current`, foco, rótulos e ícones preservados |
| CAP-04 | Toda mudança de sessão, visibilidade, rota e organização invalida as duas capacidades e bloqueia resultados antigos | testes concorrência, logout, mudança A/B, erro de RPC, fail-closed |
| CAP-05 | BRAND-01 e demais módulos permanecem intactos | regressão visual 4 larguras × 2 temas, testes existentes e Teste C independente |

### Gate antes de BUILD
- Não declarar `PLANO_ATIVO.validacao.gates.*=PASS` em lote: cada gate requer evidência da fonte canônica atual, CI do PLAN e Teste C planejado.
- Para TDD, primeiro testes RED de CAP-01..05, depois implementação GREEN. Reexecutar `node --test scripts/p0-version-order-gate.test.mjs`, gate de ordem por versão, Zero-Drift, lint, typecheck, build, Vitest e Teste C.
- Se `PLANO_ATIVO` permanecer EM_VALIDACAO/PENDENTE, **NO-GO para editar código**. Promover o manifesto somente com comprovação, em commit anterior ao BUILD.
- Não confundir este aceite funcional com certificação integral da V1; upload/worker, WCAG real, JWT A/B, restore e outras lacunas permanecem separadas no mesmo plano mestre.

## Gate consolidado para BUILD agrupado, 05/11/2026
- Fonte canônica: 25 documentos da revisão c2bf86d011da6bfd3abaa70de38e7a722ae629de consultados; conferir HEAD antes de promover o gate.
- Escopo: V1-23 Prompt 75, sem alterações em backend, migrations, marca ou PROD.
- Contrato HML: validar_administrador_organizacao e pode_consultar_auditoria_organizacao presentes, SECURITY INVOKER, EXECUTE authenticated, não anon. JWT A/B real não testado.
- Correção conjunta: wrapper booleano fail-closed da RPC Auditoria; separar autorização do menu Usuários e Auditoria no AppShell; proteger rota direta TrilhaAuditoria; testar logout, troca A/B, resposta obsoleta, desktop e móvel.
- TDD: testes RED para matriz de perfis e erros, depois GREEN; lint, typecheck, build, Vitest, Zero-Drift e ordem P0; Teste C independente após BUILD.
- Visual: preservar BRAND-01, verificar 1440/1280/768/390 em claro e escuro, foco, teclado, contraste e drawer. Sem evidência visual, não certificar.
- Rollback: reverter exclusivamente o commit/PR frontend da correção; nenhuma reversão de banco.
- Decisão: não confundir planejamento aprovado com testes executados. Gates sem prova permanecem PENDENTE; BUILD somente após PLANO_ATIVO VALIDADO em commit anterior e CI verde.

## ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE (OBRIGATÓRIO)
- Reutilizar ContaOS Brand v1.0 e componentes existentes. Não modificar assets, paleta, logos, estilos globais nem criar segunda identidade.
- Escopo mínimo: corrigir autorização de menu e rota V1-23 usando RPC HML existente; nenhum backend, migration, RLS, segredo, tipo certificado ou PROD.
- Economizar chamadas Lovable por implementação agrupada, preservando Design System, responsividade e acessibilidade. Nenhum atalho reduz gates, testes ou rastreabilidade.
- Evidências: PR #138, CI 42019842121, backend HEAD 3aa4af7a292b80243045e0a426ee6399ba948ff2; testes reais de BUILD ainda não executados.
