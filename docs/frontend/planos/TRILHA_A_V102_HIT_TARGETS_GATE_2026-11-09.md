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
