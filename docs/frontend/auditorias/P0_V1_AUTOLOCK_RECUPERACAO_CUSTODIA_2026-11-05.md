# P0 V1 — Auto-Lock e custódia de evidências

## Atualização de execução — GitHub Release privada comprovada (05/11/2026)
**Status da redundância de custódia:** `PASS_RELEASE_PRIVADA_DOWNLOAD_SHA256`.

- PLAN emenda [#151](https://github.com/contaos999999/contaos-hml-control/pull/151), CI `42048309819` SUCCESS; BUILD workflow [#152](https://github.com/contaos999999/contaos-hml-control/pull/152), CI `42048890457` SUCCESS, merge `cce01d95f5301d062154eab03e76f17426fec7d1`.
- Execução real do workflow `ContaOS V1 Evidence Release`: [run 42049252141](https://github.com/contaos999999/contaos-hml-control/actions/runs/42049252141), **SUCCESS**. Baixou dois artifacts oficiais do Actions, verificou todos os SHA256SUMS internos, conferiu `tested_sha`, `public_fail=0`, `authenticated_e2e=NAO_VERIFICADO` e `no_backend_mutations=true`.
- [Release GitHub privada](https://github.com/contaos999999/contaos-hml-control/releases/tag/contaos-v1-testc-evidence-20261105), ID `435336541`, tag `contaos-v1-testc-evidence-20261105`. Repositório conferido **private=true**. Publicada em 05/11/2026; **immutable=false**, não alegar WORM.
- Asset reempacotado `ContaOS_TestC_42024620823.zip`: 9.795.345 bytes; SHA256 `c59d9826b06b7be8023db5bff4e3b48a7f572263f66fb3d2ad993517af48d10b`.
- Asset reempacotado `ContaOS_TestC_42026795811.zip`: 2.164.755 bytes; SHA256 `b6d9f38d7017b70f860d76a6677452c6065f73aa38229136cc5ab14a7e29e095`.
- Manifesto `SHA256SUMS`: 192 bytes; SHA256 `67f67926b471b3b5cf912987f3c856546b165ceedf0a0a910176e8baf41d901c`.
- O próprio job **baixou novamente os três assets da Release**, executou `sha256sum --check SHA256SUMS` com dois resultados `OK` e comparou byte a byte com os pacotes e manifesto criados no mesmo job (`cmp`). Não há diferenças.
- As cópias originais byte a byte permanecem na Biblioteca ChatGPT, com hashes externos previamente atestados. Os ZIPs da Release são **reempacotamentos dos mesmos arquivos internos**, portanto seus SHA externos são distintos dos ZIPs originais de Actions/Biblioteca. O manifesto por arquivo e o `tested_sha` garantem a vinculação técnica.
- **Fronteira:** redundância em provedores diferentes (ChatGPT Library e GitHub Release) comprovada no instante; não há política institucional de guarda legal, assinatura qualificada ou retenção WORM. Nenhum teste real de autorização, upload, worker ou isolamento foi criado por arquivar capturas.

Data: 05/11/2026. Sem PROD, sem modificação do arquivo `src/integrations/supabase/types.ts`.

## Auto-Lock GOV-011: prova repetida
- O [workflow 41805167363](https://github.com/contaos999999/contaos-hml-control/actions/runs/41805167363) foi **reexecutado** (attempt 3), concluído SUCCESS; job de prova `127308054156`.
- `autolock/probe-drift-41805167363-3`: branch descartável criada com drift artificial, commit `556f200`. Nenhum push para main.
- `autolock/probe-repair-41805167363-3`: branch descartável criada restaurando somente o blob certificado `8ea7750b75fd9d76b29c36ce7613392e3ab65e19`.
- O bot `github-actions[bot]` abriu [PR #148](https://github.com/contaos999999/contaos-hml-control/pull/148), com diff restrito a `types.ts` no cenário simulado. Conferiu `base`, `head`, autoria, diff e SHA da main inalterado.
- PR #148 **fechado sem merge** e branches de teste apagadas; log registra limpeza, sucesso e ausência de escrita na main.
- Job de integridade (protect-types) na mesma tentativa também SUCCESS. A recuperação foi testada em **branches reais descartáveis**, não na main. Não criar drift artificial na main, nem forçar merge ou bypass de ruleset.
- Classificação: `PASS_AUTOLOCK_RECUPERACAO_ISOLADA_COM_PR_E_CLEANUP`. Não alegar que uma corrupção real de main ocorreu.

## Evidências Teste C: 2 arquivos recuperados e íntegros
| Arquivo | Action | Size | SHA-256 ZIP | Arquivo na Biblioteca |
| --- | --- | --- | --- | --- |
| `ContaOS_TesteC_MAIN_42024620823.zip` | [42024620823](https://github.com/contaos999999/contaos-hml-control/actions/runs/42024620823) | 9.802.839 bytes | `9c7771521fb8cb20d8cef667f70a80c40f06e857d5eb60e6fdd0579fa71fd5ca` | `/ContaOS/Evidencias/Teste-C/`; `libfile_dd695ff39b308191b778d54838e11c91` |
| `ContaOS_TesteC_V1_886Testes_42026795811.zip` | [42026795811](https://github.com/contaos999999/contaos-hml-control/actions/runs/42026795811) | 2.165.914 bytes | `947e4c4256b3c57d5cd51ab9bafb28e60f7b0d910c53c3f2109d13e1e6687a03` | `/ContaOS/Evidencias/Teste-C/`; `libfile_5b83a95c51048191be357ca849e8fbb0` |

Os arquivos foram novamente lidos depois de materializados da Biblioteca; `ZipFile.testzip()` PASS e manifestos internos com **122/122** e **25/25** hashes válidos. Comparação de SHA externo idêntica à origem. Nenhum conteúdo de sessão real foi coletado: esses Testes C são de navegação pública sem credenciais; 200 combinações protegidas permanecem não homologadas.

## Política de custódia proposta e situação
1. Original e hashes no GitHub Actions; prazo informado dos dois artifacts: 03/02/2027 (90 dias, sujeito a política de retenção).
2. Biblioteca persistente `/ContaOS/Evidencias/Teste-C/`: cópia recuperável com hash verificado, mas não declarada WORM, backup de provedor independente, custódia legal ou retenção contratual definitiva.
3. Manifesto GitHub versionado: prova de integridade por SHA, CI e HEAD. Revisão automática de validade dos links/artefatos deve ser estabelecida pelo fluxo institucional.
4. Uma **GitHub Release privada com cópia durável fora da janela de 90 dias dos artifacts** será adicionada somente após emenda PLAN própria, com ação de GitHub Actions restrita à main, validação dos SHA internos, permissões mínimas, armazenamento privado e teste de download/hash no mesmo job. Até prova de release e restauração, não marcar backup independente como concluído.

## Gates e rollback
- Documento e matriz no BUILD sob PLAN #149, com Zero-Drift e Teste C no PR. Não alterar branch principal sem CI verde.
- Rastreabilidade/Segurança em relatórios separados e verificáveis. Três ressalvas R-01 a R-03 intocadas.
- Classificação: Auto-Lock isolado PASS; custódia Library PASS de recuperabilidade pontual; **retencao independente duravel ainda pendente da Release**.

## ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE (OBRIGATÓRIO)
Apenas evidências, sem alteração de app, tipos, banco, Supabase HML ou PROD; nenhum custo Lovable.
