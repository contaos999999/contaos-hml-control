# PLAN — IFV1 Fase 5 CODE: RBAC, RLS e isolamento entre organizações — 25/11/2026

Estado: PROPOSTA DE PLAN, NOT_RUN, sem autorização antecipada de BUILD ou certificação. Fase 5 da integração funcional V1 não é a versão V5 do produto.

## 1. Baseline e continuidade
- Frontend main verificada em e322301e58419e78eb4dfad77a956326b449ecc1, merge da PR #776 às 07:09:56 Bahia. HEAD da CERT 8d463319662b331b62bba677a20cb791a48ec579; CI 6/6 SUCCESS; revisão técnica assistida Edivan5002 aprovada; readback de certificado, manifesto (blob 3496b9dffd896a98ecba965038ba57805fa3b4d3) e recibo (blob 3738da827a90ed231b8dd6713b308697ba5c0736) na main confirmado. F4 CODE 138/138 casos, 276/276 provas, zero FAIL/BLOCKED/N/A. Material #771, atestação #774, promoção #775, ledger blob 03137c9d9961e914f6d0687df730a8843c4cc742; não reabrir F4 nem reutilizar PASS como prova F5.
- Backend normativo develop/main conferido a1516de1d8949e505d83b5e000eb1cc558b217a7. Supabase é autoridade; não presumir deploy equivalente.
- Plano mestre #653, §§ 7, 13.7, 16, 18 e 19. Matriz INTEGRACAO_V1_7_FASES_MATRIZ_EXECUCAO_PROPOSTA.csv, blob bb7ce43f9c334f2f03e9aafab405addadfe5e19a: 138 IDs IFV1-F5-*, 120 obrigatórios e 18 condicionais, únicos. Nenhuma execução F5 alegada.
- Decisão do titular #708 comentário 7086578908 (22/11): CODE/CI/fixtures até certificação da versão V5; JWT/RLS remota, HML autenticada e pré-PROD somente após V5. A exceção de revisão assistida F4 do PLAN #759 NÃO se estende à F5; revisão independente exigida, salvo decisão específica formal do titular. PROD NO-GO.

## 2. Escopo e contrato de prova
Construir matriz papel × recurso × ação × organização baseada em contratos normativos do backend e chamadas reais do frontend. Dois tenants sintéticos com identificadores e dados distintos; dois ou mais perfis conforme permissões normativas, incluindo MASTER e perfil restrito. Usar código real de navegação, guards, adaptadores, cache e resolução de permissões. Transporte/armazenamento sintético isolado explicitamente marcado CODE_FIXTURE; nunca atribuir PASS RLS remota a mock. Onde contrato SQL/policy for verificável em CODE, preferir análise/teste automatizado da fonte real no SHA normativo, sem alterar backend. Registrar limites e pendências LIVE por caso.

Cada ID exige positiva autorizada e negativa material; mínimo 276 provas distintas, mais subcasos quando necessários. Positiva deve comprovar operação e resposta esperadas no próprio tenant. Negativa deve alcançar a fronteira fiscalizada e demonstrar negação/ausência de exposição e efeito indevido; cobrir rota direta, manipulação de IDs/filtros/payload, mudança de tenant, papel insuficiente, sessão revogada/cache antigo, associação cruzada e ausência de contexto conforme aplicabilidade. Não declarar PASS com mero título, contagem, snapshot, spy sem assert material, mock que reproduza o resultado esperado, UI oculta como prova exclusiva de backend, ou resposta artificialmente vazia. Não inventar direitos, mutações ou papéis. Condicionais requerem aplicabilidade objetiva; N_A_JUSTIFICADO não é PASS e exige aceite específico. Meta proposta: 138/138 PASS, zero N/A, sem falsificar aplicabilidade.

## 3. Fatias propostas
| Fatia | Origem | Casos | Obrig. | Cond. | Provas mín. | Foco |
|---|---|---:|---:|---:|---:|---|
| F5.1 | ADM01 SYS01 SYS04 | 54 | 52 | 2 | 108 | Vínculos, identidade, sessão e organização; troca de contexto, revogação, cache, MASTER sem papel humano implícito |
| F5.2 | V102 V103 V105 V106 | 24 | 20 | 4 | 48 | Contratantes e contratos; leitura, mutação, associação e IDs de outro tenant |
| F5.3 | V107 V108 V109 | 17 | 14 | 3 | 34 | Normativos, orçamento e listas; fonte, versão e vigência com escopo autorizado |
| F5.4 | V110 V111 V115 | 14 | 11 | 3 | 28 | Documentos, versões e evidências; metadados, referências, links e download/upload por contrato |
| F5.5 | V113 V116 V117 | 19 | 16 | 3 | 38 | Competências, análises e revisão; leitura/mutação, detalhe, ações e filtros manipulados |
| F5.6 | V118 V119 V122 | 10 | 7 | 3 | 20 | Pareceres, apresentação e histórico; estados permitidos, autoria e eventos de auditoria |
| Total | | 138 | 120 | 18 | 276 | |

