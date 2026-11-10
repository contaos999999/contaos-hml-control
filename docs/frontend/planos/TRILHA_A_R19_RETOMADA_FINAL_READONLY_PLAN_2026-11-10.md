# R19: retomada final somente leitura dos bindings

**Objetivo:** recuperar a apresentação de setembro já registrada e completar as fixtures V117/V119/V120 sem repetir qualquer operação de negócio.

**Arquitetura:** corrigir o sucessor causal de leitura após registro, mantendo o predicado estrito da aprovação. A execução R19 usa uma retomada somente leitura, valida os documentos históricos antes de efeitos e aceita os IDs administrativos somente depois de prova autenticada no produto HML existente.

**Tecnologia:** Node24, módulos mjs, Playwright/Chromium e SDK/UI reais do frontend0024. Nenhuma dependência nova, alteração de produto ou deploy.

**Especificação e fontes:** pedido vigente do titular; AGENTS.md/ADR-DEV-002; GATE547/BUILD548; prova real42734294198/job129559618536; checkpoints317/6756068006 e138/6756068316; lookup administrativo317/6756125286 e138/6756125670; reprodução FULLCHAIN6756125705; confirmação Nodecrypto6756174697.

## Restrições globais

- V1 permanece não certificada. API42596392357/13663262831/SHA5e2177afc72b78e0a8e6109bb8795633886c8052c37a756832f616a8c5066795 preservada, sem reexecução.
- HML exclusivo gklhhhyosgasnyoxlrui; frontend0024b3c6739ab6296ec12338f11cf792d3a5f84b/deploymentdpl_8FQFvCqVE2UMVPyg8SVsPDurZSCh. Sem PROD, deploy, backend, SQL adicional, migration, RLS, AuthAdmin, Storage, SRC, public, YAML, dependências ou alteração de types.ts8ea7750b75fd9d76b29c36ce7613392e3ab65e19.
- PLAN documental e GATE distinto precisam de CI/revisão/merge antes de BUILD. Autorização vigente dispensa nova pergunta genérica; a sequência técnica continua obrigatória.
- Futuro BUILD somente scripts/hml/authenticated-visual-audit.mjs, scripts/hml/authenticated-visual-audit.test.mjs, scripts/hml/prepare-visual-fixtures.mjs, scripts/hml/prepare-visual-fixtures.test.mjs.
- Nenhum rerun/dispatch/reenvio de R17/R18. A184+24 históricos e C8/64 são recortes separados; preservar19 inventariadas sem repetição ou promoção a certificadas.

## Estado comprovado

OriginalR18: request545/merge8d055951838fee29664563bed5ee26bac4f55bd8; Fixtures42731273678FAIL attempt1/private129550112703; oposto42731273705SUCCESS/privateSKIP. Artefato13725830880/31346B/ZIPSHAb68f2edd99a4ce6e4728b74a899cd39bb1ec96f0ecd42048cbbdbbc6d47fb7eb. Leitor548/merge815dce2a4015e2bb1b5ec23e70633537ab008e62 validou28hashes/25históricos e uma prova real.

Report3911B/SHA c3ef3286f2e49d17226f4b747188a6959b9dcc11997a3cae251cbd0d7dac4590; receipts2524B/SHA1db601b5a947072bcc1a05437a5fae053bd98f1527d4f958e730079f7678cd77; observation280B/SHAf03ea467e40803a792ac4606e35e8f15de5d2fd5746d72428eb732509c57662f. PHASE_TIMEOUT em COMPETENCY_GET após COMPETENCY_UI; logouttrue/cleanupnull, completedfalse. Dois pares sealed→confirmed: aprovar_apresentacao UUIDdd8e544b-af5b-4e23-bef2-b7c9ae2d0096/payload1f2c3e05a38e9ff781a623f86be7d1dd4999f8a9174b59119a9c9b2f21558976; registrar_apresentacao UUID40546f93-f8f4-4686-a78a-11aa3069eda7/payload1b7017e2fd916ba61c64d7da6f227f67ef7d2b8c9941f814c0176cda435a590a.

Próxima baseline:17 confirmações totais+2 reservas/base19/teto24/saldo teórico5. R19 autoriza ZERO novos negócios; o saldo5 NÃO é permissão de uso. Preservar reservas R11/R15, aprovaçãoOct/R17 e quatro operações R16. Documento históricoR18 continua15+2+2/count19/max7, sem reescrever sua história.

## Causa reproduzida e ajuste mínimo

Reprodução offline usa createOfficialObserver real, ACK válido de aprovação, VGpode/100, ACKUUID de registro e três GETs SDK contextuais de apresentação/pacote/itens. Esses três readbacks passam; VG posterior aguardando/versão2 foi observado, mas rpcRead ainda escolhe floor da aprovação e expira. Controle da mesma VG sem floor passa. Isto confirma contradição do observador; o report original não publicou o valor VG recebido e não deve receber um valor inventado.

