# P0 CRUD global V1 — gestão de listas pela interface
Data: 06/11/2026 America/Bahia. Emenda ao plano mestre único de fechamento V1, autorização expressa do titular para CRUD global. Fonte backend4fec09bf5cab5afc776192b9bef6e70728e1a058. V1 não certificada; PROD proibido.
## Lacuna e evidência
RegrasContrato exibe listas/versões/itens e aprova regra preventiva, mas não oferece comandos de gestão. Backend PR96 implementado e agora implantado pelo run42321885307: canonical-deploy SUCCESS; JWT147/147, cleanupSUCCESS; reportSHA4c5aa78a4301a25d3aae4268404ce59731b32fb502e8d45bd1794b7f7d656c05,artifact13558350982. RPCs públicas INVOKER,anonEXECUTEfalse,authenticatedtrue conferidas por catálogo. Não recriar backend.
## Objetivo e rastreabilidade
V1-CHK-001..004, regular30/V1-09 e transversais000/085–096 pertinentes; versões/vigência, obrigatoriedade/condição, critérios e situação granular. Não alterar o comportamento certificado de requisitos da competência. Gestão usa APIs do backend e snapshots permanecem preservados.
## Allowlist fechada
- src/lib/contratos/listaOperacionalDados.ts (novo adaptador fechado)
- src/components/contratos/GerenciarListas.tsx (novo componente de gestão)
- src/components/contratos/RegrasContrato.tsx (inserção do gestor no contexto autenticado/autorizado)
- src/test/listaOperacional.test.tsx (novo)
- src/test/regrasContrato.test.tsx (ajustar mocks de leitura somente se necessário, sem remover negativas)
- docs/frontend/planos/P0_CRUD_LISTAS_FRONTEND_2026-11-06.md
- docs/frontend/planos/PLANO_ATIVO.json
- docs/frontend/ESTADO_E_RETOMADA_CONTAOS_4_1.md
Proibidos: types.ts,clienteSupabase,rotas,árvoregerada,public/assets,estilosglobais,package/lock,SQL/migrations/RLS/Auth/Edge/Storage/workflows/PROD. Adaptadores comtipos locais;sem geração.
## Interfaces e comportamento fechado
obter_lista_operacional_v1(p_id_organizacao,p_id_contrato,p_id_lista,p_id_versao,p_pagina_versoes,p_pagina_itens)→crud-lista-v1.
executar_comando_lista_v1(p_id_organizacao,p_id_contrato,p_id_lista,p_versao_esperada,p_acao,p_payload,p_motivo,p_request_id)→recibo contextual com lista,request_id,event_id canônico evento_id.
Ações fechadas: criar_lista,editar_lista,criar_versao,editar_vigencia_rascunho,salvar_item,remover_item,publicar_versao,encerrar_vigencia,alterar_situacao,descartar_rascunho. Sem atualização direta nas tabelas.
Adaptador valida contextoUUID,ação,payloadallowlist,schema,IDs/tenant/lista/versão/itens,booleanscapacidade,paginação25,totais e recibo. Recusa retorno inconsistente. NoAPI nova semtype gerado.
UI na rota existente com botão Gerenciar listas; seleção paginada de listas existente/RLS, getter canônico para capacidades e versões/itens paginados. Campos nome/descrição/vigência; versão origem para cópia; editor item com código/descrição/categoria/obrigatório/aplicável/impeditivo/criticidade/fonte/regraJSON/ordem; editar vigência; publicar/encerrar/desativar/ativar/descartar,remover item apenasquando pode_remover do servidor.
Capacidades criar_item/editar_item se convertem em salvar_item, nunca inventar permissões pelo perfil. Sem exclusão de lista/versão pública; exibir motivo_retencao.
Confirmação explícita de ação,motivo3..2000,UUID por intenção,versão agregada. Emtimeout guardar comando exato e oferecer conferência/repetição explícita com mesmoUUID; não repetir automaticamente nem aceitar patchnovo comreciboantigo. Releitura após sucesso/replay,sem sobrescrever cache comrecibo histórico. Erro409 mantémdadosdigitados e pede atualizar antesdereenviar; rebase intencional comUUIDnovo somente após usuário revisar. Efeitos de mutação antiga não atualizam outraorg/usuário; limpeza emlogout/troca e respostas tardias descartadas. Invalidar listas e leituraversionada após efeito confirmado.
Backend decide fonteaprovada,intervalo,snapshot,perfis e regras. UI valida formato eapresenta erros PT-BR semstack/secrets. Não aceitaJSONarbitrário comcampos extra naRPC.
## Plano RED→GREEN
1 Testes adaptador: schema/IDsforjados,ação desconhecida,campoprotegido,capacidadefalse,malformados,erro403/409/422,replayrecibo/contexto,nenhumaDMLdireta.
2 TestesUI: cria/edita lista,versão,item;publica/encerravigência/inativa/ativa/descarta;negaações e removeritemreferenciado;confirmação/motivo;respostaincerta mantémUUID;conflito preserva rascunho;trocaorg/usuário descarta resultado;paginação.
3 RED observado antes do código; GREEN adaptador/UI; regressão completa,tsc,build,lint focal e gates originais intactos. Novasfalhas foraescopo não autorizam relaxar testes.
4 Teste C emturnoseparadoread-only noSHAfinal,4larguras×2temas,loading/vazio/erro/sucesso,teclado/foco/diálogos; UIautenticada real sóPASSseexecutada. Testesmock não sãoJWT ouHMLprivado.
5 Revisão de diff e integração somente comdoischecksgreen noSHAexato;checkpoint factual.
## Review focus
IDversão deoutralista negado; itemmaterial semfonteaprovada não publicado; efeito confirmado após timeout reconciliado semduplicação;orgtrocada duranteRPC não recebe resultadovelha;versãopublicada nunca editada/excluída. Cada caso exige teste,sem simular backend como prova de regra jáJWTtestada.
## Rollback
Reverter somente deltafrontend pornovocommit,sem banco. Retorna leitura original; nenhuma perda de histórico.
## ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE
GitHubdireto,sem LovableBUILD. Baseline AppShell/header/BRAND1.0 jáintegrado. Reusar Button/Dialog/Input/tokens/cartões/tabelasexistentes,sem assetsouCSSglobal. Matriz1440/1280/768/390×claro/escuro comestados eacessibilidade. Semprova privada registrarNÃOVERIFICADO. Menordelta,reusardados/testes,sem duplicarJWT147válido. Economia não reduzTDD,gates,qualidadeouTesteC.
## Gate
PLAN tecnicamente APROVÁVEL dentro do escopo autorizado; BUILD somente após commit documental validado e ambos checksSUCCESS. Sem certificação antecipada.

## Evidência BUILD local — 07/11/2026 UTC
PLAN254 integrado4de8296 após run42332158390 ambos SUCCESS. Implementação nas quatro fontes autorizadas; sem types/rotas/backend. RED inicial16falhas/2PASS por função não implementada; GREEN39/39 específicos e1056/1056 em40suítes,tsc/build/ESLint focal PASS. Revisão independente encontrou e corrigiu revisão base que mudava emrefetch, liberação antecipada após timeout e opção de cópia fora da página. Segunda revisão39/39 e nenhum crítico/importante. Testes novos incluem refetch concorrente, timeout+mesmoUUID, falha na conferência, logout+resposta tardia, paginação e validação de payload/recibo. Não equivalem à UI autenticada real. CI final e integração ainda exigidos; CRUD global e certificação V1 abertos.
