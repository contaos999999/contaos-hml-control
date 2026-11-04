# GOV-003 — PROMPT → PLAN → VALIDAÇÃO → BUILD → TESTES

**Data:** 03/11/2026 (Brasília)  
**Escopo:** somente governança do frontend no GitHub da organização `contaos999999`; nenhum BUILD funcional, nenhuma alteração no backend/Supabase HML ou PROD.  
**Frontend base:** `contaos999999/contaos-hml-control`, `main` no commit `b8ca8b99b31c65ceccfe6091b5e7bcaad1cf80f0`.  
**Fonte normativa somente leitura:** `contaos999999/develop`, `main` no commit `cb65f4980f4eeca6ccd33caf6198a801b7e60328`.  
**Tipos imutáveis:** `src/integrations/supabase/types.ts`, blob Git `8ea7750b75fd9d76b29c36ce7613392e3ab65e19`, confirmado no HEAD inicial.

## 1. PROMPT e desvio reproduzido
Após migração dos repositórios da conta pessoal `contaos9999` para a organização `contaos999999`:
1. Ruleset da `main` requer PR, mas usuário informa zero revisões obrigatórias; sua configuração efetiva e plano de assinatura dependem de verificação administrativa fora do conector.
2. `.github/workflows/contaos-types-autolock.yml` ainda recupera `types.ts` por `git push origin HEAD:main`, incompatível com proibição de push direto.
3. `scripts/context-freshness-gate.mjs`, `scripts/frontend-scope-gate.mjs` e snapshot usam `contaos9999/develop` e validação de CI PLAN ainda exige URL antiga. O token `CONTAOS_CANONICAL_READ_TOKEN` não foi comprovado em Actions.
4. Testes HML A/B, upload, CRUD e redefinição de senha continuam explicitamente **NÃO AUTORIZADOS / NÃO VERIFICADOS**. Nenhum acesso ao ambiente Supabase está incluído.

## 2. PLAN e estratégia
- **GOV-003-P1 | Canônico:** alterar exclusivamente o nome do owner para `contaos999999` no comparador HTTP do GitHub, nos testes e no snapshot; manter commit e 25 blob SHAs inalterados, assim como catálogo 100 regulares / 97 atômicos. Ajustar o gate de escopo para aceitar apenas a nova origem e URLs de CI do novo repositório, com testes negativos para as origens antigas. Não mascarar ausência de token, divergência de HEAD nem 403.
- **GOV-003-P2 | Auto-Lock:** retirar completamente o push direto à `main`. Preservar detecção por evento/schedule, comprovante do blob e testes de regressão; caso haja drift, criar uma branch `autolock/types-certified-<run>-<attempt>` com o arquivo **exatamente igual ao blob certificado**, publicar somente nessa branch e abrir PR normal com **0 revisões obrigatórias**, SEM merge automático, bypass amplo ou force push. Se a criação de PR por Actions estiver desabilitada, falhar com instrução administrativa. Não editar `types.ts` em `main` neste BUILD.
- **GOV-003-P3 | Regras:** guia atualizado exigindo ruleset ativo e verificável na `main`, PR, checks efetivos do PR, impedir delete/force push e configurar **0 aprovações obrigatórias**, decisão expressa do titular que não convidará colaborador. Nunca simular revisão humana. Verificação real/alteração do ruleset requer administração pelo titular, não há ação disponível no conector.
- **GOV-003-P4 | Segredos:** orientar token fine-grained no owner `contaos999999`, exclusivamente repo `develop`, `Contents: Read-only`; registrar em Actions no frontend com o nome exato `CONTAOS_CANONICAL_READ_TOKEN`, sem expor valor. Só declarar PASS após check real de BUILD/PLAN validado emitir `FONTE CANÔNICA PASS`, não N/A.
- **GOV-003-P5 | Continuidade:** atualizar guias e checkpoint exclusivamente para esse escopo. URLs históricas de evidência são referências, não certificações novas.

## 3. Arquivos autorizados
1. `docs/frontend/planos/GOV_003_RULESET_AUTOLOCK_CANONICO_2026-11-03.md` (este PLAN/documentação).
2. `.github/workflows/contaos-types-autolock.yml`.
3. `.github/workflows/contaos-frontend-zero-drift.yml` (inclusão somente de teste focado).
4. `scripts/types-autolock-workflow.test.mjs` (novo).
5. `scripts/context-freshness-gate.mjs`.
6. `scripts/context-freshness-gate.test.mjs`.
7. `scripts/frontend-scope-gate.mjs`.
8. `scripts/frontend-scope-gate.test.mjs`.
9. `docs/frontend/CONTEXT_CANONICO_4_1_SNAPSHOT.json`.
10. `docs/frontend/GUIA_TESTEC_E_FONTES_2026-11-03.md`.
11. `docs/frontend/GUIA_PROTECAO_GITHUB_2026-11-03.md`.
12. `docs/frontend/ESTADO_E_RETOMADA_CONTAOS_4_1.md`.

