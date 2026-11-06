# ContaOS 4.1 — Plano único de operações pelo frontend
Data: 06/11/2026, America/Bahia.
Status: PLANO MESTRE PROPOSTO; não é BUILD, autorização de deploy, certificado ou declaração de CI.
Decisão do titular: operar criação, consulta, edição, ativação, desativação, exclusão permitida e encerramento pelo frontend, mantendo Supabase como backend exclusivo.

## Objetivo e arquitetura
Disponibilizar a experiência operacional completa na interface React/TypeScript. Reutilizar Data API sob RLS para CRUD simples já autorizado; usar RPC ou Edge Function autenticada para ações materiais, administrativas e transições críticas. Toda autorização e validação material permanece no Supabase.
A coordenação é única; entregas são incrementais, com PLAN/GATE/RED/BUILD/GREEN/Teste C próprios, sem um deploy massivo.
Implementar V1 e certificar antes de iniciar PLAN/BUILD de V2. V2–V5 abaixo representam somente cobertura futura do programa, sem antecipação dos planos dessas versões.

## Fontes e limitações da evidência
Fontes consultadas: documentos canônicos 00–20, AGENTS.md dos dois repositórios, P0_PRIORIDADE_ZERO_ORDEM_POR_VERSAO_4_1.md, P0_ORDEM_POR_VERSAO_4_1.json, PLANO_ATIVO.json, AI_CONTEXT_MANIFEST.md, active-task backend, plano único backend existente.
Inspeção de código: src/lib/administracao/rbacRpc.ts e src/components/contratos/VisaoGeralContrato.tsx.
O catálogo RBAC atual inclui 17 recursos e 48 pares recurso/ação para 10 perfis, mas não inclui ações genéricas ativar/desativar/excluir/encerrar. Não adicioná-las só no frontend nem presumir que editar autoriza todas as transições.
A visão geral de contrato possui links contextuais, sem formulário/ação de edição ou transição de situação no arquivo inspecionado.
O manifesto frontend registra 28 rotas, sendo 24 organizacionais e 4 públicas/seletor; reconciliar com runtime antes de homologar. Contagem de rotas não equivale a quantidade de telas nem a cobertura funcional.
Issue backend #89 trata a operação canônica de contratos; PR backend #57 trata inventário documental RBAC. Revalidar estados atuais antes de alterar: não confundir inventário com implementação RBAC, já registrada em entregas posteriores.
Nenhum teste autenticado ou alteração de dados foi executado nesta elaboração.

## Regras comuns
- HML gklhhhyosgasnyoxlrui; PROD fora deste plano.
- Não apagar auditoria, versões documentais, análises anteriores ou pacotes apresentados.
- Não inventar enum, status, campo, permissão, RPC ou rota sem confrontar requisito e schema vigente.
- MASTER administrativo global continua sujeito a sessão, auditoria e segregação especializada.
- LOCK-TYPES-01 preservado: src/integrations/supabase/types.ts blob 8ea7750b75fd9d76b29c36ce7613392e3ab65e19.
- Rotas TanStack novas exigem geração real de src/routeTree.gen.ts e GOV-020; nunca editar árvore manualmente.
- Operações usuais não devem exigir painel Supabase, SQL manual ou credenciais privilegiadas do usuário.
- Segurança também deve negar a chamada direta à API quando a ação não for autorizada.

## Matriz funcional de cobertura V1
As ações abaixo são alvos de integração, sujeitas à confirmação da regra canônica. “Reativar” não significa reabrir automaticamente estado terminal.

