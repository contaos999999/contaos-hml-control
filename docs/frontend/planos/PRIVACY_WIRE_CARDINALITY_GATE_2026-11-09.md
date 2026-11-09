# Trilha A: emenda de representação HTTP unitária do maybeSingle

Base documental main c2cfbe3f2e3a4c18886f18f42246998e357c9737 após PR398; contexto normativo reancorado em65767bfe pelo coordenador. Deriva de PLAN385, GATE372 e GATE384. V1 permanece NO-GO, V2 bloqueada. Não altera interpretação dos campos nem recibos históricos. Este PR é documental; BUILD somente depois de CI, revisão independente e merge.

## Falha e prova

O relatório original run42540293545, frontend/harness866608620909bf313a6c2192736330222f9219ad, preserva V1118 bloqueados com UNKNOWN_WORDS1/1, V1158 com2/2 e V1228 com3/3. V109 contém5FAIL_UI sem diagnóstico por caso e3BLOQUEADO_PII5/5. Nenhum DOM desses casos bloqueados foi salvo. Esses contadores não identificam isoladamente cada causa e não autorizam ler conteúdo desconhecido.

A fonte oficial pinned postgrest-js2.118.0 demonstra um bloqueio determinístico anterior às âncoras: maybeSingle busca lista HTTP e converte array unitário em objeto somente no SDK, depois do fetch. O observador opera sobre response.clone antes dessa conversão, mas os quatro contratos catalogados como object/maybeSingle exigem objeto no corpo bruto. Reprodução offline real de privacy78Runtime.project: contract_gate/upload/competence_rbac_gate aceitam DTO objeto e rejeitam o mesmo registro em array unitário. document_gate compartilha a mesma guarda e caminho maybeSingle. Isso prova incompatibilidade estrutural; não prova que todos os UNKNOWN/FAIL_UI se resolverão após corrigi-la.

Recibo complementar: docs/frontend/auditorias/evidencias/privacy-wire-cardinality-20261109.json. Fixa versão, lock blob e blobs/SHA256 das duas fontes oficiais. Nenhuma nova leitura HML, SQL, Auth ou headers ocorreu. A prova é de fonte e reprodução local; não é captura de corpo privado runtime.

## Única autorização adicional

Somente para contract_gate, document_gate, upload e competence_rbac_gate, em seus escopos atuais de origem/query/superfície/rota, reconhecer a representação HTTP JSON array de comprimento exatamente1, cujo único elemento é objeto não nulo e não array. Normalizar esse elemento dentro do browser e aplicar integralmente as mesmas igualdades/cadeias/projeções existentes. Não aceitar objeto bruto por fallback nem array vazio/múltiplo/aninhado, scalar ou null. Não estender normalização aos contratos de listas, versões, processamentos ou competência paginada.

A descrição object/maybeSingle nos recibos históricos continua representando o DTO entregue à UI após SDK; este complemento fixa exclusivamente o formato bruto observado pelo fetch. Os recibos originais permanecem byte a byte, SHA2565aa39ef35e4a432f4f4f5f29d72ee5773a56e62102948f0e3a31a0529c2d8f18 e d70d36f3977f7649dffb2ca0271bb43e181a0244c8e0089e471a86299bcaa897. O BUILD deve verificar separadamente o hash do novo recibo e sua lista fechada de quatro nomes; não editar os hashes antigos nem mutar seus objetos congelados.

Não acrescentar campos projetados ou inventar id/id_organizacao ausentes. Query extra/duplicada continua rejeitada. Campos já presentes na projeção legítima de UI e fora de extract_only não são autorização de leitura: não enumerar ou examinar seus valores, nem exportá-los. Um canário nesses campos deve permanecer ignorado e não exportado; conteúdo desconhecido vizinho em DOM/ARIA continua fatal. Isso distingue chave extra de query, que bloqueia, de campo bruto não selecionado para projeção técnica, que jamais autoriza texto.

## Preservação obrigatória

HTTP200, origem/query exatos, tamanho/deadline, fetch original/argumentos/promise/response/rejeição, fence/proxy/CSP/native8, serviço sem privilégio e ausência de novas requisições permanecem. Não ler headers/cookies/storage/Auth nem modificar Accept. Só enums de validação cruzam browser→Node. Contexto atual de sessão/org/contrato/rota/target/documento/geração, reset/logout/close e observação antes da navegação continuam obrigatórios. Retorno à mesma rota não herda evidência. Sem GET atual, bloquear.

Classificar padrões sensíveis no texto original completo antes de qualquer intervalo técnico. Preservar rendered/snapshot/PNG originais, mídia opaca, limites, ocorrência única, âncoras e desconhecidos restantes. V109/GATE389 e V112/ARIA têm suas próprias autorizações, sem ampliação por este complemento. Nenhum caso recebe PASS por inferência ou contagem.

## BUILD posterior e ciclo de prova

Allowlist futura: somente scripts/hml/authenticated-visual-audit.mjs e scripts/hml/authenticated-visual-audit.test.mjs. Proibidos SRC, workflow, backend, Auth, schema/RLS/RPC, tipos, dependências/lock, ativos, PROD e novos dados. O coordenador mantém PLANO_ATIVO/checkpoint e revalida os25blobs/catálogos100/97/LOCK no contexto vigente antes do BUILD.

1. RED antes de implementar: executar runtime original e SDK2.118.0 real com fetch local falso sem rede, retornando Response(JSON.stringify([registro técnico])). Demonstrar DTO pósSDK objeto e recibo runtime ausente/rejeitado. Cobrir os quatro contratos. Não reproduzir por imitação manual da conversão.
2. Implementar leitura selada do complemento e normalização somente dos quatro corpos unitários no browser. Aplicar as mesmas guardas/projeções após normalizar, sem transporte novo.
3. GREEN e negativos: wire array1 válido; objeto bruto/array0/2/aninhado/null/scalar; valor/cadeia ausente/divergente; queryextra/duplicada/projeção maior; canários em campos não autorizados não lidos/exportados; falta/duplicata de campo no DOM, cópia fora da âncora, vizinho desconhecido/sensível, versão de contexto anterior, sessão/org/rota/target/close/deadline inválidos. Manter todas as rejeições históricas, sem acrescentar palavras globais.
4. Adicionar integração local browser+SDK real que atravesse a mesma fronteira fetch→normalização SDK e valide rendered/ARIA completos das âncoras existentes. Não bastam DTOs fabricados ou snapshots de campo isolado. O suplemento Chromium continua separado de native8.
5. Rodar suíte completa do auditor, lint/formato/diffcheck, CI canônico/Zero-Drift/LOCK no HEAD final e revisão independente. BUILD em PR próprio, sem merge automático. Só depois considerar Teste C legítimo governado, sem executar login neste trabalho documental.

Rollback: revert mínimo do novo adaptador/prova complementar, sem alterar dados nem apagar artefatos. Até prova runtime posterior, manter os estados reais do run42540293545 e todas as ressalvas. Este GATE não certifica184casos, fixtures,72critérios, WCAG ou V1.
