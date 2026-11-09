# Trilha A: GATE DISCOVERY de metadados técnicos V123

Deriva PLAN385, sem aceitação antecipada. Fonte frontend866608620909bf313a6c2192736330222f9219ad: TrilhaAuditoria.tsx blob7ef709c1a7bae0fb53f7255e78240d1b35a039f4 e auditoriaDados.ts blob446e34255c98fdeb99182889b8992028d9573be3. Base de publicação fca0798d3eba81e8daa3a876a255f34b66ff39f9. Snapshot/ack/backend devem ser reancorados pelo rito de freshness vigente; não atualizar declaração normativa às cegas. Este GATE autoriza apenasSQL1 e esquema metadata após CI/revisão/merge do próprio GATE, nuncaSQL2. NenhumSQL foi executado na preparação.

## Prova pretendida e categorias

A página inicial atual pode conter eventos novos após o preparador; não congelar oito eventos históricos nem aceitar eventos arbitrários por UUID. Ator id_usuario pode ser pseudônimo operacional autorizado para auditoria HML, sem identificar pessoa, alegar synthetic ou exigir igualdade com sessão. correlation_id é identificador técnico de eventos específicos, não autorização UUIDgenérico. Não consultar Auth, perfis pessoais, nomes/emails, antes/depois/metadados.

Fase1 somente metadata de página atual. Fase2 requer catálogo de IDs/lengths/timestamps revisado e emenda integrada antes de ler campos desconhecidos. Fase3 propõe catálogo fechado aceitação GET/DOM, somente após semântica independente e CI/revisão/merge. Nenhuma fase implica captura ou PASS.

## Fase1 metadata-only autorizada somente após integração

ApósGATEintegrado, confirmar esquema porinformation_schema apenas nomes/tipos necessários (public.eventos_auditoria: id,id_organizacao,criado_em,evento,entidade,origem,id_usuario,id_entidade,correlation_id) e executar uma vez SQL:

```sql
WITH page AS (
 SELECT id,criado_em,evento,entidade,origem,id_usuario,id_entidade,correlation_id
 FROM public.eventos_auditoria
 WHERE id_organizacao='e87f7e68-c5ae-4077-943b-02a4afd8b6ee'::uuid
 ORDER BY criado_em DESC,id DESC LIMIT 25 OFFSET 0
)
SELECT id,criado_em,char_length(evento)::int AS event_length,
       char_length(entidade)::int AS entity_length,
       char_length(origem)::int AS origin_length,
       id_usuario IS NULL AS actor_null,id_entidade IS NULL AS entity_id_null,
       correlation_id IS NULL AS correlation_null,
       (SELECT count(*)::int FROM public.eventos_auditoria
        WHERE id_organizacao='e87f7e68-c5ae-4077-943b-02a4afd8b6ee'::uuid) AS total
FROM page ORDER BY criado_em DESC,id DESC;
```

Retorno máximo25objetos. Campos técnicos ID/timestamp/lengths/nullbooleans/count apenas; sem atores/correlação raw ou label/evento desconhecido. Usar wrapper interno para rejeitarshape/limites, sem erro bruto. Registrar count0comoestado vazio real, sem inventar eventos.

## Fase2 controlada, ainda não autorizada

Os metadados permitirão emenda com conjunto fechado IDs/timestamps/lengths/total. SQL2 só depois dessa emenda integrada, revalidando página ordenada completa/total/metadados e contexto no mesmo statement. Ler somente os oito campos do adapter para25IDs no máximo, com eventos/entidade/origem≤120chars, totaltext≤12000. Dados fora da página/colunas proibidos.

Wrapper confirma technicalIDs exatos e UUIDs ator/correlation por tipo/formato apenas para triagem; isso não libera captura. Ator/correlation persistem só após catalogação de seus bytes por evento sob categoria operacional autorizada. Se tipo correlation nãoUUID ou data inválida, bloquear e revisar, semconverter/arredondar. Seis padrões GATE386 sobre labels completas antes de apresentação; qualquer padrão bloqueia linha sem texto. IDs técnicos de ator/correlation aprovados para avaliação não serão tratados como JWT/token nem usados para lookuphumano. Nãohash/arquivo/GitHub/logCI/DOM/PNG até decisão semântica independente.

