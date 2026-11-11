# ContaOS 4.1 — Certificação V1 / Fase 8

Data: 11/11/2026. Escopo: certificação da **Versão 1 em HML**, sem promoção de PROD.

## Decisão

**PASS V1 COM TRÊS RESSALVAS JÁ ACEITAS PELO TITULAR:**
- R-01 — upload físico E2E/arquivo grande e retomada;
- R-02 — worker/filas E2E em fluxo integral;
- R-03 — isolamento real multiusuário/organização em todos os domínios.

As três ressalvas não são convertidas em PASS_REAL. PROD permanece proibida sem rito e autorização próprios.

## HEADs certificados

- Frontend main de entrada da Fase 8: `df62bacf78df3df3cf801b688a1aced8a300761d`.
- Backend main: `5eca44aebead3183e81b5c1af0d1dffa5fb8feb6`.
- Supabase HML: `gklhhhyosgasnyoxlrui`, ACTIVE_HEALTHY.
- Produto frontend efetivamente auditado: `0024b3c6739ab6296ec12338f11cf792d3a5f84b`; comparação até a main de entrada da Fase 8 registrou **zero arquivos de produto alterados**.
- Edge `copilot-query` HML v8: fonte remota idêntica ao backend main atual, `verify_jwt=true`.

## Fases predecessoras

A Fase 8 só é emitida porque as sete fases predecessoras possuem checkpoint oficial `COMPLETED` no GATE backend #138:

| Fase | Checkpoint | Resultado |
|---|---:|---|
| 1 — reconciliação | 6798359508 | COMPLETED |
| 2 — diagnóstico/RED | 6798360599 | COMPLETED |
| 3 — correções/GREEN | 6798361715 | COMPLETED |
| 4 — consolidação CRUD/RBAC/C13 | 6797364641 | COMPLETED |
| 5 — revisão/CI/Zero-Drift/LOCK | 6797965561 | COMPLETED |
| 6 — segurança HML | 6797840596 | COMPLETED |
| 7 — auditoria autenticada | 6796791384 | COMPLETED |

## Reconciliação dos 488 critérios V1

Fonte histórica preservada: `docs/frontend/auditorias/P0_V1_RASTREABILIDADE_COMPLETA_2026-11-05.json`.

Foi criada uma reconciliação sucessora item a item em:
`docs/frontend/auditorias/P0_V1_FASE8_RECONCILIACAO_488_2026-11-11.json`.

Resultado:
- 488/488 linhas avaliadas individualmente por `regular_id + criterion_index`;
- 473 `PASS_REAL`;
- 15 `ACEITE_RESSALVA_R03`, correspondentes exclusivamente ao critério histórico repetido de isolamento A/B nos regulares backend 01–15;
- 0 `REVIEW_REQUIRED`;
- nenhuma linha histórica foi apagada, reescrita ou marcada retroativamente no ledger original.

A matriz histórica permanece imutável como fotografia do estado de 05/11. A reconciliação de 11/11 é sucessora e aponta as provas atuais das Fases 1–7.

## 45 regulares V1

Escopo canônico V1:
- histórico 00–42;
- 43 / V1-22;
- 75 / V1-23.

Todos os 45 regulares estão cobertos pela reconciliação dos 488 critérios. Os regulares 43 e 75 possuem BUILD/integração e provas posteriores; o bloco 00–42 foi certificado retroativamente apenas após vinculação das categorias repetidas às provas materiais atuais, sem presumir PASS a partir do simples histórico.

## 25 atômicos V1 + BRAND

- BRAND-01 / 000: PASS pela auditoria autenticada, revisão visual e Zero-Drift.
- 001–024: todos avaliados.
- Itens documentais que dependem de upload físico preservam R-01.
- Itens de ingestão histórica/worker preservam R-02.
- Demais requisitos funcionais V1 usam as provas materiais CRUD/RBAC/segurança/auditoria das Fases 4, 6 e 7.

Nenhum atômico V1 obrigatório permanece sem decisão.

## NFR-001 a NFR-012

A avaliação NFR está registrada separadamente no JSON de reconciliação para evitar usar o histórico `96/96` como atalho.

Classificação:
- NFR-001, 002, 006: PASS escopado HML;
- NFR-003 e 004: PASS com R-01;
- NFR-005: PASS com R-02;
- NFR-007, 008, 009 e 011: PASS material;
- NFR-010: implementação/observabilidade HML comprovada; métricas e alertas de **produção** são N/A neste certificado HML e continuam gate do rito PROD;
- NFR-012: carga/concorrência HML preservada; capacidade e disponibilidade de **produção** continuam gate de produção.

Essas classificações não concedem SLA nem GO de produção.

## SYS-03

O estado atual do plano registra:
- N1/N2 PASS manual conforme decisão do diretor;
- N3/N4 PASS automatizado nos runs 42215105856 / 42215117169;
- não repetir por padrão.

A Fase 8 não volta a classificar a antiga ausência de SYS-03 como bloqueio.

## Segurança

A Fase 6 certificou:
- C13 51/51 checks;
- JWT ausente/malformado/forjado/expirado/revogado;
- isolamento tenant/contrato/ator;
- raw chat restritivo;
- revogação de fontes;
- quotas e concorrência;
- OpenAI real e multi-turn;
- Edge v8 focal 204/403/401.

O aviso de proteção de senha vazada do Supabase permanece registrado como limitação de plano aceita pelo titular, não como PASS técnico e não como bypass.

## Auditoria visual e funcional

Fase 7:
- 64/64 C8 PASS;
- 128 PNG;
- 64 DOM;
- 3 artefatos oficiais com SHA256 externo e manifests internos válidos;
- logout e privacidade confirmados;
- 19 telas anteriores preservadas por referência própria;
- escopo operacional autenticado: 27 telas.

SYS-01/SYS-03 ficam fora desse conjunto autenticado por natureza de fluxo público/recuperação e usam suas provas próprias.

## Governança e integração

Fase 5:
- ruleset frontend ativo;
- PR obrigatório;
- non-fast-forward e deletion bloqueados;
- sem bypass actors;
- Teste C independente, Zero-Drift e protect-types verdes no HEAD final;
- LOCK pós-merge verde;
- zero drift de produto desde o SHA HML auditado;
- backend final revisado com 0 Critical / 0 Important;
- nenhum workflow ativo ou PR não-draft pendente no fechamento.

## Resultado de certificação

**V1 = PASS**, com somente R-01/R-02/R-03 preservadas como ressalvas formalmente aceitas.

Esta certificação:
- libera o gate canônico para iniciar V2;
- não certifica V2–V5;
- não certifica o bloco GLOBAL 67–74/90–99;
- não concede GO para PROD;
- não altera PROD;
- não autoriza remover as três ressalvas sem prova material posterior.

## Próximo passo canônico

Após integração deste certificado e atualização do manifesto P0:
- `proxima_versao_permitida = V2`;
- próximo regular elegível: `44`;
- V2 deve seguir PLAN → BUILD → TEST → AUDIT e certificado próprio antes de V3.
