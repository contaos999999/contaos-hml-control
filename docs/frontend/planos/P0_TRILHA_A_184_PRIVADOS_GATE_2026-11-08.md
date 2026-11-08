# GATE P0 Trilha A: diagnóstico fechado dos 184 pendentes

PLAN #352 integrado a782e91cc952a2c524b4a3c2c535447c53571c69; HEAD5c7722a, Zero-Drift42498347082/LOCK42498346825 SUCCESS, revisão independente sem Critical/Important. Titular determinou corrigir e executar integralmente os184 pendentes, sem autorizações repetidas. V1 não certificada.

## Fase diagnóstica autorizada

Arquivos de BUILD estritamente scripts/hml/authenticated-visual-audit.mjs e scripts/hml/authenticated-visual-audit.test.mjs. Não mudar produto, transporte, workflow, secrets ou backend. Documento e PLANO_ATIVO atualizados antes do BUILD. Dois checks deste GATE SUCCESS no mesmo HEAD e revisão antes do RED/BUILD.

Preservar 24 PASS V114/V116/V118 do run42496235106, artefato13623288351 e hashes; não recapturar esses casos sem regressão. A próxima execução deve processar somente184 pendentes, com24 fixture explicitamente bloqueados enquanto ausentes. Referências ao baseline não equivalem a novas provas no HEAD atual.

Classificador de privacidade retorna apenas enums fechados e contadores limitados: conteúdo inválido, mídia opaca, padrão sensível, palavras fora do catálogo, permitido. Nunca persistir palavra desconhecida, texto bruto, hash de dado pessoal, e-mail, CPF, senha, token, URL ou seletor com conteúdo dinâmico. Distinguir snapshot de texto renderizado. Contar desconhecidos sem divulgar valores; correspondência com catálogo candidato apenas mediante constantes sintéticas de origem previamente comprovada, sem aceitação automática. Dados desconhecidos permanecem bloqueados. Nenhuma captura anterior à aprovação de privacidade.

Documentar valores sintéticos existentes apenas com origem autorizada: IDs e organização já fixados no executor; arquivo FONTE_SINTETICA_AUDITORIA_HML.txt, texto285bytes e hash773eb577ba88a260247803d37dced4f5469e8c39347dd3fe7c58c4d9f4681103 comprovados no registro histórico. Não conceder aprovação global a toda resposta do servidor nem importar literais de testes. E-mails/CPF/JWT continuam proibidos mesmo se presentes no catálogo.

## Próximas fases e limites

Preparação de V117/V119/V120 será distinta do auditor somente leitura, por fluxo legítimo do frontend na organização ContaOS HML Teste. Antes de implementar preparação, registrar precondições, ações/RPC existentes, idempotência/limpeza, IDs reais e allowlist específica em emenda CI/revisada. Esta fase diagnóstica não autoriza novas escritas de negócio, endpoint, DML, grant, Auth, RLS, schema ou backend. Não presumir PR139 como causa.

Após diagnóstico, corrigir apenas causa comprovada com RED/GREEN e revisão, mantendo política fail-closed. Nova alteração de catálogo exige evidência sintética específica e negativos. Preservar 18 provas públicas. Critérios72 e achado350 continuam exigidos, sem bloquear investigação184 por trabalho visual independente.

## Verificação e rollback

Testar enums/counters limitados e ausência de conteúdo privado em canários, rejeição de e-mail/CPF/token e desconhecidos mesmo em catálogo, preservação da matriz208 e seleção184 sem recapturar24. Manter sete provas nativas no mesmo HEAD, lint/formato, regressão e LOCK-TYPES8ea7750b75fd9d76b29c36ce7613392e3ab65e19. CI verde/revisão antes de merge, HML READY/proveniência antes de autenticar, TesteC imutável e conferência SHA256. Resultado parcial permanece AUDIT_INCOMPLETE. Rollback por PR só dos arquivos novos; não apagar baseline.

## ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE

Nenhuma alteração de marca, assets, estilos, rotas, tipos, dependências, backend ou PROD. GitHub direto; testes privados não substituem72critérios ou certificação. Gates técnicos de planejamento PRD/premissas/arquitetura/atômicos000/085–096/segurança/NFR/Zero-Drift/TDD/TesteC/rollback conferidos; CI deste GATE ainda precisa ser observada antes do BUILD.
