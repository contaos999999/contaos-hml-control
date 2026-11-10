# GATE corretivo C8 r2: inicialização integral antes da CLI

Base 2c58bf8a1ea7765a9481097d77c447f7219a88f3. Emenda aditiva ao PLAN554/afe42819e62bbe8e3c25b4a5869f8ba59db124f5 e GATE566/34674fab697cbdecd4dd1d5f5f918df64ce1b286. O titular autorizou concluir a missão e resolver bloqueios; a revisão independente confirmou que a correção cabe nos dois mjs autorizados. Nenhum novo escopo de produto ou negócio.

## Evidência original e causa

BUILD567 integrado c0ae5d0663ea3275271a7f9e2b341b0e843e4594 após revisão0C/I,24C8PASS,CI4SUCCESS e native18 real no HEAD37bb209722126bdd71c33f82b3dc4e2730fcccb2. Request570 HEAD9c78aad011d47ba4ae35010a0d80807777530b95, review canônico5845005972 publicado/relido antes do merge2c58bf8a1ea7765a9481097d77c447f7219a88f3. Zero push42850491701/LOCK42850486980 SUCCESS.

Auth original42850803333 attempt1, request129950619488 SUCCESS; private129951357092 FAILURE. Native18 e PUBLIC_PROVENANCE PASS no harness2c58bf8a1ea7765a9481097d77c447f7219a88f3; revalidação do request PASS. Passo17 --audit bloqueou HARNESS_FAILURE às16:09:50.064Z; passos18/19 falharam porque nenhum diretório de auditoria foi criado. Lista oficial de artifacts vazia. Via oposta Fixtures42850802981 attempt1 terminalSUCCESS, private129950835679 SKIPPED. Nenhuma captura, sessão autenticada, logout ou certificação pode ser presumida. Credenciais foram disponibilizadas ao processo pelo workflow, mas isso não prova login.

Causa reproduzida offline com cópia do módulo original, sem credenciais ou rede: ReferenceError, nativeEnvTDZtrue e HARNESS_FAILURE. O bloco de entrada CLI chama runCli antes da inicialização de REQUEST_NATIVE_ENV/REQUEST_NATIVE_PROTOTYPES. Somente o ramo --audit chama assertPrivateRequestEnvironment sincronicamente antes do primeiro await; requestEnvironmentChain acessa a const em TDZ. A chamada falha antes do primeiro Git/FS/HTTP/login, independentemente de credenciais. Outros modos primeiro cedem no await Git e ocultavam esse defeito. Revisor independente confirmou a ordem e a causa.

## BUILD autorizado e regressão

Somente scripts/hml/authenticated-visual-audit.mjs e scripts/hml/authenticated-visual-audit.test.mjs. Mover o bloco existente de invocação CLI, literalmente inalterado, para EOF após todas as inicializações. Não mover/remover/relaxar guard, expor erro livre ou alterar semântica de environment. RED antes da correção em subprocesso real do módulo: GITHUB_TOKEN sintético deve bloquear PREPARE_SECRET_ENV; ambiente permitido com SHA deliberadamente incorreto deve alcançar HARNESS_SHA. Ambos devem falhar no original com HARNESS_FAILURE, e passar após a correção, sem rede/Auth/browser. Importação ou extração isolada de runCli não substitui esse teste.

Trocar exclusivamente o nonce executável C8 para trilha-c-audit-20261110-c8-r2 e vincular c8GateSha ao merge desta emenda, preservando ancestralidade do GATE566/PLAN554/reader565. r1 permanece consumida e explicitamente rejeitada; não replay, rerun, dispatch, cancel ou reembolso. Atualizar testes fechados correspondentes. Nenhum outro comportamento, campo JSON, flag, ENV, prazo, native18, workflow, dependência, app, tipos ou backend. Recuperação R20/doc5430B/SHA3dd7dd8dd7eb6e005812f6b936fea4fa12cebf328f135605e3c4076e3334a6ee e todos os bindings inalterados.

GREEN dos regressivos reais, testes C8 e suíte auditor/preparador aplicável, lint/formato/diff, CI4 e native18 no HEAD final, revisão independente0C/I, merge normal e CI push antes de qualquer novo request. Esta emenda não executa Auth.

## Sucessor governado e inspeção

Novo request separado JSON7 operation audit/issue317, nonce r2, approved_parent_sha igual ao merge BUILD corretivo exato, frontend_sha e deployment_id vazios AUTO_DISCOVER. Exigir CI2 e revisão canônica COMMENT no HEAD exato publicada e relida antes do merge. Main/deployment congelados até BOTH originais attempt1 terminais; sessão sintética normal e cerca readonly/logoutfinally. Não há provas de caso válido em r1 para reutilizar; continuam necessárias as64 capturas novas,8telas x4larguras x2temas.

Todos os controles do GATE566 continuam obrigatórios: owner/generation/wire originais, privacidade failclosed por campo,64PNG principais+64complementos+64DOM+report+SHA, sem negócio/OpenAI. Aquisição somente oficial após terminal e registro prévio no develop#138 de run/request/HEAD/deploy/artifactID/tamanho/digest reais; validar ZIP/membros/limites/hashes/dimensões/DOM antes pixels, conforme limites integrais do GATE566. Revisão independente dos128PNG originais por caso; nunca certificar por jobSUCCESS/DOM/hash. Parciais honestos não completam matriz.

API51 original42596392357/art13663262831/ZIP5e2177afc72b78e0a8e6109bb8795633886c8052c37a756832f616a8c5066795 e UI multiturnc999ebc9 preservadas sem repetição. C13 restante tem gate próprio. V1/globalCompletefalse, HML exclusivo gklhhhyosgasnyoxlrui, sem Admin/SQL/RPC de negócio/PROD/deploy. Rollback por PR dos dois mjs, preservando tentativas e artefatos históricos. Atualizar checkpoint oficial e confirmar integração/readback.
