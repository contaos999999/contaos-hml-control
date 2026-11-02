# SYS-01 — Login (PROMPT 16) — `/login`, público

## Objetivo
Tela de entrada do ContaOS com e-mail + senha via Supabase Auth (`signInWithPassword`, única operação de autenticação). Após sucesso, ler os vínculos do usuário sob RLS e resolver o destino para as rotas oficiais `/selecionar-organizacao` (SYS-04) ou `/` (Dashboard, SYS-05).

Autoridade visual: Project Instructions + Design System Executive Command Center + Audit Workspace. A comparação com o protótipo MagicPath será feita externamente.

## 1. Arquivos exatos (somente dentro do projeto Lovable)
Novos:
- `src/routes/login.tsx` — rota pública `/login`, `head()` em PT-BR.
- `src/components/auth/LoginForm.tsx` — formulário, estados e mensagens.
- `src/lib/auth/resolverDestinoPosLogin.ts` — função pura: recebe os vínculos devolvidos pelo backend e retorna `/selecionar-organizacao`, `/` ou "sem acesso".
- `src/test/resolverDestinoPosLogin.test.ts`
- `src/test/login.test.tsx`
- `docs/frontend/lovable/SYS-01-login.md` — prompt, plano, arquivos, testes, PASS/FAIL, evidências e dependências.

Não alterados: `src/routes/index.tsx`, `src/routes/__root.tsx`, `src/start.ts`, `src/integrations/supabase/**`, `package.json`, `src/styles.css`, schema, migrations, RLS, Auth config, Edge Functions e Storage. `src/routeTree.gen.ts` regenera sozinho (não é edição manual).

## 2. Operações Supabase (todas já existentes)
- `supabase.auth.signInWithPassword({ email, password })`.
- `supabase.auth.getSession()` ao abrir a tela, para saber se já há sessão (sem gravar token próprio).
- Leitura de vínculos: `from("vinculos_usuarios").select("id, id_organizacao, perfil, ativo, inicio_em, fim_em")`. Sem filtros de autorização no React: o que o backend devolve sob RLS é o que vale. A tela só conta quantos vínculos vieram.
- Primeiro passo do Build: consulta somente leitura das policies de `vinculos_usuarios` para confirmar leitura dos próprios vínculos. Se não existir, registrar **LACUNA DE BACKEND** e parar esse caminho (login continua, destino não resolvido).
- Nenhuma tabela, RPC ou Edge Function nova.

## 3. Componentes
shadcn já existentes: `Card`, `Label`, `Input`, `Button`, `Alert`; ícones lucide. Sem novas variantes nem tokens globais.
Mostrar/ocultar senha: botão com `aria-label` "Mostrar senha" / "Ocultar senha" e `aria-pressed`. Sem tooltip (o nome acessível já basta).

## 4. Estados
- **Inicial**: campos vazios, Entrar habilitado.
- **Validação**: e-mail inválido ou senha vazia → erro sob o campo, foco no primeiro campo inválido.
- **Processing**: Entrar desabilitado com "Entrando…"; campos bloqueados; sem duplo envio.
- **Erro de credencial**: "E-mail ou senha inválidos." (não revela se o usuário existe).
- **Erro de rede/servidor**: "Não foi possível conectar. Tente novamente." + Tentar novamente.
- **Carregando vínculos**: "Carregando seus acessos…".
- **Empty/denied**: nenhum vínculo devolvido → "Seu usuário não possui acesso ativo a nenhuma organização. Procure o administrador." + Sair.
- **Erro ao ler vínculos**: mensagem + Tentar novamente + Sair.
- **Success**: vários vínculos → `/selecionar-organizacao`; um vínculo → `/`.
- **Já logado** ao abrir `/login**: mesmo fluxo de vínculos e destino.

## 5. Responsividade
- 1440/1280: painel institucional ContaOS à esquerda + cartão de login à direita.
- 768: painel vira faixa superior; cartão centralizado.
- 390: só o cartão em largura total com margem; toques ≥ 44 px; sem rolagem horizontal.

## 6. Acessibilidade
- Labels visíveis associados; `autocomplete="email"` e `"current-password"`; `type="email"`.
- Tabulação: e-mail → senha → mostrar senha → Entrar; Enter envia.
- Foco visível; erros com `role="alert"` e `aria-describedby`; processing com `aria-busy` e região `aria-live="polite"`.
- Status nunca só por cor (ícone + texto). Todo texto em PT-BR.

## 7. Testes
PASS possível agora:
- Unidade `resolverDestinoPosLogin`: 0 vínculos → sem acesso; 1 → `/`; vários → `/selecionar-organizacao`.
- Componente: labels, validação, botão desabilitado durante envio, mensagem genérica de credencial, erro de rede, estado sem vínculos (Supabase simulado).
- Rota `/login` existe na árvore de rotas.
- Playwright: render e teclado em 1440/1280/768/390, credencial errada, axe, scan de secrets.

Dependentes de telas futuras (registrados como pendentes, não FAIL do SYS-01):
- Chegar e renderizar `/selecionar-organizacao` → depende de SYS-04.
- Chegar e renderizar o Dashboard em `/` → depende de SYS-05.
- Happy path ponta a ponta com usuário HML real: verifica o login e a URL de destino; o conteúdo da tela de destino fica pendente.

## 8. Dependências futuras
- **DEPENDÊNCIA DE FRONTEND**: SYS-04 `/selecionar-organizacao` (ainda não implementada).
- **DEPENDÊNCIA DE FRONTEND**: SYS-05 Dashboard em `/` (hoje é placeholder do template).
- Proteção de rotas autenticadas e redirecionamento para `/login`: escopo próprio, fora do SYS-01.
- Espelhamento para `contaos9999/develop` em `frontend/**`: feito externamente após Build aprovado.
- Possível **LACUNA DE BACKEND** apenas se a RLS de `vinculos_usuarios` não permitir leitura própria.
