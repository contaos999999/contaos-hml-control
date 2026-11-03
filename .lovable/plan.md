# PROMPT 35 / V1-14 — Competência: Visão Geral — PLAN

Base: `8b62e506a8351fba9819afb1b4508be449be7228` (HEAD local confirmado). `types.ts` atual: blob `8ea7750b75fd9d76b29c36ce7613392e3ab65e19` (conforme).

## 1. Requisitos e fonte
- Rota literal `/competencias/:id`; resumo de preparação, análise, bloqueios e ações permitidas.
- Componentes locais: `PageHeader`, `StatusBadge`, `PercentGauge`, `BlockingSummary`, `AllowedActions`, `Tabs` (sem shared UI novo).
- Estados (apresentação dos dados backend): loading, 404/indisponível, 403, preparation, analysis, blocked, ready, presented — nunca governam ações.
- Ações: renderizar só `allowed_actions` do backend; nada de `percent===100` ou situação local.

## 2. Backend certificado (consumido, não alterado)
- `public.obter_visao_geral_competencia(p_id_competencia uuid) returns jsonb`, STABLE SECURITY DEFINER, EXECUTE só `authenticated`; tenant alheio → 42501.
- Verificado: a RPC **não** consta em `types.ts` (rg sem ocorrências em `src/`), exigindo adapter local.
- Não chamar `avaliar_portao_conformidade` (já consolidado na RPC).

## 3. Rota
- Convenção real: arquivos planos com `_` para desaninhar (`contratos_.$id.tsx` → `/contratos/$id`). Não existe `competencias.tsx` pai.
- Arquivo: `src/routes/competencias_.$id.tsx`, `createFileRoute("/competencias_/$id")`, `ssr:false`, head PT-BR próprio (title, description, og:title, og:description, og:type, twitter:card). Sem og:image.

## 4. Adapter local (sem `any`, sem REST, sem tocar types/client)
Em `src/lib/competencias/competenciaVisaoGeralDados.ts`:
```ts
type RespostaRpc = { data: unknown; error: unknown; status?: number };
type RpcVisaoGeral = {
  rpc(fn: "obter_visao_geral_competencia", args: { p_id_competencia: string }):
    { abortSignal(signal: AbortSignal): PromiseLike<RespostaRpc> };
};
const cliente = supabase as unknown as RpcVisaoGeral;
export function obterVisaoGeral(id: string, signal: AbortSignal): PromiseLike<RespostaRpc> {
  return cliente.rpc("obter_visao_geral_competencia", { p_id_competencia: id }).abortSignal(signal);
}
```
- `abortSignal()` é método nativo do builder do supabase-js (já usado em V1-06+); o tipo é declarado só no adapter, sem regenerar `types.ts` nem tocar `client.ts`.
- Cancelamento sem efeito tardio, no componente:
  - cada execução do efeito cria um `AbortController`; o cleanup (desmontagem ou troca de `id`) chama `abort()`;
  - após cada `await` (getUser, preferência, RPC) há guarda `if (signal.aborted) return;` antes de qualquer `setState`/`navigate`;
  - retry manual: aborta o controller anterior, cria novo e incrementa `tentativa`; botão "Tentar novamente" fica desabilitado enquanto `carregando`, impedindo chamada duplicada;
  - `AbortError` é ignorado (não vira estado de erro).
- StrictMode: o primeiro ciclo é abortado antes de resolver; só o resultado do controller vigente é aplicado.
- `parseVisaoGeral(data: unknown): VisaoGeral | null` — validação estrutural (objeto, strings, numbers|null, booleans estritos). Falha de shape → `erro` genérico.
- Tipos locais `CompetenciaVG`, `PortaoVG`, `BlockingSummaryVG`, `AllowedActionsVG` espelhando os campos listados no prompt.
- `classificarErroVisaoGeral(error, status)`: 401/403/42501 → `sem_permissao`; P0001/sem dados → `nao_encontrada` ("Competência não encontrada ou indisponível."); resto → `erro` genérico com retry manual. Nunca texto bruto.
- `rotuloSituacao(s)`: `pode_apresentar_contratante` → "PODE APRESENTAR AO CONTRATANTE"; `pode_reapresentar_contratante` → "PODE REAPRESENTAR AO CONTRATANTE"; demais → valor exato do domínio, sem paráfrase. Nunca "Apta…".
- Reusar `formatarCompetencia`, `formatarPercentual` de `competenciasDados.ts` (sem alterá-lo).

## 5. Fluxo / gate
```text
UUID inválido -> "Competência não encontrada ou indisponível." (zero Auth/RPC)
UUID válido -> getUser() -> sem sessão: /login
            -> preferência organização ausente: /selecionar-organizacao
            -> obter_visao_geral_competencia (1x) -> sucesso | 403 | 404 | erro(retry)
```
Padrão do gate idêntico à V1-12/V1-13 (useEffect + AbortSignal, UUID canonizado).

