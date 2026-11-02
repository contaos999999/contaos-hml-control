# PROMPT 18 — SYS-03 Redefinir senha (PLAN)

Ambiente: HML `gklhhhyosgasnyoxlrui`. Nenhuma alteração de backend, Auth config, RLS, schema, Edge Function, Storage, cliente Supabase ou package.json.

## 1. Backend/Auth usado (nenhuma tabela, RPC ou Edge Function)

- Cliente existente `src/integrations/supabase/client.ts` (supabase-js/auth-js 2.118.0, chave publicável). Sem `flowType` explícito → fluxo implícito; `detectSessionInUrl` padrão = true.
- Chegada pelo link do e-mail (SYS-02 envia `redirectTo = origin/redefinir-senha`): o SDK lê o fragmento `#access_token…&type=recovery` (ou `#error=…&error_code=otp_expired`) e emite `onAuthStateChange("PASSWORD_RECOVERY")`.
- Operações: `supabase.auth.onAuthStateChange`, `supabase.auth.getSession` (só para saber se há sessão de recuperação), `supabase.auth.updateUser({ password })`, `supabase.auth.signOut()` após sucesso.
- Se o link vier com `?code=` (PKCE), o SDK também troca automaticamente; não haverá chamada manual a `exchangeCodeForSession`.
- Política de senha (tamanho mínimo, caracteres, senha vazada) é do Auth HML; a UI faz só checagem local mínima de UX (não vazia, mínimo 8, confirmação igual) e exibe o erro do backend `weak_password` de forma traduzida. A autoridade é o backend.
- Sem LACUNA DE BACKEND: `updateUser` existe. Pendência já registrada: allowlist de `/redefinir-senha` em Redirect URLs (não verificável pelo sandbox).

## 2. Arquivos exatos

Novos:
- `src/routes/redefinir-senha.tsx` — rota pública, head() próprio PT-BR, mesmo layout visual do SYS-02 (painel escuro desktop, faixa compacta 768/390, cartão à direita), markup próprio, só tokens existentes.
- `src/components/auth/ResetPasswordForm.tsx` — detecção do link, formulário e estados.
- `src/test/resetPassword.test.tsx` — testes unitários.

Gerado automaticamente: `src/routeTree.gen.ts`.

