# Emenda PLAN V1-14: fixtures da RPC compartilhada V1-18/V1-19

O BUILD #328 (HEAD d3bd225) corrigiu o parser para o campo canônico `conformes_ou_na_validos`. CI Zero-Drift 42446316835 revelou 7 falhas de regressão, 3 em V1-19 e 4 em V1-18, porque os testes legados ainda simulam `portao.avaliados`, campo inexistente na RPC real. Não flexibilizar parser para aceitar contrato inválido, nem mudar regra de autorização.

Autorizar exclusivamente a atualização do campo de fixtures `avaliados` para `conformes_ou_na_validos` nos dois testes:
- `src/test/competenciaApresentar.test.tsx`
- `src/test/competenciaParecer.test.tsx`

O BUILD deve preservar o parser canônico já implementado, `allowed_actions` do backend, casos negativos, RLS/RBAC, isolamento, tipos, backend, PROD e as 25 fontes normativas. Executar RED documentado por CI #328, GREEN focado e suíte integral; não alterar expectativas de autorização nem remover testes. Plano autorizado expressamente pelo titular para corrigir integralmente o problema da competência.

ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE (OBRIGATÓRIO)

Sem alteração visual, rotas ou custos Lovable. Rollback por reversão da atualização de fixtures, sem tocar backend. Gate PLAN separado e CI verde antes do BUILD subsequente.