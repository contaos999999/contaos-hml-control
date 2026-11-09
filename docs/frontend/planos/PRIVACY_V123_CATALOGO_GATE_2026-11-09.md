# Trilha A: GATE de catálogo fechado V123, dez eventos por campo

Base documental main5e4c93e4fe41ef9e09f631a3dd27558ac6bafdda, contexto normativo1a08988ebf58a38c0647d497725fd713aa7be90c sujeito à freshness viva. Deriva PLAN385 e GATE408 integradoa191ce3af74a15feb0fad8e2c681c6d05ee9aef0. V1 permanece NO-GO e V2 bloqueada. Esta PR contém somente este GATE e o novo recibo docs/frontend/auditorias/evidencias/privacy-v123-20261109/PROVENIENCIA_V123_READONLY.json. Nenhum BUILD ou captura é autorizado antes de CI, revisão independente e merge próprios.

## Proveniência e decisão semântica concluída

SQL1 ocorreu uma vez, sob GATE401; SQL2 ocorreu uma vez pelo coordenador, após GATE408 integrado e revisão independente da versão exata do wrapperV2 comentário6729889266, parecer6729918485. Não houve segunda query ou handoff. O executor apresentou somente os campos mínimos após validar a página inteira e os seis padrões congelados. Este catálogo reutiliza exclusivamente os dados já aprovados, sem nova leitura HML, Auth, SQL ou identidade.

Recibo público de concordância: https://github.com/contaos999999/contaos-hml-control/pull/408#issuecomment-6729946735. Dez eventos, sessenta associações evento/campo efetivamente revistas por executor e revisor independente: cinquenta CAMPO_TECNICO_SEM_PII e dez ATOR_OPERACIONAL_PSEUDONIMO_AUTORIZADO; zero BLOQUEADO_CONTEUDO, INCONCLUSIVO ou discordância. São trinta labels, vinte identificadores técnicos de entidade/correlação e dez associações de ator. O catálogo publica agora esses bytes por evento após ambas as decisões, sem transformar a categoria em dicionário geral.

Ator é pseudônimo operacional autorizado no contexto desta auditoria. Não é identidade humana comprovada, prova de origem sintética ou obrigação de igualdade com a sessão atual. Proibidos lookup Auth/perfil/pessoa, inferir nomes/emails ou procurar outros eventos. Correlation e id_entidade continuam identificadores específicos por evento, sem autorização UUIDgenérica. Nome do evento registra o label observado, não prova aprovação de versão, conteúdo de documento, resultado de negócio ou binding de fixture.

## Fontes e contrato do GET legítimo

Fontes atuais confirmadas: src/components/administracao/auditoria/TrilhaAuditoria.tsx blob7ef709c1a7bae0fb53f7255e78240d1b35a039f4; src/lib/administracao/auditoriaDados.ts blob446e34255c98fdeb99182889b8992028d9573be3. O componente inicia página0, seis filtros vazios e limite25. Usa sessão, organização selecionada e podeConsultarAuditoria existentes. Nenhum desses controles pode ser substituído pelo catálogo; não observar sucesso Auth, RPC de permissão ou headers.

Somente observar GET já executado pela UI, na rota exata /administracao/auditoria e organizaçãoe87f7e68-c5ae-4077-943b-02a4afd8b6ee:
- origem https://gklhhhyosgasnyoxlrui.supabase.co;
- path /rest/v1/eventos_auditoria;
- select literal id,criado_em,evento,entidade,origem,id_usuario,id_entidade,correlation_id;
- id_organizacao=eq.e87f7e68-c5ae-4077-943b-02a4afd8b6ee;
- order=criado_em.desc,id.desc; offset=0; limit=25.

Query é multimap decodificado com cinco chaves e valores exatos. Ordem entre chaves pode variar; select/order mantêm ordem literal. Duplicata, chave/filtro/página extra, ausência, fragmento, userinfo, outra origem, rota ou método rejeitam. Não introduzir fetch Node, SQL de runtime, POST, novo endpoint ou ampliação de requestAllowed.

Exigir HTTP200, resposta JSON array de exatamente dez objetos e únicas oito chaves do select em cada objeto. Validar todos os oito valores de todas as dez linhas contra o novo catálogo antes de autorizar qualquer campo: ID único exato, posição/ordem exatas, labels/UUIDs exatos e timestamp por instante de microssegundos BigInt. Data impossível, fração acima6, divergência1µs ou null drift rejeitam mesmo se o texto formatado coincidir. Não converter array/número/objeto em string. Formato de timezone equivalente só é aceito quando o instante integral coincide. Body limitado262144bytes e deadline10s, como controles existentes. Nenhum corpo/linha bruto cruza browser→Node; somente enum/count de validação e referência ao recibo.

