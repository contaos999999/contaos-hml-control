# Trilha A P0: GATE de diagnóstico e retomada das fixtures após R1 parcial

## Evidência e limite da conclusão
A solicitação394 foi integrada em fca0798d3eba81e8daa3a876a255f34b66ff39f9, com primeiro pai866608620909bf313a6c2192736330222f9219ad e revisão canônica5820444155. O preparador42540864527 provou o disparo protegido, PR/revisão/CI/pais/nonce, par vazio, descoberta pública e proveniência110 antes de credenciais. A fila HML aguardou a auditoria manual42540293545 e conservou a concorrência sem cancelamento ou rerun.

O job privado128915387461 terminou em falha. O artefato13641024365, trilha-a-fixtures-42540864527-1, contém SHA256SUMS, receipts.json e report.json:
- ZIP SHA256 a7ebb6d3f23ebe61668bc03ab4e20e78556e0bcaf05a7c212dd63703b662c8c8.
- receipts.json SHA256 381bb6f66d750a957c98727c3b1cda465dfbcbbbcbd946b5122b7b55f2a604f9.
- report.json SHA256 ab2e5dfb57197fb3978b1d7510e71aed189a5072a0545c7b895cf9ab9d0c7607.

Download e três verificações de integridade foram conferidos. O report registra failure PREPARER_UNCLASSIFIED, phase SOURCE_AND_LIST, completed false, logoutVerified false, bindings null e v1Certified false; fonte866608620909bf313a6c2192736330222f9219ad, executor fca0798d3eba81e8daa3a876a255f34b66ff39f9 e deployment dpl_EcPdYyFYTAVTGEYpr1go2QrTfakY.

Há quatro recibos, correspondentes a duas operações reais, cada qual sealed e confirmed:

| Operação | requestId | payloadSha256 |
| --- | --- | --- |
| registrar_versao_fonte_v107 | 08141ffd-56c1-4c50-b58f-32912d1006b2 | b27048ba9358c4dea53acf3dc7bc8ee855cc75d6795f7ea7fa2b67681c7c7467 |
| aprovar_versao_fonte_v107 | 437a3c66-4bed-45e3-b73e-8696bdf4a791 | e02b9e79eac299f949cfd95f2da29b415efad1249c8c5447b49f59110a197769 |

Não houve confirmação da criação/publicação da lista ou das competências no artefato. Não declarar zero mutações,24fixtures prontas, logout verificado ou repetição segura por ausência de bindings.

A causa original exata não pode ser recuperada desses registros. O catch atual conserva apenas error.message que pertença ao conjunto fechado PREPARER_FAILURE_CODES; demais erros viram PREPARER_UNCLASSIFIED e não há subfase por await. Depois da aprovação confirmada existem leituras, reconciliação, fechamento do drawer, eventual ativação e navegação/listas. Não atribuir a falha a um desses passos, timeout ou fence sem evidência.

## Reprodução offline já obtida
Em cópia imutável de fca, createIntentBroker e confirmUiIntent reais, com transporte/UI/reconciliação mockados e sem rede/Auth, produziram sealed/confirmed para as duas RPCs. Um próximo await lançou TimeoutError sintético com canário. O trecho catch real, extraído do próprio módulo, gerou PREPARER_UNCLASSIFIED e permaneceu SOURCE_AND_LIST, sem revelar o canário ou distinguir o await.

Esse teste reproduz a perda de diagnóstico depois de confirmações persistidas. Não reproduz a causa original do HML nem certifica execução de UI/RLS. A implementação deve transformar esse caso em regressão no arquivo de teste existente antes de alterar o preparador.

## Nonces e autorização delimitada
trilha-a-fixtures-20261108-r1 está consumido e permanece proibido para nova execução. Não rerun, não editar a solicitação já integrada para reutilizar esse nonce e não reenviar as duas operações confirmadas.

Este GATE fixa o novo request_id trilha-a-fixtures-20261109-r2, somente para operation fixtures. Auditoria continua com seu contrato anterior e AUDIT_BINDING_PENDING. A solicitação mantém schema_version1 e as mesmas sete chaves de GATE383/395; o par vazio/vazio continua AUTO_DISCOVER e o par explícito divergente bloqueia sem fallback.

O parser de solicitação corrente deve aceitar somente o nonce fixtures R2 após o BUILD. O leitor de histórico deve reconhecer R1 somente como registro histórico consumido para preservar a prova de replay, sem torná-lo novamente executável. Não aceitar nonce arbitrário, escolher o mais recente ou ignorar erro de histórico. Revisão canônica e checks continuam vinculados ao HEAD/request_id exatos.

Nenhuma nova execução/Auth ocorre antes de CI, revisão independente e integração deste GATE e do BUILD posterior. A autorização operacional do titular permanece válida; não criar pedido humano adicional.

## Reconciliação somente leitura antes de negócio
No futuro R2, depois do login protegido existente e antes de armar qualquer intenção, executar fase fechada de reconciliação somente leitura, pela UI e pelas observações GET/RPC read-only já autorizadas. Não criar login externo, chamada administrativa, consulta irrestrita ou nova permissão de rede.

Vincular a retomada ao ledger acima e à sua integridade. Os quatro recibos devem representar exatamente os dois pares sealed/confirmed, mesmos requestIds/payloadSha256 e contexto sintético aprovado, sem uncertain ou resultado conflitante. Ausência, adulteração ou contradição bloqueia. Preservar a prova durável do R1 e registrar separadamente o novo run/nonce, sem reescrever recibos históricos.

Ler fonte e todas as páginas de versões pelos controles existentes; conferir organização/contrato/fonte e campos constantes aprovados. Expandir o texto real da versão e exigir conteúdo TXT e metadados exatos, vigência aprovada e id_arquivo null. O SHA256 do TXT é distinto do hash estruturado da versão; não confundir esses hashes nem inferir conteúdo pelo nome.

