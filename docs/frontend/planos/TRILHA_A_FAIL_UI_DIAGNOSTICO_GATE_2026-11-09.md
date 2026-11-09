# Trilha A P0: emenda GATE para diagnóstico fechado dos16FAIL_UI

## Base, causa e limites da evidência
Base documental observada: frontend main c2cfbe3f2e3a4c18886f18f42246998e357c9737; fonte/harness efetivamente auditados866608620909bf313a6c2192736330222f9219ad, deployment dpl_EcPdYyFYTAVTGEYpr1go2QrTfakY. PLAN385 integrado4807ec9d6e6739de22231f0390f8a232b386b087, GATE184 e cadeia autenticada/visual374 permanecem vinculantes. Este documento não implementa código, cria solicitação, repete Auth ou altera a main durante execução ativa.

Auditoria real42540293545:208records,99PASS_AUTOMATIZADO,51BLOQUEADO_PII,16FAIL_UI,18baselinepreservados,24fixturesseparados.298hashes conferidos pelo coordenador; report.json SHA256 eb0e8853c905fdf708ecfe5f537ccdfe91c72c588e67cec27fa3f55cd3687c6a. Sem aborto, logoutVerified=true. Seleção visual74:70PASSautomáticos e4FAIL_UI; não significa74casos visualmente certificados.

| Grupo | Casos exatos | Evidência retida |
| --- | --- | --- |
| V102 |1440/1280/768/390 × light/dark =8|privacy rendered/snapshotALLOWED, visualFailureVISUAL_MEASUREMENT; nenhuma métrica da falha|
| V108 |768dark,390light,390dark =3|FAIL_UI semprivacy,semcódigo/etapa da exceção|
| V109 |1440/1280 × light/dark,768light =5|FAIL_UI semprivacy,semcódigo/etapa da exceção|

Os16casos não têm PNG nem DOM no artefato. Isso foi conferido na listagem original, sem inventar captura de falha. A ordem segura atual impede PNG antes de medir e classificar; será preservada. Não se pode concluir, desse material, que o produto tem exatamente16defeitos de layout, que um tooltip cobriu um input, que o observador falhou por DTO ou que374 resolveu todos os critérios. Tais hipóteses permanecem NÃO VERIFICADAS.

Causa técnica comprovada da perda de diagnóstico no harness8666: captureVisualEvidence linhas4191–4199 obtém metrics, mas lança VISUAL_MEASUREMENT na4196 sem reter resumo; saveScreenshot linhas3714–3746 não recebe resultado; catch3998–4013 converte exceções emFAIL_UI e só retém seis códigos visuais. Exceção desconhecida anterior ao primeiroprivacy deixa somente statusFAIL_UI. Esta é falha de observabilidade do executor, não prova da causa original da UI.

Três PNG originais efetivamente inspecionados como contexto, sem converter/compor/recapturar: V108_768_light.png SHA154ae8654b1f8540b5b4120c08d098f69b633b72d48b44d3ce99a88167d0cf93; V105_390_dark.png SHAcc6aa25c43f4c4b13097e2b7b4374d368651832086baaaf5f987025f8ecab38f; V101_390_light_menu.png SHAdce12315d45c9317d2ac83e7e1303ba07092b840e39d177278789be1abf7d237. Eles não substituem imagens dos16FAIL. DOM/relatório desses vizinhos foram consultados; axe0violations pode coexistir com incomplete1 e teclado é amostra, não WCAG integral.

## Escopo futuro fechado
Somente:
- scripts/hml/authenticated-visual-audit.mjs
- scripts/hml/authenticated-visual-audit.test.mjs

Menor emenda suficiente: registrar etapa fechada e resumo sanitizado de métricas/erro no record de falha, antes da limpeza, mantendo captura bloqueada. Não alterar SRC/public/assets/styles, workflow, resolvedor/deployment, preparador, parserJSON/request/nonces, rede, Auth, DTO/projeção/privacidade, tipos, dependências/lock, backend/SQL/RPC/RLS/Edge/Storage, ambientes, secrets ou PROD. Não corrigir layout, calendário, tooltip ou timing por suposição. Não diminuir rigor de hit-test, geometria, contraste, privacidade ou identidade.

## Contrato de diagnóstico
Adicionar opcionalmente ao record de caso um objeto diagnóstico de schema fechado, por helper puro que constrói saída a partir de valores internos tipados, sem spread de error/metrics remoto. Chaves desconhecidas de entrada nunca atravessam. Saída inválida falha fechada em enum estável, sem raw ou mensagem. Recibo deve distinguir etapa atingida de etapa não observada.

