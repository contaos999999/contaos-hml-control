# ContaOS 4.1 — PLAN 75/V1-23: Trilha de auditoria

Estado: PROPOSTO. Não autoriza BUILD, GATE ou certificação.

P0: concluir V1 e certificar antes de V2. PROMPT 43 integrado por PR #73; checkpoint PR #74. Não alterar backend, produção, regras de segurança, BRAND-01 ou Type Lock.

Fontes: os 25 documentos canônicos do repositório normativo foram consultados, bem como manifesto, tarefa ativa e regra P0. A fonte literal do regular 75 ainda precisa de cotejo antes da validação. A ausência desse cotejo bloqueia o GATE.

Requisitos correlatos: V1-AUD-001, execução reproduzível com versões e hashes; V1-AUD-002, distinguir resultados determinísticos e semânticos; V1-AUD-003, criticidade; V1-AUD-004, fonte, localização, regra e ação sugerida; V1-AUD-005, reanálise incremental sem perda de histórico. BRAND-01 e NFRs 085 a 096 continuam obrigatórios. Não afirmar que simples listagem de eventos satisfaz esses requisitos.

Inventário antes do GATE: verificar somente leitura os contratos reais de eventos_auditoria, execucoes_analise, resultados_requisitos, evidencias_resultado, apontamentos_internos e pareceres_internos; confirmar RLS, perfil, paginação e RPCs. Definir allowlist exata de arquivos frontend apenas após esse inventário. Backend paralelo proibido.

Escopo proposto sujeito ao texto original: tela somente leitura da trilha por contrato autorizado; data/hora Brasília; evento, ator quando permitido, entidade, filtros e paginação no servidor; sem dados sensíveis, mutações ou vazamento entre organizações. Exportação não presumida.

Sequência: PLAN documental em PR separado; dois checks no mesmo HEAD e merge; GATE documental separado com PLANO_ATIVO.json 75 VALIDADO; TDD RED; BUILD mínimo; GREEN; testes de autorização, paginação, filtro, erro, acessibilidade, identidade visual, CI e Teste C; PR integrado e checkpoint; auditoria retrospectiva V1 antes de certificação.

Testes planejados: autorização e negação, isolamento por contrato, datas PT-BR, estados vazios/erros, ordenação estável, texto não interpretado como HTML, ausência de segredos, teclado e contraste em 4 larguras e 2 temas.

Pendências bloqueantes do GATE: texto literal do regular 75, inventário técnico HML e allowlist exata. V1 ainda não certificada. Não alterar PROD.


## Requisito transversal obrigatório: navegação global e acessibilidade (P0)
Antes de certificar V1, comprovar a sidebar/menu global e AppShell centralizado, BRAND-01 com logomarca oficial transparente nos estados expandido/recolhido, ativação progressiva dos módulos, rotas e navegação coerente. A trilha de auditoria deve participar desse mesmo padrão, sem criar navegação paralela.

Acessibilidade verificável: navegação integral por teclado (Tab, Shift+Tab, Enter, Escape quando aplicável), ordem de foco lógica, foco visível inclusive em modal, menus e filtros, retorno de foco após fechar diálogos, sem armadilhas; nomes acessíveis, rótulos, semântica, estados e mensagens para tecnologia assistiva; contraste de texto e componentes em temas claro e escuro. Avaliar WCAG 2.2 nível AA nos critérios aplicáveis, com medição documentada (texto comum >=4,5:1, texto grande >=3:1 e contraste não textual >=3:1 onde exigido), registrando exceções justificadas e correções. Não declarar conformidade por inspeção superficial.

Testes obrigatórios: testes automatizados unitários/de integração e regressão, testes de acessibilidade automatizados mais verificação manual por teclado, auditoria visual das telas e Teste C independente em quatro larguras e dois temas. Evidenciar resultados, falhas, correções, capturas e limitações de sessão autenticada. Evidência de mock não substitui teste real.

Rastreabilidade obrigatória no GitHub: para cada requisito, registrar matriz requisito -> implementação -> teste -> evidência -> commit -> PR -> run CI -> artefato, com dois checks obrigatórios SUCCESS no mesmo HEAD, Teste C independente e confirmação de merge. Não usar status PASS sem evidência verificável. Preservar os artefatos e indicar claramente qualquer limitação de retenção.

