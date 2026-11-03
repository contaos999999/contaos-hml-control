# PROMPT 34 — V1-13 Nova Competência — PLAN

PLAN: APROVÁVEL

## Verificações feitas (base `b22dfd93`)
- HEAD local = `b22dfd93c61f8be3970b5c01c8e0af2f0e40241e`; `types.ts` nessa base = blob `8ea7750b…5e19` (baseline).
- `criar_competencia` JÁ consta no client tipado: `p_id_contrato`, `p_competencia_referencia` obrigatórios; `p_periodo_inicio/fim`, `p_data_limite` opcionais; `Returns: string`. Consumível sem tocar backend nem `types.ts`.
- `mesParaReferencia()` existe em `src/lib/contratos/competenciasDados.ts:52` — será reutilizado.
- Padrão `23505 → duplicado` já usado em V1-02/V1-03/V1-05.
- Convenção de rota irmã não aninhada: `contratos_.$id_.documentos_.$idDocumento.tsx`.
- V1-12: `Nova competência` staged em `CompetenciasContrato.tsx:502–505`; teste em `competenciasContrato.test.tsx:340–346`.

## Rota
Arquivo `src/routes/contratos_.$id_.competencias_.nova.tsx`, `createFileRoute("/contratos_/$id_/competencias_/nova")` → URL `/contratos/:id/competencias/nova`, página própria (não renderiza dentro de V1-12). head() PT-BR única.

## Arquivos
Criar:
- `src/routes/contratos_.$id_.competencias_.nova.tsx`
- `src/components/contratos/NovaCompetencia.tsx` (locais: `CompetenceForm`, `MonthPicker`, `FormActions`)
- `src/lib/contratos/novaCompetenciaDados.ts`
- `src/test/novaCompetencia.test.tsx`
- `docs/frontend/lovable/PROMPT-34-V1-13-nova-competencia.md`
Modificar (hunk mínimo):
- `CompetenciasContrato.tsx`: só `Nova competência` staged → `<Link to="/contratos/$id/competencias/nova">`; `Abrir competência` continua Em breve.
- `competenciasContrato.test.tsx`: só a expectativa dessa ação (link real; Abrir segue staged, sem RPC).
- `src/routeTree.gen.ts`: somente geração automática.

## Helper `novaCompetenciaDados.ts`
- `PERFIS_CRIAR_COMPETENCIA = ["administrador","gestor_contrato","prestacao_contas"]` — comentado como UX, não autoritativo.
- `lerPerfilAtivo(idUsuario, idOrg)`: um SELECT explícito em `vinculos_usuarios` (colunas nomeadas, filtro usuário+organização+ativo, `maybeSingle`), uma vez por tela (mesmo padrão V1-11).
- `criarCompetencia(idContrato, mes)`: `mesParaReferencia(mes)`; se null → erro de validação, sem RPC; `supabase.rpc("criar_competencia", { p_id_contrato, p_competencia_referencia })` — opcionais omitidos (backend aplica defaults). Zero insert/update direto.
- `classificarErroNovaCompetencia(error, status)` → `duplicada` (23505); `sem_permissao` (401/403/42501); `erro` sanitizado genérico PT-BR para P0001 (o backend usa P0001 também para contrato inexistente e competência inválida) e demais códigos; `ambiguo` (erro de transporte/sem código/fetch falho). Nunca expõe texto bruto. Teste dedicado: P0001 → `erro`, nunca `sem_permissao`.
- `verificarCompetenciaExistente(idContrato, ref)`: `select("id").eq("id_contrato").eq("competencia_referencia").maybeSingle()` — leitura exata, sem dataset.

## Fluxo e estados
Gate literal: UUID inválido → "Contrato não encontrado", zero Auth/Data/RPC → `getUser()` (sem sessão → link login) → preferência de organização (sem org → selecionar) → `obterContrato()` (403/404 sanitizado) → `lerPerfilAtivo` → form.
Estados: `idle`, `submitting` (botão desabilitado + ref anti-duplo-clique, `aria-busy`), `duplicada` ("Já existe uma competência para este mês."), `sem_permissao`, `erro` (PT-BR genérico, retry manual), `sucesso`.
- Perfil fora dos três → estado sem permissão, sem formulário habilitado.
- Ambíguo: sem retry automático; executa `verificarCompetenciaExistente`; se existe → `sucesso` (efeito reconhecido, sem 2ª RPC); se não → `erro` com retry manual.
- Sucesso: mensagem com MM/AAAA, UUID guardado só em estado; botão/link "Voltar para competências" → `/contratos/$id/competencias`. Sem link V1-14.
- Cancelar: Link para V1-12, zero RPC.
- Não montar requisitos/snapshot; backend materializa.

## TDD
RED primeiro (módulo/rota ausentes), depois GREEN. Casos: UUID inválido zero chamadas; sem sessão; sem org; contrato 403/404; perfil autorizado vs não (SELECT único explícito); `2026-11` → `2026-11-01`; RPC exata uma vez com só contrato+referência; duplo clique = 1 RPC; 23505 = duplicada; ambíguo+existente = sucesso sem 2ª RPC; ambíguo+inexistente = erro/retry manual; nenhum `.insert/.update`; sucesso volta à V1-12; Cancelar sem RPC; V1-12 link real + Abrir staged; a11y (labels, foco, `role=status/alert`, sem status só por cor).
Validação: focado V1-13 + regressão V1-12/V1-11/V1-10, suíte completa serial determinística, build automático, lint dos arquivos, scan de secrets, Security Scan, browser 1440/1280/768/390 claro/escuro. Teste C em turno separado read-only.

## Zero-Drift
Intocados: `supabase/**`, `types.ts` (restaurar ao blob `8ea7750b…` se regenerado), `client.ts`, package/lock, `components/ui/**`, `styles.css`, `public/brand/**`, AGENTS. Tokens/BRAND-01 existentes; sem paleta nova. V1-14 ausente.

## Riscos
- Se a RPC recusar perfil via P0001, a tela mostra erro genérico sanitizado (não "sem permissão"); o perfil já é bloqueado antes na UX.
- Regeneração de `types.ts` pela plataforma: restauração autorizada ao baseline.
- `tsc` manual pode ser restrito pelo ambiente; usar build automático e reportar limitação.

## Diff esperado
5 criados + 2 hunks mínimos + routeTree gerado.