Exigir exatamente uma versão equivalente e já aprovada. Capturar seu ID e hash reais da observação oficial atual. Nenhuma versão, múltiplas equivalentes, versão não aprovada, conteúdo/metadados divergentes ou estado não comprovado bloqueiam antes de nova intenção. Não registrar nem aprovar novamente para resolver essa contradição.

Conferir também o estado real das listas pelo fluxo existente antes de decidir criar ou reutilizar. Lista equivalente já existente só pode ser reutilizada após todos os vínculos, regras, versão, publicação e capacidades correspondentes comprovados; duplicidade ou resultado ambíguo bloqueiam. Não escolher registros por ordem ou fabricar opções/IDs.

Na política de retomada R2, negar registrar_versao_fonte_v107 e aprovar_versao_fonte_v107 para o contexto desta preparação, inclusive com UUID novo. Reutilizar a versão aprovada comprovada. Demais operações permanecem limitadas ao plano373, UI oficial, capacidade vigente, persistência antes de POST e reconciliação posterior. A etapa de reconciliação não arma broker nem altera estado.

Conservar o teto global original de24 intenções desta preparação, contabilizando as duas já confirmadas. O R2 admite no máximo22 novas intenções; limite insuficiente exige nova emenda, sem aumento silencioso. Resultado incerto continua congelando o broker e proibindo retry.

## Diagnóstico técnico fechado
Preservar phase e failure existentes e acrescentar diagnóstico estruturado e limitado, sem stack, texto remoto, URL, seletor/label arbitrário, token, header, cookie, storage, credencial ou conteúdo de usuário.

Antes de cada await relevante do preparador/confirmador, registrar subfase de conjunto estático e o último passo concluído. Fechar o conjunto no código e testes: leituras da fonte/versão/texto, reconciliação de aprovação, fechamento do drawer, conferência de ativação, navegação V109, abertura de listas, leitura de modelo, comandos/reconciliações restantes e encerramento. Não derivar enum de mensagens, argumentos, nomes de registros ou DOM.

Capturar separadamente classe de falha de conjunto fechado, código reconhecido por allowlist e subfase ativa. TimeoutError sintético pode ser classificado como TIMEOUT sem persistir sua mensagem. Fence somente recebe classe/código específico quando houver enum nativo comprovado; unknown continua desconhecido. Não transformar hipótese em causa.

Capturar o diagnóstico primário antes do finally. Falha de logout/cleanup deve ficar separada, com logoutAttempted/logoutVerified e enum fechado de resultado; não sobrescrever a falha primária por erro de logout, binding ou fechamento. Não registrar CONTEXT_CLOSED sem prova técnica desse estado. O fallback PREPARER_UNCLASSIFIED pode existir, mas deve conservar a última subfase técnica conhecida.

Os recibos de negócio continuam persistidos antes do POST, com hashes e estados originais. O diagnóstico não substitui confirmação oficial, não amplia allowlists e não converte falha em PASS. Emitir report e SHA256SUMS inclusive em resultado parcial.

## BUILD posterior, RED e checks
Este PR é somente GATE. BUILD apenas após integração e CI/revisão deste documento, restrito a:
- scripts/hml/prepare-visual-fixtures.mjs e scripts/hml/prepare-visual-fixtures.test.mjs.
- scripts/hml/authenticated-visual-audit.mjs e scripts/hml/authenticated-visual-audit.test.mjs, somente nonce corrente/histórico e barreiras da retomada.

Não alterar workflows, source/public, tipos, dependências/lock, produto, backend, Auth, Supabase, ambientes, secrets, PROD, projeto HML ou política de transporte. Preservar RQ01/RQ02, preflight actions:read isolado, consultas públicas privadas sem Authorization, concorrência compartilhada HML, descobridor existente, ancestralidade real antes do checkout,19metadados, SSR/110, oito provas nativas, cache de30segundos antes de login e logout.

RED deve demonstrar, sobre código real, as duas confirmações seguidas de await que falha com perda de subfase e fallback atual. Acrescentar negativos antes de BUILD para R1 executável, ledger adulterado/incompleto/uncertain, duas operações proibidas mesmo com novo UUID, fonte ausente/múltipla/não aprovada, lista ambígua, tentativa de escrita durante reconciliação e teto global excedido.

GREEN exige retomada mockada que comprova estado já aprovado sem reenviar registro/aprovação; preserva cada recibo R1; usa IDs/hash atuais apenas após leitura oficial; só libera operações restantes depois da reconciliação. Injetar falha em cada await/subfase e no logout; garantir falha primária preservada, subfase correta e canários de PII/URL/token/stack ausentes. Provar nonce R2 corrente e R1 somente histórico, sem enfraquecer unicidade ou casos de GATE395.

No mesmo HEAD final: suites aplicáveis, lint/formato focal, Zero-Drift/LOCK e workflows autenticado/fixtures SUCCESS, oito casos causais nativos e suplemento visual isolado, revisão independente sem Critical/Important. Não confundir testes mockados com prova HML.

## Próxima execução e saída
Somente após BUILD integrado criar novo PR documental de solicitação, contendo apenas o JSON R2 com approved_parent_sha atual, CI e revisão canônica no HEAD exato. Manter main estável durante execução. Não alterar nem rerun394/R1.

Revisar artefatos íntegros após R2, registrar operações realmente confirmadas, fonte/version/listas/competências realmente vinculadas, falhas e logout. Se o novo diagnóstico bloquear, conservar o estado e tratar a causa comprovada sem replay de mutação incerta. Atualizar checkpoint/matriz com resultados reais. V1,184casos,24fixtures e72critérios continuam sem conclusão por esta emenda.
