# PROMPT 34 — V1-13 Nova Competência

Base: `b22dfd93c61f8be3970b5c01c8e0af2f0e40241e`. Plano aprovado: `.lovable/plan/prompt-34-v1-13-nova-competência-plan-2026-11-03.md`.

## Escopo
- Rota `/contratos/:id/competencias/nova` (`src/routes/contratos_.$id_.competencias_.nova.tsx`).
- `NovaCompetencia.tsx` com `CompetenceForm`, `MonthPicker`, `FormActions` locais.
- `novaCompetenciaDados.ts`: `PERFIS_CRIAR_COMPETENCIA` (UX, não autoritativo), `lerPerfilAtivo`, `criarCompetencia`, `classificarErroNovaCompetencia`, `verificarCompetenciaExistente`.
- V1-12: `Nova competência` virou link real; `Abrir competência` segue Em breve (V1-14 fora).

## Contrato com o backend
RPC `criar_competencia(p_id_contrato, p_competencia_referencia)`; opcionais omitidos (defaults do backend). Snapshot de requisitos materializado exclusivamente no backend. Zero insert/update direto.

## Erros
- 23505 → "Já existe uma competência para este mês."
- 401/403/42501 → sem permissão (PT-BR).
- P0001 e demais → erro genérico sanitizado (P0001 é usado pelo backend para várias validações).
- Transporte/sem código → leitura exata `competencias (id_contrato, competencia_referencia)`; existe = sucesso sem 2ª RPC; não existe = erro com retry manual. Sem retry automático.

## Gate
UUID → `getUser` → preferência de organização → `obterContrato` → perfil → formulário.

## Testes
`src/test/novaCompetencia.test.tsx` (RED por módulos ausentes → GREEN) + hunk em `competenciasContrato.test.tsx`.

## Zero-Drift
Sem alterações em `supabase/**`, `types.ts` (blob `8ea7750b75fd9d76b29c36ce7613392e3ab65e19`), client, package/lock, `components/ui`, `styles.css`, `public/brand`, AGENTS.
