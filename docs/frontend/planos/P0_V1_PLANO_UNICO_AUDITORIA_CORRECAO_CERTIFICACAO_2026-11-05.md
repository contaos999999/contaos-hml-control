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
