# ContaOS 4.1 — inspeção complementar da V1 em 05/11/2026

Escopo: inspeção somente leitura do GitHub, Supabase HML e Lovable; arquivamento de dois pacotes existentes do Teste C. Sem alteração de banco, produção, tipos, frontend ou identidade visual. **Este registro não emite certificado V1.**

## Evidências efetivamente verificadas

- GitHub frontend main: `faf6ad24d31ae69d105149a3a656858e23002a5f`, execução `42028160714` SUCCESS. Lovable projeto `b113dd59-6caf-4c92-8302-457a037a0c6f` retornou mesmo `latest_commit_sha` em consulta pontual.
- Backend main: `3aa4af7a292b80243045e0a426ee6399ba948ff2`. Supabase HML `gklhhhyosgasnyoxlrui` PostgreSQL 17.11, 117 tabelas públicas, 0 sem RLS, 183 policies e nenhum contrato na consulta.
- CI `42026795811`: 886/886 Vitest e Teste C Independente SUCCESS, aplicáveis somente ao escopo ensaiado. O teste visual sem credenciais **não homologa** 200 estados protegidos.
- Supabase Security Advisor: nove WARN por funções public SECURITY DEFINER executáveis por authenticated; todas nove bloqueadas para anon e com search_path vazio. Inspeção estática identificou guardas no próprio corpo ou nos helpers privados delegados, mas **testes autenticados de permissão ainda não foram executados**.
- Décimo WARN: proteção contra senhas vazadas desativada. Organização Supabase está no plano Free; documentação oficial exige Pro ou superior para a proteção nativa: https://supabase.com/docs/guides/auth/password-security. Não configurada e não alterada nesta tarefa.
- Snapshot de PostgreSQL HML: max_connections=60, 14 sessões, 0 wait de lock no instante, pg_stat_statements e pg_cron instalados. Não comprova carga, p95, disponibilidade ou backup.
- Auto-Lock GOV-011 já possui ensaio isolado de criação de PR pelo bot em `41805167363`, tentativa 2; não houve corrupção da main.

## Custódia arquivada e recuperada

- `ContaOS_TesteC_MAIN_42024620823.zip`: ZIP 9.802.839 bytes, SHA256 `9c7771521fb8cb20d8cef667f70a80c40f06e857d5eb60e6fdd0579fa71fd5ca`. 123 membros sem corrupção, 122 hashes internos corretos. Biblioteca `/ContaOS/Evidencias/Teste-C/`, ID `libfile_dd695ff39b308191b778d54838e11c91`.
- `ContaOS_TesteC_V1_886Testes_42026795811.zip`: ZIP 2.165.914 bytes, SHA256 `947e4c4256b3c57d5cd51ab9bafb28e60f7b0d910c53c3f2109d13e1e6687a03`. 26 membros sem corrupção, 25 hashes internos corretos. Biblioteca `/ContaOS/Evidencias/Teste-C/`, ID `libfile_5b83a95c51048191be357ca849e8fbb0`.
- Ambos foram novamente recuperados da Biblioteca e comparados por SHA256 com os ZIPs de origem, sem divergências. Não foi testada retenção WORM, backup externo ou política de custódia permanente.

## Ressalvas autorizadas do titular (somente estas três)

R-01 upload real E2E; R-02 processamento real worker; R-03 isolamento real entre usuários. Classificação: ACEITE_CONDICIONADO, prova real não executada.

## Outros gates ainda não encerrados

B-01 recuperação real de senha SYS-03 com caixa de correio de teste; B-02 WCAG, teclado e contraste em telas privadas sob sessão controlada; B-03 prova individual completa dos critérios V1; B-04 12 NFRs, desempenho sob carga e restauração de backup; B-05 configuração de Auth e testes por perfil das funções privilegiadas; B-06 retenção formal das evidências; B-07 fluxos de navegação e permissões com sessão real fora de simulações.

A matriz legada de `contaos999999/develop/docs/prompts/MATRIZ_416_CRITERIOS_STATUS_E_PROVAS_2026-11-03.json` possui 416 critérios de 00–38, sem cobertura individual atual demonstrada integralmente. Não renomear as ausências de prova como PASS, inclusive para 39–43/75 e atômicos 000–096.

**Decisão verificável:** NO-GO para certificado V1 com apenas as três ressalvas enquanto os gates B-01 a B-07 não forem comprovadamente encerrados. V2 bloqueada; PROD não alterada.

## ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE (OBRIGATÓRIO)

Nenhum novo BUILD, alteração visual, migration, Storage, Auth, segredos, regeneração de types.ts, nem mutação de dados HML. Evidência documental somente.