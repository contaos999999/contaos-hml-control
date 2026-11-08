# PLAN P0 V1: reancoragem do executor e falha local após submit

## Baseline e evidência

Issue #317, regular75/V1-23, atômico000 e NFRs085–096 transversais. V1 NÃO CERTIFICADA; nenhuma versão posterior ou PROD autorizada. Frontend main ce845e39c75178e951593915a915ff79938f914d; backend HEAD2d01d87654ce580f6f8fdd3446ea4aa78ac7752a igual ao snapshot canônico. Continuidade dos PLAN/GATE332/333 e localização334, sem repetir322/323/324 ou18provas públicas. Escopo exclusivo do executor autorizado pelo titular.

O alias HML e os literais públicos do módulo documentosDados-Df3qntgV.js apontam ce845e39/dpl_6aHdyVve2JRXgmouvnM27HE2naeU. Os inputs4f40e22/dpl_F5AG eram obsoletos. Dispatch42490769741 com os inputs atuais comprovou NATIVE_GUARD7/7 e PUBLIC_PROVENANCE110módulos/SSR PASS. Não existe evidência de que o deployment ID esteja ausente do build. Manter a comparação estrita.

A mesma rodada interrompeu depois do submit em WAIT_AUTH_DESTINATION/OTHER, loginUi.observed=false, cerca/proxy sem falhas. Causa local ainda NÃO DETERMINADA, não atribuir à senha ou backend. Artefato13621491132 baixado: ZIP SHA256 d045434b38a9be455740f1e39ba01111faf041bf6b5396a82fa48f2ffcd09562; report b1d17e5a70140cdff65faa54586b3f4fc869332229f2c752c417606c463f60f9. 0PNG/DOM/PASS privados,184interrompidos+24fixture(V117/V119/V120). Hashes conferidos.

## Contrato fechado da correção

Arquivos de BUILD permitidos, depois de PLAN/CI e GATE separado:

- scripts/hml/authenticated-visual-audit.mjs
- scripts/hml/authenticated-visual-audit.test.mjs
- .github/workflows/contaos-trilha-a-authenticated.yml

Documentação: este PLAN, P0_TRILHA_A_REANCORAGEM_EXECUTOR_GATE_2026-11-08.md, PLANO_ATIVO.json e ESTADO_E_RETOMADA_CONTAOS_4_1.md. Sem src/public/dependências/lock/tipos/backend/PROD. Nenhum endpoint, RPC, Auth, grant ou permissão novo.

1. Disparo manual main/hml com par de inputs opcional. Ambos vazios selecionam uma única identidade pública candidata no alias HML fixo, via parser AST inerte existente e validação integral das19chaves/repositório/projeto/Supabase. Não executar JS remoto nem aceitar objeto ambíguo, ausente, computado, interpolado ou secreto. Par explícito permanece estrito: incompleto, inválido ou obsoleto bloqueia antes do checkout da fonte e antes de secrets. Nenhuma substituição silenciosa de pins explícitos.
2. Resolver somente após instalar dependências congeladas do executor aprovado, sem credenciais privadas. SHA candidato deve ser commit ancestral da main antes de checkout/build da fonte. Exportar somente SHA40hex e IDdpl validado ao GITHUB_ENV/OUTPUT, sem interpolação shell. Registrar separadamente SHA executor/frontend e deployment. A resolução não comprova proveniência: a reconstrução local/SSR/bytes/hashes e freshness posteriores continuam obrigatórios. Mudança posterior do alias bloqueia, sem repin ou retry automático com credenciais.
3. Determinar a falha pós-submit por classificação fechada de erros locais Playwright (operação, nome e categoria de erro conhecidos), sem persistir mensagem/stack/URL/corpo/header/email/senha/token. Se necessário, somente status HTTP e enum de erro Auth em allowlist exata de respostas de falha; nunca corpo bruto ou resposta de sucesso. Não consultar Supabase administrativo. Diagnóstico desconhecido permanece UNKNOWN e não autoriza workaround.
4. Correção pós-submit somente se causa local comprovada com reprodução/teste RED, dentro desses três arquivos, sem modificar política de transporte/CSP/TLS/sandbox/permitidos, autenticação do produto ou aumentar timeout por tentativa. Caso dependa de backend/conta, registrar bloqueio específico e pedir apenas intervenção indispensável, sem alterar backend.

## Testes, revisão e aceite

RED/GREEN do modo automático, pins explícitos corretos/obsoletos/incompletos, candidato malformado/ausente/conflitante, chave extra/segredo/interpolação, projeto estrangeiro e injeção em outputs. Classificador deve recusar canários privados e valores desconhecidos. Testes nativos7/7 no mesmo HEAD, lint/formato focal, typecheck, build, regressão do produto e Zero-Drift/LOCK-TYPES sem bypass. Revisão independente antes de merge. Alterações de implementação não podem ocorrer durante Teste C.

Teste C manual em main após HML READY: disparo com campos vazios, âncoras registradas, preparação PASS antes de secrets, acompanhar auditoria e baixar/conferir artefato SHA256. TesteC autenticado 4larguras×2temas continua184candidatos e24fixture separados;72critérios e revisão visual independentes continuam exigidos. O estado global permanece NO-GO enquanto não houver DoD integral. Marca/rotas/idioma/UI são preservados e não certificados por testes do executor.

Rollback por PR limitado ao executor/workflow; nenhum dado. Dois checks obrigatórios e CI do protocolo no mesmo SHA. Não reexecutar provas públicas aprovadas.

## ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE (OBRIGATÓRIO)

Reutilizar ContaOS Brand v1.0 e componentes existentes. Não modificar assets, paleta, logos, estilos globais nem criar segunda identidade. Escopo mínimo do executor, nenhum backend, migration, RLS, segredo, tipo certificado ou PROD. GitHub direto, sem BUILD Lovable. Economia nunca reduz segurança, gates, testes, evidências, responsividade ou acessibilidade. As capturas privadas e os72critérios continuam pendentes e não podem ser promovidos a PASS por conferência de código.

Validação técnica do desenho: compatível com PLAN/GATE anteriores, reforça reancoragem e conserva proveniência e autoridade do backend; gates de planejamento PRD/premissas/arquitetura/atômicos/brand/segurança/NFR/Zero-Drift/TDD/TesteC planejado/rollback conferidos. CI e revisão deste documento ainda precisam ser observadas antes de BUILD.