| Domínio | Operações pela interface | Preservação/restrições |
| --- | --- | --- |
| Organizações | criar, consultar, editar, ativar/desativar quando permitido | validar dependências, sessão e efeitos sobre usuários/vínculos; manter história |
| Usuários e vínculos | convidar/criar conforme fluxo Auth vigente, editar cadastro permitido, vincular/desvincular, ativar/desativar acesso, administrar perfis | operações Auth administrativas somente no backend; revogação efetiva; não alterar senha diretamente pelo React |
| Contratantes | criar, consultar, editar, ativar/desativar conforme contrato existente | preservar contratos vinculados e concorrência |
| Contratos | criar, consultar, editar campos permitidos; transições de ativar/suspender/encerrar/cancelar conforme matriz oficial | não tratar desativação como exclusão; preservar versões, competências e documentos |
| Normativos/fontes | cadastrar, consultar, versionar, corrigir metadados permitidos, definir vigência, aprovar/publicar quando autorizado | fonte, temporalidade e aprovação humana preservadas |
| Orçamentos/rubricas | criar proposta/linhas, editar rascunho, versionar, aprovar quando autorizado | valores e alterações materiais invalidadoras seguem backend |
| Listas/regras | criar, editar rascunhos, versionar, publicar/desativar conforme governança | snapshots de competências anteriores preservados |
| Documentos | anexar, consultar/download autorizado, corrigir metadados permitidos, substituir por nova versão, reprocessar quando permitido | Storage privado; sem sobrescrever ou apagar evidências históricas |
| Competências | abrir, consultar, corrigir dados permitidos e executar transições oficiais | sem botão que atribua liberação ou VALIDADA diretamente |
| Análises/requisitos | solicitar análise/reanálise, consultar execuções, vincular evidências e registrar correções permitidas | processamento assíncrono; análises anteriores imutáveis |
| Pareceres | criar/editar minuta e encaminhar/aprovar com papel apropriado | MASTER não ganha automaticamente direcao_aprovador |
| Apresentações/protocolos | avaliar elegibilidade, gerar pacote, apresentar e registrar protocolo | 100%, parecer e hash/contexto; pacote imutável |
| Histórico | importar, associar, revisar extrações, registrar resposta/desfecho e correções versionadas | precedente não vira obrigação automaticamente |
| Auditoria | consultar, filtrar, detalhar e exportar se autorizado | sem edição/exclusão de eventos pela interface |

## Política explícita de exclusão
1. Para cada entidade, identificar se o PRD permite exclusão física, descarte de rascunho ou somente cancelamento/inativação/versionamento.
2. Exibir “Excluir” apenas quando houver contrato backend específico compatível com histórico, referências e política de retenção. Este pedido não autoriza apagar registros reais nem auditoria.
3. Exclusão permitida exige alvo identificado, dependências verificadas, autorização, confirmação clara, controle de concorrência e evento rastreável.
4. Sem autorização canônica para apagar, usar a ação real permitida e explicar na interface. Não mascarar falha como sucesso.
5. Ensaios de exclusão somente com fixtures sintéticas isoladas.

## Contrato de comando por operação
Reutilizar assinatura existente antes de criar. Para lacuna real, documentar função, parâmetros e retorno exatos no plano backend derivado, após inventário.
Campos conceituais a mapear aos contratos reais: alvo, contexto organizacional, campos permitidos, versão esperada, justificativa quando exigida e chave idempotente quando aplicável.
A identidade do ator vem da sessão validada; não confiar em usuário/perfil enviado no payload.
Retorno deve permitir mostrar resultado confirmado, situação e versão atuais, identificador de operação/auditoria quando previsto, sem expor segredo ou stack trace.
Tratar: não autenticado, sem permissão, inexistente, validação, transição proibida, dependências, versão obsoleta, replay idempotente e falha transitória.
Repetir a mesma chave só para o mesmo comando/payload; nova intenção exige nova chave. Commit de alteração e auditoria deve ser atômico quando aplicável.
Toda alteração material deve manter os mecanismos existentes de invalidação de portão/hash.

