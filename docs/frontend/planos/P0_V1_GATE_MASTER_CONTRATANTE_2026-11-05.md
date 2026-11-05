# GATE P0 V1 — correção de capacidade MASTER no Novo Contratante

Issue #166; PLAN #173 integrado em `8aa857858d684cfd205de2b8e595598b7d1aafb5`. Etapa **GATE documental**, não BUILD nem certificação. Ambiente HML; PROD proibida.

## Evidência de defeito
Em `src/lib/contratantes/novoContratanteDados.ts`, `consultarVinculoProprio` consulta `vinculos_usuarios` e `vinculoPermiteCadastro` só aceita administrador/gestor_contrato. Em `NovoContratante.tsx`, o gate bloqueia antes do INSERT. MASTER global sem vínculo físico fica indevidamente impedido, apesar da autoridade backend distinta. O acesso ao menu não substitui autorização do DML.

## Contrato de implementação condicionado
- Consultar RPC existente `listar_organizacoes_disponiveis`, com sessão autenticada e organização preferida ativa; verificar contrato de retorno e assinatura exatos em `src/lib/contratos/novoContratoDados.ts` e tipos gerados antes do BUILD.
- Somente capacidade explicitamente retornada para organização ativa e perfil `administrador_master`, `administrador` ou `gestor_contrato` habilita formulário. Falha RPC, retorno vazio, organização divergente, perfil revogado e sessão ausente: negar sem fallback.
- Preservar `contratantes` INSERT sob RLS, sem service role no cliente e sem alterar privilégios de aprovação especializada. Revogação ou troca de organização invalida cache; não reaproveitar capacidade de outro usuário.
- A revisão de código deve incluir a semântica real de `listar_organizacoes_disponiveis` e eventual diferença entre permissão de listar e permissão de inserir. Se RPC não demonstrar capacidade de cadastro, bloquear BUILD e propor contrato backend em GATE separado.
- GATE de escopo: `PLANO_ATIVO.json` ainda não autoriza `src/lib/contratantes/novoContratanteDados.ts` nem `src/components/contratantes/NovoContratante.tsx`. Antes do BUILD, aprovar emenda de allowlist em PR separado e CI canônico.

## Testes RED obrigatórios
1. MASTER ativo sem vínculo físico e organização válida deve ter formulário.
2. Administrador e gestor válidos devem ter formulário.
3. Papel sem permissão, organização divergente/inexistente, sessão revogada e RPC indisponível devem negar.
4. RLS de INSERT deve negar quando não autorizado, mesmo com UI habilitada.
5. Troca de organização, logout e corrida assíncrona não podem manter autorização antiga.
6. Teclado/foco, estados acessíveis, quatro larguras e dois temas sem regressão.
7. Teste C independente e autenticação real com identidades sintéticas HML, não apenas mocks.

## Critérios de saída
PLAN #173: dois checks SUCCESS no mesmo HEAD e merge comprovado. Este GATE: dois checks canônicos SUCCESS no mesmo HEAD, merge permitido; só depois TDD RED e BUILD em PR distinto, com GREEN, Teste C, HML e checkpoint. V1 NÃO certificada; V2 BLOQUEADA.