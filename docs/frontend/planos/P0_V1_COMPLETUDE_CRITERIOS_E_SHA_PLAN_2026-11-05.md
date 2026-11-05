# Emenda PLAN P0 V1 — completude dos critérios finais e vinculação criptográfica dos backups
Data: 05/11/2026. Continuidade da norma P0 V1 → V5, após #154/#155. **PLAN exclusivo; nenhum BUILD neste PR**.

## Contexto e desvios confirmados
- Matriz `P0_V1_RASTREABILIDADE_COMPLETA_2026-11-05.json` contém 45 regulares, mas os seis finais 39,40,41,42,43,75 ainda têm `criteria_count=0`. O gate atual aceita esse vazio; deve falhar fechado.
- A verificação mensal da Release usa `SHA256SUMS` distribuído junto aos arquivos. É necessário conferir também hashes conhecidos, fixados fora dos assets, para detectar substituição conjunta de manifesto e ZIP.
- Evidências literais documentadas: 39 PLAN, 40 PLAN, 41 transcrição do manual, 42 dossiê de BUILD, 43 fonte original conferida, 75 PLAN/fonte original retificada. **Protocolo de 12 testes**: transcrição de V1-20; aplicá-lo por cruzamento técnico aos seis prompts, sem alegar que a lista inteira foi transcrita literalmente para os outros cinco.

## BUILD permitido, posteriormente ao CI e merge deste PLAN
1. `docs/frontend/auditorias/P0_V1_RASTREABILIDADE_COMPLETA_2026-11-05.json`: manter 416 critérios históricos intactos; adicionar **12 critérios normalizados de teste por cada um dos seis regulares finais** (72 total), com `source_protocol`, objeto específico, teste automatizado existente, e grau da prova. Nenhum recebe `certified:true` sem validação real individual. A fonte identificada é documento do projeto, não a transcrição literal integral do critério individual de todos os prompts.
2. `scripts/p0-v1-traceability-gate.mjs` e `scripts/p0-v1-traceability-gate.test.mjs`: exigir 12 por final e ausência de certificação artificial; testar remoção/duplicação, fonte sem referência e desvio da contagem, preservar 416 e 37 atômicos. Exigir que toda ligação a teste de código tenha arquivo rastreável do `src/test` e status não extrapolado.
3. `.github/workflows/contaos-v1-evidence-release.yml`: no monitor mensal apenas leitura, adicionalmente exigir SHA-256 fixado de `ContaOS_TestC_42024620823.zip`, `ContaOS_TestC_42026795811.zip` e `SHA256SUMS`, conforme GitHub Release já consultada. Verificação de hashes **não altera** a release, o job de criação, nem o token de leitura.
4. `docs/frontend/auditorias/P0_V1_CRITERIOS_FINAIS_E_LIMITES_2026-11-05.md`: explicar origem e limitações da matriz 72 itens, e links dos testes reais.
5. `docs/frontend/ESTADO_E_RETOMADA_CONTAOS_4_1.md`: checkpoint após evidências de CI/merge.

Nenhum outro caminho autorizado. Não modificar `src`, `public`, BRAND-01, `types.ts`, banco, RLS, Auth, Storage, PROD. Sem novos segredos, sem Lovable, sem alteração da regra canônica V2 bloqueada.

## Verificação
PR PLAN exclusivamente documento + 2 checks CI verdes → merge → nova branch BUILD a partir da main atual → suite teste negativo da matriz + Zero-Drift + Teste C independente → merge somente com checks verdes → pós-merge CI e HEAD confirmados. A verificação de agendamento mensal só será atestada após execução real do job, não por mera existência do código.

## Rastreabilidade sem falsas certificações
Novos itens terão classificação `PROVA_ESTATICO_MOCK_ESCOPADO`, `PROVA_PUBLICA_CI_ESCOPADA` ou `PENDENTE_PROVA_ESPECIFICA`. As três ressalvas continuam restritas a R01 upload real, R02 worker real e R03 isolamento real multiusuários; não deslocar para esses rótulos lacunas de SYS-03, WCAG privado, RNF não testado ou security JWT.

## ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE (OBRIGATÓRIO)
Impacto visual N/A por documentação e workflow; marca oficial transparente e identidade 4.1 intactas. A solução usa GitHub sem novos créditos Lovable. Rollback via PR; nenhuma operação PROD.
