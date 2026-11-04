# PROMPT 41 / V1-20 — comprovação literal da fonte original e contrato tipado do pacote

**04/11/2026, horário de Brasília.** Auditoria SOMENTE documental, sem BUILD ou acesso ao Supabase.

## Fonte e autenticação

- Arquivo de origem: `ContaOS_Pacote_Mestre_Arquitetura_4_1_100_PRD_Lovable_Supabase_BRAND_v1_0_FINAL.zip`, presente na biblioteca do titular; SHA-256 do ZIP `5ee115d12e263d98068288b6bb722f5f303f2d19e1e4c0b5e930e69da03621da`. Não incorporar ZIP nem dados pessoais ao repositório.
- Documento extraído em memória do ZIP: `06_PROMPTS_COPIAR_COLAR/Manual_Mestre_Prompts_4_1_100_PRD.docx`; SHA-256 `8a15d96568d021ac86fdd45e79038e2cb969d69c12b2edb84f012a6129b8940e`, igual ao catálogo normativo `docs/prompts/PROMPT_TRACKS_4_1.json` e ao manifesto do PLAN 40.
- Caderno de origem: `06_PROMPTS_COPIAR_COLAR/Caderno_97_Prompts_Atomicos_000_096_PRD_BRAND_v1_1.docx`; SHA-256 `d9faaae47de4b697b18ad7fb71e4738384514936813cd5b18779f4cb8aed83b8`, também igual à evidência de fonte do GitHub. Conferidos nominalmente 000, 019, 020, 067, 087, 093, com IDs e textos alinhados à matriz anterior.
- O PROMPT 41 ocupa os parágrafos de índice **2303 a 2362** do documento original (índices zero-based em `python-docx`); o PROMPT 42 inicia em 2363. Regra geral: texto original antes de qualquer BUILD, aprovação do PLAN prévia.

## Critérios originais do PROMPT 41 (resumo verificável)

- Regular 41 = tela **V1-20 Apresentação/protocolo**, rota literal `/competencias/:id/apresentacoes/:apresentacaoId`.
- Acesso definido como `acesso`; backend definido como **Data API com RLS + RPCs específicas quando crítico**.
- Antes de BUILD: listar arquivos exatos, consultas/RPC/funções existentes, componentes, estados `loading/empty/success/denied/error`, processing se aplicável, responsividade 1440/1280/768/390, teclado/foco/labels/status e testes.
- Proibidos: criar tabela/RPC/Edge não existente, secret no navegador, regra/status crítico local, alteração de auth/cliente Supabase/layout global fora de escopo, ocultar 403 como vazio, qualquer mudança fora da allowlist.
- Critérios de TESTE originais, 12 itens: rota abre; perfil autorizado; perfil negado pelo RLS; estados loading/empty/error; sem secrets; sem UPDATE direto de ação crítica; 1440/1280; 768; 390; teclado/foco/labels; console limpo; Security Scan sem novo Critical. Provas HML autenticadas não podem ser substituídas por mock.
- O original instrui não corrigir automaticamente durante o TESTE e não passar ao próximo prompt sem PASS dos itens obrigatórios. A ADR de GitHub direto preserva essa política, substituindo apenas a ferramenta Lovable para BUILD.

## Contrato de frontend existente, sem alterar backend

- `src/integrations/supabase/types.ts` blob certificado `8ea7750b75fd9d76b29c36ce7613392e3ab65e19` (consultado em `main`), define `apresentacoes_contratante.Row`, `pacotes_competencia.Row` e **`itens_pacote_competencia.Row`**.
- `apresentacoes_contratante` associa `id` à apresentação, `id_pacote` ao pacote, competência, contrato, organização e campos `protocolo`, `forma_apresentacao`, `apresentado_em`, `tipo` e `numero_rodada`.
- `pacotes_competencia` fornece `id`, `hash_pacote`, `status`, `tipo`, `numero`, `congelado_em` e a associação à competência/contrato/organização.
- `itens_pacote_competencia` fornece `id_pacote`, `entidade_id`, `entidade_tipo`, `versao_id`, `hash`, `metadados`, `ordem`, `id_organizacao`, `id_contrato` e `id_competencia`. Há FK de `id_pacote` para `pacotes_competencia.id`. **Este é o contrato tipado de itens congelados que faltava à análise anterior**, não autorização comprovada de acesso ao conteúdo da sessão HML.
- `src/lib/competencias/apresentacaoDados.ts` do PROMPT 40 chama RPC `registrar_apresentacao(...)` e retorna UUID do registro. Esse UUID deve alimentar `:apresentacaoId`; não confundir UUID com o texto digitado em `p_protocolo`.
- Escopo de leitura candidato: SELECT somente de apresentação `id+id_competencia` e vínculo de tenant, pacote `id_pacote+competencia` e itens com filtro explícito `id_pacote` e tenant, com whitelist de campos. NÃO consultar docs vivos para reconstruir snapshot; não executar mutações diretas.

## Gates e conclusão

| Gate | Estado | Prova / limitação |
| --- | --- | --- |
| Identidade fonte original regular 41 | PASS | SHA-256 original e parágrafos 2303–2362 recuperados do pacote do titular |
| Fonte original caderno 97 | PASS | SHA-256 original idêntico ao catálogo, títulos amostrados conferidos |
| Contrato frontend tipado apresentação/pacote/itens | PASS ESTRUTURAL | `types.ts` certificado, sem alteração |
| Existência de consulta de dados sob RLS em HML real, permissões por perfil/tenant | NÃO VERIFICADO | Sem sessão A/B e sem investigação backend autorizada |
| Leitura real dos metadados/hash/itens congelados do pacote | NÃO VERIFICADO | Tipagem não prova SELECT ou retorno real |
| Avaliação semântica dos 97 IDs | TRIAGEM REGISTRADA | `PROMPT_41_V120_CROSSWALK_97_ATOMICOS_2026-11-04.md`; não confundir com 97/97 execução |
| PLAN→GATE de BUILD | NÃO VALIDADO | Necessário autorizar oficialmente o escopo e cumprir critérios de segurança |

**Conclusão:** pendência literal do PROMPT 41 RESOLVIDA, e lacuna estrutural de itens do pacote ESCLARECIDA no frontend. A validação de acesso por RLS HML e a recuperação de dados reais da apresentação permanecem **NÃO VERIFICADAS**, exigindo consentimento humano específico antes de investigar Supabase. Este documento não libera BUILD, migrations, mudanças de types, download, PROD, novos endpoints, ou ação do Lovable.
### Espelho literal permanente no GitHub

O conteúdo integral dos parágrafos 2303–2362 foi preservado em `docs/frontend/fontes/PROMPT_41_V120_TEXTO_ORIGINAL_VERIFICADO_2026-11-04.md`, com identificação exata do ZIP do titular e SHA-256 do DOCX de origem. Esta transcrição documenta o requisito, mas não suplanta a fonte principal nem autoriza um BUILD sem GATE.
