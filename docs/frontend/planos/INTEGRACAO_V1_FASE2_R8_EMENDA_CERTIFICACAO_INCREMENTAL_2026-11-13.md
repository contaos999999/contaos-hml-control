# Emenda ao PLAN R8: certificação incremental da Fase 2 (proposta do patrocinador)

## Decisão e precedência

A direção solicitou abandonar o reinício obrigatório dos 52 casos a cada falha. Esta emenda propõe substituir **somente o requisito de execução integral em uma única tentativa** por um **ledger acumulativo de casos individualmente aprovados**. Após aprovação, a emenda prevalecerá sobre a exigência de "52/52 em um único artefato" do PLAN R8; não revoga Zero-Drift, LOCK, isolamento, segurança, unicidade de REQUEST, revisão independente ou fail-closed. Esta PR é documental; o comportamento atual do auditor NÃO foi alterado.

## Estado inicial e evidências

Execução R7 Auth `43358055422` attempt 1, fonte `3638cdd381cb911f6bdc115169891a25479b7a25`, HML `dpl_CRTez9i1BPWHgE7BP7sNwvQoC3hh`, harness `a3b6c34936a095fdca98bb79c3f21d28ed0e3979`: 21 casos `FINISH PASS` (V101 a V109 nas larguras 1440/390 e V110/1440); caso 22 V110/390 `FAIL FENCE_DRAIN_TIMEOUT`; casos 23–52 não executados. Evidência `14008077669`, ZIP SHA256 `c8153ae6e306ad7fa2129f06302de078e98f4ecbfa116b52f34434f91128a9c3`. Esses 21 casos são **candidatos a reaproveitamento**, não automaticamente certificados: verificar report.json, schema, hashes e prova de segurança por caso antes de promover ao ledger.

## Contrato incremental proposto

1. Criar manifesto/ledger versionado e append-only, com índice canônico de 1 a 52, `surface`, `width`, `theme`, operação, resultado, timestamp, execução/attempt, commit frontend, harness SHA, deployment ID, SHA256 do artefato e SHA256 do relatório, além de status de compatibilidade. Não inventar PASS a partir de log resumido.
2. Em cada REQUEST nova, definir `resume_from` como primeiro caso não aprovado e compatível, inicialmente 22 **somente se** os 21 anteriores forem validados. O auditor executa a partir desse caso e nunca marca um caso pulado como testado na execução atual. Guardar as evidências originais, sem copiar screenshots como se fossem novas.
3. Ao encontrar FAIL no caso N, registrar o FAIL e interromper a execução. Somente os casos novos com PASS anterior ao N entram como candidatos ao ledger; N e posteriores ficam pendentes. Depois de correção, próxima REQUEST começa no primeiro caso pendente (ex.: 30).
4. Antes de reaproveitar qualquer PASS, executar verificador de impacto de mudanças entre os SHAs de produto/harness, rotas, componentes compartilhados, RBAC/RLS, organização, sessão, contratos, fixtures, dependências e deploy. Qualquer alteração que possa afetar um caso aprovado invalida seu PASS, exigindo reexecução desse caso e, quando necessário, casos dependentes. Mudança em shell/navegação compartilhada deve presumir impacto amplo até prova de não impacto. Sem prova suficiente, fail-closed: invalidar e executar novamente o caso afetado.
5. Preservar controles globais de sessão/MASTER/organização, isolamento, logout, HTTP, transporte, console/page errors, integridade e ausência de mutações bloqueadas. Controles globais que dependem da sessão completa devem ser novamente executados e comprovados em cada execução pertinente e na consolidação final. Não aceitar a mera soma aritmética de PASS sem verificação de compatibilidade.
6. REQUESTs continuam únicas, protegidas por PR/revisão canônica e nonce nova em cada tentativa. Nenhum rerun/replay de R7 ou REQUEST consumida. O executor deve receber explicitamente o recorte aprovado e impedir execução fora do escopo, sem desativar asserções.
7. Certificação final requer 52 entradas únicas PASS válidas e compatíveis, índice 1–52 sem lacunas, artefatos originais verificáveis (ZIP/CRC/SHA256SUMS/schema), matriz completa **consolidada**, logout e controles globais verificados, zero falha aberta, revisão independente do ledger e PR final de certificado integrada à main. `matrixComplete` deverá distinguir `runComplete` da execução parcial e `cumulativeMatrixComplete` do conjunto consolidado; nunca afirmar que uma execução parcial isolada teve 52/52.
8. Se um PASS anterior for invalidado por alteração de produto/harness, retomar do menor índice inválido, não necessariamente do último FAIL. Nenhum PASS histórico deve ser apagado; marcar `superseded` com justificativa e evidência.

## GATE de implementação

A emenda é uma mudança de protocolo canônico e exige PR documental aprovada antes de modificar scripts, testes, manifestos ou workflows. O BUILD deve conter testes RED/GREEN para resume 22, FAIL 30 e resume 30, incompatibilidade de SHA/alteração compartilhada, adulteração de hash, ausência de artefato, duplicidade de índice, reuso de nonce, ausência de logout e impossibilidade de certificação com PASS inválido. Revisão independente e CI obrigatórios; não alterar segurança, não ignorar `ABORTED`, não aumentar deadline sem prova e não contornar `FENCE_DRAIN_TIMEOUT`.

## Relação com o PLAN R8 original

A investigação causal do caso 22 V110/390 continua obrigatória antes do BUILD corretivo. O novo mecanismo incremental deve ser implementado e auditado separadamente da correção do defeito. Nenhuma execução R8 poderá iniciar antes da aprovação, implementação, testes e integração do protocolo incremental, da investigação causal e dos pins/deployment aplicáveis.
