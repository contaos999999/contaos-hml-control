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

## Emenda P0 V1-23 — cobertura de regressão ADM-01 (05/11/2026)
- **Motivação comprovada:** BUILD PR #141, CI 42022477957, Vitest 880 PASS/3 FAIL, causado por asserções legadas ao introduzir a RPC de capacidade read-only. Após atualização estritamente de testes, CI 42023225551 bloqueou `src/test/admUsuarios.test.tsx` por ausência da allowlist, funcionando corretamente.
- **Novo arquivo expressamente permitido:** `src/test/admUsuarios.test.tsx`. A mudança é exclusivamente nos testes estáticos de varredura: preserva a lista explícita e fechada de RPCs oficiais, incluindo `pode_consultar_auditoria_organizacao`, sem permitir outras chamadas.
- **Arquivo já permitido:** `src/test/appShellSidebar.test.tsx`: atualizar asserções para a variável `auditoriaAutorizada` que recebe `podeConsultarAuditoria(organizacao)`, mantendo invalidação de sessão, falha fechada e regressões DOM.
- **Autoridade:** backend `contaos999999/develop` contém migration `20261105102019_v123_auditoria_capacidade.sql`; frontend não cria RPC nem altera schema/RLS. Isolamento autenticado real continua pendente.
- **Execução obrigatória:** validar o PLAN em PR separado e CI verde; **somente após merge e novo HEAD main** criar BUILD novo a partir desse HEAD (não reaproveitar commits de código anteriores ao PLAN). Reexecutar Zero-Drift, Vitest, typecheck, lint, build e Teste C. Sem certificar V1 pela mera passagem dos testes.
- **Rollback:** reverter o PR de BUILD; não abrir permissões nem relaxar o guard de escopo. Nenhuma alteração de assets BRAND-01 ou PROD.

## ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE (OBRIGATÓRIO)
A emenda mantém todos os controles e a identidade visual canônica, sem custo de novo Lovable, sem interfaces ou componentes extras. Somente inclui teste existente na allowlist depois de evidência de falha real e necessidade de regressão.

## Emenda P0 — revalidação imediata de organização no AppShell (05/11/2026)

**Constatação reproduzível por inspeção:** `src/lib/organizacao/preferenciaOrganizacao.ts` grava no sessionStorage sem notificação local. `OrganizationSelector.tsx` já limpa React Query ao mudar A→B, mas `ContaOSAppShell.tsx` revalida apenas por pathname, auth e visibility; troca A→B que mantém a mesma rota pode apresentar menu da organização anterior até outro evento. Não usar preferência local como autorização.

**Correção mínima e fechada:** `src/lib/organizacao/preferenciaOrganizacao.ts` emite evento local sem dados pessoais **apenas quando a preferência muda**; `ContaOSAppShell.tsx` escuta este evento, invalida geração de auth/autorizações em voo, fecha o menu, nega links administrativos imediatamente e refaz verificação pelo backend. Os arquivos `src/components/layout/ContaOSAppShell.tsx` e `src/test/appShellSidebar.test.tsx` já constam da allowlist. Inclusão somente de `src/lib/organizacao/preferenciaOrganizacao.ts` e `src/test/selecionarOrganizacao.test.tsx` na allowlist existente. O seletor de organização e o backend não serão modificados.

**Testes RED→GREEN:** preferência por usuário, nenhum evento se mesma organização, evento na troca, listener de AppShell e limpeza, resposta autorizadora antiga descartada após troca, resposta nova só após RPC, timeout/erro de autorização continua fail-closed, logout, UI existente; rodar 100% Vitest (2 workers), typecheck, lint, build, scope gate, Zero-Drift, P0 por versão e Teste C independente.

**Limites de certificação:** esta correção não prova RLS nem isolamento real entre usuários (ressalva expressa), não substitui a verificação de recuperação de senha, contraste WCAG em telas privadas, segurança dos SECURITY DEFINER, restore/Auto-Lock ou retroauditoria V1. Todos os itens precisam de prova ou decisão formal específica. Sem promoção de PROD.

