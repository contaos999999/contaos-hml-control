# P0 CRUD V1: confirmação honesta da reanálise

Emenda ao plano mestre P0, regular75, correção retrospectiva38/V1-17. Autorização expressa do titular: concluir CRUD global. V1 não certificada; V2–V5/PROD bloqueados.
Baseline frontend b76baa4729fa2815f22a8c975a669c9da4bb455f; backend4fec09bf5cab5afc776192b9bef6e70728e1a058. Regressão inicial1075/1075,40suítes.

## Problema e fonte
RequirementDrawer, catch de reanalisar: qualquer leitura válida após timeout gera reanaliseReconciliada (“Solicitação registrada”). A leitura não contém recibo do comando. Não prova autoria nem aceitação e pode ser idêntica ao estado anterior. Corrigir apenas a confirmação e evitar reenvio cego da intenção incerta. PRD01 §8, FE06 §12, RNF007/008/011, V1-AUD-005. Sem alteração de contrato/segurança backend.

## Allowlist fechada
- src/components/competencias/RequirementDrawer.tsx
- src/lib/competencias/requisitoDetalheDados.ts
- src/test/requisitoDetalhe.test.tsx
- docs/frontend/planos/PLANO_ATIVO.json
- docs/frontend/planos/P0_CRUD_REANALISE_CONFIRMACAO_2026-11-07.md
- docs/frontend/ESTADO_E_RETOMADA_CONTAOS_4_1.md

Proibidos: tipos/clienteSupabase,SQL,migrations,RLS,Auth,Storage,Edge,backend,workflows,rotas,routeTree,assets,estilosglobais,dependências,PROD. ZERO backend.

## Comportamento
Sucesso somente com UUID válido retornado pela RPC existente. Após erro ambíguo, uma leitura de conferência, atualização dos dados se válida e aviso explícito de resultado não confirmado, mesmo que dados mudem. Não chamar callback de sucesso como confirmação da escrita. Trava de intenção incerta preservada no componente: botão de reenvio indisponível; botão explícito “Conferir andamento” faz apenas leitura, nunca escrita nem desbloqueia automaticamente. Negação definitiva403/conflito409/entrada inválida mantém mensagens próprias. Troca de requisito remonta conteúdo por chave para impedir callbacks antigos de liberar trava/avisos do requisito novo. Não introduzir revisão humana nesta emenda: precisa do gate específico concorrência/idempotência da RPC registrar_resultado_requisito.

## RED → GREEN e aceite
Testar timeout com dados iguais/mudados/erro de leitura: nenhum sucesso alegado,1escrita,somente1conferência automática; clique repetido não escreve; conferência explícita apenas lê. Preservar sucesso com UUID,conflito,403,duplo clique e leitura/paginação. Troca requisito durante envio não afeta aviso/trava/callback do novo. Testes focados,regressão completa,tsc,build,ESLint focal,hash tipos,guards e dois checksCI mesmoHEAD. TesteC isolado read-only,4larguras×2temas,estados,teclado/foco; mocks não equivalem a sessão privada.

## Gate e rollback
Planejamento tecnicamente validado quanto aPRD/escopo/arquitetura/brand/segurança/NFR/TDD/rollback. BUILD somente após CI documental SUCCESS; registrar URL antes do BUILD. Consumir obter_detalhe_requisito_v117 e solicitar_reanalise_requisitos sem alterar APIs. Rollback por novoPR revertendo deltafrontend; nenhum dado apagado. Assets/tokens/componentes mantidos; impacto visual restrito a aviso e botão de conferência no drawer existente. Testar 1440/1280/768/390 claro/escuro. Sem nova aprovação de identidade, sem redesenho.

## ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE (OBRIGATÓRIO)
Marca: ContaOS Brand v1.0 / BRAND-01; ler 19_IDENTIDADE_VISUAL_OFICIAL_BRAND_1_0.md e 20_PROMPT_000_BRAND_01.md para qualquer alteração frontend. Preservar assets oficiais, ContaOSMarca, Design System e tokens (REUTILIZAR > ESTENDER > CRIAR), componentes e estados; sem hardcodes, redesign ou bibliotecas paralelas. PLAN deve informar baseline visual, riscos e matriz de aceite; BUILD deve manter consistência; TESTE/TESTE C devem provar 1440/1280/768/390 nos temas claro/escuro, acessibilidade, marca e estados, sem alterações durante Teste C. Se prompt não envolver frontend, declarar impacto visual N/A justificado e garantir ausência de alteração visual.
Economia Lovable: checar turno/estado/commit antes de enviar; usar GitHub e Supabase diretamente quando possível; consolidar instruções; executar o menor delta; reutilizar testes/evidências válidos; não reenviar turno pendente nem duplicar builds/scans; nunca pular aprovação humana obrigatória, TDD, segurança, CI, Zero-Drift, fidelidade ao PRD, validação visual ou Teste C separado.
Entregar evidências e classificar: IDENTIDADE VISUAL PASS/FAIL/NÃO VERIFICADO/N/A; ECONOMIA LOVABLE CONFORME/NÃO CONFORME; ZERO-DRIFT PASS/FAIL. Sem prova não declarar PASS.

