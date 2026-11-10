# PLAN R17: recuperar R16 e corrigir a prontidão pré-aprovação

## Objetivo e limites

Concluir as fixtures sem repetir operações confirmadas, conservando o portão oficial de100%, as duas reservas históricas e a segurança existente. Este é o plano documental anterior ao GATE e ao BUILD. Não autoriza Auth, nonce, rerun, deploy ou mudanças no backend. V1 e a auditoria continuam pendentes.

Arquitetura mantida: preparador e controlador atuais, Node/Playwright já pinados, consumo do Supabase HML exclusivo. Escolha técnica: recuperação canônica R16 e correção mínima do consumidor; uma sessão separada apenas de diagnóstico acrescentaria outra Auth sem corrigir a incompatibilidade estática já demonstrada. Nenhum fluxo paralelo ou aumento de privilégio.

## Baseline e evidência

Main5f2b4e29e1fefd57ca88878d61ada3370edf4024. Inspeção protegida42716637333/job129499783558 validou o artefato R16 original13717457216/run42713640896/S10cac45b655d5eece9881fdf83545887c371d548, ZIP25487bytes/SHA39eb9b34bd2c3b58df9b28cb666e0911538b24763eeb744f75fd5675a91a7305. Report3922/SHAf93d7b7a5dd9ffc7a65a13a52b399be61830113528af1bc081ed5a83f37938b2, receipts5032/SHA3700fce7ae66a58fa7f3c9d1a30d11f10eda794d41c0a1ff2e4302ca9645e4b6, observation280/SHA3a270be6970c5e46168c33d53b2ea245ab722cd954713e1f9dd9d312c796fcb8.

Falha real COMPETENCE_PRESENTATION_GATE nas duas competências; observação firstFailurenull, logouttrue/cleanupnull, completedfalse. Quatro efeitos novos em Setembro foram CONFIRMADOS: criar_documento_competencia_v115, solicitar_analise_competencia, solicitar_parecer_interno, aprovar_parecer_interno. Ledgercount16/priorConfirmed10/priorReserved2/newArmed4, todos4confirmed. Não repetir esses efeitos, nem a aprovação incerta R15 ou a solicitação incerta R11.

## Incompatibilidade estática e preservação de100%

No produto0024b3c, parseVisaoGeral aceita competencia.percentual_conformidade como number|null; V119usa allowed_actions.apresentar e situação e exibe portao.percentual. Já o preparador exige snapshot100 antes de aprovar, além do portão canônico100. Assim, recusa um DTO legítimo pré-aprovação com snapshotnull/0. Isso é demonstrável no consumidor; não comprova qual campo falhou no R16 real, cujos escalares não foram publicados.

Separar pré e pós-condições. Antes de aprovar, exigir os campos oficiais: análise atual concluída, parecer aprovado, portao.liberadotrue, portao.percentual===100 numérico e allowed_actions.apresentartrue, com contexto correto. O snapshot anterior pode sernull/0; não usá-lo para conceder conformidade. Não alterar canonicalpercent, capacidades ou backend.

Depois de aprovar, manter confirmação por resposta RPC válida e readback posterior contextual: situação pode_apresentar_contratante, aprovação atualtrue, portão100 e snapshotpercentual100. O adapter aprovarApresentacao já exige100 na resposta e esse controle não será removido. Estado já aprovado também precisa das pós-condições antes de registro ou binding elegível. ACK, timeout, snapshot isolado, dado anterior ou tenant divergente nunca confirmam operação.

Diagnóstico futuro, se necessário: somente enums fechados por predicado, sem valores livres, corpo, ENV ou campos adicionais no relatório. Não atribuir retroativamente um desses motivos ao R16.

## Recuperação obrigatória R16

DocR16 no padrão12campos ordenados, com os três raw originais byte exatos. Canonical10749bytes/SHAcalculado f5427aa65d4ab75637df290b72b6a8c07a5a7ce30f1b2dc5a4328720133bdd86, conferido em V8 contra5vetores conhecidos e sujeito à confirmação Nodecrypto em CI antes de GREEN. GATE fechará todos os literais, chaves, hashes, entradas e testes hostis. Não adicionar import ausente para fabricar RED.

A nova base será14confirmadas+2reservas=16, máximo8novas/teto24. R11/R15 não são promovidos ou reembolsados por leituras posteriores. Seed de usedIds inclui os4UUIDs R16; negar semanticamente os4 efeitos confirmados mesmo com UUID/fundamento novo. Reusar documentos, execução e pareceres dos dois meses somente após GET oficial fresco e contextual, com identidade/versão/hash selados ao broker. Ambos os pareceres precisam permanecer aprovados antes de qualquer arm. Ausência, substituição, stale ou divergência impede novas escritas.

Preservar todos os24 dados atuais e acrescentar receipts-r16.json/recovery-r16.json, total26dados+SHA27/HISTORY23. GATE próprio do leitor futuro, sem alterar reader neste BUILD. Preservar registros originais, não reformatar raw nem somar sealed como confirmação.

## Arquivos e ciclo de testes

Allowlist futura de quatro arquivos: scripts/hml/authenticated-visual-audit.mjs, scripts/hml/authenticated-visual-audit.test.mjs, scripts/hml/prepare-visual-fixtures.mjs e scripts/hml/prepare-visual-fixtures.test.mjs. Sem SRC/public/rotas/tipos/deps/YAML/ENV/secrets/SQL/RPC/RLS/Storage/deployment/PROD.

- [ ] Integrar PLAN após CI e revisão; integrar GATE separado com contrato exato antes de código.
- [ ] RED no present real: DTO validado pelo parser real com portão100 e snapshotnull/0 alcança somente a fronteira do comando oficial. Canonical99.99, portãofalse, açãofalse, análise/parecerfalse e contexto errado negam antes do comando.
- [ ] Preservar negativos pós-ACK: snapshot<100/null, estado/aprovação incorretos, readback anterior, tenant/ID divergentes ou falta de confirmação nunca liberam registro.
- [ ] RED dos consumidores reais de recuperação: DocR16 faltante/adulterado, orçamento anterior e replay dos4efeitos devem falhar. Positivo do Doc canônico usa Nodecrypto; não confundir fixture técnica com prova HML.
- [ ] Implementar somente quatro arquivos. Atualizar fixtures técnicas para usar operações ainda legítimas, sem liberar replays para manter testes antigos verdes.
- [ ] GREEN Node afetado, lint/fmt, Zero-Drift, LOCK,18nativos/probe110módulos1476785bytes0024/8FQ e revisão independente no HEAD final; merge normal com expectedHEAD, sem force/rebase/squash.
- [ ] Só depois, um pedido separado R17 com CI/revisão canônica/merge/freeze e originais attempt1. Não enviar esse pedido pelo presente plano.

## Continuidade e rollback

AUDIT_BINDING_PENDING permanece até bindings reais. O leitor e este preparador são infraestrutura compartilhada: não reduzem o escopo184 da Trilha A nem expandem o recorte Trilha C de8IDs/64casos pedido nesta conversa; preservar19anteriores sem repetir testes e sem convertê-los em certificados sem PNG/SHA. API42596392357/art13663262831/SHA5e2177afc72b78e0a8e6109bb8795633886c8052c37a756832f616a8c5066795 não será repetida. Nenhum deploy adicional.

Rollback por revert protegido, preservando recibos, reservas e histórico. Atualizar frontend317/backend138 com HEADs, CIs, provas, bloqueios e próxima ação.
