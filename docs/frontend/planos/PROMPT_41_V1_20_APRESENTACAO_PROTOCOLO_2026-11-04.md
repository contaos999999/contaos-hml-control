# PROMPT 41 / V1-20 — PLAN preliminar: Apresentação e protocolo

**Data:** 04/11/2026 (Brasília). **Modo:** PLAN documental, sem BUILD, sem alteração de `PLANO_ATIVO.json`. **Decisão:** NÃO VALIDADO até confrontar texto literal original, contratos concretos de leitura e CI deste PR.

## A. Fontes e baseline comprovados

- Frontend `contaos999999/contaos-hml-control/main@657b350fa43c30177df399667fbc885aa1a2599a`, PR #45 merged. PR #44 integrou V1-19 no commit `2bc2696b1272cce74f6aaaae4dd608751b469f5b`.
- Run do PR #44 [41885026808](https://github.com/contaos999999/contaos-hml-control/actions/runs/41885026808): qualidade e Teste C independente SUCCESS no SHA `ef128b9825da14af5e82eb51b09d8d65ce6ddc51`; dossiê relata 841 testes e 25 rotas × 4 larguras × 2 temas = 200 casos, 24 capturas. Evidência autenticada HML: **NÃO VERIFICADA**.
- Run do PR #45 [41885974702](https://github.com/contaos999999/contaos-hml-control/actions/runs/41885974702): dois jobs SUCCESS, mas Playwright interno **SKIPPED por escopo documental**; não classificar como execução visual.
- Fonte normativa de referência `contaos999999/develop/main@a10d3b1a1a14276c017027f93ec2a7aace4d6cb6`. `docs/prompts/PROMPT_TRACKS_4_1.json` confirma Prompt regular **41** → **V1-20**, direto **000/BRAND-01**, sem atômico de tela adicional demonstrado. Revisar requisitos transversais ainda aplicáveis, não assumir lista exaustiva.
- `01_PRD_MESTRE_4_1.md` exige pacote imutável e registro de apresentação/protocolo; `06_FRONTEND_LOVABLE_ESPECIFICACAO_4_1.md` identifica V1-20 como “Apresentação/protocolo” e reserva autoridade ao backend.
- **ATUALIZAÇÃO COM PROVA DOCUMENTAL POSTERIOR:** original `Manual_Mestre_Prompts_4_1_100_PRD.docx` recuperado no pacote mestre 4.1 da biblioteca; SHA-256 `8a15d96568d021ac86fdd45e79038e2cb969d69c12b2edb84f012a6129b8940e` idêntico ao catálogo. PROMPT 41 localizado e conferido nos índices de parágrafo 2303–2362; detalhamento em `docs/frontend/auditorias/PROMPT_41_V120_FONTE_LITERAL_E_CONTRATO_PACOTE_2026-11-04.md`. Outros gates de segurança continuam pendentes. Contexto 25/25, catálogo 100/97 e divergência zero devem ser revalidados no GATE. `types.ts` blob congelado de referência: `8ea7750b75fd9d76b29c36ce7613392e3ab65e19`.

## B. Objetivo e restrições

Planejar a tela V1-20 para **consultar** apresentação/protocolo oficial e pacote imutável já criados pela RPC `registrar_apresentacao` na V1-19. Exibir identificador oficial, protocolo, modalidade e dados de apresentação **somente se fornecidos por leitura autorizada pelo Supabase**. Não forjar timestamps, hashes, URL de download, estados ou evidências quando ausentes.

A UI deve tratar: sessão inválida, organização/competência sem acesso, pacote não encontrado, apresentação ainda não registrada, dados parciais, erro de rede, conflito e sucesso de consulta, em PT-BR. Datas/horas no fuso de Brasília, acessibilidade teclado/ARIA, layout nos 1440/1280/768/390 px e temas claro/escuro. Botões/links apenas para recursos existentes e autorizados. Não presumir endpoints de leitura nem upload de comprovante.

O backend permanece fonte única do status e da autorização; **RLS, Auth, RPC, Edge, Storage, migrations, PROD, `src/integrations/supabase/types.ts`, contratos e marca oficial são imutáveis neste PLAN**.

