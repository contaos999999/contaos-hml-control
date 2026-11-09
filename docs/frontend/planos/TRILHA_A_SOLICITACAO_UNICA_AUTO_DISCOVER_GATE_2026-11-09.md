# Trilha A P0: emenda GATE de descoberta pública da identidade HML

## Causa comprovada e escopo
PLAN380/GATE383 e BUILD388 integrado em e108cbf1d9b9c9b52bea67c994bd8796b0313ea4 preservam solicitação única, revisão independente, CI e secrets exclusivamente no environment hml.

A solicitação394, HEAD604f81c0c1630c10f26bc11abc38c9483cc2dc14, foi mantida draft e sem revisão canônica porque fixava fonte6c5d4824fc2a7bac61f1031de33ea1aaf1d1d0a1/deploymentdpl_3YN7ULKFArns9ZgyyAZ5q4GyQtP7 enquanto o alias HML já servia READY dpl_6YBX6Wc4bjD73H6bKV2R3PV74ZVX, fonte e108cbf1d9b9c9b52bea67c994bd8796b0313ea4. A publicação automática pode mudar novamente a identidade após a integração documental. O bloqueio ocorreu antes do merge da solicitação e antes de Auth. Nenhum nonce foi consumido, fixture criada ou caso auditado por essa tentativa.

Esta emenda documental trata apenas dessa corrida. Não afirma que o deployment observado continua atual nem que quota/402 foi resolvida. Não autoriza rollback de alias, configuração de ambientes, mudanças de billing ou execução fora do GitHub.

## Contrato aditivo fechado
Manter schema_version1, issue317 e exatamente as mesmas sete chaves de GATE383: schema_version, issue, operation, request_id, approved_parent_sha, frontend_sha, deployment_id.

A única extensão é admitir estas duas alternativas:
1. Par explícito: frontend_sha de40 hexadecimais minúsculos e deployment_id no formato dpl_ seguido de8 a80 caracteres alfanuméricos, conforme contrato original.
2. Descoberta pública: frontend_sha e deployment_id são ambos exatamente a string vazia. Esse par representa AUTO_DISCOVER e aciona o resolvedor público já existente para workflow_dispatch.

Rejeitar apenas um campo vazio, espaço, trim/coerção, null, campo ausente, formato inválido, chaves extras ou duplicadas. Não adicionar campo mode ao JSON, novo schema, nonce ou operação. O nome AUTO_DISCOVER descreve o comportamento derivado do par, não um valor admitido nesses campos.

Par explícito que divergir do HML atual continua bloqueado, sem substituição automática. O modo de descoberta não cria exceção para um pin explícito obsoleto.

Os nonces permanecem trilha-a-fixtures-20261108-r1 e trilha-a-audit-20261108-r1, cada qual restrito à operação correspondente. Auditoria continua AUDIT_BINDING_PENDING, inclusive com par vazio.

## Ordem obrigatória e identidade real
Antes de qualquer checkout do evento ou token, conservar a barreira nativa completa e o bootstrap confiável do YAML da main: origem push/main/repositório/workflow exatos, success, tentativas1 e SHA vivo. Preflight sem environment continua actions:read somente no passo de metadados; privados continuam contents:read e consultas públicas sem Authorization.

O JSON vazio transmite ausência de pin ao resolvedor atual. Depois das provas de solicitação/PR/revisão/CI/unicidade, descobrir a identidade somente no HML oficial e projeto já fixados, com origem/repositório/metadados públicos aprovados. Não aceitar resposta ou deployment por nome aproximado, outro projeto, branch de PR ou origem alternativa.

O resolvedor deve produzir SHA frontend e deployment reais antes do checkout separado da fonte. Esses valores resolvidos precisam satisfazer formatos originais, existência Git e ancestralidade da main, as19 chaves públicas fechadas, proveniência SSR/110 módulos, assets, TLS/CSP/fence/proxy e oito provas causais nativas no mesmo HEAD. Não fazer checkout da string vazia nem presumir identidade a partir da identidade do executor.

