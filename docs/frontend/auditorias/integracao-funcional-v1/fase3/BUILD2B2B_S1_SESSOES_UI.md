# F3 BUILD-2b-2b: sessões de interface e implantação da organização sintética

**Escopo desta fatia:** 1–4 dos 20 produtores, ordem única do PLAN específico F3 §3, e controles globais necessários. Esta é a primeira implementação de drivers e NÃO é o certificado F3. Vinculação ao issue de execução única #708. A fundação técnica BUILD-2b-2a da PR #679 foi integrada no merge protegido `0959389935ade6ca90d499122a54756e4e556596`.

## Critério fechado de implementação
1. Reutilizar navegador Chromium nativo, verificador de ativos públicos, proxy e `installNativeFence` do auditor F2 e a `createF3MutationFence({book})` da #679. Nunca abrir Playwright externo sem as restrições canônicas, jamais usar JWT/service_role fora do contexto protegido do GitHub Actions.
2. MASTER entra pela UI real (login/email/senha), obtém `/selecionar-organizacao`; verificar perfil vigente e contextos antes de mutações. Não presumir `app_metadata.synthetic` do MASTER porque a única conta ativa verificada era não-sintética; atribuir autorização apenas pelo produto/RLS atual.
3. Na `/selecionar-organizacao`, clicar `Nova organização`, preencher razão social exclusiva com nonce de execução e deixar CNPJ vazio (unicidade com fonte). `Criar organização` deve corresponder a uma ÚNICA requisição `rpc criar_organizacao` armada no livro com `producerOrder=2`; observar resposta e readback do card `role=radio`/contexto e organização nova UUID. Nunca forçar outro registro se resposta incerta; usar reconciliação.
4. Após escolher a nova organização F3, MASTER abre `/administracao/usuarios`; clica `Convidar ou vincular usuário`, preenche o e-mail do usuário sintético já existente, `leitor`, vínculo ativo e escopo correto. A UI real executa Edge `admin-invite-user` e RPC `salvar_vinculo_usuario_adm`; armar os dois passos na mesma intenção de ordem 4 com chaves de idempotência observadas. Após a UI salvar, confirmar por readback do vínculo, não apenas por toast.
5. O `leitor` faz login com credencial do environment `hml` (secret só no passo protegido), seleciona apenas a organização F3, acessa o painel e rota administrativa e é negado conforme matriz RBAC. MASTER e leitor fazem logout com evidência de sucesso.
6. Nada de `PASS` dos 138 casos nesta fatia. Registrar apenas observações pontuais e deixar `runCli` bloqueado por `F3_DRIVER_PENDING` até que todos os produtores 5–20, duplicidades, negativos e relatório total tenham sido implementados. Não fabricar relatório `COMPLETE`.
7. Testes sem segredos: double Playwright compatível com interface DOM oficial; negativa de organização fora da F3, senha indisponível, segundo perfil diferente de `leitor`, mutação do leitor, Edge/RPC não vinculados ao book, tentative resend incerto, logout incompleto, seleção inválida e erro de rede. Prettier/ESLint/Node Test + Zero-Drift + Teste C no HEAD. Revisão distinta do implementador.

## Fronteira de segurança
- Produto, routers, `types.ts`, backend, migrations, RLS, Auth admin, Storage, jobs e PROD: **inalterados**.
- Permissão de alteração de scripts somente após GOV específico desta PR integrado na main; não ampliar a allowlist durante a execução.
- Se não existir conta sintética pronta ou segredo válido, o job autenticado marca bloqueio real sem mutar tabela nem revelar email.
- Não iniciar REQUEST real da F3 antes dos incrementos dos produtores 5–20: o PLAN F3 §9 evita nonce desperdiçada e execução parcial indevida.

## Dependências da sequência
S0: deployment HML SHA/paridade e identidades efetivas; S1: este driver; S2–S4: produtores 5–20 e fechamento; S5–S8: F4–F7. Critério funcional F3 continua `138/138` com todas as negativas.
