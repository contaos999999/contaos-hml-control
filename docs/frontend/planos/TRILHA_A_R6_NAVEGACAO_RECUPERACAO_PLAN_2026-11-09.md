# PLAN: navegação contextual e recuperação das cinco confirmações R5

**Objetivo:** retomar as fixtures sem repetir as oito operações confirmadas e corrigir a navegação que impede o vínculo documental das competências. Issue317/P0, autorização contínua do titular; este PLAN não executa Auth nem autoriza novo request antes de GATE, BUILD, CI e revisão próprios.

**Arquitetura:** o harness segue somente links reais da aplicação e observa os requests ordinários existentes. Recibos fechados ancoram a recuperação; contexto, rede nativa, cancelamento, scanner e fonte viva continuam fail-closed. Produto/frontend/Supabase e RLS/RPC não mudam.

**Tecnologias:** Node24, Bun1.4.4 pinned já aprovado451, Playwright1.58.2/Chromium1208, módulos ESM existentes. Sem dependência nova.

**Especificação:** docs/frontend/planos/TRILHA_A_BUN_PINNED_BOOTSTRAP_R5_GATE_2026-11-09.md e docs/frontend/planos/TRILHA_A_POS_R2_BINDING_AUDIT_GATE_DRAFT_2026-11-09.md; checkpoint3176734608682.

## Evidência real e causa

Base main3fb48eff9f89a2c89e3c9f2cc6fed3e4d0ede99d; BUILD451merge77f3de9c07f374f4b665b9171e3bca3f0e93e71b aprovado. Backend fonte5459536e7f7121e2f26758841acd520f84e0ad9d; revalidar antes de cada merge/execução sem relaxar freshness. HMLF3/437 READY observado, nunca presumir deployment=harness.

R5run42578223154/attempt1/job129030891867/artifact13656530451 terminou PREPARER_INCOMPLETE em FINAL_READBACK, completed=false, logoutVerified=true e cleanupFailure=null. ZIP6363B SHA2565380c9c1a5b18e75e7a0e09e41902c826eae0a9cb1f9589f7f34a819f463985b; seis de seis membros do manifesto conferidos por Root e revisor independente. report.json SHA256c631d266351fa609600dbcdbe60f1d1a54d8fac76e740c10d80017277a6f55ba; receipts.json SHA256fd97a387cae0e16af65c6923f453ac83262e58447176c3c558b1c10bc15c5eeb. R1/R3 históricos intactos. Ledger original count8/priorConfirmed3/newArmed5/maxNew21/frozen=false/pending=false/sent=false; preservar literalmente esse histórico. Futuro total confirmado8 e máximo novo16, teto global24.

As cinco operações R5 formam dez rows, pares sealed/confirmed, identidades exatas iguais ao report e IDs disjuntos de R1/R3:
| RPC | requestId | payloadSHA256 |
|---|---|---|
|executar_comando_lista_v1|da4e924e-2ed1-4ccd-b847-fc95a44cc383|54e6e65b94eb4874e50fe5764348e1a67804aa4df82547033dd9ccff7690f340|
|executar_comando_lista_v1|31ddaf25-fb66-4cdc-be84-8612e77b17dc|3cbe64f69528818238bf16a0dcf02d739bab03f7eea62aff5a7f4f58e52b6a73|
|executar_comando_lista_v1|cf429997-d0b6-45bd-880a-be4b103f79bb|7c3f9c79fb8b58ff93186827b68ca6dbbe147787d21f8b15c1eb555977bc0b3f|
|criar_competencia|499dc2a2-c0a2-4a19-9ccb-11c534096f7e|1c8f192c563e7dc74b6889b916fdf33eb563ca05dbb10d638c51b351dc7f8083|
|criar_competencia|655ae00f-ed36-4a13-a637-bc8b77375783|1a90a321fa24f8af03c9dc9997b18d21981353cd86ce7e06ba2c51af698e0415|

Bindings parciais reais: fonte8b942e46-a29b-40d9-8ad4-04aaf9124a34/versão1ebbfd0b-c50c-405d-8806-321f18e179e0; sourceHashd8cce65f32958346c44456c4b4ab554d84368453051a5d1adc6e49b69e1870d1; listabf71906b-87a4-42f5-8371-5f597ef2ad9b/versãoe49ef6dd-13b0-491d-8646-5a7bcd5298cf/iteme7065876-a620-4dbb-9b4e-992fa4fead83. Outubro50c26274-a36f-48e0-b2fe-5a1caf5d6a49 e setembro79bdc139-ed10-4c91-905e-b32b9a824d27, ambos partial/COMPETENCE_DEPENDENCY_BLOCKED, sem vínculo downstream comprovado. Organizaçãoe87f7e68-c5ae-4077-943b-02a4afd8b6ee/contratobe89ef7e-d839-46c0-9cfb-4da81edf8b74 fixos.

Causa no fonte: approvedContractFile chama link direto para /contratos/{id}/documentos quando createOrReuse deixou a UI em /competencias/{id}. O menuContextualV1 real (src/lib/navegacao/menuV1.ts blob3e8efae411ac992f0acbe81f81904eec8154b350 no produto437) no ramo competencia oferece somente Contrato da competência para /contratos/{id}; documentos do contrato pertence ao ramo contrato. link() exige anchor visível e falha fechado. Não trocar por page.goto/evaluate/fetch. O catch por competência restringe mensagens a COMPETENCE_* e descarta a causa PREPARER_SPA_LINK; retorno partial faz o diagnóstico global ficar somente PREPARER_INCOMPLETE. Causa no fonte não autoriza inventar o erro runtime descartado, nem demonstra dependência backend139.

