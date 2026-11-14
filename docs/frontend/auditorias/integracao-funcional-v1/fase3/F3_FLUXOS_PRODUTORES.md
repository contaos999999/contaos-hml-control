# Fase 3: fluxos de rede dos produtores mutantes (levantamento do BUILD-2b-2)

Levantamento feito em 14/11/2026, somente no frontend (`src/**`, só leitura). Ele foi motivado pela causa raiz das rodadas R1 e R2 do 2b-2a: a cerca de mutação estava sendo desenhada antes de se conhecer o fluxo de rede de cada produtor.

As pré-condições impostas pelo backend não foram lidas, porque ler backend exige autorização do titular (ESCALONAMENTO de AGENTS.md). Por isso estão marcadas com [REVISAR].

Legenda da origem dos UUIDs do corpo:
- **gerado:** chave nova da UI (`crypto.randomUUID`);
- **inventário:** entidade criada por intenção anterior da F3;
- **derivado:** valor criado pelo backend e lido pela UI (versão, hash, execução);
- **capturado:** devolvido por um passo anterior da mesma ação.

| Ordem | Origem | Ação de negócio (passos de rede) | Fonte | UUIDs e valores não literais | Pré-requisitos de negócio |
|---:|---|---|---|---|---|
| 2 | SYS04 | `rpc criar_organizacao` | `src/lib/organizacao/criarOrganizacaoDados.ts:35-40` | nenhum | nenhum |
| 4 | ADM01 | `edge admin-invite-user` → `rpc salvar_vinculo_usuario_adm`. Na repetição pelo mesmo diálogo, só o RPC sai | `src/components/administracao/usuarios/ContractScopeDialog.tsx:141-199` | chaves geradas (2); `p_id_usuario` capturado da resposta do convite | nenhum |
| 5 | V102 | `table POST contratantes?select=id,razao_social,situacao` | `src/lib/contratantes/novoContratanteDados.ts:148` | organização | nenhum |
| 6 | V103 | `rpc atualizar_contratante` | `src/lib/contratantes/editarContratanteDados.ts:99-115` | contratante do inventário; `p_versao_esperada` derivado | V102 |
| 7 | V105 | `table POST contratos` (sem RETURNING) | `src/lib/contratos/novoContratoDados.ts:107-129` | contratante do inventário. O ID do contrato só existe por releitura | V102 |
| 8 | V106 | `rpc atualizar_contrato_v1` | `src/lib/cadastros/cadastroOperacionalDados.ts:210-225` | contrato do inventário; `p_request_id` gerado (4ª chave); `p_versao_esperada` derivado | V105 |
| 9 | V108 | `rpc publicar_versao_proposta_v108` | `src/components/contratos/OrcamentoContrato.tsx:1500-1513` | `p_id_versao` e `p_hash_esperado` derivados; chave gerada | `salvar_proposta_orcamentaria_v108`, `registrar_versao_proposta_v108` (exige `p_id_arquivo_origem`, isto é, um upload: Edge de assinatura, Storage e `confirmar_upload_arquivo`) e `salvar_linha_orcamentaria_v108`. **3 ações** além do upload |
| 10 | V107 | `rpc definir_aplicabilidade_fonte_v107` | `src/components/contratos/BaseNormativaContrato.tsx:1465-1473` | `p_id_versao` derivado; `p_atualizado_em_esperado` derivado; chave gerada | `salvar_fonte_normativa_v107`, `registrar_versao_fonte_v107` e `aprovar_versao_fonte_v107` (hash derivado), ou fonte global já aprovada [REVISAR]. **Até 3 ações** |
| 11 | V109 | `rpc executar_comando_lista_v1` | `src/lib/contratos/listaOperacionalDados.ts:279-317` | `p_request_id` gerado; `p_id_lista` derivado ou nulo | [REVISAR] |
| 12 | V110 | `edge storage-sign-upload` → `PUT` no Storage (ou TUS, se a Edge pedir) → `rpc confirmar_upload_arquivo` → `rpc criar_documento_contrato_completo` | `src/lib/contratos/documentosDados.ts:441-457, 646-655, 763-773` | caminho e token capturados da Edge; `p_id_arquivo` capturado; `p_sha256` do arquivo sintético; chave gerada | V105 |
| 13 | V111 | upload como em V110 → `rpc adicionar_versao_documento_contrato` | `src/lib/contratos/documentosDados.ts:783-791` | documento do inventário; `p_id_arquivo` capturado; chave gerada | V110 |
| 14 | V113 | `rpc criar_competencia` | `src/lib/contratos/novaCompetenciaDados.ts:71-74` | contrato do inventário | condições do backend sobre contrato, orçamento e base [REVISAR] |
| 15 | V115 | upload → `rpc criar_documento_competencia_v115` | `src/lib/competencias/competenciaDocumentosDados.ts:308` (upload pelo pipeline certificado de V1-10) | competência do inventário; arquivo capturado; chave gerada | V113 |
| 16 | V116 | `rpc solicitar_analise_competencia` | `src/lib/competencias/competenciaAnaliseDados.ts:194` | competência do inventário | V115. O resultado é **assíncrono** (worker), risco do PLAN §10 |
| 17 | V117 | `rpc registrar_revisao_requisito_v117` | `src/lib/competencias/revisaoRequisitoDados.ts:155-171` | `p_id_requisito`, `p_id_execucao_esperada`, `p_id_resultado_esperado` e `p_hash_esperado` derivados da análise; `p_request_id` gerado | V116 concluída pelo worker |
| 18 | V118 | `rpc aprovar_parecer_interno` | `src/lib/competencias/parecerInternoDados.ts:158-162` | `p_id_parecer` capturado do pré-requisito | `solicitar_parecer_interno` (**1 ação**), com as condições do backend [REVISAR] |
| 19 | V119 | `rpc registrar_apresentacao` | `src/lib/competencias/apresentacaoDados.ts:99-104` | competência do inventário; `p_idempotency_key` gerado | `aprovar_apresentacao` (**1 ação**), que só devolve sucesso com `percentual_conformidade` igual a 100 (regra constitucional 6). Exige todos os requisitos obrigatórios e aplicáveis conformes, isto é, possivelmente **uma revisão V117 por requisito** |
| 20 | V122 | upload → `rpc registrar_relatorio_historico_hml` | `src/lib/contratos/ingestaoHistoricoDados.ts:77-79` | `p_id_arquivo` capturado | upload |

