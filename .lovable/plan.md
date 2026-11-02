# PROMPT 000 / BRAND-01 — PLAN revisado (somente plano, sem build)

Base auditada: HEAD `3ac193a57efb69e7a9982184a8916c197909dca1`. Branch do Lovable: `edit/edt-41af0822-…`, gerenciada pela plataforma e sincronizada com `main`. Git limpo.

Fontes canônicas lidas, do pacote `ContaOS_4_1_BRAND_FINAL.zip` enviado no chat:
- `05_FRONTEND_LOVABLE/ANEXO_BRAND_01_IDENTIDADE_VISUAL_OFICIAL.md`
- `06_PROMPTS_COPIAR_COLAR/PROMPT_000_BRAND_01_IDENTIDADE_VISUAL_OFICIAL.md` (integral)
- `07_ZERO_DRIFT/ANEXO_ZERO_DRIFT_BRAND_01.md`
- `12_IDENTIDADE_VISUAL_OFICIAL/ContaOS_Marca_Oficial_v1.0/`: 50 arquivos, README_Lovable, tokens CSS e o Manual em PDF

Ponto do Manual que guia o plano: **logo horizontal com no mínimo 120 px de largura; abaixo disso, usar o símbolo. Fallback institucional da fonte: Arial.**

## Decisões resolvidas
- **D1 — Fonte**: a fonte global **não será alterada**. Não haverá Inter global nem mudança em `src/styles.css`. O nome "ContaOS" dentro dos SVGs oficiais já declara `font-family="Inter,Arial,sans-serif"`; sem Inter instalada, ele aparece em Arial, que é o fallback que o Manual autoriza. Assim não há drift de métricas.
- **D2 — Documentos canônicos**: lidos no pacote enviado. Os nomes dos arquivos diferem de "19_/20_", mas o conteúdo é o do BRAND-01.
- **D3 — Assets**: só os arquivos oficiais, copiados **byte a byte** do pacote. No BUILD, cada um é conferido por SHA-256 contra `09_AUDITORIA_E_FONTES/MANIFEST_SHA256_v4_1_BRAND_v1_0.json`. Nada é recriado, redesenhado, redimensionado ou otimizado.

## Fase A — Auditoria (20 pontos)
1. **Estrutura**: TanStack Start, 14 arquivos em `src/routes`, componentes em `src/components/*`, sem `index.html`.
2. **Design System**: shadcn em `src/components/ui/*`, com tokens em `src/styles.css`.
3. **Tokens** (oklch):
   - `--foreground` ≈ Navy #0F172A;
   - `--secondary` ≈ Superfície #F1F5F9;
   - `--primary` = slate-900, não Azul;
   - `--accent` = slate-100, **não Teal** (a premissa externa não confere).
4. **Layout global**: `src/routes/__root.tsx`, sem shell visual.
5. **Sidebar**: o primitivo `src/components/ui/sidebar.tsx` existe, mas não é usado.
6. **Header**: a marca provisória (ícone `ShieldCheck` + texto "ContaOS") aparece em 9 componentes, sobre `bg-primary` (escuro):
   - `src/components/dashboard/Dashboard.tsx:245`
   - `src/components/contratantes/ListaContratantes.tsx:85`
   - `src/components/contratantes/NovoContratante.tsx:95`
   - `src/components/contratantes/EditarContratante.tsx:502`
   - `src/components/contratos/ListaContratos.tsx:145`
   - `src/components/contratos/NovoContrato.tsx:545`
   - `src/components/contratos/VisaoGeralContrato.tsx:61`
   - `src/components/contratos/BaseNormativaContrato.tsx:96`
   - `src/components/administracao/usuarios/AdminUsuarios.tsx:156`
