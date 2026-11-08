# Trilha A P0: executor autenticado e auditoria 232/72

Issue #317. Prompt regular 75/V1-23; atômico 000/BRAND-01 e NFR 085–096 aplicáveis. Atômicos 020–023: auditoria de comportamento/navegação herdada no Prompt 75, sem nova implementação funcional; evidência operacional integral permanece exigida fora do delta read-only. V1 não certificada. Autorização do titular: resolver integralmente a Trilha A, com auditoria autenticada, CI e revisão independente. Este PLAN não autoriza mudança de produto ou de backend.

## Baseline e decisão

Frontend `1a24d36fd4a19a1fe70ccf9099aaa11a6d31ac5e`; backend normativo `eedf922cdf3fab0673438fb4627c327411819bd2`. Os 25 blobs e o catálogo serão comparados antes do commit e novamente pela CI. HML `https://contaos-41-hml.vercel.app`, deployment `dpl_9iFUGXPcgXdBSmXa5C5EVcqt1XCX`, READY e vinculado ao HEAD frontend pelo provedor. O target técnico production da Vercel pertence ao projeto nomeado HML, não autoriza promoção do produto a PROD.

PLAN322/GATE323/BUILD324 e 18 provas públicas permanecem históricos válidos e não serão repetidos sem regressão. PR331 individualizou a matriz, mas não implementou executor autenticado. O arquivo ativo correto é `docs/frontend/planos/PLANO_ATIVO.json`, não a raiz.

Abordagem escolhida pelo executor: acrescentar um harness CI separado, somente leitura, para o HML implantado. Reutilizar o harness público exigiria misturar sessão e provas públicas já concluídas. Exportar tokens do navegador ou contornar DevTools é proibido. A sessão do navegador atual foi autenticada pelo formulário seguro; não será exportada para a CI.

## Arquivos desta fase documental

- Este PLAN.
- `docs/frontend/planos/PLANO_ATIVO.json`: registrar fase específica, sem liberar BUILD antecipado.
- `docs/frontend/CONTEXT_CANONICO_4_1_SNAPSHOT.json`: reancorar somente com 25 blobs e catálogo iguais.
- `docs/frontend/ESTADO_E_RETOMADA_CONTAOS_4_1.md`.
- `docs/frontend/auditorias/TRILHA_A_REANCORAGEM_AUTENTICADA_2026-11-08.md`.
- `docs/frontend/auditorias/evidencias/reancoragem-auth-20261108/`: PNG, DOM sanitizado e SHA256SUMS das observações reais, sem credenciais.

## Allowlist futura, somente após GATE separado integrado

- `scripts/testc/authenticated-visual-audit.mjs`.
- `scripts/testc/authenticated-visual-audit.test.mjs`.
- `.github/workflows/contaos-trilha-a-authenticated.yml`.
- Os documentos acima e as matrizes existentes `docs/frontend/auditorias/TRILHA_A_MATRIZ_232_2026-11-08.json` e `docs/frontend/auditorias/TRILHA_A_BRAND_72_2026-11-08.json`, apenas para recibos individuais comprovados.

Nenhum caminho src/, public/, integração Supabase, types.ts, dependência, lockfile, rota, schema, RLS, RPC, Edge, grant, Auth ou PROD. Necessidade de correção de produto exige outro PLAN com FAIL reproduzível.

## Contrato de autenticação e segurança

Workflow manual, environment hml, contents:read, sem escrita de Git e sem deploy; concurrency exclusiva, sem cancelar uma prova em curso. Usar credenciais sintéticas preexistentes em secrets HML, sem chave administrativa, service_role ou senha de banco. Ausência ou incompatibilidade de fixture = BLOQUEADO, nunca fallback para credencial do usuário ou criação silenciosa de contas.

Antes de fornecer senha: comprovar origem exata, formulário, versão implantada aprovada e grafo de scripts; negar origens inesperadas, redirects, popups, downloads e workers não previstos. O GATE deverá especificar como reutilizar a prova de proveniência existente sem afrouxar os controles. Não transmitir credenciais enquanto a proveniência não estiver comprovada. Login exclusivamente pelo formulário, sem injeção de sessão, storageState persistido ou exportação de tokens.

Depois do login, confirmar MASTER e organização sintética exata antes de capturar dados. Credenciais só no runner, máscara de logs, sem HAR, trace, vídeo do login, cookies, headers Authorization ou dump de storage. Screenshots somente depois de autenticar e confirmar fixture sintética. MASTER pode enxergar outras organizações, usuários e auditorias: antes de persistir qualquer DOM ou imagem, confirmar conteúdo exclusivamente sintético em cada superfície; nomes, e-mails e outros dados inesperados causam descarte fechado. Teste negativo de PII obrigatório. Mascaramento, quando legitimamente necessário, deve ser declarado e a região ocultada não conta como prova visual. Logout e destruição do contexto em finally. Persistir apenas nomes de controles, resultados sanitizados, contadores/status, screenshots, hashes e versão; nunca corpo bruto de erros remotos.

