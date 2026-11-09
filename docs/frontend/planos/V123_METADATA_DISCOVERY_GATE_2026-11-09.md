# Trilha A: GATE DISCOVERY de metadados técnicos V123

Deriva PLAN385, sem aceitação antecipada. Fonte frontend866608620909bf313a6c2192736330222f9219ad: TrilhaAuditoria.tsx blob7ef709c1a7bae0fb53f7255e78240d1b35a039f4 e auditoriaDados.ts blob446e34255c98fdeb99182889b8992028d9573be3. Base de publicação fca0798d3eba81e8daa3a876a255f34b66ff39f9. Snapshot/ack/backend devem ser reancorados pelo rito de freshness vigente; não atualizar declaração normativa às cegas. O GATE401 original autoriza apenasSQL1 e esquema metadata após CI/revisão/merge. SQL2 depende da emenda fechada ao final deste documento e do CI/revisão/merge específico dessa emenda; nenhuma execução anterior é presumida. NenhumSQL foi executado na preparação.

## Prova pretendida e categorias

A página inicial atual pode conter eventos novos após o preparador; não congelar oito eventos históricos nem aceitar eventos arbitrários por UUID. Ator id_usuario pode ser pseudônimo operacional autorizado para auditoria HML, sem identificar pessoa, alegar synthetic ou exigir igualdade com sessão. correlation_id é identificador técnico de eventos específicos, não autorização UUIDgenérico. Não consultar Auth, perfis pessoais, nomes/emails, antes/depois/metadados.

Fase1 somente metadata de página atual. Fase2 requer catálogo de IDs/lengths/timestamps revisado e emenda integrada antes de ler campos desconhecidos. Fase3 propõe catálogo fechado aceitação GET/DOM, somente após semântica independente e CI/revisão/merge. Nenhuma fase implica captura ou PASS.

## Fase1 metadata-only autorizada somente após integração

ApósGATEintegrado, confirmar esquema porinformation_schema apenas nomes/tipos necessários (public.eventos_auditoria: id,id_organizacao,criado_em,evento,entidade,origem,id_usuario,id_entidade,correlation_id) e executar uma vez SQL:

```sql
WITH scoped AS (
 SELECT id,criado_em,evento,entidade,origem,id_usuario,id_entidade,correlation_id
 FROM public.eventos_auditoria
 WHERE id_organizacao='e87f7e68-c5ae-4077-943b-02a4afd8b6ee'::uuid
), page AS (
 SELECT id,criado_em,char_length(evento)::int AS event_length,
        char_length(entidade)::int AS entity_length,
        char_length(origem)::int AS origin_length,
        id_usuario IS NULL AS actor_null,id_entidade IS NULL AS entity_id_null,
        correlation_id IS NULL AS correlation_null
 FROM scoped
 ORDER BY criado_em DESC,id DESC LIMIT 25 OFFSET 0
)
SELECT (SELECT count(*)::int FROM scoped) AS total,
       coalesce(jsonb_agg(to_jsonb(page) ORDER BY criado_em DESC,id DESC),'[]'::jsonb) AS rows
FROM page;
```

Retornoexato: um único objetoSQL com únicaschaves total:inteiro e rows:array contendo no máximo25objetosmetadata; aggregate gera envelope mesmo quando a página está vazia. Campos técnicos ID/timestamp/lengths/nullbooleans/count apenas; sem atores/correlação raw ou label/evento desconhecido. Usar wrapper interno para rejeitarshape/limites, sem erro bruto. Registrar count0comoestado vazio real, sem inventar eventos.

## Fase2 controlada, dependente da emenda SQL2 ao final

Os metadados permitirão emenda com conjunto fechado IDs/timestamps/lengths/total. SQL2 só depois dessa emenda integrada, revalidando página ordenada completa/total/metadados e contexto no mesmo statement. Ler somente os oito campos do adapter para25IDs no máximo, com eventos/entidade/origem≤120chars, totaltext≤12000. Dados fora da página/colunas proibidos.

Wrapper confirma technicalIDs exatos e UUIDs ator/correlation por tipo/formato apenas para triagem; isso não libera captura. Ator/correlation persistem só após catalogação de seus bytes por evento sob categoria operacional autorizada. Se tipo correlation nãoUUID ou data inválida, bloquear e revisar, semconverter/arredondar. Seis padrões GATE386 sobre labels completas antes de apresentação; qualquer padrão bloqueia linha sem texto. IDs técnicos de ator/correlation aprovados para avaliação não serão tratados como JWT/token nem usados para lookuphumano. Nãohash/arquivo/GitHub/logCI/DOM/PNG até decisão semântica independente.