Etapas permitidas, mapeadas explicitamente à sequência real: CASE_NAVIGATION, WAIT_SURFACE, PRIVACY_PRIMARY, READ_UI_METRICS, AXE, CAPTURE_PRIMARY, CAPTURE_SUPPLEMENT, KEYBOARD, NAVIGATION_PROBE, SAVE_DOM, FINAL_CASE_CHECK. Registrar enum imediatamente antes da operação; falha conserva último estágio alcançado e o modo PRIMARY/SIDEBAR_COLLAPSED/MOBILE_MENU quando aplicável. Não incluir rota, URL, seletor, ID de negócio, título, accessibleName ou texto de campo.

Classe de erro exclusivamente enum: KNOWN_VISUAL, TIMEOUT, TARGET_CLOSED, EVALUATION, OTHER. Derivação por identidade/códigos internos explicitamente allowlisted, com fallbackOTHER; não publicar error.name/code arbitrário, mensagem, stack, causa, headers, response, objeto lançado ou seu JSON. Se impossível distinguir uma classe de forma segura, usarOTHER, nunca inferir falha produto/backend. Códigos visuais já fechados permanecem os mesmos. Pode conservar outro código interno somente se enumerado literalmente no novo helper e coberto por negativo que rejeite canário fora da lista; não transformar qualquer stringASCII em diagnóstico seguro.

Para VISUAL_MEASUREMENT, conservar apenas resumo fechado gerado antes do throw: flags booleanas identityPassed/geometryPassed/tablePassed/datesPassed/contrastPassed; viewport numérico validado, overflowX finito limitado, contagens limitadas de targets examinados/invalidRect/disconnected/invisible/notHit/boundsX/boundsY; clipping da tabela e quantidade de controles de ajuda abaixo44; contagem de datas ausentes/colorScheme divergente; contagem de rótulos de contraste medidos e mínimo finito com threshold4.5 quando aplicável. Ausente não vira zero/PASS; usar observed=false ou null onde definido. Limites devem ser constantes, tipos estritos e valores não finitos/fora do limite rejeitados ou convertidos em estadoINVALID, nunca stringificados.

Se agregados não bastarem para localizar o próximo ensaio, admite-se até8alvos falhos com SOMENTE ordinalDOM numérico0..255, kindINPUT/SELECT/TEXTAREA/BUTTON/LINK, retângulo numérico finito arredondado e limitado, flags booleanas connected/visible/disabled/hit e máscara numérica dos cinco pontos. Sem texto, tag livre, selector, CSS, ID, atributo, HTML/ARIA, valor, placeholder, title, href, screenshot ou imagem. Esse diagnóstico é geometria, não atesta que conteúdo seja publicável. Preservar regra disabled dispensa apenas hit-test; continua exigindo geometria/conexão/visibilidade/limites.

Exceção antes da medição registra stage/errorKind e observed=false, sem fabricar métricas. Erro de privacidade continua BLOQUEADO_PII quando assim classificado; unknown permanece bloqueado. Nenhuma coleta nova do DOM/response ou tentativa de serializar erro pode ocorrer no catch. Se a fence falhar ou deployment mudar, preservar aborto global anterior e segurança; relatório sanitizado não converte aborto em casoPASS.

## RED → GREEN significativo
Antes de BUILD, testes focais devem demonstrar com funções reais existentes:
1. captureVisualEvidence com brand/drain/stabilize legítimos e medida falha conhecida lança, não salvaPNG e hoje perde a causa numérica. RED exige resumo fechado no record/catch real, sem duplicar somente a implementação do helper. Provar quais flags/contagens falharam, mantendo statusFAIL_UI.
2. Exceção sentinela antes do primeiroprivacy hoje termina sem estágio no record. RED observa o consumidor real; GREEN preserva etapa/enumOTHER e observed=false. Canário sensível em message/stack/code/name/cause/extra nunca aparece no JSON do report.
3. Integridade negativa: chaves extras, strings em números/booleanos, NaN/Infinity, overflow de limite, array longo, ordinal fora do domínio, tipo de alvo desconhecido e dados inesperados não escapam; não marcarPASS/zero por default.
4. Geometria causal: enabledcovered falha e aponta notHit; disabledcovered dispensa apenas hit; reenabled volta a falhar; clipping/bounds/invalidRect continuam falhando. Falha de identity/table/dates/contrast distinguível sem rótulos reais. Nenhuma exceção no guard é removida.
5. Fluxo: falha impede savePNG/DOM adicional, cleanup/logout e evidência anterior preservados. Troca de deployment/fence mantém aborto. Negativos de RQ01/RQ02/request/nonce/cache/PII anteriores continuam ativos sem ampliar escopo.