## Execução e evidência
PLAN261 integrado b63ce9f0b5cf865e37990dec8706c0a2dcda38c5 após dois checks SUCCESS run42339920429. RED4falhas/47PASS e GREEN51/51 locais em requisitoDetalhe.test.tsx. Demais gates e TesteC do BUILD ainda pendentes. Prova privada não executada: navegador abriu /login sem sessão.

## Revisão independente e decisão
Revisão somente leitura identificou corrida entre conferência e paginação. Reproduzida em teste (RED1falha/51PASS), corrigida com identidade dos offsets antes de aplicar resposta e GREEN52/52. Requisitos de outro contexto já protegidos por key+cleanup. Achado menor diferido: falha na conferência explícita preserva o aviso incerto e o bloqueio, mas não exibe mensagem nova específica de falha de leitura; não é alegado sucesso. Não ampliar esta emenda para um fluxo novo de revisão humana.

Verificação final local:1080/1080 em40suítes;52/52 focados; TypeScript,build,ESLint focal,ZeroDrift,GOV020 e diffcheck PASS. Nenhum tipo/rota/backend modificado. GatesCI/visual privado ainda não presumidos.

## Emenda de continuidade: falha da conferência explícita — 07/11/2026

Baseline: frontend `632fe8481e9298211e9a341f6a0a47850ae4c078`, backend de referência `4fec09bf5cab5afc776192b9bef6e70728e1a058`, sem mudança de fonte. PR262 já integrado e não será refeito. O problema diferido foi confirmado no código: erro HTTP, rejeição da leitura ou resposta inválida no botão **Conferir andamento** não produz feedback específico. O aviso incerto é correto, mas não informa que a tentativa de atualizar falhou. Corrigir o estado de erro faz parte do critério de feedback da operação, sem tratar leitura como recibo.

### Escopo e comportamento

Usar exclusivamente a allowlist deste plano: `RequirementDrawer.tsx`, `requisitoDetalheDados.ts`, `requisitoDetalhe.test.tsx` e os três documentos já autorizados. Nenhum novo arquivo de aplicação, dependência, rota ou alteração de backend.

- Acrescentar mensagem PT-BR de falha da conferência, mantendo explícitos o resultado incerto e a ausência de nova solicitação.
- A mensagem aparece quando a conferência explícita falha por erro HTTP, rejeição de Promise ou parser inválido. Não alterar a conferência automática já integrada.
- Nova conferência limpa o aviso específico durante a tentativa; leitura válida volta ao aviso de resultado incerto, sem sucesso de escrita nem liberação do reenvio.
- Resultado tardio de outro requisito ou página não altera aviso nem dados do contexto atual.
- Continuam obrigatórios: uma única escrita, nenhum retry de comando, callback de sucesso apenas no recibo válido da operação original, reenvio incerto bloqueado.

### Execução nativa e provas

1. Testes RED dos três tipos de falha, conferência posterior válida e falha tardia de página anterior.
2. Menor alteração no estado de aviso e no handler existente; reutilizar o parágrafo `role=status`, sem redesenho ou alteração de identidade.
3. GREEN focado, regressão completa, TypeScript, build, lint focal, tipos fixos, guardas; revisão independente e dois checks do SHA final antes do merge.
4. Teste C somente leitura; prova privada continua não verificada sem sessão autorizada. Não solicitar autenticação novamente por conta desta emenda.

Gate técnico: VALIDADO quanto a requisito de feedback V1-17/FE06 §12, RNF e autoridade do Supabase. BUILD somente depois de commit documental e CI aprovado. Rollback reverte apenas este delta frontend. Backend, HML técnico, Auth e PROD permanecem fora do escopo. A investigação de revisão humana continua bloqueada pelo gate específico de autorização vigente.

O bloco literal ZERO-DRIFT deste plano permanece integralmente aplicável. Fontes canônicas e BRAND-01 reutilizadas do mesmo HEAD já conferido; nenhuma mudança de marca. Matriz visual 1440/1280/768/390 × claro/escuro e estados permanece requerida, sem declarar prova privada não executada.

### Execução da emenda de conferência

PLAN264 integrado em `97eaaa7b4685970add307222834b486bbdbdddc8`, HEAD documental `9c7539a3be0c63d6d99fa2c43b842d45faf41f98`; run42357346038 ambos checks SUCCESS antes do BUILD. RED:3falhas/52PASS, ausência do aviso reproduzida nos três tipos. GREEN final56/56, regressão1084/1084 em40suítes. TypeScript,build,ESLint focal,ZeroDrift,GOV020,diffcheck PASS. Tipos congelados preservados. Revisão independente sem achado crítico/importante; respostas antigas de página não alteram dados nem aviso. CI BUILD e prova visual/privada ainda pendentes neste commit. Nenhum backend/Auth/PROD/rota/dependência modificado.
