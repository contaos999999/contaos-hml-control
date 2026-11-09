# Trilha A: DRAFT GATE de descoberta V123 após fixtures finais, página inicial de 25

Estado: PREPARATÓRIO, SEM EXECUÇÃO. Base frontend0f53c8892108cdc6168212cb870d0b3ed604d0f7, contexto canônico herdado da431 sujeito à freshness viva. Deriva PLAN385, dos controles de descoberta401/408 e do catálogo421, sem reutilizar a autorização de SQL1/SQL2, seu limite10 ou seus IDs. V1 permanece NO-GO. Esta PR altera somente este documento e a seção documental própria no PLANO_ATIVO.json. Não altera424, código, catálogo, recibos históricos, requestR2, nonce, deployment ou dados.

## Estado real R2 e condição futura

R2 run42553093050 terminou FAIL: receipts[] vazio,0novos intents/operações business comprovados; recovery deR1 reconhecido, sem ser nova operação. Falha primária TIMEOUT_SOURCE_FORM_FIELD e logoutfalse/LOGOUT_FAILED, conforme diagnóstico do coordenador, ainda sujeito ao checkpoint dos artefatos. Isso NÃO comprova que o catálogo10 expirou por novas operaçõesR2, nem prova ausência global de qualquer evento externo. Não inferir validade atual ou expiração automática apenas pelo nomeR2. Nenhuma consulta é autorizada para resolver essa incerteza. A preparação433 fica reservada para depois das fixtures finais, futuramenteR3 sob seu próprio GATE, correção de contexto e recibos reais.

## Objetivo e limites desta etapa

Preparar a descoberta exata da página que a UI V123 consulta depois das fixtures finais e somente quando houver novas operações produtoras de eventos efetivamente comprovadas nos recibos aprovados. O objetivo é identificar os 25 eventos da página0 sob o contrato legítimo, sem selecionar conteúdo dos seis campos nesta etapa. Não executar SQL, Auth, SDK contra HML, nova captura ou lookup durante a preparação. CI deste documento é validação documental, não prova da página nem autorização antecipada.

Mesmo após CI/revisão, nenhuma consulta pode ocorrer antes de: fixtures finais, futuramenteR3, encerradas ou interrompidas com estado terminal reconciliado; recibos e ledger reais validados pelo coordenador e existência de novas operações efetivamente comprovada; congelamento de novas operações produtoras de eventos; integração deste GATE por merge normal; e revisão independente do wrapper exato de metadados. Se o estado das fixtures ou a produção de novos eventos estiver incerto, continuar bloqueado sem tentar descobrir por consulta exploratória. Uma nova operação produtora de eventos efetivamente confirmada expira o catálogo10 da421 para execuções seguintes, mesmo se outras operações falharem. Recovery somente de operação históricaR1 e tentativa sem intent/business comprovado não são esse gatilho.

A preparação não autoriza leitura dos seis conteúdos, atualização do catálogo, BUILD adicional, execução424 ou TesteC. A fase de conteúdo exige outro GATE após os metadados terem sido aprovados. Não executar a antiga SQL1/SQL2, ampliar sua lista de IDs, selecionar os dez antigos como amostra ou usar recibo histórico como prova da página nova.

## Fonte e página legítima

Conferir novamente, antes do futuro wrapper, os blobs da fonte: src/lib/administracao/auditoriaDados.ts e src/components/administracao/auditoria/TrilhaAuditoria.tsx. Na base preparada, o adapter conserva blob446e34255c98fdeb99182889b8992028d9573be3 e o componente blob7ef709c1a7bae0fb53f7255e78240d1b35a039f4. Deriva de fonte suspende este escopo até revisão documental, sem aceitar novo contrato por aproximação.

O campo temporal real é criado_em. A expressão conceitual order(created_at,id) significa aqui, exclusivamente, order=criado_em.desc,id.desc; não criar ou consultar coluna created_at. Contrato da UI existente:

- rota /administracao/auditoria, página0, seis filtros vazios;
- GET /rest/v1/eventos_auditoria na origem HML já fixada nos gates;
- select literal id,criado_em,evento,entidade,origem,id_usuario,id_entidade,correlation_id;
- id_organizacao=eq.e87f7e68-c5ae-4077-943b-02a4afd8b6ee;
- order=criado_em.desc,id.desc, offset=0, limit=25.

