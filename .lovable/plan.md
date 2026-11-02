# Transversal 4.1 — Administrador Master em SYS-01 e SYS-04 (somente frontend)

Base: HEAD `8a809e2e8600ec8616e5d5fe0c1f299b07469548`. Backend consumido como contrato; zero alteração em Supabase/PROD.

## Contrato consumido
`supabase.rpc("listar_organizacoes_disponiveis")` — sem argumentos. Linhas: `id, razao_social, nome_fantasia, cnpj, situacao, perfil`. Única fonte para decidir 0/1/>1 (SYS-01) e para listar opções (SYS-04). Nenhuma leitura de `vinculos_usuarios` permanece nesses dois fluxos.

## Lacuna de tipos (declarada, não improvisada)
A RPC não consta em `src/integrations/supabase/types.ts` (verificado). O arquivo é gerado e a ferramenta rejeitou sua edição no V1-03. Solução idêntica à já aprovada no V1-03: adaptador local tipado em `src/lib/auth/resolverDestinoPosLogin.ts` (`listarOrganizacoesDisponiveis()`), com tipo `OrganizacaoDisponivel` e comentário `LACUNA DE TIPOS`; nenhum `any`, cast restrito ao nome da RPC. Se `types.ts` for regenerado depois, o cast é removido.

## Arquivos
1. `src/lib/auth/resolverDestinoPosLogin.ts`
   - tipo `OrganizacaoDisponivel`; adaptador RPC; `rotuloPerfil(perfil)` (`administrador_master` -> `Administrador Master`; demais perfis mantêm a exibição atual); `resolverDestinoPosLogin(orgs)` mantém 0 -> sem-acesso, 1 -> `/`, >1 -> `/selecionar-organizacao` (sem rota nova).
   - classificador de erro: 401/403/42501/PGRST301 -> `negado`; demais -> `erro`.
2. `src/components/auth/LoginForm.tsx`
   - `carregarVinculos` passa a chamar só o adaptador RPC; remove `.from("vinculos_usuarios")`.
   - Estados: carregando, sem-acesso (0), negado (novo alerta PT-BR, não confundido com vazio), erro-vinculos (retry), redirecionando. Mensagens: novo `MENSAGENS.negado` = "Você não tem permissão para acessar as organizações. Procure o administrador."
3. `src/components/organizacao/OrganizationSelector.tsx`
   - query passa à RPC; mapeamento para o modelo de opção existente (organização sempre presente; linha sem `id` é tratada como indisponível, preservando o comportamento atual).
   - exibe `rotuloPerfil(perfil)`; mantém radiogroup, setas, foco, alvos >=44px, aria-live, pré-seleção com 1 opção, Continuar desabilitado sem seleção, ref anti-duplo-clique, `queryClient.clear()` antes de gravar preferência e navegar quando a org muda.
   - query key inclui `id_usuario` (já ocorre) para não reutilizar resposta de outro usuário.
4. Testes: `src/test/resolverDestinoPosLogin.test.ts`, `src/test/login.test.tsx`, `src/test/selecionarOrganizacao.test.tsx` (mocks trocam `from()` por `rpc()`; asserção de que `from` não é chamado).

Não tocar: ADM-01, V1-01..V1-04, Dashboard, rotas, `client.ts`, `package.json`, `types.ts`.

## TDD (RED antes de GREEN)
- resolver: Master 2 orgs -> `/selecionar-organizacao`; 1 -> `/`; 0 -> sem-acesso; `rotuloPerfil("administrador_master")`.
- Login: Master com 0 vínculos físicos e RPC com 2 orgs navega ao seletor; `rpc` chamada com nome exato e sem argumentos; `from` nunca chamado; 0 -> sem acesso; 401/403/42501 -> negado; 500/rede -> erro com retry.
- SYS-04: Master vê A e B com "Administrador Master"; usuário comum recebe só A com perfil real; vazio; negado != vazio; erro + retry; troca A->B chama `clear()` antes de gravar/navegar e não reexibe dados anteriores; mesma org sem `clear()`; teclado/radiogroup preservados.
- RED esperado: falha comportamental (mock `rpc` não chamado / rótulo ausente), não de sintaxe.

## Validação no BUILD
Testes focados, suíte completa, `tsgo --noEmit`, build automático, scan nos arquivos alterados (sem `vinculos_usuarios`, `service_role`, DML). Browser 1440/1280/768/390 com mocks controlados. Teste C em turno separado.

## Rastreabilidade
Prompts regulares SYS-01 (PROMPT 16) e SYS-04 (PROMPT 19) reabertos de forma transversal; atômicos aplicáveis = os já associados a SYS-01/SYS-04, sem nova associação inventada.
