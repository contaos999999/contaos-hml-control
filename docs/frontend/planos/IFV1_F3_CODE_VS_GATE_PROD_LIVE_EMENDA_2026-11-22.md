# IFV1 Fase 3 | Emenda de separação entre certificação de código e contraprovas LIVE

**Estado deste documento:** proposta de emenda submetida por PR protegida. A integração, revisão independente e CI são requisitos antes da aplicação canônica. Nenhum certificado F3 é emitido por esta emenda.

## 1. Decisão e compatibilidade

A decisão do titular de 22/11/2026, implementada na PR frontend #718 (merge `c2c580eb1db817e273e818f50be65e582e50acc4`), diferencia `CODE_CERTIFICATION` para V1–V5 de `GATE_PROD` com contraprovas LIVE autenticadas após todas as versões. O PLAN F3 anterior requeria diretamente HML autenticado para certificar F3, enquanto o novo verificador genérico não exige essas provas em `CODE_CERTIFICATION`. Esta divergência **não** autoriza declarar PASS de F3: exige separar o método de prova e implementar o gate correspondente, sem diminuir o catálogo.

## 2. Escopo imutável de cobertura

O catálogo `F3_CASES.json` permanece com **138 relações**, das quais **120 obrigatórias** e **18 condicionais**, distribuídas por **20 produtores**, seus consumidores e os perfis MASTER/leitor. Fases 1 e 2 da integração funcional V1 permanecem certificadas, sem regressão presumida. A Fase 4 só pode iniciar após certificado CODE da F3 válido, integrado e atestado.

## 3. Certificação de código da Fase 3, antes de GATE PROD

O certificado `IFV1_F3_CODE` exigirá, cumulativamente:

1. Implementação completa dos drivers de **todas** as relações obrigatórias, fluxos de criação/vínculo/releitura, estados negativos e consumidores, com fonte real do produto e contrato de integração. Não basta existência de helpers, catálogo estático ou passagem de suíte genérica.
2. Matriz um-para-um `caseId -> teste executável -> fonte real -> expectativa -> resultado -> job/run/HEAD -> hash de evidência`. Cada caso obrigatório tem prova automatizada executada no HEAD exato, com erro real em negativo e PASS explícito. Nenhum `SKIPPED`, `NOT_RUN`, `BLOCKED`, `FAIL` ou mock do comportamento essencial pode virar PASS.
3. Os 18 condicionais só recebem `N_A_JUSTIFICADO` mediante emenda factual por caso com fonte de código e aprovação expressa, ou devem passar em testes executáveis. Não aceitar N/A por ausência de driver, credencial ou serviço.
4. Provas de guarda de mutação, origem por posição, livro append-only, isolamento sintético, vínculo da organização, RBAC por papel, idempotência, duplicidade, versionamento, uploads, consumidores e recuperação. Testes de contrato precisam importar componentes/adaptadores reais, isolando somente transporte/persistência quando necessário; não substituir a lógica fiscalizada por stub.
5. Negativos obrigatórios, RED/GREEN quando há defeito reproduzido, regressão do escopo afetado, Zero-Drift, LOCK, NR, Teste C automatizado, CI com `SUCCESS` no commit, parecer independente e PR protegida integrada à `main`.
6. Evidências próprias da camada de código, em ledger separado e versionado, rastreadas por HEAD, sem adulterar ou preencher ficticiamente o `F3_LEDGER.json` de execuções HML existente. O esquema/validador do novo ledger e o gate CODE precisam ser aprovados e testados em PR(s) próprias; apenas criar este PLAN não cria cobertura.

**Regra fail-closed:** enquanto o validador específico de `IFV1_F3_CODE`, a matriz e os 138 resultados reais de código não existirem e não estiverem aprovados, o estado é `NOT_CERTIFIED`. O `F3_DRIVER_PENDING` não pode ser removido por aprovação presumida.

## 4. Contraprovas LIVE exclusivas do GATE PROD

Após todas as versões V1–V5 terem certificados CODE válidos, o `GATE_PROD` exige contraprovas autenticadas de HML, incluindo identidade MASTER/leitor, organização/ADM01, RBAC/RLS, isolamento real entre organizações, persistência, integração dos consumidores, hashes de deployment, reconciliação dos 138 casos quando aplicável e auditoria independente do ambiente. O verificador `f3Gate` e o `F3_LEDGER.json` existentes continuam sendo evidências/gates da camada LIVE enquanto não houver uma emenda técnica específica, revisada e integrada; não eliminar nem enfraquecer suas negativas.

## 5. Execução da emenda

- **S1:** concluir BUILD-2b-2b (MASTER/leitor, SYS04, ADM01, leitura RBAC) e testes automatizados reais, preservando autenticação/segredos somente nos testes LIVE posteriores.
- **S2:** concluir drivers dos produtores V102–V122 e respectivos consumidores, contratos de duplicidade e negativos, sem aumentar permissões RLS.
- **S3:** implementar `IFV1_F3_CODE` e ledger CODE com cobertura fechada, conferir 138 resultados e regressão no HEAD real.
- **S4:** obter revisão independente, CI e merge protegidos do certificado; registrar última etapa comprovada e só então autorizar Fase 4 de código.

## 6. Estado na abertura

O ledger HML `F3_LEDGER.json` conserva `runs: []` e `entries: []`. A PR #679 entregou fundação, e a PR #720 corrige o bloqueio incondicional, sem fornecer todos os drivers. **F3 CODE: NOT_CERTIFIED; F4: NOT_AUTHORIZED; GATE PROD: NO-GO.**
