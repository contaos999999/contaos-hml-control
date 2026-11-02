# PROMPT 000 / BRAND-01 — PLAN (somente plano, sem build)

HEAD auditado: `3ac193a57efb69e7a9982184a8916c197909dca1` (confere com a base). Branch local do Lovable: `edit/edt-41af0822-…` (gerenciado pela plataforma; sincroniza com `main`). Git limpo.

## Fase A — Auditoria (20 pontos)

1. **Estrutura**: TanStack Start; `src/routes/*` (14 rotas), `src/components/{administracao,auth,contratantes,contratos,dashboard,organizacao,ui}`, sem `index.html`.
2. **Design System**: shadcn em `src/components/ui/*` + tokens em `src/styles.css`.
3. **Tokens** (`src/styles.css` `:root`/`.dark`, oklch): `--foreground` ≈ Navy #0F172A (conforme). `--secondary` ≈ #F1F5F9 (conforme). `--primary` é slate-900 (#1E293B), **não** Azul #0EA5E9. **DIVERGÊNCIA**: `--accent` é slate-100, **não** Teal (o dado externo não confere). Não há token Teal nem Azul.
4. **Layout global**: `src/routes/__root.tsx` sem shell visual; cada tela tem o próprio cabeçalho.
5. **Sidebar**: só existe o primitivo `src/components/ui/sidebar.tsx`, **sem uso** → NÃO APLICÁVEL.
6. **Header**: cabeçalho duplicado com ícone `ShieldCheck` (lucide) + texto "ContaOS" em 9 componentes: `Dashboard.tsx:245`, `ListaContratantes.tsx:85`, `NovoContratante.tsx:95`, `EditarContratante.tsx:502`, `ListaContratos.tsx:145`, `NovoContrato.tsx:545`, `VisaoGeralContrato.tsx:61`, `BaseNormativaContrato.tsx:96`, `AdminUsuarios.tsx:156`.
7. **Login**: `src/routes/login.tsx` função `Marca()` (ShieldCheck + "ContaOS" + tagline) em painel `bg-primary` (escuro). Igual em `esqueci-senha.tsx`, `redefinir-senha.tsx`, `selecionar-organizacao.tsx`. **DIVERGÊNCIA**: as classes `logo-symbol/logo-square/logo-text` **não existem** no repositório.
8. **Favicon**: só `public/favicon.ico` antigo; `__root.tsx:95` aponta para ele.
9. **PWA**: não existe manifest nem service worker → NÃO APLICÁVEL / NÃO SERÁ CRIADO.
10. **Marca exibida**: os 13 arquivos dos itens 6 e 7 (o texto "ContaOS" em mensagens de `admUsuariosRpc.ts`, `OrganizationSelector.tsx` e `ResetPasswordForm.tsx` é conteúdo funcional → não muda).
11. **Modo claro**: tokens `:root`.
12. **Modo escuro**: os tokens `.dark` existem, mas não há interruptor nem classe `.dark` aplicada → não há tela escura em uso; os painéis escuros são `bg-primary` no modo claro.
13. **Responsividade**: o cabeçalho usa `flex min-w-0`, a tagline fica oculta abaixo de `sm`.
14. **public**: `favicon.ico` e `robots.txt`.
15. **Manifest**: inexistente.
16. **Head**: `__root.tsx:81-95` ainda usa title/og "Lovable App"; `lang="en"` (fora de escopo, já registrado).
17. **Tema**: arquivo único `src/styles.css`.
18. **Docs**: `docs/frontend/ARQUITETURA.md` e `docs/frontend/lovable/SYS-01-login.md`.
19. **AGENTS.md**: regras constitucionais; sem regra de marca.
20. **Zero-Drift**: testes em `src/test/*` (361 passando); o diff do BUILD será auditado desde `3ac193a5`.
- **DIVERGÊNCIA — Inter**: `src/styles.css` **não declara Inter** e o `__root` não carrega fonte. Hoje a família é a sans padrão do Tailwind (fontes do sistema).