## C. Descobertas necessárias antes de validar o BUILD

1. **CONCLUÍDO documentalmente:** recuperar a seção literal do PROMPT 41 e registrar SHA-256/parágrafos; fonte original autêntica identificada no pacote da biblioteca, confronto de critérios em dossiê específico. Demais critérios e execução ainda seguem gates próprios.
2. Inspecionar apenas a superfície tipada frontend e documentação normativa do backend (sem modificar Supabase) para provar função/query autorizada que consulta `apresentacoes_contratante`, `pacotes_competencia`, seus campos, RLS e anexos. Se não existir contrato suficiente, classificar **LACUNA DE BACKEND**; bloquear implementação dependente e pedir autorização humana específica antes de qualquer investigação ou alteração backend.
3. Verificar existência de rota e convenções TanStack Router, `ContaOSMarca`, padrões V1-19 e V1-14, `allowed_actions`, limites das leituras e condição de imutabilidade.
4. Validar a lista completa de requisitos transversais e uma allowlist de caminhos concretos; não declarar aprovação do PLAN por inferência.
5. Reconfirmar HEAD vivo de `develop` e 25 blobs do snapshot, catálogo 100 prompts regulares/97 atômicos e hash `types.ts`, antes do GATE.

## D. Proposta de BUILD (não autorizada até novo GATE)

**Candidatos, sujeitos à conferência de caminhos e contratos**:
- `src/routes/competencias_.$id_.apresentacoes_.$apresentacaoId.tsx` (rota TanStack proposta para a rota canônica `/competencias/:id/apresentacoes/:apresentacaoId`; confirmar convenção no router antes do BUILD);
- `src/components/competencias/CompetenciaProtocolo.tsx` (visualização institucional);
- `src/lib/competencias/protocoloDados.ts` (adaptador tipado somente leitura);
- `src/test/competenciaProtocolo.test.tsx` (TDD RED/GREEN e cenários de autorização);
- `src/routeTree.gen.ts` (gerado pelo TanStack, sem edição manual);
- `src/test/brand.test.tsx`, `scripts/testc/visual-audit.mjs`, `scripts/testc/visual-audit.test.mjs` (inclusão de V1-20 na matriz, preservando os 200 casos existentes, previsão **26×4×2=208** se uma nova superfície for confirmada);
- `docs/frontend/auditorias/PROMPT_41_V120_TESTES_2026-11-04.md` e checkpoint pós-BUILD;
- eventual navegação V1-19 → V1-20 somente após confirmação da rota/casos previstos no manual e autorização por contrato existente.

**Proibido:** alteração de backend, RPCs, schema, Storage, regras de negócio locais, pacote e hash imutáveis, `src/styles.css`, `public/brand/**`, `src/integrations/supabase/**`, dependências/lockfiles, tokens/segredos, bypass de proteção. Não inferir URLs de protocolo.

## E. Matriz de aceitação prevista

| Requisito | Teste esperado | Classificação atual |
| --- | --- | --- |
| Consulta autenticada e isolada por organização | Mock 401/403 e RLS HML A/B com usuários reais | HML REAL NÃO VERIFICADO |
| Protocolo e identificador oficiais | Tipagem da leitura, UUID/dados confiáveis, estados ausente/incompleto | CONTRATO A CONFERIR |
| Integridade do pacote | Somente leitura, sem alterar pacote/hash ou geração duplicada | PLANEJADO |
| Segurança | Nada de UPDATE direto, logs sensíveis ou bypass; CI Zero-Drift | PLANEJADO |
| Identidade, A11y e PT-BR | Reuso BRAND-01, foco, contraste, datas Brasília e 4×2 | PLANEJADO |
| Regressão e crivo Teste C | Vitest integral, typecheck, build, CI 2 checks no mesmo SHA e Teste C independente; expandir 200→208 só se nova tela | PLANEJADO |
| Rollback | PR específico para retirar rota e navegação, sem modificar pacotes reais | PLANEJADO |

