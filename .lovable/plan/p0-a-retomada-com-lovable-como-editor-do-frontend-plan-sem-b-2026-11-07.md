# P0-A — Retomada com Lovable como editor do frontend (PLAN, sem BUILD)

## 0. Confronto real (lido neste turno)
- Branch Lovable: `edit/edt-40293a40-...`; HEAD local `6b0343b` (= metadata Lovable anterior informada).
- Baseline frontend `71362700c83adf438170c2fe9ed35f79601472e7`: **ausente no repositório local** (git cat-file falha). PRs 228–249 não estão nesta árvore. Qualquer BUILD agora sobre `6b0343b` seria rollback — **proibido**.
- `types.ts`: blob `8ea7750b75fd9d76b29c36ce7613392e3ab65e19` (PASS).
- `PLANO_ATIVO.json`: prompt 75, VALIDADO, allowlist AppShell/Sidebar (antiga, não cobre P0-A).
- Fontes **não acessíveis** (API GitHub 404, repositório privado): issue #250 (seções 12/13), PR #251, `develop` issue #97, backend main `4fec09bf…`, PR96, migration `20261107001620`. Nenhuma leitura desses itens é afirmada neste plano.

## 1. Emenda mínima de governança (proposta, aplicar só em P0-B)
Texto aditivo ao Knowledge e a `ADR-DEV-001`: "Por decisão expressa do titular em 07/11/2026, o Lovable volta a ser editor do frontend; GitHub permanece versionamento canônico com PR + checks `ContaOS Frontend Zero-Drift` e `Teste C Independente` obrigatórios; Supabase HML `gklhhhyosgasnyoxlrui` permanece backend exclusivo; Lovable Cloud, remix, novo projeto e PROD proibidos; `types.ts` congelado; Teste C separado e read-only." Nenhum outro controle revogado.

## 2. Capacidade real de gates sem GitHub Actions
| Gate | No sandbox Lovable | Observação |
|---|---|---|
| Vitest, ESLint, Prettier, tsgo, vite build | SIM | executável localmente |
| zero-drift, route-tree-drift, p0-version-order-gate (scripts) | SIM | node local |
| Hash `types.ts` | SIM | `git hash-object` |
| Playwright 4 larguras × 2 temas | SIM, MOCK | sem sessão HML real |
| Checks obrigatórios do ruleset / merge PR | NÃO | só GitHub Actions |
| PostgreSQL/restore, pgTAP, JWT HML, secrets | NÃO | não presumir; backend externo |
| E2E autenticado HML A/B | NÃO | sem credenciais |
Gates locais nunca substituem os checks remotos: ficam "local PASS / remoto NÃO VERIFICADO".

## 3. Fases
- **P0-A (este)**: confronto + plano. Saída: plano aprovado.
- **P0-B Sincronização**: obter `71362700` na branch Lovable (sync GitHub→Lovable pelo titular). Allowlist: nenhuma. Saída: HEAD contém `71362700`, PRs 228–249 presentes, types blob ok. **Impedimento atual: depende do titular.**
- **P0-C Governança**: aplicar emenda §1. Allowlist: `docs/frontend/ADR-DEV-001-GITHUB-DIRETO.md`, `docs/frontend/ESTADO_E_RETOMADA_CONTAOS_4_1.md`, `docs/frontend/planos/PLANO_ATIVO.json`, novo `docs/frontend/planos/P0_A_RETORNO_LOVABLE_EDITOR_2026-11-07.md`. Saída: CI remoto verde do PR documental.
- **P0-D Leitura das fontes privadas**: titular cola seções 12/13 da #250, #251, #97 (ou concede acesso). Saída: próximo prompt V1 confirmado (esperado 43/V1-22 → 75/V1-23 conforme P0, a confirmar).
- **P0-E BUILD V1 / CRUD global**: só sobre a allowlist do prompt V1 vigente. Listas de PR96 **bloqueadas** até migration `20261107001620` e JWT comprovados em HML; sem UI fictícia. Primeira ação RED: teste do prompt V1 vigente (definido após P0-D) falhando no HEAD sincronizado.
- **P0-F Teste C** separado, read-only, SHA imutável, 1440/1280/768/390 × claro/escuro, BRAND-01.
- **P0-G Certificação V1 + GO/NO-GO**; V2–V5 só depois.

## 4. Impedimentos
1. Baseline `71362700` ausente localmente (bloqueia todo BUILD).
2. Fontes privadas ilegíveis (#250, #251, #97).
3. Checks remotos, HML JWT, migration e restore não executáveis aqui.

## Zero-Drift
IDENTIDADE VISUAL N/A (sem mudança visual); ECONOMIA LOVABLE CONFORME; ZERO-DRIFT PASS (nada editado; types blob certificado).
