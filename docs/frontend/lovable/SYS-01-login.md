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

Alterado no Build 1: `AGENTS.md` (bloco `## Decisões de frontend`) — **revertido na Correção 1**.
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

---

## Correção 1 — fidelidade visual MagicPath (02/11/2026)
Referência: protótipo MagicPath `ContaOS — Login`, componente `467916892707889152` (validação visual final é externa).

### O que mudou
- `AGENTS.md`: bloco `## Decisões de frontend` removido; arquivo voltou ao estado anterior (2.422 bytes), nenhuma outra linha tocada.
- `src/routes/login.tsx`: só apresentação. Painel escuro com grid sutil e glows desfocados; marca `ContaOS` + `CONTROLE • AUDITORIA • CONFORMIDADE`; badge `Ambiente seguro de homologação`; headline, texto institucional, 3 cartões (Rastreável / Seguro / Explicável); rodapé `ContaOS • Ambiente HML` / `Segurança e rastreabilidade por padrão`; área direita `ACESSO AO CONTAOS`, `Bem-vindo de volta`, texto explicativo e cartão `Acesso protegido`. Sem link de recuperação de senha (SYS-02).
- `src/components/auth/LoginForm.tsx`: tooltip `Mostrar senha` / `Ocultar senha` (componente `ui/tooltip` existente) no botão do olho, mantendo `aria-label` e `aria-pressed`. Lógica funcional inalterada.
- Responsividade: 1280/1440 painel completo; 768 e 390 faixa superior compacta (marca + badge), formulário e `Acesso protegido` sempre visíveis.

### Testes repetidos (estado final)
| Teste | Resultado |
|---|---|
| Typecheck completo (`tsgo --noEmit`) | PASS |
| Vitest (3 arquivos, 12 testes) | PASS |
| Scan de secrets em `src` | PASS |
| Playwright 1440/1280/768/390 sem rolagem horizontal; formulário e `Acesso protegido` visíveis | PASS |
| Teclado: Tab → e-mail; Tab×3 → botão mostrar senha; Enter alterna (`aria-pressed=true`) | PASS |
| Tooltip por foco ("Mostrar senha") e por hover ("Ocultar senha") | PASS |
| Credencial inválida no HML real → "E-mail ou senha inválidos." | PASS |
| axe-core automatizado | PENDENTE (pacote não instalado; `package.json` fora do escopo) |
| Happy path com usuário HML real | PENDENTE (sem credencial de teste) |
