# PLAN P0 46 · V2-03 Detalhe do apontamento

26/11/2026. O [plano mestre #825](https://github.com/contaos999999/contaos-hml-control/pull/825) e o [recibo 45 #833](https://github.com/contaos999999/contaos-hml-control/pull/833) habilitam o próximo regular. A [proveniência I05](https://github.com/contaos999999/develop/pull/232) e o [recibo HML #235](https://github.com/contaos999999/develop/pull/235) estão integrados. O contexto da leitura aponta para `cbf247724ecede59fdcba0d18d7b0e37c76f247f`. Os 25 blobs normativos e o catálogo 100/97 continuam com os hashes já versionados. O certificado anterior referencia a fonte original `a1516de1d8949e505d83b5e000eb1cc558b217a7`. O blob de `types.ts` segue `8ea7750b75fd9d76b29c36ce7613392e3ab65e19`. [Checkpoint oficial](https://github.com/contaos999999/contaos-hml-control/issues/708#issuecomment-7204850136)

## Contrato e navegação

- Regular 46, rota `/diligencias/:cicloId/apontamentos/:id`. Cobrir os 12 critérios originais e as leituras desta entrega nas jornadas J04, J06, J07, J08 e J11. Provar I02 (ciclo e item exatos), I05 (origem distinta entre pareceres do mesmo ciclo), C11 (pacote de origem) e C21 (versão documental) nos casos aplicáveis. As ações de V2-04 e V2-05 entram pelos regulares 47 e 48, com suas próprias permissões e provas.
- A entrada parte da linha do item em V2-02 e preserva página e foco no retorno. A abertura direta exige IDs canônicos e sessão, organização, competência e contrato conferidos no mesmo escopo RLS usado pela V2-02. Consultar apenas o item selecionado. Tratar endereço inválido, carregamento, resposta vazia sob RLS, negação explícita, erro recuperável e estado de processamento oficial. Cancelar consultas e limpar a apresentação do contexto anterior quando mudam rota, organização ou sessão.
- Reutilizar etiquetas, valores e datas oficiais do ciclo. Exibir o relato, fundamento, severidade, situação e valores por natureza com precisão decimal. Ler `obter_fonte_apontamento_contratante(uuid,uuid)`. Exibir parecer, arquivo, página, trecho e hash comprovados, quando disponíveis. Preservar a ausência histórica e a origem indisponível como estados próprios. Quando houver apresentação de mesma competência, contrato e organização visível sob RLS, habilitar o vínculo V120 exato.
- Ler `analises_apontamentos` por apontamento, competência, contrato e organização. Apresentar a classificação sugerida e seu fundamento com as respectivas referências. Conservar as decisões humanas à parte, com data e fundamento da revisão oficial da tarefa quando houver evento de auditoria visível e vinculado. Exibir desfecho externo separado quando a fonte oficial o trouxer. Nenhum comando de decisão, mutação ou alteração de regra é delegado a esta consulta. Os atômicos 029–032 exigem, no próprio gate, provas do motor, do confronto normativo e do fluxo de revisão.
- Confirmar pertencimento e o hash das versões referidas ao escopo original. Quando a apresentação e o pacote congelado forem autorizados, buscar a versão pelo ID e pelo documento de competência dentro dos itens desse pacote. Uma versão posterior fica identificada como evidência posterior quando os registros oficiais permitem comprovar essa distinção. Secundários ocultos por RLS ficam indisponíveis. Uma referência que abrir V111 precisa levar à versão citada, mesmo fora da primeira página. V111 deve conferir documento, contrato, organização e versão sob RLS, com retorno à navegação de origem. A ausência de referência preserva a navegação normal de V111.
- Usar os tokens e componentes existentes, PT-BR, links com nome identificável, anúncio de estado e foco visível. Verificar 1440, 1280, 768 e 390, claro e escuro. Não exibir caminhos privados nem tokens. [Preflight de catálogo](../auditorias/preflight/V2_PROMPT46_CONTRATO_2026-11-26.json)

## Allowlist fechada da BUILD

- `src/routes/diligencias_.$cicloId.tsx`
- `src/routes/diligencias_.$cicloId_.apontamentos_.$id.tsx`
- `src/routeTree.gen.ts`
- `src/components/diligencias/CicloDiligencia.tsx`
- `src/components/diligencias/ApontamentoDiligencia.tsx`
- `src/lib/diligencias/cicloDiligenciaDados.ts`
- `src/lib/diligencias/apontamentoDiligenciaDados.ts`
- `src/lib/diligencias/apontamentoEvidenciasDados.ts`
- `src/routes/contratos_.$id_.documentos_.$idDocumento.tsx`
- `src/components/contratos/DocumentoDetalhe.tsx`
- `src/lib/contratos/documentoDetalheDados.ts`
- `src/test/documentoDetalhe.test.tsx`
- `src/test/v2-46-contrato.test.ts`
- `src/test/v2-46-tela.test.tsx`
- `scripts/testc/visual-audit.mjs`
- `scripts/testc/visual-audit.test.mjs`
- `scripts/testc/v2-integracao-visual.mjs`
- `docs/frontend/rca/P0_RCA_ATIVO.json`

## Verificação e rollback

Primeiro publicar o RED no GitHub com o caso `V2-03 registra a rota Apontamento de diligencia e a prova visual` em `scripts/testc/visual-audit.test.mjs`. O GREEN deve provar transporte sem operações de escrita, item e fonte corretos mesmo diante de pareceres semelhantes, decisão humana e sugestão separadas, evidência original e posterior, navegação e regressão V1/V2. Cobrir ausência histórica, negação explícita, RLS sem linha, outra rodada, versão sem acesso, resposta inválida e troca de contexto sem dados obsoletos. Teste C com componentes de produção em fixture sintética, manifestos e screenshots de quatro larguras e dois temas. Preservar as regressões da V1, da F2 e dos regulares 44 e 45. A BUILD requer Zero-Drift, LOCK-TYPES, P0-NR, CI, análise de segurança, revisão assistida de Edivan5002 no HEAD exato, merge protegido e leitura na main. O recibo do regular será verificado separadamente. Rollback por PR protegida do incremento, com revalidação do retorno ao ciclo e da abertura padrão de V111.

## ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE (OBRIGATÓRIO)

GitHub e Supabase canônicos. A matriz permanece cumulativa e as provas de leitura e navegação usam CODE_FIXTURE. LIVE `NOT_RUN`. PROD `NO-GO`.
