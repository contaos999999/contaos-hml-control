# SYS-01 — Login (PROMPT 16) — Evidência de Build

- Data: 02/11/2026 · Ambiente: HML (`gklhhhyosgasnyoxlrui`)
- Rota: `/login` (pública)
- Plano aprovado: `.lovable/plan/sys-01-login-prompt-16-login-público-2026-11-02.md`

## Arquivos alterados
Novos:
- `src/routes/login.tsx`
- `src/components/auth/LoginForm.tsx`
- `src/lib/auth/resolverDestinoPosLogin.ts`
- `src/test/resolverDestinoPosLogin.test.ts`
- `src/test/login.test.tsx`
- `docs/frontend/lovable/SYS-01-login.md`

Alterado: `AGENTS.md` (1 regra de arquitetura de pós-login).
Regenerado automaticamente: `src/routeTree.gen.ts`.
Não tocados: `src/routes/index.tsx`, `__root.tsx`, `start.ts`, `src/integrations/supabase/**`, `package.json`, `styles.css`, schema, migrations, RLS, Auth config, Edge Functions, Storage.

## Operações Supabase
- `auth.signInWithPassword` (única operação de autenticação).
- `auth.getSession` (sessão já existente), `auth.getUser`, `auth.signOut` (botão Sair no estado sem acesso).
- `vinculos_usuarios` select `id, id_organizacao, perfil` com `id_usuario = usuário logado` e `ativo = true`.
  - Policy verificada (somente leitura): `vinculos_select` para `authenticated` — `id_usuario = auth.uid()` OR perfil administrador/auditor na organização. Leitura própria existe → sem LACUNA DE BACKEND.
  - O filtro por `id_usuario` só seleciona os vínculos do próprio usuário (administradores enxergam vínculos de terceiros). A autorização continua na RLS.

## Testes
| Teste | Resultado |
|---|---|
| Unidade: 0 / 1 / vários vínculos → sem acesso / `/` / `/selecionar-organizacao` | PASS |
| Rota `/login` existe | PASS |
| Labels visíveis, `type=email`/`password`, botão "Mostrar senha" | PASS |
| Validação sem chamar backend | PASS |
| Entrar desabilitado durante envio | PASS |
| Credencial inválida → mensagem genérica | PASS |
| Erro de rede | PASS |
| Sem vínculos → acesso não disponível | PASS |
| Playwright 1440/1280/768/390 sem rolagem horizontal | PASS |
| Playwright: Tab foca e-mail; Enter envia; credencial errada no HML real → "E-mail ou senha inválidos." | PASS |
| Scan de secrets em `src` (sem service_role/secret no frontend) | PASS |
| axe-core automatizado | PENDENTE (não há axe instalado; `package.json` fora do escopo) |
| Happy path com usuário HML real | PENDENTE (sem credencial de teste fornecida) |

## Dependências futuras
- DEPENDÊNCIA DE FRONTEND: SYS-04 `/selecionar-organizacao`.
- DEPENDÊNCIA DE FRONTEND: SYS-05 Dashboard em `/` (hoje placeholder).
- Navegação pós-login usa URL direta até que essas rotas existam.
- Proteção de rotas autenticadas: escopo próprio.
- Espelhamento em `contaos9999/develop` `frontend/**`: externo.
- Comparação visual com protótipo MagicPath: externa.