Acrescentar ao mapping de readbackTargets(registrar_apresentacao) um target próprio obter_visao_geral_competencia/p_id_competencia. Em expectedReadback, tratar esse target de registro com ACKUUID válido da mesma mutação admitida, resposta/observação posteriores, competência/org/contrato exatos, situacao aguardando_contratante e snapshot100. Conservar os três targets de tabelas e a validação integral do pacote/itens. A seleção pelo ordinal posterior substitui a expectativa anterior sem apagar floors. Não aceitar aguardando no predicado da aprovação, não relaxar ACK da aprovação, não remover barreiras ou ampliar timeout. Registro falho/pendente/foreign/stale não pode satisfazer o sucessor. O consumidor command faz confirmAfter de três tabelas antes do overview final; nenhum novo aguardo antecipado deve criar deadlock.

## Documento histórico obrigatório

Exportar R18_RECOVERY_DOCUMENT e validateR18RecoveryDocument(input) no auditor e importar/reexportar no preparador. Mesmo contrato fechado dos anteriores:12 campos string ordenados/own-data/enumeráveis, proto padrão ou null, sem Proxy/getter/símbolo/extra, raw pretty2LF congelado. Canonical8003ASCIIbytes/SHA256de5e5bd71a3e33960ce39510a86cdfddc8fb702fc41d9788df248a209c4df5ac, confirmado por Nodecrypto e cálculo independente.

Campos: schema contaos.fixture.recovery-r18.v1; workflowRun42731273678; artifactId13725830880; requestId trilha-a-fixtures-20261110-r18; harnessSha8d055951838fee29664563bed5ee26bac4f55bd8; zipSha256b68f…7eb completo; reportSha256/receiptsSha256/observationSha256 e reportRaw/receiptsRaw/observationRaw originais acima. Validar schemas/relacionamentos e quatro recibos exatos antes de Git/API/ENV privado/bootstrap/browser/budget/broker/login e de todas as entradas de recuperação. Preservar14documentos anteriores e DocR17 exatos.

Testes de histórico continuam usando os14documentos anteriores byteexatos. Ao migrar um helper genérico de arm positivo, a ação de teste não pode repetir aprovaçãoSept ou registroSept agora confirmados: usar somente projeção técnica permitida de registroOct no modo histórico não-readonly, semAuth real. Negativos de replay devem continuar chamando as RPCs originais, sem reutilizar helper renomeado que mascare a operação. Não inventar terceiro mês, substituir UUIDs históricos ou afrouxar ownerseals para obter PASS.

Próximo ledger9campos count19/priorConfirmed17/priorReserved2/newArmedCount0/maxIntentions24/maxNewIntentions5, semfrozen/pending/sent. Recovery10 mantém confirmedBefore17/maxNew5. Writer preserva28 nomes/25históricos e acrescenta receipts-r18.json2524B/1db601…cd77 e recovery-r18.json8003B/de5e5b…f5ac:30dados+SHA256SUMS31/HISTORY27, hashes completos conforme este PLAN. Três arquivos correntes são própriosR19. Novo receipts.json vazio canônico55B; qualquer arm/receipt novo reprova R19.

## Origem administrativa dos candidatos, sem atestado JWT

A consultaSELECT prévia, restrita aos dois UUIDs sintéticos/org/contrato/protocolo/forma e sem mutação, encontrou setembro aguardando_contratante/100.00, apresentação eb6d5b1c-8b64-418b-aa82-bf1f29d41768 e pacote f29715a6-0664-415a-8903-68be9d7c5d66. Hash82e0dc9adfbbce6956f87dfe8b78230f71eb9d7e4399571f86210c0f1c6e5c81, número1/statusapresentado/congeladotrue/1item. Outubro permanece pode_apresentar_contratante/100.00. Não repetir SQL.

R18_REGISTRATION_CANDIDATE é constante técnica fechada e congelada com projeto, fonte/deployment, org/contrato, competênciaSept79bdc139-ed10-4c91-905e-b32b9a824d27, apresentação/pacote/hash/número/status/contagem e proveniência ADMIN_LOOKUP. Não é proof de acesso. O GATE deve fechar campos/ordem exatos antes BUILD.

Único documento SSR adicional permitido: /competencias/79bdc139-ed10-4c91-905e-b32b9a824d27/apresentacoes/eb6d5b1c-8b64-418b-aa82-bf1f29d41768. Obter sua prova pública real de source/deployment/HTML/módulos antes secrets, por caminho constante; nunca inventar proof.documents ou usar goto/rawfetch para contornar a prova. Entrar por goKnown existente com mesma barreira15s, fence, drain, fresh e before/afterguards. Sem discoveryquery/listagem nova, alias/env/URL livre ou endpoint novo. Preservar metadata10GETlógicos/master0/cache9/retry2x5s/deadline60s e grafo110/1476785 dentro limites existentes.

## Tarefas e interfaces

### 1. Sucessor causal e documentos

