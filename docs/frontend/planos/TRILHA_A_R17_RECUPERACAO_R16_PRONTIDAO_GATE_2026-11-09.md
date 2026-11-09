# GATE R17: recuperação R16, prontidão e não repetição

## Autoridade e estado

Este GATE é subordinado ao PLAN R17 integrado no PR #534, main `fb634da1d9970dda1b8f9e7d3c9929092e6643e1`. É uma especificação de controles para revisão, não é autorização para executar HML, autenticação, deploy ou emitir nonce. Não substituir as provas já aprovadas.

## Evidência congelada

- Workflow de origem R16: `42713640896`; artefato `13717457216`, ZIP 25487 bytes, SHA256 `39eb9b34bd2c3b58df9b28cb666e0911538b24763eeb744f75fd5675a91a7305`.
- Inspeção somente leitura: `42716637333`, job `129499783558`. Resultado `COMPETENCE_PRESENTATION_GATE` nas duas competências, `firstFailure=null`, logout confirmado. Não inferir qual operando individual falhou.
- R16 confirmou exatamente quatro efeitos novos em Setembro: `criar_documento_competencia_v115`, `solicitar_analise_competencia`, `solicitar_parecer_interno`, `aprovar_parecer_interno`. Todos ficam bloqueados para replay por identidade, RPC, competência e evidência semântica; preservar também incertezas R11 e R15.
- Livro de intenções: 14 confirmadas + 2 reservadas = base 16; no máximo 8 novas, teto global 24. Não liberar reservas por timeout, erro, ausência de ACK ou leitura incompleta.

## Controles obrigatórios antes de BUILD

1. Documento histórico R16 reconstruído dos três conteúdos brutos originais, sem reformatá-los; 12 campos, 10749 bytes ASCII e SHA256 esperado `f5427aa65d4ab75637df290b72b6a8c07a5a7ce30f1b2dc5a4328720133bdd86`. Conferir com `node:crypto` em teste CI; registrar hashes individuais e provenance. Não produzir prova por aproximação.
2. Antes de qualquer armamento de nova intenção, consultar os dois pareceres originais e os dados canônicos de ambas as competências por GET autenticado e atual, verificar organização, identidade, competência, contexto, permissões, portão de conformidade 100%, análise e parecer, sem getters laterais e sem depender de `competencia.percentual_conformidade` persistido previamente.
3. Para `aprovar_apresentacao`, exigir `allowed_actions.apresentar` e portão oficial 100% antes da RPC. Depois da RPC, exigir nova leitura atual, percentual persistido 100%, estado aprovado, aprovação institucional atual, identidade/organização/competência correspondentes e integridade do contexto. Nunca considerar HTTP ACK isolado como confirmação.
4. Manter RLS, RBAC, autorização, deadlines, anti-replay, nonce único, quotas, isolamento de organizações e controle de falhas fechadas. Sem alterações de frontend de produção, banco, migrações, políticas ou credenciais.
5. Recibos históricos e writer: preservar todos os recibos existentes e anexar somente os novos, com SHA256 e manifesto fechado. Plano exige writer de 26 dados + SHA 27, histórico 23, com revisão das cardinalidades reais no código antes da implementação.
6. Corrigir testes positivos que usavam `solicitar_analise_competencia` de Setembro: esse efeito agora é confirmado e só pode aparecer como teste negativo de replay. Testes positivos usam operação ainda pendente e legitimamente autorizada. Preservar os 18 casos nativos, testes negativos de R11/R15/R16, zero alterações nos casos previamente aprovados.

## Sequência de execução protegida

- RED: testes causais de snapshot `null`/0 com portão oficial 100% e `allowed_actions.apresentar=true`, pré-condição correta e pós-condição estrita; testes de rejeição de replay, falta de permissão, outro tenant, status não aprovado, deadline e histórico adulterado.
- BUILD: somente arquivos do preparador/controlador e seus testes previstos no PLAN, em branch própria, com diff auditável; não enfraquecer a guarda canônica.
- GREEN: suíte focal, lint, formatação, TypeScript aplicável, Zero-Drift, LOCK, Teste C independente, 18 nativos e revisão técnica no HEAD exato. Não marcar PASS sem logs.
- REQUEST: somente após GATE e BUILD integrados, gerar um único JSON de solicitação com nonce R17 novo, parent SHA igual ao main então vigente, campos canônicos e AUTO_DISCOVER vazio; PR próprio, revisão e CI antes do merge. Não reutilizar R16 nem disparar em paralelo.
- EVIDÊNCIA: inspecionar o primeiro workflow R17 e seu artefato original sem reexecução; classificar confirmações, incertezas e falhas. Somente com bindings reais, auditoria autenticada e evidências das telas pendentes, atualizar o GATE #138 e a issue #317. Não certificar a V1 ou a Trilha A por testes simulados.

## Escopo da auditoria

Este GATE não seleciona nem altera os casos de auditoria. Preservar o inventário Trilha A de 184 casos e as 24 provas históricas; o recorte de oito telas/64 combinações da Trilha C é distinto. Ambos dependem de seus próprios controles posteriores. Nenhuma aprovação retroativa.

## Critério de saída

GATE documental revisado e CI verde não é execução R17. BUILD validado não é HML autenticada. R17 somente é concluído com resultado real e recibos íntegros; certificação apenas com todos os controles e telas efetivamente comprovados.
