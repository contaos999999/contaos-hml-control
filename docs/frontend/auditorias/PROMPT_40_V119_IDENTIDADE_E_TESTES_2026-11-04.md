# PROMPT 40 / V1-19 — Auditoria de identidade, backend e testes

**04/11/2026, Brasília | BUILD em PR específico, sem alteração do Supabase.**

## Planejamento integrado e gates
- PLAN PR #42, CI `41880258322` com os dois checks SUCCESS e merge em `7aa9324ad1a9f505a1c2d9490608dd539c2c684e`.
- GATE PR #43, `PLANO_ATIVO.json` prompt 40 e atômicos 000/067, 25/25 arquivos e fonte `contaos999999/develop/main@a10d3b1a1a14276c017027f93ec2a7aace4d6cb6`; dois checks SUCCESS e merge `222ca3128732e504737c7e0db7221be094b4b327`.
- Frontend baseline `contaos999999/contaos-hml-control/main@222ca3128732e504737c7e0db7221be094b4b327`, tipos Supabase certificados blob `8ea7750b75fd9d76b29c36ce7613392e3ab65e19`; nenhum write `src/integrations/supabase/**`.
- Fonte original do PROMPT 40: rota `/competencias/:id/apresentar`, acesso aprovador, RPCs `aprovar_apresentacao` e `registrar_apresentacao`, backend como autoridade, BRAND-01 e requisitos de não alucinação.

## Crivo BRAND-01 de V1-19 (preliminar estático)
| Verificação | Implementação | Status atual |
| --- | --- | --- |
| Marca oficial | `ContaOSMarca` no header, branca transparente GOV-017 + navy no tema dark, fonte original imutável | Implementado; automatizar em `brand.test.tsx` |
| Cores e componentes | `bg-primary`, `text-primary-foreground`, `bg-background`, `bg-card`, `border-border`, componentes `Button`, `Dialog`; sem tokens novos ou estilos hex | PASS estático; render real HML NÃO VERIFICADO |
| Responsividade | `max-w-7xl`, `flex-wrap`, grid `sm:grid-cols-2`, `break-all` no identificador, controle `min-h-11` | PASS estrutura; layout autenticado em 4 larguras NÃO VERIFICADO |
| Acessibilidade | H1 único por página, seções com `aria-labelledby`, controles com label, mensagens `role=alert/status`, confirmação em diálogo | PASS estático; WCAG real autenticado NÃO VERIFICADO |
| Datas e rótulos | `formatarCompetencia`, `formatarPercentual`, `rotuloSituacao`, rótulo oficial `PODE APRESENTAR AO CONTRATANTE`, sem "Apta" | A conferir em CI |
| Segurança | `obter_visao_geral_competencia` e `allowed_actions.apresentar` antes de mostrar ações, backend revalida na RPC; sem UPDATE direto, sem serviço de segredos | A conferir em testes e revisão |
| Idempotência | `crypto.getRandomValues` gera UUID v4 por intenção; reaproveitada após erro ambíguo, sem retry automático | A conferir em testes; HML real NÃO VERIFICADO |

## Responsabilidade e limites de comprovação
- A tela não calcula se 100% implica aptidão, não define por conta própria situação/portão, não emite snapshot, não escreve `aprovacoes`, `pacotes_competencia`, `apresentacoes_contratante` ou `competencias`.
- A RPC de aprovação retorna `id_aprovacao` e situação oficial; o usuário confirma a operação e depois a tela relê a visão geral antes de habilitar registro.
- A RPC de registro usa chave por intenção e retorna UUID do registro; o pacote e o hash são gerados exclusivamente pelo backend.
- O uso de mocks nos testes não comprova autorização efetiva de HML com duas identidades; **HML E2E autenticado, RLS multitenant real e inspeção visual interna permanecem NÃO VERIFICADOS**.
- Não confundir os 200 casos Teste C em tela privada (sem credenciais) com 200 verificações internas autenticadas. O Teste C classifica rotas protegidas apropriadamente.

## Critérios de saída antes de merge
1. TDD RED registrado em commit de teste `e5d096eb759fd216340cddb16955588707d883b2` antes dos arquivos da aplicação; a execução real RED **não foi realizada isoladamente**, portanto não afirmar evidência de falha controlada.
2. CI `vitest run --maxWorkers=2`, TypeScript, build, marca, context gate, Zero-Drift e dois check-runs SUCCESS no SHA final. Contagem da suite, problemas, correções e resultados serão registrados no PR.
3. Matriz `scripts/testc/visual-audit.mjs` e teste `25 × 4 × 2 = 200` com V119 privada, prints e SHA256SUMS sem perda das 24 superfícies anteriores.
4. Após CI e merge, atualizar checkpoint `docs/frontend/ESTADO_E_RETOMADA_CONTAOS_4_1.md` com SHA real, run, evidências e próxima tarefa.
5. Rollback apenas por PR para desfazer navegação e rota e regressão, sem tocar no Supabase ou nos registros de apresentação já confirmados.

**Resultado final do BUILD:** PENDENTE até CI e Teste C do PR e validação de HEAD.
