# PLAN P0 V1 — gates automáticos de rastreabilidade e verificação periódica de evidência
Data: 05/11/2026. Após PRs #149, #150, #151, #152. Somente controles GitHub, sem alteração do app, HML ou PROD.

## PROMPT
Criar fiscalização permanente da matriz da V1 e conferir periodicamente integridade da Release privada já criada. Sem falsificação de PASS e sem diminuir tests.

## Escopo fechado
- `scripts/p0-v1-traceability-gate.mjs`: exportar validação pura dos 45 IDs regulares (00–43,75), 416 critérios históricos, 000–024 (25) e 085–096 (12), source SHA, rastreio por ID, unicidade, provas e proibição de PASS sem evidência; qualquer violação deve falhar CI. Não converter critérios históricos em aprovados automaticamente.
- `scripts/p0-v1-traceability-gate.test.mjs`: positivos e negativos (ID ausente, duplicidade, sem fonte, alteração de status não fundamentada, contagem e ressalva indevida).
- `.github/workflows/contaos-frontend-zero-drift.yml`: executar autotestes e gate de integridade da matriz no bloco inicial do workflow **em todos os PRs/main**, sem retirar verificações atuais.
- `.github/workflows/contaos-v1-evidence-release.yml`: adicionar somente verificação mensal read-only dos 3 assets SHA256 de Release já publicada, sem alterar o job de criação e sem conceder permissão de gravação ao job de monitoramento. `cron` mensal, falhar na ausência de asset/digest/hash.
- `docs/frontend/auditorias/P0_V1_RASTREABILIDADE_COMPLETA_2026-11-05.json`: adicionar aplicabilidade transversal explícita para NFRs 085–096; não atribuir prova funcional sem teste.
- `docs/frontend/ESTADO_E_RETOMADA_CONTAOS_4_1.md`: atualizar após teste e merge real.
- `docs/frontend/planos/P0_V1_INTEGRIDADE_CONTINUA_PLAN_2026-11-05.md` este PLAN.

## Gates e limites
PLAN em PR exclusivamente documental CI verde, merge e só depois BUILD em novo HEAD. Testes Node com fixtures localizados, sem dependências. Teste C já obrigatório permanece obrigatório (N/A execução visual quando não houver UI alterada). Verificação mensal não aumenta permissões: job READ ONLY `contents:read`. Job de arquivamento `contents:write` continua restrito a main no workflow existente. Sem WORM, senha, JWT, dados reais, schema, API, Supabase, Lovable, PROD. Rollback via PR revert.

## ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE (OBRIGATÓRIO)
Nenhum impacto de identidade visual, BRAND-01 íntegro. GitHub direto e sem créditos Lovable.