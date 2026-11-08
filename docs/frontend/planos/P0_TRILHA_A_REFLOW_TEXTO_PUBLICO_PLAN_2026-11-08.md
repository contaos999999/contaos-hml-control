# Trilha A: refluxo e ampliação textual pública

> Execução nativa, tarefa por tarefa, com revisão independente. Subtarefa do plano mestre V1, sem nova versão.

Objetivo: produzir evidência real e saneada de refluxo em 320 pixels CSS e texto ampliado a 200% em páginas públicas, enquanto a prova autenticada permanece pendente.

Arquitetura: reutilizar exclusivamente o executor independente já existente, Playwright/Chromium congelados e seus artefatos. Não alterar produto, origem, Auth, dados, rede, dependências ou workflow. A auditoria é pública e não envia formulários.

Especificação: plano mestre P0, BRAND-01/000 e NFRs transversais aplicáveis; WCAG2.2 SC1.4.10 e SC1.4.4. Fontes primárias: https://www.w3.org/WAI/WCAG22/Understanding/reflow.html e https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html. Não renumerar100regulares/97atômicos nem avançarV2.

## Baseline

Frontend main09c5f243c6f52368319845c33b1e511b3e966299/checkpoint321; Sidebar BUILD320 integrado4b412e3d, sem repetir. Backend normativo42a737acdcdb17f3b0684e8daf82f042696eb9ea, fontes/catálogo anteriormente conferidos invariáveis. PR139 tem execução própria; nenhuma modificação backend nesta tarefa. ZIP originalSHA5ee115d12e263d98068288b6bb722f5f303f2d19e1e4c0b5e930e69da03621da; manual100SHA8a15d96568d021ac86fdd45e79038e2cb969d69c12b2edb84f012a6129b8940e; atômicos97SHAd9faaae47de4b697b18ad7fb71e4738384514936813cd5b18779f4cb8aed83b8. Manter contexto canônico25fontes e tipos8ea7750b75fd9d76b29c36ce7613392e3ab65e19.

Última prova base:24PASS públicos/208privados semsessão,29superfícies×8=232. Zoom/texto ampliado não comprovados por essa contagem. Navegador desta execução sem sessão; não preencher credenciais, fabricar tenant ou declarar PASS privado.

## Escopo fechado

BUILD futuro somente scripts/testc/visual-audit.mjs e scripts/testc/visual-audit.test.mjs, após este PLAN e GATE separado integrados com trêschecksSUCCESS nos respectivosHEADs. Documentação: este PLAN, GATE irmão, PLANO_ATIVO.json, plano mestre, checkpoint e relatório P0_SIDEBAR_APPSHELL_V1_TESTES_2026-11-05.md.

Proibidos: src/**, public/**, types.ts, rotas/routeTree, estilos de produto, backend/Supabase/RPC/RLS/Auth/Storage, dados, segredos, dependências/lockfiles, workflows, fornecedor e PROD. Resize é instrumento temporário do contexto de auditoria; jamais commit em estilos. Não autorizar interceptação nova nem simular resposta de produto.

## Contrato da prova

Manter intactos WIDTHS1440/1280/768/390, THEMESlight/dark, ROUTES29 e seus232casos. Acrescentar coleção separada de18casos: SYS01/login, SYS02/esqueci-senha, SYS03/redefinir-senha × dois temas × três modos: REFLOW_320 com viewport320×900 e texto normal; TEXT_200 em viewport390×900; TEXT_200 em1440×900. Não somar18aos232nem certificar telas protegidas.

TEXT_200 altera apenas font-size computado da raiz para dobro dentro de contexto novo. Medir antes/depois os tamanhos computados de texto visível relevante (h1, parágrafos, labels, links, botões e inputs); sem valores/conteúdo de campo nos relatórios. Exigir fator2 com tolerância0,02, conjunto estável e amostra não vazia; ausência de medição é NÃO VERIFICADO/FAIL de auditoria, nunca PASS. Isso é ensaio de ampliação textual por CSS, não zoom nativo de navegador200/400% nem certificação integral SC1.4.4.

Em cada caso: HTTP2xx, pathname exato, langpt-BR, h1único, formulário vazio quando aplicável,0errosJS,0mutações; document.scrollWidth<=innerWidth+1; conteúdo/controles sem clipping detectável por scrollWidth/clientWidth e scrollHeight/clientHeight, ignorando somente elementos não visíveis e ícones sem texto. Controles e textos obrigatórios continuam presentes/visíveis. O detector geométrico não prova ausência universal de sobreposição: capturas exigem revisão humana/independente. SYS03 comprova somente o estado público observado, jamais redefinição efetiva.

Não preencher inputs, clicar links, alternar senha, submeter, recuperar senha, inserir token, navegar com sessão ou importar cliente privilegiado. Regra de bloqueio de mutações preexistente permanece. Cada caso usa contexto novo, sem persistir a ampliação nas24capturas base; fechar em finally mesmo após falha. Sem aumento silencioso de timeouts.

Relatório separado com modos/enums/medidas numéricas finitas e booleans fechados, IDs conhecidos, contagens, nome de captura validado e SHA256. Nada de innerHTML, texto DOM, campos, URLs temporárias, token, cookies, storageAuth, HAR/trace ou erro/stack bruto. Canários devem ser removidos/rejeitados. Screenshots públicas e relatório integram SHA256SUMS. Falha nova reprova o verdict do executor sem apagar24resultadosbase; não confundir checkSUCCESS documental com execução de navegador.

## Sequência verificável

- [ ] Integrar PLAN com revisão e ZeroDrift/TesteC/protect-typesSUCCESS no mesmoHEAD.
- [ ] Criar GATE separado, confirmar contrato e permitir somente dois scripts; integrar com mesmos trêschecks.
- [ ] CommitRED: inventário18casos, invariantes232, negativos de escala insuficiente, amostra vazia/alterada, overflow, clipping, mutação, erro e canário. Executar teste e registrar falhas esperadas antes de implementar.
- [ ] BUILD mínimo de helpers/coletor e relatório; GREEN dos testes de protocolo, regressões/gates aplicáveis, revisão independente.
- [ ] CI com Chromium real; baixar artefato, conferir hashes e inspecionar todas18capturas, mantendo resultados incompletos como tal.
- [ ] Se defeito real de produto for encontrado, registrar FAIL e abrir emenda de escopo própria antes de corrigir src; não relaxar detector para obter verde.
- [ ] Checkpoint integrado com HEADs/runs/artefatos, próxima tarefa privada e limites.

## Riscos de revisão

Aumento da raiz sem aumentar texto real; corte de controles por altura fixa; textos sobrepostos sem overflow; reset público em carregamento confundido com sucesso; capturas base contaminadas pela ampliação. Cada risco exige medição/negativo e inspeção das imagens; cobertura automática parcial não equivale WCAGAA integral. Manter fontes e estados do produto.

Rollback: novoPR restaura somente os dois scripts, com checks, sem reescrever histórico ou apagar evidência de FAIL. Produto permanece inalterado. V1/visualglobal/CRUD/auditoria NÃO CERTIFICADOS, V2 bloqueada; prova autenticada de28rotas/29superfícies/72BRAND continua obrigatória por rito legítimo.

ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE: marca e tokens preservados; reutilizar executor, sem dependências, workflow ou turno Lovable. Nenhum redesign. Impacto de produto N/A; impacto no auditor explicitamente delimitado. Menor custo não dispensa TDD, CI, revisão, artefato e prova visual.