No modo vazio, a prova Git da solicitação conserva pais/approved_parent_sha, merge normal de PR protegido e diff exclusivamente do JSON. O teste de ancestralidade da fonte declarada deixa de ser executado sobre a string vazia e passa a incidir sobre a identidade real produzida pelo resolvedor no passo já existente. Continuam obrigatórios os demais ancestrais do GATE/BUILD/preparador integrado. No modo explícito, a verificação antecipada da fonte declarada permanece.

Recibos locais da solicitação registram o par declarado como vazio quando assim solicitado; não preencher esse recibo com SHA fictício, identidade do executor ou deployment inferido. O manifesto de proveniência e os artefatos de execução registram separadamente a fonte/deployment efetivamente resolvidos. Conferir esses valores reais antes de fornecer credenciais e durante a preparação, como já faz o executor. Mudança de identidade durante a execução bloqueia; nunca resolver novamente para contornar um FAIL.

Preservar as duas revalidações públicas completas dentro da concorrência HML, recibo vinculado a S/run/request/digest/hash de módulo e teste, prazo máximo30segundos antes do login, logout e provas SHA256. CONTAOS_HML_SYNTHETIC_EMAIL/PASSWORD continuam somente no passo de login existente. Nenhum token Actions vai para build, navegador ou preparador.

## BUILD posterior e testes
Este PR contém somente esta emenda. Não implementar antes de CI, revisão independente e integração deste GATE.

BUILD futuro fica restrito aos mesmos seis arquivos autorizados por GATE383, preferindo apenas scripts/hml/authenticated-visual-audit.mjs e scripts/hml/authenticated-visual-audit.test.mjs quando suficientes. Não alterar os outros quatro por conveniência. Ajustes limitados ao parser do par, reconhecimento de modo, ancestralidade declarada e respectivos negativos. Não criar novo resolvedor ou arquivo de solicitação nesse BUILD.

RED deve demonstrar que o baseline rejeita o par vazio e que pins explícitos obsoletos já bloqueiam. GREEN exige:
- Par vazio/vazio aceito pelo parser e preservado nos outputs/recibos, sem representar fonte já comprovada.
- Vazio/pin, SHA/vazio, espaços, null, formatos inválidos, chaves extras/duplicadas e operação/nonce trocados rejeitados antes de credenciais.
- Par explícito correto preservado; divergência explícita bloqueada, sem fallback.
- Nenhuma chamada Git recebe SHA vazio; no modo vazio, a identidade real descoberta passa pela ancestralidade existente antes do checkout da fonte.
- Identidade descoberta estrangeira, não ancestral, formato inválido ou deployment alterado bloqueados; ausência de prova não se converte em pin inventado.
- Auditoria continua bloqueada por AUDIT_BINDING_PENDING e as barreiras RQ01/RQ02, unicidade/replay, metadados indisponíveis, operação oposta, concorrência e cache permanecem cobertas.

No mesmo HEAD final: testes aplicáveis, lint/formato focal, CI Zero-Drift/LOCK e workflows autenticado/fixtures, oito provas nativas mais suplemento visual isolado e revisão independente sem Critical/Important. Não modificar produto, tipos, dependências/lock, Zero-Drift, Supabase, backend, Auth, rede, ambientes, secrets ou PROD.

## Solicitação e saída
Após BUILD integrado, atualizar ou substituir a solicitação394 em PR documental separado contendo apenas o JSON. Reancorar approved_parent_sha ao novo primeiro pai aprovado, repetir CI e revisão canônica no HEAD exato e somente então merge normal. Não reutilizar revisão do HEAD604f81c0 ou dispensar os gates porque o par agora está vazio. Manter main estável durante a execução.

Ausência de JSON nas integrações intermediárias pode bloquear os subscribers sem autorizar login ou consumir nonce; não interpretar esse bloqueio como auditoria privada. Falha de execução real continua sujeita à política de nonce de GATE383.

A saída esperada é uma tentativa legítima de preparação HML com identidade real comprovada, sem afirmar antecipadamente24fixtures,184casos,72critérios, WCAG ou V1 concluídos. Registrar resultados reais e checkpoint após execução. Nenhuma nova autorização do titular é necessária dentro do escopo operacional já concedido.