Até1apresentaçãomínima aoexecutor e1aorevisor independente porcampo desconhecido, contexto privado autorizado. Decisõesfechadas CAMPO_TECNICO_SEM_PII,ATOR_OPERACIONAL_PSEUDONIMO_AUTORIZADO,BLOQUEADO_CONTEUDO,INCONCLUSIVO. Regex não prova significado; origem/enums desconhecidos necessitam revisão real. Campo recusado não é citado/repetido. SemAuthcapture ou novaquery para provar identidade.

## Ordinary GET e futura aceitação

UI faz GET existente /rest/v1/eventos_auditoria origemSupabaseHMLfixa, selectliteral id,criado_em,evento,entidade,origem,id_usuario,id_entidade,correlation_id; filtroid_organizacaoexact; ordercriado_em.desc,id.desc; offset0limit25; página inicial comtodosfiltros vazios. Nenhum POSTnovo/fetchNode/política de rede ampliada. Fonte exige sessão e podeConsultarAuditoria, mas auditor não observaAuth.

FuturoGATE de aceitação deverá projetar no browser somentecampos permitidos, exigir catálogoeventos/contexto/ordem/cardinalidade egeneration. UI exibe tabela Eventos de auditoria da organização, cincocolunasDataehora/Evento/Entidade/Usuário/Correlação; atorNULL→Sistema. dataBr usa Intl.DateTimeFormat pt-BR, America/Sao_Paulo,dateStyleshort,timeStylemedium e NÃOremovevírgula. Exigirformataçãofontereal reproduzida paracada timestampcatalogado, semregexdatas/UUIDglobal. AssociaçãorowIDs nãoestãonoDOM: projetarordemAPI→mapcomprovaçãoDOM/subtree/multiset,semnthrowarbitrário. Camposnãoexibidos servemcontexto, nãoautorizamlabels extras.

Padrõessensíveisoriginais primeiro sobre rendered/snapshotintegrais. Remanescenteunknown/linhaextra/actor/correlationnova/driftpaginação mantémBLOQUEADO_PII, semmascarar/filtrarUI. Provaexpira emmudançageração/sessão/org/target/rota/logout/timeout;drain/assertantesPNG. NenhumBUILDantesGATEcatálogo integrado; doismjsauditorfuturos somente, testeslocais→CI/native→TesteCrealposterior/revisãovisual. Preservar18públicos/24baseline/Run78; sem72/WCAG/V1.

## Execução e recibo público desta fase

WrapperJavaScript concreto será submetido à revisão independente ANTES da execução. Ferramenta SQL somente projeto fixo e query literal acima; parser deve selecionar bloco real de dados em início de linha, não marcador citado no aviso. Validarobjetosexatos/max25/IDsUUID/distintos/ordemdecrescente e lengths0..120, nullbooleans, timestampISOválido e totalinteiro0..1000000. Se total0 exigirarrayvazio; para total>0 exigirmin(total,25)linhas e mesmototalemtodas. Schema/tipoausente, erro, totalmaior/shape/mismatch produz enumBLOQUEADO_METADATA, sem resultado/erro bruto. Nenhum pattern de conteúdo autoriza leitura de labels nestafase.

O recibo posterior poderá publicar apenas IDs de eventos, timestamps, comprimentos, nullbooleans e count retornados porSQL1, comHEAD/run/decisão técnica; não labels/eventos/atores/correlaçãoraw. Métadados fixados servirão ao desenho da emenda; não autorização global de datas/IDs. Contagem/ordem de nova página ou alteração posterior exige nova prova revisada, sem substituir o conjunto silenciosamente. SQL1 usa RLS/projeto autorizado da ferramenta, não alteraAuth/permissão nem chamaGET/Auth.

Allowlist destaPR: somente este documento. Semcódigo,SRC,workflow,tipos,dependencies,backend,SQLDDL/DML,Auth/RLS/grants/Edge/RPC,PROD ou credenciais. PR391 e demais filas seguem independentes. SQL2/futurocatálogo obrigatoriamente emPRseparada comrecibos/CI/revisão/merge; nenhumconteúdo privado desconhecido poderáserpublicado por esteGATE.
