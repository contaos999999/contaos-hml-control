# Fase 2 R13: guard nativo bloqueou a R12 antes do login; novo nonce

## Estado terminal R12, sem certificação

A Fase 2 continua NÃO CERTIFICADA. Cadeia integrada na `main`:
- PLAN R12: #643, merge `76a9cf914c2a08fac88d8de0cc7b3d8ddb695dc0` (commit do PLAN `a8b5a4d`).
- BUILD R12: #644, merge `f169905d40b14a3e12a47beb7cf8617ab577b726` (preflight por `head_sha`).
- REQUEST R12: #645, merge `bb05f3bf13b40811b6c9a9ab511691d7c421de91`. A revisão canônica `5896990529` foi a última no HEAD, conferida pela API.

Execução Auth `43494812615`, attempt 1:
- Job de solicitação `132125031036` **SUCCESS** em 34 s, incluindo a instalação. A correção do preflight funcionou.
- Job privado `132125342973` **FAILURE**: o guard nativo, que roda antes de qualquer login, emitiu `{"phase":"NATIVE_GUARD","exitCode":1,"failedCases":["WORKER"],"sourceFailure":"FENCE_SOURCE",…}` e `{"state":"BLOCKED","code":"NATIVE_GUARD"}` em 14 s. **Não houve login, credencial, navegador privado nem caso executado.** Não há artefato.

O mesmo guard nativo passou com o mesmo código no CI da PR #644 (`d42ea2e`) e na execução privada da R10. A falha não reproduz em outras execuções; não se presume causa nem se relaxa o guard.

R12 está consumida, sem rerun, replay nem reuso de nonce. O ledger v4 continua válido, com o índice 52 pendente.

## BUILD R13

1. **Nonce** `integracao-v1-fase2-nav-20261113-r13`, R12 consumida, este PLAN como ancestral. Nenhuma outra mudança: guard nativo, fence, prazos, ledger, produto e deployment inalterados.
2. **Compatibilidade:** só o nonce e o ancestral mudam; `050beb1` continua compatível.

## Se o guard nativo falhar de novo

Uma segunda falha do guard nativo deixa de ser tratada como ocorrência isolada: abre PLAN próprio para diagnosticar o caso `WORKER`/`FENCE_SOURCE` antes de qualquer nova REQUEST.

## Proibições

Continua proibido relaxar o guard nativo, prazos ou o fence; repetir a R12; reutilizar nonce; alterar produto, backend, SQL, RLS, RBAC, Auth, Storage, Edge, segredos, YAML, lockfile, branch protection, `types.ts` ou PROD. As regras de consolidação e certificado do PLAN R11 continuam valendo. PLAN, BUILD e REQUEST são integrados por merge commit; a revisão canônica é a última no HEAD da REQUEST.
