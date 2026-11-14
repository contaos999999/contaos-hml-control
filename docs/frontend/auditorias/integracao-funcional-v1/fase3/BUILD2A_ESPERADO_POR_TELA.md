# Fase 3, BUILD-2a: esperado por tela para MASTER e leitor

Esta PR cumpre a obrigação M-R2-4 do PLAN #655 e a primeira obrigação do BUILD-2 registrada no BUILD-1 (PR #656): o resultado esperado de cada tela de destino fica fixado no catálogo **antes** de qualquer execução, com fonte no código. Os drivers de UI, os negativos, o relatório e o ledger ficam para o BUILD-2b. Até lá, o executor continua falhando fechado com `F3_DRIVER_PENDING`.

## Fontes

1. **Acesso exigido por tela.** Está em `F3_SCREEN_ACCESS`, no executor. Cada entrada aponta para a linha do produto que define o recurso e a ação:
   - menu comum e contextual: `src/lib/navegacao/menuV1.ts`;
   - guardas de ADM01 e V123: `src/components/layout/ContaOSAppShell.tsx:203` e `:209`;
   - rota pública SYS04.

   V111, V117 e V120 não têm item de menu próprio. Por isso herdam o recurso da tela-mãe (`rota-mae`). O BUILD-2b confirma o estado de negação de cada uma pela UI e, se houver divergência, emenda este catálogo por PR revisada.
2. **Matriz RBAC do perfil `leitor`.** É a versão 6 da HML, lida em 13/11/2026 com um `SELECT` somente leitura em `privado.rbac_permissoes_perfis`. A leitura foi autorizada pelo titular na conversa: "Autorizo leitura (Recomendado)". São 48 pares de recurso e ação: 15 permitidos (todos `consultar`, exceto `auditoria` e `usuarios`) e 33 negados. Nenhuma linha foi alterada. Durante a execução, o executor relê as permissões efetivas do `leitor` e falha se elas divergirem dessa fotografia.

## Resultado

- **MASTER:** `ALLOW` em todas as 138 posições.
- **`leitor`:** `DENY` nas telas de criação, edição ou processamento (V102, V103, V105, V113, V122) e na auditoria (V123, incluindo C0033 e C0034). Nas demais telas de leitura, `ALLOW`.
- Nas 26 conexões de ADM01, o `leitor` tem 7 `DENY` e 19 `ALLOW`.
- **Catálogo:** `F3_CASES.json` passa a ter SHA-256 `bce15980d31ce22c8836e26621b267951296e905139b9833c8db4a7400c9ecbb`. O valor está fixado em `F3_CASES_SHA256`.

Um `DENY` só conta como PASS se a tela mostrar o estado explícito de acesso negado do produto (em ADM01, `fase === "negado"`). Erro, timeout, tela vazia ou genérica resultam em `FAIL` ou `BLOCKED`. Nas telas permitidas, o positivo continua obrigatório.

## Estado da pendência do titular

Às 22h17 (Bahia), o titular informou "Usuário criado". O proxy desta sessão não permite listar os secrets. A presença de `CONTAOS_HML_SYNTHETIC_2_*` no environment `hml` será provada na primeira execução; se faltarem, o executor falha fechado antes de qualquer login.