## 1. Arquivos atuais que serão alterados
- `src/routes/__root.tsx` (favicon links + título/og de marca no root)
- `src/routes/login.tsx`
- `src/routes/esqueci-senha.tsx`
- `src/routes/redefinir-senha.tsx`
- `src/routes/selecionar-organizacao.tsx`
- `src/components/dashboard/Dashboard.tsx`
- `src/components/contratantes/ListaContratantes.tsx`
- `src/components/contratantes/NovoContratante.tsx`
- `src/components/contratantes/EditarContratante.tsx`
- `src/components/contratos/ListaContratos.tsx`
- `src/components/contratos/NovoContrato.tsx`
- `src/components/contratos/VisaoGeralContrato.tsx`
- `src/components/contratos/BaseNormativaContrato.tsx`
- `src/components/administracao/usuarios/AdminUsuarios.tsx`
- `public/favicon.ico` (substituído pelo oficial, byte a byte)
- `src/styles.css`: **somente se** a Decisão D1 for aprovada (Inter)

Em cada componente, a única mudança é trocar o bloco `<span><ShieldCheck/></span><p>ContaOS</p>` pelo componente de marca. A tagline, o nome da organização e o restante ficam iguais.

## 2. Arquivos novos
- `src/assets/brand/ContaOS_Logo_Horizontal.svg`
- `src/assets/brand/ContaOS_Logo_Horizontal_Fundo_Escuro.svg`
- `src/assets/brand/ContaOS_Simbolo_Color.svg`
- `src/assets/brand/ContaOS_Simbolo_Branco.svg`
- `public/favicon.svg`, `public/favicon-16x16.png`, `public/favicon-32x32.png`, `public/favicon-48x48.png`
- `src/components/brand/ContaOSMarca.tsx` (`<img>` dos SVGs oficiais; props `variante: "clara" | "escura"` e `forma: "horizontal" | "simbolo"`)
- `src/test/brand.test.tsx`
- `docs/frontend/lovable/BRAND-01.md`

Os SVGs ficam no repositório, não no CDN, para ficarem versionados no GitHub byte a byte. Os demais 40+ arquivos do pacote (PNGs, PWA, mono, manual) **não** entram, porque não há superfície que os use.

## 3. Não será alterado
Supabase, tabelas, migrations, RLS, grants, Edge Functions, RPCs, Auth, cliente Supabase (`src/integrations/**`, inclusive `types.ts`), `.env`, `package.json`/dependências, rotas (nenhum arquivo criado ou renomeado em `src/routes`, `routeTree.gen.ts` intacto), autorização/RBAC, regras de negócio, estados oficiais, cálculos, integrações, dados, `src/components/ui/**`, `AGENTS.md`, testes existentes (só recebem adições).

## 4. Mapeamento da marca
| Superfície | Asset |
|---|---|
| Painel escuro de login/esqueci/redefinir/selecionar (≥sm) | Logo_Horizontal_Fundo_Escuro.svg |
| Cabeçalhos escuros das 9 telas, ≥sm | Logo_Horizontal_Fundo_Escuro.svg |
| Mesmos cabeçalhos em 390 px | Simbolo_Branco.svg + texto "ContaOS" existente |
| Superfície clara (se houver ao renderizar) | Logo_Horizontal.svg / Simbolo_Color.svg |
| Favicon | favicon.svg/.ico/16/32/48 oficiais |
| Vertical, Tagline, Mono (branco/navy/preto) | NÃO APLICÁVEL / NÃO SERÁ USADO |
| PWA/manifest | NÃO APLICÁVEL / NÃO SERÁ CRIADO |
| Sidebar expandida/recolhida | NÃO APLICÁVEL |
| Boot/loading, erros globais (sem marca hoje) | NÃO APLICÁVEL |

Ponto a confirmar ao abrir os cabeçalhos: se `bg-primary` for escuro em todas as 9 telas, usa-se só a variante escura.

## 5. Design System
Reutilizar: `--foreground` (Navy) e `--secondary` (Superfície). **Nenhum token novo**: as cores oficiais Azul e Teal já estão dentro dos SVGs. `--primary` e `--accent` **não mudam**: mudar `--primary` para #0EA5E9 alteraria todos os botões, e o texto branco sobre ele teria contraste de ~2,8:1, reprovando WCAG AA. Não haverá paleta paralela nem import do `contaos-brand-tokens.css`.

## 6. Pontos de aplicação
Login e as outras 3 telas de acesso, os 9 cabeçalhos, mobile (símbolo), favicon e head (`title` padrão "ContaOS" e `og:site_name`; os títulos por rota não mudam). PWA, sidebar e boot ficam N/A.

