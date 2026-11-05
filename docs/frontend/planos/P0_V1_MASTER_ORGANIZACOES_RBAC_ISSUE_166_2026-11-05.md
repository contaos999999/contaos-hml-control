# P0 V1 — Contrato de implementação MASTER, organizações e RBAC (issue #166)

Status: PLANO / NÃO IMPLEMENTADO. Data: 2026-11-05. Escopo: exclusivamente V1, HML; PROD proibida. Nenhuma certificação V1 autorizada por este plano.

## Evidências verificadas
- PR #170 e #171 integrados, ambos com Zero-Drift e Teste C verdes; main após #171: 7eca376d11a1b88125a83855903fe0117978e80d.
- HML gklhhhyosgasnyoxlrui: public.perfis_usuarios(id,codigo,nome,descricao,criado_em), public.vinculos_usuarios(id,id_organizacao,id_usuario,perfil,escopo_todos_contratos,ativo,inicio_em,fim_em,...), public.organizacoes(id,razao_social,nome_fantasia,cnpj,timezone,moeda,idioma,situacao,...).
- Consulta information_schema: não há tabela de permissões por recurso/ação no schema public.
- RPCs existentes: criar_organizacao, listar_organizacoes_disponiveis, validar_administrador_organizacao, pode_consultar_auditoria_organizacao.
- Investigação adicional: MASTER global JÁ EXISTE no backend em privado.administradores_master, verificado pela função privado.usuario_e_administrador_master(), com sessão ativa, vínculo ativo e janela temporal. privado.usuario_possui_perfil inclui MASTER quando a operação exige administrador. A listagem de organizações já inclui MASTER. O bloqueio relatado exige teste de sessão e UI, não recriação de autoridade MASTER.
- Frontend: /selecionar-organizacao, /administracao/usuarios, /administracao/auditoria, /contratantes e /contratos; não existe rota CRUD /administracao/organizacoes no routeTree.gen.ts.

## Contrato de segurança e modelo de acesso
1. Definir MASTER GLOBAL como atributo administrativo mantido pelo servidor, imutável pelo próprio usuário, nunca inferido por email, localStorage ou user_metadata. Validar a identidade do MASTER na fonte canônica do backend antes de qualquer migração. Não promover usuários automaticamente.
2. Criar catálogo de recursos V1 (organizacoes, contratantes, contratos, orcamento, regras, documentos, competencias, analise, parecer, apresentacao, historico, usuarios, auditoria), ações (listar, visualizar, criar, editar, excluir, administrar conforme domínio), matriz perfil-recurso-ação e atribuições por organização. Padrão deny-by-default. Definir explicitamente permissões de Contabilidade com aprovação de negócio; não inventar autorizações.
3. Backend como autoridade: RLS e RPCs verificam auth.uid(), vínculo ativo, organização e escopo do contrato; MASTER global deve ser comprovado no banco. Evitar SECURITY DEFINER público sem validação explícita, revogar EXECUTE de PUBLIC/anon quando pertinente. Não confiar em menus como controle de acesso.
4. CRUD organizações: criar/listar/detalhar/editar com regras e auditoria, CNPJ e conflitos validados no backend. Proibir exclusão destrutiva sem decisão explícita. Frontend /administracao/organizacoes apenas depois da API protegida estar pronta.
5. Sidebar: grupos Administração, Cadastros, Gestão Contratual; contexto dinâmico de contrato/competência obtido de rota e validado por dados autorizados; links com IDs reais; estado expandido/recolhido e mobile, logo BRAND-01 transparente; aria-current único; teclado, contraste e foco.
6. Gate de backend primeiro: inventário de funções, grants, políticas, constraints, perfis e vínculos; migração versionada, revisão de segurança e teste HML negativo (anon, sem vínculo, organização cruzada, perfil sem ação) e positivo (MASTER e papéis autorizados) com sessões reais controladas. Nunca simular sessões reais como prova de autorização.
7. Gate de frontend depois: contratos tipados, estados loading/negado, testes Vitest de matriz, isolamento, navegação e acessibilidade, Zero-Drift, Teste C Independente; PRs separados, revisão e merge só com evidências verdes.
8. Rastreabilidade: mapear cada rota e ação V1 ao requisito/PRD, teste e prova; registrar HEADs, runs, hashes, exceções R01-R03 e NO-GO até prova integral.

## Etapas
A. Levantamento read-only das definições das RPCs, RLS, grants, perfis e origem da autoridade MASTER. Resultado: contrato de autorização revisado.
B. Implementar e testar backend HML com migração e rollback documentados. Sem alterações de produção.
C. Implementar UI de organizações e administração de matriz RBAC, usando somente RPCs seguras e checks de servidor.
D. Completar sidebar contextual e acesso MASTER, com testes de acessibilidade e BRAND.
E. Provas reais por papel, organização e rota, CI canônico e certificação V1 somente se gates atendidos.

## Bloqueios explícitos
- MASTER global identificado na fonte canônica; ainda não comprovado com sessão autenticada real do usuário e teste por tela.
- Perfis e permissões efetivas ainda não aprovados como matriz recurso-ação.
- CRUD organizações e RBAC não implementados por este documento.
- Exceções E2E upload, worker e isolamento interusuários permanecem pendentes.

Próxima tarefa: executar etapa A, anexar resultado à issue #166 e abrir PR de implementação backend após gate normativo.
