# PLAN C-CHAT-001 — Frontend contextual da Trilha C

Autorização: determinação expressa do titular para execução da Trilha C, correção do Zero-Drift e preservação das Trilhas A e B. Fonte backend: PR contaos999999/develop#179, integrada, com escopo PLAN e não BUILD.

## Escopo estritamente aditivo
- `src/components/copiloto/CopilotoContrato.tsx`: chat contextual com envio de pergunta e sessão por contrato, fontes exibidas, erros recuperáveis e limpeza de estado após troca de organização/contrato/logout.
- `src/components/layout/ContaOSAppShell.tsx`: ponto de montagem já permitido no PLAN anterior; somente em rota autorizada de contrato, sem alterar menus nem 27 telas existentes.
- `src/test/copilotoContrato.test.tsx`: testes de envio, isolamento de estado e regressão.
- `docs/frontend/planos/PLANO_ATIVO.json`: adição dos três caminhos C, sem remoção de caminhos anteriores nem alterações de permissões do backend.

## Limites e critérios
Nenhuma chamada OpenAI diretamente no navegador. Edge `copilot-query` existente é o único endpoint; JWT, contrato e RLS validados no backend. Nenhuma resposta pode aprovar ou liberar competências. Não duplicar tabelas existentes. Nenhuma alteração em `types.ts`, assets BRAND ou PROD. Zero-Drift, LOCK-TYPES, Vitest, TypeScript e Teste C são obrigatórios. Merge apenas após checks verdes, revisão e prova HML. A PR frontend #377 não certifica OpenAI nem cobertura autenticada das 27 telas.

## Rollback
Reverter os commits da PR #377; sem migração, sem mutação de dados, sem impacto na certificação da Trilha B. Preservar checkpoints e provas anteriores.


ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE (OBRIGATÓRIO)
Sem alterações de marca oficial, tipos gerados, backend ou créditos Lovable.
