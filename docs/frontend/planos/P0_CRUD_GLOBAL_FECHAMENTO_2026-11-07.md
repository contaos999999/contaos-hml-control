# PLAN único P0 — fechamento CRUD global V1

Autorização expressa reiterada: executar auditoria integral e implementar pendências do CRUDglobal mantendo frontend→Supabase API/RPC/Edge→PostgreSQL/Storage/auditoria. Sem perguntas/aprovações rotineiras repetidas. V1 antes V2, PROD proibido. Baseline frontend6363edeb2b980e673ca89c894879f9b196188ded e backenda6399adc39e984293c14d7adcf106b00ab76ce50.

## Fonte confrontada
ZIP original recuperado em fonte local, SHA2565ee115d12e263d98068288b6bb722f5f303f2d19e1e4c0b5e930e69da03621da; manuais originais extraídos viaXML e hashes conferidos:100prompts8a15d96568d021ac86fdd45e79038e2cb969d69c12b2edb84f012a6129b8940e,97atômicosd9faaae47de4b697b18ad7fb71e4738384514936813cd5b18779f4cb8aed83b8. Textos literais SYS01–05/ADM01/V1-01–23 confrontados com implementações e fontes00–20 vigentes. Inventário real28rotas:24organizacionais e4deacesso/seletor, não27. Domínios18,68rótulos deoperações auditados; inventário não é prova nem criação de APIs.

## Matriz e achados
Matriz fechada docs/frontend/auditorias/P0_CRUD_GLOBAL_MATRIZ_2026-11-07.json separa implementaçãoestática, testeunitário, provaautenticada e retenção/proibição. Conexões existentes cobrem cadastros, normas, orçamento, listas, versõesdocumentais, competências, análises/revisão, parecer/apresentação/protocolo, histórico, admin/auditoria. Não reconstruir módulos nem inventar DELETE de objetos imutáveis. Ausência de editor manual de parecer/exportaçãoauditoria/reprocessamentomanual não concede operação sem contrato; PROMPT75 éconsulta/filtros sempayload, parecer opera geração/decisão protegidas. Nenhuma mudança de backend de produto por este PLAN frontend.

FAIL concreto CRUD-LISTA-001: GerenciarListas condiciona todo painel a d&&!q.isError. Após409 e refetch500, Formulario desmonta e perde nome/descrição/motivo/base da intenção. Correção mínima: preservar instância e rascunho em falha transitória com dados prévios do mesmo usuário/org/contrato; bloquear novas escritas enquanto erro/recarga e exigir recuperação. Negação403/sessão/contexto divergente continua failclosed, sem reapresentar dados protegidos como autorizados. Nunca reenviar automaticamente comando ou recalcular revisão/CAS para forçar sucesso.

## Etapas executáveis e critério de saída
1. PLAN→checksSUCCESS no mesmoHEAD→merge; GATE documental separado→CI→merge.
2. TDD RED para409→refetch500→rascunho preservado/nenhumaescrita→retryPASS; negativa403/sessão/contexto semdados/semcomando. BUILD sódoisarquivos: src/components/contratos/GerenciarListas.tsx e src/test/listaOperacional.test.tsx. Semrotas/tipos/clienteSupabase/coresglobais/backend.
3. GREEN focado e regressão completa, TypeScript/build/lintfocal, ZeroDrift/GOV020, hash tipos8ea7750b75fd9d76b29c36ce7613392e3ab65e19; revisão independente, doischecks exigidos eprotecttypes no mesmoHEAD. TesteC separado semedição. Merge sóapósCI.
4. Provas privadas CRUD por domínios, por tarefa backend de harness própria separada, plano/GATE próprios. Reutilizar protocolo seguro V117/AuthAdminAPI e fixtures próprias com IDs antes do seed, contasMASTER/admin/leitor/tenantB, sem SQLauth.users. Browser sósessãoprópria; admin/banco nuncaNode/artefatos. Não executar harnesslegadoCRUDcadastros que criaAuthviaSQL. Não repetir provas anteriores válidas como substituto da UIglobal.
5. Exercitar criação/leitura/edição/transições/remoçõeslegítimas; persistência e auditoria no banco, negativas RBAC/RLS/contexto, CAS/replay/resultadoincerto e restauração/quarentena. Upload/worker quando exigidos devem comprovar arquivo/processamento reais; metadado sintético não equivaleupload. Quatro larguras/doistemase estados/foco/teclado/contraste no frontendreal; capturas eaxe não certificam WCAGmanual integral.
6. Atualizar matriz por evidência exata, sem chamar mocks deHML, nem confundir leitura/objetos imutáveis comCRUDfaltante. CRUDglobal sóPASS quando todasoperaçõesaplicáveis implementadas eprovadas, retenções justificadas, nenhumFAILobrigatório/NÃOVERIFICADO. V1 exige outrosgates/retrospectiva/certificação própria, não avançoV2.

## Escopo documental
Este PLAN, matriz ePLANO_ATIVO/checkpoint; código limitado aos2arquivos acima para achado concreto. Correções novas exigem delta fechado com PLAN/GATE próprio dentro deste planoúnico, sem ampliar porconveniência. Não mudar src/integrations/supabase/types.ts, src/routeTree.gen.ts, migrations/RLS/Auth/Storage/Edge/PROD. ProvaHML por repositóriobackend eescopo próprio, não como alteração frontend disfarçada.

## Reversão / ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE
Reverter somente preservação do rascunho se necessário; nenhum dado/histórico apagado. Componentes/tokens/BRAND01 preservados; GitHubdireto, sem BUILD Lovable. Economia não reduz TDD/CI/TesteC/E2E/segurança. Não certificar por contagem de telas/ações. Plano tecnicamente validado, BUILDaguardaGATE/CI integrados.

## GATE separado — validado tecnicamente

PLAN289 HEADe47885debcdf5e5a47e24849e7efc125330bd18e integradoab9f069a9cfbd7a047b760089506c4f009bd507a apósZeroDrift/TesteC/protecttypesSUCCESS no mesmoHEAD. Fonteoriginale28rotas conferidas. Correção do rascunho limitada aos2arquivos indicados. Preservar instância só em erro transitório da leitura com dadosanteriores domesmocontexto;403/sessãonegada mantém dado oculto/semnovocomando. Bloquear revisão e novasoperações enquanto erro/recarga. Repetição explícita da exata intenção pendente após resposta incerta continua disponível apenas no errotransitório, sem novoUUID/reenvio automático;403tambémbloqueiareplay. Testes RED dessasfronteiras antescódigo. Reversão somente frontend. Não transferir autorização de harnessparaDB/RLS/PROD ou declararmocksHML. BUILDaguardaCI/mergedesteGATE.
