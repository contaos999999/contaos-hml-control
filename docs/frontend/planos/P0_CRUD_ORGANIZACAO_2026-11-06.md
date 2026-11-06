# P0 CRUD global V1 — criação de organização pelo frontend
Status: PLAN técnico VALIDADO; BUILD em PR separado somente após ambos checks SUCCESS e integração deste gate.
Decisão expressa: prioridade CRUD global; completar operações permitidas na interface mantendo Supabase.
Escopo V1/SYS-04, correção transversal sob prompt ativo75, sem renumeração e sem antecipar V2.

## Evidência e regra
Inventário integrado no PR236 não localizou chamada frontend a criar_organizacao. HML inspecionado somente leitura: public.criar_organizacao(p_razao_social text,p_nome_fantasia text default null,p_cnpj varchar default null,p_timezone text default America/Sao_Paulo) retorna uuid, chama privado.criar_organizacao. Implementação canônica exige sessão ativa, cria organização, vínculo administrador do próprio criador, recurso contaos_1 e evento OrganizacaoCriada na mesma transação. Não exige MASTER. Preservar essa regra; não inventar restrição de perfil no frontend nem conceder permissões localmente.
Nenhuma alteração backend, grant ou regra de acesso. Operação passa pela RPC existente com sessão do usuário. Proibido INSERT direto de organização/vínculo/recurso.
Edição/desativação/exclusão de organizações permanecem fora deste delta, sujeitas ao inventário e contrato backend.

## Arquivos permitidos no BUILD posterior
- src/components/organizacao/OrganizationSelector.tsx
- src/components/organizacao/CriarOrganizacaoForm.tsx (novo)
- src/lib/organizacao/criarOrganizacaoDados.ts (novo)
- src/test/criarOrganizacao.test.tsx (novo)
- src/components/auth/LoginForm.tsx (somente botão de navegação no estado sem-acesso; nenhuma mudança Auth/login)
- src/test/login.test.tsx
Documentação: docs/frontend/auditorias/P0_CRUD_ORGANIZACAO_RESULTADO_2026-11-06.md.
Sem rota nova ou árvore gerada, tipos congelados, assets/tema/global shell, Auth, Supabase client, APIs novas, migrations, RLS, Storage ou PROD.

## Interfaces decididas
criarOrganizacao({razaoSocial:string,nomeFantasia:string,cnpj:string}):Promise<string> em criarOrganizacaoDados.ts.
ErroCriarOrganizacao.tipo: negado|duplicado|invalido|incerto. Adaptador chama exclusivamente supabase.rpc("criar_organizacao", {p_razao_social,p_nome_fantasia,p_cnpj,p_timezone:"America/Sao_Paulo"}).
CriarOrganizacaoForm({onCriada:(id:string)=>void,onCancelar:()=>void}):JSX. Campos razão social obrigatória, nome fantasia/CNPJ opcionais. Validar apresentação e tamanho sem substituir backend; CNPJ opcional normalizado retirando pontuação/espaço e preservando caracteres alfanuméricos,14 caracteres quando fornecido. Não assumir unicidade ausente no backend.
No seletor, usuário com sessão confirmada e consulta disponível vê "Nova organização", inclusive lista vazia. Sem sessão, carregando ou consulta negada: sem formulário. Cancelar não chama RPC.
Após UUID confirmado: aviso de sucesso, atualizar lista por RPC existente e selecionar somente UUID; acesso via Continuar mantém revalidação/destino existentes. Não gravar organização fictícia no cache nem conceder vínculo no cliente.
Falha de rede/retorno inválido: resultado incerto; sem retry automático. Orientar conferir a lista antes de repetir. Proteger duplo submit com ref e botão ocupado. Falha ao recarregar depois de criar não pode ser mostrada como falha da criação nem repetir comando.

## TDD e aceite
- RED: botão/form ausente na lista vazia; integração sessão→form→RPC→recarga; campos obrigatórios; cancelamento zero escrita; duplo submit; rejeição autorizativa; erro incerto sem retry; retorno inválido; falha da lista após sucesso sem duplicação.
- GREEN: testes do domínio e regressão completa; typecheck/build/linters aplicáveis; Zero-Drift, hash types8ea7750b75fd9d76b29c36ce7613392e3ab65e19 e GOV020.
- Teste C independente; UI real1440/1280/768/390 claro/escuro e acessibilidade. Ausência de sessão privada impede alegar E2E autenticado PASS; não bloqueia registro honesto de implementação e testes de código.
- Rollback: revert frontend; preservar organizações já criadas e seus eventos, sem exclusão automática.
- Riscos: criação canônica não tem chave idempotente; nenhum retry automático será introduzido. Usuário deve conferir lista quando resposta incerta. Qualquer mudança futura de idempotência exige plano backend próprio.

## ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE
Reusar Button, Input/labels e tokens existentes; sem redesenho ou assets novos. Marca e tipografia oficiais preservadas; formulário integrado ao seletor. Matriz visual4larguras×2temas, loading/erro/vazio/sucesso, foco e teclado; não declarar PASS sem prova.
GitHub direto para BUILD; RPC Supabase existente; zero BUILD do agente Lovable; consolidar tarefas sem reduzir TDD/CI/Teste C/segurança. V1 não certificada, V2 e PROD bloqueados.

## Emenda de integração confirmada antes do BUILD
LoginForm.tsx mantém usuário autenticado sem organizações no estado sem-acesso. Adicionar nesse estado somente botão que chama onNavegar('/selecionar-organizacao'); não exibir no estado negado nem alterar login, sessão, credenciais ou resolução automática. Testes de login comprovam caminho e negativa. Seletor vazio terá orientação compatível com criação. Nenhuma regra Auth/RBAC alterada.
