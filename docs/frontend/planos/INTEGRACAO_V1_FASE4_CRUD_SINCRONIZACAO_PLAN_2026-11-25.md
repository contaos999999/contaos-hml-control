# PLAN — IFV1 Fase 4: CRUD e sincronização — 25/11/2026

**Estado:** proposta de PLAN específico, sem autorização de BUILD ou certificação antecipada. Escopo: S5 do plano mestre de sete fases (não confundir com a versão V4 nem com a certificação geral anterior de oito fases).

## 1. Baseline comprovada e fontes

- Frontend main conferida idêntica a 019a38e4aca6ec7d09a298875627d9c896f72600. F3 CODE: PR #758 MERGED, CI 6/6, 138/138 casos, 276/276 provas, zero falhas/bloqueios; [checkpoint](https://github.com/contaos999999/contaos-hml-control/pull/758#issuecomment-7151509171).
- Backend normativo develop/main conferido idêntico a a1516de1d8949e505d83b5e000eb1cc558b217a7. Não presumir deploy ou equivalência operacional HML.
- [Plano mestre aprovado #653](https://github.com/contaos999999/contaos-hml-control/blob/main/docs/frontend/planos/PLANO_MESTRE_AUDITORIA_INTEGRACAO_FUNCIONAL_V1_7_FASES.md), §§ 6, 13.6, 16, 18, 19.
- Matriz fonte: INTEGRACAO_V1_7_FASES_MATRIZ_EXECUCAO_PROPOSTA.csv, blob bb7ce43f9c334f2f03e9aafab405addadfe5e19a, SHA-256 registrado b8b4980bab5f841adc1db9c642e960f45a6874baad660bd18cd6a60ce87e32d9; 138 caseIds IFV1-F4-Cxxxx, 120 obrigatórios e 18 condicionais, sem duplicidade.
- Decisão CODE x LIVE de 22/11, [issue #708 comentário 7086578908](https://github.com/contaos999999/contaos-hml-control/issues/708#issuecomment-7086578908): somente CODE, fixtures sintéticas isoladas, regressão e contratos até V5 certificada. A emenda específica F3 e decisão posterior #690 comentário 7148248800 não devem ser automaticamente estendidas para dispensar revisão independente da F4. Propor explicitamente método F4 CODE neste PLAN, mantendo revisão independente e proteção de merge conforme regra geral.
- Certificados F1–F3 preservados; Trilha B é fonte candidata a reaproveitamento, não PASS automático F4. Revisar provas e impacto antes de reutilizar.

## 2. Escopo e objetivo

Demonstrar comportamento CRUD permitido e sincronização entre interfaces e adaptadores de dados, com persistência/releitura em fixture controlada, cache, recarga e reconstrução de sessão sintética. Supabase é autoridade; não introduzir banco, cache autoritativo, política ou regra paralela no frontend. Não simular a lógica fiscalizada. Nenhuma mutação HML, Auth/RLS/DDL/Edge/Storage remoto ou PROD nesta fase. A prova de persistência real remota, concorrência transacional, sessões autenticadas e contraprovas operacionais é preservada como requisito LIVE no GATE PROD pós-V5.

Matriz por caseId e operação: CREATE, READ, UPDATE, DELETE/ARCHIVE, ação material específica ou leitura/seleção, conforme contrato real. Não inventar DELETE/UPDATE para recurso imutável. Para operação proibida, provar rejeição ou ausência de ação, sem substituir negativa de backend LIVE. A classificação original não muda. Cada caso deve ter pelo menos uma prova positiva e uma negativa de comportamento F4, total mínimo 276 provas; adicionar subtestes quando necessário para cobrir todos os verbos, invariantes e condições aplicáveis. Não tratar 138 como número de operações CRUD distintas.

## 3. Fatias de entrega (S5.1–S5.6)

| Fatia | Origem | Total | Obrigatórias | Condicionais |
|---|---|---:|---:|---:|
| F4.1 Organizações, usuários e vínculos | SYS01, SYS04, ADM01 | 54 | 52 | 2 |
| F4.2 Contratantes e contratos | V102, V103, V105, V106 | 24 | 20 | 4 |
| F4.3 Normativos, orçamento e listas | V107, V108, V109 | 17 | 14 | 3 |
| F4.4 Documentos e versões | V110, V111 | 8 | 6 | 2 |
| F4.5 Competências, análise e requisitos | V113, V115, V116, V117 | 25 | 21 | 4 |
| F4.6 Pareceres, apresentações e histórico | V118, V119, V122 | 10 | 7 | 3 |
| Total | 19 superfícies de origem, 20 produtores | 138 | 120 | 18 |

### F4.1 — Organizações, usuários e vínculos
Listar/selecionar/criar organização e salvar vínculo; propagar escopo, perfil e permissões efetivas a todos os consumidores. Isolar cache por organização, revalidar após troca e recarga, rejeitar dados anteriores, falha de troca, vínculo inválido e resposta atrasada.

CaseIds canônicos (prefixo IFV1-F4-): C0002, C0005, C0007, C0009, C0011, C0012, C0014, C0016, C0017, C0018, C0019, C0020, C0021, C0022, C0023, C0024, C0025, C0026, C0027, C0028, C0029, C0030, C0031, C0032, C0033, C0034, C0036, C0037, C0041, C0043, C0045, C0046, C0047, C0048, C0049, C0050, C0051, C0052, C0053, C0054, C0055, C0056, C0057, C0058, C0059, C0060, C0061, C0062, C0063, C0064, C0065, C0066, C0067, C0068.

### F4.2 — Contratantes e contratos
Criar/consultar/editar contratante e contrato, listar/detalhar, validar escopo e versão; verificar duplicidade, concorrência, erros de validação, dependências e operações de encerramento/arquivamento apenas se autorizadas. Reconciliar dashboard e consumidores.

CaseIds canônicos (prefixo IFV1-F4-): C0093, C0096, C0098, C0100, C0107, C0111, C0113, C0115, C0116, C0132, C0136, C0139, C0140, C0146, C0153, C0156, C0159, C0162, C0165, C0167, C0170, C0172, C0174, C0176.

### F4.3 — Normativos, orçamento e listas
Aplicabilidade, publicar versão de proposta e comandos de listas, versões e itens; preservar versões históricas, vigência, chaves de idempotência, atualização dos consumidores, conflitos e impossibilidade de mutação proibida.

CaseIds canônicos (prefixo IFV1-F4-): C0192, C0200, C0202, C0203, C0204, C0205, C0208, C0232, C0233, C0234, C0237, C0260, C0262, C0263, C0264, C0265, C0268.

### F4.4 — Documentos e versões
Criar documento, acrescentar versão, conferir listagem, leitura, metadados e atualização de fontes/análises. Testar contrato de upload e compensação, falha parcial, repetição, versão concorrente e preservação do histórico. Upload físico remoto permanece LIVE.

CaseIds canônicos (prefixo IFV1-F4-): C0288, C0294, C0297, C0311, C0315, C0320, C0321, C0324.

### F4.5 — Competências, análise e requisitos
Criar competência/documento, solicitar análise e registrar revisão; conferir recarga, unicidade, resultados atuais, invalidação do resultado obsoleto, transições, estado de erro, repetição e recomputação apenas prevista no contrato.

CaseIds canônicos (prefixo IFV1-F4-): C0352, C0365, C0368, C0369, C0370, C0371, C0372, C0373, C0376, C0410, C0413, C0415, C0416, C0418, C0420, C0433, C0437, C0439, C0441, C0443, C0455, C0458, C0461, C0463, C0465.

### F4.6 — Pareceres, apresentações e histórico
Aprovação de parecer, registro de apresentação e ingestão histórica; releitura, versionamento, eventos de auditoria, correlação, vínculo, bloqueio de ação fora da etapa/escopo, não promover histórico a regra material sem governança.

CaseIds canônicos (prefixo IFV1-F4-): C0477, C0482, C0484, C0496, C0502, C0504, C0562, C0563, C0564, C0567.


## 4. Protocolo único de execução

1. RECUPERAR: readback dos certificados F1–F3, matriz, PRs e provas da Trilha B; comparar frontend/backend atuais com baseline; ler documentos canônicos e contratos de cada produtor e consumidor. Registrar o impacto.
2. PLAN: aprovar escopo específico CODE/LIVE, matriz de operações/perfis e inventário de arquivos autorizados; CI e revisão do PLAN, merge/readback antes de BUILD. Não confundir aprovação de plano com aprovação dos casos.
3. PRE-FLIGHT e REUSO: adaptar a infraestrutura F3 de execução, fixtures, catálogo, provenance, relatórios, negativos, atestação e ledger de maneira parametrizável, sem refatorar resultados históricos nem criar mecanismos concorrentes. Derivar caseIds F4 da coluna original; verificar cardinalidade, IDs únicos e vínculo exato ao produtor/consumidor; classificar cada operação pelo contrato normativo. Mapear fonte de produto e oráculo por caso. Não emitir PASS de preflight. Congelar os contratos; só criar artefatos F4 exigidos pelo gate.
4. BUILD: por fatia, executar componentes/hooks/adaptadores reais e controlar somente transporte/persistência externos com fixture stateful. Exercitar mutação, readback independente do resultado da escrita, listagem/detalhe/consumidor, cache/recriação do estado, negativa e compensação quando prevista. Um mesmo cenário pode cobrir várias assertivas, mas cada caseId deve ter oráculo e recibo próprios. Não aceitar testes que apenas comparam objetos fabricados com seus próprios valores. Se falhar: RCA → impacto → RED reproduzível → correção mínima definitiva → GREEN → regressão do escopo → revisão; sem mudança de contrato para ajustar teste.
5. VALIDAR: execução automatizada integral dos 138 IDs e testes transversais. Capturar observações sanitizadas (não somente hashes de resultados), versão/identidade, rede fixture, readback, estado antes/depois, cache, rollback/cleanup, erros e resultado. Testar negativos de proveniência, troca de caso, prova duplicada, ausência de execução, alteração do artefato, SHA/CI errados. Exigir zero mutações fora do escopo. Identificar a origem do erro, sem registrar segredos/PII.
6. REVIEW/MERGE: PRs pequenas por domínio ou lote coerente, CI integral (Zero-Drift, LOCK, NR, build, typecheck, regressão, Teste C quando aplicável), revisão independente do SHA exato, merge protegido, readback. Se houver lacuna backend real, interromper só o caso afetado, registrar evidência e obter autorização específica antes de qualquer alteração em develop; demais casos podem avançar sem cruzar a fronteira.
7. CERT: aproveitar a cadeia verificada da F3, com ledger F4 e recibo de atestação/promoção; agrupar o fechamento em uma PR documental de certificado após comprovação do BUILD integrado. Evitar PRs artificiais repetidas quando escopo, governança e CI permitirem. Não preencher ledger anterior, editar recibos originais nem promover PASS manualmente. Emitir certificado somente após 138 posições terminais, 100% aplicáveis PASS, 0 FAIL/BLOCKED/SKIPPED/NOT_RUN; N_A_JUSTIFICADO somente por caso e aprovação explícita com fonte, nunca por ausência de driver. Meta preferencial: 138/138 PASS e 276/276 provas mínimas, sem N/A. CI e review no HEAD correto, merge e readback. F5 não inicia antes desse certificado válido. GATE PROD continua NO-GO.
8. CHECKPOINT: atualizar issue #708, documento de estado/retomada mediante PR documental protegida quando aplicável, e registrar no painel backend PR #138 sem editar código backend. Incluir HEADs, PRs, reviews, runs/jobs, artefatos, SHA-256, evidência por caso, defeitos, resoluções e próximos passos. Em mudança de conversa, preservar ponto exato e não repetir casos válidos.

## 5. Oráculos transversais mínimos (quando aplicáveis ao contrato)

- CRUD: dados autorizados após criação/atualização; listagem, detalhe e consumidor convergem; operação negada não muda estado; exclusão/arquivamento preserva dependências e histórico.
- Concorrência: escrita com versão obsoleta recebe conflito conforme contrato, sem sobrescrever estado mais novo; rejeição é observada na aplicação.
- Idempotência: mesma chave/mesma intenção não duplica; mesma chave/intenção conflitante segue negativa contratual; retry após erro incerto não multiplica entidade, versão ou evento.
- Cache/sincronização: invalidar/refazer consultas afetadas; distinguir stale, pending, error, ready; resposta atrasada ou mudança de contexto não sobrescreve outro tenant/contrato; reconstrução do cliente retorna estado correto da fixture.
- Rede/rollback: erro, timeout, interrupção, falha de etapa intermediária não mostram falso sucesso; rollback/compensação quando contratualmente previsto; confirmar estado final por leitura distinta; cleanup local verificável.
- Auditoria/versionamento: evento correlacionado à mutação quando previsto; preservar versões antigas; sem evento inventado nem duplicado. CODE não substitui validação real de RLS/RBAC, transações ou filas.
- UI: teste de interação de componente quando necessário para comprovar que o efeito chega à tela, não só a helper; preservar menus, rotas, layout, acessibilidade e identidade visual.
- Segurança: validar negações de escopo no cliente e no contrato, sem alegar RLS remota; manter prova bilateral LIVE no gate futuro.

## 6. Estrutura mínima dos entregáveis

A nomenclatura é proposta de implementação, não afirma existência atual:
- Catálogo/manifesto F4 derivado da matriz existente; correspondência de 138 linhas e operação/expectativa por caso.
- Harness/runner e testes por fatia usando infraestrutura comum, sem mutar F3. Gates e arquivos de governança somente com PLAN P0 de escopo fechado previamente integrado quando exigido.
- Relatório individual com caseId, sourceConnectionId, origin/destination, classificação, operação, papel/fixture, oráculo positivo/negativo, teste e arquivo de fonte, resultado, frontendSha, backendSha normativo, harnessSha, run/job/artifact, output hash, observação sanitizada, readback/cleanup, modo CODE/LIVE. LIVE inexistente fica explicitamente NOT_RUN (fora da certificação CODE).
- Ledger e recibo F4 verificáveis, certificado IFV1_F4_CODE, checkpoint de encerramento. Negative tests contra falsificação, omissão, duplicidade, adulteração e proveniência inválida; sem promover inventário estático.

## 7. Métricas e decisão de continuidade

| Indicador | Baseline desta proposta | Meta de fechamento |
|---|---:|---:|
| Posições canônicas | 138 identificadas | 138 terminais |
| Obrigatórias | 120 | 120 PASS |
| Condicionais | 18 | 18 PASS ou N/A individual aprovado |
| Provas positivas/negativas | Não verificadas em F4 | Pelo menos 276 se todos aplicáveis, mais subtestes necessários |
| FAIL/BLOCKED/SKIPPED/NOT_RUN aplicáveis | Não medidos | 0 |
| CI/review/merge/readback | Não executados F4 | Todos válidos |
| Certificado | Não emitido | Integrado main e verificado |

Estado inicial F4: PLAN_PROPOSED, sem alegação de implementação concluída. Decisão proposta: iniciar após PLAN integrado e aceite do titular, preservar F3 e executar S5.1 em diante com cobertura incremental e teste de regressão por impacto; não abrir F5 nem executar LIVE/PROD antecipadamente. Nenhuma duração arbitrária: acompanhar casos executados, evidências verificadas, falhas, revisões e gates em vez de estimativa de progresso fictícia.

## 8. Proposta de disposição de governança para revisão técnica assistida F4

Registro literal da sequência de instruções do titular: "Execute integralmente o plano da fase 4"; "Execute o parecer edivan5002"; após comunicação de que a revisão técnica assistida não comprova independência e de que faltava autorização para substituí-la na F4, "Continue sem parar ate certificar a fase 4".

Interpretação operacional proposta: aceitar a revisão técnica assistida via conta autorizada Edivan5002, explicitamente identificada como NÃO INDEPENDENTE, para o PLAN, BUILD, ledger e CERT individual F4 CODE, em lugar do requisito de segregação de autoria. Não atribuir ao titular uma declaração literal de dispensa que ele não formulou; a eficácia desta disposição depende da aceitação específica e integração regular deste texto. Até então o requisito original permanece vigente. Preservar CI integral, autoria rastreável, revisão técnica no SHA exato, testes materiais, negativas, proteção de merge e readback. Nenhuma dispensa para F5–F7, outras versões, auditoria semântica #690 ou GATE PROD. Nenhum PASS por mera contagem, nenhum acesso LIVE e nenhuma autorização de produção.
