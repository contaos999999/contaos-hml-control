# SYS-01 — Login (`/login`, público)

## Objetivo
Tela de entrada do ContaOS: e-mail + senha via Supabase Auth (`signInWithPassword`). Após sucesso, ler os vínculos do usuário (sob RLS) e direcionar para seleção de organização ou dashboard.

## Pendências antes do Build (bloqueantes)
1. **Protótipo MagicPath** não está no projeto. Preciso do link ou de uma imagem para seguir a referência visual. Sem ele, aplico só a direção Executive Command Center + Audit Workspace.
2. **Rotas de destino não existem** (seleção de organização e dashboard). Proposta: no SYS-01 o redirecionamento aponta para `/selecao-organizacao` e `/dashboard`, criadas como páginas mínimas "em construção" sob área autenticada. Alternativa: aguardar os prompts dessas telas. Preciso da sua escolha.
3. **RLS de `vinculos_usuarios`**: existe a tabela, mas não confirmei se o usuário logado consegue ler os próprios vínculos. Primeiro passo do Build: consulta somente leitura das policies. Se não houver leitura própria → **LACUNA DE BACKEND**, e a tela para no "login OK, sem destino".

## 1. Arquivos
- `src/routes/login.tsx` — novo: rota pública, `head()` em PT-BR.
- `src/components/auth/LoginForm.tsx` — novo: formulário, estados e mensagens.
- `src/lib/auth/resolverDestinoPosLogin.ts` — novo: decide o destino a partir dos vínculos devolvidos pelo backend (sem calcular status crítico).
- `src/routes/index.tsx` — redirecionar `/` para `/login` (hoje é placeholder).
- `src/test/login.test.tsx` e `src/test/resolverDestinoPosLogin.test.ts` — novos.
- `frontend/**` (espelho) e `docs/frontend/lovable/SYS-01-login.md` (prompt, plano, arquivos, testes, PASS/FAIL, evidências).
- Não tocar: cliente Supabase, `__root.tsx` (layout global), `start.ts`, Auth config, schema, RLS, Edge Functions, Storage.

## 2. Backend usado (somente existente)
- `supabase.auth.signInWithPassword({ email, password })`.
- `supabase.auth.getUser()` após login.
- `select id, id_organizacao, perfil, ativo from vinculos_usuarios where ativo = true` (Data API, RLS é a autoridade; sem filtro de segurança no React).
- Nenhuma tabela, RPC ou Edge Function nova.

## 3. Componentes
shadcn existentes: `Card`, `Label`, `Input`, `Button`, `Alert`, `Tooltip`/`Popover` (mostrar/ocultar senha), ícones lucide. Sem novas variantes globais.

## 4. Estados
- **Inicial**: campos vazios, Entrar habilitado.
- **Validação**: e-mail inválido ou senha vazia → erro sob o campo (`aria-describedby`), foco no primeiro campo inválido.
- **Processing**: Entrar desabilitado + "Entrando…" com spinner; campos somente leitura.
- **Erro de credencial**: mensagem única "E-mail ou senha inválidos." (não revela se o usuário existe).
- **Erro de rede/servidor**: "Não foi possível conectar. Tente novamente." + botão Tentar novamente.
- **Carregando vínculos**: "Carregando seus acessos…".
- **Denied / empty**: sem vínculo ativo → "Seu usuário não possui acesso ativo a nenhuma organização. Procure o administrador." + Sair.
- **Success**: 1 vínculo → `/dashboard`; vários → `/selecao-organizacao`.
- **Já logado** ao abrir `/login` → mesmo fluxo de destino.

## 5. Responsividade
- 1440/1280: painel institucional à esquerda (identidade ContaOS) + cartão de login à direita.
- 768: painel institucional reduzido a faixa superior; cartão centralizado.
- 390: só o cartão, largura total com margem, alvos de toque ≥ 44 px, sem rolagem horizontal.

## 6. Acessibilidade
- Labels visíveis e associados; `autocomplete="email"` / `"current-password"`.
- Ordem de tabulação: e-mail → senha → mostrar senha → Entrar; Enter envia.
- Foco visível; erros com `role="alert"`; processing com `aria-busy` e `aria-live="polite"`.
- Status nunca só por cor (ícone + texto).
- Tooltip apenas no botão mostrar/ocultar senha (hover + foco; toque no mobile). Nunca substitui label ou erro.
- PT-BR em tudo; sessão gerida só pelo cliente Supabase (nenhum token próprio em localStorage).

## 7. Testes
- Vitest: validação, botão desabilitado no envio, mensagem genérica de erro, regra de destino (0/1/vários vínculos), rota `/login` existe.
- Playwright: happy path com usuário HML, credencial errada, sem vínculo, teclado, 1440/1280/768/390 com screenshots.
- Acessibilidade (axe), scan de secrets no bundle, Zero-Drift (nenhum arquivo fora da lista alterado).

## Detalhes técnicos
- Rota pública com SSR padrão; leitura de sessão só no cliente.
- Destino validado como caminho interno (sem redirecionamento externo).
