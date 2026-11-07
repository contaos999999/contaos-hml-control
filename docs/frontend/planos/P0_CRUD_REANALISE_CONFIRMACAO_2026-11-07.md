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
