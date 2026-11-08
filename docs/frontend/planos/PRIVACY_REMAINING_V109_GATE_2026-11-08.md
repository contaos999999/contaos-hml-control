# Trilha A: GATE de aceitação dos dois campos técnicos V109

Base main5f3bc0837a49c716a3041846c7a4cc3d1a939496; backend normativo f25 permanece sujeito à revalidação integral pelo coordenador antes de BUILD. Deriva do PLAN385 e GATE DISCOVERY386 integrado8b593c58579810226c61dcaf68ea18881454b934. Este PR contém somente este GATE e recibo novo privacy-remaining-v109-20261108.json. Nenhum dos seis GETs originais, recibo original ou sétimo contrato V115 é modificado.

## Prova mínima concluída e limites

A investigação autorizada ocorreu uma única vez pelo wrapper revisado no comentário6728810286, revisão5820231975. SQL1 confirmou count1, organização/contrato/comprimento79/timestamp exatos; SQL2 retornou shape esperado,79codepoints e passou os seis padrões conservadores. Executor e revisor independente avaliaram o conteúdo real e decidiram CAMPO_TECNICO_SEM_PII; recibo público enum-only6728837051. Não foi feita nova leitura da descrição para este GATE.

Conteúdo técnico aprovado: “Lista sintética HML para testar navegação, análise e drawer, sem efeitos reais.” A categoria é CAMPO_TECNICO_SEM_PII; a palavra sintética pertence ao texto observado, não substitui prova de origem de dados ou autoriza outros registros. Criação legítima da lista consta do dossiê TRILHA_A_CONTINUACAO_AUTENTICADA_2026-11-08.md. Nome exato AUDITORIA TRILHA A REQUISITOS 20261108, ID1613484c-87ee-4276-a464-d1a378134fc9. Somente dois intervalos novos: descrição integral e timestamp Atualizada em08/11/202601:50 (bytes com espaços exclusivamente no JSON).

## Fonte real e GET da página inicial

Fonte fixada na base acima: RegrasContrato.tsx blob031bf0022387133a3e4d0e5d9298871344f58f97; regrasDados.ts bloba604c2ff28e20a082bdb81d0661d156af891a1fe; baseNormativaDados.ts blobbdc59706f2ceb66bd1fbb4048df7fdf2e39d36fb. SecaoListas inicia pagina0 e chama listarListas, PAGINA_REGRAS25. O SDK executa GET /rest/v1/listas_verificacao, select=id,nome,descricao,situacao,versao_atual,versao_registro,atualizado_em; id_contrato=eq.be89ef7e-d839-46c0-9cfb-4da81edf8b74; order=atualizado_em.desc,id.desc; offset=0; limit=25. Origem única https://gklhhhyosgasnyoxlrui.supabase.co. Query é multimap decodificado: chaves/valores exatos, sem extras/duplicatas; ordem entre chaves irrelevante; ordem de select/order literal. HTTP200 e array limitado obrigatórios.

Observar somente GET já realizado pela UI na geração atual. Nenhum fetch novo, ampliação de requestAllowed, headers, Auth ou resposta de erro. Browser projeta apenas id/nome/descricao/atualizado_em da linha cujo ID é exato, ocorrência única. Outros campos/linhas não cruzam para Node nem são usados para autorizar texto. Conteúdo restante da tela continua submetido ao classificador completo. id_contrato não é projetado: vínculo vem do filtro GET; id_organizacao também não é projetado. Usar gate contrato original já aprovado para confirmar contrato/id_organizacao; não inventar colunas na resposta. O recibo discovery confirma os vínculos da linha, mas não substitui contexto runtime.

Exigir no runtime o ID/nome/descrição/timestamp exatos, correspondência única e gate organizacional/contrato. Timestamps ISO equivalentes podem ser comparados pelo instante de microssegundos preservado, não por Date truncado a milissegundos para a guarda; o valor esperado tem fração455572. Só o formatter visual usa Date. A autorização de texto não se estende a outra lista nem a resposta paginada/filtrada diferente. Registro ausente/duplicado ou mudança de campo fecha a captura.

## Formatação comprovada e duas âncoras distintas

RegrasContrato importa formatarDataHoraBr de baseNormativaDados. A função usa Intl.DateTimeFormat pt-BR, America/Sao_Paulo, day/month/hour/minute2-digit, yearnumeric e replace(",", ""). Aplicada ao timestamp2026-11-08T04:50:40.455572+00:00 gerou08/11/202601:50 no runtime JavaScript da revisão; prefixo real do componente é Atualizada em, no feminino. Não usar Atualizado em, não acrescentar timezone impresso ou segundos. JSON contém valor exato “Atualizada em 08/11/2026 01:50”.

