# Trilha A autenticada: GATE separado e plano de implementação

Objetivo: auditor somente leitura dos 208 casos privados, preservando os 24 públicos e as 18 provas adicionais. Especificação: PLAN #332 integrado em `52f6fa95e0f9399f44471296d878aee3492de377`. Executar diretamente, tarefa a tarefa, com revisão independente antes do merge. Este GATE não contém implementação. V1 permanece NO-GO.

## Âncoras e investigação sem credenciais

HML: `https://contaos-41-hml.vercel.app`, deployment `dpl_FndVxKraPqQHiaS8egANanm8MtiU`, READY, fonte Git `52f6fa95`. O produto é idêntico ao commit `1a24d36`; o PR #332 alterou somente documentos e evidências.

Build com Bun 1.4.4 e lock congelado reproduziu 110/110 módulos encontrados no grafo público depois de incorporar 19 metadados públicos VITE_VERCEL do deployment. Sem esses metadados, 98 módulos coincidiam e 13 caminhos locais não existiam no publicado. A causa foi demonstrada por comparação textual: o compilador incorpora o objeto inteiro de import.meta.env nos dois acessos dinâmicos de documentosDados.ts. Não foi alterado código, arquivo .env ou configuração da Vercel. Essa descoberta do grafo foi exploratória; o executor deverá usar parser AST e controles negativos, sem atribuir a investigação à certificação dos casos privados.

O SSR local foi executado pelo export default.fetch do build. O HTML de login contém quatro scripts: bootstrap, hidratação, módulo externo e remoção de fronteira. O bootstrap tem SHA256 `cc530bf8011d6ff1ec6d7eba56563304ea8928d347b39fd634660ff0989b9726`; a remoção de fronteira, `44491343799935d3a7674c56c6529da8110059d215a497484fab66e7b82fabc6`. A hidratação difere apenas em dois timestamps de atualização, propriedades u com NumericLiteral de 13 dígitos. Normalizar somente esses dois números produziu SHA256 `b1e7a7349a73910912d6f865dbd8e15425959ffaf69d3b3bbeeb4aac27282e80` igual no local e remoto. Qualquer outro byte continua obrigatório. Nenhuma credencial foi transmitida nessa investigação.

## Arquivos, stack e limites

Novos arquivos autorizáveis após integração deste GATE:

- scripts/testc/authenticated-visual-audit.mjs: política, proveniência e runner.
- scripts/testc/authenticated-visual-audit.test.mjs: testes negativos e positivos do protocolo.
- .github/workflows/contaos-trilha-a-authenticated.yml: testes sem secrets em PR e execução privada exclusivamente manual na main.

Documentação permitida: este GATE, PLAN #332, PLANO_ATIVO, snapshot, checkpoint, relatório e matrizes já aprovados. Não alterar src, public, tipos, integração, dependências, lockfile, backend ou PROD. Gates normativos e branch protection permanecem intactos.

Stack: Node 24; Bun 1.4.4; dependências do bun.lock; TypeScript 5.9.3 e parse5 via jsdom 20.0.3 para análise inerte; Playwright 1.58.2 já congelado. Não instalar versões latest. Execução privada: environment hml, contents:read, concurrency exclusiva, sem cancelar execução ativa. Artefato por 90 dias, sem publicação automática em release.

## Proveniência antes do login