7. **Login e telas de acesso**: o bloco `Marca()` provisório aparece no painel escuro de `src/routes/login.tsx`, `esqueci-senha.tsx`, `redefinir-senha.tsx` e `selecionar-organizacao.tsx`. As classes `logo-symbol/logo-square/logo-text` **não existem**.
8. **Favicon**: só `public/favicon.ico` antigo, declarado em `__root.tsx:95`.
9. **PWA**: não há manifest nem service worker.
10. **Onde a marca aparece**: os 13 arquivos dos itens 6 e 7. O texto "ContaOS" dentro de mensagens é conteúdo funcional e não muda.
11. **Modo claro**: tokens em `:root`.
12. **Modo escuro**: os tokens `.dark` existem, mas não há classe `.dark` ativa nem botão para alternar.
13. **Responsividade**: os cabeçalhos usam `flex min-w-0`; a tagline fica oculta abaixo de `sm`.
14. **Pasta public**: `favicon.ico` e `robots.txt`.
15. **Manifest**: inexistente.
16. **Head**: o root ainda usa title/og "Lovable App"; `lang="en"` fica fora de escopo e já está registrado.
17. **Tema**: arquivo único, `src/styles.css`.
18. **Docs**: `docs/frontend/ARQUITETURA.md` e `docs/frontend/lovable/SYS-01-login.md`.
19. **AGENTS.md**: não tem regra de marca e não será tocado.
20. **Zero-Drift**: 361 testes em `src/test/*`; o diff será auditado desde `3ac193a5`.

## 1. Arquivos atuais que serão alterados
- `src/routes/__root.tsx`: links de favicon e o title/og padrão "ContaOS"
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
- `public/favicon.ico`: substituído pelo `03_Favicon/favicon.ico` oficial

Mudança em cada componente: só o bloco `ShieldCheck` + `<p>ContaOS</p>` vira `<ContaOSMarca/>`. A tagline, o nome da organização e o restante ficam iguais. O import de `ShieldCheck` sai apenas onde ficar sem uso.

## 2. Arquivos novos
Caminhos de `public/brand/` conforme o README oficial:
- `public/brand/ContaOS_Logo_Horizontal_Fundo_Escuro.svg`
- `public/brand/ContaOS_Simbolo_Branco.svg`
- `public/favicon.svg`
- `public/favicon-16x16.png`
- `public/favicon-32x32.png`
- `public/favicon-48x48.png`
- `src/components/brand/ContaOSMarca.tsx`: apenas `<img>`, com `forma: "horizontal" | "simbolo"`
- `src/test/brand.test.tsx`
- `docs/frontend/lovable/BRAND-01.md`: registro do plano, das decisões, dos SHA-256 e das evidências

Não entram, porque nenhuma superfície atual os usa: Logo_Horizontal (fundo claro), Simbolo_Color/Navy/Preto, Vertical, Tagline, Mono, PNGs, PWA, Manual e `contaos-brand-tokens.css`. Ficam disponíveis no pacote para uso futuro.

## 3. Não será alterado
- Supabase, tabelas, migrations, RLS, grants, Edge Functions, RPCs, Auth;
- cliente e tipos Supabase (`src/integrations/**`), `.env`, `package.json`;
- rotas (`src/routes` sem arquivo novo ou renomeado, `routeTree.gen.ts` intacto);
- autorização/RBAC, regras de negócio, estados, cálculos, integrações, dados;
- `src/styles.css`, `src/components/ui/**`, `AGENTS.md` e os testes existentes.

## 4. Mapeamento da marca
| Superfície | Asset oficial |
|---|---|
| Painel escuro das 4 telas de acesso e cabeçalhos escuros das 9 telas, a partir de `sm` | `Logo_Horizontal_Fundo_Escuro.svg`, altura 32 px (≈131 px de largura, acima do mínimo de 120 px) |
| Os mesmos lugares abaixo de `sm` (390 px) | `Simbolo_Branco.svg`, 32×32, com o texto "ContaOS" atual ao lado |
| Favicon | `favicon.svg`, `.ico` e PNGs 16/32/48 oficiais |
| Fundo claro, monocromáticas, vertical, tagline | NÃO APLICÁVEL: não há superfície clara com marca hoje |
| PWA e manifest | NÃO APLICÁVEL / NÃO SERÁ CRIADO |
| Sidebar expandida/recolhida | NÃO APLICÁVEL |
| Boot/loading e erro global (sem marca hoje) | NÃO APLICÁVEL |

