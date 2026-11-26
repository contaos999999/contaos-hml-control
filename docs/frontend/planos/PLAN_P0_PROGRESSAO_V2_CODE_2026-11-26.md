# PLAN P0 para autenticar a progressão da V2 CODE

## Causa e recorte

O plano mestre #825 exige recibo do regular antecedente para começar o próximo regular. No P0 vigente, `readP0` incorpora o recibo V1/interna, mas os IDs executados ainda vêm do manifesto histórico protegido P0-LOCK-CERT. A simulação do PLAN 45 com essa base continua bloqueada e o próximo regular elegível é 44. O P0 nativo já autentica certificados finais. É preciso que também reconheça recibos individuais da V2 sem reescrever a evidência histórica. A integração do BUILD 44 e o readback precedem este BUILD de governança.

## Contrato da leitura efetiva

1. O registro versionado `docs/frontend/governanca/P0_PROGRESSO_V2_CODE.json` contém apenas uma sequência inicial dos regulares 44, 45, 46, 47, 48, 49, 76 e 77. Em sua introdução, a sequência é vazia. Cada entrada aponta para o recibo documental imutável do regular, com SHA-256.
2. O leitor aplica a sequência somente após verificar o recibo efetivo V1/interna. Valida schema, escopo CODE, identidade do regular, caminho exato por ID, bytes do recibo, sequência sem lacuna ou duplicata e correspondência com o bloco V2 canônico. O próximo regular se deriva dos IDs que o P0 conhece. Arquivo ausente mantém o bloqueio original. Erro ou conflito bloqueia o gate.
3. Cada recibo do regular identifica PR, HEAD, árvore, merge, revisão assistida, Zero-Drift, Teste C, tentativa, artefato e SHA-256. Aponta os bytes da ficha RCA que existem no HEAD exato da BUILD, mesmo quando uma próxima BUILD possuir outra ficha ativa. Um recibo de prova não substitui certificado funcional, interno ou cumulativo.
4. O gate de proveniência autentica o mesmo registro pelo GitHub REST. Exige PR integrada à main, revisão válida do HEAD exato por identidade elegível, merge e árvore correspondentes, situação do CI e Teste C material com artefato nativo. A árvore, o ID e o digest do artefato e os bytes do RCA são verificados no vínculo com a BUILD. Em CODE, o gate não presume execução LIVE.
5. O gate de ordem segue condicionando V3 aos três certificados V2. O estado do registro de sequência não muda o P0-LOCK-CERT, o certificado V1 ou o preflight GATE PROD. Qualquer promoção de certificado V2 segue o plano mestre e tem integração própria.

O ingresso de cada recibo será uma PR documental própria, posterior ao merge da BUILD respectiva e condicionada ao readback. O primeiro recibo será para 44. O ponto de prova do novo leitor em CI mostra 44 enquanto a sequência está vazia e 45 depois da integração do recibo autêntico de 44.

## Escopo de BUILD fechado

- `scripts/p0-version-order-gate.mjs`
- `scripts/p0-version-order-gate.test.mjs`
- `scripts/p0-evidence-live-gate.mjs`
- `scripts/p0-evidence-live-gate.test.mjs`
- `docs/frontend/governanca/P0_PROGRESSO_V2_CODE.json`
- `docs/frontend/auditorias/preflight/V2_PROGRESSO_CODE_2026-11-26.md`
- `docs/frontend/rca/P0_RCA_ATIVO.json`

Emenda de controle no escopo V2, sem alteração de fonte de produto. O artefato de preflight explicita as dependências, as contraprovas e a fronteira com a V1. O RCA exige o mapa do diff, os testes efetivos e o RED no GitHub antes do GREEN.

## Verificação

- RED no teste de ordem para demonstrar a falta da leitura de um recibo 44, no Zero-Drift do HEAD correspondente. O nome do caso aparece na falha registrada.
- GREEN para sequência vazia, ausência compatível e entrada 44 válida, com uma única nova posição elegível. Rejeitar salto, ID duplicado, V1 pendente, arquivo fora do caminho, digest discrepante e valor que tenta inserir certificado ou alterar o estado de PROD.
- No teste de proveniência, demonstrar negativa de CI, HEAD, merge, árvore, revisão e artefato divergentes ou de Teste C não executado. Preservar os casos negativos do consumidor V1 e o modo GATE PROD.
- Rodar os controles P0, RCA, LOCK-TYPES, Zero-Drift e conferir a PR protegida no HEAD exato. No primeiro recibo documental, repetir o P0 local e no CI e confirmar o readback da main.
- Rollback por revert protegido do incremento de governança. Voltar ao bloqueio da sequência sem alterar os comprovantes já integrados, os dados V1/V2 ou os controles de produção.

## ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE (OBRIGATÓRIO)

Governança de evidência. Impacto visual de produto N/A. As provas materiais de interface continuam vinculadas ao Teste C de cada BUILD. Preservar a decisão de três certificados distintos, o fluxo protegido, a revisão assistida e os blobs de referência. LIVE `NOT_RUN`. PROD `NO-GO`.
