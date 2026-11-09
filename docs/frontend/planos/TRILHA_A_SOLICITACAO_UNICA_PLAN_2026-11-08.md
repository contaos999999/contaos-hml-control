# Trilha A P0: retomada autenticada por solicitação única na main

## Decisão e causa
O titular autorizou a execução integral e automática dos 184 casos pendentes na issue #317. O controle local do navegador deixou de estar disponível e o conector GitHub oferece leitura, PRs e reruns, mas não workflow_dispatch. Rerun de execução antiga não executa o novo código. Os secrets HML permanecem exclusivamente no environment hml.

Esta emenda propõe um disparo adicional, restrito a uma solicitação documental única integrada pela proteção da main, após CI. Não altera credenciais, permissões de negócio, autenticação, rede do auditor, RLS ou PROD. A autorização operacional já foi dada pelo titular; CI e revisão independente continuam obrigatórias.

## Âncoras investigadas
- Frontend main: d8594696b315d28658143f4bae19ac5727a2d681.
- Backend main: 7d83f046c282051baeeeab6b4f61e0ad8bd0cef6.
- Zero-Drift: workflow ID 406076025, path .github/workflows/contaos-frontend-zero-drift.yml, evento push main; run 42533338896 SUCCESS.
- HML atual verificado: deployment dpl_3YN7ULKFArns9ZgyyAZ5q4GyQtP7, frontend 6c5d4824fc2a7bac61f1031de33ea1aaf1d1d0a1, projeto prj_JtEWXg54EIYcQPwVzFiQyJcVIlFo, alias contaos-41-hml.vercel.app, READY. O target production é apenas o target técnico desse projeto HML.
- PR374 visual integrado em ec59265dc375554828656b24ad82293f411cd464. Nenhuma nova auditoria privada após run 42511641527 foi comprovada.
- PR373 preparador ainda exige correção, CI e revisão antes do merge e antes de preparar fixtures.

## Alternativas
1. Repetir pedido de login ou secrets: não resolve a ausência do comando de disparo e contraria a orientação do titular.
2. Executar por credenciais fora do GitHub: ampliaria exposição e não foi escolhida.
3. Solicitação única protegida na main, atendida após Zero-Drift do mesmo SHA: escolhida pelo executor por preservar os secrets e permitir evidências imutáveis.

## Desenho proposto
Preservar workflow_dispatch e adicionar workflow_run completed, nome ContaOS Frontend Zero-Drift, branch main, nos dois workflows existentes. Só admitir evento originado por push da própria main, repositório exato, workflow ID 406076025 e path exato, conclusão success, tentativa upstream 1 e tentativa corrente 1. O SHA do evento deve ser o HEAD main vivo e o checkout imutável do executor; divergência bloqueia antes de secrets.

Uma solicitação JSON documental, em caminho fixo docs/frontend/auditorias/TRILHA_A_SOLICITACAO_UNICA.json, terá esquema fechado: schema_version, issue, operation, request_id, approved_parent_sha, frontend_sha, deployment_id. Operações fechadas: fixtures ou audit. Cada BUILD incorpora apenas o request_id aprovado no GATE. O commit da solicitação deve ter primeiro pai approved_parent_sha; este pai contém o código já integrado e revisado. A solicitação só é criada em PR separado após integração do BUILD, revisão da proveniência e dos pré-requisitos específicos. Nenhum código novo é executado de branch de PR com secrets.

O disparo fica vinculado ao SHA da solicitação. Consulta somente de metadados do Actions, usando actions:read no preflight, deve rejeitar execução duplicada, rerun, evento parcial, origem alheia, pedido antigo e tentativa ambígua. Se não puder provar unicidade, bloquear. O token de leitura não é enviado ao navegador, auditor, preparador ou build; nem lido nos logs.

Conservar os jobs privados, environment hml, contents:read, concorrência compartilhada trilha-a-authenticated-hml, cancel-in-progress false, dependências congeladas, atestado Chromium, SSR/110 módulos e checkout fonte antes de fornecer o par de secrets somente no passo existente de login. Nenhuma nova chamada de negócio. Preparador só depois de PR373 corrigido e integrado. Auditor só depois da preparação comprovada, vinculação real das fixtures, BUILD de privacidade aplicável e aprovação da identidade implantada.

O disparo não autoriza ignorar FAIL, esconder conteúdo, ampliar allowlists de privacidade, repetir mutações incertas, certificar critérios sem provas, nem substituir a revisão independente das imagens e dos 72 critérios.

## Fases e arquivos
Este PR é PLAN exclusivamente documental. GATE separado fixa request_ids, contratos de evento/API, esquema e limites, allowlist de arquivos e testes negativos antes de BUILD.

BUILD futuro, somente após GATE integrado:
- .github/workflows/contaos-trilha-a-authenticated.yml
- .github/workflows/contaos-trilha-a-fixtures.yml
- scripts/hml/authenticated-visual-audit.mjs e respectivo teste, apenas reconhecimento/validação do disparo; preservar políticas existentes.
- scripts/hml/prepare-visual-fixtures.mjs e respectivo teste, apenas se sua barreira atual exigir workflow_dispatch.
Não modificar Zero-Drift, LOCK-TYPES, dependências, SRC, Supabase ou configuração de ambientes.

## Verificação
RED deve demonstrar rejeição dos eventos falsos e a ausência do novo disparo no baseline. GREEN exige testes de evento e esquema: PR, fork, branch diferente, workflow ID/path/name incorreto, upstream failure/cancelled, SHA obsoleto, pais divergentes, pedido sem GATE, operação trocada, request_id desconhecido, JSON com chaves extras, tentativa 2, execução duplicada ou listagem Actions indisponível. Todos bloqueiam antes de credenciais.

Demonstrar no mesmo HEAD os 8 casos causais nativos e o suplemento visual isolado, lint e formato dos arquivos alterados, CI Zero-Drift/LOCK-TYPES, revisão independente sem Critical/Important. Primeiro Teste C deve registrar evento upstream/run IDs, request_id, SHA executor/fonte, deployment, logout e artefatos SHA256. Não confundir testes unitários ou execução de preparo com conclusão dos 184 casos.

## Saída e continuidade
Preservar as 18 provas públicas e o baseline privado já aprovado. Manter 24 casos dependentes de fixture separados. Atualizar checkpoint GitHub e matriz com resultados reais. V1 permanece não certificada até DoD integral da issue #317.
