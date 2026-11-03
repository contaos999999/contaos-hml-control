# PROMPT 37 / V1-16 — Competência: Análise — PLAN (revisão de contrato)

## Situação real (verificada antes deste plano)
- A V1-16 já foi construída no workspace no turno BUILD anterior, sobre a base `cdfbc59b`, que é byte a byte igual à V1-15 `87d5905d`.
  - Arquivos: rota, `CompetenciaAnalise.tsx`, `competenciaAnaliseDados.ts`, teste e documentação PROMPT-37.
  - O link Análise na V1-14 só foi ativado depois do GREEN.
  - Resultados: suíte serial 737/737 e build automático OK.
  - `types.ts` está no blob `8ea7750b`.
  - O main informado (`cdfbc59b`) ainda não contém esse BUILD. O HEAD do workspace é posterior.
- Funções no HML, conferidas por leitura do catálogo:
  - `obter_analise_competencia_v116(...)` → jsonb (12 parâmetros, conforme o prompt).
  - `solicitar_analise_competencia(uuid, text)` → uuid.
  - `solicitar_reanalise_requisitos(uuid, uuid[])` → uuid.
- **Divergência entre o BUILD atual e o contrato deste prompt:**
  1. Hoje "Reanalisar" chama `solicitar_analise_competencia(id,'reanálise')`, e o próprio teste proíbe `solicitar_reanalise_requisitos`. O novo contrato exige `solicitar_reanalise_requisitos(id, ids[])` com seleção explícita.
  2. Não existe seleção de requisitos. Portanto não há reset da seleção quando o id muda.
  3. Os nomes de componente `EvidencePanel` e `ReanalysisHistory` não existem: hoje são evidências inline em `RequirementTable` e `HistoricoExecucoes`.
  4. A reconciliação de write "ambíguo" foi feita com uma leitura. O contrato agora diz que o UUID retornado, inclusive o mesmo de uma execução já existente, é sucesso e reconcilia por refresh/polling. Isso é compatível e será mantido. Um UUID repetido não pode virar erro.

Por isso, este plano é um **delta** sobre a V1-16 existente. Não é uma reconstrução.

## Escopo do delta (somente arquivos permitidos)
- `src/lib/competencias/competenciaAnaliseDados.ts`
  - Adicionar `solicitarReanaliseRequisitos(id, ids: string[])`. Ela faz uma única chamada a `rpc("solicitar_reanalise_requisitos", { p_id_competencia, p_requisitos })`, sem chave idempotente fictícia, e devolve `{ ok, uuid } | { ok: false, tipo }` sanitizado.
  - Validar no client só o formato UUID de cada id e se o array está vazio. Vazio não chama a RPC, porque a regra de quais requisitos são válidos é do backend.
  - `TipoSolicitacao` passa a ser só `"completa"` para `solicitar_analise_competencia`.
  - O tipo `"reanálise"` sai da tela.
- `src/components/competencias/CompetenciaAnalise.tsx`
  - **AnalysisHeader:** "Executar análise" só quando `allowed_actions.executar_analise=true`. Com `false`, só um bloqueio informativo.
  - **RequirementTable:** coluna de checkbox (alvo de 44px, label "Selecionar requisito X"). Só aparece quando `allowed_actions.reanalisar=true`.
    - A seleção é um `Set` de `id_requisito`, vinculado a `idC` e restrito aos ids presentes nos resultados atuais.
    - Nada é pré-selecionado: nem por resultado nem por criticidade.
  - **Barra de seleção:** "Reanalisar selecionados (n)".
    - Desabilitada com n=0 ou durante o envio.
    - Uma trava por ref garante que o duplo clique gere 1 RPC.
    - O array enviado é exatamente o dos ids selecionados.
    - Com sucesso, limpa a seleção, avisa em `role=status` e refaz a leitura; o polling assume se o estado vier queued/processing.
    - Com `allowed reanalisar=false`, não aparecem checkbox nem botão executável, só o texto informativo.
  - **Seleção zerada** quando o id muda (vinculada a `idC`), em qualquer mudança de filtro, busca ou offset de resultados, e depois de um sucesso. Assim nunca se envia um requisito fora da página atual.
  - **EvidencePanel:** subcomponente extraído das evidências atuais. Mostra só `id_versao_documento`, `pagina`, `trecho`, `tipo_evidencia`, `referencia_externa`, `hash` e `criado_em`. Não cria link nem download.
  - **ReanalysisHistory:** renomeia `HistoricoExecucoes`, sem mudar o conteúdo. Mostra tipo, status, `contexto_atual`, hash, motor, versão, provedor, modelo, prompt, `requisitos_afetados`, tempos, `erro_codigo` e metadados quando existirem.
  - **Executar análise:** um UUID retornado, novo ou o mesmo já existente, é sucesso, com refresh/polling.
    - Em erro ou timeout ambíguo, faz uma leitura de reconciliação; mantido do BUILD.
    - Nunca há segunda escrita nem retry automático.
    - A mesma regra vale para a reanálise.
