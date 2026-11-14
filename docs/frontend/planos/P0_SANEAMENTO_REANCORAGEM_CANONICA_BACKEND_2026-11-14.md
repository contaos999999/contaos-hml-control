# PLAN P0 — Reancoragem documental do snapshot canônico após backend #220/#219

**Data:** 14/11/2026. **Origem:** Plano Único #670 aprovado e integrado, auditoria Fases 0–4. **Situação:** PLAN documental corretivo associado à PR #674, antes de qualquer revisão ou merge dela.

## Erro confirmado
A PR #674 falhou no Zero-Drift run [43603223595](https://github.com/contaos999999/contaos-hml-control/actions/runs/43603223595) no passo `Verificar HEAD vivo do repositório normativo antes de BUILD`, porque `docs/frontend/CONTEXT_CANONICO_4_1_SNAPSHOT.json` referenciava `source_commit=5eca44aebead3183e81b5c1af0d1dffa5fb8feb6`, enquanto o backend real já avançara em merges protegidos #220 e #219 até `1504af465b45afc846458d00e5cb63513fa298ed`. `PLANO_ATIVO.status=VALIDADO` exige a checagem até em PR documental. Essa rejeição é correta e não deve ser dispensada.

## Evidência pré-BUILD
Foi comparada a árvore recursiva do backend main `1504af465b45afc846458d00e5cb63513fa298ed` com o snapshot: **25/25 blobs normativos inalterados**, catálogo `docs/prompts/PROMPT_TRACKS_4_1.json` com SHA `e54e49e626e65a9c94c81709180fd192a1f0c079` inalterado, 100 regular IDs, 97 atomic IDs e crosswalk de 100 inalterados. O avanço incluiu allowlist aditiva para controlador e seus três arquivos. `docs/tasks/active-task.json` mantém C13 ativa; zero reinterpretação de qualquer certificação.

## Operação autorizada
- Alterar SOMENTE `source_commit` do snapshot para o HEAD backend verificado e `source_date` para 2026-11-14, com adendo explicativo `p0_reanchor_note`.
- Não alterar nenhum dos 25 `blob_sha`, catálogo, 100/97 crosswalk, limitações ou tipo/frontend/CI para facilitar PASS.
- Atualizar os dois documentos novos da PR #674 para refletir classificação #218 `CLOSED_NOT_PLANNED` após auditoria Edivan5002 e fechamento sem merge, e ruleset #26495643 `HOLD_MFA_SUDO` com verificação UI/API mostrando apenas os dois checks originais. **Não declarar Fase 6 concluída.**
- Preservar blobs dos quatro certificados P0-LOCK-CERT: manifesto `8ce1f23a2a7db6eb16f348fa5d991f063e4f17ff`, V1 histórica `7045c0a02243b242835e7ea6817b850287917141`, Fase 1 `751c5e6d8cb53d56be4f51be3fee3cb0feb34f03`, Fase 2 52/52 `e07d66897d39e8d57b9d6507cf97ba03ed01c7f1`.
- Sem alterar código, guards, workflow, C13, RLS, banco, PROD, certificado ou manifesto P0 de versões.

## GO/NO-GO
CI Zero-Drift deve validar HEAD exato do backend + 25/25 documentos e catálogo 100/97, LOCK e P0-NR do mesmo HEAD, auditoria independente Edivan5002 e merge protegido. Se não for possível, a PR #674 permanece aberta e não será apresentada como checkpoint integrado. O resultado global é PARCIAL, não PASS, enquanto o ruleset exigir MFA e o check não estiver realmente required.

**P0-NR:** erros conhecidos não são repetidos sem corrigir causa. **P0-LOCK-CERT:** nenhuma certificação previamente consolidada pode ser reaberta, alterada ou rebaixada nesta missão.