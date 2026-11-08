# GATE separado: refluxo e ampliação textual pública

PLAN322 integrado em238335973e0a596e42f0a4b248f742c2504676f2, HEAD6500f7e7d36678606a5c5bbde9e47be2e36f2530. ZeroDrift128594202801 eTesteC128594203008 SUCCESS no run42435786033; protect-types128594202536SUCCESS no run42435786037. Revisão documental independente semCritical/Important; Minor de precisão de alvos tratado abaixo. Este GATE não reutiliza esses checks como seus.

Fonte: P0_TRILHA_A_REFLOW_TEXTO_PUBLICO_PLAN_2026-11-08.md, plano mestre, PRD/000/NFR aplicáveis e fontesW3C ali indicadas. Permanecem os100regulares/97atômicos,V1não certificada,V2bloqueada. Autorização rotineira já concedida; nenhum produto ou backend autorizado por este GATE.

## Escopo e ordem

Após revisão e trêschecksSUCCESS no mesmoHEAD e merge deste GATE, permitir somente scripts/testc/visual-audit.mjs e scripts/testc/visual-audit.test.mjs para a prova do PLAN. Documentação: PLAN/GATE/PLANO_ATIVO/plano mestre/checkpoint/relatórioAppShell. Não alterar src/public/types/rotas/estilos de produto/backend/Supabase/Auth/dados/secrets/workflows/dependências/PROD. PLAN322→esteGATE→RED→BUILD→GREEN→revisão/TesteC→capturas/checkpoint. Se surgir defeito de produto, somente registrar; novoescopo/gate antes de corrigir.

## Casos e alvos fechados

18casos: SYS01/SYS02/SYS03 × light/dark × REFLOW_320(320×900,escala1), TEXT_200(390×900,escala2), TEXT_200(1440×900,escala2). Não alterar29superfícies/232casosbase nem WIDTHS1440/1280/768/390. Não criar sessão, preencher campos, acionar link/botão, submeter ou enviar recuperação.

Alvos obrigatórios, um de cada seletor/rótulo no estado correspondente:

| Página | Alvos |
| --- | --- |
| SYS01/login | h1 Bem-vindo de volta; labels E-mail/Senha; inputs #login-email/#login-senha vazios; link Esqueci minha senha; botão Mostrar senha; submit Entrar |
| SYS02/esqueci-senha | h1 Recuperar acesso; label E-mail einput #esqueci-email vazio; submit Enviar link; link Voltar ao login |
| SYS03/redefinir-senha | h1 Definir nova senha; link Voltar ao login; estado público observado estável: Validando link de redefinição… OU mensagem de link inválido com Solicitar novo link. Semtoken/sessão e semsenha/formulárioliberado/sucesso presumidos |

Os textos são constantes do código do produto, usados somente na asserção local. O relatório contém apenas IDs fechados dos alvos e booleans, não textoDOM. Mudança natural de fase durante a medição invalida correspondência e exige classificação de prova não concluída, sem congelar timers ou fabricar estado.

Amostra: todos os nós de texto renderizado relevantes de h1/h2/p/label/a/button/span/li e os controlesinput, incluindo texto visualaria-hidden do statusSYS03; excluir scripts/styles, SVG decorativo, sr-only/elementos semcaixa e controleshidden. Deduplicar elemento pai; não reduzir a amostra aos alvos fáceis. Marcar elementos emDOM somente com índice interno numérico antes do resize e exigir os MESMOS nós conectados/visíveis após, sem substituição ou reaproveitamento de índice. Identidades ficam apenas no contexto novo; publicar contagens e medidas numéricas, nunca seletores arbitrários ou conteúdo. Font-size antes/depois finitos positivos e fator2±0,02 em TEXT_200. Amostra vazia/instável, escala insuficiente ou erro de medição nunca recebePASS; distinguir falha do método de defeito WCAG real. REFLOW_320 não exige fator2.

## Medições e limites

HTTP2xx, origem/pathname exatos, langpt-BR, h1único, alvos presentes/visíveis, inputsvazios,0pageerrors/0mutações e document.scrollWidth<=innerWidth+1. Medir clipping de texto/controles por dimensões internas e limites de ancestrais com overflow restritivo; ignorar apenas conteúdo não renderizado/ícone semtexto. scrollWidth/clientWidth isolados não provam ausência de sobreposição; revisão das18imagens continua obrigatória. Falha/ausência de medida ficaexplícita, sem transformar emPASS. EscalaCSS não é zoom nativo e não certificaSC1.4.4integral. Viewport320comprova somente o ensaio de layoutSC1.4.10, não todasasinterações.

Usar contextoisolado por caso e mesma política read-only do executor: semstorageAuth/HAR/trace/JWT e semnova interceptação; o bloqueio preexistente de mutações Supabase permanece. A única escrita de preferência é theme e a única alteração de apresentação é font-size raiz temporário. Fecharcontexto emfinally; não contaminar24capturasbase. Não ampliar timeouts existentes. Publicar erro fechado, sem stack/HTML/URLoucampos.

## Relatório e decisão

Coleção separada pública com schema próprio,18linhas, nomesfechados deID/mode/theme/width, enums/booleans/medidasfinitas e hashes. Screenshotnomes seguem convenção fixa derivada do caso; validar paths relativos eSHA64hex. Adicionar relatório/capturas aSHA256SUMS. Preservar o relatório base e seus208privadosNÃO_VERIFICADOS. Nova falha torna o verdictgeralFAIL, sem apagar os24resultadosbase. Não alegar ausência universal de sobreposição ouWCAGfull por detectorgeométrico.

RED deve cobrir18casosúnicos, matriz232inalterada, formacompleta de cada modo, erros/overflow/clipping/mutação, amostra alterada/vazia, fator insuficiente, númerosNaN/Infinity e canário/path traversal. GREEN exige helpers/protocolo, gates/regressões aplicáveis eCI noHEADfinal. Rodar oChromium congelado no executor já existente; baixarartefato, conferirSHA256SUMS e revisar individualmente18capturas antes de qualificarPASS escopado. Evidência deHEADsintético deve serdistinta doHEADPR/merge.

Rollback por novoPR limitado aosdoisscripts, semrewrite/testesapagados. Nenhuma alteração de produto nesta emenda. Prova privada28rotas/29superfícies/72BRAND, menu/header/sessão reais,CRUD/auditoria/retrospectiva continuam pendentes antesV1; backend139 segueproprietáriodaTrilhaB.

ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE: produto/BRAND/tokenspreservados; reutilização doexecutor,semdeps/workflow/turnoLovable. Menorcusto não dispensaTDD/revisão/CI/artefatos/provavisual. Estearquivo é GATE documental, nãoBUILD nem resultado doensaio.