## Escopo fechado do BUILD posterior

Modificar somente:
- scripts/hml/prepare-visual-fixtures.mjs e seu .test.mjs: navegação/contexto, diagnóstico fechado por competência e recuperação R5 sem replay.
- scripts/hml/authenticated-visual-audit.mjs e seu .test.mjs: registro de nonce R6 e vínculos de recuperação/protocolo necessários, mantendo audit bloqueado.
Documentos PLAN/GATE/PLANO/ESTADO próprios. Nenhum workflow, bootstrap, SRC/public, lock/dependência, tipos, transporte ou backend neste escopo.

## Revisão e casos que devem falhar fechados

- Origem competência não expõe anchor direto de documentos; usar primeiro resumo do contrato, depois documentos, com prova de URL/contexto e links reais.
- Cache legítimo de arquivo/versão não cria uma nova chamada HTTP por conveniência. Antes do GATE, conferir política real de cache/loader e fechar como provar cadeia imutável já observada e pai atual, mantendo IDs/hash/contexto/exclusividade. Se não houver prova segura no transporte existente, bloquear e emendar antes do BUILD.
- Erro interno recuperado parcialmente deve conservar enum/subfase seguros no report existente sem expor message/stack/URL/DOM/payload/PII. Getters/proxies/cause arbitrários não podem ser invocados por diagnóstico.
- Recibos R5 adulterados, par ausente/duplicado/uncertain, identidade divergente, bindings trocados e histórico reescrito bloqueiam antes do login.
- Recriação da lista, publicação repetida, nova competência de mesmo mês, reset de budget, nonce histórico e request sem ancestry bloqueiam. Nenhuma compensação de negócio.

## Tarefa1: regressão e navegação real

- [ ] Adicionar teste RED que consuma o menu/fonte real do produto, parta da competência e prove a ausência do link direto e o caminho contrato→documentos; falhar com o harness atual, sem mock que invente anchor ausente.
- [ ] Executar esse teste RED no CI antes de corrigir produção; registrar HEAD/run/asserção exatos. O executor auxiliar expirou e Vercel retornou402; não fingir teste local executado.
- [ ] Implementar dois hops por links existentes e fechar o readback da cadeia contratual com as regras de cache realmente verificadas no GATE.
- [ ] Testar contexto errado, anchor ausente, cardinalidade, arquivo/versão/sha divergente e cache legítimo sem novo request. Manter todos negativos nativos existentes.

## Tarefa2: diagnóstico e ledger8+16

- [ ] Adicionar RED para erro interno não COMPETENCE_* seguido de retorno partial; a primeira causa global deve ser capturada pelo classificador já existente antes do resumo por competência, conservando enum/subfase minimizados no report sem novos campos. O code parcial COMPETENCE_* não vira prova de dependência; UNKNOWN continua fechado.
- [ ] Validar documento R5 literal pelas hashes acima, schema/chaves exatos, identidade/run/head/deployment, cinco pares confirmados e ausência de pending/uncertain. Relacionar binding com origem antes de usar.
- [ ] Calcular priorConfirmed8/maxNew16 sem reescrever R5 maxNew21. Negar replay das oito confirmações, inclusive via requestId novo/payload equivalente; não negar operações futuras distintas necessárias.
- [ ] Reconciliar fonte/lista/item e ambas competências existentes por leituras ordinárias/UI, exigindo IDs/mês/organização/contrato exatos, sem criação substituta nem novo SQL/RPC/query. Nov continua59072760-4420-4598-82dd-367f41a79e89.
- [ ] Registrar nonce futuro literal trilha-a-fixtures-20261109-r6, mantendo R1–R5 consumidos, attempt1 e prova fechada de R4 zeroAuth. AUDIT_BINDING_PENDING permanece.

## Tarefa3: GREEN, revisão e execução original

- [ ] Rodar testes completos dos quatro módulos e instalador, todos os guards Chromium source-real e regressões de produto, lint/format/TS/Zero-Drift/LOCK e Teste C aplicável; registrar skips reais separadamente.
- [ ] Revisão independente no HEAD final; integrar BUILD somente após CI verde e revalidar fonte viva.
- [ ] Novo PR de solicitação única JSON de sete chaves, pai main aprovado e nonce R6; CI e review canônica, merge protegido e congelamento até terminal original. Sem rerun/dispatch alternativo.
- [ ] Auth somente no workflow autorizado com secrets existentes, prova HML atual, runtime/fence/concorrência nativos, logout finally. Não ler/publicar credenciais.
- [ ] Conferir artefatos/recibos/bindings/logout/SHA256 independentes. Falha/partial mantém desconhecidos bloqueados, não compensa/reexecuta confirmação.
- [ ] Somente após vínculos finais reais finalizar GATE pós-fixtures e BUILD do auditor; depois208 protegidos com PNG/DOM/SHA256, 24fixtures separados e reconciliação dos184 originais.

## Preservação e conclusão

18públicos aprovados run42439381231/artifact13600583129/HEAD8ca8308a/merge4510491 preservados, sem repetição. Run124/PR430/204PNG102DOM/306hashes somente origem866608/a688/EcPd, sem reatribuição ao deployment atual. Critérios72 exigem decisão individual; parcial, skips e N/A documentados não viram PASS. Sem declaração V1 certificada até DoD integral. C13 e backend permanecem independentes; não alterar PROD/segurança/cobrança para contornar falhas do ambiente.