**Proibidos:** `src/**`, `public/**`, `supabase/**`, `backend/**`, `migrations/**`, `package.json`, `bun.lock`, segredos, demais arquivos do projeto; qualquer escrita no repositório `contaos999999/develop`, Supabase HML e PROD. O Auto-Lock somente propõe restaurar o blob certificado por PR de reparo futuro, com CI obrigatório e sem aprovação humana obrigatória.

## 4. TDD, critérios de aceite e rollback
- **RED:** testes estáticos e unitários devem detectar: URL de origem antiga; URL de CI PLAN antiga; instrução de `git push origin HEAD:main`; mutação não autorizada do arquivo bloqueado; snapshots com origem incorreta. 
- **GREEN:** validar funções do snapshot com 25 documentos preservados, 100/97 prompts, HEAD/blobs iguais; rejeitar owner antigo; nenhum push ou merge direto na `main`; abertura de PR sem bypass; CI local do guard e do workflow Auto-Lock.
- **CI obrigatório:** GitHub Action `ContaOS Frontend Zero-Drift` (autotestes dos gates, Vitest, TypeScript, build, Zero-Drift) e `ContaOS Teste C Independente` quando acionável, com artefato do SHA. Não aceitar "teste pendente" como PASS de end-to-end.
- **Teste prático Auto-Lock:** em cenário isolado e reversível, simular drift **apenas em fixture/branch temporária**, validar a criação do PR e que nenhum push à main foi efetuado. PR real de restauração só ocorrerá se drift real existir. Caso a política de Actions para criação de PR esteja desabilitada, reportar bloqueio e não criar bypass.
- **Ruleset:** validar no site GitHub que PR com checks FAIL é bloqueado, que PR com checks SUCCESS é mesclável com zero revisões, e que a rotina Auto-Lock cria PR em vez de push direto. A ativação é **manual e posterior** à aprovação dos testes do Auto-Lock.
- **Token vivo:** usar check em SHA de BUILD/PLAN real com `FONTE CANÔNICA PASS`; secret ausente/inválido deve bloquear. Seu conteúdo nunca aparecerá em logs/chat.
- **Rollback:** reverter unicamente commits de GOV-003 via PR; nenhuma reversão de backend necessária.
- **Impacto visual:** N/A; marca, tokens, rotas e UX intocados.
- **Impacto HML:** N/A; fixtures, dados, RLS, Auth e Storage intocados.

## 5. VALIDAÇÃO BLOQUEANTE
| Gate | Decisão inicial | Prova / condição |
| --- | --- | --- |
| Escopo governança, zero backend/PROD/types | PASS no plano | allowlist acima |
| PRD 4.1 / Premissas / Zero-Drift | PASS quanto a preservação de invariantes | ADR-DEV-002 / GOV-002 |
| Origem canônica / revisão do backend | PASS documental | HEAD `cb65f498...`, catálogo blob `e54e49e626e65a9c94c81709180fd192a1f0c079` |
| PLAN antes de BUILD | PENDENTE CI do PLAN | commit documental isolado obrigatório |
| Testes Auto-Lock com PR real | NÃO VERIFICADO | validar em ambiente seguro |
| Ruleset com 0 revisões | NÃO VERIFICADO | depende de administração; dispensa de revisor decidida pelo titular |
| Token Actions e prova de leitura | NÃO VERIFICADO | precisa do titular, sem valor exposto |
| E2E Supabase A/B | BLOQUEADO | falta autorização específica; fora do escopo |

**Decisão operacional:** BUILD de governança somente após PLAN em commit separado e verificação de CI do PLAN; não alterar funcionalidade ou backend. Não declarar 100% até verificação real de todos os controles.

## ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE (OBRIGATÓRIO)
Marca ContaOS Brand v1.0 / BRAND-01, PRD 4.1, Zero-Drift e NFR preservados. Reutilizar > estender > criar; não tocar assets, tokens, rotas, interfaces ou integrações funcionais. Economia Lovable: GitHub como fonte de desenvolvimento, Lovable apenas sincronização/visualização; evitar BUILD desnecessário ou alteração de repositórios protegidos. Identidade visual N/A por ausência de mudanças visuais, com validação de diff; não dispensa CI, segurança, teste independente e aprovação humana quando necessária.
