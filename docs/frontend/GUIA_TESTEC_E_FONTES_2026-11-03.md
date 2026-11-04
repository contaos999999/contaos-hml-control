# Teste C independente e verificação da fonte canônica — ContaOS 4.1

**Escopo:** governança frontend sem alteração de backend ou PROD. A ferramenta não transforma MOCK em E2E real.

## Teste C: como verificar
A pipeline `ContaOS Frontend Zero-Drift` executa primeiro testes, TypeScript, build e Zero-Drift. Depois chama o workflow reutilizável `ContaOS Teste C Independente`, em job isolado, sem alterar arquivos da aplicação e sem credenciais. A matriz contempla 23 superfícies × 4 larguras (1440/1280/768/390) × 2 temas (184 combinações). Playwright é instalado fora do pacote da aplicação. Rotas protegidas sem sessão são `NÃO VERIFICADO`, nunca PASS autenticado. O drawer V1-17 depende de login/competência e também fica NÃO VERIFICADO.

Após a execução, abrir [Actions do frontend](https://github.com/contaos999999/contaos-hml-control/actions), selecionar o run, acessar **Artifacts** e baixar `contaos-teste-c-<id>-<tentativa>`. Dentro estão `relatorio.json`, `SHA256SUMS` e `screenshots/*.png` das páginas públicas ou de acesso negado. O SHA do commit consta do relatório. O navegador bloqueia mutações HTTP para o Supabase.

**Retenção:** GitHub guarda o artefato por **30 dias**, não indefinidamente. O titular deve baixar e arquivar o ZIP num cofre/repositório privado autorizado antes do vencimento. Nenhuma imagem com dados pessoais ou documento real pode ser incluída. O fluxo em Vite dev do mesmo SHA não substitui teste do deploy final. Contraste real, teste autenticado, upload e e-mail de reset permanecem NÃO VERIFICADOS até prova específica.

## Fonte normativa sempre atualizada: ação necessária do titular
A verificação automática `scripts/context-freshness-gate.mjs` usa a API GitHub somente-leitura para comparar o HEAD atual de `contaos999999/develop` com o snapshot versionado: **25 documentos** e catálogo **100 regulares / 97 atômicos**. Se o HEAD mudou, um blob divergiu, a origem está indisponível ou falta token, **qualquer BUILD funcional ou PLAN VALIDADO será bloqueado**. Commit só documental sem PLAN validado pode passar com `N/A` e não certifica a origem.

1. Abra [tokens fine-grained do GitHub](https://github.com/settings/personal-access-tokens) → **Generate new token**.
2. Resource owner: `contaos9999`; **Only select repositories:** selecionar exclusivamente `develop`; permission **Contents: Read-only**, Metadata read padrão. Prazo curto de expiração e rotação.
3. Abra [Secrets do GitHub Actions do frontend](https://github.com/contaos999999/contaos-hml-control/settings/secrets/actions) → **New repository secret**. Nome exato: `CONTAOS_CANONICAL_READ_TOKEN`; valor: cole o token diretamente no site, nunca no chat, nos logs ou no código.
4. Para provar que funciona, executar um CI de PLAN validado/BUILD de teste autorizados. O passo `Verificar HEAD vivo do repositório normativo antes de BUILD` deve registrar **FONTE CANÔNICA PASS**. O `N/A` de um commit documental não prova leitura do backend.
5. Em caso de divergência da fonte, atualizar o snapshot por novo commit documental, reler os trechos alterados, revisar PROMPTs/atômicos/PRD e validar novo PLAN antes do BUILD. Nunca atualizar SHAs apenas para fazer o teste passar.

O token é de leitura documental do GitHub: não autoriza consultas SQL, RPC/RLS, Auth, Storage nem qualquer alteração no Supabase. `src/integrations/supabase/types.ts` continua congelado.

**Status GOV-003:** após a migração do owner, a correspondência SHA/25 blobs continua exigida; a configuração real e leitura do secret não podem ser inferidas de testes com resultado `N/A`. A conferência de leitura ao vivo permanece NÃO VERIFICADA até um run autorizado registrar `FONTE CANÔNICA PASS`.

## GOV-007 — auditoria WCAG instrumental no Teste C independente (04/11/2026)

O Teste C passou a injetar **axe-core@4.14.0** somente no navegador isolado para páginas públicas, executando verificações automáticas de WCAG A/AA por breakpoint e tema. O relatório registra regras com `violations` (FAIL público) e `incomplete` (NÃO VERIFICADO, revisão manual necessária); inclui `color-contrast` e resultados por cenário, sem armazenar conteúdo de campos ou dados de usuário. Falha de execução do axe também será FAIL, nunca aprovação presumida. Telas privadas permanecem **NÃO VERIFICADAS** sem HML autenticado; nenhuma credencial é injetada.

O artefato de screenshots e `SHA256SUMS` passa a ser solicitado com retenção de **90 dias**, limitada pela política efetiva da organização. Isto **não é arquivo permanente** e não substitui migração autorizada a repositório de evidências/armazenamento restrito. Não alterar o backend ou o Lovable para contornar a ausência de sessão. A medição axe também não substitui auditoria manual de foco, ordem de teclado, percepções de contraste em imagens/gradientes, leitor de tela e estados autenticados.

**Evidência anterior preservada:** run `41737621829`, artefato `13280975443`, expiração 03/12/2026, ZIP SHA256 `06dd5aaa044053ae88dc60f9e84289b6b84089d6c080140e20a051c6d47b52ec`; 25/25 SHA256SUMS internos conferidos e 24 imagens públicas. A auditoria GOV-007 não altera o histórico desse run; nova execução deverá produzir artefato separado e relatórios no SHA atual.