Não mudar filtros, buscar próxima página, completar com outra consulta ou excluir eventos que pareçam alheios. O GET é contrato de referência; este GATE não autoriza dispará-lo. O SDKcount vem de headers na aplicação, enquanto o observador424 não lê headers. A futura metadataSQL terá total próprio do mesmo snapshot; não alegar countHTTP observado, equivalência temporal com um GET não executado, RLS global ou identidade de sessão.

## Envelope proposto para uma única metadataSQL posterior

O wrapper futuro deve fixar projeto HML, organização literal acima, relação public.eventos_auditoria e um único SELECT somente leitura em snapshot único. Deve produzir a página com ORDER BY criado_em DESC,id DESC, LIMIT25 e OFFSET0, além do total agregado dessa organização no mesmo statement. Sem SELECT*, joins, funções de aplicação/RPC, DML, Auth, Storage, funções mutáveis, paginação auxiliar ou descoberta de schemas.

Somente dados autorizados no resultado:

1. envelope de versão e ordinal de página, limites literais25/0, total agregado e observedRows;
2. para cada linha, ordinal1..N, id do evento como UUIDstring e criado_em como timestamp com microssegundos preservados;
3. para cada um dos seis campos evento, entidade, origem, id_usuario, id_entidade e correlation_id, somente tipo JSON e comprimento em pontos de código quando string; null deve ser distinguido de string vazia e de ausência. Campo não string tem comprimento null e tipo exato, sem converter conteúdo para string.

Não retornar valor, prefixo/sufixo, amostra, hash, codificação, representação de erro ou serialização dos seis conteúdos. A classificação de tipo/comprimento acontece dentro da projeçãoSQL. Não carregar os seis valores em Node/browser para depois escondê-los e chamar isso de metadata. UUID do evento e instante são metadados técnicos de delimitação desta fase, sem licença geral para outros UUIDs/datas.

O resultado esperado para o objetivo é25linhas. O count real não é predefinido: se a organização tiver menos25, registrar apenas a divergência de contagem e suspender a proposta de catálogo25; não fabricar linhas, solicitar outra página ou repetir. Count inteiro seguro >= observedRows; observedRows entre0e25 e igual a min(total,25) no mesmo snapshot. Não assumir total25 quando a página cheia não prova isso. Se total ultrapassar o limite de inteiro seguro do wrapper, bloquear.

O wrapper deve validar o bloco original integral antes de apresentar qualquer parte: marcador de bloco ancorado e único, JSON sem chaves repetidas, envelope/chaves exatas,25ordinais quando aplicável, IDs únicos e formatoUUIDstring, instantes Gregorianos válidos com fração<=6 comparados por BigInt, ordenação composta exata inclusive empates e tipos/comprimentos limitados. Não usar Date para truncar a guarda. A conexão e erros não podem imprimir payload, queryresult, stack, URL ou getters; usar apenas enums fechados e contagens limitadas, com sinal sentinela privado para abortar.

A literalSQL e o wrapper finais não estão aprovados por esta preparação. Devem ser apresentados concretamente, testados localmente com mocks e revisados por duas pessoas/agentes antes da execução única. Revisar projeçãoAST/texto original, ausência dos seis valores no retorno e ausência de qualquer chamada real nos testes. Testar0/24/25/26rows, total divergente, duplicata, empate de timestamp,1µs, timestamp inválido, ordinal fora de ordem, objeto/string/nested/extra key, chaveJSON duplicada, Unicode/codepoints e erro com getter que nunca é lido. Não repetir a consulta em timeout ou parsefailed sem novo rito documental.

## Vinculação aos recibos das fixtures finais e eventos de outras frentes

O coordenador pode usar somente recibos das fixtures finais e ledger já capturados legitimamente e classificados. Registrar run, source/harness/requestnonce aprovados, estado terminal, operações confirmadas e se o recibo contém binding explícito de event_id. Não abrir nem pedir novo raw, SQL ou Auth para preencher lacunas. Ausência de event_id no recibo significa BINDING_EVENTO_R2_NAO_COMPROVADO; não fabricar a ligação por label, horário aproximado, ator ou ordem.

A metadata não contém evento, origem, entidade ou ator. Portanto, ela não demonstra que uma linha veio deR2 ou da TrilhaC. Pode reconhecer somente IDs que um recibo aprovado vincule expressamente. Mesmo nessa hipótese, o vínculo não aprova os seis conteúdos. Anotar separadamente: total da página; IDs com vínculo explícito da execução final; IDs sem vínculo; eventosC comprovados apenas por recibo existente. Zero evidência deve permanecer NAO_COMPROVADO.

