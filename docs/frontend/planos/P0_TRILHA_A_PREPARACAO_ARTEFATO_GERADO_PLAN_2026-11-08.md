# PLAN corretivo: preparação e preservação das provas da Trilha A

Base: BUILD #335 integrado em 49cd3025445d28e6ac23f32f6d58b96ae10152a9. Teste C manual 42483778550, job 128741124206: proteção nativa 7/7 PASS; preparação PREPARE_DIRTY; etapa com secrets não executada. HML READY dpl_9yRxeM8pNr4TvnGJfwbmdxrgAf2j, Git 49cd3025. As provas públicas anteriores não serão repetidas.

## Causa demonstrada

A reconstrução gera `.wrangler/deploy/config.json` com conteúdo JSON `{ "configPath": "../../.output/server/wrangler.json" }`. Reproduzido no checkout isolado: este é o único arquivo ignorado fora das saídas já admitidas, e sourceTreeClean retorna false. Não é alteração de fonte nem lacuna backend. Não dispensar a verificação de árvore limpa.

## Correção e arquivos fechados

Depois da CI e integração deste PLAN, alterar apenas:

- scripts/hml/authenticated-visual-audit.mjs: admitir exclusivamente esse arquivo gerado, regular, sem symlink, pequeno e com objeto/valor exatos. Rejeitar qualquer outro arquivo em .wrangler, chave extra ou caminho diferente. Remover a saída reconhecida antes da reconstrução, junto das saídas anteriores, para impedir uso como entrada. Preservar a verificação antes e depois do build.
- scripts/hml/authenticated-visual-audit.test.mjs: RED do artefato real e testes de conteúdo/caminho extra, symlink e .env ignorado. GREEN somente dos consumidores afetados.
- .github/workflows/contaos-trilha-a-authenticated.yml: limitar o CI próprio de PR a mudanças do harness, workflow, package.json ou bun.lock. Documentos não alteram o protocolo nativo. Os checks obrigatórios existentes permanecem intactos; execução privada continua exclusivamente manual na main.

Preservar a prova nativa já aprovada. Em falha pré-login, produzir artefato de bloqueio com código sanitizado, SHAs públicos, estado NO-GO e, quando válido, o atestado nativo do mesmo HEAD. Incluir SHA256SUMS desses arquivos, sem inventar casos privados, screenshots, sessão ou aprovação. Isso evita que a falha primária seja acompanhada por erros de diretório/artefato ausente e mantém a evidência parcial para revisão.

Documentação permitida: este PLAN, PLANO_ATIVO, snapshot e checkpoint. Proibidos src, public, tipos, dependências, lock, backend, dados e PROD. Não alterar a política de transporte, CORS, TLS, sandbox, credenciais ou os 18 casos públicos adicionais.

## Aceite, revisão e próxima execução

TDD com casos negativos; lint/formato focal; revisão independente; CI e proteções no mesmo HEAD antes do merge. Rollback por PR desses arquivos, sem dados. Depois do merge, reancorar deployment HML e repetir a preparação corrigida e as etapas ainda não executadas; não repetir a matriz privada, que ainda não teve casos aprovados. A barreira nativa vinculada ao novo SHA continua obrigatória antes de secrets.

V1, 208 privados, 72 critérios e WCAG integral permanecem NO-GO. A aprovação deste PLAN autoriza só a correção do executor; não certifica produto nem dá permissão nova a usuário.