O total10 foi comprovado por SQL2 no catálogo. O corpo deste GET projeta somente as oito chaves; não contém total ou id_organizacao. O SDK obtém count de headers, que o auditor NÃO lê. Registrar separadamente expectedSQLTotal10 e observedRows10, nunca inventar count HTTP observado. A guarda runtime exige a página retornada inteira com dez linhas e todos os valores aprovados sob limit25; não certifica total futuro invisível, RLS global ou outro momento. Organização vincula-se ao filtro e ao gate de sessão/header existente, sem fabricar coluna. V123 não exige GET de contrato que essa página não faz.

Origem e id_entidade, embora catalogados e validados no DTO, não aparecem nas cinco células. Não autorizam texto em filtros, tooltip, erro, botão, outra região ou outro caso. Campos antes/depois/metadados e qualquer chave adicional continuam proibidos. Não alterar adapter, produto ou projeção de UI para satisfazer o auditor.

## Formatação e bijeção DOM por evento

dataBr usa Intl.DateTimeFormat pt-BR, America/Sao_Paulo, dateStyle short e timeStyle medium, com Date somente para formatar. Preservar vírgula, espaço e segundos, sem replace, arredondamento de guarda ou regex geral de datas. Os dez formatted_created exatos constam no recibo. Dois eventos legitimamente têm a mesma data formatada; o ator e algumas entidades também se repetem. Não exigir unicidade global desses valores nem permitir todas as suas ocorrências.

Âncora única: div[role=region][aria-label="Eventos de auditoria"], tabela única com caption exato Eventos de auditoria da organização e cinco cabeçalhos scope=col, nesta ordem: Data e hora, Evento, Entidade, Usuário, Correlação. Confirmar semântica por nome de coluna, não por posição global da página. Exigir tbody direto com dez tr diretos e cinco td diretos em cada um, visíveis segundo o controle existente, plain text exato e sem atributos além de class ou filhos adicionais nos campos. Atributo/filho que impeça associação inequívoca fecha o catálogo; não é removido para passar.

O ID do evento não está no DOM. Para cada linha, construir a tupla completa das cinco células usando os cabeçalhos e cruzar com a projeção API/catalogada. Exigir correspondência com exatamente um evento, dez associações distintas e nenhuma sobra dos dois lados. Só depois exigir que a sequência dos eventos associados seja a mesma ordem da API. A tupla visível completa é única no catálogo, mesmo com ator, entidade ou data repetidos. Não usar nth-row como identidade nem texto isolado/UUID como licença.

Confirmar a seção de filtros da fonte e seis inputs com seus labels, quatro text e dois date, todos vazios. Confirmar nav única Paginação da auditoria, Página1 e Anterior/Próxima disabled, conforme página inicial de dez eventos. Mudança de filtro, página, DOM parcial, linha extra/omitida, duplicata ou ordem divergente impede contexto; não disparar requisição para reconstruí-lo.

## Intervalos originais de rendered e ARIA

A autorização é por célula e representação, não por palavra. No rendered, mapear os cinco intervalos de cada linha DOM para o row.innerText exato e deste para o texto original integral. A tabela da fonte gera cinco células separadas por TAB; exigir esse vínculo comprovado, ocorrência única do row completo e intervalos locais com fronteiras exatas. Não apagar linha, célula inteira com vizinhos, tabela ou região.

A prova local Chromium/sandboxtrue da tabela source-shaped confirmou dez linhas/cinquenta células, dez row.innerText com quatro TAB e equivalência dos dez formatadores Node24.22.1/Chromium. No ARIA real, cada linha tem nome acessível agregado com as cinco células, seguido de cinco cell names. Há duas representações por valor/célula: uma no row name e outra no cell name. Essa prova é local e estrutural, sem HML, não é teste da página completa nem runtime PASS.

O BUILD deve produzir fixture completa da fonte, incluindo região/filtros/paginação, e demonstrar os seguintes vínculos no snapshot integral:
1. Obter subtree ARIA da mesma linha DOM já identificada pela bijeção. Localizá-lo exatamente uma vez no body snapshot, permitindo somente prefixo constante de indentação, sem normalizar token, papel, nome ou texto.
2. Validar o row accessible name exato derivado das cinco células e os cinco cell names exatos. Mapear separadamente os cinco intervalos no nome agregado e os cinco nas células. Não excluir o nome agregado ou subtree inteiro.
3. Remover para classificação somente os intervalos catalogados desses dez pontos por linha. Roles, aspas, separadores, vizinhos e restante do texto permanecem. Outro achatamento/serialização ou associação ambígua bloqueia até emenda, sem fallback genérico de ARIA.
4. Conferir multiplicidades no texto integral contra intervalos próprios, inclusive fora da tabela e em atributos visíveis. Valor repetido esperado só vale nos campos/representações vinculados. Quando um valor curto aparece dentro de outro valor longo já autorizado no seu próprio campo, a ocorrência coberta por esse intervalo não é uma cópia externa. Qualquer ocorrência adicional não coberta fecha o contexto. Não usar substituição global nem contagem ingênua de substrings que confunda labels sobrepostos.

