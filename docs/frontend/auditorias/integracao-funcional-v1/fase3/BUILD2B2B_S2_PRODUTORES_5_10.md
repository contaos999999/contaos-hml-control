# F3 BUILD-2b-2 S2 — produtores 5–10 da integração funcional V1

**Issue único:** #708. **Base do resgate:** main pós PR #725 merge e0bfbdad15c9590c361749597e699724ddd26901. Todos os 42 hunks do código original da PR #714 foram aplicados sobre a main preservando S1 RBAC #723 e CODE gate #725. **Escopo de BUILD:** produtores 5 V102, 6 V103, 7 V105, 8 V106, 9 V108, 10 V107, em sequência por dependência. Continuam 138 posições no catálogo normativo, sem certificação por mock ou inventário estático.

## GATE: código somente após GOV específico deste PR integrado à main
- Autorização explicitamente documental e código *offline*, sem habilitar `--run-f3`, sem REQUEST, sem mutação HML, Auth, RLS, Edge, SQL, Storage ou PROD.
- Fontes fechadas: `INTEGRACAO_V1_FASE3_CADASTROS_RELACIONAMENTOS_PLAN_GATE_2026-11-13.md` seções 3/4/7/9/12; `F3_FLUXOS_PRODUTORES.md` seção 3; `F3_CASES.json`; ledger e cerca aprovados no merge #679; fluxo S1 no merge #712.
- Permitir somente `scripts/hml/integracao-v1-fase3.mjs`, `scripts/hml/integracao-v1-fase3.test.mjs` e este documento. Sem alterar o produto para facilitar o teste. Diferença real de contrato deve ser isolada e corrigida em PR próprio com GOV próprio.

## Fluxos por ordem
1. **5 V102**: criar contratante pela UI, documento sintético e organização F3, observar POST na Data API, inventário de UUID, readback pela UI. Sem chave: não reenviar resposta incerta.
2. **6 V103**: editar apenas o contratante inventariado, validar versão esperada derivada da leitura UI, RPC `atualizar_contratante`, nova versão e negativa de operação cruzada.
3. **7 V105**: criar contrato da organização/contratante F3 pela UI, POST sem RETURNING, readback da lista identificando exatamente um contrato sintético; sem inferir UUID da requisição.
4. **8 V106**: atualizar contrato pela UI, `p_request_id` gerado pela própria UI, versão esperada e mudança mínima; negar reenvio sem a chave original.
5. **9 V108**: pré-requisitos de proposta orçamentária (proposta, upload sintético TXT com verificação de status, versão, linha), publicação com hash esperado derivado e espera W1, respeitando o orçamento de 39 intenções/40 por execução/60 total.
6. **10 V107**: origem normativa em texto: fonte, versão, aprovação por hash derivado, aplicabilidade ao contrato. Recusar coerção de status e vazamento de outra organização.

## Aceite verificável desta fatia
- RED/GREEN sobre cada driver com simulação de DOM e cerca nativa real, falha fechada em HTTP/status/JSON incoerente, intenção pendente, UUID estrangeiro, duplicidade e readback divergente. Os testes de contrato não são prova de HML.
- Observação de toda mutação exclusivamente pelo browser sob `createF3MutationFence` e livro, nunca chamadas diretas do runner; credenciais apenas na execução protegida futura.
- Nenhum produtor 11–20 marcado `PASS`; `pendingDriver` preservado até o BUILD integral e seu gate específico.
- Prettier, ESLint, Node test, Zero-Drift, Teste C e Testes de navegador no HEAD, revisão de conta distinta e merge protegido; registrar no #708.

**NO-GO de ativação:** S0 HML e 138 casos dependem da integração de todos drivers 5–20, pares sintéticos válidos, frontend/backend/deployment e cadeia de SHA; esta PR não dispensa nenhum requisito.


## Resgate e contraprovas de regressão (22/11/2026)

A primeira CI da PR #714 não foi certificável: três negativas falharam. Este resgate corrige na origem: (1) amarra o resumo do livro ao SHA-256 do transcript de eventos para detectar exclusões não observáveis no estado final, sem remover o teste de propriedade; (2) inclui as três posições de origem tipadas V107 na matriz negativa, totalizando 14; (3) explicita o campo real `p_chave_idempotencia` do fluxo principal V107 no levantamento normativo, sem relaxar NR-008. A nova prova negativa de supressão de evento deve passar junto com a suíte anterior.

A aprovação deste BUILD é somente de infraestrutura S2: não executa HML autenticado, não certifica 138 relações, não altera F3_CODE_EVIDENCE_LEDGER e não autoriza F4/PROD. Os demais produtores e consumidores e o gate CODE certificado seguem pendentes.
