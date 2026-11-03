<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

# ContaOS 4.1 — Regras Constitucionais e Premissas Permanentes

Ambiente: HML. Supabase oficial conectado: `gklhhhyosgasnyoxlrui`.

## Regras constitucionais

1. Supabase é a única fonte de verdade.
2. Toda tabela de negócio exposta usa RLS e grants mínimos.
3. O frontend nunca recebe secret key, senha de banco ou chave privada.
4. CRUD simples pode usar Data API com RLS.
5. Transições críticas usam RPC/Database Function ou Edge Function autenticada.
6. `PODE APRESENTAR AO CONTRATANTE` somente com 100,00% dos requisitos obrigatórios e aplicáveis conformes.
7. `PODE REAPRESENTAR AO CONTRATANTE` somente com 100% dos apontamentos da rodada tratados.
8. `VALIDADA` somente após parecer final favorável do contratante.
9. Alerta histórico transversal de outro contrato é informativo e não integra o portão de 100% por si só.
10. Documentos não são sobrescritos; nova correção = nova versão.
11. IA não cria obrigação sem fonte, escopo e aprovação humana.
12. Uma tarefa não pode alterar área fora do escopo.
13. Se precisar de algo não autorizado, PARE e explique.
14. Entre alternativas igualmente conformes ao pacote 4.1, usar sempre a que consome menos créditos do Lovable.

## Premissas adicionais permanentes

- Obedecer PRD 4.1, Premissas, Arquitetura, Zero-Drift, matriz 96/96, PROMPT 00–99 e prompts atômicos 000–096.
- HML somente; PROD proibido nesta fase.
- Backend Supabase certificado deve ser consumido, não reconstruído.
- Nenhuma tabela, migration, RLS, Edge Function, Auth, Storage ou backend paralelo sem tarefa/autorização específica.
- Frontend em PT-BR, datas/horas brasileiras e moeda BRL.
- Tooltips acessíveis como componente padrão quando houver ganho real de compreensão, com hover + foco no desktop e alternativa por toque no mobile.
- Tudo deve ser documentado, registrado e versionado no GitHub.
- Design System oficial: Executive Command Center + Audit Workspace.
- Playwright, acessibilidade, responsividade 1440/1280/768/390 e Zero-Drift fazem parte do critério de pronto.
- **Economia de créditos Lovable é regra canônica de execução:** inspecionar e planejar fora do Lovable quando ferramentas diretas do GitHub/Supabase forem suficientes; agrupar instruções compatíveis em um único turno; evitar mensagens, retries, planos, scans ou builds duplicados; não reenviar turno ainda em processamento; preferir GitHub para documentação/diff/rastreabilidade e Supabase direto para inspeção/provas de backend; reservar Lovable para alterações e validações que realmente dependam do editor/runtime/frontend Lovable.
- Economia nunca pode reduzir fidelidade ao PRD, segurança, TDD, Teste C, Zero-Drift, rastreabilidade, cobertura, acessibilidade, responsividade ou critérios de aceite. Se a opção mais barata for tecnicamente inferior ou incompleta, ela é proibida.

## Complemento canônico — ContaOS Brand v1.0 / PROMPT 000

Antes de qualquer alteração de identidade visual, logo, símbolo, cores, tipografia, favicon, PWA, sidebar, login, header, tokens, manifest, metadata ou aplicação de marca, o agente deve ler integralmente no repositório `contaos9999/develop`:

- `19_IDENTIDADE_VISUAL_OFICIAL_BRAND_1_0.md`;
- `20_PROMPT_000_BRAND_01.md`.

O `PROMPT 000 / BRAND-01` é transversal e exclusivamente visual. Os prompts 001–096 permanecem os 96 prompts PRD/NFR existentes, sem renumeração, e a cobertura funcional permanece 96/96.