Até1apresentaçãomínima aoexecutor e1aorevisor independente porcampo desconhecido, contexto privado autorizado. Decisõesfechadas CAMPO_TECNICO_SEM_PII,ATOR_OPERACIONAL_PSEUDONIMO_AUTORIZADO,BLOQUEADO_CONTEUDO,INCONCLUSIVO. Regex não prova significado; origem/enums desconhecidos necessitam revisão real. Campo recusado não é citado/repetido. SemAuthcapture ou novaquery para provar identidade.

## Ordinary GET e futura aceitação

UI faz GET existente /rest/v1/eventos_auditoria origemSupabaseHMLfixa, selectliteral id,criado_em,evento,entidade,origem,id_usuario,id_entidade,correlation_id; filtroid_organizacaoexact; ordercriado_em.desc,id.desc; offset0limit25; página inicial comtodosfiltros vazios. Nenhum POSTnovo/fetchNode/política de rede ampliada. Fonte exige sessão e podeConsultarAuditoria, mas auditor não observaAuth.

FuturoGATE de aceitação deverá projetar no browser somentecampos permitidos, exigir catálogoeventos/contexto/ordem/cardinalidade egeneration. UI exibe tabela Eventos de auditoria da organização, cincocolunasDataehora/Evento/Entidade/Usuário/Correlação; atorNULL→Sistema. dataBr usa Intl.DateTimeFormat pt-BR, America/Sao_Paulo,dateStyleshort,timeStylemedium e NÃOremovevírgula. Exigirformataçãofontereal reproduzida paracada timestampcatalogado, semregexdatas/UUIDglobal. AssociaçãorowIDs nãoestãonoDOM: projetarordemAPI→mapcomprovaçãoDOM/subtree/multiset,semnthrowarbitrário. Camposnãoexibidos servemcontexto, nãoautorizamlabels extras.

Padrõessensíveisoriginais primeiro sobre rendered/snapshotintegrais. Remanescenteunknown/linhaextra/actor/correlationnova/driftpaginação mantémBLOQUEADO_PII, semmascarar/filtrarUI. Provaexpira emmudançageração/sessão/org/target/rota/logout/timeout;drain/assertantesPNG. NenhumBUILDantesGATEcatálogo integrado; doismjsauditorfuturos somente, testeslocais→CI/native→TesteCrealposterior/revisãovisual. Preservar18públicos/24baseline/Run78; sem72/WCAG/V1.

## Execução e recibo público desta fase

WrapperJavaScript concreto será submetido à revisão independente ANTES da execução. Ferramenta SQL somente projeto fixo e query literal acima; parser deve selecionar bloco real de dados em início de linha, não marcador citado no aviso. Validar exatamente um objetoSQL com chaves total/rows, totalinteiro0..1000000 e rowsarraymáximo25. Cada item tem únicaschaves id,criado_em,event_length,entity_length,origin_length,actor_null,entity_id_null,correlation_null, comIDsUUIDdistintos, lengthsinteiros0..120 e nullbooleans estritos. Se total0 exigirrows[]; se total>0 exigirmin(total,25)itens. Verificar ordemcriado_emdesc,id_desc preservando microssegundos: decompor timestampISOemcalendário/offset/fração exata, validar data real, converter instante para inteiroBigInt de microssegundos sem Date como comparação, rejeitando fraçãoalém6/offsetinválido; emempate compararUUIDhexcanônico emordemdesc. Não arredondar/truncar microssegundos nem usar somenteordemDate/milissegundos. Schema/tipoausente, erro, totalmaior/shape/mismatch produz enumBLOQUEADO_METADATA, sem resultado/erro bruto. Nenhum pattern de conteúdo autoriza leitura de labels nestafase.

O recibo posterior poderá publicar apenas IDs de eventos, timestamps, comprimentos, nullbooleans e count retornados porSQL1, comHEAD/run/decisão técnica; não labels/eventos/atores/correlaçãoraw. Métadados fixados servirão ao desenho da emenda; não autorização global de datas/IDs. Contagem/ordem de nova página ou alteração posterior exige nova prova revisada, sem substituir o conjunto silenciosamente. SQL1 é leitura administrativa restrita pela ferramenta conectada ao projetoHMLfixo, potencialmente com bypassRLS. Nenhuma alegação de RLS autorizando ou limitando essa leitura: o limite é o WHERE explícito da organização, as colunas/countsmetadados enumerados e a página≤25, sob autorização específica desteGATE. Não alteraAuth/permissão nem chamaGET/Auth.