- `src/test/competenciaAnalise.test.tsx`: atualizar os testes que contradizem o contrato novo e acrescentar os casos abaixo.
- `docs/frontend/lovable/PROMPT-37-V1-16-competencia-analise.md`: seção "Delta de contrato" com RED/GREEN real.
- Ficam como estão: rota, `CompetenciaVisaoGeral.tsx` e o teste dela (o link Análise já está ativo depois do GREEN; Parecer e Apresentação continuam staged) e `routeTree.gen.ts`.
- Proibidos, e não tocados: `supabase/**`, `client.ts`, `types.ts`, `components/ui/**`, `styles.css`, `public/brand/**`, `package.json`/lock, AGENTS e PROD.

## O que já atende ao contrato (só revalidar)
- **Gate:** UUID inválido → zero Auth, preferência e RPC. UUID válido → `getUser` → preferência (só contexto) → RPC.
- **Troca A→B:** autorização, estado, filtros, offsets, busca e aviso vinculados ao id. Ao trocar, aborta a leitura anterior e ignora a resposta tardia.
- **Erros:** 401/403/42501/PGRST301 → sem permissão; PT404 → não encontrada; PT400, transporte e outros → genérico em PT-BR.
- **Parser fail-closed:** exige `schema_versao` `v116-v1`, os 6 estados e os enums exatos de filtros.
  - Mecanismo aparece como retornado; não é inferido por provider ou metadados.
  - `mecanismos={}` sem execução é tratado como "Sem execução registrada".
- **Paginação server-side** 25/10/25, independente por lista.
  - Resultado/mecanismo zeram resultados; criticidade/busca zeram resultados e apontamentos; status zera apontamentos.
  - Execuções nunca são zeradas por filtro.
- **Polling** só em queued/processing via `atrasoPolling` V1-10. Para em estado terminal, erro, unmount e troca de id.
- **`abrir_requisito`:** mostra a permissão, mas a ação fica `aria-disabled` "Em breve", sem href, handler ou RPC (V1-17).
- **BRAND/a11y:** `ContaOSMarca`, apenas tokens, H1 único, `aria-live`, foco visível, tabelas roláveis e Sheet de filtros abaixo de 1024px.

## TDD (BUILD futuro)
**RED primeiro**, editando só o teste. Novos ou alterados:
1. Com `reanalisar=true`, os checkboxes aparecem e nada vem marcado, nem em fixtures com `nao_conforme`/`critica`.
2. Seleção vazia → botão desabilitado e 0 RPC.
3. Selecionando 2 → `solicitar_reanalise_requisitos` com `{ p_id_competencia: id, p_requisitos: [idA, idB] }`, na ordem e exatamente esses ids. `solicitar_analise_competencia` não é chamada.
4. Duplo clique na reanálise → 1 RPC.
5. Com `reanalisar=false` → sem checkbox e sem botão executável; fica o texto informativo.
6. Sucesso → seleção limpa e refetch. Erro ambíguo → 1 leitura e 0 segunda escrita.
7. A seleção zera ao trocar A→B, ao mudar filtro/busca e ao mudar a página de resultados.
8. Executar análise devolvendo o mesmo UUID de uma execução já em andamento → sucesso/reconciliação, não erro.
9. `EvidencePanel` mostra só os campos retornados, sem `<a>`/download; `ReanalysisHistory` mostra só os campos presentes.
10. Static scan: nenhuma chamada a `rpc("solicitar_analise_competencia"` com `'reanálise'`, nem fórmula de percentual, comparação de hash/stale ou regra de liberação no código de produção.

O RED esperado tem falhas reais em 1–9: hoje não existem seleção nem a RPC nova, e há uma asserção antiga proibindo `solicitar_reanalise_requisitos`. Depois, o GREEN mínimo em `competenciaAnaliseDados.ts` e `CompetenciaAnalise.tsx`.

## Verificação após o GREEN
- Focused V1-16 e V1-14.
- Regressões V1-15, V1-14, V1-13, V1-12, V1-11 e V1-10.
- Suíte serial completa.
- eslint/prettier nos arquivos alterados.
- Static scan e Security Scan.
- Navegador com UUID inválido em 1440/1280/768/390 × claro/escuro (8 combinações).
- Build automático; `tsc` manual só se o ambiente permitir.
- `git hash-object types.ts` = `8ea7750b`.
- Diff zero em caminhos proibidos.
- O Teste C fica para um turno read-only separado.

## Como se prova que nenhuma regra crítica vive no frontend
- Fixture incoerente (por exemplo `percentual=100`, `liberado=false`, `executar_analise=false`, `estado_analise=complete`, `stale=true`): a tela mostra exatamente esses valores, e nenhuma ação fica habilitada pelo percentual.
- O static scan do teste falha se aparecer cálculo de percentual, comparação de `hash_contexto_atual`, derivação de mecanismo ou habilitação de ação fora de `allowed_actions`.
- Os requisitos aceitos para reanálise são validados pelo backend. O client só impede a lista vazia e ids que não estão na página atual.

## Fora do escopo
Abrir requisito/V1-17, análise incremental/parcial, edição de apontamentos, links para documentos e qualquer mudança no backend.
