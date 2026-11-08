# Trilha A: GATE parcial de rótulos técnicos SYS04

Base574619615e4901ba187616bce65010590f277333; PLAN385 e GATEs vigentes preservados. Recibo novo docs/frontend/auditorias/evidencias/privacy-remaining-sys04-20261108.json. Este GATE autoriza apenas preparação futura do catálogo parcial de72registros comprovados, após CI/revisão/merge; não afirma que a página inteira esteja liberada. Nenhum login, captura, escrita ou Auth foi executado nesta investigação.

## Prova somente leitura e lacuna explícita

Três registros legacy foram conferidos por SELECT retornando exclusivamente IDs conhecidos/count/booleans: cada count1, nomes/fantasias/situação exatos e CNPJNULL. São ROTULO_TECNICO_OBSERVADO, sem alegação synthetic ou construtor perdido. V107 fantasia é NULL, confirmado. Bytes completos estão no JSON.

Construtor real em develop@f25f654f0cba5bae45e817c0fd4b6c3fb22bf994: p0_crud_global_hml.py blob49904021da4ed6239e12816466ab7088d0573856, nonce uuid.hex32 e prefixo0000 CRUDG seguido de nonce e espaço, cria organizações A/B; p0_crud_global_browser.mjs blob9c016a09cbec4eb7d5032b90f4c393b1ee9071f4 cria organização created, altera fantasia para edited e percorre inativa/ativa/suspensa. Nomes técnicos são demonstrados pela fonte. Isso não prova sozinho execução histórica individual ou metadado Auth: registro usa categoria ROTULO_TECNICO_OBSERVADO_CONSTRUTOR_COMPATIVEL, sem false claim synthetic. Não foi lido app_metadata nem Auth.

SQL de descoberta selecionou campos id/razao_social/nome_fantasia/situacao/cnpj somente sob fullmatch fechado ^0000 CRUDG [0-9a-f]{32} (A|B|created)$, fantasiaNULL ou prefixoexatoedited, CNPJNULL e situaçãoenumativa/inativa/suspensa. Triagem JS confirmou69linhas antes de persistir o catálogo técnico. Regex foi exclusivamente descoberta conservadora baseada na fonte, NÃO é regra runtime nem autoriza novos nomes/IDs. Há109organizações DB no count atual;69factory,3legacy e uma organização de contexto conhecida porID. Restam36nonfactoryunknown contados sem raw. Esses counts DB não são resposta RPC nem prova de visibilidade ao MASTER.

Organização de contextoe87f7e68-c5ae-4077-943b-02a4afd8b6ee: booleans confirmam fantasiaContaOS HML Teste, CNPJNULL e ativa; razão social difere desse texto e NÃO foi lida/catalogada. A representação exibe também razão social quando distinta, portanto o catálogo atual não resolve essa linha. Antes de qualquer captura completa, exigir proveniência/bytes técnicos dessa razão e de todas demais linhas realmente retornadas/renderizadas, por emenda documental própria. Sem isso SYS04 permanece BLOQUEADO_PII de modo explicado. Não ocultar/filtrar/remover organizações para fabricar aceite.

## Contrato ordinaryRPC existente

Fontes frontend: OrganizationSelector.tsx bloba7e53af23b6a1f1f61ba70f7144365bf1ab31e3f e resolverDestinoPosLogin.ts blob8817c62ea6c361d40cc424bd3fc37309b4e2628c. listarOrganizacoesDisponiveis chama supabase.rpc("listar_organizacoes_disponiveis") sem parâmetros; SDK utiliza POST ordinary à origemHMLfixa /rest/v1/rpc/listar_organizacoes_disponiveis, body JSONexato{} sem query. Não é Auth nem autorização de POST novo: apenas observar chamada readonly já permitida e feita pela UI. Não ampliar requestAllowed/RPCS ou inserir chamada para produzir prova.

Exigir HTTP200, corpoarray limitado, cada objeto com as seis chaves exatas do JSON, UUID conhecido não nulo e único, perfiladministrador_master, campos byteexatos do registro congelado e CNPJNULL. Body deve ser objetoJSONvazio real, não null/array/whitespace value/args extras/duplicatas; query vazia, sem fragment/userinfo, método/path/origin exatos. Não ler headers/cookies/tokens/respostaAuth. Browser projeta somente os seis campos catalogados e rejeita linha desconhecida SEM exportá-la: retorna enum/count apenas. Nenhuma lista inteira desconhecida vai para Node/arquivo/hash/diagnóstico. O conjunto RPC pode ser subconjunto do catálogo, mas nenhum item externo/nulo/duplicado é aceito. Não presumir total109 nem exigir query não realizada.

