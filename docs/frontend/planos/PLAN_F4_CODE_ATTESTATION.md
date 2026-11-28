# PLAN — atestação e certificação IFV1 F4 CODE

**Estado:** proposta reservada, sem autorização de emissão de certificado. Integrar este PLAN somente após todos os BUILDs #767–#771 integrados, revisão técnica assistida (não independente) nos termos do PLAN #759 e CI integral. Atualizar a baseline e os identificadores reais antes do merge.

## 1. Fontes e autoridade

- Matriz: `docs/frontend/planos/INTEGRACAO_V1_7_FASES_MATRIZ_EXECUCAO_PROPOSTA.csv` (138 IDs canônicos da coluna caso_fase4, 120 obrigatórios e 18 condicionais).
- Propostas F4.1 e F4.2–F4.6 integradas em #760: catálogo de origem/destino, classificação, produtor, consumidor, operação e oráculo; verificar a correspondência integral com a matriz fonte, sem confiar em contagem isolada.
- Harness comum: `scripts/hml/f4-code-material-evidence.mjs`, `validateMaterial`, `.github/workflows/contaos-f4-code-material.yml`. Reusar a validação efetiva de cada lote, sem alterar recibos históricos. Preservar a cadeia F3 e reaproveitar a arquitetura de verificação de metadados, ZIP, hashes, proveniência e promoção dos scripts F3, que têm parâmetros específicos F3 e não devem ser modificados retroativamente.
- CODE somente. Fixtures não são comprovação de persistência, RLS, transação, fila, autenticação ou Storage LIVE. GATE PROD NO-GO. F5 não autorizada antes do certificado F4 integrado.

## 2. Lotes e cobertura

A execução cumulativa final deve conter 13 jobs materiais: adm01 25, context 4, sys04-competence 5, sys04-data 10, sys04-actions 10, contracting-party 9, contracts 15, material-source 17, documents 14, competence 9, analysis 10, opinion-presentation 6, history 4. Os nomes finais e a associação exata ID→arquivo→job serão verificados no workflow efetivamente integrado; os rótulos provisórios aqui não são prova.

## 3. Sequência de atestação

1. Confirmar todos os BUILD merged e respectivos pareceres no HEAD exato, CI integral, commit final e árvore efetiva. Obter o HEAD e o SHA de merge de teste de #771, review ID e merge real. Se a árvore Git do checkout testado não for idêntica à árvore do merge integrado (comparar `commit.tree.sha` via API, não apenas diferença a partir de merge-base), executar nova prova sobre a árvore integrada; nunca inferir igualdade por ausência de arquivos em uma comparação de ancestrais.
2. Congelar fonte de evidência após execução real: run ID, run attempt, job IDs, artefatos por lote e digest SHA-256 retornados pelo GitHub. Confirmar identidade e sucesso em API ao vivo, em especial todos os jobs materiais e os gates Zero-Drift, Teste C, LOCK, NR, F3 regressivo/preflight/coletor. Validar ligação do artefato ao workflow/HEAD, nomes, steps obrigatórios, revisão APPROVED no commit correto e ausência de artefato expirado. Se houver reexecução, validar tentativa efetiva, não misturar recibos.
3. Baixar os 13 ZIPs oficiais pelo GitHub autenticado em workflow read-only. Validar digest do arquivo recebido antes de ler seu conteúdo, rejeitar caminhos extras/duplicados/traversal/links, exigir observations.json, vitest.json, receipt.json e SHA256SUMS. Recalcular todos os hashes; conferir o recibo contra run/job/attempt/SHA testado e escopo. Reexecutar `validateMaterial` sobre bytes reais de cada artefato; confrontar o retorno com o recibo e os títulos/path de testes contra o catálogo e o arquivo executado. Não substituir teste por declaração.
4. Construir ledger candidato determinístico ordenado pela matriz: 138 IDs exatamente, 276 provas únicas positivas/negativas, classificação, produtor/consumidor, operação e oráculos, fonte de produto e arquivo de teste, resultado e observação sanitizada/readback, hash do resultado, artefato/run/job/SHA/frontend e baseline normativo backend. Distinguir `CODE_FIXTURE`, `LIVE=NOT_RUN` e limitações de cada prova. Nenhum N/A sem autorização e justificativa expressa. Rejeitar execução incompleta, duplicidade, resultado não executado, fonte alheia e metadados inválidos. Ledger candidato não é certificado.
5. Testar regressões negativas do verificador (ID omitido/trocado, duplicidade, resultado não executado, artefato adulterado, checksum incorreto, fonte de teste trocada, SHA/attempt/job/review incorretos, arquivo ZIP inesperado, matriz alterada e árvore diferente). Validar bytes reproduzidos do ledger e promover recibo `LEDGER_VERIFIED_CERTIFICATE_PENDING` somente após verificação independente dos artefatos em CI. Não promover manualmente.
6. Após merge do verificador e ledger/recibo formalmente verificáveis, emitir certificado documental `CERTIFICADO_FASE4_CODE_2026-11-25.md` com 138/138 e 276/276 apenas se comprovados, link do CI, hashes, limitações CODE, estado LIVE e aprovação assistida expressamente identificada. CI integral, review e merge protegido; readback do certificado, ledger e recibo na main. Só então registrar IFV1_F4_CODE PASS e autorização de iniciar F5 no checkpoint #708 e painel backend #138.

