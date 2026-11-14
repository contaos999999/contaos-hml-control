# ContaOS 4.1 — P0 saneamento de pendências, Fase 0

**Data:** 14/11/2026. **Estado deste arquivo:** inventário elaborado; certificação da Fase 0 somente após PR, CI, auditoria independente, merge e readback.  
**Plano canônico aprovado:** `docs/frontend/planos/P0_PLANO_UNICO_SANEAMENTO_PENDENCIAS_2026-11-14.md`, PR [#670](https://github.com/contaos999999/contaos-hml-control/pull/670), merge `5130c4a1be210f04c0a0cebed543d98f47f0c997`.  
**Matriz:** `docs/frontend/auditorias/P0_SANEAMENTO_FASE0_INVENTARIO_2026-11-14.json`.

## Conclusão técnica do inventário

Foram reconfirmadas seis PRs OPEN (três frontend e três backend). O frontend passa a ter como baseline a main `5130c4a1be210f04c0a0cebed543d98f47f0c997`; backend main `5eca44aebead3183e81b5c1af0d1dffa5fb8feb6`. A autorização operacional do backend segue `C-CHAT-013-CONTEXTUAL-CITATION-REPLAY-20261109` **ativa**. O ruleset frontend `26495643` preserva Teste C e Zero-Drift requeridos; P0-NR-001 está instalado/verde mas ainda **não** é terceiro required check. A API de proteção clássica de branch requer permissão indisponível (403), não presumir controle administrativo.

| Fase | PR | Classificação de entrada | Decisão de saída exigida |
|---|---|---|---|
| 1 | Frontend #593 | OPEN; conflito; solicitação R14 histórica e falha DNS apt/Chromium | MERGED_PROTECTED ou CLOSED_SUPERSEDED após correção causal e checks |
| 2 | Frontend #590 | OPEN; dossiê concorrente de certificação V1 | HOLD_DEPENDENCY_V1 ou CLOSED_SUPERSEDED; **não emitir certificado concorrente** |
| 2 | Frontend #556 | DRAFT; proposta SQL V123 não executada | HOLD_DEPENDENCY_V1 ou CLOSED_SUPERSEDED, sem SQL privado |
| 3 | Backend #220 | OPEN; difere de C13 ativa e altera manifesto | GO só com GATE aditivo preservando C13, ou HOLD_DEPENDENCY |
| 4 | Backend #219 | DRAFT; Zero-Drift por escopo e depende da #220 | GO após GATE #220 e CI/review, ou HOLD_DEPENDENCY |
| 5 | Backend #218 | DRAFT; Zero-Drift escopo e restore protegido por hash | RCA de duas falhas e prova isolada, ou CLOSED_SUPERSEDED fundamentado |

**NÃO iniciar V2, GATE PROD ou auditoria funcional V1** nesta missão. Não concluir por simples limpeza da lista de PRs.

## P0-LOCK-CERT — verificação obrigatória

A condição expressa de aprovação determina: **certificação consolidada, aprovada e encerrada não pode ser reaberta, rebaixada, alterada, invalidada ou substituída**. O ledger do plano trava documentalmente os seguintes blobs do frontend main:

- `P0_ORDEM_POR_VERSAO_4_1.json` — `8ce1f23a2a7db6eb16f348fa5d991f063e4f17ff`; `certificados_por_versao.V1.status=PASS`.
- `P0_V1_CERTIFICACAO_FASE8_2026-11-11.md` — `7045c0a02243b242835e7ea6817b850287917141`; R-01/R-02/R-03 aceitas, sem PROD.
- `integracao-funcional-v1/fase1/CERTIFICADO.md` — `751c5e6d8cb53d56be4f51be3fee3cb0feb34f03`; PASS no escopo estático conforme documento de origem.
- `integracao-funcional-v1/fase2/CERTIFICADO_FASE2_NAVEGACAO_2026-11-13.md` — `e07d66897d39e8d57b9d6507cf97ba03ed01c7f1`; 52/52 PASS.

Esses artefatos foram relidos antes da integração do PLAN #670 e novamente depois do merge, com hashes idênticos. **A implementação deste inventário cria exclusivamente dois arquivos novos**, não modifica qualquer certificado. O snapshot não é alegado como enforcement automático. Cada fase deve conferir arquivos protegidos no diff/review e no readback final.

## Critérios de GO da Fase 0

1. Inventário de seis PRs e HEADs atualizado, com estado, riscos, dependências e decisão ainda pendente: presente neste PR.
2. PLANO #670 integrado e proteção de certificados aprovada: PASS anterior.
3. Esta matriz/checkpoint precisam de Zero-Drift, LOCK, P0-NR, job Teste C de escopo e Edivan5002 APPROVED no SHA final.
4. Merge protegido sem bypass e readback posterior dos dois arquivos de Fase 0.
5. Após a Fase 0 comprovada, a **próxima tarefa** é iniciar Fase 1 consultando diff/HEAD da PR #593, verificando se a correção ainda é necessária e tratando os dois problemas sem reiniciar R14/Fase 2.

**Regra P0-NR-001:** falhas de CI conhecidas exigem diagnóstico (mergeability, mudanças na main, HEAD, eventos, permissões, dependências), não encerramento prematuro nem retrabalho repetitivo. As decisões de Fases 1–7 só serão anunciadas quando integradas e comprovadas.