**Sequência:** merge deste PLAN somente com dois checks CI verdes; iniciar BUILD em nova branch baseada no HEAD integrado. Nenhum código antes do PLAN. Após BUILD e Teste C, registrar relatório atualizado de pendências e decisão GO/NO-GO para certificação com exatamente três ressalvas.

## ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE (OBRIGATÓRIO)
Preservar 100% da ContaOS Brand v1.0 e assets. Sem alterações visuais ou backend. Reutilizar autenticação e testes existentes, edição direta GitHub, minimizando retrabalho e chamadas Lovable sem diminuir controles.


---

## Emenda transversal prioritária — 27 telas, evidência visual 06/11/2026

**Fonte:** quatro capturas reais do diretor (Painel, Contratantes, Contratos e Trilha de Auditoria), checkpoint #166, comentários 6684615020 e 6684808574. **Prioridade P0 sobre correções secundárias da V1.** Integra esta emenda ao plano único, sem novos planos fragmentados.

### Falhas de arquitetura visual comprovadas por código

- `ContaOSAppShell.tsx`: sidebar global presente, porém falta header/contexto organizacional persistente; a troca de rota revalida RBAC, mas não preserva apresentação do nome/status. NÃO deduzir autorização da preferência local.
- `Dashboard.tsx`: obtém `organizacao.razao_social`, `nome_fantasia`, `situacao` por `obter_resumo_dashboard`; informação atualmente local ao Painel.
- `ListaContratantes.tsx`: `Cabecalho` local com `ContaOSMarca`, botões Painel/Selecionar organização/Sair; gera segunda logomarca e barra incompatível com o painel.
- `TrilhaAuditoria.tsx`: header local, logo condicional mobile, filtros sem container/card, tabela e paginação sem design system uniforme; falta header global.
- `ContaOSSidebar.tsx`: navegação com superfícies genéricas, sem diferenciação visual adequada ao BRAND-01.
- `ListaContratos.tsx` e demais componentes: inventariar todos os headers/brands locais e impedir duplicidade; NÃO presumir correção sem inspeção.

### Regras de aceite por componente e em TODAS as 27 telas reais

1. **AppShell único:** header global com nome e situação da organização ativa da sessão, trocar organização e sair, título/breadcrumb coerentes; todas as páginas autenticadas recebem o mesmo header, inclusive Auditoria. Fallback seguro quando organização ainda não verificada. Não exibir contexto obsoleto ao trocar organização ou usuário.
2. **Logomarca única:** somente na sidebar do ambiente autenticado (expandida, recolhida, drawer mobile). Remover marca dos headers e helpers locais; telas públicas login/recuperação ficam sujeitas ao BRAND-01 específico. Usar SVGs oficiais transparentes, contraste correto light/dark e área de proteção.
3. **Menu BRAND-01:** navy #0F172A, azul #0EA5E9, teal #14B8A6, superfície #F1F5F9 conforme tokens existentes; tipografia Inter se já disponível. Hierarquia de grupos, estado ativo, hover, foco, modo recolhido e mobile, sem recriar paleta ou usar efeito que comprometa WCAG. O pedido de aparência cinematográfica não autoriza animações pesadas ou alteração de lógica.
4. **Design system transversal:** cards, tabelas, filtros, paginação, formulários, botões, títulos, espaços, mensagens vazias/erro/carregamento, responsividade e navegação por teclado.
5. **Trilha Auditoria:** filtros em card com grid responsivo, tabela em container com rolagem horizontal acessível e colunas de IDs tratadas para não romper largura; cabeçalho e paginação alinhados ao restante.
6. **Provas individuais:** inventário exato das 27 telas (rota, componente, papel exigido), captura em 1440/1280/768/390 × light/dark, estados de acesso e dados, testes de transição Painel→Contratantes→Novo Contrato→Contratos→Auditoria, sessão/org e duplicidade de logos; 72 checks BRAND-01 individuais. Status PASS somente por evidência; tela inacessível = BLOCKED, não PASS.

