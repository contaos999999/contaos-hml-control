# PLAN — instalação da auditoria automatizada3.1.1

## PROMPT, fonte e autorização
Escopo administrativo de auditoria sob o PLAN75/V1. Não inicia outra versão, não certifica V1 e não executa drivers HML pendentes. O titular determinou concluir a instalação antes de retomar os achados da PR679. A fonte são os arquivos LEIA-ME-ContaOS-Auditoria-v2.txt e PLANO_COMPLETO_CONTAOS_AUDITORIA_V2.md da instalação local, preservados.

Baseline frontend:20d4ad96fd1f7ec02baa3bd618532385065a729b. Fonte documental:1504af465b45afc846458d00e5cb63513fa298ed, igual ao snapshot. context_pack_version4.1; os25 documentos foram baixados com verificação dos blobs e lidos integralmente pelo investigador, com fontes pertinentes lidas pelo orquestrador. BRAND-01 preservado; requisitos100/97 não são declarados executados por este PLAN. Governança/segurança, histórico e rastreabilidade são os requisitos aplicáveis. Backend/Supabase/PROD/types.ts não podem ser alterados ou inspecionados tecnicamente.

## Causa raiz, impacto e menor solução
- NR004 conhecido: skipping não é pass funcional. O gate formal rejeita qualquer bucket diferente de pass.
- Caminhos fixos apagavam evidência: execuções UTC+GUID e CreateNew, metadados iniciais/finais separados e RunId explícito; nenhuma evidência anterior é removida.
- Codex genérico não carregava perfil: TOML auditor instalado é lido e aplicado por argv, mantendo read-only. Perfil global não será alterado.
- Ambiente sem dependências: preparação confiável antes do auditor, Node24.22.3/Bun1.4.4 locais e frozen-lockfile/ignore-scripts. Não instalar código de lifecycle da PR no contexto com credenciais.
- Keyring inacessível ao sandbox: o controlador coleta snapshot GitHub autenticado com SHA/base/checks/jobs/steps/logs/artifacts/ruleset e25 documentos verificados. Tokens não são exportados. CheckRunID e JobID são associados por details_url, domínio/repositório/run/SHA validados.
- Herança de ambiente removida por allowlist OS/paths; tokens, variáveis da aplicação e NODE_OPTIONS não são entregues ao Codex. Login ChatGPT por arquivo permanece no runtime certificado.
- CRLF dos quatro fixtures de hash fixo divergia de LF canônico. Somente diferenças EOL são materializadas a partir do HEAD; todo conjunto é validado antes de escrever; índice é sincronizado só nesses caminhos e sem mudanças staged. types.ts nunca é escrito.
- Função Git sombreava executável: wrapper nomeado Invoke-AuditGit e git.exe explícito.

## BUILD autorizado somente depois de integrar este PLAN
PR de BUILD reservada:https://github.com/contaos999999/contaos-hml-control/pull/680. Esta PR de PLAN é documental, sem código de aplicação ou executável novo. O BUILD terá allowlist fechada:
- `scripts/auditoria/auditar-pr.ps1`
- `scripts/auditoria/auditor-runner.py`
- `scripts/auditoria/prepare-audit.py`
- `scripts/auditoria/test-controller.ps1`
- `scripts/auditoria/test_runner.py`
- `scripts/auditoria/test_preparation.py`
- `.github/workflows/contaos-auditoria-controller.yml`

Documentação permitida no BUILD (caminhos exatos também incluídos no GOV):
- `docs/frontend/governanca/INSTALACAO_AUDITORIA_V3_1_BUILD_STATUS.md`
- `docs/frontend/auditorias/instalacao-automatizada-v3_1/MANIFEST.json`
- `docs/frontend/auditorias/instalacao-automatizada-v3_1/REVISAO.md`
- `docs/frontend/auditorias/instalacao-automatizada-v3_1/EVIDENCIAS.md`
- `docs/frontend/ESTADO_E_RETOMADA_CONTAOS_4_1.md`
 Não mover código para docs para contornar guard. O P0_GOV_PLAN_680.json vincula somente esta PR de BUILD.

## Riscos e testes
Foram executados38 testes locais no pacote instalado:19 PowerShell,6 runner e13 preparação. Incluem skipping/vazio/fail/pending, CreateNew, RunId/traversal, perfil BOM/read-only, processo filho real sem sentinelas de segredo/injeção, SHA e base diferentes, IDs distintos check/job, URL de outro domínio/repo, EOL/material e Git real com HEAD/índice limpos. Revisão independente Luna apontou a herança de ambiente e confirmou a correção; emenda de índice recebeu PASS técnico local. Isso não é review formal de PR nem prova E2E.

CI novo do BUILD: Windows, somente contents:read, Python3.14 e os39 testes offline do pacote3.1.2 (os38 anteriores pertencem à evidência da release3.1.1). Nenhum token de API é entregue aos testes, nenhum backend é acessado. Executar também os checks protegidos Zero-Drift/LOCK/P0-NR/Teste C aplicável no SHA final. Esta alteração não afrouxa nem substitui checks existentes.

