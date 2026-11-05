# P0 V1 — Gate de cadastro de contratantes para MASTER

Issue #166. Status: PLAN, sem BUILD. HML exclusivamente. PROD proibida.

## Falha reproduzível por inspeção de código
`src/lib/contratantes/novoContratanteDados.ts` implementa `consultarVinculoProprio` buscando vínculo físico na tabela `vinculos_usuarios` e `vinculoPermiteCadastro` aceita apenas `administrador` e `gestor_contrato`. O MASTER global é mantido em `privado.administradores_master` e pode não possuir vínculo físico. Assim, a interface pode negar cadastro ao MASTER antes da chamada INSERT, mesmo quando o backend o autoriza. Em contraste, `src/lib/contratos/novoContratoDados.ts` usa `listar_organizacoes_disponiveis` e aceita `administrador_master`.

## Correção segura
1. Substituir gate visual de cadastro de contratante por capacidade derivada exclusivamente da RPC `listar_organizacoes_disponiveis`, vinculada à organização ativa, com perfil `administrador_master`, `administrador` ou `gestor_contrato`; não inferir MASTER por email/metadata ou estado local. Preservar a RLS como autoridade final do INSERT.
2. Auditar uso do helper em `src/components/contratantes/NovoContratante.tsx`, compatibilidade com tipos, estados de erro, revogação e sessão. Nunca conceder acesso por fallback permissivo quando RPC falhar.
3. Testar MASTER sem vínculo físico, administrador, gestor, perfil negado, organização inexistente, sessão revogada e falha RPC. Garantir sem regressão no formulário e zero secret.
4. Escopo candidato BUILD após gate: `src/lib/contratantes/novoContratanteDados.ts`, `src/components/contratantes/NovoContratante.tsx`, testes associados e `docs/frontend/planos/PLANO_ATIVO.json` mediante ajuste explícito da allowlist canônica.
5. PLAN → CI Zero-Drift/Teste C → merge → GATE/BUILD em PR separado → CI e evidências HML JWT reais. Não certificar V1 com teste mock.

## Dependências
Rever regras de organização e permissões de outros cadastros, CRUD organizações e matriz granular de papéis no escopo P0 da issue #166. A regra MASTER transversal vale para V1–V5, sem renumerar prompts regulares/atômicos.
