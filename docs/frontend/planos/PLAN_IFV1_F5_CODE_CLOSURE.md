# PLAN F5 CODE | Atestação, promoção e certificação

A F5.7 designa o fechamento da Fase 5 do PLAN #777. A execução material cobre as seis fatias F5.1 a F5.6. O fechamento segue os itens 4 a 6 da seção 4 do plano.

## Fonte material integrada

A PR #790 executou 138 casos e 276 provas CODE_FIXTURE no HEAD `aa5640e52cec265e2b250fce9b1d85452763d0b0`, com 120 casos obrigatórios e 18 condicionais, run 45743224190, tentativa 1, 12 artefatos originais e sete workflows concluídos com sucesso. Revisão assistida Edivan5002 6067826851. A main contém o merge `ee46e1ddde75b24954e61b0081b8ab6b167c127f` e a árvore integrada `f651eee882b30139e75caf4ffebb99a6fb780b09` coincide com a árvore testada. O checkpoint #708 registra as fontes e os digests.

## Integrações em ordem

1. A PR #792 confere proveniência por API, fidelidade da matriz e dos inventários, identidade de cada par e reprodução dos recibos. Publica o candidato com o estado CANDIDATE_NOT_CERTIFIED.
2. A PR #793 entra após merge e readback da #792. Reproduz os artefatos materiais e confirma que o candidato oficial e o ledger versionado têm os mesmos bytes do resultado reproduzido. O recibo registra LEDGER_VERIFIED_CERTIFICATE_PENDING.
3. A PR CERT integra exclusivamente o manifesto F5_CODE_CERTIFICATION.json, o recibo oficial F5_CODE_PROMOTION_RECEIPT.json e o certificado datado CERTIFICADO_FASE5_CODE_*.md. O aceite exige revisão assistida, CI integral, merge protegido e confirmação da leitura de main. A PR registra o vínculo do manifesto com os commits, hashes e recibos verificados.

A revisão segue a modalidade assistida estabelecida na #781. O escopo de execução é CODE_FIXTURE, com LIVE NOT_RUN e PROD NO-GO. O registro efetivo de PASS depende do merge e do readback da CERT. Próxima etapa após certificação efetiva é o PLAN próprio da F6 CODE.