Âncora comum real: section[aria-labelledby="v109-listas"], h2 Listas de verificação, ul direta e li da lista fixa. Identificar li pelo botão existente aria-controls="v109-lista-1613484c-87ee-4276-a464-d1a378134fc9" e nome acessível exato Ver versões e itens de seguido do nome aprovado. Esse atributo existe mesmo com painel fechado; não abrir versões/itens. Confirmar parágrafo inicial nome exato dentro do div.min-w-0 e cruzar com DTO validado, sem depender de nth-child global.

1. Descrição: somente o parágrafo de descrição, irmão do nome no mesmo div da linha exata, contendo exclusivamente os79caracteres aprovados. Não remover li/parágrafo inteiro se houver texto adicional, prefixo/sufixo ou conteúdo vizinho.
2. Timestamp: somente o span text-muted-foreground dentro do parágrafo de metadados do mesmo div/li. Autorizar exclusivamente o intervalo completo “Atualizada em 08/11/2026 01:50”; preservar e classificar selos Situação/Versão atual e demais irmãos.

DOM/rendered e ARIA devem mapear os dois intervalos separadamente para esses nós reais. Se snapshot achatar parágrafo/metadata, o BUILD deve provar associação de intervalos ao DOM com fixture local completa da fonte; não usar substituição global, igualdade de texto no body ou remoção do bloco. Estrutura ambígua, duas âncoras compatíveis, ocorrência adicional fora do campo ou serialização sem vínculo inequívoco mantém BLOQUEADO_PII.

## Política e geração

Aplicar todos os padrões sensíveis originais sobre rendered e snapshot integrais ANTES de reconhecer intervalos técnicos. Nenhuma exceção encobre CPF/email/JWT/Bearer/sb_secret ou outro bloqueio vigente. Continuar classificando conteúdo integral restante, atributos visíveis, inputs, vizinhos, pseudo-elementos e mídia opaca, sem ocultar regiões/recortes ou salvar screenshot sanitizado. Não adicionar palavras ao dicionário global nem autorizar datas por regex. O nome já documentado é somente âncora/igualdade exata, não dicionário novo.

Congelar e revalidar identidade de sessão, organização, contrato, rota V109, target/document e geração na resposta técnica, na classificação e antes do PNG com fence.drain/assert. Troca, logout, close, navegação, documentreplacement, timeout ou fence failure invalida dados e intervalos. Voltar à mesma rota não herda prova. Sem GET legítimo observado na geração atual, bloquear, mesmo com cache ReactQuery.

## BUILD posterior, negativos e prova

Somente após CI/revisão/merge deste GATE e recibo, permitir BUILD nos dois arquivos scripts/hml/authenticated-visual-audit.mjs e scripts/hml/authenticated-visual-audit.test.mjs. Nenhum SRC, Auth, dados, tipos, backend, migrations, RLS, grants, RPC, Edge, workflow, dependência, assets ou PROD. Revalidar HEAD/backend/snapshot/ack/25blobs/catálogo100/97/LOCK-TYPES. Não misturar SYS04/V123/ARIA V112, que exigem provas próprias.

RED deve demonstrar rejeição dos dois intervalos pelo baseline classificador real/literalWords real. GREEN exige positivos DOM+ARIA com fonte/recibo, dois intervalos separados e negativos: queryextra/duplicada/select/order/página/filtro/forma errados; ausência/duplicação da linha; timestamp diferente inclusive microssegundos; ID/nome/descrição/contrato/org divergentes; campo correto em li/região errada; descrição/timestamp copiados fora do campo; nó duplicado; prefixo/sufixo/vizinho/atributo desconhecido ou sensível; Auth/headers/canários em outros campos não exportados; contexto/geração inválidos; serialização ambígua; render/snapshot com UNKNOWN remanescente; defesa de mídia opaca e limites preservada.

Exigir suíte harness, checks canônicos/Zero-Drift/LOCK, oito provas causais nativas e suplemento visual separados no HEAD final, revisão independente e CI verde. Só depois Teste C HML real e revisão visual independente dos originais, sem presumir oito PASS por liberar dois campos. Preservar18públicos,24baseline, artefatos/estados históricos Run78. Recibos novos devem registrar frontend/harness/deployment/run/DOM/PNG/SHA256 reais. A autorização proposta não certifica privacidade global,72BRAND,WCAG,CRUD ou V1. Falha ou conteúdo desconhecido conserva bloqueio integral do caso. Rollback: revert mínimo do catálogo/classificador, sem alterar dados nem apagar provas.
