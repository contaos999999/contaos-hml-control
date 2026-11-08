# PLAN P0 Trilha A — fechamento seguro dos 184 casos privados não comprovados
Data: 2026-11-08. Issue #317. Base: checkpoint integrado PR #351 (main a9d95a028a32698370c2e101f09be7d9abe4c7d2).

## Baseline comprovado
Teste C 42496235106 no produto/harness 9b18e4857b03daa6ee09ad3382184480e2014728, deployment HML dpl_C17iKEF5F7WJJrQdeUaw7UQmmkW3: 208 casos executados sem aborto; 24 PASS_AUTOMATIZADO, 160 BLOQUEADO_PII, 24 BLOQUEADO_FIXTURE; logout confirmado. Artefato 13623288351, 48 PNG, 24 DOM, 73/73 hashes conferidos. 18 provas públicas já aprovadas não repetir sem regressão. 72 critérios ainda sem certificação. Não confundir bloqueio PII conservador com presença demonstrada de PII. Não promover PASS do harness a aceite visual integral.

## Objetivo e escopo fechado
Resolver as 160 combinações (20 superfícies × 8) bloqueadas pela política de privacidade, e as 24 combinações (V117/V119/V120 × 8) sem fixture, sem alterar segurança, dados reais ou PROD. Registrar para cada caso: superfície, viewport, tema, origem da fixture, status da verificação de dados sintéticos, razão sanitizada de bloqueio, hash SHA256 de screenshot/DOM quando permitidos, critério visual, revisão independente. Preservar as 24 aprovações anteriores e registrar regressões sem sobrescrevê-las.

## Etapas obrigatórias
1. **Diagnóstico RED sem exportar PII**: criar testes com DOM sintético local e enumeração fechada de razões (sem valor, texto bruto, seletor sensível, URL, cookie ou token). Separar falso positivo comprovável de conteúdo real desconhecido. A barreira deve continuar fail-closed para desconhecidos.
2. **Catálogo sintético verificável**: somente fixture HML isolada, explicitamente marcada, com origem documentada e valores controlados. Nunca aceitar dados apenas por aparência ou whitelist global. CPF, e-mail pessoal, segredo, JWT, dados de outros usuários e texto não catalogado continuam proibidos. Provar negação em testes negativos.
3. **24 fixtures**: identificar precondições reais das telas V117, V119 e V120, criar dados sintéticos pelos fluxos permitidos do frontend/API sob organização de teste e RLS, com limpeza e idempotência. Se uma capacidade de backend estiver ausente, documentar dependência específica com evidência; não mudar PR #139 por suposição nem criar DML direto.
4. **GATE separado**: após PLAN CI verde e revisão, validar allowlist mínima de arquivos, testes negativos, arquitetura frontend/Supabase, LOCK-TYPES, Zero-Drift, proteção de branch e rollback. Só então RED→BUILD→GREEN.
5. **Teste C autenticado imutável**: no mesmo HEAD implantado em HML READY, executar matriz 208 casos, quatro larguras (1440/1280/768/390) × dois temas, evidências SHA256, logout, revisão independente e 72 critérios. Testar BRAND-01, AppShell, sidebar, contexto organização/status, MASTER, navegação, teclado, contraste, zoom e WCAG aplicável. Corrigir separadamente sobreposição móvel #350 com prova de não regressão.
6. **DoD**: 208/208 privados com PASS e evidências legítimas, 24 anteriores preservados, 232/232 matriz total, 72/72 critérios verificados, zero falhas abertas, revisão independente, CI e Teste C no HEAD exato, checkpoint integrado. Até lá NO-GO V1.

## Restrições
PLAN documental apenas neste PR; nenhum BUILD, segredo, dado real, bypass de PII, relaxamento RLS/Auth/CDP, alterações em backend, PROD, types.ts, dependências, lock, BRAND-01 ou workflows sem GATE posterior. Não repetir PLAN/GATE/BUILD #322/#323/#324. Próximo passo após integração: GATE próprio e testes RED em scripts/hml/authenticated-visual-audit.{mjs,test.mjs}, com eventual fixture isolada previamente aprovada e allowlist explicitamente emendada no PLANO_ATIVO.json. Toda falha deve produzir diagnóstico sanitizado e não aprovação artificial.

## Rollback
Reverter somente commits novos de auditor/fixture, sem tocar baseline #351; não apagar evidências imutáveis. Em caso de divergência de deployment ou proveniência, falhar fechado e reancorar antes de autenticar.