1. Receber SHA frontend de 40 hexadecimais e deployment ID, conferidos com o provedor Vercel antes do disparo. SHA deve existir neste repositório e ser ancestral da main. Registrar separadamente SHA do executor e SHA do frontend auditado. Origem HML fixa; ausência de input, segredo ou fixture gera BLOQUEADO antes do login.
2. Baixar HTML de login sem cookies, proibindo redirects, até 256 KiB. Usar parse5 com scriptingEnabled=true; rejeitar base, atributos duplicados, nomodule e tipos desconhecidos. Não interpretar script dentro de template, textarea ou comentário como executável. Não usar regex como prova de grafo.
3. Descobrir imports e exports via TypeScript AST: strings e templates constantes, mesma origem, caminho /assets, sem query, fragmento ou travessia. Limites: 128 módulos, 4 MiB por módulo, 8 MiB total e prazo global. Não executar JavaScript remoto.
4. Extrair somente estas 19 chaves públicas, por propriedades AST com valores literais: VITE_VERCEL_BRANCH_URL, VITE_VERCEL_DEPLOYMENT_ID, VITE_VERCEL_ENV, VITE_VERCEL_GIT_COMMIT_AUTHOR_LOGIN, VITE_VERCEL_GIT_COMMIT_AUTHOR_NAME, VITE_VERCEL_GIT_COMMIT_MESSAGE, VITE_VERCEL_GIT_COMMIT_REF, VITE_VERCEL_GIT_COMMIT_SHA, VITE_VERCEL_GIT_PREVIOUS_SHA, VITE_VERCEL_GIT_PROVIDER, VITE_VERCEL_GIT_PULL_REQUEST_ID, VITE_VERCEL_GIT_REPO_ID, VITE_VERCEL_GIT_REPO_OWNER, VITE_VERCEL_GIT_REPO_SLUG, VITE_VERCEL_OBSERVABILITY_CLIENT_CONFIG, VITE_VERCEL_PROJECT_ID, VITE_VERCEL_PROJECT_PRODUCTION_URL, VITE_VERCEL_TARGET_ENV, VITE_VERCEL_URL. Rejeitar chave extra, duplicada, computada ou interpolada. Conferir SHA, deployment, repositório, project ID e origem HML. VITE_SUPABASE_URL e chave publicável devem coincidir com o cliente certificado. Reproduzir o build aprovado com esses metadados no ambiente do subprocesso, sem interpolação shell e sem alterar arquivo .env ou variáveis da Vercel. Nenhum segredo deve entrar no build.
5. Comparar o documento HTML completo com o SSR local confiável: elementos, atributos, textos, URLs e scripts, não apenas tags script. Rejeitar handlers on*, URLs javascript:, iframe/srcdoc, object/embed e qualquer elemento ou atributo ativo imprevisto. Comparar também CSS, fontes e assets de marca efetivamente carregados com bytes e SHA256 do build local. Na hidratação, obter exclusivamente do AST local confiável as posições dos NumericLiterals de 13 dígitos em matches[0].u e matches[1].u, dentro do array matches do payload SSR; conferir no mesmo objeto os campos i/s/ssr e a identidade da rota, segundo o SSR local. Registrar os caminhos AST e offsets. No remoto, permitir somente 13 dígitos nesses dois offsets conhecidos; não procurar genericamente propriedades u. Depois de substituir apenas esses dois trechos, exigir igualdade byte a byte do corpo inteiro, incluindo todo código, identificador, string e demais números. Quantidade diferente de dois no payload esperado é FAIL. A normalização não se aplica a atributos, texto da página ou outros scripts. Script novo, terceiro timestamp, literal de URL/chave alterado, código computado ou qualquer outra diferença = FAIL. Metadado Git sozinho não substitui essa paridade.
6. Chromium novo, sem storageState, trace, HAR ou vídeo do login; ambiente do processo filho sem secrets. Aplicar proxy nativo de destino restrito a HTTPS:443 do HML e Supabase oficial. Negar destinos imprevistos, redirects, popups, WebSockets e Workers inesperados antes de fornecer credenciais. Não usar flags que desativem segurança do navegador. A proteção nativa deve ser demonstrada com casos negativos reais; se falhar, nenhum login. Não alterar o scanner da Trilha B ou trocar sua origem hardcoded silenciosamente.
7. Interceptar respostas antes de execução e conferir hashes dos Scripts e estrutura dos Documentos. Resposta nova exige conferência nova. Mudança de deployment ou grafo em qualquer lote aborta o contexto e invalida os casos afetados.
8. Credenciais somente nos secrets HML CONTAOS_HML_SYNTHETIC_EMAIL e CONTAOS_HML_SYNTHETIC_PASSWORD. Ausência = BLOQUEADO; não criar conta, buscar admin key ou usar credencial pessoal. Login pelo formulário comprovado. Confirmar perfil MASTER e organização sintética antes de capturar. Logout em finally; não persistir storage, cookies, tokens, headers ou valores do formulário de login.

