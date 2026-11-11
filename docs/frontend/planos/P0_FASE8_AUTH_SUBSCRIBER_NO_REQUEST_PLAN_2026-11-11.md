# PLAN — Fase 8 — subscriber autenticado sem nova solicitação

Data: 11/11/2026.

## Causa comprovada

Após a integração documental da certificação V1, o workflow `ContaOS Trilha A Autenticada` foi acionado pelo `workflow_run` do Zero-Drift da `main`. O arquivo `docs/frontend/auditorias/TRILHA_A_SOLICITACAO_UNICA.json` não havia sido alterado nesse merge. Mesmo assim, o job `request` executou `--request-preflight` contra a solicitação histórica já consumida e falhou corretamente com `REQUEST_PARENT`. O job privado ficou SKIPPED antes de secrets.

Isso é fail-closed, mas produz um falso vermelho em merges que não contêm nova solicitação.

## Mudança permitida

Somente:
- este PLAN;
- `.github/workflows/contaos-trilha-a-authenticated.yml`;
- testes já existentes se o contrato do workflow exigir ajuste;
- `docs/frontend/planos/PLANO_ATIVO.json` para allowlist.

Adicionar uma barreira pública, após checkout e antes de dependências/tokens, que verifica no próprio merge da `main` se o caminho exato `docs/frontend/auditorias/TRILHA_A_SOLICITACAO_UNICA.json` mudou em relação ao primeiro pai.

- Se mudou: executar integralmente o preflight atual. Nenhum guard é removido.
- Se não mudou: não executar preflight, não fornecer token de Actions ao preflight, não selecionar request e manter job privado SKIPPED.
- Não aceitar caminho aproximado, wildcard ou inferência por mensagem de commit.
- Não alterar `authenticated-visual-audit.mjs`, request nonce, RLS, JWT, HML, produto ou PROD.

## Aceite

1. PR CI Zero-Drift e LOCK verdes.
2. Protocolo autenticado da PR verde.
3. Testes existentes continuam verdes.
4. Merge normal protegido.
5. Pós-merge: Zero-Drift/LOCK verdes; subscriber autenticado SUCCESS com private SKIPPED quando o merge não altera a request.
6. Nenhuma nova auditoria privada, request ou nonce é criada para fechar esta correção.