**BLOQUEIO P0 DE CERTIFICAÇÃO:** V1 não pode ser certificada, homologada ou liberar V2 sem aprovação comprovada desse requisito transversal de menu/sidebar e acessibilidade, além de todos os demais critérios V1, auditoria retrospectiva e PRs integrados. O bloqueio persiste mesmo se PROMPT 75 passar isoladamente. Produção depende de autorização expressa posterior.


## Verificação documental complementar (04/11/2026)
- Catálogo normativo `docs/prompts/PROMPT_TRACKS_4_1.json`: mapeamento do regular 75 para V1-23 confirmado; o próprio catálogo declara `original_manual_docx_embedded_as_git_blob=false`. Portanto, **texto literal do regular original ainda NÃO COTEJADO** e GATE permanece bloqueado.
- Migration `20261101205936_0002_identidade_organizacoes.sql`: `public.eventos_auditoria` possui `id`, `id_organizacao`, `id_usuario`, `origem`, `evento`, `entidade`, `id_entidade`, `antes`, `depois`, `metadados`, `correlation_id`, `criado_em`; índices por organização/data, entidade e correlação.
- RLS documental: política `eventos_select` limita SELECT a perfis `administrador`, `auditor`, `juridico_conformidade` vinculados à organização. Migration `20261101211500_0015_hardening_seguranca_integridade.sql` cria trigger de imutabilidade em UPDATE/DELETE. **Não equivale a ensaio operacional de isolamento HML**.
- Atenção ao escopo: tabela auditável é por organização; **não presumir filtro por contrato direto**, pois `id_contrato` não integra o esquema dessa tabela. Vínculo por entidade/metadados só após comprovar consulta segura e escopo sem vazamento. Os campos JSON `antes`, `depois`, `metadados` não devem ser expostos integralmente na UI sem política formal de redação.
- CI do HEAD `cee73b75e532661844f021bfee7f5efa190e46e0`: run `41948048364` localizado em andamento durante a consulta. **Não declarar SUCCESS antes de conclusão e dois checks no mesmo HEAD**.


## Confronto com manual de telas recuperado da biblioteca
Foi recuperada a especificação `FE_v4_Manual_Integral_Lovable_Supabase.docx` para **V1-23**. Ela define expressamente:
- **Rota `/administracao/auditoria`** (não uma rota por contrato).
- **Finalidade:** histórico filtrável de ações, entidade, usuário, `correlation_id` e representação reduzida de antes/depois.
- **Acesso:** auditor/administrador; backend `eventos_auditoria` com RLS.
- **Estados:** carregando, vazio, sucesso, erro, 403 e conflito/expirado quando aplicável.
- **Critérios:** bloqueio backend de perfil sem acesso, ausência de regra crítica calculada apenas em React, evidência/fonte acessível quando exigida, ausência de segredos em rede/bundle/console/localStorage, responsividade e teclado.

**Correção do escopo proposto:** a interface V1-23 é de administração e deve filtrar eventos por organização autorizada, não inventar uma rota por contrato. Eventual filtro por contrato é opcional somente se fonte original e API segura comprovarem seu vínculo. O documento recuperado **remete explicitamente ao PROMPT 75 do Manual Mestre**, cujo texto literal ainda não foi localizado: não substituir uma fonte pela outra. A definição de acesso `auditor/administrador` deve ser cotejada com a política backend que também permite `juridico_conformidade`; não alterar RLS sem autorização, nem conceder acesso UI adicional por inferência.

Status: **fonte de tela recuperada, texto literal do PROMPT 75 pendente, GATE ainda BLOQUEADO**.


## FONTE ORIGINAL DO PROMPT 75 RECUPERADA E CONFERIDA
Arquivo ZIP e caminho canônico completos documentados em `docs/frontend/governanca/INDICE_LOCALIZACAO_PACOTE_MESTRE_4_1.md`, com SHA-256 do ZIP, manual 100 e caderno 97. O manual `06_PROMPTS_COPIAR_COLAR/Manual_Mestre_Prompts_4_1_100_PRD.docx` foi aberto e o texto literal `PROMPT 75 - Trilha de auditoria V1-23` foi localizado. A exigência expressa é `eventos_auditoria`; filtros por usuário, evento, entidade, data e `correlation_id`; **sem payload sensível**. PLAN exige inventário de colunas/FKs/índices, RLS/grants, operações e RPC/Edge, auditoria/idempotência/lock/Queue quando aplicável, arquivos, estados, testes e ausência de segredos. BUILD exige HML, TS strict, mudanças mínimas. TESTE traz dez verificações obrigatórias: schema, isolamento A/B, perfil, fluxo autorizado, bloqueio de update, auditoria sem segredos, estados, quatro larguras, teclado/foco e Security view sem novo Critical.