Somente navegação e consultas da UI. Bloquear mutações, exceto operações estritamente necessárias de login/logout e seleção local de organização. As RPCs de leitura devem ter lista fechada revisada antes do BUILD, sem regra genérica que libere todo POST. Tarefas sintéticas de criação já autorizadas no navegador serão documentadas separadamente e não incorporadas ao auditor read-only.

## Matriz e provas

Preservar os 232 IDs existentes: 29 superfícies × 1440/1280/768/390 × claro/escuro. Executar somente os 208 privados ainda não comprovados. Os 24 públicos conservam seus recibos históricos e SHA de origem, sem reatribuição ao HEAD novo. Comparar caminhos públicos/fontes com o SHA das provas preservadas para justificar continuidade; mudança relevante exige avaliação de regressão, sem repetição automática. Não repetir os 18 casos públicos adicionais. Cada caso privado exige rota resolvida com IDs reais de fixture, nome/papel/organização esperados, viewport e tema medidos, screenshot e DOM sanitizado com SHA256, overflow, marca única na sidebar, AppShell e organização/status persistentes. SYS04 tem estrutura de seleção, sem exigir AppShell indevidamente. V117 exige abrir drawer real a partir de item; V120 exige apresentação/protocolo real. Estado de acesso negado não certifica uma superfície operacional esperada.

Fixture documental atual: contrato `be89ef7e-d839-46c0-9cfb-4da81edf8b74`, competência `59072760-4420-4598-82dd-367f41a79e89`, documento `525e54fc-feec-4dc0-b540-1510a3c52485`. IDs não encontrados ou estados ainda indisponíveis geram BLOQUEADO por caso, sem UUID fictício e sem PASS de tela vazia quando o estado exigido depende de item/snapshot/protocolo. A dependência worker será separada da verificação visual independente.

Os 72 critérios literais continuam individualizados. Registrar método e evidência de cada um, distinguindo código/CI, navegador automático e revisão humana. Axe não substitui contraste manual, teclado/foco, leitor de tela, zoom nativo 200%/400% e texto 200%. Não certificar WCAG integral com varredura automática. Revisar marca expandida/recolhida, navegação mobile, menu MASTER contextual, foco de abertura/fechamento, Escape e retorno, organização/status após links, refresh e voltar. Não criar menu que ignore permissões.

## RED, GREEN, revisão e saída

1. PLAN documental → CI de qualidade, Teste C documental e LOCK-TYPES no mesmo HEAD → revisão independente → merge normal.
2. GATE separado: fechar versões das ferramentas, lista de RPCs de leitura, método concreto de proveniência antes de credenciais, fixtures completas, allowlist e testes negativos; CI/revisão/merge antes de implementação.
3. RED real para origem/redirect não aprovado, ausência de segredo, fixture errada, login não concluído, screenshot ausente, hash inválido, largura/tema incorretos, caso duplicado/omitido e tentativa de mutação. Testes de protocolo sem login real não equivalem a HML.
4. BUILD mínimo do harness/workflow; GREEN dos testes; CI e revisão independente do código, sem edição do executor durante Teste C.
5. Execução manual no HEAD integrado imutável; comprovar deployment e SHA antes de cada lote e monitorar deployment/grafo durante a execução. Registrar por caso o SHA do harness e o SHA do frontend auditado separadamente; são artefatos distintos. Mudança do alias/deployment/grafo causa aborto e invalidação dos casos afetados, não continuação silenciosa. Preservar artefato com manifesto e SHA256SUMS, conferir download e hashes. Revisão independente das capturas e achados.
6. Corrigir FAIL comprovado apenas mediante PLAN/GATE específico; reexecutar somente o escopo necessário e regressões justificadas. 208 privados sem evidência permanecem não comprovados.

DoD: nenhum caso obrigatório FAIL/BLOQUEADO/NÃO VERIFICADO, 72 critérios com prova individual, acessibilidade aplicável concluída, revisão independente e checks no mesmo HEAD; checkpoint integrado. Certificação visual não certifica por si só CRUD global, worker ou V1. V2 continua bloqueada.

Rollback: desabilitar a execução manual do novo harness por PR de reversão se necessário; nenhum rollback de dados ou deploy está incluído. Nenhuma proteção pode ser removida para tornar o teste verde.