### Plano de BUILD agrupado, sob gates existentes

- **Gate 1 (PLAN):** conferir 25 fontes canônicas, 72 itens BRAND, inventário 27 rotas, HEAD frontend/backend, contratos RPC para obter nome/status com RLS, allowlist e teste C planejado; aprovar escopo dos componentes reais em PR documental com CI Zero-Drift/Teste C SUCCESS.
- **Gate 2 (RED):** adicionar testes que falhem para header persistente, marca exclusiva do menu, alternância de org, logout e auditoria responsiva; registrar execução RED antes do BUILD.
- **Gate 3 (BUILD):** implementar AppShell + header + sidebar + remover headers locais + componentes de UI em PR(s) técnicos agrupados, mantendo rotas, permissões, Auth, RPCs, tipos e backend intactos; conflito de contrato backend é NO-GO isolado, não pretexto para inventar dados.
- **Gate 4 (GREEN/AUDIT):** CI, testes funcionais, 27 telas × 8 variantes, 72 BRAND, Zero-Drift, Teste C, evidências e hashes, aprovação no HEAD, merge e checkpoint. Apenas depois reportar percentual real 27/27.

**Regra de integridade:** esta emenda é autorização de planejamento, NÃO certificação visual nem autorização para modificar arquivos fora da allowlist ativa. O trabalho só está concluído quando houver prova real em todas as 27 telas. V1 permanece NO-GO.