**Retificação formal:** declarações anteriores de que o texto literal não havia sido localizado estão superadas por esta recuperação com hash; a fonte está disponível no anexo ZIP montado nesta sessão, **não** como blob do GitHub. A fonte original e os critérios agora estão confirmados. Ainda faltam provas de CI no HEAD atual, grants/consulta real HML, allowlist precisa e gates de segurança. Não validar GATE por simples localização.


## Inventário frontend efetivo para delimitação de BUILD (verificação 04/11/2026)
Na `main` frontend existe `src/routes/administracao.usuarios.tsx` com TanStack Router `createFileRoute("/administracao/usuarios")`, `ssr:false` e metadados PT-BR/noindex; existe `src/components/administracao/usuarios/AdminUsuarios.tsx`, com autenticação Supabase, preferência de organização e componentes administrativos. O arquivo `src/routeTree.gen.ts` é **gerado automaticamente** e não deve ser editado manualmente.

**Allowlist proposta de arquivos novos/alterados no BUILD, sujeita ao GATE:** `src/routes/administracao.auditoria.tsx`; `src/components/administracao/auditoria/TrilhaAuditoria.tsx`; `src/lib/administracao/auditoriaDados.ts`; `src/test/trilhaAuditoria.test.tsx`; arquivo de testes de acessibilidade/visual existente quando identificado; `docs/frontend/auditorias/PROMPT_75_V123_TESTES_2026-11-04.md`; checkpoint. `src/routeTree.gen.ts` somente como saída comprovada do gerador TanStack, nunca edição manual. **Não editar sidebar/AppShell em BUILD 75 sem PLAN/GATE de correção transversal próprios e rastreáveis.** Verificar se a rota integra a sidebar global e documentar lacuna P0 separadamente.

**Plano de acesso mínimo:** consulta paginada e filtrada no Supabase com `id_organizacao` autorizado; proibir seleção genérica de `antes/depois/metadados`; apresentar apenas campos não sensíveis aprovados; bloquear UI de perfis não autorizados sem tratar bloqueio visual como substituto da RLS. Revalidar política `eventos_select` que inclui `juridico_conformidade` contra especificação da tela que cita apenas auditor/administrador. **Não alterar grants/RLS neste BUILD frontend.**

**Correção do estado do PLAN:** trechos anteriores que tratavam texto original como pendente foram superados pela recuperação literal documentada na seção anterior. Permanecem pendentes confirmação operacional HML, definição final da consulta e aprovação do PLAN pelos checks. O próximo GATE depende dessas provas, não de autorização verbal genérica.


## ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE (OBRIGATÓRIO)
Requisito literal do gate canônico: não gerar backend paralelo, não editar Supabase/types, não modificar BRAND-01, não ampliar escopo de arquivos sem novo PLAN. Usar Design System, AppShell/sidebar oficial e componentes existentes; evitar duplicação de código e chamadas Lovable desnecessárias. Os testes reais HML, WCAG e Teste C de BUILD continuam pendentes e NÃO são declarados PASS por esta cláusula. Fonte: manual mestre 100 prompts, pacote oficial BRAND v1.0 e documentação normativa versionada.


## Emenda de escopo GOV-021 — 05/11/2026
A auditoria V1-23 introduziu `src/lib/administracao/auditoriaDados.ts` fora do módulo ADM-01. A varredura legada em `src/test/admUsuarios.test.tsx` inspecionava indiscriminadamente `src/lib/administracao/*`, gerando dois falsos positivos no BUILD #83 (run 41954980718, 867/869 testes PASS). A emenda autoriza exclusivamente a edição de `src/test/admUsuarios.test.tsx` para limitar a varredura de RPCs ADM-01 ao módulo `admUsuariosRpc.ts`, preservando a varredura integral dos componentes de usuários, rota de usuários, regras de proibição de escrita direta e cinco RPCs permitidas.

**ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE (OBRIGATÓRIO)**: a emenda não modifica marca, estilos, rotas, Supabase, dependências nem código funcional. Impacto visual N/A para a emenda. A inclusão da allowlist não autoriza mudanças adicionais ao teste nem altera o escopo funcional do Prompt 75. PLAN deve ser integrado separadamente antes de qualquer novo BUILD, com ambos os checks do mesmo SHA aprovados. Evidência operacional HML continua não verificada.
