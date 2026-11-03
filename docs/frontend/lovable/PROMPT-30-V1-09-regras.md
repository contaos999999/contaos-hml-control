# PROMPT 30 / V1-09 — Contrato — Listas e regras

Ambiente: HML (`gklhhhyosgasnyoxlrui`). PROD proibido. Somente frontend.
Base pré-BUILD: `44ac8aa806cc34d22d3815121e7a0865af84480a`.

## Rastreabilidade
- Regular: PROMPT 30 / V1-09. Rota `/contratos/:id/regras`.
- Atômicos: V1-CHK-001 (listas), V1-CHK-002 (versões/itens), V1-CHK-003 (regras de conformidade), V1-CHK-004 (regras preventivas + aprovação).
- Transversais: NFR-007 (conflito sem retry automático), NFR-009 (paginação 25), RLS, PT-BR, a11y, BRAND-01, Zero-Drift. NFR-008: N/A (RPC sem contrato de idempotência; há bloqueio de dupla submissão).

## Backend consumido (sem alteração)
- Leituras RLS, colunas explícitas, `count: "exact"`, `range` 25:
  - `listas_verificacao` (`id_contrato`, `atualizado_em desc, id desc`);
  - `versoes_lista` lazy por `id_lista` (`numero_versao desc, id desc`);
  - `itens_lista` lazy por `id_versao_lista` (`ordem asc, id asc`);
  - `regras_conformidade` (`id_contrato`, `codigo asc, id asc`);
  - `regras_preventivas` (`id_contrato`, filtro `situacao` no servidor, `situacao, codigo_regra, id` asc);
  - `fontes_formais_regras_preventivas` lazy no detalhe; `versoes_fontes_normativas`/`fontes_normativas` via `.in` só com ids da página.
- Gate: `getUser` → `/login`; preferência de organização → `/selecionar-organizacao`; `obterContrato` + `classificar_acesso_contrato_v106` (403×404). Nenhuma consulta de negócio antes do gate.
- Única mutação: RPC `aprovar_regra_preventiva(p_id_regra_preventiva, p_parecer)`; parecer vazio → `null`; UUID retornado exibido como protocolo da revisão. Fronteira tipada única (`as unknown as`) porque o tipo gerado declara `p_parecer?: string` sem `null`.
- Nenhum `.insert/.update/.delete/.upsert`.

## Divergências reais do backend (decididas a favor do backend)
- `regras_preventivas.situacao` = `candidata | ativa | inativa | rejeitada | substituida` (não existem "suspensa/obsoleta").
- Regras preventivas com `id_contrato` nulo (escopo organização) não são listadas.
- Sem RPC pública de versionamento de lista: versões somente leitura.
- `efeito_portao` apenas refletido ("Afeta portão: Sim/Não", ajuda "Valor definido pelo backend").

## Arquivos
- Novos: `src/lib/contratos/regrasDados.ts`, `src/components/contratos/RegrasContrato.tsx`, `src/routes/contratos_.$id_.regras.tsx`, `src/test/regrasContrato.test.tsx`, este documento.
- Alterados (mínimo): `VisaoGeralContrato.tsx`, `BaseNormativaContrato.tsx`, `OrcamentoContrato.tsx` — "Regras" sai de `SECOES_FUTURAS` e vira link real.
- Testes antigos: `contratoDetalhe.test.tsx` e `baseNormativa.test.tsx` — somente a expectativa "Regras – Em breve" substituída pelo link real (necessário porque o comportamento aprovado muda). Nenhuma outra lógica.
- Gerado: `src/routeTree.gen.ts`. Intocados: `types.ts`, backend, styles, brand, ui, package, AGENTS.

## TDD e resultados
- RED: `regrasContrato.test.tsx` falhou ao resolver `@/components/contratos/RegrasContrato` (módulo inexistente), antes de qualquer código de produção.
- GREEN: focado 22/22; suíte 433/433 (19 arquivos); `npx tsc --noEmit` exit 0; `npm run build` exit 0 (cópia temporária).
- Lint: global 8.962 erros / 9 avisos = baseline; arquivos novos 0/0; arquivos antigos sem aumento.
- Scan estático nos novos: 0 ocorrências de `service_role|sk_|PRIVATE KEY|as any|as never|.insert/.update/.delete/.upsert(`.
- Security Scan: 0 Critical, 0 High, 1 Info preexistente (proteção de senha vazada no Auth — fora do escopo).
- Browser (fixture interceptada, sem mutação real) 1440/1280/768/390: sem overflow de página, H1 único, só "Regras" com `aria-current`, marca preservada, Esc devolve foco, aprovação com `p_parecer: null`, protocolo exibido, console sem erros. Em 390, tabelas com rolagem horizontal controlada.
- `git diff 44ac8aa -- src/integrations/supabase/types.ts`: 0 bytes.

## Limitações
- Supabase externo: browser usa sessão/dados simulados — prova visual, não de RLS/RPC real.
- Teste C pendente (turno separado, árvore imutável).