## Consequências para o PLAN

1. **Pré-requisitos acima do teto.** No mínimo há 3 (V108), mais até 3 (V107), mais 1 (V118), mais 1 (V119), totalizando pelo menos 8. V119 pode exigir ainda N revisões V117, uma por requisito. O PLAN §7.2 prevê no máximo 5 e diz que divergência "vira emenda deste PLAN, nunca um atalho".
2. **Orçamento por execução.** O total cresce para 2 (organização e vínculo), mais 16 produtores, mais 8 ou mais de pré-requisitos, mais 10 de duplicidade, ou seja, pelo menos 36. Isso passa as 30 intenções por execução, antes mesmo de contar as revisões V117 de V119. O total de 60 da fase continua possível com duas execuções, mas a primeira execução precisa ser planejada para parar no teto.
3. **Uploads como parte da ação.** V108 (versão), V110, V111, V115 e V122 enviam arquivo. Cada upload são três ou quatro requisições (Edge, Storage e confirmação) e cria um registro `arquivos`. O PLAN não diz se o upload conta como intenção de negócio própria ou se é parte da ação. Também não diz qual arquivo sintético usar no V108, que no produto é uma proposta orçamentária.
4. **Assincronia.** V116 e V117 dependem do worker de análise (risco do PLAN §10). V119 depende do resultado de conformidade.
5. **Origens de valor que a cerca precisa tipar** (parecer R2, grupos A e B): gerado, inventário, derivado lido pela UI do MASTER e capturado de passo anterior. Também precisa aceitar variantes de fluxo, como a repetição do ADM01 sem convite e o upload simples ou TUS.

Esses pontos dependem de decisão do titular e de leitura autorizada das pré-condições do backend. Antes disso, a cerca do 2b-2a não pode ser fechada sem risco de novo retrabalho.
