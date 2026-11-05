# P0 V1 — Auto-Lock e custódia de evidências
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
