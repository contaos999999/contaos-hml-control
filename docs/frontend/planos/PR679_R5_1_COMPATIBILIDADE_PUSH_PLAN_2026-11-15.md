# PR679 R5.1 — compatibilidade dos gates e declaração canônica anterior

Estado: VALIDADO tecnicamente; eficácia condicionada a CI, auditoria independente, revisão formal especificamente autorizada e merge protegido antes do novo BUILD. Esta PR altera quatro documentos, sem código. Complementa o PLAN687 integrado7006ef6; não dispensa controles nem aprova retroativamente material local com preflight inválido.

## Baseline e falha confirmada

Main `7006ef6aa6881644f9d603797060c415799c748d`, quatro checks pertinentes pós-merge SUCCESS; PR687 PASS R2/review5910942296/merge conferidos. PR679 remota continua9c0ed0f0ddfc0fc91512dff2e290e0a8d6826c71, autoraEdivan5002. Instalação automatizada3.1.4 concluída nas PR684/686; não repeti-la.

Fontes:25 documentos canônicos do snapshot `CONTEXT_CANONICO_4_1_SNAPSHOT.json`, lidos integralmente nesta retomada e conferidos path/blob/hash contra develop@1504af465b45afc846458d00e5cb63513fa298ed. `context_pack_version=4.1`, `context_read_acknowledged=true`. P0 ordem/NR/ledger, RCA, ADR-DEV-002, PLAN Fase3 e emenda687 recuperados. Preservar100 regulares/97 atômicos, BRAND-01, V1/Fase3 e certificados anteriores; sem iniciar V2 ou certificar REQUEST real.

O ensaio local do gate real com `GITHUB_EVENT_NAME=push` e `FRONTEND_DIFF_BASE=7006ef6...` retornou exit1: **Context Gate: leitura integral4.1/fingerprint não declarados no PLAN** e **ARQUIVO FORA DO PLAN VALIDADO: src/test/competenciaDocumentos.test.tsx**. É simulação do caminho de push, não falha real na main. Nenhum merge679 foi tentado. O mesmo código de seleção usa o PLAN da base no push; a base não contém o teste na allowlist geral. O gate de frontend ainda não consome o mapa restritivo que o R5 implementou no RCA.

Além disso, o root `context_source_commit` do PLANO_ATIVO ainda é5eca44aebead3183e81b5c1af0d1dffa5fb8feb6, enquanto o snapshot fixa1504af465b45afc846458d00e5cb63513fa298ed. A declaração nova estava apenas na emenda documental, não no campo root consumido pelo guard. O commit local de pré-allowlist118fa68 herdou esse root antigo; o gate também rejeitaria o primeiro código src da linhagem local. Não alegar que a leitura anterior ao código faltou: as fontes foram lidas; faltou a vinculação correta no campo validado. O preflight técnico não foi satisfeito.

Material de trabalho R5: commits locais118fa68/56ee7c9, não publicados, preservados em `backup/pr679-r5-local-56ee7c9-pre-gates`. Testes locais:80F3,44RCA,69React,1.266regressão e sete mutantes novos mortos, recibos compactados no RCA local. São diagnóstico e validação de trabalho, não prova de integração ou de gates prévios válidos. A nova execução partirá de uma branch descendente do HEAD remoto9c, receberá este PLAN antes de código e reaplicará apenas a allowlist aprovada; commits locais antigos permanecem preservados, sem reescrever histórico publicado ou fazer force push.

## RCA ampliada — consumidores × eventos × fonte

NR005/006 CONHECIDOS: autorização por PR, declaração no campo consumido e proveniência anterior ao BUILD. A R1 da687 corrigiu a ampliação global, mas o PLAN deixou de inventariar o segundo consumidor e o evento pós-merge. Esta é falha da validação do conjunto, não impedimento Windows. O titular determinou que limitações Windows não impeçam avanço: aplicar alternativas compatíveis/CI/ferramentas fixadas, preservando testes, sandbox e governança.

