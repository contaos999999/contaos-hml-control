# GATE R16: recuperação da operação incerta R15 e retomada dos 184 casos

PLAN523 integrado deve ser ancestral deste GATE. Correção void sob GATE525/BUILD526 permanece separada; ambos os BUILDs e revisões devem estar integrados antes de qualquer request autenticado. Não autoriza PROD, SQL, AuthAdmin, service_role, novo deploy, rerun original ou bypass.

## Literal de recuperação obrigatório

Documento schema contaos.fixture.recovery-r15.v1, exatamente12 campos nesta ordem: schema, workflowRun, artifactId, requestId, harnessSha, zipSha256, reportSha256, receiptsSha256, observationSha256, reportRaw, receiptsRaw, observationRaw.
workflowRun42703523206/artifact13713326447/requestIdtrilha-a-fixtures-20261109-r15/harnessdd895a5c30acbb39c821153d86477985ae94b939/ZIP49a1075f93ac229929399b940f8a7792bd6aa7d70ead4beb7449006d7ae68262.
Raws EXATOS da única prova FIXTURE_INSPECTION_PROOF original42705850329/job129462302474: report3364bytes/SHA038d291631f6d0badc89c014cbfbb137557a780039fb16b8d5c1fc9e53dee3c6; receipts1299bytes/SHA3652e7766ef218067642137effb805d448c72f86da3c402a583b5fcf7aa29007; observation423bytes/SHAfc97c8e25c55840331737b307680f9846b11f0b2e455a04154230a99b455a614.
Canônico JSON.stringify(document,null,2)+LF =6244 bytes ASCII/SHA256de792c8803bbe232871c9eac468ad8baede31a88b1ec5aa238647a15267b645a. Não reconstruir campos ausentes, não editar históricos.
Validador own-data/ordem exata/proto/proxy/accessor/extra/nonenumerable/symbol/canonical/hash de cada raw e documento, identidade cruzada. Exigir antes broker, budget, source, reconciliação, runtime, bootstrap e login, em todos os caminhos de entrada; cache técnico de provas zeroAuth preservado. Documento inválido impede qualquer efeito.

## Reserva, causalidade e proteção contra repetição

Histórico R15 mantém ledger count12/confirmed10/reserved1/newArmed1/maxNew13 e duas linhas sealed→uncertain da mesma intenção; não convertê-las em confirmação. Próxima execução: confirmedBefore10/priorReserved2/count inicial12/maxNewIntentions12/maxIntentions24; newArmed=count-12. Reports/recovery/broker/bootstrap coerentes, sem reembolso ou promoção.
Negar requestUUID6e6b6afb-2216-42ef-bd89-571301e97e1f e payloadSHA256bc724b1683269170b4b1d8ddd98f405bb1c07d5c1dde5709e63802099365e8b3. Negar semanticamente aprovar_parecer_interno para competência Outubro50c26274-a36f-48e0-b2fe-5a1caf5d6a49 neste org/contrato, mesmo com novo UUID/parecer/fundamento. Manter deny R11 solicitar_parecer_interno Outubro.
Retomar apenas por leitura ordinária UI/SDK já permitida, contexto exato org e87f7e68-c5ae-4077-943b-02a4afd8b6ee/contrato be89ef7e-d839-46c0-9cfb-4da81edf8b74. Antes de QUALQUER arm, inclusive Setembro, exigir GET fresco, único latest version/hash64/statusaprovado/aprovado_em, selo generation/fingerprint e invalidação se contradito depois. Se parecer atual está aprovado com timestamp/contexto/ID/fence frescos, seguir sem nova aprovação e sem promover recibo R15. Se ausente/não aprovado/divergente, falhar antes de arm. Não inferir opinionId dos bindings ausentes. Nenhuma consulta Auth/SQL adicional.
Se necessário persistir mapeamento opinionId↔competência, derivar exclusivamente do GET oficial contextual já observado, antes de qualquer arm, falhando sem prova e sem ampliar catálogo/endpoint. FonteV117/V119/V120 continua pendente até estado integral real.
Writer preserva22dados na ordem e acrescenta receipts-r15.json/recovery-r15.json:24dados+SHA25/HISTORY21. Erros e sucesso/abort mantêm históricos byte-exatos.

## Escopo BUILD e verificação

Somente scripts/hml/authenticated-visual-audit.mjs, scripts/hml/authenticated-visual-audit.test.mjs, scripts/hml/prepare-visual-fixtures.mjs, scripts/hml/prepare-visual-fixtures.test.mjs. Sem YAML/SRC/public/tipos/deps/ENV/RPC/RLS/Storage/settings. Não ampliar diagnóstico privado global.
RED causal com implementação atual: DocR15 obrigatório/hostil/hash/contexto; orçamento10+2+12; nova aprovação Outubro negada com UUID/parecer/fundamento distintos e sem leitura; R11 preservado; readback aprovado pula escrita; readback nãoaprovado bloqueia; writer24+SHA25/HISTORY21; todos entrypoints zeroefeitos seDocinválido. Nenhuma fixture unitária representa aprovação real R15.
GREEN Node suites relevantes/lintfmt/Zero/LOCK no HEADfinal, probe110módulos1476785bytes0024/8FQ/18nativos/sourceOrdering/preflightDrain, revisão independente0C/I e merge protegido normal. Nenhum status artificial/force.
NonceR15 consumido; próximo exclusivo trilha-a-fixtures-20261109-r16. Controlador exige ancestrais deste GATE e BUILDvoid aprovado; R16 request7campos separado após próprios checks2/reviewcanônica/latest/merge/upstream/freeze/attempt1. Não dispatch/rerun, nenhum GET autenticado fora job protegido.

## Escopo vinculante de encerramento

Prioridade titular TrilhaA EXATAMENTE184 = inventário208 menos24 V114/V116/V118 nas quatro larguras e dois temas. Preservar24 nas duas origens (18 desktop/tablet run42496235106/art13623288351 e6mobile run42542802124/art13642651045); nunca atribuir PASS atual automaticamente. Referências64/19/27 em PLAN522/523/GATE525 não substituem184. Dentro184:96Auto+56PII+8V102+24fixtures, V115 incluído. Gate432 de bindings/catalog/provenance/selection continua posterior obrigatório antes captura184. PNGs, DOMs, SHA256 e revisão independente novos;72 critérios individualmente. Público18 PR324 e revisões204 antigas preservados em suas origens, sem repetir salvo regressão. V1 não certificada sem DoD integral.