## 7. Responsividade
Altura fixa do logo de 32 px (`h-8 w-auto`), `max-w-full`, `shrink-0`. Abaixo de `sm`, troca para o símbolo de 32 px. Playwright em 1440/1280/768/390 em `/login` e `/contratos`: sem overflow (`scrollWidth ≤ clientWidth`), H1 e ações nas mesmas posições, proporção do SVG preservada (relação largura/altura natural = renderizada).

## 8. Acessibilidade
O logo é a identificação da marca: `alt="ContaOS"`. Onde o texto "ContaOS" continuar visível ao lado, o símbolo recebe `alt=""` para não ser lido duas vezes. Os SVGs entram via `<img>`, sem `<svg>` inline com IDs duplicados. O logo não é clicável (hoje não é), então não há foco novo. A variante escura é usada sobre `bg-primary` para garantir contraste. Nada funcional depende só de cor.

## 9. GitHub
Lovable em branch gerenciada `edit/…`, sincronizada com `main` (não será criada branch). Commits automáticos do Lovable. Os assets SVG/PNG/ICO são versionados no repositório. Validações: testes focados, suíte, `npx tsc --noEmit`, build e browser. O diff desde `3ac193a5` deve listar só os arquivos das seções 1 e 2.

## 10. Riscos e mitigação
- **Regressão visual no cabeçalho**: componente único e altura fixa, validado em 4 larguras.
- **Duplicação**: os 13 blocos passam a usar um único componente.
- **Cache do favicon**: links com `type`/`sizes` explícitos.
- **Drift de cor**: nenhum token alterado.
- **Inter**: alteraria métricas globais → decisão D1.
- **Asset não oficial**: o BUILD confere SHA-256 contra o `MANIFESTO_ARQUIVOS.txt`.

## 11. Testes (RED antes do BUILD)
`src/test/brand.test.tsx`:
- `ContaOSMarca` renderiza o asset correto por variante/forma, com `alt` correto;
- login, as outras 3 telas de acesso e as 9 telas renderizam a marca e não renderizam mais `ShieldCheck` no cabeçalho;
- o head do root inclui `favicon.svg` e `favicon.ico`, sem "Lovable App";
- não há `manifest` no head.

Os 361 testes atuais continuam sem alteração.

## 12. Gates N/A (dos 72 finais)
- Sidebar expandida, sidebar recolhida, símbolo na sidebar;
- PWA: manifest, service worker, ícones 192/512, maskable, theme_color, instalação;
- modo escuro alternável (tokens `.dark` sem ativação);
- splash/boot com marca;
- erro global com marca;
- logo vertical, tagline, monocromáticas, impressão.

Esses gates ficam N/A por inexistência da superfície. Nenhuma funcionalidade nova será criada para atendê-los.

## Decisões / bloqueios antes do BUILD
- **D1 — Inter (CONFLITO)**: a marca exige Inter, mas o repositório não usa Inter. Opções:
  - (a) carregar Inter via `<link>` no `__root` e definir `--font-sans` em `styles.css`, o que muda as métricas de texto em todo o app;
  - (b) não alterar a fonte global; o wordmark já vem desenhado no SVG.
  
  Recomendação: (b).
- **D2 — LACUNA**: os documentos `19_IDENTIDADE_VISUAL_OFICIAL_BRAND_1_0.md` e `20_PROMPT_000_BRAND_01.md` ficam em `contaos9999/develop` e **não estão neste repositório**, então não pude lê-los, como a regra exige.
- **D3 — LACUNA**: os assets oficiais ainda não estão no repositório; devem chegar byte a byte, junto com o `MANIFESTO_ARQUIVOS.txt` (SHA-256).
- **D4 — Premissas externas divergentes** (Inter, accent Teal, classes `logo-*`): registradas acima, sem ação.

## Portão
**PLAN: NÃO APROVÁVEL** enquanto D1 (decisão), D2 (leitura dos documentos 19/20) e D3 (assets) estiverem abertos. O escopo técnico acima não muda backend, rotas, regras, DS nem dependências. Resolvidos D1–D3 sem mudança de escopo, o plano passa a **APROVÁVEL**.
