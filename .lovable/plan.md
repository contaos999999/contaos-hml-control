# PROMPT 17 — SYS-02 Esqueci a senha (PLAN)

Ambiente: HML `gklhhhyosgasnyoxlrui`. Nenhuma alteração de backend, Auth config, RLS, schema, Edge Function, Storage ou package.json.

## 1. Backend/Auth encontrado

- Cliente existente: `src/integrations/supabase/client.ts` (chave publicável apenas). Não será alterado.
- Operação única: `supabase.auth.resetPasswordForEmail(email: string, options?: { redirectTo?: string; captchaToken?: string })` → `Promise<{ data: {} | null; error: AuthError | null }>` (auth-js instalado).
- Nenhuma tabela, RPC ou endpoint próprio é usado. Nenhum dado é lido do banco.
- `supabase/config.toml` contém só `project_id`; não há seção `[auth]` local. A configuração de Auth HML (Site URL, Redirect URLs, rate limit de e-mail, SMTP) fica no painel Supabase e **não é legível pelo sandbox**.

## 2. redirectTo e allowlist

- Valor planejado: `redirectTo: \`${window.location.origin}/redefinir-senha\``.
- Comportamento do Supabase: se a URL não estiver na allowlist (Redirect URLs), a chamada **não falha** — o link do e-mail cai na Site URL. Portanto a UI não consegue detectar a lacuna; só a abertura real do e-mail confirma.
- **LACUNA DE AUTH/REDIRECT (pendente de verificação, não bloqueia o SYS-02):** confirmar no painel HML (Authentication → URL Configuration) se constam a origem do preview e `/redefinir-senha`. Não alterarei a configuração. Se ausente, registro a lacuna em docs e o SYS-02 segue (o pedido de envio funciona); o destino correto depende da allowlist + SYS-03.
- `/redefinir-senha` (SYS-03) não será criada; é DEPENDÊNCIA DE FRONTEND.

## 3. Arquivos exatos

Novos:
- `src/routes/esqueci-senha.tsx` — rota pública com head() próprio (título/descrição/og PT-BR). Reproduz a linguagem visual aprovada do SYS-01 (painel institucional escuro em desktop, faixa compacta em 768/390, cartão à direita) com markup próprio e mínimo, usando apenas tokens existentes. Nada é importado nem movido de `login.tsx`.
- `src/components/auth/ForgotPasswordForm.tsx` — formulário e estados.
- `src/test/forgotPassword.test.tsx` — testes unitários SYS-02.

Alterado (mínimo):
- `src/components/auth/LoginForm.tsx` — apenas um `<Link to="/esqueci-senha">Esqueci minha senha</Link>` junto ao campo Senha. Nenhuma outra linha alterada.
- `src/routeTree.gen.ts` — regenerado automaticamente.

Não serão tocados: `src/routes/login.tsx`, AGENTS.md, `__root.tsx`, `index.tsx`, `start.ts`, `src/integrations/**`, `styles.css`, package.json, supabase/**, docs/**. Evidências e PASS/FAIL serão entregues no chat para versionamento no GitHub canônico pelo orquestrador; nenhuma documentação canônica será criada no sandbox.

## 4. Estados e copy (PT-BR)

| Estado | Comportamento | Copy |
|---|---|---|
| inicial | campo E-mail com label visível, botão "Enviar link" | Título único h1 "Recuperar acesso"; apoio: "Informe o e-mail da sua conta. Enviaremos um link para redefinir a senha." |
| e-mail inválido | validação local, Supabase não é chamado, `aria-invalid` + erro ligado por `aria-describedby`, foco volta ao campo | "Informe um e-mail válido." |
| enviando | botão desabilitado + spinner, `aria-busy`, aria-live | "Enviando…" |
| sucesso (resposta aceita) | formulário substituído por painel neutro com ícone + texto (não só cor); campo não reexibe e-mail completo | "Se existir uma conta vinculada a este e-mail, você receberá as instruções para redefinir sua senha." + "Verifique também a caixa de spam." |
| rate limit (HTTP 429 / `over_email_send_rate_limit`) | sem cooldown fixo no código. Se a resposta trouxer prazo (header `Retry-After` ou tempo informado no erro do Auth), exibe esse tempo e mantém o botão desabilitado até ele; se não trouxer, exibe só a copy segura e o botão fica disponível para nova tentativa manual. Nunca há reenvio automático | "Muitas solicitações em pouco tempo. Aguarde alguns instantes e tente novamente." (+ "Tente novamente em N s." apenas quando o backend informar) |
| erro de rede/serviço | mensagem genérica, sem detalhe técnico; reenvio só por clique | "Não foi possível enviar a solicitação agora. Verifique sua conexão e tente novamente." |

- Ação "Voltar ao login" (Link para `/login`) visível em todos os estados.
- Tooltip (componente `ui/tooltip` já usado no SYS-01), por hover e foco; no toque abre por clique: ícone de informação ao lado do título do painel de sucesso explicando "Por segurança, não informamos se o e-mail possui cadastro." Complementa, não substitui o texto.
- Após sucesso, botão "Enviar novamente" volta ao formulário (mesmo controle de rate limit).

## 5. Segurança e anti-enumeração

- Qualquer resposta sem erro → mesma tela de sucesso; erros que não sejam 429/rede (ex.: usuário inexistente, se houver) também são tratados como sucesso neutro, para não revelar conta.
- Nada salvo em localStorage/sessionStorage; e-mail mantido só em estado React; sem console.log de e-mail/resposta.
- Nenhum token de recuperação manipulado nesta tela.
- Somente chave publicável na request.

## 6. Testes

Unitários (vitest, Supabase mockado):
1. e-mail inválido não chama `resetPasswordForEmail`;
2. duplo clique durante envio gera 1 chamada;
3. sucesso mostra copy neutra exata e passa `redirectTo` terminando em `/redefinir-senha`;
4. erro de "usuário inexistente" mostra a mesma copy de sucesso;
5. 429 sem prazo mostra copy segura e permite nova tentativa manual; 429 com prazo informado bloqueia até o prazo; erro de rede mostra mensagem genérica; sem nova chamada automática.

Playwright/HML:
6. `/esqueci-senha` abre (200), h1 único;
7. Login → "Esqueci minha senha" → "Voltar ao login";
8. pedido real para `edivanpablo99@gmail.com` e para e-mail válido inexistente (Gmail aleatório): texto visível idêntico; respeitar limite (no máx. 2 pedidos; se 429, registrar como comportamento esperado);
9. network: só `/auth/v1/recover` com chave publicável, sem secret/service_role;
10. 1440/1280/768/390 sem rolagem horizontal, campo/botão/voltar visíveis;
11. teclado (Tab: e-mail → enviar → voltar), labels, tooltip por foco/hover;
12. console sem erro de aplicação; security scan sem novo Critical; typecheck e vitest SYS-01 continuam PASS.

## 7. Lacunas

- LACUNA DE AUTH/REDIRECT: allowlist de `/redefinir-senha` não verificável pelo sandbox — requer conferência no painel HML pelo responsável.
- Rate limit de e-mail e SMTP do HML (padrão Supabase é baixo) podem limitar o teste 8; não serão alterados.
- DEPENDÊNCIA DE FRONTEND: SYS-03 `/redefinir-senha`.
- Risco registrado: o visual do SYS-02 replica o SYS-01 por markup próprio; ajustes futuros de marca precisarão ser feitos nas duas telas (sem drift funcional).

## 8. Confirmação

Nenhuma migration, tabela, RLS, RPC, Edge Function, Storage, endpoint próprio, secret ou alteração de Auth config será criada ou alterada neste prompt.
