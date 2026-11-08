# Trilha A P0: PLAN para os bloqueios restantes de privacidade

Issue #317. Base de consulta main `100602333871bf197fe891a9696d1ed92d0ba659`. Escopo autorizado pelo titular: auditoria HML dos 208 casos privados, com MASTER fornecido para essa finalidade. A execução pendente permanece parcial; preservar as 18 provas públicas aprovadas e os recibos históricos. Este PLAN contém somente desenho e não autoriza execução da investigação controlada, GATE implícito, código ou certificação.

## Objetivo e categorias de prova

Remover somente barreiras cuja causa e natureza técnica possam ser demonstradas em SYS04, V109, V123 e nos dois extras ARIA de V112. Não exigir que todo dado técnico seja sintético: distinguir CAMPO_TECNICO_SEM_PII, ROTULO_TECNICO_OBSERVADO, FIXTURE_SINTETICA_COMPROVADA e ATOR_OPERACIONAL_PSEUDONIMO_AUTORIZADO. Essas categorias exigem catálogo fechado por campo/contexto, não dicionário ou regex global. A autorização da auditoria não autoriza captura de Auth, nomes/emails de usuários, novas áreas pessoais ou alteração de dados.

Fontes já identificadas: GATE372 e sua emenda V115; revisão independente Run78; docs/frontend/auditorias/TRILHA_A_CONTINUACAO_AUTENTICADA_2026-11-08.md; src/lib/administracao/auditoriaDados.ts (blob446e34255c98fdeb99182889b8992028d9573be3); TrilhaAuditoria.tsx (blob7ef709c1a7bae0fb53f7255e78240d1b35a039f4); CompetenciasContrato.tsx (blobfe04e9a64d05c2262ecbc6ad4e60bded70a659c3). Revalidar blobs no futuro GATE. Ausência de prova não se transforma em PASS.

## SYS04: organizações e rótulos

Preparar registro fechado de IDs e labels efetivamente visíveis no seletor. As três labels legacy SSRF/SYS01/V107 podem ser propostas como ROTULO_TECNICO_OBSERVADO se o recibo comprovar os bytes exatos, ID e natureza técnica segura, sem inventar construtor ou alegar synthetic. Este PLAN não conhece nem autoriza por aproximação os bytes dessas três labels: o GATE posterior precisa listá-los e revisá-los.

As organizações CRUD-G com app_metadata.synthetic=true, scope=P0-CRUD-GLOBAL-HML, nonce e vínculos já comprovados pertencem a registro separado FIXTURE_SINTETICA_COMPROVADA. Não estender esse marcador às organizações legacy ou paralelas; não ler Auth para reconstruir a prova. Vincular cada entrada ao recibo/construtor previamente publicado e à resposta ordinary já consumida pela UI. Rótulo adicional, novo ID, nonce divergente, duplicação ou campo desconhecido mantém bloqueio. Não excluir organizações da tela nem ocultar regiões para obter captura.

## V109: descoberta controlada da descrição

Registro conhecido: lista1613484c-87ee-4276-a464-d1a378134fc9; nome AUDITORIA TRILHA A REQUISITOS 20261108; contrato be89ef7e-d839-46c0-9cfb-4da81edf8b74; organização e87f7e68-c5ae-4077-943b-02a4afd8b6ee. Descrição com79caracteres e updated2026-11-08 04:50:40.455572+00. A criação UI legítima consta do dossiê de continuação. Nome, comprimento e criação não comprovam sozinhos o conteúdo da descrição.

Após CI, revisão e integração deste PLAN, preparar um GATE DISCOVERY separado antes de qualquer leitura. Ele deve fixar o projeto gklhhhyosgasnyoxlrui, tabela/colunas reais verificadas, SQL SELECT exato com ID+organização+contrato, count=1 e char_length=79. Sem joins pessoais, Auth, escrita, exportação indiscriminada ou seleção de outras linhas. A leitura única da descrição deve acontecer somente depois da integração desse GATE e por canal que assegure conteúdo exclusivamente em memória interna de revisão, sem aparecer no resultado bruto de ferramenta/log/arquivo. Se a ferramenta disponível sempre devolver corpo bruto ao transcript, o desenho não está apto e a leitura não ocorre por essa via.

O GATE deve especificar previamente o protocolo: verificar count/relações/comprimento antes de expor o campo ao revisor; avaliar padrões sensíveis sobre conteúdo integral em memória; revisão independente do significado e natureza técnica; produzir apenas CAMPO_TECNICO_SEM_PII ou BLOQUEADO_CONTEUDO/INCONCLUSIVO e contagens fechadas. Não publicar descrição raw, hash, screenshot, DOM ou outro artefato enquanto a revisão independente não declarar CAMPO_TECNICO_SEM_PII. Padrões sensíveis bloqueiam sem exportar conteúdo. Falta de origem/significado conclusivo também bloqueia. Apagar memória após decisão. Não substituir a descrição, não editar dado para fabricar conformidade.

Se classificada como técnica segura, uma emenda posterior deve registrar a origem e os bytes autorizados somente após essa decisão, com revisão/CI/integração antes do BUILD; não presumir autorização automática por ter passado padrões. O campo e timestamp devem ser vinculados à linha exata e GET legítimo atual. Outra descrição, alteração de comprimento/data/registro, prefixo/sufixo ou vizinho desconhecido fecha o caso.

