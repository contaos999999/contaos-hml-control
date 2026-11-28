# Certificado IFV1_F4_CODE — Fase 4 de integração funcional V1

Data de referência: 25/11/2026 (America/Bahia). Escopo: certificação automatizada de código, CRUD permitido, sincronização e readback em fixtures controladas. **Resultado técnico: PASS_CODE — 138/138 casos, 276/276 provas, zero falhas, zero bloqueios, zero N/A, zero casos não executados.** Eficácia formal condicionada ao CI integral, revisão no HEAD exato, merge protegido desta PR exclusivamente documental e readback na main. Enquanto aberta, esta PR não constitui certificado efetivo.

## Governança e escopo

Plano mestre aprovado #653; PLAN específico #759, disposição de revisão técnica assistida e separação CODE/LIVE, PLAN de BUILDs #772 e PLAN de atestação/promoção #773 integrados. A revisão técnica via Edivan5002 é assistida pelo mesmo agente e **não constitui auditoria de autoria tecnicamente independente**. A exceção operacional formalizada no PLAN #759 aplica-se à F4 CODE, não a F5–F7, outras versões, auditoria semântica ou GATE PROD. A ratificação de 22/11/2026, issue #708 comentário 7086578908, preserva as provas LIVE autenticadas para a etapa pós-V5. Não houve alteração de produto, backend, guard, contratos normativos, HML ou PROD nesta missão.

## Resultado material e identidade

| Grupo | Casos | Provas | Resultado |
| --- | ---: | ---: | --- |
| F4.1 Organizações e usuários | 54 | 108 | PASS |
| F4.2 Contratantes e contratos | 24 | 48 | PASS |
| F4.3 Normativos, orçamento e listas | 17 | 34 | PASS |
| F4.4 Documentos e versões | 8 | 16 | PASS |
| F4.5 Competências, documentos, análise e revisão | 25 | 50 | PASS |
| F4.6 Pareceres, apresentação e histórico | 10 | 20 | PASS |
| **Total** | **138** | **276** | **PASS_CODE** |

Matriz canônica: `docs/frontend/planos/INTEGRACAO_V1_7_FASES_MATRIZ_EXECUCAO_PROPOSTA.csv`, blob `bb7ce43f9c334f2f03e9aafab405addadfe5e19a`; 120 casos obrigatórios e 18 condicionais, todos efetivamente executados, sem N/A, 138 provas positivas e 138 negativas. Backend normativo de referência `a1516de1d8949e505d83b5e000eb1cc558b217a7`. Não representa execução LIVE. Verificador material blob `b841384443e5226fc04354b04ed34031fd5ffc5c`.

BUILD final #771: HEAD `1aa145c87d3584cdd2f18911aea83b91e023fac1`, checkout testado `2a3afa7d4a983111bce75f62b5693fe8dd41daf2`, merge `d96dfa794b4b0da01088931ef45a77c25a3c807c`, árvore testada e integrada idêntica `ec3dde8625025ea4c03df1d2c4a6da54f40642ca`, review assistido 6055359806, CI 7/7. [Run material 45589213529](https://github.com/contaos999999/contaos-hml-control/actions/runs/45589213529), attempt 1, 13 jobs e ZIPs, 138 IDs canônicos únicos, pares positivos/negativos em bijeção, 0 omissões, 0 extras e 0 duplicidades. SHA-256 dos arquivos ZIP e checksums internos, observações e relatórios Vitest verificados. A configuração F4_CODE_ATTESTATION_SOURCE.json preserva os metadados e digests individuais e os sete workflows aprovados; Zero-Drift e Teste C 45589213525.

BUILDs integrados #760, #763, #765, #767, #768, #769, #770, #771 com CI integral. Correções rastreáveis de coletor, tipagem e oráculo V113 (erro de transporte classificado como ambíguo pelo adaptador real, preservadas reconciliação e contraprova de duplicidade); regressões aprovadas. Não reutilizados PASS F3 como prova F4.