## Emenda executável de escopo visual — 06/11/2026, continuação do PR #223
Baseline frontend `e2172c70f38addb1785f798c6cc6fadd0e032e48`; backend `01fa7d7a803ba8507a5ca6d89eb4ce45b2893bea`. PR #223 integrado, ambos checks SUCCESS no commit `29d9a67d7b9b01e674532f30e6c820662e810683`, run 42228480428. Conferência dos 25 blobs atuais com snapshot: 25 iguais. Isso reutiliza integridade das fontes; não constitui nova certificação dos 100/97 prompts.
### Correção do inventário
Inspeção de todas as entradas `createFileRoute`: **28 rotas de página**, excluindo __root; 24 organizacionais e 4 públicas/seletor. A expressão histórica “27 telas” não corresponde ao inventário atual. Nenhuma rota será criada, removida ou renumerada. Perfil efetivo é determinado pelos gates RBAC/RLS já implementados em cada componente; não presumir admin para todas as rotas nem liberar por preferência local.
| Nº | Rota real | Componente | Acesso preservado | Evidência visual |
|---|---|---|---|---|
| 1 | `/administracao/auditoria` | `administracao/auditoria/TrilhaAuditoria` | RBAC/RLS existente do componente, sem ampliação | NÃO VERIFICADO |
| 2 | `/administracao/usuarios` | `administracao/usuarios/AdminUsuarios` | RBAC/RLS existente do componente, sem ampliação | NÃO VERIFICADO |
| 3 | `/competencias/$id` | `competencias/CompetenciaVisaoGeral` | RBAC/RLS existente do componente, sem ampliação | NÃO VERIFICADO |
| 4 | `/competencias/$id/analise` | `competencias/CompetenciaAnalise` | RBAC/RLS existente do componente, sem ampliação | NÃO VERIFICADO |
| 5 | `/competencias/$id/apresentacoes/$apresentacaoId` | `competencias/CompetenciaProtocolo` | RBAC/RLS existente do componente, sem ampliação | NÃO VERIFICADO |
| 6 | `/competencias/$id/apresentar` | `competencias/CompetenciaApresentar` | RBAC/RLS existente do componente, sem ampliação | NÃO VERIFICADO |
| 7 | `/competencias/$id/documentos` | `competencias/CompetenciaDocumentos` | RBAC/RLS existente do componente, sem ampliação | NÃO VERIFICADO |
| 8 | `/competencias/$id/parecer` | `competencias/CompetenciaParecer` | RBAC/RLS existente do componente, sem ampliação | NÃO VERIFICADO |
| 9 | `/contratantes` | `contratantes/ListaContratantes` | RBAC/RLS existente do componente, sem ampliação | NÃO VERIFICADO |
| 10 | `/contratantes/$id/editar` | `contratantes/EditarContratante` | RBAC/RLS existente do componente, sem ampliação | NÃO VERIFICADO |
| 11 | `/contratantes/novo` | `contratantes/NovoContratante` | RBAC/RLS existente do componente, sem ampliação | NÃO VERIFICADO |
| 12 | `/contratos` | `contratos/ListaContratos` | RBAC/RLS existente do componente, sem ampliação | NÃO VERIFICADO |
| 13 | `/contratos/$id` | `contratos/VisaoGeralContrato` | RBAC/RLS existente do componente, sem ampliação | NÃO VERIFICADO |
| 14 | `/contratos/$id/base-normativa` | `contratos/BaseNormativaContrato` | RBAC/RLS existente do componente, sem ampliação | NÃO VERIFICADO |
| 15 | `/contratos/$id/competencias` | `contratos/CompetenciasContrato` | RBAC/RLS existente do componente, sem ampliação | NÃO VERIFICADO |
| 16 | `/contratos/$id/competencias/nova` | `contratos/NovaCompetencia` | RBAC/RLS existente do componente, sem ampliação | NÃO VERIFICADO |
| 17 | `/contratos/$id/documentos` | `contratos/DocumentosContrato` | RBAC/RLS existente do componente, sem ampliação | NÃO VERIFICADO |
| 18 | `/contratos/$id/documentos/$idDocumento` | `contratos/DocumentoDetalhe` | RBAC/RLS existente do componente, sem ampliação | NÃO VERIFICADO |
| 19 | `/contratos/$id/historico` | `contratos/HistoricoContrato` | RBAC/RLS existente do componente, sem ampliação | NÃO VERIFICADO |
| 20 | `/contratos/$id/historico/importar` | `contratos/ImportarHistorico` | RBAC/RLS existente do componente, sem ampliação | NÃO VERIFICADO |
| 21 | `/contratos/$id/orcamento` | `contratos/OrcamentoContrato` | RBAC/RLS existente do componente, sem ampliação | NÃO VERIFICADO |
| 22 | `/contratos/$id/regras` | `contratos/RegrasContrato` | RBAC/RLS existente do componente, sem ampliação | NÃO VERIFICADO |
| 23 | `/contratos/novo` | `contratos/NovoContrato` | RBAC/RLS existente do componente, sem ampliação | NÃO VERIFICADO |
| 24 | `/esqueci-senha` | `auth/ForgotPasswordForm` | publico | NÃO VERIFICADO |
| 25 | `/` | `dashboard/Dashboard` | RBAC/RLS existente do componente, sem ampliação | NÃO VERIFICADO |
| 26 | `/login` | `auth/LoginForm` | publico | NÃO VERIFICADO |
| 27 | `/redefinir-senha` | `auth/ResetPasswordForm` | publico | NÃO VERIFICADO |
| 28 | `/selecionar-organizacao` | `organizacao/OrganizationSelector` | sessao_sem_org | NÃO VERIFICADO |
### Arquivos de apresentação expressamente abrangidos
- `src/components/administracao/auditoria/TrilhaAuditoria.tsx`
- `src/components/administracao/usuarios/AdminUsuarios.tsx`
- `src/components/competencias/CompetenciaAnalise.tsx`
- `src/components/competencias/CompetenciaApresentar.tsx`
- `src/components/competencias/CompetenciaDocumentos.tsx`
- `src/components/competencias/CompetenciaParecer.tsx`
- `src/components/competencias/CompetenciaProtocolo.tsx`
- `src/components/competencias/CompetenciaVisaoGeral.tsx`
- `src/components/contratantes/EditarContratante.tsx`
- `src/components/contratantes/ListaContratantes.tsx`
- `src/components/contratantes/NovoContratante.tsx`
- `src/components/contratos/BaseNormativaContrato.tsx`
- `src/components/contratos/CompetenciasContrato.tsx`
- `src/components/contratos/DocumentoDetalhe.tsx`
- `src/components/contratos/DocumentosContrato.tsx`
- `src/components/contratos/HistoricoContrato.tsx`
- `src/components/contratos/ImportarHistorico.tsx`
- `src/components/contratos/ListaContratos.tsx`
- `src/components/contratos/NovaCompetencia.tsx`
- `src/components/contratos/NovoContrato.tsx`
- `src/components/contratos/OrcamentoContrato.tsx`
- `src/components/contratos/RegrasContrato.tsx`
- `src/components/contratos/VisaoGeralContrato.tsx`
- `src/components/dashboard/Dashboard.tsx`
- `src/styles.css`
- `src/components/layout/ContaOSOrganizationHeader.tsx`
- `src/test/visualShell.test.tsx`
- `src/test/trilhaAuditoria.test.tsx`
- `src/test/admUsuarios.test.tsx`
- `src/test/appShellSidebar.test.tsx`
- `src/test/baseNormativa.test.tsx`
- `src/test/brand.test.tsx`
- `src/test/competenciaAnalise.test.tsx`
- `src/test/competenciaApresentar.test.tsx`
- `src/test/competenciaDocumentos.test.tsx`
- `src/test/competenciaParecer.test.tsx`
- `src/test/competenciaProtocolo.test.tsx`
- `src/test/competenciaVisaoGeral.test.tsx`
- `src/test/competenciasContrato.test.tsx`
- `src/test/contratantes.test.tsx`
- `src/test/contratoDetalhe.test.tsx`
- `src/test/contratos.test.tsx`
- `src/test/dashboard.test.tsx`
- `src/test/documentoDetalhe.test.tsx`
- `src/test/documentosContrato.test.tsx`
- `src/test/editarContratante.test.tsx`
- `src/test/historicoContrato.test.tsx`
- `src/test/ingestaoHistorico.test.tsx`
- `src/test/novaCompetencia.test.tsx`
- `src/test/novoContratante.test.tsx`
- `src/test/novoContrato.test.tsx`
- `src/test/orcamento.test.tsx`
- `src/test/rbacMatriz.test.tsx`
- `src/test/regrasContrato.test.tsx`
- `src/test/requisitoDetalhe.test.tsx`
O escopo inclui ainda AppShell/Sidebar e testes preexistentes da allowlist. Testes legados só podem mudar asserções de apresentação afetadas pelo header global, nunca remover provas de autorização, dados ou regras. Arquivos de rotas, árvore gerada, tipos e integração Supabase continuam proibidos nesta emenda; assets públicos oficiais ficam intactos.
### Contrato de apresentação do cabeçalho
Reutilizar exclusivamente `obter_resumo_dashboard(p_id_organizacao)`, schema `sys05-v1`, organização `id/razao_social/nome_fantasia/situacao`, já consumido pelo Dashboard. Não deduzir nome/status de sessionStorage; a preferência só escolhe o ID a verificar. Validar que ID retornado é o solicitado, strings válidas e esquema correto. Falha/negação não usa dados anteriores nem concede permissões. Consulta isolada por usuário/organização; limpar imediatamente em logout/troca, descartar respostas antigas e não derrubar RBAC/menu por indisponibilidade do resumo. Não alterar contrato de RPC nem tipos certificados. Reutilizar cache do Dashboard quando seguro, sem ler estado de usuário anterior.
Centralizar apenas apresentação das ações existentes de trocar organização e sair. Logout usa fluxo Supabase já existente, limpa contexto, trata falha sem afirmar sucesso e redireciona somente após sucesso. Preservar avisos de alterações não salvas e ações específicas da página.
### Tokens e marca
Tokens atuais confirmados em `src/styles.css`; reutilizar namespace sidebar existente, centralizando somente navy/azul/teal/superfície oficiais em oklch. Contraste WCAG com estados visíveis, sem cores hardcoded espalhadas. Inter somente se disponível, nenhuma nova dependência/fontes de rede. Logo branca oficial no menu navy, símbolo branco recolhido, drawer móvel com logo; nenhum redesenho ou edição de SVG/favicon/PWA. Fora do shell, as quatro rotas de acesso/seletor preservam sua marca atual.
### Execução e evidências
1. Integrar este gate documental somente após Zero-Drift e Teste C SUCCESS no mesmo HEAD; nenhum BUILD antes.
2. Nova branch a partir do merge. RED com header persistente entre rotas, ID incompatível, erro/negação, logout, troca A/B e resposta obsoleta; logo somente menu; filtros/tabela/paginação da Auditoria responsivos.
3. Implementar somente apresentação e testes fechados; lint/typecheck/build/regressão, types blob imutável e gates.
4. Teste C read-only, 28 rotas × 8 variantes (224 combinações), 72 BRAND individuais. Rota privada inacessível = BLOCKED, nunca PASS; captura de login não prova tela privada. Não executar Auth/fixtures/banco com esta emenda.
5. CI e Teste C precisam aprovar o HEAD exato antes de merge. Registrar evidências, limitações e próximo passo na issue #166. Rollback: reverter exclusivamente PR frontend visual, sem banco.
**Limite operacional:** Git CLI neste executor não autenticado; cópia de fontes obtida por conector GitHub. Instalação local ainda não comprovada. Nenhum teste local/RED/BUILD/captura executado por esta emenda; utilizar CI canônico sem modificar workflows para contornar limitação.
### ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE (OBRIGATÓRIO)
Continuação do plano único já autorizado pelo titular, sem outro plano fragmentado. Edição GitHub direta, zero chamadas de BUILD Lovable, sem biblioteca nova, sem backend/PROD, sem alteração de rotas ou tipos. Gate valida escopo e requisitos de execução, não marca testes não realizados como PASS. V1 permanece NO-GO.