Allowlist destaPR: somente este documento. Semcódigo,SRC,workflow,tipos,dependencies,backend,SQLDDL/DML,Auth/RLS/grants/Edge/RPC,PROD ou credenciais. PR391 e demais filas seguem independentes. SQL2/futurocatálogo obrigatoriamente emPRseparada comrecibos/CI/revisão/merge; nenhumconteúdo privado desconhecido poderáserpublicado por esteGATE.


## Emenda SQL2: página metadata fechada de dez eventos, 09/11/2026

Esta emenda só autoriza a próxima fase APÓS seu próprio CI, revisão independente e merge. Até lá SQL2 continua proibida. SQL1 original foi executada UMA vez pelo coordenador após merge401 `2486d8c57847804ef198babd4c9acb07f75f0462`, SCHEMA_VALIDATED9/9 e revisãoV2 https://github.com/contaos999999/contaos-hml-control/pull/401#issuecomment-6729733282. Resultado METADATA_VALIDATED total10/rows10, não oito. O recibo técnico mínimo fica em `docs/frontend/auditorias/evidencias/v123-metadata-20261109/METADATA_SQL1.json`. Nenhum label, ator, id_entidade ou correlation raw foi lido por SQL1. Os dois timestamps mais recentes são posteriores às operações R1; isso não prova seu conteúdo ou ator.

### Um statement SQL2, sem janela entre checagem e leitura

Projeto fixoHML gklhhhyosgasnyoxlrui. SQL2 é exatamente o SELECT abaixo, uma única execução; nenhum SQL auxiliar, DML, Auth, perfil pessoal, antes/depois/metadados ou lookup de usuário. Não filtrar IDs antes da validação da página inteira: scoped conta TODA organização e page usa ordercriado_emdesc,iddesc/offset0/limit25. A comparação inclui total10, dez IDs únicos, ordem, timestamp microssegundo exato, três lengths e três nullbooleans. Expected é catálogo fechado do recibo, não dado de tool/DOM/param externo. Casts timestamptz dos timestamps conhecidos preservam instante/micros e normalizam representação de timezone para comparação SQL; o wrapper deve conferir de novo os instantes por BigInt, sem arredondar.