## F. GATE e triagem de lacuna backend

- **Possível lacuna backend? INDETERMINADA.** Não demonstrado contrato somente leitura do pacote/protocolo com todos os dados necessários. Nenhuma investigação HML nem alteração backend autorizada.
- **Gate PLAN:** texto literal, contratos tipados, matriz atômica, 25/25, brand, segurança, CI do PR e Teste C planejado devem ser verificados e documentados.
- **Gate de BUILD:** após merge do PLAN, PR separado para `PLANO_ATIVO.json` VALIDADO com lista definitiva e evidências CI; exigir dois checks SUCCESS. **Não fazer BUILD antes desse gate.**
- **Gate de entrega:** TDD RED/GREEN comprovado, regressão, dois checks no SHA final, Teste C independente executado (sem confundir SUCCESS por SKIP), captura/hash; HML autenticado continua explicitamente pendente até prova.
- **Aprovação humana:** reuso de BRAND-01 sem alteração de marca não exige nova aprovação da identidade; qualquer lacuna que demande alteração de backend ou mudança direta de brand exige autorização específica.
- **Rollback:** reverter UI por PR com checks verdes; nunca apagar/modificar registro de apresentação nem pacote imutável.

## ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE

Seguir ContaOS Brand v1.0 e 000/BRAND-01, sem paleta paralela, preservar logo transparente e tokens; **REUTILIZAR > ESTENDER > CRIAR**. Desenvolvimento GitHub direto, nenhuma chamada Lovable duplicada, sem alteração backend e sem elevar mock a E2E. Toda mudança visual requer crivo 4×2 e Teste C independente em SHA imutável.

**Status final deste PLAN:** **NÃO VALIDADO**. Próxima ação: obter o literal do Prompt 41 e comprovar contrato de leitura; então validar GATE e executar BUILD em PRs separados. Não declarar a tela concluída, nem permitir promoção a PROD.

## G. Verificação complementar do PLAN — 04/11/2026