## Atestação, promoção e ledger

| Etapa | PR / execução | Identidade e evidência |
| --- | --- | --- |
| PLAN | #773 | merge dfdc52130f738ff5c87eb013ea99fadb254d372a; CI 6/6 |
| Atestação | #774 / [45590645550](https://github.com/contaos999999/contaos-hml-control/actions/runs/45590645550), job 139123667258 | HEAD edec3d751ab02ec2051dc9ef40415f6f8d9ddaf1; SHA testado 97eed215ed79fc6a50f43a91ff29985c7663f3aa; merge 32807481056f51b8bb20b716a379016258bd87fe; árvore testada/merged 5f6268d942865d9566e19bd3893f80626e7e623d; review 6055460042; 15 contraprovas; CI 7/7 |
| Promoção | #775 / [45591230776](https://github.com/contaos999999/contaos-hml-control/actions/runs/45591230776), job 139125664621 | HEAD 362d97e649a511bac213ce15b3395c6d0e5520f3; SHA testado 4b460588b911956cbab19f884d26844661885c04; merge b6a5e3808a0202756d4077fcf89315dc94590929; review 6055519055; 5 contraprovas; CI 7/7 |

Candidato oficial: artefato 15010199452, ZIP SHA-256 `7c55048b173f7dd1f05041ce32ab6d03e4cdfc67e96a0f98cdb85d6891fed250`. Ledger versionado `F4_CODE_ATTESTATION_CANDIDATE.json`, 1.131.461 bytes, SHA-256 `b896b935a407e04264c33389a574d8137aa84b6afd81719117bfb052c86b676f`. Blob `03137c9d9961e914f6d0687df730a8843c4cc742` conferido idêntico no checkout testado de #775 e na main integrada. Preserva os 138 registros, as 276 provas, observações materiais completas, vínculo ao catálogo, fontes, títulos de teste, hashes, artefatos, jobs, execução, árvore, blobs de fonte e escopo. Os rótulos históricos CANDIDATE_NOT_CERTIFIED e SUBMITTED_UNVERIFIED são preservados para não adulterar o artefato; seu valor final de validação deriva do recibo original e deste certificado efetivo, não de edição manual dos dados.

Recibo original `F4_CODE_PROMOTION_RECEIPT.json`, artefato 15011960052, ZIP SHA-256 `07352ddc5ad7d0d9e59d8582fb245967f2200ad32083ce9735646718412f344b`, 8.286 bytes, SHA-256 `e4acf6f889d18aaad19f58d2c92c59808a567810d74e2b24124065bc3001aeab`. A promoção reexecutou o atestador contra os 13 ZIPs originais e verificou igualdade byte a byte entre o candidato baixado, o reproduzido e o versionado, metadados GitHub, digests, árvores, review e contraprovas. Estado original LEDGER_VERIFIED_CERTIFICATE_PENDING permanece imutável; a integração protegida deste documento e do recibo confere eficácia à certificação. O manifesto F4_CODE_CERTIFICATION.json consolida o resultado e sua condição de eficácia, sem modificar o ledger original.

## Limites e conclusão

O resultado cobre testes CODE com adaptadores/componentes reais e transporte/persistência sintéticos, com oráculos de leitura e mutação, negativas e sincronização nos escopos executados. Não comprova RLS remota, concorrência transacional real, autenticação HML, persistência remota, Storage, fila ou operação em PROD. Os oráculos propostos no catálogo permanecem identificados como propostas; o resultado material é vinculado a títulos e observações efetivamente executados. Revisão assistida não é contraditório humano independente. LIVE = NOT_RUN, GATE PROD = NO-GO. Nenhuma liberação de produção.

**Resultado técnico IFV1_F4_CODE: PASS.** Certificação formal válida exclusivamente após CI integral, revisão, merge protegido e readback desta PR documental na main. A F5 CODE pode iniciar somente após essa comprovação, observando seu próprio PLAN e gates. Fases anteriores preservadas.