Para implementação final, demonstrar em teste o body real emitido pelo SDK sem mudar produto. Se transporte observado divergir deste contrato, bloquear e emendar antes de capturar. Entradas desconhecidas não são autorizadas por regex/nome parecido/mesmo nonce.

## Âncoras reais e campos selados

radiogroup[aria-labelledby="sys04-titulo-lista"] contém OrganizationCard role=radio. O card não possuiIDDOMdeorganização: não inventá-lo. Associação ao registro depende da tupla completa única e da estrutura fonte, cruzada com RPCvalidada; posição isolada não basta. Se duas tuplas renderizadas forem indistinguíveis, bloquear por ambiguidade.

No div.min-w-0 do card, primeiro p é nome_fantasia||razao_social; segundo p só existe quando fantasia não nula e diferente da razão. Exigir exatamente a presença/ausência e os bytes correspondentes. Dentro do dl, paresdt/ddCNPJ:,Perfil:,Situação: delimitam valores: —somentequandoCNPJNULL, Administrador Master para perfiladministrador_master e situaçãoexata daquelaentrada. Selecionada é literal de estado conhecido e permanece classificado; checked/tabIndex/ações não autorizam conteúdo adicional. Não clicar nem trocar organização para satisfazer catálogo.

Selar intervalos separados por campo e card, preservando rótulos, vizinhos e atributos. ARIA/rendered devem ser vinculados aos mesmos nósDOM por fixturelocal completa real; snapshotradio pode agregar descendants, portanto não remover nome acessível inteiro nem substituir todas ocorrências globais. Nome/fantasia também podem aparecer como partes do nome acessível agregado: mapear cada ocorrência derivada ao nó legítimo e comprovar contagem/intervalos; cópia extra fora do card/estrutura permanece desconhecida. Qualquer divergência, duplicação, campo ausente, novo CNPJ, sufixo/prefixo ou vizinho desconhecido bloqueia a captura integral. Não mascarar CNPJnemocultarregiões.

## Privacidade, validade e BUILD posterior

Padrões sensíveis originais primeiro sobre texto integral, antes de reconhecer qualquer intervalo. Não permitir email/CPF/CNPJ/JWT/Bearer/sb_secret por catálogo; CNPJ apenasNULL. Sem palavrasglobais, datasregex ou UUIDgenérico. RemanescenteUNKNOWN emrendered/snapshot bloqueia tudo; mídiaopaca/limites permanecem. Proveniência runtime vale apenas na geração atual de sessão/documento/target/rotaSYS04, descartada emlogout/close/navegação/troca/falha/timeout; revalidarcontexto e fence.drain/assert antesclassificação/PNG. SemRPClegítima atual, bloquear; não herdar cache.

BUILD futuro limitado aos dois mjs scripts/hml/authenticated-visual-audit.mjs e .test.mjs, após GATE/reciboCI/review/merge e fechamento das pendências do conjunto real. NenhumSRC,tipo,workflow,dependência,backend,RLS,RPC,Auth,grants,dados,PROD ouassets. Revalidar main/backend/snapshot/ack/25blobs/catálogo100/97/LOCK.

RED classificadorreal/fonte e positivos porfieldcatalogue; negativos obrigatórios para72registrosalterados/campoerrado/trocatupla/CNPJpresente/atorperfilerrado/cardduplicado/unknownrow/labelduplicada/bodyqueryextra/shapeerro/timestampinjetado/geraçãoanterior e canários fora da projeção. Classificador deve continuar rejeitando 36unknown e razãoHMLnãoresolvida; isso é estado bloqueado esperado, não falha contornada. Oito testes causais nativos e suplemento visual preservados, CI/revisão no HEADfinal e TesteCposterior com revisão independente dosoriginais.

Este PR só adiciona dois documentos. Nenhum PASSdeSYS04/8casos/72BRAND/WCAG/V1; preservar18públicos,24baseline e Run78. Próxima prova: fechar razão socialHML e conhecer apenas conjuntoRPCefetivamente visível por protocolo técnico autorizado, sem exportar labelsunknown. Rollback futuro revertmínimo do catálogo, sem apagar provas/dados.
