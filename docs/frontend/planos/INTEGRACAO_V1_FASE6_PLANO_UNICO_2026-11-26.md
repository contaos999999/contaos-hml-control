# P0-IFV1-F6-001 — Plano único Fase 6 CODE
Data: 2026-11-26. Autorização do titular: executar integralmente o plano da fase 6. Estado: PLAN candidato, não certificado.
## Baseline
Plano mestre #653, PLAN F5 #777, CERT F5 #795 integrado em 4ea895059dcdac2cb2dc2558a9918f5392ecc8b0; BUILD F5 #790, 138 casos/276 provas CODE_FIXTURE, atestação #792, promoção #793. Checkpoint issue #708. Revalidar HEAD frontend e backend normativo e certificados F1–F5 antes do BUILD.
## Escopo e critérios
Jornadas integradas de origem a estado final, por código real de produção com transporte/fixtures sintéticos. Reconciliar todos os 138 IDs da matriz canônica, preservando classificação 120 obrigatórios/18 condicionais após conferência; mínimo 276 provas positivas/negativas, mais provas de recuperação e interações quando aplicáveis. Não contar N/A como PASS; justificar e obter aceite. Não inventar operações ausentes dos contratos. Mapear caso → jornada → fonte normativa → precondição → passos → assertivas → estado final → cleanup. Nenhum FAIL/BLOCKED/skip/omissão admissível para CERT. LIVE NOT_RUN, PROD NO_GO. R-01 upload físico, R-02 worker/fila real e R-03 isolamento remoto permanecem backlog LIVE.
## Etapas
- F6.0: recuperar HEADs, certificados, matriz, contratos, inventário de adaptadores/hooks/serviços, classificar jornadas, publicar mapeamento exato e escopos P0. PLAN documental, revisão, CI, merge protegido, readback.
- F6.1: autenticação, perfil, organização, competência, troca de contexto, cache, recarga, expiração, logout, rota protegida, acesso cruzado, corrida e retomada.
- F6.2: contratantes, contratadas, contratos, vínculos, histórico, referências inválidas, duplicidade, concorrência, falha parcial, consumidores.
- F6.3: normativos, vigência, versões, orçamento, requisitos, propagação, histórico e rastreabilidade.
- F6.4: documentos, upload por adaptador com transporte sintético, tipo/tamanho, metadados/hash, vínculo, download, versão, falha parcial, retomada, autorização, recarga, cleanup.
- F6.5: competências, obrigações, evidências, análises, avaliações, revisão, divergências, reanálise, transições inválidas, autorização, concorrência, recuperação e auditoria.
- F6.6: pareceres, apresentação, indicadores, histórico, versão, pré-requisitos, autorização, recarga e rastreabilidade.
- F6.7: falhas de transporte, timeout, resposta inválida, interrupção, repetição/idempotência quando prevista, concorrência, contexto/sessão, recuperação, cache, navegação, desktop/mobile aplicável, RBAC/RLS CODE, efeitos colaterais, auditoria, fila por adaptadores quando aplicável, cleanup, jornada transversal.
- F6.8: execução cumulativa única no mesmo SHA; atestação reproduzível e promoção em PRs separadas, comparação de bytes, hashes, árvore e proveniência; ledger append-only.
- F6.9: CERT documental separado, revisão válida, CI, merge protegido e readback, checkpoint e liberação de PLAN F7.
## Evidência
caseId, sourceConnectionId, journeyId, normativeSource, classificação/aplicabilidade, preconditions, steps, expected, observed, postconditions, negativeProof, recoveryProof quando aplicável, frontendSha/backendSha/harnessSha, runId/jobId/artifactId, sha256, cleanupStatus, status. Provas negativas distinguem falha de transporte de rejeição de autorização. Atestador rejeita IDs ausentes/duplicados, hashes/HEAD incompatíveis, adulteração, falta de contraprova, falsa aprovação. Não somar runs incompatíveis.
## Governança
Cada fatia exige PLAN P0 com caminhos exatos integrado antes do BUILD; RCA, RED causal quando defeito, GREEN, negativas, regressão por impacto, Zero-Drift, Teste C, LOCK-TYPES, P0-NR e demais checks obrigatórios; revisão válida no HEAD final, merge protegido, readback e checkpoint. Previsão 19 PRs: PLAN geral, sete pares PLAN/BUILD, PLAN fechamento, atestação, promoção, CERT. Revisão assistida Edivan5002 requer autorização específica; não é auditoria independente. Sem autoaprovação disfarçada. Sem backend, types.ts, PROD, Lovable, dados reais, enfraquecimento de guards, alteração visual indevida ou reescrita de histórico. Fiscal universal é missão distinta.
## Saídas propostas
F6_CANONICAL_CASES.json, F6_JOURNEY_MATRIX.json, F6_CODE_ATTESTATION_CANDIDATE.json, F6_CODE_PROMOTION_RECEIPT.json, F6_CODE_CERTIFICATION.json, CERTIFICADO_FASE6_CODE.md, SHA256SUMS; caminhos exatos aprovados antes do BUILD.
## Encerramento
IFV1_F6_CODE=PASS somente com 138 IDs reconciliados, mínimo 276 provas, 100% aplicáveis PASS, zero falhas/bloqueios/omissões, jornadas completas, regressões e CI verdes, revisão válida, ledger atestado/promovido, certificado integrado e readback. LIVE=NOT_RUN; PROD=NO_GO; NEXT_PHASE=F7_CODE. Checkpoint #708 com HEADs, PRs, reviews, runs, hashes, pendências e próxima tarefa a cada integração. Não reiniciar fases certificadas sem impacto comprovado.
## Próxima ação
Revisar e integrar este PLAN; recuperar matriz e contratos e publicar PLAN P0 F6.1 com mapeamento e caminhos exatos. Nenhum BUILD nesta PR.