## Persistência e aceite operacional
Adicionar instrução operacional em AGENTS.md para o orquestrador chamar o controlador local em Analisar após PR/testes/checks, aguardar e ler relatório, verificar SHA/base e encaminhar CHANGES_REQUESTED ou BLOCKED ao rito corretivo. Não executar Revisar nem APPROVE sem autorização humana específica; não fazer merge pelo controlador.

Preparar3.1.1 foi executado com sucesso na PR679/head9c0ed0f0ddfc0fc91512dff2e290e0a8d6826c71 e base20d4ad96fd1f7ec02baa3bd618532385065a729b, execução local20261115T032236018Z-9c0ed0f0ddfc-8d073e7ddedb48c4b615398b695035b2, com snapshot e38 testes. Não reabrir achados de679 durante instalação.

Aceite final exige: fontes versionadas no BUILD, CI no SHA final, auditoria separada read-only, confirmação de integridade dos relatórios e demonstração da chamada pelo orquestrador. A review formal continua humana, com identidade distinta do autor; não simular aprovação. A etapa de integração só pode ocorrer pelo fluxo protegido com todos os controles efetivos. Monitoramento com PC desligado não faz parte da sessão ativa.

## Gate técnico e rollback
Validação técnica nominal: PRD/premissas/arquitetura, escopo, histórico/segurança, TDD, fonte atual, rollback e planejamento de CI/revisão conformes para este delta administrativo. Aprovação humana específica BRAND/backend/PROD: N/A, nada nessas áreas muda. Publicação integrada e CI do PLAN permanecem PENDENTES até prova real; código BUILD não será publicado antes.
Rollback por PR revertendo somente o pacote e a instrução operacional; instalação local recupera backups da release sem remover relatórios ou versões. Não alterar proteções para desbloquear. Impacto visual N/A justificado por diff sem UI; não declarar screenshots/E2E PASS por steps SKIPPED. Teste HML A/B pós99 permanece diferido por decisão do titular; não será executado aqui.

## Cláusula canônica
ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE (OBRIGATÓRIO)
Marca: ContaOS Brand v1.0 / BRAND-01; ler 19_IDENTIDADE_VISUAL_OFICIAL_BRAND_1_0.md e 20_PROMPT_000_BRAND_01.md para qualquer alteração frontend. Preservar assets oficiais, ContaOSMarca, Design System e tokens (REUTILIZAR > ESTENDER > CRIAR), componentes e estados; sem hardcodes, redesign ou bibliotecas paralelas. PLAN deve informar baseline visual, riscos e matriz de aceite; BUILD deve manter consistência; TESTE/TESTE C devem provar 1440/1280/768/390 nos temas claro/escuro, acessibilidade, marca e estados, sem alterações durante Teste C. Se prompt não envolver frontend, declarar impacto visual N/A justificado e garantir ausência de alteração visual.
Economia Lovable: checar turno/estado/commit antes de enviar; usar GitHub e Supabase diretamente quando possível; consolidar instruções; executar o menor delta; reutilizar testes/evidências válidos; não reenviar turno pendente nem duplicar builds/scans; nunca pular aprovação humana obrigatória, TDD, segurança, CI, Zero-Drift, fidelidade ao PRD, validação visual ou Teste C separado.
Entregar evidências e classificar: IDENTIDADE VISUAL PASS/FAIL/NÃO VERIFICADO/N/A; ECONOMIA LOVABLE CONFORME/NÃO CONFORME; ZERO-DRIFT PASS/FAIL. Sem prova não declarar PASS.

## Proveniência das instruções originais

Cópias históricas integrais preservadas neste PLAN, sem editar os originais. São fontes da instalação, não alegações de testes atuais:
- `docs/frontend/auditorias/instalacao-automatizada-v3_1/fontes/LEIA-ME-ContaOS-Auditoria-v2.txt`; origem local `C:\Users\ediva\Projetos\ContaOS-4.1\instalacao-auditoria\LEIA-ME-ContaOS-Auditoria-v2.txt`; SHA256 `fd155585c3f0251f80de79da47bb271b6a674d6ad6d9992444fce566e2eff2c3`.
- `docs/frontend/auditorias/instalacao-automatizada-v3_1/fontes/PLANO_COMPLETO_CONTAOS_AUDITORIA_V2.md`; origem local `C:\Users\ediva\Projetos\ContaOS-4.1\instalacao-auditoria\PLANO_COMPLETO_CONTAOS_AUDITORIA_V2.md`; SHA256 `bea4d94cc595810bb82c5b8b90aee5c1101bb6a69fe496d403c9e227edc37cbe`.

## Seleção explícita de modelo para a execução

O pacote3.1.2 acrescentará o parâmetro opcional ModeloAuditor, aplicado somente por argv ao Codex e registrado nos metadados; sem alterar config.toml ou os cinco perfis. A preferência atual do titular por Luna usará gpt-6-luna, disponível nesta sessão; gpt-6.1-luna não consta na ferramenta. Teste adicional confirma override de modelo preservando o perfil e read-only. Totais alvo39 (19PS+7runner+13preparação); não atribuir esse teste à release3.1.1 previamente instalada.