Não tocados: `login.tsx`, `LoginForm.tsx`, `esqueci-senha.tsx`, `ForgotPasswordForm.tsx`, `__root.tsx`, `index.tsx`, `start.ts`, `src/integrations/**`, `styles.css`, package.json, supabase/**, AGENTS.md.

## 3. Componentes

- `ResetPasswordForm`: campos "Nova senha" e "Confirmar nova senha" (`ui/input`, `ui/label`), botão mostrar/ocultar com `aria-label`/`aria-pressed` + tooltip (`ui/tooltip`, hover/foco; toque abre de forma idempotente como no SYS-02), `ui/button`, `ui/alert`.
- Tooltip informativo junto a "Nova senha": "A senha deve seguir a política de segurança do ContaOS. O sistema valida no envio." Complementa a ajuda visível, não a substitui.
- Links "Voltar ao login" (`/login`) e "Solicitar novo link" (`/esqueci-senha`).

## 4. Estados e copy (PT-BR)

| Estado | Comportamento | Copy |
|---|---|---|
| verificando (loading) | aguarda evento/sessão até ~3 s; spinner + aria-live | "Validando link de redefinição…" |
| link inválido/expirado/ausente (denied) | sem formulário; link para solicitar novo | "Este link de redefinição é inválido ou expirou. Solicite um novo link." |
| formulário | h1 "Definir nova senha" | "Crie uma nova senha para sua conta." |
| validação local | sem chamada; `aria-invalid` + `aria-describedby`; foco no 1º campo inválido | "Informe a nova senha." / "A senha deve ter pelo menos 8 caracteres." / "As senhas não conferem." |
| processing | botão desabilitado + spinner, `aria-busy`, bloqueio de duplo envio | "Salvando…" |
| sucesso | `signOut` local, painel com ícone + texto, botão "Ir para o login" | "Senha redefinida com sucesso. Entre novamente com a nova senha." |
| senha fraca (`weak_password`) | mantém formulário | "A senha não atende à política de segurança. Escolha outra senha." |
| mesma senha (`same_password`) | mantém formulário | "A nova senha deve ser diferente da anterior." |
| sessão expirada (401/`session_not_found`) | vai para estado denied | copy do link inválido |
| rate limit 429 | sem retry automático | "Muitas tentativas. Aguarde alguns instantes e tente novamente." |
| erro rede/inesperado | genérico, sem detalhe técnico | "Não foi possível redefinir a senha agora. Tente novamente em instantes." |

"Empty" não se aplica (não há listagem). Nenhum status crítico calculado localmente.

## 5. Segurança

- Tokens nunca lidos, exibidos, logados ou copiados pelo código; o SDK consome o fragmento e o limpa da URL.
- Sem console.log, sem storage próprio; senha só em estado React, limpa após sucesso/erro.
- Após sucesso, `signOut` para não deixar sessão de recuperação ativa; sem redirecionar ao dashboard.
- Somente chave publicável.

## 6. Responsividade

- 1440/1280: painel institucional à esquerda (48%), cartão à direita.
- 768/390: faixa compacta superior com marca + badge, cartão em largura total (max-w-md), sem rolagem horizontal, alvos de toque ≥ 44 px.

## 7. Acessibilidade

- h1 único; labels visíveis associadas; ordem de Tab: nova senha → mostrar → confirmar → mostrar → salvar → links.
- Foco visível; erros com `role="alert"`; região aria-live para verificando/salvando/sucesso; status nunca só por cor (ícone + texto); `lang="pt-BR"`.

## 8. Testes

Unitários (vitest, Supabase mockado):
1. sem evento de recuperação/sessão → estado link inválido, sem formulário;
2. hash com `error_code=otp_expired` → estado link inválido;
3. evento `PASSWORD_RECOVERY` → formulário;
4. validações locais não chamam `updateUser`;
5. duplo clique → 1 chamada;
6. sucesso → `updateUser({password})`, `signOut` chamado, copy de sucesso;
7. `weak_password`, `same_password`, 429, 401, erro de rede → copy correta, sem retry automático;
8. tooltip abre por foco e por toque (idempotente).
9. Regressão: vitest SYS-01/SYS-02 continua PASS.

Playwright/HML:
10. `/redefinir-senha` abre 200 sem token → estado link inválido; link "Solicitar novo link" leva a `/esqueci-senha`;
11. `/redefinir-senha#error=access_denied&error_code=otp_expired` → link inválido;
12. fluxo real fim a fim (BLOQUEADO até haver link real): pedir recuperação para `edivanpablo99@gmail.com`, abrir o link do e-mail (depende do usuário colar o link ou da allowlist), definir nova senha gravada em `/tmp` (perm 600, nunca impressa), confirmar login com a nova senha;
13. network: só `/auth/v1/user` (PUT) e `/auth/v1/logout`, chave publicável;
14. 1440/1280/768/390 sem rolagem horizontal; teclado/foco/tooltip; console limpo; typecheck; security scan sem novo Critical.

## 9. Lacunas / dependências

- Allowlist de Redirect URLs do HML não verificável pelo sandbox (já registrada no SYS-02).
- Teste 12 depende de acesso ao e-mail real; sem ele fica BLOQUEADO, não PASS por inferência.
- Política de senha do HML não legível pelo sandbox; a UI confia na resposta do backend.

## 10. Confirmação

Nenhuma migration, tabela, RLS, RPC, Edge Function, Storage, endpoint próprio, secret ou alteração de Auth/cliente Supabase será criada ou alterada.
