# P0 CRUD global — criação de competências por capacidade efetiva
Status: PLAN técnico VALIDADO; BUILD somente após integração e ambos checks SUCCESS. Correção legado V1-13 sob prompt75, sem renumeração.
Fonte: decisão de priorizar CRUD global, PRD V1 e regra MASTER global. HML exclusivo.

## Falha confirmada
NovaCompetencia.tsx → lerPerfilAtivo consulta vinculos_usuarios e perfilPodeCriar aceita somente administrador/gestor_contrato/prestacao_contas. MASTER sem vínculo fica impedido mesmo quando o backend autoriza. A consulta de perfil não contempla permissões RBAC efetivas e usa cache infinito.
Usar consultarPermissoesEfetivas(org,contrato) e temPermissao(...,"competencias","criar") com escopo exato, sem bypass por master. A RPC criar_competencia permanece autoridade final.
Antes de consultar capacidade/exibir formulário, contrato deve corresponder ao ID e à organização selecionada; tratar divergência com negação explícita, não loading infinito.

## Arquivos fechados
- src/components/contratos/NovaCompetencia.tsx
- src/lib/contratos/novaCompetenciaDados.ts
- src/test/novaCompetencia.test.tsx
Sem backend/RLS/Auth/Storage/RPC nova/migration, tipos, marca, rotas/árvore, outras telas ou PROD.

## Interface
Adicionar consultarCapacidadeCriarCompetencia(idOrganizacao:string,idContrato:string):Promise<boolean> no adaptador de dados.
Consome RPC existente via rbacRpc.ts. ErroRbac negado→false; falha técnica→ErroNovaCompetencia("erro"). Não inferir permissão a partir de perfil, e-mail, vínculo local ou localStorage.
Query key por usuário/org/contrato/ação e sem staleTime Infinity. Funções legadas de perfil não serão usadas como autorização pela tela; não alterar catálogo RBAC nem regras de segurança.
Preservar criarCompetencia, snapshots, mesParaReferencia, reconciliação de resultado ambíguo e concorrência backend.

## TDD
RED: MASTER sem vínculo com permissão efetiva; perfil aparentemente administrativo sem permissão; usuário comum com permissão concedida; contrato de outra organização; erro técnico e revogação/negação no comando.
GREEN: permissão exata e contexto; zero leitura de vínculos pelo gate; comandos/datas/duplicidade/resultado ambíguo preservados. Testes antigos do gate de perfil passam a provar capacidade backend; não remover negativas nem alterar regra para facilitar teste.
Regressão completa, tsc/build/gates/tipos/segurança e Teste C independente. Sem sessão privada, evidência autenticada continua NÃO VERIFICADA.

## Revisão e rollback
Revisar IDOR/contexto divergente, MASTER sem vínculo, falta de permissão e cache. Rollback por revert frontend, sem apagar competências ou eventos.

## ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE
Sem mudança visual ou de assets/tokens/layout; componentes oficiais preservados. Verificar1440/1280/768/390 claro/escuro e acessibilidade aplicável, sem alegar screenshots por testes de código.
GitHub direto, backend existente, menor delta conforme; sem BUILD Lovable nem repetir evidências válidas. TDD/CI/Teste C preservados. V1 ainda não certificada, V2/PROD bloqueados.