## Entregas executáveis, na ordem
### E1 — Inventário reconciliado e escopo fechado
- [ ] Revalidar HEADs/checkpoints e estado de #57/#89, sem reexecutar entregas válidas.
- [ ] Enumerar rotas, telas, formulários, comandos, RPCs, grants, políticas e testes V1.
- [ ] Para cada entidade/ação: requisito, operação existente, papel, estados origem/destino, dependências, chamada frontend e prova.
- [ ] Classificar EXISTENTE_COM_PROVA / EXISTENTE_SEM_PROVA / LACUNA / PROIBIDO_PELA_REGRA / NÃO_APLICÁVEL.
- [ ] Produzir mapa de arquivos fechado por entrega; não habilitar BUILD com allowlist genérica.

### E2 — Backend canônico de contratos e permissões necessárias
- [ ] Confirmar estados/atributos editáveis e lacunas de #89 contra migrations/RPCs atuais.
- [ ] Elaborar plano backend separado dentro deste programa, com objetos exatos, autorizações, reversão e testes; registrar manifesto vigente.
- [ ] Definir significado e granularidade de cada permissão de transição no backend; reconciliar consumidores RBAC sem romper schema_versao rbac-v1 ou validações rígidas atuais.
- [ ] Teste RED para edição válida, edição proibida, transição permitida/proibida, stale version, repetição e isolamento de alvo.
- [ ] Gerar migration com CLI real quando necessária, preservando migrations aplicadas; deploy pelo fluxo canônico de paridade GitHub/HML.
- [ ] GREEN com JWTs HML apropriados, auditoria, ausência de efeitos em negativas e restore limpo.
- [ ] Resolver conflito documental de #57 preservando conteúdo válido; não tratar seu merge como prova de permissões ou de contratos.

### E3 — Contratos operáveis pelo frontend
Arquivos existentes de partida confirmados:
- src/components/contratos/VisaoGeralContrato.tsx
- src/lib/administracao/rbacRpc.ts
- src/test/contratoDetalhe.test.tsx (referenciado no manifesto; confirmar conteúdo antes do BUILD)
Arquivos novos, rota de edição e testes de comandos serão nomeados no plano derivado após assinatura backend verificada; não inventar contrato de API nesta etapa.
- [ ] Commit documental prévio e CI verde do plano/escopo.
- [ ] RED para formulário/ações, autorização, validação, cancelamento de confirmação e conflitos.
- [ ] Integrar comandos canônicos ao formulário e modal, com justificativa quando exigida.
- [ ] Bloquear duplicidade, mostrar progresso/erro/sucesso e preservar dados digitados em erro recuperável.
- [ ] Após confirmação backend, invalidar consultas corretas de detalhe/lista/dashboard e atualizar situação/histórico.
- [ ] Se mudar organização durante solicitação, descartar resposta obsoleta e impedir vazamento de cache/feedback.
- [ ] GREEN, CI e Teste C autenticado com backend real.

### E4 — Completar os demais domínios V1 por delta
- [ ] Seguir matriz acima começando por organizações, usuários/vínculos e contratantes, depois cadastros contratuais e fluxo mensal.
- [ ] Reutilizar operações existentes. Nova lacuna material segue E2 antes de conexão frontend.
- [ ] Em cada domínio, entregar escrita real + consulta atualizada + auditoria + autorização + negativas.
- [ ] Não liberar botão sem implementação ou usar mock/localStorage como persistência de negócio.
- [ ] Completar upload/worker, histórico e auditoria funcional pendentes sem apagar rastreabilidade anterior.

### E5 — Navegação e interface integral
- [ ] Catálogo único de rotas/ações, com links de lista→detalhe→edição e retorno contextual.
- [ ] MASTER visualiza todos os módulos V1 implementados, respeitando contexto exigido, autorização e segregação.
- [ ] Organização selecionada e situação presentes consistentemente no shell; contrato/competência quando aplicáveis.
- [ ] Permissões e caches revalidados em troca de organização, revogação, logout e mudança de papel.
- [ ] Mesmos componentes/tokens, labels, confirmações e feedback em todas as telas.
- [ ] Capturas reais 1440/1280/768/390, claro/escuro; teclado, foco, contraste, drawer e estados.

