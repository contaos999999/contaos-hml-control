# PLAN P0 V1-14: compatibilidade de resposta RPC da competência

## Contexto e evidência
Na auditoria autenticada da Vercel (PR #325), a competência sintética 59072760-4420-4598-82dd-367f41a79e89 existe no Supabase HML e a RPC `obter_visao_geral_competencia` respondeu HTTP 200, mas a tela mostrou erro. Investigação somente-leitura comprovou que `privado.avaliar_portao_conformidade` retorna `conformes_ou_na_validos`, enquanto `parseVisaoGeral` exige `avaliados`. PR #326 implementou prematuramente correção sem gate prévio; CI 42445733140 reprovou corretamente o escopo. Não integrar esse PR como está.

## Escopo fechado e fonte
Prompt regular 75/V1, V1-14; preservar as 25 fontes normativas, o catálogo 100/97 e o snapshot canônico, sem alterar os hashes. Aprovação expressa do titular: "Resolva este problema da competencia" e "Execute" (08/11/2026). Nenhuma alteração de backend, SQL, RPC, Auth, RBAC, RLS, tipos protegidos, PROD, identidade visual ou permissões.

Arquivos de BUILD autorizados exclusivamente após merge deste PLAN com CI verde:
- `src/lib/competencias/competenciaVisaoGeralDados.ts`
- `src/test/competenciaVisaoGeral.test.tsx`

## Implementação e testes
Mapear campo canônico `portao.conformes_ou_na_validos` para alias exclusivamente de apresentação `portao.avaliados`; rejeitar payload incompleto. Não derivar autorização: manter `allowed_actions` do servidor. Cobrir regressão do campo, apresentação bloqueada e validação negativa. Executar testes focados, TypeScript, build, LOCK-TYPES, Zero-Drift e Teste C autenticado no preview Vercel; promover à main somente após CI verde e reteste. Rollback por reversão do BUILD, preservando banco e deploy anterior.

## Governança
ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE (OBRIGATÓRIO)

O frontend canônico está no GitHub, HML de validação na Vercel. Sem novas dependências nem custo Lovable. O PLAN deve ser integrado antes do primeiro commit de BUILD na branch definitiva. Este documento autoriza somente o escopo descrito; não equivale a PASS funcional ou certificação V1.