## 5. Design System
- **Reutilizar**: `--foreground` (Navy), `--secondary` (Superfície) e `bg-primary`, já escuro e compatível com a variante "Fundo Escuro".
- **Nenhum token novo, nenhuma extensão.** Azul e Teal já vêm embutidos nos SVGs oficiais.
- **Sem mudança em `--primary`/`--accent`**: trocar `--primary` por #0EA5E9 mudaria todos os botões, e o texto branco sobre ele fica em ≈2,8:1, reprovando o contraste AA.
- O `contaos-brand-tokens.css` não será importado, para não criar uma segunda paleta. O tamanho de 32 px que ele indica será aplicado com utilitários Tailwind já existentes (`h-8 w-auto`, `size-8`).

## 6. Pontos de aplicação
- **Entram**: login, esqueci-senha, redefinir-senha e seleção de organização; os 9 cabeçalhos; mobile (símbolo); favicon; head do root (title padrão "ContaOS" e `og:site_name`; os títulos por rota não mudam).
- **N/A**: sidebar, PWA/manifest, boot e erro global.

## 7. Responsividade
- Altura fixa do logo, `shrink-0`; no mobile o horizontal cede lugar ao símbolo.
- Playwright em 1440/1280/768/390 nas telas `/login` e `/contratos`, conferindo:
  - `scrollWidth ≤ clientWidth`;
  - H1 e ações sem deslocamento em relação à base;
  - proporção do SVG renderizado igual a 900:220 / 1:1;
  - largura do logo ≥ 120 px.

## 8. Acessibilidade
- Logo horizontal: `alt="ContaOS"`.
- Símbolo com o texto "ContaOS" visível ao lado: `alt=""`, para não ser lido duas vezes.
- SVG carregado via `<img>`, sem IDs duplicados.
- A marca não é clicável hoje e continuará não clicável, então não há foco novo.
- Variante escura sobre `bg-primary`; nada funcional depende só de cor.
- Não há dark mode ativo; os painéis já são escuros.

## 9. GitHub
- Branch gerenciada `edit/…` → `main`; não será criada outra branch.
- Commits automáticos do Lovable; assets versionados no repositório; registro em `docs/frontend/lovable/BRAND-01.md`.
- Validações: SHA-256 dos assets, testes focados, suíte, `npx tsc --noEmit`, build e browser.
- O diff desde `3ac193a5` deve conter só os arquivos das seções 1 e 2.

## 10. Riscos e mitigação
- **Regressão visual no cabeçalho**: um único componente com altura fixa, validado em 4 larguras.
- **Nome dentro do SVG em Arial em vez de Inter**: aceito pelo Manual; validado por screenshot.
- **Cache do favicon**: links com `type`/`sizes` e substituição do `.ico`.
- **Drift de cor/tokens**: nenhum token muda.
- **Asset não oficial**: conferência por SHA-256.
- **Drift funcional**: os testes existentes ficam intactos e o source scan confirma que nada de Supabase, rotas ou integrações foi tocado.

## 11. Testes (RED antes da produção)
`src/test/brand.test.tsx`:
- `ContaOSMarca` usa o `src` e o `alt` corretos para horizontal e símbolo;
- as 4 telas de acesso e as 9 telas mostram a marca oficial e não têm mais `ShieldCheck` no bloco de marca;
- o head do root declara `favicon.svg` e `favicon.ico`, sem "Lovable App";
- não há link de manifest;
- os bytes de cada asset em `public/` batem com o SHA-256 do manifesto oficial.

Os 361 testes existentes não mudam.

## 12. Gates N/A (dos 72)
- Sidebar expandida, recolhida e símbolo na sidebar;
- PWA: manifest, service worker, 192/512, maskable, theme_color, instalação;
- alternância de dark mode;
- splash/boot com marca;
- erro global com marca;
- usos de vertical, tagline, monocromáticas, fundo claro e impressão.

Esses gates ficam N/A por inexistência da superfície. Nenhuma funcionalidade será criada para atendê-los.

## Portão
**PLAN: APROVÁVEL**

Nenhuma regra funcional, de backend ou de arquitetura muda. O Design System é preservado, sem tokens novos e sem mudança de fonte global. Só assets oficiais, byte a byte; nenhuma biblioteca nova; nenhum segredo; nenhum arquivo fora das seções 1 e 2. Zero-Drift íntegro.
