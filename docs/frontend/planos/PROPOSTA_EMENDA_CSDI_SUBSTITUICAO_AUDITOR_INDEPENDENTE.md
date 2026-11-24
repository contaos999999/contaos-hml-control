# PROPOSTA DE EMENDA NORMATIVA — CERTIFICAÇÃO SEMÂNTICA DEFINITIVA INTERNA

Status: PROPOSTA, NÃO VIGENTE até aprovação, integração à fonte canônica e testes de regressão do protocolo.
Origem: determinação expressa do responsável pelo protocolo ContaOS 4.1, 21/11/2026.
Escopo: substituir a exigência de parecer de auditor independente como condição de certificação semântica pelo sistema interno de pré-auditoria, pré-certificação e certificação semântica definitiva. Não altera automaticamente regras de segurança, autorização de ativação, N17(c), App privilegiado, fila real, HML/RLS ou PROD.

## 1. Substituição de responsabilidade e finalidade

A antiga etapa obrigatória de parecer do auditor independente será substituída, após vigência desta emenda, pela **Certificação Semântica Definitiva Interna (CSDI)**, executada pelo conjunto integrado de pré-auditoria adversarial, pré-certificação BUILD e avaliação semântica integral, com evidências verificáveis, contraditório técnico interno e validação automatizada autenticada.

O responsável pela certificação é o processo institucional de validação, não a mera declaração textual do assistente. A independência externa deixa de ser requisito para o **gate semântico**, mas permanece possível como controle facultativo. Não é permitido autodeclarar sucesso sem provas.

## 2. Três etapas obrigatórias

**Etapa A — Pré-auditoria adversarial:** execução e revisão substantiva dos 12 critérios BUILD V2, 12 lentes adversariais, 10 camadas, três cenários RED/GREEN causais, testes negativos, positivos, de mutação, de revogação e de regressão. A documentação deve registrar cada subpredicado, assertiva, resultado e fonte LIVE. Qualquer falha implica CHANGES_REQUESTED interno, correção e reexecução.

**Etapa B — Pré-certificação autenticada:** recibo estruturado versionado e vinculado a PR, HEAD, base, manifesto, checks, issuer, run, tentativa, job, artefato e digest, validado por consumidor LIVE. O estado `PRE_CERTIFICATION_ONLY` comprova apenas BUILD, nunca semântica definitiva.

**Etapa C — Certificação Semântica Definitiva Interna:** análise substantiva de 100% das cláusulas e subcláusulas da fonte normativa congelada, em sete eixos semânticos, com inventário exaustivo, resolução explícita de ambiguidades, contraprovas, teste de interações entre regras, rastreabilidade cláusula → interpretação → subpredicado → teste → execução → evidência. Interações descartadas exigem justificativa auditável. Todas as exceções, lacunas e divergências devem ser resolvidas antes do PASS.

## 3. Critérios do PASS definitivo

`SEMANTIC_COMPLETENESS=PASS` somente quando, no mesmo HEAD/base/versão normativa: (a) não houver cláusulas sem cobertura; (b) não houver regras sem prova; (c) não houver pares de interação sem adjudicação ou descarte justificado; (d) não houver ambiguidade sem decisão normativa; (e) todos os sete eixos tiverem resultado verificável; (f) as contraprovas e casos positivos executarem com sucesso; (g) o pacote de evidências tiver proveniência autenticada e integridade verificável; (h) uma segunda leitura crítica interna, distinta da elaboração inicial, confrontar resultados e registrar eventuais divergências; (i) o consumidor automático da CSDI devolver PASS; e (j) não houver veto ou alteração posterior não revalidada.

`INCONCLUSIVE`, `BLOCKED`, `CHANGES_REQUESTED` ou falta de evidência são estados NO-GO. Nenhum PASS histórico migra para novo HEAD, base, manifesto ou versão normativa sem revalidação.

## 4. Recibo canônico da CSDI

Identificador sugerido `CONTAOS_SEMANTIC_CERTIFICATION_V1`, schema `contaos.semantic-certification.v1`. Campos mínimos: PR; HEAD; base; hash e versão da fonte normativa; hash do relatório; inventário de cláusulas/regras; sete eixos; cobertura e adjudicação de interações; lista de ambiguidades resolvidas; testes positivos/negativos/mutação/regressão; evidências LIVE; hash do pacote; parecer da segunda leitura interna; revogações e vetos; veredito. O validador deve rejeitar campos ausentes, evidências reaproveitadas fora do escopo e hashes divergentes.

## 5. Fronteiras de autorização preservadas

A CSDI substitui somente o requisito de **parecer externo independente para certificação semântica**. Não autoriza automaticamente merge, alteração de branch protection, desativação de checks, mudança de guard, publicação de App privilegiado, execução de fila real, operação HML/RLS, acesso a PROD ou ativação. N17(c) e demais gates específicos continuam exigindo autorização e prova próprias, mesmo com CSDI PASS. `ativacao_autorizada=false` permanece até processo separado de aprovação.

## 6. Transição e migração normativa

1. Revisar a emenda em PR normativa própria; conferir todas as referências cruzadas a auditor independente no PLAN, recibos, CI, validadores e documentação.
2. Aprovar e integrar a emenda na fonte canônica protegida antes de alterar os gates implementados; atualizar hashes e inventário.
3. Implementar o novo consumidor CSDI e testes de regressão que demonstrem que ausência de parecer externo **não** impede a CSDI, mas ausência de prova semântica integral **sempre** impede PASS.
4. Reexecutar os checks e preservar o histórico de decisões anteriores, sem reescrever provas.
5. Até conclusão dessas etapas, a norma vigente continua aplicável e `SEMANTIC_COMPLETENESS=INCONCLUSIVE`.

## 7. Regra de integridade

O novo modelo é mais exigente na substância: não se permite substituir a auditoria externa por um atalho, apenas pelo conjunto completo de controles internos comprovados. A certificação é definitiva **para a versão e o escopo explicitamente certificados**, sujeita à revogação automática por mudanças materiais, novas contraprovas ou invalidação da cadeia de evidências.
