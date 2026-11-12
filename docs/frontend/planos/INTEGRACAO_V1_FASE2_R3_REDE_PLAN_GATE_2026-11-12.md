# Fase 2 R3: navegação sem interromper leituras e diagnóstico de rede

Autorização: ordem expressa do titular para concluir a Fase 2, resolver bloqueios sem perguntas e preservar todos os controles. Execução inline, revisão independente antes de integrar cada entrega. Este plano não é certificado.

## Baseline e provas

Frontend main `22b1a0f7b432d72c1456d5061dd2cafb529f62f2`, árvore `6c61d1811986b23abb6b35331880c0370be783f4`. Backend normativo relido `5eca44aebead3183e81b5c1af0d1dffa5fb8feb6`, igual ao snapshot de 25 blobs. Produto HML `024a232c5bdb717e556d9ff16ca000e1ae65b0cb`, deployment `dpl_FZgy7ARPgbQAbnGVVtbegFi4htXW`, sem republicação. Preservar certificações anteriores e a Fase 1; V2 aguarda as sete fases complementares.

R2: REQUEST #608, AUTH43208835561 FAILURE e FIXTURES43208835680 SUCCESS attempt1 terminais. Artifact13940103116, ZIP1572 bytes SHA256497d6e63d41b82b8d3ca394c19f07ecd9efac73d583ef154c9b87de1c87463d7. Report original SHA256b039701278b0e2b187421586df2c0385d0f8c3345ba4515ac8ca49021f222a42. Metadata registrada antes do download oficial no comentário6822530784. Nesta retomada: download oficial, digest/CRC/dois membros/manifest conferidos. 52 esperados,13 observados,11 PASS,2 FAIL,39 não executados; logoutfalse,HTTPstatus0,transport2. SYS05/1440 FINISH/NAVIGATION_CASE e V104/1440 LINK_RETURN_SOURCE/FENCE_DRAIN_TIMEOUT. Nonces R1 e R2 consumidas; proibido replay/rerun/dispatch/cancelamento/login manual.

Causa ainda NÃO COMPROVADA. Hipótese a reproduzir: a carga networkidle antiga e a fotografia final da UI deixam iniciar leitura posterior antes da próxima navegação. O auditor usa navegação completa repetida durante a travessia de links. A navegação pode interromper leitura própria da aplicação. Não descartar aborts nem ajustar cerca para obter PASS. Outra causa exige reprodução e registro antes de correção.

## Decisão técnica e alternativas

Escolha do implementador: primeiro reprodução offline com eventos reais e componentes existentes; depois barreira NAV de rede observável antes das ações. Se a rede permanece ativa ou falha, continuar FAIL. Repetir uma sessão sem corrigir causa desperdiçaria a execução e está proibido. Alterar app, backend ou a cerca não está autorizado; se a reprodução comprovar necessidade, integrar novo plano fechado antes do BUILD correspondente.

## Escopo fechado

PLAN: este documento, adição em PLANO_ATIVO.json, prefixo aditivo do checkpoint mestre e os três arquivos R2 em `docs/frontend/auditorias/integracao-funcional-v1/fase2/`. BUILD somente `scripts/hml/authenticated-visual-audit.mjs` e `scripts/hml/authenticated-visual-audit.test.mjs`. Evidências finais no diretório Fase2 e checkpoint. Request posterior somente JSON original de sete campos em PR separada.

Proibido alterar src/public/rotas/marca/tipos/deps/locks/YAML/backend/SQL/RLS/RPC/Auth/Storage/Edge/PROD e credenciais. Blob types imutável `8ea7750b75fd9d76b29c36ce7613392e3ab65e19`. Preservar políticas, lifecycle e drain da cerca, limites/deadlines, 18 provas originais, schema/contagens de suas provas, C8/R20 e gates públicos. Toda falha transport/HTTP/console/página continua bloqueante.

## Execução e testes