Inventário `rg arquivos_permitidos/arquivos_restritos_por_pr scripts .github`: consumidores de autorização são frontend-scope-gate e p0-rca-impact-gate. O primeiro usa pai do primeiro src no pull_request e base no push; o segundo usa o PLAN da base para mapa restritivo e GOV da main protegida. Nenhum workflow precisa mudar. A confirmação de leitura depende de rootcontext, não de texto livre da emenda. Hipóteses descartadas: não é CI indisponível, fonte normativa divergente, tipos alterados ou erro de negócio/backend; a inspeção do código e dos JSON reproduz a rejeição offline.

Matriz obrigatória: ambos os guards × pull_request/push × PR679/outra/ausente/inválida × mapa protegido anterior/mapa removido no HEAD × fonte root atual/antiga. Invariantes: autorização restrita nunca se torna global; futuro arquivo sem PLAN continua FAIL; root antigo continua FAIL; um evento desconhecido não recebe concessão restrita; somente679+GOV protegido correspondente pode consumir o mapa. PLAN no mesmo commit do primeiro src continua inválido.

## Desenho e allowlist

Mudança adicional de BUILD679 somente em:

- `scripts/frontend-scope-gate.mjs`;
- `scripts/frontend-scope-gate.test.mjs`.

O guard de frontend identificará PR pelo payload GitHub de pull_request ou número de merge commit no push, como já faz o RCA. Não confiar em nome de branch ou variável fornecida pelo chamador para autorizar. Para arquivo presente em `arquivos_restritos_por_pr` do PLAN anterior selecionado pelo guard, exigir número inteiro correspondente, GOV daquela PR obtido de origin/main, approved=true e caminho exato na lista. A restrição prevalece mesmo sobre allowlist geral. Para o caminho restrito aprovado, o mapa é uma autorização fechada alternativa à lista geral; isso permite push pós-merge sem liberar genericamente o teste no PLAN da main. Mapa malformado aplicável, número ausente, GOV ausente/errado e outro arquivo falham fechados. Todos os demais gates do arquivo permanecem.

Preservar a seleção anterior ao primeiro src no pull_request e da base no push; não substituir pelo PLANO_ATIVO do HEAD para fazer PASS. Comparar políticas dos dois guards em testes equivalentes; não duplicar inferências divergentes. Frontend continua validando contexto25fontes, crosswalk100/97, gates, backend proibido, Brand e LOCK; RCA continua exigindo ficha v2, baseline real, RED ancestral e GREEN/NEG/REG executados. Nenhuma alteração em workflow, proteção, sandbox, frontend-zero-drift ou verificador de tipos.

Este PLAN atualiza no root do PLANO_ATIVO apenas source_commit→1504..., data/declaração da leitura real e vínculo desta emenda/CI. Preserva a declaração histórica, catálogo/crosswalk, lista25, aprovação humana histórica do mestre e mapa679; não inclui o teste na lista geral da main. A linha do tempo documenta o erro anterior sem apagá-lo.

O GOV679 passa de12 para14 arquivos: os12 de R5 mantidos exatamente e os dois guards acima. Esta PR de PLAN altera somente este documento, GOV679, PLANO_ATIVO e checkpoint. O BUILD poderá atualizar os documentos de evidência/ledger/checkpoint já allowlisted para registrar R5.1 e sua integração. Não ampliar TSX além do waitFor já desenhado; não alterar produção/UI/rotas/brand, backend/Supabase/schema/RLS/RPC/Edge/Auth/Storage, dependências/locks, types.ts, REQUEST real ou PROD. types permanece8ea7750b75fd9d76b29c36ce7613392e3ab65e19.

## RED → BUILD → GREEN → AUDIT

