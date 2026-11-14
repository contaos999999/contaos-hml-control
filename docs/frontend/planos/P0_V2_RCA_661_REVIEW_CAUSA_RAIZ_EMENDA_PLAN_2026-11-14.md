# P0 — Emenda causal ao PLAN #660 após review independente da PR #661

**Data:** 14/11/2026. **Status:** PLAN submetido, sem autorização de merge de BUILD antes de CI; escopo documental. **PR de origem:** #660 (merge `643fe90bbcb1934e280b833de81af5f3b5024b2f`); **PR de BUILD:** #661, review Edivan5002 `CHANGES_REQUESTED`, review #5903137025, HEAD criticado `5ad396f01787e6bed479abdd1da1dba0ae0adfb9`.

## Causa raiz comum dos três achados

**Evidências estruturais estão confundidas com comprovação operacional.** O RCA usa apenas `PLANO_ATIVO.prompt_id` para ativação; recibos P0 validam sintaxe de SHA/URL/arquivos e não a cadeia externa PR↔review↔merge↔CI; campos RED/GREEN aceitam nomes sem execução. Uma correção em apenas um destes pontos deixaria os outros como bypass. Não tratar como três remendos independentes.

**Caminhos impactados:** roteamento P0 V1–V5, gate RCA, workflow CI, testes, contratos e arquivos de comprovação. **Invariantes:** V1 funcional PASS preservado; V1 interna e V2–V5 interna/cumulativa permanecem PENDENTE sem provas novas; V1 auditoria em andamento e BUILD legado sem bloqueio indevido; 100 regulares/97 atômicos e demais gates imutáveis; nenhum PROD, backend, DB, tipos ou produto alterado.

## Solução técnica coesa e allowlist da emenda

1. `scripts/p0-rca-impact-gate.mjs` e `scripts/p0-rca-impact-gate.test.mjs`: classificar escopo real do diff por versão conhecida nos paths, caminho de desenvolvimento previamente permitido e mapa **por arquivo**. Rejeitar V2/V3/V4/V5 sob PLAN V1, arquivos mistos sem classificação e arquivos novos desconhecidos sob V1. RCA só é N/A quando todo o diff é documental ou comprovadamente V1. Para V2–V5 requer PLAN compatível e RCA/impacto por arquivo.
2. Atualizar contrato de `P0_RCA_ATIVO.json` **apenas na validação**, sem criar arquivo fictício. IDs RED/GREEN/NEG/REG passam a ser referências estruturadas de **caso executável** com arquivo, runner e nome exato; verificar casos executados no **SHA da CI** (node:test ou Vitest, com zero skip para caso exigido). RED necessita também de run histórico com FAILURE realmente associado ao caso; versões/baselines devem corresponder a commit real. Reutilizar suites, limitar repetição de testes e registrar saída sem PII.
3. `scripts/p0-version-order-gate.mjs` e `scripts/p0-version-order-gate.test.mjs`: estruturar seis recibos de fases prévias e certificado final fase7 por versão/escopo, com hashes e referências de PR/CI/review; manter testes de escopo e cumulatividade anteriores.
4. **Novos arquivos autorizados**, em complemento à allowlist #660: `scripts/p0-evidence-live-gate.mjs`, `scripts/p0-evidence-live-gate.test.mjs`. Verificar em CI por GitHub REST real (com token somente leitura, mínimo `contents: read`, `actions: read`, `pull-requests: read`) PR **merged** na main, `merge_commit_sha`, review APPROVED de conta distinta do autor e associada ao HEAD aprovado, workflow requerido SUCCESS em SHA exato, commit ancestral de main e hash dos arquivos de evidência. Para cada PASS exigir fases 1–6 comprovadas + fase7 final, sem usar nomes sintáticos de URLs como prova. Fallback seguro: ausência de credenciais ou indisponibilidade da API quando existir PASS = FAIL/NO-GO; se tudo PENDENTE, não emitir PASS fictício.
5. `.github/workflows/contaos-frontend-zero-drift.yml`: executar negativas dos novos guards, verificador de autenticidade live e RCA com teste executável **após** dependências instaladas. Não substituir nem desligar Zero-Drift, Teste C, LOCK, lint, typecheck ou testes existentes. Segredos não podem aparecer em logs.
6. `docs/frontend/governanca/P0_RCA_IMPACTO_ANTIRRETRABALHO_V2_V5_2026-11-14.md` e, se necessário, `docs/frontend/governanca/P0_PRIORIDADE_ZERO_ORDEM_POR_VERSAO_4_1.md` para especificar separação estrutural×live e serialização da evidência.
7. `docs/frontend/governanca/P0_ORDEM_POR_VERSAO_4_1.json` só se precisar de novos campos **PENDENTE** ou esquema de recibo; não alterar certificados pré-existentes.

## Testes RED obrigatórios antes de GREEN

- PLAN 75 + diff `src/components/v2/Apontamentos.tsx` + sem RCA → FAIL; V1 allowlist válida continua PASS; código genérico não classificado → FAIL; V2+ alteração cruzada permitida apenas com escopo por arquivo e impacto da V1.
- URL review sintaticamente válida, mas REST inexistente → FAIL; PR aberto → FAIL; PR merged sem revisão atual APPROVED → FAIL; autor revisando próprio PR → FAIL; SHA divergente entre PR, review e CI → FAIL; CI failure/skipped → FAIL; certificado fase7 sem fases 1–6 verificadas → FAIL; hash de evidência divergente → FAIL.
- RED/GREEN/NEG/REG só com strings e sem testes reais → FAIL; caso inexistente ou skipped → FAIL; HEAD e prova RED falsos → FAIL; suite executada e caso exato PASS → PASS.
- Suíte antiga V1/100/97/BRAND/LOCK e escopo de PR deve continuar verde.

## Critérios de encerramento

Submeter em PR #661 a sequência causal e arquivos autorizados, adicionar testes negativos, provar RED e GREEN por GitHub Actions, obter Zero-Drift, LOCK e Teste C SUCCESS no **HEAD final**, e depois pedir nova revisão **Edivan5002**. Implementador contaos9999 não aprova sua própria PR. Não mesclar #661 enquanto review CHANGES_REQUESTED; após APPROVED, merge protegido e readback da main com commit/CI/checkpoint. Nenhuma versão certificada pela simples introdução destes guards.

**Justificativa de economia:** usar um modelo único de evidência e API com cache por PR/run, teste focado antes de regressão ampla, manter a mesma PR BUILD para evitar duplicação de revisão e histórico. Não reexecutar suites sem delta comprovado.