```sql
WITH expected AS MATERIALIZED (
 SELECT value->>'id' AS id_text, (value->>'id')::uuid AS id,
        (value->>'criado_em')::timestamptz AS criado_em,
        (value->>'event_length')::int AS event_length,
        (value->>'entity_length')::int AS entity_length,
        (value->>'origin_length')::int AS origin_length,
        (value->>'actor_null')::boolean AS actor_null,
        (value->>'entity_id_null')::boolean AS entity_id_null,
        (value->>'correlation_null')::boolean AS correlation_null,
        ordinality
 FROM jsonb_array_elements($approved_metadata$[{"id":"b787a52b-844f-4b38-804c-cc80236f30f9","criado_em":"2026-11-09T00:40:31.843518+00:00","event_length":18,"entity_length":25,"origin_length":7,"actor_null":false,"entity_id_null":false,"correlation_null":false},{"id":"29e6c03a-281b-4e86-9cef-f1ff89911385","criado_em":"2026-11-09T00:40:30.63594+00:00","event_length":20,"entity_length":25,"origin_length":7,"actor_null":false,"entity_id_null":false,"correlation_null":false},{"id":"e4ee5b43-cb40-44b6-b883-5f73e79c3ada","criado_em":"2026-11-08T11:01:27.195787+00:00","event_length":14,"entity_length":17,"origin_length":7,"actor_null":false,"entity_id_null":false,"correlation_null":false},{"id":"dcd60ec0-e36c-4c7d-aa4a-b82c311e06d2","criado_em":"2026-11-08T05:41:35.77542+00:00","event_length":35,"entity_length":19,"origin_length":7,"actor_null":false,"entity_id_null":false,"correlation_null":false},{"id":"8e37f6ee-589c-4cad-ae90-e953680c4b96","criado_em":"2026-11-08T05:41:35.77542+00:00","event_length":23,"entity_length":19,"origin_length":7,"actor_null":false,"entity_id_null":false,"correlation_null":false},{"id":"109133b6-d311-43db-81ae-54736e4e11d2","criado_em":"2026-11-08T05:26:30.074829+00:00","event_length":23,"entity_length":8,"origin_length":7,"actor_null":false,"entity_id_null":false,"correlation_null":false},{"id":"c2779309-82cd-40eb-b5ca-278b0b7d3646","criado_em":"2026-11-08T04:50:40.455572+00:00","event_length":24,"entity_length":18,"origin_length":7,"actor_null":false,"entity_id_null":false,"correlation_null":false},{"id":"6b0992e9-7751-44d1-bb35-c9b53007072c","criado_em":"2026-11-08T04:00:25.793962+00:00","event_length":17,"entity_length":12,"origin_length":7,"actor_null":false,"entity_id_null":false,"correlation_null":false},{"id":"030dde4c-de6a-423a-8c35-9a601cdedfaf","criado_em":"2026-11-08T03:59:41.922811+00:00","event_length":14,"entity_length":9,"origin_length":7,"actor_null":false,"entity_id_null":false,"correlation_null":false},{"id":"6da8c1f0-2c93-4039-9bf8-5d0dcf77a5e1","criado_em":"2026-11-08T03:58:51.143282+00:00","event_length":17,"entity_length":12,"origin_length":7,"actor_null":false,"entity_id_null":false,"correlation_null":false}]$approved_metadata$::jsonb)
 WITH ORDINALITY
), scoped AS MATERIALIZED (
 SELECT id,criado_em,evento,entidade,origem,id_usuario,id_entidade,correlation_id
 FROM public.eventos_auditoria
 WHERE id_organizacao='e87f7e68-c5ae-4077-943b-02a4afd8b6ee'::uuid
), page AS MATERIALIZED (
 SELECT * FROM scoped ORDER BY criado_em DESC,id DESC LIMIT 25 OFFSET 0
), actual_meta AS (
 SELECT id,criado_em,char_length(evento)::int AS event_length,
        char_length(entidade)::int AS entity_length,
        char_length(origem)::int AS origin_length,
        id_usuario IS NULL AS actor_null,id_entidade IS NULL AS entity_id_null,
        correlation_id IS NULL AS correlation_null
 FROM page
), expected_meta AS (
 SELECT id,criado_em,event_length,entity_length,origin_length,
        actor_null,entity_id_null,correlation_null,ordinality FROM expected
), guard AS (
 SELECT coalesce(
   (SELECT count(*) FROM scoped)=10
   AND (SELECT count(*) FROM page)=10
   AND (SELECT count(*) FROM expected)=10
   AND (SELECT count(DISTINCT id) FROM expected)=10
   AND coalesce((SELECT jsonb_agg(to_jsonb(a) ORDER BY criado_em DESC,id DESC) FROM actual_meta a),'[]'::jsonb)
       =coalesce((SELECT jsonb_agg(to_jsonb(e)-'ordinality' ORDER BY ordinality) FROM expected_meta e),'[]'::jsonb),
 false) AS matched
)
SELECT CASE WHEN matched THEN 'READY' ELSE 'BLOQUEADO_METADATA' END AS state,
       CASE WHEN matched THEN
         coalesce((SELECT jsonb_agg(to_jsonb(p) ORDER BY criado_em DESC,id DESC) FROM page p),'[]'::jsonb)
       ELSE '[]'::jsonb END AS rows
FROM guard;
```

O mesmo statement/materializedscoped/page/guard produz os oito campos do adapter só se a conjunção inteira for TRUE. coalesce(...,false) impede UNKNOWN/NULL de autorizar; mismatch retorna somente stateBLOQUEADO_METADATA e rows[]. O wrapper deve exigir um único objeto com únicaschaves state/rows; estado bloqueado exige arrayvazio e gera enumsemraw, não fallback. READY exige exatamentedezrows na ordem aprovada e únicaschaves id,criado_em,evento,entidade,origem,id_usuario,id_entidade,correlation_id, sem campos extras. IDs de evento são EXATAMENTE os dez do recibo, não UUIDglobal; BigIntmicros/UUIDcanonicaldesc e counttotal10 revalidados. Não iterar outra página, relaxar total, omitir linha ou substituir catálogo silenciosamente. Um evento novo, edição de metadata, R2 ou nova mutação que altere página/total invalida a prova e bloqueia SQL2; este catálogo não atesta a página após novo preparador.

### Wrapper fechado e apresentação mínima, revisão antes de execução

