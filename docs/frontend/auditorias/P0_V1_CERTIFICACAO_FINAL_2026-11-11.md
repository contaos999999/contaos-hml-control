# ContaOS 4.1 — Certificação final V1 — 11/11/2026

Estado deste documento: **PENDENTE apenas da prova final SYS-03 em execução**. Não é certificado enquanto o campo correspondente no JSON sucessor estiver pendente.

## Base final
- Frontend main-base: `df62bacf78df3df3cf801b688a1aced8a300761d`
- Backend main: `5eca44aebead3183e81b5c1af0d1dffa5fb8feb6`
- Supabase HML: `gklhhhyosgasnyoxlrui`
- PROD: intocada

## Cadeia das oito fases
- Fase 1: COMPLETED — GATE #138 comentário 6798359508.
- Fase 2: COMPLETED — GATE #138 comentário 6798360599.
- Fase 3: COMPLETED — GATE #138 comentário 6798361715.
- Fase 4: COMPLETED — GATE #138 comentário 6797364641.
- Fase 5: COMPLETED — GATE #138 comentário 6797965561.
- Fase 6: COMPLETED — GATE #138 comentário 6797840596.
- Fase 7: COMPLETED — GATE #138 comentário 6796791384.
- Fase 8: PENDENTE neste documento até fechamento SYS-03 e integração desta reconciliação.

## Fonte e qualidade
Zero-Drift final confirmou 25/25 fontes canônicas, catálogo 100/97, TypeScript/build e 1.222/1.222 Vitest. O backend possui certificado material 96/96 (84 RF + 12 NFR), incluindo RLS, isolamento, carga, Edge e restore. As fases 4–7 reconciliaram os deltas posteriores.

## Rastreabilidade
O ledger histórico de 488 critérios permanece imutável. O arquivo `P0_V1_CERTIFICACAO_FINAL_2026-11-11.json` é sucessor decisório e preserva, por ID, status/provas históricos mais bundles certificados finais. Nesta versão intermediária existem 12 critérios e 1 atômico pendentes exclusivamente por SYS-03; os demais estão reconciliados sem FAIL.

## Acessibilidade
Gate: **WCAG 2.2 AA aplicável**. A cadeia privada comprova Axe sem violações nos casos aprovados, contraste medido, teclado/foco aplicável, Escape no drawer, responsividade e ausência de overflow. Isto não é declaração de certificação externa/integral WCAG.

## Exceções e ressalvas
A política canônica autoriza decisão `CERTIFICADA_V1_COM_3_RESSALVAS`:
- R01 — upload real E2E.
- R02 — processamento real worker.
- R03 — isolamento real entre usuários.

Esses itens permanecem `RESSALVA_ACEITA_NAO_EXECUTADA`, nunca PASS técnico, sem ampliação automática.

Supabase Auth Leaked Password Protection permanece `EXCECAO_DE_PLANO_FREE_NAO_CORRIGIDA`, aceita pelo titular como não bloqueante por limitação do plano, também nunca PASS técnico.

## SYS-03
Provas preservadas: recuperação manual real com Mailtrap, link válido, redefinição, novo login, reutilização negada, senha antiga negada e anti-enumeração; N1/N2 automatizados dispensados expressamente pelo diretor e não contabilizados como PASS automatizado; N3/N4 negativos históricos automatizados preservados. PR #590 executa os controles HML finais sem mudar produto nem PROD.

## Decisão
**PENDING_SYS03_FINAL_HML**. Após o ensaio final PASS, este documento e o JSON sucessor deverão ser atualizados no mesmo PR, gates revalidados e a decisão final emitida no GATE #138.
