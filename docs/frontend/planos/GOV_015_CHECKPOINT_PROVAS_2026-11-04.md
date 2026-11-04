# GOV-015 — PLAN documental de atualização das três provas operacionais

**Data:** 04/11/2026 (Brasília), **base anterior ao PLAN:** main `a31b852a99a753b0ea442e7d08e0d3b4e323eb6d`. Repositório `contaos999999/contaos-hml-control`. Fonte normativa: `contaos999999/develop`, branch main, somente leitura. Nenhuma modificação de backend, HML ou PROD.

## PROMPT
O titular pediu continuidade até comprovar os itens **1, 2 e 4**: Auto-Lock abrindo PR real, Lovable sincronizado após a migração, e contraste WCAG dos elementos públicos anteriormente inconclusivos. As provas já estão registradas em CI e PRs, mas o checkpoint oficial segue desatualizado, referindo-se apenas a GOV-008 e indicando pendências que já foram superadas. Atualizar a referência para próximas conversas sem declarar 100% do PRD, WCAG global ou homologação HML.

## Provas verificadas
1. **GOV-011 Auto-Lock — sucesso operacional:** workflow run `41805167363`, tentativa 2, job `126606923195` concluído `SUCCESS`: bot criou branch de drift controlado `autolock/probe-drift-41805167363-2`, branch de restauração `autolock/probe-repair-41805167363-2`, abriu **PR #26** com `github-actions[bot]`, verificou diff apenas de `src/integrations/supabase/types.ts`, confirmou SHA da `main` intacto, fechou PR sem merge e removeu ambas as branches. **Não** foi introduzido drift real na `main`.
2. **Lovable sincronizado:** projeto `b113dd59-6caf-4c92-8302-457a037a0c6f` retornou `latest_commit_sha=a31b852a99a753b0ea442e7d08e0d3b4e323eb6d`, igual ao HEAD GitHub após GOV-014. Arquivos `docs/frontend/auditorias/GOV_014_MEDICAO_CONTRASTE_2026-11-04.md`, `scripts/testc/visual-audit.mjs` e `src/routes/login.tsx` conferidos por conteúdo, com diferença apenas de quebra final omitida pelo conector Lovable. Lovable como sincronização/visualização, nenhuma IA BUILD.
3. **GOV-014 contraste público:** PR #25 mesclado em `a31b852a99a753b0ea442e7d08e0d3b4e323eb6d`, workflow run final `41840128303` ambos jobs SUCCESS, 184 combinações, 24 rotas públicas, 120/120 amostras de contraste por pixel em PASS AA, **menor 4,7465:1** (limite 4,5:1 texto normal), **zero FAIL e zero inconclusivas nesse método**, 160 situações sem sessão HML continuam NÃO VERIFICADAS. O axe-core conservou sua classificação automática `INCOMPLETE`; a prova suplementar de pixels sanou a dúvida do escopo público.
4. Artefato `13328683000` (`41840128303`), ZIP `ContaOS_GOV014_Pixel_41840128303.zip` **SHA256 `5d452e5c1ba515384c352ccbbd133cda5824a8b3e88b56383f4fcc167d7fba37`**, CRC PASS, 25/25 SHA256SUMS internos corretos. Retenção Actions até 02/02/2027; não equivale a arquivo institucional imutável.
5. `types.ts` preservado no blob `8ea7750b75fd9d76b29c36ce7613392e3ab65e19`. Fonte canônica e código funcional preservados; sem alteração de frontend visual, Supabase, Auth ou produção.

## PLAN, escopo estritamente fechado
Arquivos autorizados:
- `docs/frontend/planos/GOV_015_CHECKPOINT_PROVAS_2026-11-04.md` (este documento, commit de PLAN isolado).
- `docs/frontend/ESTADO_E_RETOMADA_CONTAOS_4_1.md` (apenas seção de estado vivo e novo bloco de provas GOV-011/014).

Proibidos: `src/**`, `public/**`, `scripts/**`, `.github/**`, `supabase/**`, `types.ts`, pacotes, locks, backend e PROD. Nenhum comando no Lovable ou Supabase nesta fase.

## Gates
- Primeiro submeter CI de commit contendo apenas este PLAN; BUILD documental somente após CI `SUCCESS`.
- Atualizar checkpoint de modo retrospectivo e factual, com links/IDs, sem alegar certificação WCAG integral ou HML.
- CI completo no SHA de BUILD documental, dois checks do ruleset, Teste C `N/A` por alteração documental; comparar `types.ts` e diff.
- Sem revisão de PR obrigatória (ruleset 0), porém sem bypass de gates específicos BRAND-01/PRD.
- Rollback: revert em novo PR, jamais force push.

## ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE
GitHub é a fonte de autoria; Lovable apenas sincronização e visualização. Não alterar marca, estilos, telas, tokens, APIs, estado, backend ou ambiente produtivo. Manter `NÃO VERIFICADO` onde faltam provas reais.