## 6. UI
- `PageHeader`: H1 único "Competência MM/AAAA" + Link voltar `/contratos/$id/competencias` com `competencia.id_contrato` do backend; `ContaOSMarca` existente no header.
- `StatusBadge`: texto + ícone (não só cor), tokens existentes.
- `PercentGauge`: `role="meter"` com `percentual_conformidade` do backend; "—" se null. Mostra também `portao.percentual`/contagens como dado informativo.
- `BlockingSummary`: lista exatamente os 8 campos backend (sem soma/recalculo); `portao.liberado` exibido como "Liberado pelo backend"/"Não liberado pelo backend".
- `AllowedActions` — fonte exclusiva: `allowed_actions` do backend. Mapa local fixo de destinos `DESTINOS_IMPLEMENTADOS = {}` (vazio: V1-15/16/18/19 inexistentes).
  - booleano `false`: renderiza só texto informativo "Bloqueada pelo backend" (ícone + texto); **nenhum** `button`/`a`/elemento com role de ação para aquela ação.
  - booleano `true` e destino não implementado (todos hoje): elemento staged `<span aria-disabled="true">` "Em breve" + "Permitida pelo backend"; sem `href`, sem `onClick`, sem execução.
  - booleano `true` e destino implementado (futuro, fora deste prompt): só então Link real.
  - Proibido derivar de percentual, situação ou estado visual.

### Estado visual canônico (apresentação; nunca governa ações)
`derivarEstadoVisual(vg)` puro, usando apenas dados do backend, em ordem determinística:
1. `presented`: situação ∈ {apresentado, aguardando_contratante, com_apontamentos, reapresentado, validada, encerrada}.
2. `ready`: situação ∈ {pode_apresentar_contratante, pode_reapresentar_contratante}.
3. `blocked`: `portao.liberado === false` e (`blocking_summary.nao_conformidades_bloqueantes > 0` ou `blocking_summary.nao_conformes > 0`).
4. `analysis`: situação ∈ {em_analise, em_reanalise}.
5. `preparation`: demais (rascunho, preparando, pendente_correcao, cancelada ou desconhecida).
Renderização: painel `EstadoCompetencia` com rótulo PT-BR ("Em preparação", "Em análise", "Com bloqueios", "Pronta conforme backend", "Apresentada") + ícone + descrição; `StatusBadge` continua mostrando o status oficial exato. A função não é importada por `AllowedActions` (verificado por teste).
- `Tabs`: `role="tablist"`; "Visão geral" `aria-selected=true`; Documentos/Análise/Parecer/Apresentação staged aria-disabled "Em breve"; nenhuma rota futura criada.
- Tooltips acessíveis existentes em termos técnicos (portão, inconclusivos) se já há componente; sem shared UI novo.

## 7. V1-12
- `CompetenciasContrato.tsx`: somente `Abrir competência` staged → `<Link to="/competencias/$id" params={{ id: c.id }}>`. `Nova competência` intacta.
- `competenciasContrato.test.tsx`: hunks mínimos nas linhas 320–321 e 347–349 (agora link com href `/competencias/<id>`). Aprovar o plano = autorizar estes hunks.

## 8. TDD (RED antes de produção) — `src/test/competenciaVisaoGeral.test.tsx`
1. RED: módulos ausentes.
2. UUID inválido → zero getUser/rpc, mensagem sanitizada.
3. Sem sessão → /login; sem organização → /selecionar-organizacao.
4. RPC chamada 1x, args exatamente `{p_id_competencia}`; nenhuma outra rpc/from/mutação.
5. 42501, 403, 401 → acesso negado (não empty); P0001 → não encontrada; transporte → erro + retry manual reexecuta 1x; texto bruto nunca aparece.
6. Shape inválido → erro genérico.
7. Sucesso renderiza status, percentual, 8 campos de bloqueio, 4 actions.
8. REGRESSÃO: percentual=100, situacao qualquer, `apresentar=false` → "Bloqueada pelo backend"; e inverso percentual=0 com `apresentar=true` → "Permitida pelo backend" (falha se houver lógica local).
9. `apresentar/analisar/abrir_documentos/abrir_parecer=true` → só indicador muda; sem link/href, aria-disabled, nenhuma rpc extra.
10. Copy: dois status críticos canônicos; nunca /Apta/.
11. A11y: H1 único, role status/alert, tablist/tab nomes, staged aria-disabled.
12. Voltar usa `id_contrato` do backend.
13. V1-12: Abrir = link `/competencias/<id>`; Nova competência intacta.
14. Teste estático: o arquivo de produção não contém `=== 100` nem `avaliar_portao_conformidade`, nem `any`.

## 9. Verificação
Focado V1-14 + regressão V1-13/V1-12/V1-11/V1-10; suíte serial `--maxWorkers=1`; lint arquivos alterados; build automático; static scan; Security Scan; browser 1440/1280/768/390 claro/escuro via fixture mock (sem overflow; UUID inválido = zero requisições). `tsc`/build manual: gate externo se ambiente não permitir. Teste C separado read-only.

## 10. Zero-Drift
Sem alteração em `supabase/**`, package/lock, `client.ts`, `types.ts` (restaurar de `e10f797` se regenerado, blob `8ea7750b…`), `components/ui/**`, `styles.css`, `public/brand/**`, AGENTS. routeTree só automático. Nenhuma V1-15..V1-20.

## 11. Diff esperado
Criar: `src/routes/competencias_.$id.tsx`, `src/components/competencias/CompetenciaVisaoGeral.tsx`, `src/lib/competencias/competenciaVisaoGeralDados.ts`, `src/test/competenciaVisaoGeral.test.tsx`, `docs/frontend/lovable/PROMPT-35-V1-14-competencia-visao-geral.md`.
Modificar: `CompetenciasContrato.tsx` (1 elemento), `competenciasContrato.test.tsx` (2 hunks), `routeTree.gen.ts` (auto).

## 12. Riscos
- RPC fora dos tipos: mitigado por adapter estreito + parse runtime.
- Plataforma pode regenerar `types.ts`: restauração obrigatória antes do commit.
- Flakiness paralela preexistente: suíte serial é a determinística.
- Sem sessão HML real no browser: validação visual por fixture mock.

PLAN: APROVÁVEL
