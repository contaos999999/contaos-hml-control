# P0 CRUD global: gestão de organizações e contratos

Autorização expressa: executar integralmente CRUD global mantendo Supabase. Integração em lote de duas entidades, sem mudança de rotas, tipos congelados, Brand, RLS/Auth/Edge/Storage/PROD.

## Contrato e fluxo
Backend #90 e emenda #92, BUILD #91: obter_cadastro_operacional_v1, atualizar_organizacao_v1, alterar_situacao_organizacao_v1, atualizar_contrato_v1, alterar_situacao_contrato_v1. Todas invoker, esquema crud-cadastro-v1. Não iniciar BUILD frontend antes de backend integrado, deploy canônico e JWT reais PASS, mais dois checks do PLAN e snapshot vivo reancorado.

Seletor organizacional: botão Gerenciar organização selecionada abre formulário inline isolado por usuário/organização. Detalhe do contrato: botão Editar e gerenciar contrato com contexto exato da tela. Ler capacidades/registro do backend apenas quando aberto; leitores recebem estado sem permissão, nunca bypass MASTER por perfil local.

Edição explícita dos três campos organizacionais e quatorze contratuais autorizados no backend. Situação e transições são escolhas retornadas pelo servidor. Motivo obrigatório, confirmação textual da ação, versão exibida e enviada. Encerramento/cancelamento terminais respeitados. Não criar DELETE para dados com retenção: mostrar fundamento de exclusão indisponível, sem apagar auditoria ou história.

Adapter local fechado, parser estrito de schema, entidade, id/org/versão, capacidades, enums e resultado de mutação. Ausência/API inválida falha fechada. Nenhum supabase.from.update/delete genérico, segredo, SQL, Edge ou alteração de tipos gerados. Campo numérico nulo preservado e validação local apenas conveniência; servidor decide regras.

Request UUID por conteúdo/contexto/versão. Repetir explicitamente o mesmo comando após resultado incerto usa a mesma chave, nunca retry automático. Não anunciar sucesso com resposta incerta/incompatível. Conflito409 oferece recarregar versão atual e revisar rascunho preservado antes de reenviar. Sem duplo clique ou respostas tardias após troca do contexto. Atualizar apenas consultas do usuário/org/alvo, refazer listagem e detalhe após sucesso.

## Escopo exato
- src/lib/cadastros/cadastroOperacionalDados.ts
- src/components/cadastros/GerenciarCadastro.tsx
- src/components/organizacao/OrganizationSelector.tsx
- src/components/contratos/VisaoGeralContrato.tsx
- src/test/cadastroOperacional.test.tsx
- docs/frontend/planos/P0_CRUD_CADASTROS_2026-11-06.md
Documentos de snapshot/plano ativo/checkpoint já autorizados continuam permitidos.

## RED, BUILD e prova
RED antes do código: testes do adapter e componente para contexto divergente, payload/allowlist, dados inválidos, permissão, transições, motivo, UUID/replay, concorrência/conflito, resultado incerto e troca de contexto. Em seguida implementar mínimo, suites Vitest completas, tsc e build; SHA dos tipos congelados inalterado. Dois checks obrigatórios no HEAD final, revisão independente e merge sem squash. Teste C público não equivale à UI privada autenticada. Gate backend fica separado e não pode ser dispensado pelo plano.

## ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE
Usar componentes/tokens existentes, labels acessíveis, estados carregando/erro/vazio/sucesso, controles44px e layout responsivo. Sem marca adicional nas telas organizacionais. Sem build Lovable. Rollback reverte apenas integração do formulário, preserva servidor/dados/histórico. Não declarar CRUD global/V1 concluído por este delta.