## Transporte após login

Permitir GET/HEAD somente em /rest/v1/<tabela>, com caminho exato e sob RLS. Lista de tabelas conferida nas fontes: aplicabilidades_fonte, apontamentos_historicos, apresentacoes_contratante, arquivos, competencias, configuracao_upload, contratantes, contratos, desfechos_historicos, documentos_contrato, eventos_auditoria, fontes_formais_regras_preventivas, fontes_normativas, fragmentos_documento, itens_lista, itens_pacote_competencia, linhas_orcamentarias, listas_verificacao, organizacoes, pacotes_competencia, paginas_documento, pareceres_internos, precedentes, processamentos_documento, propostas_orcamentarias, regras_conformidade, regras_preventivas, relatorios_historicos_contratante, requisitos_competencia, respostas_historicas, sugestoes_extracao_documento, versoes_documento, versoes_fontes_normativas, versoes_lista, versoes_proposta, vinculos_usuarios. Negar /rest/v1/rpc em GET/HEAD, caminhos codificados ou ambíguos, segmentos extras e toda tabela não listada. RPCs somente em POST pela lista abaixo. Permitir GET auth/v1/user; POST auth/v1/token somente para login/refresh; POST auth/v1/logout. OPTIONS apenas para esses destinos. Para POST rest/v1/rpc, lista fechada conferida nas fontes frontend:

- listar_organizacoes_disponiveis; obter_resumo_dashboard.
- validar_administrador_organizacao; pode_consultar_auditoria_organizacao.
- listar_usuarios_vinculos_adm; listar_escopo_contratos_usuario_adm; listar_auditoria_vinculo_usuario_adm.
- obter_matriz_rbac_master; consultar_permissoes_efetivas; obter_cadastro_operacional_v1.
- classificar_acesso_contrato_v106; obter_lista_operacional_v1.
- obter_visao_geral_competencia; obter_documentos_competencia_v115; obter_analise_competencia_v116.
- obter_detalhe_requisito_v117; obter_contexto_revisao_v117.

Qualquer outra RPC, escrita, Edge, Storage ou download deve ser negada e registrada por contador/código sanitizado, sem corpo da requisição. Bloqueio inesperado não autoriza ampliar a lista durante o Teste C.

## Fixtures e proteção dos artefatos

Organização: ContaOS HML Teste. Contratante: 041ebf9f-5e32-4744-80d6-d745fa5fc483. Contrato: be89ef7e-d839-46c0-9cfb-4da81edf8b74. Competência: 59072760-4420-4598-82dd-367f41a79e89. Documento: 525e54fc-feec-4dc0-b540-1510a3c52485. IDs provenientes de UI real, sem placeholders.

SYS04, ADM01 e V123 podem renderizar dados além da organização selecionada. Antes de salvar DOM ou imagem, confirmar conteúdo exclusivamente sintético e descartar conteúdo com PII inesperada. Resultado BLOQUEADO_PII sem alteração de permissões. Região ocultada não conta como prova visual.

V117 ainda não tem item/snapshot real; V119 é rascunho com acesso negado; V120 não tem protocolo de apresentação real. Essas 24 combinações permanecem BLOQUEADAS até criação legítima separada. Isso não impede avaliar até 184 outras combinações privadas candidatas; autenticação, PII, proveniência ou falhas reais podem bloquear mais casos. O auditor pode produzir resultado parcial, mas não PASS global. A criação sintética já documentada no navegador não constitui exceção à política read-only do harness.

## Implementação, com RED antes de código

### Task 1: política e proveniência

Interfaces exportadas do novo authenticated-visual-audit.mjs: validateConfiguration(input), extractScriptEntries(html), scriptImports(source), normalizeHydration(source), requestAllowed(request), caseKey(case), validateCase(record), summarizeCases(records). Retornar estruturas fechadas e códigos estáveis; nunca erro remoto bruto.