### E6 — Homologação e certificação V1
- [ ] Cenário real: autenticar MASTER→selecionar organização→criar contratante/contrato→editar→transição permitida→abrir competência→documentos→worker→análise→correção/reanálise→parecer autorizado→apresentação/protocolo.
- [ ] Ensaiar perfis comuns, acesso direto negado, sessão revogada, concorrência, repetição e troca de contexto; fixtures isoladas.
- [ ] Recuperação SYS-03, RNFs e demais pendências obrigatórias da V1 preservados no escopo de fechamento.
- [ ] Confrontar todos os requisitos V1 e NFRs aplicáveis com provas; não somar versões futuras como V1 pronta.
- [ ] Lint, typecheck, testes, build, scan de secrets, Context Gate, Architecture Guard, Zero-Drift, LOCK-TYPES e GOV-020.
- [ ] Dois checks obrigatórios SUCCESS no mesmo SHA; Teste C independente sem editar durante a avaliação.
- [ ] Registrar PRs, SHAs, CI, evidências, limitações e certificado integrado. Ausência de prova obrigatória mantém PENDENTE/NO-GO.

## Cobertura futura do mesmo programa, bloqueada até a certificação anterior
V2: diligências, apontamentos, planos de ação, contestações, rodadas, reapresentação e parecer externo, com transições próprias.
V3: importações, fornecedores, transações, conciliação, alertas e orçamento vivo; correções financeiras rastreáveis.
V4: precedentes, regras candidatas, alertas históricos, perfil de contratante e inteligência; publicação material requer fonte e aprovação.
V5: controles, execuções, não conformidades, remediações, exceções, normativos, riscos, clientes API/webhooks e portal; revogações/segredos somente em operações backend apropriadas.
Estas são linhas de cobertura, não planos dessas versões nem autorização de antecipação. Cada versão terá catálogo de ações e certificado próprios no momento permitido.

## Revisão de falhas prováveis
- Formulário aberto antes da revogação: comando precisa ser negado pelo servidor sem efeitos.
- Resposta tardia após troca de organização: não pode repovoar tela/cache da nova organização.
- Registro com dependentes: exclusão/transição precisa respeitar regra e mostrar motivo compreensível.
- Dois operadores e duplo clique: conflito/replay não pode sobrescrever silenciosamente nem duplicar eventos.
- Mutação após liberação: portão/contexto deve ser invalidado pelo backend; UI reflete bloqueio.

## Evidências e continuidade
Por entrega: requisito→tela/rota→ação→contrato backend→perfil/contexto→teste→resultado→SHA→CI→artefato.
Checkpoint deve distinguir plano, implementação, deploy, teste e certificação. Próxima tarefa concreta: E1, fechar inventário de ações V1 e contrato técnico da issue #89 antes de E2/E3.
Não marcar este documento VALIDADO no PLANO_ATIVO.json nem ampliar allowlist de app por sua simples criação.
A integração deste plano documental não certifica V1 nem aplica mudanças Supabase.

## ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE
Marca: ContaOS Brand v1.0 / BRAND-01; preservar assets, ContaOSMarca, Design System e tokens (REUTILIZAR > ESTENDER > CRIAR).
Nesta entrega exclusivamente documental: impacto_visual N/A, nenhuma alteração de UI, schema, RPC, Auth, Storage ou permissão. Implementações futuras exigem matriz visual e gates próprios.
Código frontend via GitHub conforme ADR-DEV-001; Lovable apenas sincronização/preview. GitHub e Supabase diretos para inspeção e prova quando suficientes; menor delta conforme; sem repetir turno pendente ou evidência ainda válida.
Nunca reduzir TDD, CI, segurança, fidelidade ao PRD, Teste C ou aprovação específica obrigatória.
Resultado desta elaboração: IDENTIDADE VISUAL N/A; ECONOMIA LOVABLE sem acionamento de BUILD; ZERO-DRIFT ainda não classificado por CI.
