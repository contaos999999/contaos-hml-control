# GATE Trilha A: reprodução e correção focal dos alvos V102

PLAN410 integrado em f4093c58a5c10b64b0fdfb8c886979f1c99ab3e4, HEAD c7f8f02e81299367542e1c355274edf08075fdd6. Zero-Drift42543708181/jobs128924063398/128924063727 e LOCK42543708207 SUCCESS; revisão independente sem Critical/Important.

Este GATE é documental. BUILD somente após CI/revisão e integração deste GATE. Mantém o PLAN TRILHA_A_V102_HIT_TARGETS_PLAN_2026-11-09.md integralmente.

## Limite da causa

Run124 registrou oito V102 FAIL_UI, geometry=false e dois alvos notHit em cada caso. Identidade, tabela, datas e contraste passaram; overflowX=0. A hipótese da margem -my-3 das duas Dicas deve ser reproduzida no Chromium antes de qualquer correção de produto. Não afirmar quais controles reais falharam somente por contagens.

## Autorização exata posterior

Somente src/components/contratantes/NovoContratante.tsx, src/test/novoContratante.test.tsx e scripts/hml/authenticated-visual-audit.test.mjs, nos limites definidos no PLAN. O teste nativo deve usar estrutura/classes da Dica do código e hit-test real em fixture local isolada; CSS e fragmento devem representar precisamente margem, área44×44, linha flex e gap real. Não chamar essa fixture de execução HML e não usar jsdom como prova geométrica.

RED obrigatório sobre o produto atual: duas ajudas parcialmente cobertas nos cinco pontos testados. Se não reproduzir, manter produto intacto e investigar. BUILD mínimo pode retirar a margem negativa ou reservar altura efetiva da linha, mantendo alvo44×44 e sem encobrir outros campos. GREEN oito combinações; testes de Tooltip por teclado/clique, nomes acessíveis e fluxo funcional preservados.

Não alterar auditor.mjs, regras de medição/privacidade/contraste, outros componentes, workflows, dependências, assets, cores, tipografia, formulário funcional, payloads, validações, RBAC, Auth, backend, Supabase, tipos, rotas ou estados. Nenhum bypass de controles para obter screenshot.

## Integração e prova final

No mesmo HEAD: build, TypeScript, testes, lint/formato focal, Zero-Drift, LOCK e protocolos/nativos; revisão independente sem Critical/Important. Fazer merge protegido somente após GREEN comprovado.

Consolidar todas as alterações frontend antes do único deploy intencional HML autorizado pelo titular. Revalidar configuração Vercel para que ignore exit0 não suprima o deploy final; preservar previews suspensos e segurança. Não alterar o ambiente de negócio PROD. Conferir deployment READY, alias e SHA de produto. Rodar Teste C real posterior, preservar screenshot/DOM originais permitidos com SHA256 e revisão independente.

Até prova HML, oito V102 continuam FAIL e nenhum critério é aprovado por fixture. Preservar Run78, Run114/124, públicos18, baseline18 e demais trilhas.56PII e24fixtures separados;72critérios/WCAG/V1 pendentes. Nenhum produto, ambiente ou deploy alterado neste GATE.

## Emenda restrita: observabilidade da prova visual nativa

PR414 HEADd21ca53b8341fac91a903f85086a170b2492cce6 acrescentou somente teste source-backed. CI42544255970/job128925711863 falhou fechado com VISUAL_NATIVE. O wrapper atual captura e descarta stdout do subprocesso visual, logo essa falha ainda NÃO prova dois hit-tests reprovados: extração/CSS/fixture também podem ter falhado. Produto continua intacto. Tentativa local Chromium156 com sandbox preservado falhou por socket Operation not permitted, sem executar geometria; não reduzir sandbox.

Autorizar adicionalmente scripts/hml/authenticated-visual-audit.mjs, exclusivamente helper puro de projeção e emissão de resumo fechado no catch VISUAL_NATIVE. scripts/hml/authenticated-visual-audit.test.mjs pode emitir marcador fixo da fixture isolada e testar o parser. Esta autorização substitui a proibição anterior do .mjs SOMENTE para esse resumo; todo o restante dos limites permanece.

Contrato: marcador literal V102_NATIVE_DIAGNOSTIC seguido de objeto JSON escalar, sem outros campos. Saída permite apenas lastStage em conjunto estático SOURCE_EXTRACT/CSS_COMPILE/MEASURE, width em1440/1280/768/390 ou null, theme LIGHT/DARK ou null, targetCount/notHit inteiros0..64 ou null, geometry booleano ou null. Ausência/inválido continua desconhecido, nunca zero/PASS. Marcas de estágio e medidas devem ter semântica inequívoca; rejeitar duplicata conflitante, extra keys, tipos incorretos e dados fora dos limites. Processar até16linhas de marcador e bytes limitados; em ambiguidade/invalidez emitir somente estado INVALID sem conteúdo. Nunca imprimir stdout/stderr bruto, message/stack/cause, URL, seletor, HTML/ARIA, classes CSS, título, valores ou credenciais. Não serializar objeto de erro.

Capturar só texto já retido pelo execFile da prova isolada. Não executar coleta de página ou subprocesso novo no catch. Preservar throw VISUAL_NATIVE e abortos, os oito testes causais e identidade da prova visual única, sandboxtrue, versão Chromium1208, timeouts, environment reduzido, critérios de geometria/aceite e todas as barreiras anteriores. Sem workflow/Auth/nonce/rede/Supabase/SRC/deploy nesta emenda.

RED antes do helper: marcador válido não produz resumo seguro hoje; canários/URL/token/stack/extras/tipos/NaN/Infinity/marcadores conflitantes jamais devem escapar. GREEN: parser fechado, ausência/inválido explícitos, e falha nativa continua falha. Depois repetir a prova no CI. Somente se a evidência nativa mostrar efetivamente dois alvos cobertos aplicar o reparo de produto do GATE original; se falhar antes, corrigir a fixture sem tocar produto. CI/revisão/merge deste aditivo precedem código do resumo.