- **CI do primeiro commit do PLAN**: [run #41887241676](https://github.com/contaos999999/contaos-hml-control/actions/runs/41887241676), HEAD `ffe0c081603e3bbeff9052d808bdb6f415612dcb`, dois jobs SUCCESS. O job do Teste C foi **SKIPPED internamente pelo filtro documental**; o passo Playwright não executou. Um novo commit exige novo CI no SHA atualizado.
- **Especificação frontend 4.0/4.1 recuperada da biblioteca**, `FE_v4_Manual_Integral_Lovable_Supabase.docx`, páginas 20 e 65: rota exata `/competencias/:id/apresentacoes/:apresentacaoId`, acesso `acesso`, SELECT Data API com RLS, estados `loading`, `empty`, `success`, `denied`, `error`, acessibilidade, 4 larguras e backend autoritativo. O texto genérico de CRUD não autoriza escrever pacote ou protocolo; a V1-20 será **exclusivamente leitura**.
- **Contrato tipado existente sem edição**, `src/integrations/supabase/types.ts` no commit base: `apresentacoes_contratante.Row` tem `id`, `id_competencia`, `id_contrato`, `id_organizacao`, `id_pacote`, `protocolo`, `forma_apresentacao`, `apresentado_em`, `apresentado_por`, `numero_rodada`, `tipo` e `id_comprovante_arquivo`; relação `id_pacote` → `pacotes_competencia.id`. `pacotes_competencia.Row` tem `id`, `id_competencia`, `id_contrato`, `id_organizacao`, `hash_pacote`, `numero`, `status`, `tipo`, `congelado_em`. Estes tipos **não demonstram, sozinhos, que cada SELECT e cada snapshot detalhado esteja acessível sob RLS em HML autenticado**. Não montar pacote a partir de documentos atuais nem tratar `hash_pacote` como conteúdo do snapshot.
- **Atualização da fonte original:** o manual DOCX do pacote mestre 4.1 foi posteriormente recuperado e teve SHA-256 e parágrafos 2303–2362 confirmados. A ressalva original acima é histórica e está sanada por `PROMPT_41_V120_FONTE_LITERAL_E_CONTRATO_PACOTE_2026-11-04.md`. Permanecem RLS HML e leitura real do snapshot NÃO VERIFICADOS, portanto o PLAN continua `NÃO VALIDADO` para BUILD.
- **Verificações para aprovação:** demonstrar acesso somente leitura e detalhe de snapshot congelado com RLS, fonte literal do PROMPT 41 e crosswalk completo 25/25, além de CI verde no HEAD final. Quando não demonstrado, bloquear dependência sem inventar RPC/endpoint, sem mudar backend e sem promover a produção.

## H. Auditoria oficial da retomada — 04/11/2026 (PR #46)

- Revalidado HEAD exato da `main` frontend `657b350fa43c30177df399667fbc885aa1a2599a`, repositório normativo `contaos999999/develop` com branch padrão **main**, HEAD `a10d3b1a1a14276c017027f93ec2a7aace4d6cb6`.
- Verificados **25/25 documentos** listados em `CONTEXT_CANONICO_4_1_SNAPSHOT.json`, consultados individualmente na fonte normativa usando SHA fixo: **25 hashes Git idênticos, 0 divergências**. Catálogo `PROMPT_TRACKS_4_1.json` blob `e54e49e626e65a9c94c81709180fd192a1f0c079`, confirma 100 IDs regulares e 97 IDs atômicos, mapeamento 41→V1-20/000; os 39 estágios e 416 critérios estão em arquivos separados, que **não se confundem com prompts**.
- `types.ts` bloqueado: blob verificado diretamente na `main` `8ea7750b75fd9d76b29c36ce7613392e3ab65e19`, íntegro. Ruleset `ContaOS-Zero-Drift-main` #26495643 ACTIVE, PR obrigatório, dois checks, zero revisões de PR, sem bypass e sem force push/deleção.
- **CI do HEAD anterior** `1e334e071c1ff17400741d468de855ef1c3ed513`, run [41888013334](https://github.com/contaos999999/contaos-hml-control/actions/runs/41888013334): dois jobs SUCCESS, Teste C **SKIPPED nos passos Playwright por ser alteração documental**. Estes checks **não** certificam nenhum commit posterior; revalidar após esta atualização.
- A matriz original das 39 etapas e 416 critérios informa `criteria_fully_certified=0` no seu snapshot de auditoria, 36 resultados com PASS de escopo limitado e 69 avaliações visuais MOCK; não converter automaticamente em certificação HML real nem refazer trabalho funcional já integrado.
- **Limite normativo explícito:** a `provenance.source_note` do catálogo do backend reconhece que os DOCX originais não estão materializados individualmente como blobs Git. Assim, 25/25 de documentos **não é** prova de leitura literal do Prompt 41 do DOCX; este gate continua NÃO VERIFICADO. Sem validação do contrato autorizado de snapshot detalhado, não abrir GATE/BUILD.
- A especificação FE v4 em biblioteca, páginas 20 e 65, registra rota `/competencias/:id/apresentacoes/:apresentacaoId` e SELECT Data API sob RLS. Consulta estrutural ao `types.ts` do frontend não é verificação HML com sessão autenticada.
- Nenhuma mudança funcional, backend, HML, Lovable BUILD ou PROD efetuada neste PLAN. **Status do planejamento: NÃO VALIDADO**. A integração de documentação não altera essa classificação.

## I. GATE TRANSVERSAL — 97 ATÔMICOS, ALÉM DO BRAND-01

**Verificação independente do visual:** O prompt 000/BRAND-01 é obrigatório, mas NÃO esgota as obrigações. O catálogo `docs/prompts/PROMPT_TRACKS_4_1.json`, blob `e54e49e626e65a9c94c81709180fd192a1f0c079`, declara `certification.full_crosswalk_verified=false`, `count_regular_verified=0` e status `FONTES_VERIFICADAS_MATRIZ_ESTRUTURAL_POR_TELA_PARCIAL`. Para o regular 41, há somente vínculo estrutural direto a 000; `not_relevant_atomic_ids=[]` NÃO prova que 001–096 foram analisados ou excluídos.

**ANTES de classificar PLAN 41 como VALIDADO:**
1. Conferir requisito original do prompt regular 41; separar dos inventários 39 etapas/416 critérios.
2. Percorrer **todos os 97 IDs 000–096**, confrontando texto canônico 08A–08D e 20_PROMPT_000_BRAND_01 com a finalidade V1-20; classificar cada um como **APLICÁVEL**, **TRANSVERSAL APLICÁVEL** ou **NÃO APLICÁVEL**, justificando e citando fonte por ID. Os conjuntos precisam ser disjuntos e totalizar 97/97.
3. Registrar matriz de aplicabilidade na documentação do PLAN e mapear cada critério aplicável para arquivo, teste e evidência; contemplar segurança, RLS/autorização, isolamento por organização, integridade e imutabilidade do pacote, rastreabilidade, RNFs, PT-BR, acessibilidade, custo e Teste C, além da marca.
4. Confirmar se requisitos requerem verificação HML real ou autorização especial e manter `NÃO VERIFICADO` quando faltarem evidências; jamais reclassificar mock como E2E.
5. Não editar o catálogo normativo para forçar PASS ou alterar numeradores; se surgir divergência, abrir análise própria e bloquear o GATE até reconciliação legítima.

**Resultado atual:** somente inventário e crosswalk estrutural conhecido; auditoria semântica 97/97 para PROMPT 41 **NÃO VERIFICADA**. BRAND-01 isoladamente não libera BUILD. A presente seção corrige explicitamente a interpretação de que o vínculo direto 41→000 bastaria.

## J. Matriz 97/97 de aplicabilidade adicionada após PR #46

A auditoria individual está registrada em `docs/frontend/auditorias/PROMPT_41_V120_CROSSWALK_97_ATOMICOS_2026-11-04.md`: 000 diretamente aplicável; 019/020/067 como dependências transversais pré-existentes; 087/093 condicionais sem autorização de nova funcionalidade; 91 IDs sem implementação nova na V1-20. **97/97 classificados, sem correspondências numéricas arbitrárias**, mas a triagem não substitui certificação integral de requisitos, autenticação real nem literal do DOCX PROMPT 41. O campo oficial `full_crosswalk_verified` do catálogo normativo permanece false. Ainda NÃO VALIDADO para BUILD; `PLANO_ATIVO.json` fica intacto (PROMPT 40). O ramo de auditoria só altera documentação e depende de dois checks verdes próprios antes de qualquer merge.

## K. Prova da fonte e contrato real de itens — atualização documental

Fonte original SHA-256 regular 41 `8a15d96568d021ac86fdd45e79038e2cb969d69c12b2edb84f012a6129b8940e`, caderno atômico SHA-256 `d9faaae47de4b697b18ad7fb71e4738384514936813cd5b18779f4cb8aed83b8`. Ambos encontrados no ZIP original, confrontados com o catálogo. O Tipo oficial `itens_pacote_competencia.Row` inclui `id_pacote`, `entidade_tipo/id`, `versao_id`, `hash`, `metadados`, `ordem` e IDs de tenant/contrato/competência, resolvendo a dúvida de **forma estrutural** sobre itens congelados. O vínculo do UUID retornado por `registrar_apresentacao` ao parâmetro `:apresentacaoId` também foi conferido no frontend. **Ainda NÃO existe evidência nesta auditoria de SELECT autorizado via HML real por perfis/tenants nem de leitura efetiva do pacote**; não transformar prova tipada em homologação. Nenhuma alteração backend ou de código. Ver dossiê `docs/frontend/auditorias/PROMPT_41_V120_FONTE_LITERAL_E_CONTRATO_PACOTE_2026-11-04.md`.

### Espelho da fonte para próximas conversas

Arquivo GitHub: `docs/frontend/fontes/PROMPT_41_V120_TEXTO_ORIGINAL_VERIFICADO_2026-11-04.md`. Fonte regular 41 autenticada por SHA-256; a exigência de texto original do prompt está resolvida, preservando os gates de contrato RLS e segurança ainda NÃO VERIFICADOS.


## L. Decisão do titular: ensaio operacional RLS HML A/B diferido e não bloqueante

**Decisão posterior de 04/11/2026, prevalece somente quanto à obrigatoriedade temporal do ensaio A/B:** o titular dispensou a execução antecipada da prova RLS multi-organização no Supabase HML e determinou sua análise **facultativa depois do PROMPT regular 99**, sem bloquear a continuidade de PLAN/GATE/BUILD dos prompts 41–99. Fonte GitHub: `docs/frontend/governanca/DECISAO_RLS_HML_AB_POS_PROMPT_99_2026-11-04.md`. O histórico anterior deste documento registrava a ausência da prova RLS como bloqueio; **essa condição isolada deixa de ser bloqueio sob a decisão expressa**, sem que se converta a evidência em PASS.

Para V1-20: a verificação tipada de `apresentacoes_contratante`, `pacotes_competencia` e `itens_pacote_competencia`, a fonte literal regular 41, a triagem dos 97 atômicos, a allowlist, BRAND-01, TDD, validação de tratamento 401/403/404, proteção de dados, consulta somente leitura, Teste C e CI **continuam obrigatórios**. Nenhum acesso ou isolamento operacional HML A/B será alegado como validado. **PLAN não fica automaticamente VALIDADO**: falta consolidar uma avaliação técnica final de todos os controles restantes e, se PASS, emitir GATE documental separado antes do BUILD.

## M. Consolidação de validação e allowlist

O parecer de validação técnica e a lista fechada de arquivos do BUILD V1-20 estão no arquivo `docs/frontend/planos/PROMPT_41_V1_20_VALIDACAO_TECNICA_2026-11-04.md`. O ensaio HML A/B é facultativo pós-PROMPT 99, permanece NÃO VERIFICADO e não condiciona os demais gates. O PLAN ainda depende do CI deste PR e do GATE separado de `PLANO_ATIVO.json` para liberar edição funcional.

## ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE (OBRIGATÓRIO)

Aplicar exclusivamente ContaOS Brand v1.0, tokens e componentes aprovados, incluindo logomarca oficial transparente e contexto BRAND-01. Não criar cores, tipografia, logos, páginas globais ou UI paralelas. Reutilizar, estender somente se necessário, criar apenas o mínimo autorizado na allowlist. Desenvolver por GitHub direto; Lovable exclusivamente sincronização e conferência, não executar IA de BUILD. Exigir TDD, Zero-Drift, segurança, quatro larguras (1440/1280/768/390), dois temas, acessibilidade, textos PT-BR, formato de Brasília, Teste C independente somente leitura com SHA e evidências. Se houver desvio de marca, necessidade de backend ou alteração de escopo, reprovar/replanejar antes de editar. A prova RLS real HML A/B segue NÃO VERIFICADA, facultativa pós-PROMPT 99 e não bloqueante apenas para essa prova operacional, conforme decisão do titular.

## N. PARECER FINAL DO PLAN — liberado somente após CI e GATE separadamente

A revisão técnica encerrada no PR #50 concluiu documentação e allowlist fechada no arquivo `docs/frontend/planos/PROMPT_41_V1_20_VALIDACAO_TECNICA_2026-11-04.md`; o próprio PR #50 recebeu ambos checks SUCCESS no HEAD `5bc4162b88b60a970a7138c60783f7719718a363`, merge `69182d1317cac3fa6a6fb88cd8423f834d89ce96`. A fonte original e o contrato tipado estão demonstrados, os 97 atômicos passaram por triagem de aplicabilidade e o ensaio A/B foi diferido. **Para efeito de PLAN pré-BUILD**, gates de PRD/arquitetura/brand/segurança de desenho/RNF/TDD/teste planejado/rollback são PASS, com RLS real A/B explicitamente NÃO VERIFICADO e não exigível nesta fase. O BUILD somente será autorizado após merge/CI do PR de GATE que registra `PLANO_ATIVO.json` 41 VALIDADO. Não confundir essa aprovação do plano com aprovação da implementação.
