# ContaOS 4.1 — Arquitetura Frontend: Regras Constitucionais e Premissas Permanentes

Ambiente: HML. Supabase oficial conectado: `gklhhhyosgasnyoxlrui`.

Arquitetura oficial: frontend Lovable/React/TypeScript + backend Supabase próprio conectado ao projeto.

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

## Premissas adicionais permanentes

- Obedecer PRD 4.1, Premissas, Arquitetura, Zero-Drift, matriz de 96 requisitos PRD/NFR, os 100 prompts regulares 00–99 e os 97 atômicos 000–096 (000 = BRAND-01, 001–096 = 96 RF/NFR).
- HML somente; PROD proibido nesta fase.
- Backend Supabase certificado deve ser consumido, não reconstruído.
- Nenhuma tabela, migration, RLS, Edge Function, Auth, Storage ou backend paralelo sem tarefa/autorização específica.
- Frontend em PT-BR, datas/horas brasileiras e moeda BRL.
- Tooltips acessíveis como componente padrão quando houver ganho real de compreensão, com hover + foco no desktop e alternativa por toque no mobile.
- Tudo deve ser documentado, registrado e versionado no GitHub.
- Design System oficial: Executive Command Center + Audit Workspace.
- Playwright, acessibilidade, responsividade 1440/1280/768/390 e Zero-Drift fazem parte do critério de pronto.

## ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE (obrigatório em TODOS os prompts)

Este bloco é obrigatório para os prompts regulares 00–99, atômicos 000–096, PLAN, BUILD, correções, auditorias e Teste C. Referências normativas completas: `contaos9999/develop/07_ZERO_DRIFT_GOVERNANCA_4_1.md` seção 11 e `12_PROMPTS_PROTOCOLO_IMPLEMENTACAO_4_1.md` seção 9.

- **BRAND-01**: usar logo oficial, `ContaOSMarca`, SVGs, tokens do Design System e componentes existentes (REUTILIZAR > ESTENDER > CRIAR). Conferir **ambos os temas**, 1440/1280/768/390, estados de loading, vazio, erro e sucesso, contraste e teclado. Sem evidência visual, registrar `NÃO VERIFICADO`. Para backend sem alteração visual, declarar `N/A justificado`.
- **Economia Lovable**: primeiro inspecionar GitHub, Supabase HML e estado do turno; não reenviar `queued/running/awaiting_input`; consolidar instruções; escolher menor delta e reutilizar evidências válidas. Não usar créditos Lovable para inspeções que GitHub/Supabase resolvem. Não inventar economia ou resultados.
- **Sem exceção de qualidade**: nenhuma economia substitui autorização humana específica, TDD RED→GREEN, segurança, CI, regressão, auditoria do diff, Teste C isolado e fidelidade ao PRD.
- **Rastreabilidade**: vincular cada regular a todos os atômicos relevantes, incluindo 000 e NFR transversais, com justificativa para não aplicáveis. A aprovação do backend 96/96 não prova execução individual do frontend.
- **Status obrigatórios** por entrega: `IDENTIDADE VISUAL PASS/FAIL/NÃO VERIFICADO/N/A`, `ECONOMIA LOVABLE CONFORME/NÃO CONFORME` e `ZERO-DRIFT PASS/FAIL`.

O saneamento retrospectivo dos Prompts 00–38 está registrado em `contaos9999/develop/docs/prompts/PLANO_SANEAMENTO_39_PROMPTS_2026-11-03.json`. Não declarar conclusão 100% sem evidência por item.
