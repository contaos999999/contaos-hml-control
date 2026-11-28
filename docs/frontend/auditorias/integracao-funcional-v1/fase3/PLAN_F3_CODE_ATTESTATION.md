# S3 — atestação candidata F3 CODE pós BUILD #752

Estado: CANDIDATE_NOT_CERTIFIED. A etapa separada de certificado/ledger consta do PLAN #753 integrado e da emenda IFV1 F3 CODE vs LIVE de 22/11. Este PR implementa validação de procedência e matriz candidata, sem certificar e sem modificar o inventário não certificador existente.

## Evidência preservada
BUILD #752 integrado à main em 4f696f74453f5bd73a9334c090a3cf28ee968961; HEAD da715ce7348a1def7a9ac18e1895ae7cd7eae15e; execução em ec445264b5e2d901c96cfc5466e8ff23a4106095, comparação HEAD/execução sem diff. 138/138 relações (120 obrigatórias + 18 condicionais), 276/276 provas, seis workflows SUCCESS, Zero-Drift/TypeScript/Teste C aprovados. CI 45528651072, job 138918169561, artifact 14982269982; SHA ZIP 9b5c4a960d49d4568a810d2c1498628d144ed59c3f4a83b4c7a3364c62869717; SHA relatório 0e44a1783523a67c0e7b6af5de93e5825cc476568fd751f757b25effb41642d2. Review 6050459412 na conta Edivan5002, assistida pelo mesmo agente por autorização do titular, não auditoria humana independente. Backend de referência do catálogo 5eca44aebead3183e81b5c1af0d1dffa5fb8feb6; snapshot normativo a1516de1d8949e505d83b5e000eb1cc558b217a7, comparação sem alteração de contratos SQL, apenas CI/governança/executor.

## Escopo fechado e gate
- `scripts/hml/integracao-v1-fase3-code-attestation.mjs`, `scripts/hml/integracao-v1-fase3-code-attestation.test.mjs`, `.github/workflows/contaos-f3-code-attestation.yml`, `docs/frontend/auditorias/integracao-funcional-v1/fase3/F3_CODE_ATTESTATION_SOURCE.json` e este PLAN.
- Ler metadados de PR/review/run/job/artefato da API GitHub real somente leitura, comparar árvores, verificar ZIP e hashes internos, catálogo e pares de teste, arquivos de fonte e teste no SHA integrado. Gerar matriz candidata de 138 entradas com 276 provas versionáveis.
- Testes negativos de procedência, revisão, CI e deriva de árvore. Gate CANDIDATE_VERIFIED_NOT_CERTIFIED, sem transformar integridade estrutural em auditoria semântica independente.
- Após CI real, versionar o ledger candidato e formalizar a atestação em PR protegida própria. Não mudar `F3_CODE_EVIDENCE_LEDGER.json` enquanto seu validador rejeitar recibos; preservar inventário histórico e definir explicitamente a autoridade do ledger atestado, com teste negativo de falsificação. Não emitir certificado sem validação e revisão efetivas. Raw observations não constam do artefato de saída; hashes e fontes verificáveis não provam por si só conteúdo semântico completo. Não autorizar F4/PROD.

## ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE (OBRIGATÓRIO)
Somente scripts, workflow e documentação, sem produto, identidade visual, backend, LIVE, ledger HML, dados, Lovable ou PROD. Impacto visual N/A. Rollback pela rejeição da PR; nenhuma alteração de fonte produtiva.