Padrões sensíveis originais devem examinar rendered e snapshot ORIGINAIS completos antes de qualquer intervalo. Nenhum catálogo encobre email/CPF/JWT/Bearer/sb_secret ou outro padrão vigente. Classificar integralmente o restante após a remoção mínima. Desconhecido restante, mídia opaca, limite, alteração de fonte, atributo sensível, input preenchido ou vizinho desconhecido mantém BLOQUEADO_PII. Não ocultar DOM, filtrar linha, recortar imagem, truncar texto ou sanitizar PNG/DOM. Toda evidência permitida continua original.

## Geração, expiração e novo preparador

Recibo de runtime e contexto de campos são internos, selados/congelados e vinculados à origem, organização, rota, sessão, target/document e geração atuais. Observar desde antes da navegação; cache ReactQuery ou relatório anterior não substitui GET atual. Antes de classificar e antes de PNG revalidar o mesmo binding, instante/TTL120s, ausência de requisição pendente e fence.drain/assert.

Navegação, document replacement, sessão, organização, target, rota, logout, close, falha, timeout ou request/row mismatch invalidam e descartam toda autorização da geração. Voltar à mesma rota não herda prova. Qualquer operação conhecida que produza eventos, inclusive preparadorR2, expira este catálogo para a fila seguinte. Novos eventos recentes mudam a página/ordem/IDs; não substituir silenciosamente os dez registrados ou aceitar subconjunto. Este GATE não autoriza reconsultar SQL1/SQL2 para atualizar conteúdo. Página alterada exige novo rito documental de metadata e semântica quando aplicável; sem replay, nova leitura ou Auth por inferência.

## BUILD posterior, negativos e revisão

Depois deste GATE/recibo passarem CI, revisão e merge, allowlist exclusiva: scripts/hml/authenticated-visual-audit.mjs e scripts/hml/authenticated-visual-audit.test.mjs. Carregar o novo recibo por hash separado, congelar seu catálogo e construir contexto somente no executor. Não alterar os recibos originais seisGET/V115, wire402, V109389, demais catálogos ou literalWords. Proibidos SRC, workflow, preparador, request/nonces, dependências/lock, tipos, backend/schema/RLS/grants/RPC/Edge/Storage/Auth/PROD.

RED/GREEN com classifier real, fonte e recibo:
- Sem contexto, bytes dinâmicos continuam rejeitados como antes. Contexto forjado/mutável/vencido/rota errada ou resposta não observada não autoriza campo.
- GET/projeção/origem/método/query errados; extra/duplicate keys; objeto em vez de array; 0/9/11/25/26linhas; duplicata/omissão/reordenação; UUID não string/campo novo/null; mudança de qualquer label/ator/entidade/correlação; drift1µs mesmo quando UI coincide.
- DOM com label/região/caption/coluna errados; tabela/linha/célula extra; linha trocada ou duplicada; cópia fora do campo; parcial/prefixo/sufixo; valor sobreposto em outro label; ator repetido somente nas dez células legítimas; id_entidade/origem exibidos inesperadamente.
- ARIA integral com row name e cell names reais, duas representações por campo, datas/entidades repetidas, árvore ambígua e papel/nome/atributo/vizinho extra. Unknown remanescente e sensitive original dentro/fora dos campos continuam bloqueados.
- Troca e retorno de sessão/org/rota/target/document, close/deadline/falha, cache sem GET, mutaçãoR2 e novo evento invalidam. Canários não aprovados nunca aparecem em corpo exportado, diagnóstico, hash ou artefato. Manter todos os negativos existentes de segurança/request/nonce/privacidade.
- Fixtures locais completas nos quatro tamanhos/dois temas e Chromium real com sandboxtrue devem provar full rendered/full ARIA e bijeção, sem alegar HML real. Guard native8 e suplemento visual separados; suíte harness, lint/formato/diffcheck, Zero-Drift/LOCK/Auth/Fixtures no mesmo HEAD final, revisão independente sem Critical/Important.

Só depois de BUILD integrado e gates de execução considerar Teste C legítimo governado. Nenhum SQL, login ou captura é autorizado por esta PR documental. Preservar18públicos, baselines, Run78 e run42540293545 sem promoção retroativa. Uma categoria positiva não transforma V123, dez eventos ou oito combinações em PASS;72critérios/WCAG/V1 continuam pendentes. Rollback: revert mínimo do catálogo de aceitação, preservando dados, recibos e bloqueios.
