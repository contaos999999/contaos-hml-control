# PLAN P0 do recibo de integração interna da V1 CODE

Data de referência 26/11/2026. Base frontend `b3b7f09765d56340f440c8df94cfbd9a692d3023`, merge protegido da PR #821. Fonte normativa `a1516de1d8949e505d83b5e000eb1cc558b217a7`. Blob protegido de `types.ts` `8ea7750b75fd9d76b29c36ce7613392e3ab65e19`.

## Causa e reprodução

O certificado funcional V1 está PASS e o certificado global de integração CODE da PR #821 foi integrado. O P0 ainda lê o registro histórico V1/interna como PENDENTE. No HEAD da base, `validateP0` com o plano 44 simulado retorna `P0 INTEGRACAO BLOQUEIA PLAN 44` e a auditoria de proveniência CODE examina zero recibos. Esta execução trata os casos P0-NR de escopo prévio, prova visual que precisa ser executada, autenticação material e conferência de base viva. A simulação do PLAN 44 serve como contraprova do gate.

O manifesto de ordem tem blob `8ce1f23a2a7db6eb16f348fa5d991f063e4f17ff`, vinculado ao P0-LOCK-CERT e à certificação F8. O recibo aditivo alimentará os dois leitores existentes do P0. O gate estrutural continua exigindo evidência no escopo, matriz e grafo. O gate de proveniência continua autenticando bytes, PR, revisão, CI, ancestralidade, as seis fases e o Teste C visual. A falta do arquivo mantém o estado histórico e um recibo inválido interrompe a leitura.

## Prova final na PR #823

- `docs/frontend/auditorias/integracao-funcional-v1/fase7/CERTIFICADO_RECIBO_INTEGRACAO_INTERNA_V1_CODE.md`
- `.github/workflows/contaos-teste-c-independente.yml`

Vincular a matriz F7, o grafo canônico e as fases 1–6 à prova do recibo. Usar a reexecução estática da F1, realizada no snapshot certificado da PR #594 e integrada com revisão GitHub na PR #816. Preservar a prova original e seu registro histórico. Usar os merges e revisões das PRs #652, #758, #776, #795 e #815 para as demais fases.

O Teste C de uma mudança documental comum detecta escopo N/A. Acrescentar o caminho exato da prova final ao escopo dessa auditoria para executar o Playwright, capturar screenshots de desktop e mobile e comprovar o checkout somente leitura. Antes de aprovar a PR, verificar run, tentativa, jobs, artefato, seu SHA-256, os manifestos internos e a árvore testada.

## Ativação na PR #822

- `docs/frontend/governanca/P0_RECIBO_INTEGRACAO_INTERNA_V1_CODE.json`
- `scripts/p0-version-order-gate.mjs`
- `scripts/p0-version-order-gate.test.mjs`
- `scripts/p0-evidence-live-gate.mjs`

Integrar a prova final e conferir a `main` antes de publicar o BUILD de ativação. Preencher o recibo com os SHAs e hashes comprovados. Consumir o mesmo manifesto efetivo no gate de ordem e no gate de proveniência CODE. Testar carregamento ausente, corrompido, conflitante e fora de escopo, recepção válida, PLAN 44 simulado e preflight de produção. Verificar a autenticação nativa na PR e no push do merge e conferir os blobs na `main`.

## Critérios de conclusão

Reconciliar os 138 casos canônicos, 120 obrigatórios e 18 condicionais, as 1.104 provas positivas e negativas das fases 3–6, oito provas complementares e 52 evidências históricas de navegação. Confirmar os 488 critérios da certificação global com zero decisões em aberto. CI completo, Zero-Drift, Teste C material na PR da prova, LOCK-TYPES, P0-NR, revisão técnica assistida por Edivan5002 no HEAD exato segundo a PR #781, merge protegido e conferência de pais, árvore e blobs. Registrar a confirmação do recibo efetivo e o run na issue #708.

As contraprovas LIVE R-01 (upload físico e retomada), R-02 (worker e filas reais) e R-03 (isolamento entre usuários e organizações) ficam no GATE PROD após V5, nos termos da PR #718 e da autorização do titular. LIVE NOT_RUN e PROD NO-GO. Este plano é exclusivo de governança CODE. Frontend de produto, backend normativo, `types.ts`, certificados históricos e proteções ficam preservados.

## ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE (OBRIGATÓRIO)

Atualização GitHub em auditoria e governança. Preservar BRAND-01 e usar os testes e evidências versionados. Se a prova ou a autenticação falhar, manter a integração interna em PENDENTE e corrigir a causa com um novo HEAD validado.