## V123: eventos e pseudônimo operacional autorizado

A autorização da auditoria HML permite propor o UUID técnico do ator como ATOR_OPERACIONAL_PSEUDONIMO_AUTORIZADO dentro de eventos fixos, sem afirmar synthetic, identificar pessoa ou exigir que o ator seja o usuário da sessão. UUID não é senha/token; sua aceitação continua limitada ao campo Usuário, contexto e conjunto de eventos comprovado. Não capturar respostas Auth, consultar Auth/users, mapear nome/email ou inspecionar token para satisfazer esta prova.

O catálogo final deverá ser levantado depois da execução autorizada do preparador #373, quando ocorrida, para refletir a página inicial e paginação realmente auditadas. Oito eventos é apenas o inventário histórico observado, não limite eterno nem autorização para qualquer evento futuro. Antes do GATE de catálogo, usar somente leituras técnicas mínimas autorizadas, nunca antes/depois/metadados pessoais. Fixar IDs de eventos, relação com organização/contexto, enums de evento/entidade/origem, datas exatas, ator UUID exato e correlation_id técnico de cada evento. Mudança do conjunto exige revisão e catálogo novo, sem aceitação por formato UUID.

Emenda explícita ao GATE372 deve permitir esses campos específicos, hoje excluídos, sem ampliar outros campos/rotas. Observar somente GET ordinário já feito pela UI; projeção técnica dentro do browser antes da fronteira Node. Âncoras: tabela Eventos de auditoria da organização, linha vinculada inequivocamente ao ID técnico do evento e respectivas colunas Data e hora/Evento/Entidade/Usuário/Correlação. Índice de linha ou igualdade aparente isolados não bastam. Corpo integral continua classificado; nenhum mascaramento ou recorte de dados desconhecidos. O recibo persistente poderá usar referência ao registro aprovado e enums/contagens; a política de retenção do UUID/correlação em PNG/DOM deve estar expressa no GATE fechado.

## V112: dois extras de estrutura ARIA

Hipótese a comprovar: rowheader da competência e meter do percentual não estão na lista inicial literalWords, enquanto o componente usa th scope=row e role=meter. Não afirmar causa resolvida por coincidência de contagem. Reproduzir localmente DOM/ARIA do componente fonte com os dados técnicos já comprovados, sem credencial, publicar somente enums/contagens e fonte/hash do teste. Confirmar papéis extras e sua posição estrutural.

Se provado, autorizar somente os tokens estruturais exatos na tabela/campo associado à competência59072760-4420-4598-82dd-367f41a79e89, rowheader11/2026 e meter do percentual legítimo. Nome/valor do meter continuam submetidos à política integral. Não adicionar todos os papéis ARIA globalmente, remover nós ou ignorar nomes acessíveis. Cards responsivos exigem prova/âncora própria; não herdam a autorização da tabela. Se os extras forem outros, registrar OTHER e manter bloqueio até emenda baseada em fonte.

## Sequência, escopo e prova de conclusão

1. CI e revisão independente deste PLAN; integração somente pelo coordenador.
2. GATE DISCOVERY separado, com contratos/SQL/canal de memória/protocolo de revisão e recibos técnicos mínimos. Nenhuma leitura da descrição antes da integração desse GATE.
3. Descoberta estritamente permitida, revisão do conteúdo e preparação dos catálogos finais, com GATE de aceitação separado ou emenda revisável conforme prova.
4. CI/revisão/integração do GATE e recibos antes de BUILD; revalidar main, backend normativo, snapshot/ack,25blobs, catálogo100/97 e LOCK-TYPES.
5. BUILD futuro limitado a scripts/hml/authenticated-visual-audit.mjs e scripts/hml/authenticated-visual-audit.test.mjs; documentos/recibos/checkpoint somente nos caminhos exatos fixados pelo GATE. Nenhum SRC, tipos, Auth, RLS, grants, RPC, Edge, dados, workflow, dependência, assets, PROD ou política de destinos alterados.
6. RED real para as barreiras demonstradas; GREEN com negativos de campo/contexto/bytes/query/cadeia/duplicação/geração, canários em campos excluídos e zero exportação de desconhecidos. Mesma geração de sessão/documento/rota/organização/target, drain/assert antes de classificar e capturar; invalidar em logout/close/navegação/troca/timeout. Preservar padrões sensíveis, opaquemedialimit, cerca, paridade/freshness, oito provas causais nativas e suplemento visual.
7. Teste C real e revisão visual independente somente depois de CI/merge/proveniência exata. Cada caso mantém frontend/harness/deployment/run/DOM/PNG/SHA256 próprios. Falha ou desconhecido bloqueia somente o que a prova suportar, sem promover parcial a aceite global.

As 18 provas públicas,24baseline e resultados históricos Run78 permanecem com sua origem. Execução de privacidade não substitui validação visual, CRUD, fixtures,72BRAND ou WCAG. Trilha A e V1 continuam não certificadas até evidência completa. Rollback futuro: revert mínimo do catálogo/classificador, sem apagar dados ou reescrever provas. Este PR altera somente este documento.
