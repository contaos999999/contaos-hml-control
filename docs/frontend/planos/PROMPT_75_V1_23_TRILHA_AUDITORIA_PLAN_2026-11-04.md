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