- [ ] Escrever testes para origem estrangeira, redirects, atributos duplicados, script inerte, import computado, chave env extra, terceiro timestamp, u fora do caminho permitido, handler onerror/onload, javascript:, iframe/srcdoc, object/embed, CSS ou marca adulterados, URL/chave alterada, mutação, GET RPC não listada, caminho codificado/ambíguo, PII, duplicação/omissão de caso, viewport/tema incorreto e screenshot sem hash.
- [ ] Executar node --test scripts/testc/authenticated-visual-audit.test.mjs e registrar RED esperado por funções ainda ausentes.
- [ ] Implementar o mínimo e obter GREEN dos positivos e negativos. Nada de login real nessa fase.
- [ ] Demonstrar em Chromium sem credenciais a proteção nativa de destinos, resposta alterada e novos targets/workers. Falha bloqueia o login real.

### Task 2: runner e workflow

- [ ] Renderizar somente os 208 casos privados da matriz existente, nas quatro larguras e dois temas medidos. Resolver rotas com os IDs reais, aguardar hidratação e estado esperado, sem UUID fictício.
- [ ] Registrar separadamente casos bloqueados por fixture, sem imagem fictícia. Salvar manifesto por caso, DOM sanitizado, PNG e SHA256SUMS. Coleção incompleta, FAIL ou BLOQUEADO impede aprovação global.
- [ ] Verificar organização/status, AppShell, marca única, rota/H1, nomes acessíveis, overflow, foco/teclado, sidebar expandida/recolhida e mobile. SYS04 tem estrutura própria. Axe complementa, não substitui revisão humana WCAG/72.
- [ ] Workflow de PR executa somente testes do protocolo, sem environment e sem secrets. Execução privada apenas workflow_dispatch na main, environment hml, com os dois SHAs registrados.
- [ ] GREEN local, lint focal, tsc, build, regressão, Zero-Drift e LOCK-TYPES; revisão independente antes do merge. CI do harness não certifica automaticamente o frontend publicado.

### Task 3: Teste C e checkpoint

- [ ] Disparar execução manual somente após merge e proveniência aprovada; conferir artefato, download e hashes.
- [ ] Realizar revisão visual independente e registrar os 72 critérios individualmente, com limitações de cada método.
- [ ] Corrigir FAIL comprovado por PLAN específico; integrar checkpoint. Ausência de secrets ou fixture deve ser explicitada, sem inventar credencial ou certificado.

## Foco da revisão e saída

Cinco riscos prioritários: deployment muda durante captura; código ou literal malicioso aceito como normalização; PII visível ao MASTER; worker/popup fora da proteção; estado errado ou caso ausente convertido em PASS. Todos exigem testes negativos acima.

CI e revisão deste GATE aprovam somente o planejamento. BUILD depende de integração deste GATE e segue RED → BUILD → GREEN → Teste C imutável. Falha de um gate aplicável bloqueia a implementação ou o login correspondente. Rollback por PR limitado ao harness, workflow e documentação, sem dados, backend ou deploy. V1 e V2 permanecem bloqueadas para certificação/promoção em PROD.

Reancoragem documental antes da CI: backend a1ecb48546e1298d1d35e4f4e4d8b76d4eb59e57, 25/25 blobs e catálogo idênticos; snapshot e ack atualizados juntos. Revisão independente final do GATE: APROVÁVEL, sem Critical/Important. Nenhuma prova de login do novo harness foi executada.

Pré-requisito confirmado pela UI autenticada do GitHub: environment hml já contém CONTAOS_HML_SYNTHETIC_EMAIL/PASSWORD. Nomes conferidos sem ler valores ou alterar secrets. O par TEST_EMAIL/PASSWORD usado por workflow legado não existe neste repositório, então o novo harness deve consumir exclusivamente o par sintético existente. Isso não comprova perfil MASTER nem login real pela CI; falhar fechado se a conta não satisfizer a fixture.