1. Reproduzir RED offline: leitura iniciada depois de networkidle previamente alcançado; leitura ainda ativa ao sair da tela; componentes reais quando a causa depender deles. Observar request/requestfinished/requestfailed e a cerca original. Separar timeout/cancelamento de status HTTP; manter incógnita histórica quando não houver prova causal exata. Registrar reprodução antes da implementação.
2. Implementar apenas NAV: registrar atividade de TODAS as requests desde antes da matriz e esperar ausência de leituras pendentes e janela contínua de quietude (500ms, equivalente ao networkidle), dentro do orçamento existente de 15s. Eventos novos reiniciam a janela. Nenhum retry, aumento de prazo, erro ignorado ou resposta fabricada. Observar UI final, rede quiescente, drenar cerca original e revalidar imediatamente antes de ação/retorno/reload. Não alterar settleVerifiedPage/cerca usados pelas trilhas históricas.
3. Diagnóstico NAV finito e sem PII: se necessário versionar somente relatório NAV para v3 com categorias fechadas de primeira falha de transporte (tipo/método/destino/reason por enums), sem URL/texto livre/headers/body/IDs nativos/credenciais. Rejeitar falsos PASS, campos extras/getters/proxies e relatório incompleto. Contadores permanecem estritos. Não registrar histórico R2 como v3.
4. Testes RED→GREEN: leitura tardia e longa, segunda leitura durante quietude, erro antes da matriz/logout, timeout/negação permanentes, respostas de outra geração, fluxo1440/claro e390/escuro; interrupção real continua FAIL. Acrescentar provas ao suplemento NAV separado, sem mudar 18 originais. A função antiga e schema das provas históricas ficam intactos. Ampliar limite do suplemento somente se necessário ao número adicional de casos e com revisão; não ampliar deadlines de operação nem relaxar casos.
5. Sucessor exclusivo `integracao-v1-fase2-nav-20261112-r3`; exigir este PLAN como ancestral, R1 e R2 consumidas e evidência original R2 selada/provada por metadados Actions somente leitura antes de credenciais. Não consumir nonce no BUILD. Preservar os cinco GETs/prova R1 e demais controles; R2 acrescenta seus metadados/runs/jobs/artifact/report/ledger.
6. Duas suítes completas auditor/preparador, lint/formato, nativas originais18 e suplemento NAV, quatro workflows BUILD no HEAD exato; produto1258/typecheck/build/Zero-Drift/LOCK conforme CI. Revisão independente sem bloqueios, merge protegido e pushchecks. Teste C visual N/A no harness, preservando delta#598 e as provas históricas, sem alegar HML atual por mocks.
7. Request isolado, pai exato do BUILD, revisão canônica/readback antes de merge; congelar main/deployment até AUTH/FIXTURES attempt1 terminais. Adquirir artefato oficialmente após metadata; conferir digest/ZIP/CRC/membros/manifest/schema/52PASS/logout/zero erros, revisão independente e certificado integrado/readback. Somente então certificar Fase2. Falha exige novo plano/nonce, nunca replay.

## Foco de revisão e riscos

Revisar janela temporal entre DOM/rede/drain/clique; callbacks pendentes e vazamento entre páginas; deadline15s e erro antes/depois da matriz; filtro que esconda requests; privacidade estrita; nonce/proveniência. A barreira só observa; não cria autorização nem mascara falha. Rollback por PR dos dois mjs, sem replay. Se não reproduzir correção suficiente, não iniciar nova sessão.

## Validação

Fontes: PRD/Premissas/Arquitetura, NFRs085–096, atômicosV1/BRAND000–024, ADR-DEV-002, P0, LOCK e planos#595–#607. Sem novo requisito funcional. Gates de fidelidade/escopo/segurança/reuso/testes/compatibilidade/rollback: PASS técnico de planejamento, eficácia após revisão independente, CI, merge/readback. Fontes atuais iguais ao snapshot normativo. Fonte de verdade e permissões permanecem no backend. ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE: sem alteração visual/produto; 4 larguras×2temas e Teste C históricos preservados; novo teste offline não é E2E HML; GitHub direto, nenhum turno Lovable. Nenhuma aprovação nova é necessária no escopo autorizado.

```text
ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE (OBRIGATÓRIO)
Marca: ContaOS Brand v1.0 / BRAND-01; ler 19_IDENTIDADE_VISUAL_OFICIAL_BRAND_1_0.md e 20_PROMPT_000_BRAND_01.md para qualquer alteração frontend. Preservar assets oficiais, ContaOSMarca, Design System e tokens (REUTILIZAR > ESTENDER > CRIAR), componentes e estados; sem hardcodes, redesign ou bibliotecas paralelas. PLAN deve informar baseline visual, riscos e matriz de aceite; BUILD deve manter consistência; TESTE/TESTE C devem provar 1440/1280/768/390 nos temas claro/escuro, acessibilidade, marca e estados, sem alterações durante Teste C. Se prompt não envolver frontend, declarar impacto visual N/A justificado e garantir ausência de alteração visual.
Economia Lovable: checar turno/estado/commit antes de enviar; usar GitHub e Supabase diretamente quando possível; consolidar instruções; executar o menor delta; reutilizar testes/evidências válidos; não reenviar turno pendente nem duplicar builds/scans; nunca pular aprovação humana obrigatória, TDD, segurança, CI, Zero-Drift, fidelidade ao PRD, validação visual ou Teste C separado.
Entregar evidências e classificar: IDENTIDADE VISUAL PASS/FAIL/NÃO VERIFICADO/N/A; ECONOMIA LOVABLE CONFORME/NÃO CONFORME; ZERO-DRIFT PASS/FAIL. Sem prova não declarar PASS.
```
