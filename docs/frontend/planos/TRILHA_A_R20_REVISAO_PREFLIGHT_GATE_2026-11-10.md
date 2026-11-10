# GATE R20: solicitação sucessora com revisão canônica antes do merge

Missão P0 autorizada pelo titular, HML somente. Este GATE depende do PLAN R20 integrado e CI verde, não executa Auth/request nem altera produto. PLAN: docs/frontend/planos/TRILHA_A_R20_REVISAO_PREFLIGHT_PLAN_2026-11-10.md.

## Evidência terminal R19 e ruling
Original requestcd2b221beaf1c6641d0646c4ab5a3c7baf4be1b0/PR559/head4b96aafc182d7775e1e6ef9d633c0683ccc6237e, upstream42785264939SUCCESS. Fixtures42785459940attempt1FAILURE: preflight129725421600Step7REQUEST_REVIEW, privado129725699256SKIPPED, protocolo129725424236SKIPPED, artifacts0. Oposto42785460060SUCCESS: preflight129725421530SUCCESS, privado129725590328SKIPPED. Não há sessão/logout/report a presumir.

Causa é omissão do comentário formal antes de merge, não erro de credencial ou backend. R19 é consumida e não admite rerun/dispatch. Autoriza-se novo nonce R20 para executar a MESMA recuperação readonly aprovada, sem repetir efeitos empresariais. A prova terminal administrativa dos jobs demonstra zeroAuth dessa tentativa; não é binding ou PASS visual.

## BUILD autorizado somente após integração verde
Caminhos fechados: scripts/hml/authenticated-visual-audit.mjs e scripts/hml/authenticated-visual-audit.test.mjs. Adicionar trilha-a-fixtures-20261110-r19 à spentFixtureNonces, substituir fixtures.nonce por trilha-a-fixtures-20261110-r20. O request antigo fica legível somente como histórico e não ativo. Preservar invariantes de review/CI2/JSON7/parent/uniqueness/freshness/native18/readOnlyRecovery/ledger17+2/max5 e R18Doc/candidato.

Testes RED antes código: R20 válido; R19 ativo negado/histórico aceito; review ausente, state incorreto, JSON extra, commit incorreto e review nova inválida negados; review COMMENTED canônica positiva aprovada. Negativos de review preexistentes são preservados, sem duplicá-los por contagem. GREEN focal e suíte auditor/preparador, lint/formato, CI4/native18/revisão independenteHEADexato antesmerge. Não mudar preparador/YAML/Auth/SQL/deps/tipos/políticas/produto nem realizar deploy. Não remover AUDIT_BINDING_PENDING.

## Request posterior separado e checklist antesmerge
1. Revalidar main/backend/alias e ausência de sessão concorrente. JSON7 fixtures/R20/AUTO_DISCOVER com pai main exato. PR sórequest.
2. CI2 no HEAD real. Revisão de conteúdo e comentário COMMENT no HEAD exato publicado como JSON compacto na ordem: schema,request_id,head_sha,critical,important,decision. Valores schema contaos.single-request.review.v1,request_id trilha-a-fixtures-20261110-r20,HEADreal,0,0,APROVAVEL. Sem campos adicionais ou texto ao redor. Validar readback com validateSingleRequestPull antesmerge.
3. Merge normal, freeze main/deployment até BOTHoriginaisattempt1terminais. Preservar originales sem rerun/cancel/dispatch. Workflow opostoSKIPPED não éauditoriaPASS.
4. Inspeção protegida do artefato real após terminal e GATE/leitor estático separado: reportcompletedtrue,logouttrue,cleanupnull,ledger19,newArmed0,recibos vazios e vínculos atuais dos dois meses. Nenhum negócio/SELECTADMIN adicional. Artefato inexistente não pode gerar leitor ou prova fictícia.
5. Só então GATE C8 com bindings/pins reais,64casos/UI13/provasPNGDOMhash e revisão independente. API51 e controles existentes preservados.

Rollback viaPR apenas do controlador, sem repetir operações ou apagar requests/recibos. CIverde desteGATE não éexecuçãoR20 nem certificadoC8/TrilhaC/V1.

PLAN integrado: 378e61d06f6470a38165707cff63faf06f6d2c1b. CI42785889579/42785889466SUCCESS, revisão5839144278semC/I.