RED é exigência futura deste GATE, ainda NÃO EXECUTADO por este documento. Snapshot/relatório já comprovam a perda de diagnóstico; não declarar um teste causal executado sem log real. Não usar jsdom como prova de layout. Para regras de geometria, manter testes nativos do mesmoChromium1208/sandboxtrue e suplemento visual separados; se preciso reproduzir cobertura, usar fixture local isolada sem HML e sem chamá-la de execução real da páginaV102.

GREEN: suíte aplicável do harness, lint/formato focal, sourceordering/drain, oito provas causais nativas e suplemento visual no HEAD final; Zero-Drift/LOCK e checks autenticado/fixtures SUCCESS, revisão independente sem Critical/Important. Seguir PLAN→GATE integrado/CI→RED→BUILD→GREEN→revisão antes de nova tentativa HML. Nenhum novo workflow ou dependência.

## Prova real posterior e continuidade
Somente após BUILD integrado e gates de execução: próxima tentativa HML governada útil deve repetir os16casos falhos e conservar diagnóstico fechado, fonte/harness/deployment reais e hashes. Não acrescentar seleção CLI/workflow neste escopo; se o harness atual só permite seleção mais ampla, registrar contabilidade dos casos preservados/novos e não alterar roteamento de disparo para este diagnóstico. Guardar falhas sem PNG enquanto a segurança não permite captura; imagens/DOM permitidos continuam originais com SHA256 e revisão independente. Nenhum screenshot sanitizado, recorte que esconda desconhecidos ou recaptura manual.

Preservar18públicos,18baseline atuais e24baselinehistóricos,Run78 e auditoria42540293545 sem sobrescrever. As24fixtures continuam fase separada.99PASSautomáticos não certificam99imagens nem resolvem184originais.72critérios/WCAG/V1 permanecem NO-GO atéDoD real. Rollback por PR restrito aos dois mjs, preservando recibos e bloqueios; retirar diagnóstico nunca deve reduzir validação ou liberar imagem.

Fonte canônica viva observada durante redação: backend8dc073d7ad4344231f99169a2180465a3354fe4c. Reancoragem documental é processo separado; conferir snapshot/ack/25blobs/catálogo100/97/types antes de CI/BUILD. FAIL de freshness ou indisponibilidade permanece bloqueante, sem bypass. Manter main congelada enquanto execução privada estiver ativa.

## ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE (OBRIGATÓRIO)

ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE (OBRIGATÓRIO)
Marca: ContaOS Brand v1.0 / BRAND-01; ler 19_IDENTIDADE_VISUAL_OFICIAL_BRAND_1_0.md e 20_PROMPT_000_BRAND_01.md para qualquer alteração frontend. Preservar assets oficiais, ContaOSMarca, Design System e tokens (REUTILIZAR > ESTENDER > CRIAR), componentes e estados; sem hardcodes, redesign ou bibliotecas paralelas. PLAN deve informar baseline visual, riscos e matriz de aceite; BUILD deve manter consistência; TESTE/TESTE C devem provar 1440/1280/768/390 nos temas claro/escuro, acessibilidade, marca e estados, sem alterações durante Teste C. Se prompt não envolver frontend, declarar impacto visual N/A justificado e garantir ausência de alteração visual.
Economia Lovable: checar turno/estado/commit antes de enviar; usar GitHub e Supabase diretamente quando possível; consolidar instruções; executar o menor delta; reutilizar testes/evidências válidos; não reenviar turno pendente nem duplicar builds/scans; nunca pular aprovação humana obrigatória, TDD, segurança, CI, Zero-Drift, fidelidade ao PRD, validação visual ou Teste C separado.
Entregar evidências e classificar: IDENTIDADE VISUAL PASS/FAIL/NÃO VERIFICADO/N/A; ECONOMIA LOVABLE CONFORME/NÃO CONFORME; ZERO-DRIFT PASS/FAIL. Sem prova não declarar PASS.

Neste GATE exclusivamente documental: impacto visual N/A; não modifica apresentação. Classificação: IDENTIDADE VISUAL N/A, ECONOMIA LOVABLE CONFORME; implementação, novos testes e nova execução HML NÃO EXECUTADOS. CI e revisão permanecem obrigatórias.