ReferênciasR2 nesta seção descrevem o método de vínculo, não atribuição da execução falha atual. A execução finalR3, seu nonce e recibos precisam ser fixados após autorização e prova próprias. R2vazia não fornece binding novo.

A UI inclui a página organizacional inteira. Evento deC, processo externo ou outro ator não pode ser filtrado/removido para preservar catálogo de fixtures. Qualquer associação desconhecida seguirá para proposta do GATE de conteúdo ou ficará bloqueada. Não inferir conteúdo, aprovação de versão, identidade humana ou dado sintético a partir de nome de operação, sucessoR2 ou UUID conhecido.

## GATE posterior obrigatório para os seis campos

Após a única metadataSQL e revisão independente, um novo documento deve fixar os IDs e instantes efetivamente retornados e a ordem da página25. Só esse GATE posterior poderá propor uma única leitura dos seis campos para esse conjunto exato, sem ampliar universo por IDs históricos, predicado de ator, amostra ou busca por termos. Antes de executar, exigir CI/revisão/merge próprios e wrapper exato com triagem integral dos padrões sensíveis vigentes no original de toda a página, antes de apresentar qualquer campo.

Reutiliza-se apenas o consentimento já concedido para tratar id_usuario como candidato a ATOR_OPERACIONAL_PSEUDONIMO_AUTORIZADO, sem lookup de Auth/perfil/pessoa e sem afirmar identidade sintética. Cada nova associação evento/campo precisa de decisão semântica efetiva do coordenador e revisor independente; valores ou atores repetidos não herdam aprovação. Não copiar catálogo10 como licença global.

Se houver conteúdo desconhecido, sensível ou discordância: nenhum raw em GitHub, arquivo, hash, diagnóstico, log ou outro agente. Handoff mínimo somente entre coordenador e revisor designado, se o GATE posterior o autorizar expressamente; sem consultas adicionais. Os seis padrões congelados de386 são pré-triagem, não prova de ausência dePII: semântica de todos os seis campos continua obrigatória.

Somente depois da concordância integral poderão existir novo recibo de proveniência e proposta de catálogo de aceitação por evento, em PR documental separada. Publicar antes disso apenas enums/counts e metadados autorizados por este GATE. Não publicar hashes de conteúdo desconhecido. Nenhum raw é redigido, sanitizado, recortado ou mascarado para obter aceite.

## Preservação do BUILD424 e critérios de fechamento

424 permanece pronta para revisão em c51802ecd692928f236b59ed7557357d0f885e9c, com catálogo10 histórico intacto. QuatroCI SUCCESS: Zero42553068288, LOCK42553068231, Auth42553068266 e Fixtures42553068273. Job128952705137 comprovou native8/visual1/SYS04browser2/V112browser1/V123browser1;302unitários,289PASS13SKIP0FAIL. Isso não prova validade atual nem expiração automática do catálogo10 após aR2falha, e não certifica HML/184/WCAG/V1. Não fazer merge main durante o freezeR2.

- [ ] Fixtures finaisR3 possuem estado terminal, novas operações comprovadas, recibos/ledger conferidos e ausência de operação pendente; não declarar completo pelo disparo do workflow.
- [ ] Fonte/organização/contrato25 e freshness confirmados; este GATE passa CI/revisão independente e é integrado somente após fixtures finais e prova de novas operações.
- [ ] MetadataSQL/wrapper concretos revistos com testes negativos,0callsreais nos mocks, limites e cleanup verificados.
- [ ] Uma execução somente metadata, sem retry automático; resultado classificado inteiro e recibo somente metadata/enums/counts.
- [ ] GATE de conteúdo novo, com IDs/instantes/ordem reais, CI/revisão/merge antes de selecionar seis campos.
- [ ] Concordância semântica completa antes de persistir conteúdo ou preparar catálogo novo e BUILD separado.

Até essas provas, estado de descoberta pósfixtures é NAO_EXECUTADA, conteúdos NAO_LIDOS, catálogo novo AUSENTE e autorização operacional BLOQUEADA. Não alterar seisGET, V115, wire411, V109, V112, SYS04, factory, diagnóstico, preparador, workflow, sourceproduto, backend, tipos ouPROD. Rollback desta preparação: revert exclusivamente documental, preservando recibos, dados e bloqueios.