## 4. Escopo prospectivo proposto

A futura PR BUILD de atestação terá número atribuído antes da autorização P0 exata. Propor `scripts/hml/integracao-v1-fase4-code-attestation.mjs`, seu teste Node, workflow dedicado de atestação read-only, configuração de fonte efetiva (metadados pinados) e ledger/recibo em `docs/frontend/auditorias/integracao-funcional-v1/fase4/`. Definir caminhos exatos e P0 governança após a atribuição da PR; integrar este PLAN e autorização antes do BUILD protegido. A etapa CERT posterior será exclusivamente documental, sem editar evidências imutáveis.

Não há artefato final, ledger, recibo ou certificado neste momento. Não registrar PASS com base em propostas de teste, pré-flight, quantidade, verificação estática ou revisão assistida sem CI.

## 5. Estado de referência no momento da proposta

F4.1 integrada #765: 54/54 casos, 108 provas. F4.2 #767 material 24/24, 48 provas novas e 108 anteriores; CI integral ainda em curso. #768–#771 escritos, não validados. PLAN #772 integrado; baseline deste PLAN reservado 556725a3734a3ec34204961f585328ada1c37a71. Total escrito 138 IDs, execução material comprovada 78 IDs no HEAD de #767; não atestados.

## 6. Reserva de escopo BUILD #774

PR #774 DRAFT reservada, HEAD de preparação `2e6008509e46e8c363edb9187d5791d9e1c4a0b6`. Escopo prospectivo exato: 

- `scripts/hml/integracao-v1-fase4-code-attestation.mjs`
- `scripts/hml/integracao-v1-fase4-code-attestation.test.mjs`
- `scripts/hml/integracao-v1-fase4-code-attestation-live.mjs`
- `scripts/hml/integracao-v1-fase4-code-attestation-live.test.mjs`
- `.github/workflows/contaos-f4-code-attestation.yml`
- `docs/frontend/auditorias/integracao-funcional-v1/fase4/F4_CODE_ATTESTATION_SOURCE.json`

O runner verifica igualdade da árvore testada e integrada diretamente em API Git, sem presumir SHAs de árvore. A fonte final deve conter somente metadados efetivamente confirmados de #771 e do run cumulativo, nunca os 13 artefatos preliminares de SHAs distintos. A primeira atestação gera apenas candidato; promoção/ledger versionado e certificado dependem de PRs posteriores protegidas. Reancorar este PLAN no merge real de #771, atualizar baseline e integrar antes do BUILD #774. Nenhuma autorização antecipada de merge.

## 7. Reserva de promoção do ledger #775

PR #775 DRAFT, HEAD de preparação `80196f2f3398d412b15ae56db39a896032cacf82`. Escopo prospectivo:

- `scripts/hml/integracao-v1-fase4-code-promotion.mjs`
- `scripts/hml/integracao-v1-fase4-code-promotion.test.mjs`
- `.github/workflows/contaos-f4-code-promotion.yml`
- `docs/frontend/auditorias/integracao-funcional-v1/fase4/F4_CODE_ATTESTATION_CANDIDATE.json`
- `docs/frontend/auditorias/integracao-funcional-v1/fase4/F4_CODE_PROMOTION_SOURCE.json`

Só ativar após #774 integrado, fonte candidata real e CI/review confirmados. O workflow reproduz as 13 fontes originais, valida a proveniência e digest do ZIP candidato, confere bytes baixados, reproduzidos e versionados, e emite recibo `LEDGER_VERIFIED_CERTIFICATE_PENDING` sem certificação. A prova negativa impede promover candidato alterado, incompleto, de árvore divergente, review errado, execução não realizada ou ZIP inseguro. A PR CERT posterior é exclusivamente documental, preserva recibo original e só promove IFV1_F4_CODE PASS após merge protegido e readback. Nenhuma prova LIVE ou alteração produto/backend.

## 8. Ativação definitiva após BUILD integral #771

BUILD #771 MERGED `d96dfa794b4b0da01088931ef45a77c25a3c807c`, HEAD `1aa145c87d3584cdd2f18911aea83b91e023fac1`, review assistido 6055359806, CI 7/7 SUCCESS. Run material 45589213529, attempt 1, SHA testado `2a3afa7d4a983111bce75f62b5693fe8dd41daf2`, 13 artefatos oficiais, 138 IDs da matriz (120 obrigatórios/18 condicionais), 276 provas PASS. Verificação direta dos 13 ZIPs, digests API, checksums internos, relatórios e recibos, 0 divergências de identidade, 0 duplicidades. O runner #774 verificará identidade da árvore por API, sem presumir igualdade de árvore; se divergente, bloqueia. #774 HEAD reservado 6a88d3a9f3bce573395a4dba422f6f4f3893a296, #775 HEAD reservado 80196f2f3398d412b15ae56db39a896032cacf82. Os P0s anexos têm baseline atualizado. A autorização de #775 só é eficaz após #774 merged e pinagem do candidato real. Estado F4 NOT_CERTIFIED; sem LIVE/PROD.