1. Integrar esta PR documental com CI/auditoria/review autorizada. Na nova branch descendente9c, receber a main integrada antes de qualquer reaplicação. Validar rootcontext contra snapshot e25blobs; não usar os pais118/56 antigos como linhagem certificada.
2. RED em repositórios temporários da suíte real frontend-scope: mapa protegido somente679 e teste fora da allowlist geral, PR679/push de merge679 devem falhar no código antigo. Negativos PR680, número ausente/malformado, evento desconhecido, GOV sem caminho/não aprovado, mapa inválido e tentativa de remover mapa no HEAD; contexto antigo permanece FAIL. Citar simulação como simulação, não GitHub real. Fixture não acessa rede/Supabase.
3. Implementar só os dois arquivos novos após esse PLAN. GREEN de todos os casos existentes e novos. Mutantes: ignorar número, ler mapa do HEAD, permitir GOV ausente, remover validação de contexto devem morrer nos respectivos testes. Caso legado não restrito e plano prévio continuam válidos; plano no mesmo commit não passa.
4. Reaplicar fonte R5 autorizada, com commit de pré-allowlist/contexto válido antes do primeiro TSX. Atualizar baseline da ficha V1 para merge-base real deste PLAN integrado, mantendo RED9c como ancestral. Reexecutar gates reais de pull_request e simulação de push; não dispensar o ensaio pós-merge. Conferir14 caminhos e blobtypes.
5. Lint/types/build, NodeF3+RCA+frontendgate, regressão completa e mutações pertinentes; fonte sem alteração funcional adicional pode preservar recibos históricos claramente identificados, mas novo SHA/base requer seus próprios checks. Teste C obrigatório conforme seletor real src/**; não afrouxar nem contar skip como visual/E2E autenticado.
6. Push fast-forward à branch remota679, CI, controlador3.1.4 Analisar, parecer integral/hash/metadata/base viva; autorização específica de review por contaos9999 e merge protegido somente com PASS. Conferir checks pós-merge e checkpoint antes de encerrar.

Impacto: fronteira de autorização em todos os fluxos frontend. Riscos de falso PASS por identidade/GOV/mapa mutável cobertos por negativos/mutações; falso bloqueio em push coberto por merge real em fixture; regressão do modo PR/legado coberta pela suíte existente. Alteração rootcontext é metadado da leitura já realizada, sem aprovar código/runtime/backend. Não aceitar evidência de outra baseline. Rollback por PR de revert com gates, preservando commits/recibos; nenhum reset/force da branch publicada. Gates nominais PRD/premissas/arquitetura/atômicos/Brand/segurança/NFR/Zero-Drift/TDD/CI/TesteC planejados/rollback PASS para esse desenho fechado; resultados de BUILD continuam pendentes.

## ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE (OBRIGATÓRIO)

ContaOS Brand v1.0 e Design System preservados integralmente. GitHub direto, sem BUILD Lovable ou inspeção técnica de backend; economia por inventário de todos os consumidores/eventos antes da correção única por classe. Não reduzir segurança, fontes, testes, acessibilidade ou governança.

## Recibo integral do preflight adverso

Simulação local sobre material56ee7c9, base7006ef6 e evento push. Não é run GitHub nem autorização de BUILD. Bytes originais gzip+base64, verificar len/SHA após descompressão; saída PowerShell pode ser UTF-16LE.

```json
{
  "raw_size": 1086,
  "raw_sha256": "e12dfc83fca014506796863f3ad8ddad68dc87d69a2d5af0a604951dd3cf2836",
  "gzip_base64": "H4sIAAAAAAAC/72TS0/CQBDH52zid+hJNChEw8HUeGh4GBIfPNSLeKilAgYoaQuBi1/W76H+ZkqJMUY8mc3uznv+Mzv78T6VSPoSSom9ZDvishvSkRu5llupc9aQdKWKpAWvWk+acmmWVfynkpp3Cn8hvnGqG3OP4OYSI3WgM8uB8WMkFfIeS1meTTdAF8uMnVk6nG/EdwxhgIdvnn1kiWlV1wKJB8qS7MoOd2SZNcIQW1dO4IO1Z2D5Y8N3SuaK+RSxKNlyiHRFjedSAMecLEOoM+R77ALVutKTO+QaJYEOQTOSBbF7IInJ/oIsNYS9TXd8eteVo3W9PdNHoFQbnzx961NklWukJ+4cU45w23r996XI8uxFmwV//b5ayYoZmfKy0Y9odT70rVL6MrPXHdkUaD9Vt79lBrPe/D4PLh7pepoGcoDuQR7lkLtDnollD4m2JHsIihRLfa/vdTV4oTFrJW0o36Yrx1onfmz1NuHyunyLtcBCJ2DC8on71TrLoeff/5qHZZvpa8o9etXdIPGgasbnlTvoPegmcs906p2QNeCvac0JZxlOsc1sXkPwBTZ9NaQBdU5Mlk1yaeOlVELHFPknPvWbXj4EAAA="
}
```
