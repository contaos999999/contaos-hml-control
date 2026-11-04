# GOV-007 — Relatório de auditoria de acessibilidade instrumental

**Data:** 04/11/2026 (Brasília) · **Escopo:** Teste C GitHub; somente páginas públicas, sem HML autenticado.
**PR de governança:** #19. **PLAN:** `docs/frontend/planos/GOV_007_PLAN_WCAG_TESTEC_2026-11-04.md`.

## 1. Linha de base histórica verificada
- Teste C original `41737621829`, GOV-002: 23 cenários × 4 larguras × 2 temas = 184 combinações; 24 capturas de rotas públicas, 24 PASS público, zero FAIL público, 152 não verificados sem sessão e 8 drawers sem sessão. A auditoria **não equivale a E2E real**.
- ZIP original `ContaOS_TesteC_GOV002_41737621829.zip` foi recuperado da Action, com **26 arquivos** e **25/25 hashes internos corretos**. Hash SHA256 do ZIP: `06dd5aaa044053ae88dc60f9e84289b6b84089d6c080140e20a051c6d47b52ec`.
- Artefato original Actions ID `13280975443` expira em `03/12/2026`. A data não é prorrogada retroativamente pela mudança de workflow.

## 2. Delta GOV-007
- `axe-core@4.14.0` instalado exclusivamente no executor Teste C (pasta temporária, sem edição do lock/app).
- `scripts/testc/visual-audit.mjs` executa a análise WCAG A/AA instrumental em páginas **públicas**, registrando `violations`, `incomplete`, status automatizado de contraste, versão do engine e contagens, sem HTML dos nós nem valores de campos.
- Resultado de violação não é ignorado: `FAIL_PUBLICO`. Item inconclusivo tem `NAO_VERIFICADO_REVISAO_MANUAL`; falha ao executar axe gera FAIL. Status do HML autenticado e RLS A/B permanece NÃO VERIFICADO.
- O workflow solicita retenção de novos artefatos por `90` dias, sujeita ao limite da organização. Não é evidência permanente. Para arquivo de longa duração, realizar exportação em armazenamento autorizado com ACL restrita e SHA256SUMS, preservando procedência por SHA/PR/CI.

## 3. TDD e critérios
- **RED comprovado:** commit `e0fad9a3d25bd291f1208f91f2010a41e60debba`, run `41767892283`, falha intencional no teste da API `publicA11yGate` antes da implementação, sem alterações da aplicação.
- **GREEN:** aguardando conclusão do CI do HEAD final do PR #19; **não declarar PASS antes do run/artefato real**.
- Sem mudança de `src/**`, `public/**`, `src/integrations/supabase/types.ts`, `supabase/**`, PROD ou backend.
- Zero supressões arbitrárias de regra de acessibilidade; caso algum contraste público falhe, registrar e abrir PLAN específico de correção visual/BRAND-01 sem mexer na UI dentro do GOV-007.

## 4. Limitações permanentes desta prova
- Axe detecta problemas automatizáveis, não toda WCAG; cenários de leitores de tela, ordem de teclado, foco, imagens, blocos dinâmicos e julgamento perceptual ainda requerem teste especializado.
- 160 combinações protegidas sem credenciais não se tornam `PASS` automaticamente.
- A preservação de screenshots por prazo indeterminado exige armazenamento próprio, não há permissão para alterar policies de GitHub ou Supabase neste escopo.
- O build Lovable, identidade visual, PRD 4.1 e contratos RPC não foram alterados.

**Estado:** BUILD de governança submetido; aguardar CI verde e prova do Teste C com Axe em execução real. Não afirmar equivalência operacional 100% com HML e revisão manual pendentes.

## 5. Prova criptográfica independente da equivalência de código Lovable × GitHub

Consulta direta à API Git do GitHub aos objetos de árvore dos commits `b8ca8b99b31c65ceccfe6091b5e7bcaad1cf80f0` (SHA informado como último pelo Lovable) e `bd832cda02cb2c2d1a7041020909724ae70d62f5` (main GitHub após GOV-006):

| Objeto | SHA Git em ambos |
| --- | --- |
| `src/` | `34f9be40ac4167867b0b89362b00e02557eaa95a` |
| `public/` | `7f72da43b4a4fbd669ca1e900a773bc18f89845b` |
| `package.json` | `6dbe973df8f2fb6c45ef4cf544c99fbbb5141713` |
| `bun.lock` | `17b4d9861dba2e5edef0bb0933d3ab2d8daffea0` |
| `vite.config.ts` | `174e074ca30e73877870b02eb162b0c28848051e` |

**Conclusão delimitada:** árvore funcional, assets e dependências são **bit a bit idênticos** entre os dois commits. Logo, os 37 commits administrativos posteriores ao SHA conhecido do Lovable **não introduziram divergência no código ou dependências citados**. Isso não prova que o Lovable atualizou metadados ou que a execução autenticada HML é equivalente; o estado do editor deve ser verificado separadamente, sem usar IA do Lovable para BUILD.
