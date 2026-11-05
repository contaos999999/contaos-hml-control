# ContaOS 4.1 — Índice canônico de localização do pacote mestre

**Verificado em 04/11/2026. LEITURA OBRIGATÓRIA na retomada de qualquer chat antes de PLAN/GATE/BUILD.**

## Origem exata do arquivo
Nome do anexo de conversa montado: `ContaOS_Pacote_Mestre_Arquitetura_4_1_100_PRD_Lovable_Supabase_BRAND_v1_0_FINAL.zip`.
Caminho encontrado **nesta sessão**: `/mnt/data/files/ContaOS_Pacote_Mestre_Arquitetura_4_1_100_PRD_Lovable_Supabase_BRAND_v1_0_FINAL.zip`.
**Atenção:** caminho de container é temporário, NÃO garantido em novos chats. Recuperar o anexo do histórico/biblioteca, conferir nome e SHA-256. Se não estiver montado, usar Files para localizar/materializar. Não presumir que o caminho exista.

SHA-256 ZIP: `5ee115d12e263d98068288b6bb722f5f303f2d19e1e4c0b5e930e69da03621da`.

Raiz interna:
`ContaOS_Pacote_Mestre_Arquitetura_4_1_Lovable_Supabase_100_PRD_BRAND_v1_0_2026-11-02/`

## Diretórios comprovados
- `00_AI_LEIA_ANTES_DE_ALTERAR.md` e `00_LEIA_ME.md`: instruções de entrada.
- `01_PRD_E_PREMISSAS/`: PRD Mestre e Premissas.
- `02_ARQUITETURA_OFICIAL/`: arquitetura oficial.
- `03_MANUAL_AMBIENTE/`: manual do ambiente.
- `04_BACKEND_SUPABASE/`: manual backend + `docs/MATRIZ_RLS.md`, `PLANO_EDGE_QUEUES_CRON.md`, `SCHEMA_LOGICO_1_A_5.md`.
- `05_FRONTEND_LOVABLE/`: `FE_v4_Manual_Integral_Lovable_Supabase.docx` e anexo BRAND-01.
- `06_PROMPTS_COPIAR_COLAR/`: **fonte literal dos prompts regulares** `Manual_Mestre_Prompts_4_1_100_PRD.docx`; `Caderno_97_Prompts_Atomicos_000_096_PRD_BRAND_v1_1.docx`; caderno anterior 96, índice, manual Lovable/Backend/Frontend e PROMPT 000.
- `07_ZERO_DRIFT/`: ZeroDrift e BRAND-01.
- `08_REQUISITOS_NAO_FUNCIONAIS/`: escalabilidade, concorrência e performance.
- `09_AUDITORIA_E_FONTES/`: QA, fontes, manifestos SHA-256.
- `10_RASTREABILIDADE_PRD/`: matrizes 96 requisitos e custos.
- `11_CUSTOS_POR_ETAPA/`: custos.
- `12_IDENTIDADE_VISUAL_OFICIAL/`: marca, SVG, PNG, favicon, PWA, manual e implementação Lovable.

ZIP contém **89 entradas**. SHA-256 do manual 100 prompts: `8a15d96568d021ac86fdd45e79038e2cb969d69c12b2edb84f012a6129b8940e`. SHA-256 do caderno 97 atômicos: `d9faaae47de4b697b18ad7fb71e4738384514936813cd5b18779f4cb8aed83b8`.

## Protocolo para qualquer chat futuro
1. Ler este índice, `AGENTS.md`, P0 por versão, checkpoint oficial `docs/frontend/ESTADO_E_RETOMADA_CONTAOS_4_1.md` e `PLANO_ATIVO.json` no GitHub.
2. Recuperar ZIP por nome e verificar hash; abrir a pasta `06_PROMPTS_COPIAR_COLAR` e extrair o prompt **literal** do manual DOCX, além dos atômicos aplicáveis.
3. Cotejar o prompt com PRD, Premissas, Arquitetura, Backend Supabase, Zero-Drift, NFR, rastreabilidade, BRAND-01 e CI. Verificar HEADs vivos. Nunca substituir texto original por resumo ou mapa.
4. Seguir **PLAN PR → CI → merge → GATE PR validado → CI → merge → TDD RED → BUILD → GREEN → Teste C independente → checkpoint**, sempre pela ordem V1→certificação→V2 etc.
5. Nunca marcar PASS sem prova. Menu/AppShell transversal, acessibilidade WCAG aplicável, auditoria visual e demais requisitos V1 são bloqueantes para certificação V1 e avanço V2.

## Prompt 75 confirmado literalmente
No manual 100 prompts, título `PROMPT 75 - Trilha de auditoria V1-23`. PLAN exige `eventos_auditoria`, filtros por usuário/evento/entidade/data/`correlation_id`, sem payload sensível; inventário de schema/RLS/grants, arquivos, estados e testes. BUILD somente após plano aprovado. TESTE exige dez verificações: objetos HML; isolamento A/B; perfis; fluxo autorizado; bloqueio de atualização direta; auditoria sem segredo; estados da tela; quatro larguras; teclado/labels/foco; Security view sem novo Critical. **Ter texto original localizado não comprova testes nem libera automaticamente o GATE.**

## Limites de persistência
Este índice GitHub é persistente **após merge**, mas o ZIP original continua sendo um anexo da conversa, não um blob versionado neste PR. O próximo chat deve recuperá-lo pelo nome e hash; se indisponível, registrar impedimento e não inventar leitura. Nenhum segredo deve ser versionado.