- [ ] Teste RED fullchain real: aprovação→ACKregistro→3GETs→VGaguardando; antes falhaPHASE_TIMEOUT, sem dormir5min; controle semfloor e negativos ACK/foreign/pending/stale.
- [ ] Implementar somente o target VG próprio do registro e seu predicado, preservando aprovação e tabelas.
- [ ] RED/GREEN de validateR18RecoveryDocument, baseline17+2/max5, UUIDs/payloads R18 consumidos mesmo com UUID/fundamento diferente e writer30/SHA31/H27.
- [ ] Executar foco Node real e commit, sem falha de setup contada como RED.

### 2. Retomada somente leitura

Interface nova resumeR18Bindings(io,sourceList), consumindo documentos válidos, candidato constante, broker owner-bound e fontes/listas já reconciliadas. Produz o mesmo shape {state,competencies} de prepareCompetencies, sem novos campos públicos. No relatório, flags de aprovação são fatos comprovados pelos recibos e pacote, nunca uma permissão atual inferida para escrever; não forçar allowed_actions.apresentar=true em setembro já registrado. Registros mensais devem conter IDs reais de requisito/documento/execução/opinião e capabilities comprovadas; setembro acrescenta presentationId/packageId/packageHash/packageState.

- [ ] RED: runtime anterior nega registro existente e não recupera V120; provar consumidor real, não stub que inventa IDs.
- [ ] Implementar ramo de retomada que lê contexto/docs/analise/parecer atuais dos dois meses, conserva Octpode/100 e exige Septaguardando/100. Reusar contratos oficiais existentes e selos owner/generation dos readbacks; nunca preencher IDs históricos sem confirmar seus relacionamentos atuais.
- [ ] Abrir somente a rota SSR fixa candidata e usar consultarProtocolo/GETs originais da UI. Exigir apresentação id/competência/org/contrato/protocolo/forma exatos; pacote id/hash/número/status/congelamento; itens contextuais/paginação oficial e contagem real1. Candidato ausente/contraditório/múltiplo/pending/stale/foreign bloqueia, nunca refaz aprovação/registro.
- [ ] Criar broker com modo interno readOnlyRecovery:true literal no bootstrap R19. arm deve rejeitar antes de persist/contagem/rede; policy deve negar OPTIONS/POST de qualquer BUSINESS_RPCS, inclusive se authorizeRecovery for chamado por engano. Sem parâmetro ENV ou request livre para desativar. Default dos consumidores históricos em testes preservado.
- [ ] R19 chama resumeR18Bindings, sem entrar no driver de criação/revisão/registro; usar estado confirmado só após todos os readbacks. completed:true somente após fontes/listas/bindings íntegros, logouttrue e cleanupnull.
- [ ] GREEN/negativos com IOespias:0commands/0arms/0businessREQUESTcontinuations, ownerseal real, candidato administrativo insuficiente isoladamente, retorno exato com registro já existente.

### 3. Integração e prova real

- [ ] Testes dos quatro módulos, helpers, lint/formato e CI/Zero-Drift/LOCK no HEAD final. Preservar native18/SDKqueue isolada/sourceOrdering/preflightDrain/probe exato; ampliar assertions internas readonly sem inflar contagens ou eliminar casos. Testar native UI V120/3GETs com origem/contexto e POST de negócio bloqueado antes rede.
- [ ] Revisão independente commitbound0Critical/Important, merge normal sem force/rebase/squash; CI do merge/freshalias.
- [ ] Controller: gastarR18, nonce futuro trilha-a-fixtures-20261110-r19, operationfixtures/AUTO_DISCOVER, ancestrais PLAN/GATE/reader548 e anteriores reais. PLAN/GATE não disparam Auth. Request futuro em PR separado JSON7/pai exato/reviewcanônica/CI2 e freeze ANTESmerge; ambos originais attempt1 terminais, semrerun/dispatch.
- [ ] Inspeção protegida originalR19 após terminal, reader apropriado e reconciliação factual; exigir0novosrecibos,19ledger,bindings completos. Só depois PLAN/GATE separado seleciona C8/64 e habilita audit com PNG/DOM/SHA/resultados/revisão; não remover AUDIT_BINDING_PENDING globalmente agora.

## Foco da revisão

Cada condição abaixo tem teste na tarefa proprietária: sucessor semACK/admissão (1); VG estrangeira/antiga ou estado futuro usado na aprovação (1); candidato administrativo semprovaUI (2); invocação acidental de comando ou POSTautomático (2/3); pacote/itens ou fonte/deployment divergentes apesar de UUID válido (2/3). Ausência de prova mantém bloqueio, nunca é certificação.

## Rollback e aceite

Rollback somente por PR revert rastreável e gates, nunca desfazer negócio confirmado ou apagar recibo. Este PLAN não autoriza deploy/alteração de segurança, não certifica UI/27/V1 e não altera A184+24. Aceite operacional exige R19 real somente leitura completo e depois os64casos C8 com prova individual; CI, mocks, lookup administrativo e19inventariadas não substituem essa prova.
