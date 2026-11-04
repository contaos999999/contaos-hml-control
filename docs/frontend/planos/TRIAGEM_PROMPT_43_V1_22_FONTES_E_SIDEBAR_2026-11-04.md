# V1-22 / PROMPT 43 — triagem documental de prontidão (NÃO É PLAN VALIDADO)

Data: 04/11/2026. Referência: issue #66 (sidebar), sem alterar a sequência funcional.

## Fontes efetivamente consultadas
- `AGENTS.md`, `docs/frontend/governanca/P0_ORDEM_POR_VERSAO_4_1.json`, `docs/frontend/planos/TEMPLATE_PROMPT_PLAN_GATE.md` do frontend.
- `contaos999999/develop/docs/prompts/P0_PRIORIDADE_ZERO_ORDEM_POR_VERSAO_4_1.md`, `docs/prompts/PROMPT_TRACKS_4_1.json`, `06_FRONTEND_LOVABLE_ESPECIFICACAO_4_1.md`, `19_IDENTIDADE_VISUAL_OFICIAL_BRAND_1_0.md` e `20_PROMPT_000_BRAND_01.md`.
- Checkpoint `docs/frontend/ESTADO_E_RETOMADA_CONTAOS_4_1.md` e `docs/frontend/planos/PLANO_ATIVO.json`.

## Evidências e sequência
- Último BUILD funcional documentado: 42/V1-21, PR #62, merge `479f3be73d8caa0bd3651045ffb26f06f2b230e9` (revalidar HEAD vivo antes de PLAN).
- P0: executar 43/V1-22 **Ingestão de Histórico**, depois 75/V1-23 **Trilha de Auditoria**, depois auditoria retrospectiva 00–42 e certificação V1. Nenhuma V2 antecipada.
- Crosswalk estrutural do 43: 000, 006, 007, 008, 009, 010; IDs V1-HIS-001 a V1-HIS-005. Fonte original `Manual_Mestre_Prompts_4_1_100_PRD.docx` é declarada no catálogo como **não materializada no repositório**. SHA-256 original informado pela matriz P0: `8a15d96568d021ac86fdd45e79038e2cb969d69c12b2edb84f012a6129b8940e`. Não alegar leitura literal.
- O frontend `PLANO_ATIVO.json` consultado ainda refere-se ao regular 42 VALIDADO. Nenhum GATE 43 presumido.
- Especificação frontend nomeia V1-22, mas não prova isoladamente contrato operacional de upload, Storage, RPC, permissões ou critérios integrais do manual.

## Pendências bloqueantes antes do PLAN 43 validado
1. Recuperar original do PROMPT 43 do pacote mestre e comparar seu hash com a fonte certificada; transcrever critérios sem inventar.
2. Ler e cruzar integralmente os 25 documentos normativos, confirmar HEAD/snapshot/blobs atuais e requisitos atômicos/NFR aplicáveis.
3. Inspecionar **apenas interfaces frontend e contratos já documentados** para identificar se há dependência de Storage/RPC; se lacuna backend, solicitar autorização específica antes de inspecionar/mudar backend/HML.
4. Definir allowlist de arquivos, matriz de teste TDD/BRAND-01/Teste C, estados e segurança; publicar PLAN em PR próprio, exigir 2 checks SUCCESS e merge. Depois GATE separado e BUILD separado.

## Sidebar issue #66
A implementação global da sidebar fica proposta **depois dos regulares 43 e 75, antes da certificação V1**, sujeita à leitura do manual e autorização de escopo. BRAND-01 obriga auditoria visual da sidebar, mas não autoriza sozinho mudança funcional de navegação. Não inserir sidebar no BUILD 43 por conveniência.

## Status
**TRIAGEM DOCUMENTAL, NÃO AUTORIZA BUILD.** Nenhuma alteração de código, backend, RLS, Auth, Storage, PROD ou types.ts. Nenhum CI ou merge alegado neste documento.
