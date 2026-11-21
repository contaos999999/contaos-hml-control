# Inventário de migração do protocolo CSDI

Este inventário registra referências comprovadas no HEAD `7ff83fdda2606c615301cca86bd575d6f56db880` da PR #690. **Não constitui alteração da norma em vigor.** A alteração deve ser implementada em PR próprio, com aprovação normativa e regressão, sem editar a PR BUILD congelada.

| Fonte | Evidência | Ação de migração |
|---|---|---|
| `docs/frontend/governanca/P0_AUDITOR_FISCAL_UNIVERSAL_4_1.md` | Linha 18: estado `CERTIFIED` exige relatório independente | Separar certificado de missão do gate semântico; substituir somente a dependência semântica após aprovação da emenda |
| Mesmo documento | Linha 78: revisão independente e Codex 3.1.4 | Substituir pela segunda leitura interna autenticada, sem conceder revisão nativa automaticamente |
| Mesmo documento | Linhas 105–107: pré-auditoria não substitui auditor externo e sequência obriga auditoria | Atualizar sequência para pré-auditoria → BUILD pre-cert → CSDI; não confundir com ativação |
| Mesmo documento | Linhas 111–117: recibo do assistente não é certificado e auditoria permanece obrigatória | Preservar natureza do recibo BUILD; acrescentar recibo CSDI separado |
| Mesmo documento | Linha 123: segunda análise cética não é auditoria independente | Manter a afirmação factual de ausência de independência; exigir revisão crítica interna e provas semânticas integrais |
| `docs/frontend/governanca/MISSAO_ATIVA_4_1.json` | `independent_audit_for_build: true` | Alterar somente após norma vigente e validação do novo gate |
| Mesmo JSON | `pending` inclui auditoria/revisão independente do BUILD | Substituir pela CSDI pendente, sem marcar DONE |
| `scripts/p0-rca-impact-gate.mjs` | Critérios de revisão nativa e adversarial BUILD | Preservar o gate BUILD; adicionar validador distinto para CSDI, com schema e testes negativos |
| `.github/workflows/contaos-auditoria-controller.yml` | Consumidor LIVE da pré-auditoria | Preservar o job atual; acrescentar consumidor CSDI sem transformar `PRE_CERTIFICATION_ONLY` em `CERTIFIED` |
| PLAN protegido do backend `contaos999999/develop` | Fonte normativa indicada pelo contrato BUILD como PLAN #689 e emenda #691 | Localizar e emendar na autoridade correta antes de migrar gates frontend |

## Condições para concluir a migração

- [ ] Identificar os caminhos e hashes do PLAN canônico protegido no backend, incluindo emendas #689 e #691
- [ ] Aprovar emenda na fonte de autoridade, sem modificação silenciosa da norma
- [ ] Atualizar o contrato e a documentação com rastreabilidade de cada referência cruzada
- [ ] Criar schema/validador CSDI, testes unitários, de integração, mutação, revogação e não regressão
- [ ] Demonstrar que falta de auditor externo não veta CSDI, mas ausência de prova semântica sempre veta
- [ ] Validar a integridade LIVE do recibo CSDI e sua relação com a versão normativa
- [ ] Executar checks terminais e confirmar readback no HEAD/base corretos
- [ ] Somente após aprovação e merge da norma, marcar o requisito externo como substituído

**Status:** `BUILD_V2_PRECERT=PASS_AUTHENTICATED`; `CSDI=NOT_IMPLEMENTED`; `SEMANTIC_COMPLETENESS=INCONCLUSIVE`; `ACTIVATION=NO_GO`.