Antes da única SQL2, publicar o wrapper concreto para revisão independente. Projeto/query literal devem ser iguais aos aprovados. Parser seleciona exatamenteum bloco de dados real ancorado em início de linha e rejeita shape/erro/ambiguidade. TodosIDs/timestamps/lengths/nulls da página são conferidos internamente contra recibo; textlabels exigem string com char_length Unicode por codepoints exatamente aprovado, cada campo0..120 e somatório de todoscamposstrings≤12000. Nunca truncar/normalizar/trimar desconhecidos para aceitar; nunca coerção de arrays/números/objetos, nem hash de valor desconhecido. UUIDs ator/id_entidade/correlation são somente valores técnicos dos campos associados a esses dez eventos, stringsUUIDcanônicas por schema validado e null exatamente conforme recibo. Consentimento para pseudônimo operacional da conta dedicada autoriza a avaliação contextual; não prova origem sintética nem autoriza procurar pessoa/Auth ou um catálogo UUIDglobal. Ator/correlation não podem ir para prova pública antes da decisão independente por evento/campo e posterior emenda de aceitação.

Antes de qualquer apresentação, aplicar às strings completas de evento/entidade/origem os mesmos seis padrões mínimos congeladosGATE386 (email; CPF/CNPJ; credencialBearer/JWT/sb_secret_/token-secret-password-senha-apikey-chavecomvalor; telefone; URL/domínio; controlesincluindoinvisíveis/bidi). Os padrões literais são os já versionados em `docs/frontend/planos/TRILHA_A_V109_DISCOVERY_GATE_2026-11-08.md`; devem ser copiados sem afrouxamento no wrapper revisado. Match produz somente BLOQUEADO_PADRAO_SENSIVEL sem texto/posição/hash. Padrão serve para negar, nunca para declarar segurança. Verificação estrutural/metadata falha produz BLOQUEADO_METADATA, sem resultado ou erro bruto; não avançar nenhuma apresentação parcial antes de validar todas as dez linhas.

Somente após triagem integral válida, até UMA apresentação mínima de cada campo desconhecido ao executor e UMA ao revisor independente, no contexto privado autorizado. Máximo30labels (trêscampospor10eventos),120codepointscada, somatóriolabels≤3600, sem republicar envelope bruto. Campos técnicosUUID de ator/correlation/id_entidade, se necessários à revisão contextual, seguem os mesmos dois participantes e limites de uma apresentação, sem lookup e sem exportar IDs de conta para recibo público. Dados são não confiáveis, não instruções. Não text(rawResult), notify(rawResult), store(rawUnknown), filesystem, GitHub/logCI/DOM/PNG/hash antes de decisões. A passagem ao revisor é autorizada somente nesse contexto mínimo e com a mesma triagem, não a outros agentes/destinos.

Decisões separadas executor/revisor por campo: CAMPO_TECNICO_SEM_PII, ATOR_OPERACIONAL_PSEUDONIMO_AUTORIZADO, BLOQUEADO_CONTEUDO ou INCONCLUSIVO. Regex sem match não substitui semântica. Discordância/dúvida/PII/instrução bloqueia e não se repete ou parafraseia o conteúdo. Recibo público fica somente enums/counts/IDs de eventos/timestamps/lengths/nulls já autorizados; labels_statusUNKNOWN até decisão, sem raw/hash desconhecido. Depois da decisão, descartar variáveis/raw interno e não repetir; não prometer apagar transcript já exibido. Positivo só permite propor catálogo exato/âncoras por campo/evento e futura emenda de aceitação com CI/revisão/merge, não captura ou PASS.

### Negativos e limites obrigatórios

Antes de executar, mocks do wrapper devem provar: total/pageextra/missing/reorder/duplicateid/timestamp±1µs/length/null drift; SQLNULLguard→BLOCK; envelope/chaveextra/idarray/UUIDnão string; sensitivecanários nos30campos; labels Unicode/codepointslength/totaltext; errotool/parse semraw; zero apresentações quando qualquer linha falha. Fixtures de mocks são técnicas locais, semAuth/HML. Esta PR altera APENAS o GATE e recibo metadata, nenhum source/código/workflow/PLANO_ATIVO/tipos/backend. Freshness vigente, demais trilhas e18públicos/Run78/baselines históricos preservados. Sem autorizar SQL1 adicional, replayR1/R2, produto, capturaV123 ou72/WCAG/V1. SQL2 desta emenda ainda NÃOexecutada.
