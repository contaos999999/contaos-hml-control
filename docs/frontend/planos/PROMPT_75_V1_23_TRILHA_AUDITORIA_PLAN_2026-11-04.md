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