Regras obrigatórias para BRAND-01:
- executar PLAN antes de BUILD e aguardar aprovação do PLAN;
- utilizar apenas assets oficiais da ContaOS Brand v1.0;
- integrar a marca ao Design System existente, sem criar sistema paralelo;
- preservar integralmente rotas, conteúdo funcional, permissões, regras de negócio, estados, cálculos, integrações e backend;
- não usar a tarefa visual para refatorar ou corrigir área não relacionada;
- validar 1440 / 1280 / 768 / 390, dark mode, acessibilidade, favicon e PWA;
- executar a fase TESTE sem alterar código;
- se qualquer necessidade ultrapassar o escopo visual, PARE e reporte LACUNA ou CONFLITO;
- em conflito estético com arquitetura, comportamento ou Design System, o pacote 4.1 prevalece.


## LOCK-TYPES-01 — tipos Supabase congelados, proteção obrigatória

- O código `src/integrations/supabase/types.ts` é **imutável** no blob Git `8ea7750b75fd9d76b29c36ce7613392e3ab65e19`, certificado no commit `ad0b933943d4b69f7a9f23f203e4cff1211b4902`. Não editar, regenerar, substituir, formatar ou reescrever esse caminho em nenhum PLAN, BUILD, TESTE ou auditoria.
- A ferramenta Lovable pode regenerar tipos por mecanismos internos; isso **não equivale a autorização**. Antes de declarar qualquer gate PASS, conferir `git hash-object src/integrations/supabase/types.ts`. Havendo drift, restaurar o blob imutável e comprovar novo SHA e CI. Nunca mudar a constante do verificador para esconder drift.
- O workflow `.github/workflows/contaos-types-autolock.yml` detecta e **tenta** autorrestaurar drift na branch main, após suíte e Zero-Drift verdes, com controle de concorrência e limite para impedir ciclos. O teste isolado do workflow não equivale à comprovação do push de recuperação. Falhas precisam ser tratadas, nunca silenciadas.
- O frontend consome apenas o Supabase HML oficial; não criar backend paralelo, não desconectar integração, não tocar PROD e não usar geração de tipos como justificativa para migration sem autorização.
- Mudança legítima de tipos só mediante mudança formal de contrato/schema, atualização rastreável do blob certificado, validação de todos os usos, CI e Teste C independente. Ver `docs/frontend/LOCK-TYPES-01.md`.


## ADR-DEV-001 — GitHub como editor canônico do frontend (APROVADA EM 03/11/2026)

- **Decisão expressa do responsável:** programar, corrigir e testar o frontend React/TypeScript **diretamente no GitHub** `contaos9999/contaos-hml-control`, com branch/PR quando viável, commits rastreáveis e CI. O agente de desenvolvimento do Lovable deixa de ser necessário para BUILD.
- **Supabase HML** `gklhhhyosgasnyoxlrui` continua backend exclusivo; migrations/RLS/RPC/Storage/Edge são governados por `contaos9999/develop` com testes. **PROD proibido** nesta etapa.
- **Lovable permanece conectado exclusivamente para sincronizar e visualizar** o projeto (e inspecionar quando realmente necessário). Não solicitar IMPLEMENTAÇÃO/BUILD ao agente Lovable nas próximas correções. Mudança espontânea de plataforma não é autorização, tratar como drift.
- Fluxo: identificar prompt/atômicos → PLAN → código GitHub → TDD RED/GREEN → lint/typecheck/testes/build/segurança → Zero-Drift e hash bloqueado do `types.ts` → Teste C independente, visual 1440/1280/768/390 claro/escuro → registrar evidências/commit por prompt. CI e MOCK não substituem E2E autenticado.
- Não forçar push nem reescrever histórico sincronizado com Lovable. Proteger escopo e a marca BRAND-01. Só pedir intervenção por impedimento externo ou risco que exija autorização distinta.
- **Continuidade entre chats:** o registro mestre de retomada é `docs/frontend/ESTADO_E_RETOMADA_CONTAOS_4_1.md`. No início de novo chat, **ler os HEADs atuais nos dois repositórios antes de agir**; depois ler o registro e as matrizes de evidência. Não confiar apenas na memória do chat.
- Detalhamento: `docs/frontend/ADR-DEV-001-GITHUB-DIRETO.md`.
