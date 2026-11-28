# PLAN P0-690 — Harmonização da modalidade de auditoria pré-PROD

Data: 28/11/2026. Estado: proposta documental, sem autorização de ativação, HML ou PROD. Eficácia após CI, revisão assistida elegível, merge protegido e readback deste PLAN.

## Autoridade, baseline e RCA

Decisão expressa do titular: [Issue #708, comentário 7237068104](https://github.com/contaos999999/contaos-hml-control/issues/708#issuecomment-7237068104), reiterando que auditoria independente é exclusiva do GATE PROD. A [PR #781](https://github.com/contaos999999/contaos-hml-control/pull/781) e a decisão anterior 7166602376 estabelecem revisão assistida pré-PROD. A PR #862 revalidou o delta daquela emenda, mas não reconciliou expressamente todos os requisitos específicos do Fiscal #690.

Frontend main d9cfb6b03be8011b5ee1472c16cbe2ba350fca7b; backend main 32c5595c7af27436b20502b10fc67b7908ca811d; candidato #690 7464545a2f63f62f89ebb1362ffcb47a006d5390; manifesto protegido blob 83b9f9491339ad90888f82017543c8cd158f01ad. Ledger B3 #260 permanece draft HEAD 1f2186655b36c48eeab11cc5deecb72e25ca9852. Checkpoint anterior fiscal 7237036104.

RCA normativa: o candidato mantém obrigação de parecer independente de autoria antes de merge/certificação CODE (contrato independent_audit_for_build, N06 e §§5.3–5.8, consumidores semânticos). A autoridade posterior determina modalidade assistida pré-PROD sem dispensar provas. A divergência deve ser explicitamente reconciliada por estágio, não por supressão de requisitos técnicos ou alteração cosmética de campos. Preservar textos protegidos originais como evidência histórica; esta emenda específica define interpretação prospectiva após integração. Não tratar a proposta CSDI #693 como vigente.

RCA operacional separada: run 46127560406, job 140925542668, terminou por ausência de recibo V2 no HEAD/base; predecessores Windows e V2 SUCCESS. O verificador verifyPrecertRunOrigin retorna false com dados reais desse run já concluído failure e true com controle in_progress/conclusion=null. Trata-se de recusa correta à prova de origem naquele estado; confirmar nova execução coerente de produtores e consumidor no mesmo snapshot, sem relaxar origem ou aceitar run falho. Não refazer provas anteriores sem alteração de HEAD/base ou necessidade causal. Não emitir recibo PASS apenas para destravar execução.

## Regra normativa específica

1. Em PLAN, BUILD, homologação e certificação CODE pré-PROD, exige-se revisão técnica material assistida, identificada como tal, pela conta elegível Edivan5002 distinta da autoria GitHub contaos9999, com autorização permanente do titular nos termos #781. Segregação metodológica, segunda leitura cética, meta-auditoria e contraditório permanecem obrigatórios quando previstos; nenhum deles pode ser apresentado como independência de autoria.
2. Auditoria independente de autoria, parecer independente e evidência específica de independência são obrigatórios no GATE PROD. Em PROD a modalidade assistida não satisfaz o requisito de independência. Não antecipar aprovação PROD nem aceitar ausência de estágio como pré-PROD.
3. As obrigações de prova de N01–N17, os 228 requisitos da matriz atual, os 137 IDs normativos, 118 fontes, 381 sentenças, 9.316 pares, sete eixos, provas negativas, testemunhas materiais, origem LIVE quando exigida pelo gate próprio, hashes, vigência e readback permanecem integralmente exigíveis. A alteração de modalidade não transforma contagens, inventários, fixtures ou BUILD PASS em completude semântica. A classificação de cada obrigação de auditoria por estágio deve ser rastreável ao texto e à decisão; não apagar linhas nem alterar denominadores para conseguir PASS.
4. A pré-auditoria V2 mantém doze critérios, dez camadas, doze lentes, três contraprovas causais e consumidor atual. PRE_CERTIFICATION_ONLY não é CERTIFIED, autorização de merge, ativação, HML ou PROD. Revisão formal assistida deve ser posterior a provas suficientes e vinculada ao HEAD/base reais; não aprovar o próprio trabalho na mesma identidade, ignorar veto vigente, ou aceitar comentário como APPROVED.
5. N17(c), terceira autoria e duas aprovações elegíveis quando exigidas pela prova de fila real, identidade e autorização/revogação do App, proteção de branch, RLS/tenant e autorização específica HML/PROD não são requisitos de modalidade de auditoria e não são dispensados. Sem alteração de ruleset, permissões, secrets ou publicador; activation_authorized=false. Orquestrador CODE e regular 77A continuam com gates próprios.

## Escopo fechado para BUILD da harmonização na PR #690

Após integração e readback deste PLAN, reancorar candidato sobre a main protegida sem force push, confirmar backend e 14 caminhos originais. Somente dentro da allowlist protegida, alterar quando necessário e mediante RCA/RED:
- docs/frontend/governanca/P0_AUDITOR_FISCAL_UNIVERSAL_4_1.md
- docs/frontend/governanca/MISSAO_ATIVA_4_1.json
- scripts/auditoria/mission-supervisor.py
- scripts/auditoria/test_mission_supervisor.py
- scripts/p0-rca-impact-gate.mjs
- scripts/p0-rca-impact-gate.test.mjs
- .github/workflows/contaos-auditoria-controller.yml (somente se RED demonstrar necessidade de ajuste do consumidor/produtor)
- docs/frontend/ESTADO_E_RETOMADA_CONTAOS_4_1.md

Nenhum arquivo fora dos 14 autorizados pode ingressar na #690. O manifesto imutável, PLANs #689/#691, #862, #781 e a proposta #693 não são editados por esta missão. Se outro consumidor exigir modificação fora da allowlist, preparar PLAN separado antes de implementar. Autenticar cadeia do novo PLAN pelo merge, ancestralidade, diff, blob e decisão; rejeitar fonte alterada/forjada ou autoridade apenas declarada. Preservar escopo e checks próprios dos demais repositórios. Eventual ajuste normativo backend deverá ser PLAN próprio, sem misturar B3/F3 ou mover main durante provas fiscais.

## RED antes do BUILD, GREEN, revisão e readback

RED causal obrigatório no candidato reancorado: demonstrar falso bloqueio da modalidade assistida pré-PROD por exigência de independência e ausência de representação inequívoca do estágio. Provar que a revisão assistida material não se torna indevidamente independente ou suficiente em PROD. Definir fixtures válidas do contrato completo (incluindo provas técnicas), mutação de estágio desconhecido, tentativa de aprovar sem evidência, divergência HEAD/base, veto, revisão obsoleta, ausência de revisão elegível, ausência de contraditório, prova semântica insuficiente e autocertificação. Demonstrar causalidade por motivo esperado; não aceitar erro colateral como RED. Testes de produção devem manter exigência de independência real; simulação não autoriza operação PROD. Revalidar código de origem contra runs/attempts reais e provar sucesso legítimo sem aceitar falhas, artefatos velhos ou replay. Não reutilizar recibo de outro HEAD/base. Registrar commit RED e workflow/job; somente após evidência RED implementar BUILD, executar GREEN focal, negativos, regressões integrais, Teste C, matriz 228 requisitos com rastreabilidade histórica e revalidação normativa. A semântica completa exige todos os testemunhos e contraditório material, agora em modalidade correspondente ao estágio, nunca autodeclaração. Registrar relatório assistido e seus limites, confirmar todos os checks vigentes e realizar merge somente quando os gates materiais autorizarem. CI pós-merge, readback e checkpoint são obrigatórios.

## Continuidade

Preservar #260 draft até estabilização fiscal. Prosseguir B3/F3, canários, certificação CODE do Orquestrador e regular 77A apenas conforme seus próprios PLANs e provas; 77B após recibo oficial 77A. HML requer autorização específica. PROD NO-GO.
