# PLAN P0 45 · V2-02 Ciclo de diligência

26/11/2026. Plano mestre da [PR #825](https://github.com/contaos999999/contaos-hml-control/pull/825). A main `55454f9ba2b21f549dc19975fe7f2aa9e3a05357` autentica o recibo 44 da [PR #830](https://github.com/contaos999999/contaos-hml-control/pull/830) e libera o próximo regular, 45. Backend normativo `a1516de1d8949e505d83b5e000eb1cc558b217a7` e blob `8ea7750b75fd9d76b29c36ce7613392e3ab65e19` de `types.ts`.

## Requisito e compatibilidade

Regular 45, atômicos diretos 000, 026, 027 e 028. Cobrir os 12 critérios do prompt e o trecho de leitura das jornadas J01, J02, J04, J05 e J09. A entrada V2-01 abre a rodada selecionada, a V2-02 mostra os dados oficiais, e Voltar leva à mesma competência em V2-01. Quando o parecer tem `id_apresentacao`, o vínculo abre o protocolo V120 da mesma competência. As dependências com telas futuras permanecem nos próprios recortes.

O [recibo de catálogo](../auditorias/preflight/V2_PROMPT45_CONTRATO_2026-11-26.json) comprova as três tabelas `ciclos_diligencia`, `pareceres_contratante` e `apontamentos_contratante`, SELECT autenticado sob RLS por contrato, sem SELECT anônimo, chaves, estados, precisão e ordenação. A visão geral da competência preserva a autorização e as chaves oficiais. A ligação V120 usa a relação declarada `pareceres_contratante_id_apresentacao_fkey` para projetar a apresentação sob RLS na mesma consulta de pareceres. Só aparece com ID, competência, organização e contrato coincidentes. Os pareceres associados pelo `id_ciclo` expõem a referência documental e, quando disponível, a apresentação, sem consulta a arquivo privado. Os itens se ligam à rodada por `id_ciclo`. A aresta I05 exige prova específica nas entregas V2-03 e V2-07. A projeção deste recorte separa os pareceres da rodada dos itens, sem inferir o documento de um item por proximidade ou ordenação.

## Entrega

- Rota `/diligencias/:cicloId`, acessada pelo ID da rodada em Diligências. Resolver usuário e organização, consultar o ciclo por ID e organização sob RLS e conferir a competência e o contrato na visão geral autorizada. Tratar ciclo invisível ou inválido sem exibir dados, com mensagem prevista para cada situação. Nenhuma operação de escrita.
- Consultar as páginas de pareceres e de apontamentos com os IDs de ciclo, competência, contrato e organização, ordenação estável por recebimento ou criação e ID, e paginação de 25. Validar a identidade das linhas, sua ordem, a ausência de duplicatas e a possibilidade de revalidar em caso de resposta inválida.
- Exibir estado e prazo oficiais do ciclo, referências dos pareceres e da apresentação original quando vinculada, descrição, classificação sugerida e situação oficiais dos itens, e os quatro valores por natureza. Projetar os valores `numeric(18,2)` como texto pela operação `SELECT` para manter precisão decimal na apresentação. Exibir nulo e zero separadamente. A tela não aplica glosa, altera estado ou calcula prazo. [Contrato de projeção PostgREST](https://docs.postgrest.org/en/stable/references/api/tables_views.html#casting-columns)
- Preservar estados de carregamento, vazio com acesso, erro de consulta, ciclo indisponível ou sem acesso e nova tentativa. Cancelar respostas antigas em mudança de ID, usuário, organização ou sessão. Não reutilizar um escopo anterior. Usar estado anunciado, foco, labels e layout responsivo com valores legíveis.
- Ampliar Teste C existente com V2-01 → V2-02 → V2-01, recarga, conteúdo e negação, em 1440/1280/768/390 claro e escuro. Manter as evidências das telas V1, do delta F2 e da V2-01. Capturas e manifestos correspondem à árvore revisada, com componentes de produção e transporte sintético.

## Allowlist fechada da BUILD

- `src/routes/diligencias_.$cicloId.tsx`
- `src/routeTree.gen.ts`
- `src/components/diligencias/DiligenciasCompetencia.tsx`
- `src/components/diligencias/CicloDiligencia.tsx`
- `src/lib/diligencias/diligenciasDados.ts`
- `src/lib/diligencias/cicloDiligenciaDados.ts`
- `src/test/v2-45-contrato.test.ts`
- `src/test/v2-45-tela.test.tsx`
- `scripts/testc/visual-audit.mjs`
- `scripts/testc/visual-audit.test.mjs`
- `scripts/testc/v2-integracao-visual.mjs`
- `docs/frontend/rca/P0_RCA_ATIVO.json`

## Verificação e rollback

Nova funcionalidade. Observar RED no GitHub no caso `V2-02 registra a rota Ciclo de diligencia e a prova visual` do arquivo `scripts/testc/visual-audit.test.mjs` antes do GREEN. Os testes da ficha RCA devem verificar contrato oficial, negação, precisão decimal, relacionamentos, volta, paginação, transporte e troca de contexto. Confirmar ausência de novos alertas críticos no gate aplicável, ausência de chamadas externas e console limpo no Teste C. A BUILD exige GOV-020, Zero-Drift, LOCK-TYPES, P0-NR, regressão, lint, TypeScript, revisão assistida no HEAD exato e leitura na main. O recibo do 45 só entra após a confirmação da BUILD. Em rollback, reverter o incremento por PR protegido e conferir o acesso da V2-01 e V114.

## ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE (OBRIGATÓRIO)

Usar GitHub, componentes e tokens oficiais, PT-BR e Supabase oficial. Validar o teste visual antes de integrar. LIVE `NOT_RUN`. PROD `NO-GO`.
