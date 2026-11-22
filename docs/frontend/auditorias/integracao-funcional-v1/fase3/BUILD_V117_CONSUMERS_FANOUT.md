# F3 CODE — Fanout de quatro consumidores da revisão V117

Causa raiz única: ausência de verificações CODE correlacionando a revisão humana V117 com os consumidores V114 (C0455), V118 (C0461), V119 (C0463) e V123 (C0465), preservando a ligação C0458 já integrada.
Fonte normativa: F3_CASES.json congelado, V117 reanálise append-only e invalidar_portao_competencia da migração backend 20261107094443_p0_v117_revisao_humana.sql, parsers frontend de VisaoGeral, ParecerInterno e Auditoria.
Escopo: funções assertion de readback de consumidores no executor F3 com cenários positivos e negativos em testes mjs; não alterar produto, backend, scripts de autenticação, ledgers ou matrizes. 
C0455/C0463 são leituras V114 do mesmo RPC em telas distintas: contrato exige bloqueio de apresentação, revogação do parecer e da aprovação anterior, identidade de competência/contrato/organização F3. C0461 exige parecer anterior em status substituido, sem novo parecer aprovado. C0465 exige evento de auditoria com entidade e correlação da revisão e diferenciação de perfis na superfície CODE, sem alegar que o leitor foi autenticado.
As provas aqui serão CODE de payload/contrato, sem execução autenticada HML antes de V5. Nenhum caseId será marcado PASS sem a integração e evidências exigidas; função retornará somente CONTRACT_NOT_CERTIFIED.
Requer PLAN P0 prévio, CI e revisor externo no HEAD vigente, merge protegido.