## Compatibilidade do guard com marca única — 06/11/2026
**Conflito comprovado antes da integração do BUILD:** `scripts/frontend-zero-drift.mjs` linhas 51–55 exige literalmente `<ContaOSMarca` em cada página autenticada. O critério antigo reprova a marca exclusiva do menu expressamente aprovada no PR #223. Não inserir marca invisível, comentário artificial ou duplicata para satisfazer o verificador.
**Escopo adicional fechado:** `scripts/frontend-zero-drift.mjs` e novo `scripts/frontend-zero-drift.test.mjs`. Somente adequar aplicação da marca: quatro rotas de acesso/seletor mantêm ContaOSMarca; 24 páginas organizacionais recebem marca pela sidebar e não podem conter marca local; root deve envolver Outlet em AppShell, shell deve incluir header e sidebar com logos oficiais. Expandir inventário do guard/teste de marca para todos os 28 caminhos constatados. Manter integralmente hash types, SHA dos assets, PT-BR, scan de credenciais, Teste C e branch protection.
**Autotestes RED→GREEN obrigatórios:** caso centralizado válido PASS; remover AppShell/root FAIL; marca duplicada em página FAIL; ausência do header global FAIL; ausência de asset branco do menu FAIL; ausência de marca pública FAIL. Nenhuma mudança em workflow, backend, tipos, RLS, rotas, assets ou PROD. PR documental e ambos checks antes da alteração desse guard. Demais alterações de apresentação continuam sob a allowlist já aprovada no PR #224.
**Prova local já executada:** dez testes de reprodução falharam antes do BUILD e os mesmos dez passaram após correção local. Regressão identificou testes antigos que pressupunham marca local; adaptar somente asserções de apresentação, preservando autorização. Validação integral e visual ainda pendentes, V1 NO-GO.
### ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE (OBRIGATÓRIO)
Esta emenda pertence ao mesmo plano mestre. Conservar força dos controles com provas negativas explícitas; não mudar o critério para esconder falha. Sem Lovable BUILD e sem biblioteca nova.