IDs de conexão exatos; prefixo IFV1-F5- em todos:
- **F5.1** (54): C0002, C0005, C0007, C0009, C0011, C0012, C0014, C0016, C0017, C0018, C0019, C0020, C0021, C0022, C0023, C0024, C0025, C0026, C0027, C0028, C0029, C0030, C0031, C0032, C0033, C0034, C0036, C0037, C0041, C0043, C0045, C0046, C0047, C0048, C0049, C0050, C0051, C0052, C0053, C0054, C0055, C0056, C0057, C0058, C0059, C0060, C0061, C0062, C0063, C0064, C0065, C0066, C0067, C0068.
- **F5.2** (24): C0093, C0096, C0098, C0100, C0107, C0111, C0113, C0115, C0116, C0132, C0136, C0139, C0140, C0146, C0153, C0156, C0159, C0162, C0165, C0167, C0170, C0172, C0174, C0176.
- **F5.3** (17): C0192, C0200, C0202, C0203, C0204, C0205, C0208, C0232, C0233, C0234, C0237, C0260, C0262, C0263, C0264, C0265, C0268.
- **F5.4** (14): C0288, C0294, C0297, C0311, C0315, C0320, C0321, C0324, C0410, C0413, C0415, C0416, C0418, C0420.
- **F5.5** (19): C0352, C0365, C0368, C0369, C0370, C0371, C0372, C0373, C0376, C0433, C0437, C0439, C0441, C0443, C0455, C0458, C0461, C0463, C0465.
- **F5.6** (10): C0477, C0482, C0484, C0496, C0502, C0504, C0562, C0563, C0564, C0567.

## 4. Sequência de PRs
1. PLAN documental: aceite rastreável do titular, revisão independente, CI, merge protegido, readback. Fixar HEADs, inventário normativo de papéis/políticas e divergências antes de BUILD.
2. PLAN P0 por BUILD (ou plano prospectivo restrito aprovado) com caminhos exatos, fronteiras, oráculos e casos. Não ampliar allowlists globais nem relaxar guards. BUILD harness/validador exato, testes negativos de adulteração (ID ausente/extra/duplicado, positivo/negativo faltante, tenant/perfil errado, SHA divergente, falha/skip, prova vazia e erro de transporte). Preflight nunca é certificado.
3. BUILDs F5.1–F5.6 cumulativos, respectivos 54/24/17/14/19/10 casos e mínimo 108/48/34/28/38/20 provas. Reutilizar infraestrutura F4 apenas após análise de impacto e equivalência; produzir novas provas F5. Para cada lote: RED causal reproduzível quando houver falha, correção definitiva da causa raiz, GREEN e regressões, CI integral e revisão independente no HEAD exato, merge protegido, readback. Se lacuna real backend, registrar RCA/impacto e obter autorização de PLAN backend separado; não contornar com lógica frontend. Evitar alterações de produto sem PLAN específico.
4. Execução integral única cumulativa dos 138 IDs e 276 ou mais provas no mesmo SHA testado, com prova de igualdade da árvore integrada; não somar runs incompatíveis. Preservar artefatos individuais, hashes e registros sanitizados.
5. PLAN de atestação/promoção; atestador reproduzível valida origem dos artefatos, IDs, pares, observações, fonte, hashes, jobs, SHA e árvore. Candidato NOT_CERTIFIED; contraprovas contra adulteração. Promoção compara bytes originais, reproduzidos e versionados e produz recibo verificável. Ledger histórico append-only/imutável.
6. CERT documental separado (manifesto, recibo, certificado) após todos os gates, revisão independente, CI, merge e readback. Checkpoint final registra SHA, PRs, runs, resultados, limitações e próxima tarefa. F6 CODE somente após certificação efetiva e PLAN próprio.

## 5. Evidência e gates
Por caso: caseId, sourceConnectionId, origem/destino, classificação, aplicabilidade, perfil e tenant sintéticos, operação, fronteira, expectativa normativa com referência, resultado observado positivo/negativo, asserts de ausência de vazamento/mutação, status, limpeza, frontend/backend/harness SHA, run/job/artifact/sha256 e escopo CODE_FIXTURE. Sem JWT, secrets, PII ou dados reais. Logs sem valores confidenciais. F5.1–F5.6 devem distinguir negativas de autorização de falhas de transporte; erro genérico não comprova bloqueio.

Manter Zero-Drift, Teste C, LOCK-TYPES, Anti-Reincidência e demais checks obrigatórios existentes, regressões F1–F4 conforme impacto e integridade dos certificados. Sem force merge, sem aprovação pelo próprio implementador como independente, sem alterações de política para satisfazer teste, sem declarar CI concluído antes de consulta real. Qualquer FAIL/BLOCKED/skip/prova ausente impede CERT; N/A apenas mediante aceite previsto no plano mestre. RLS/JWT remota, duas sessões reais e isolamento em HML permanecem NOT_RUN até o marco pós-versão V5; R-03 deve permanecer no backlog LIVE. Não confundir F5 CODE PASS com isolamento remoto certificado. GATE PROD NO-GO.

## 6. Próxima ação
Após integração deste PLAN e aceites necessários, inventariar contratos RBAC/RLS do backend normativo e mapear os 54 casos de F5.1 a oráculos materiais por ID. Elaborar PLAN P0 de harness e primeira fatia com arquivos exatos. Não iniciar BUILD nesta PR.
