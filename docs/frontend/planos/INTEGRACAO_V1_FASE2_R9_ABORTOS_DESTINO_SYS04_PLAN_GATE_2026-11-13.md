# Fase 2 R9: abortos na transição para SYS04 e preflight órfão de POST

## Estado terminal R8, sem certificação

A Fase 2 continua NÃO CERTIFICADA. A cadeia integrada na `main` é esta:
- PLAN R8 e emenda incremental: #626, merge `78a5f4b`.
- BUILD do preflight CORS: #629, merge `a896530`.
- Executor incremental e ledger R7: #630, merge `40274db`.
- Evidência única: #631, merge `3f7a34e`.
- REQUEST R8: #632, merge `9a4d0ad16a8a64fa04a30208c8c36e7020ec9b01`. A revisão canônica é a `5887757273`.

O HML está em `dpl_CRTez9i1BPWHgE7BP7sNwvQoC3hh`, fonte `3638cdd381cb911f6bdc115169891a25479b7a25`, sem mudança.

Execuções:
- Auth `43388821235`, attempt 1. O preflight `131763574532` deu SUCCESS e validou o ledger antes das credenciais. O job privado `131764048105` deu FAILURE.
- Fixtures `43388821288`: SUCCESS, com a preparação `skipped`.

Artefato `14020676685` (`trilha-a-private-43388821235-1`, 1730 bytes, retenção até 11/02/2027), metadados registrados antes do download:
- ZIP `sha256:ab15acd3b6a136139e620c5f734783b054157fd98ecbadcdec4e9026fde97e06`, CRC válido, dois membros, `SHA256SUMS` OK.
- `report.json` `3025371b6c575cac164f5c5e9068104ee9a1a98d60926499a5230c97f71ac4d7`.
- Schema `contaos.navigation.audit.v4`, `ledgerSha256` `0a8f71f2…`, `resumeFrom` 26, `harnessSha` `9a4d0ad…`.
- Resumo: 10/27 observados, 8 PASS, 2 FAIL, `runComplete=false`, `cumulativeMatrixComplete=false`.
- Sessão, MASTER e organização `true`; `logoutVerified=false`; `transportErrors` 3; `fenceDiagnostic` `FENCE_DRAIN_TIMEOUT`.

Resultado por índice canônico:

| Índice | Caso | Resultado |
|---|---|---|
| 26 | V110/390 | PASS. O defeito do R7 foi corrigido pelo #629 |
| 27-29 | V111/1440, V111/390, V112/1440 | PASS |
| **30** | **V112/390** | **FAIL `NAVIGATION_CASE`**: dois `GET` `API_REST` `ABORTED` em `LINK_CLICK` para `SYS04` (08:04:27Z), `transportErrors` 2; o caso seguiu até `FINISH` (08:05:22Z) e foi reprovado pelos erros de transporte |
| 31-34 | V113 e V114 nas duas larguras | PASS, mas **não são candidatos** ao ledger por serem posteriores ao primeiro FAIL (emenda, item 3) |
| **35** | **V115/1440** | **FAIL `FENCE_DRAIN_TIMEOUT`**: um `POST` `API_RPC` `ABORTED` em `LINK_CLICK` para `SYS04` (08:09:38Z), drain esgotado 10 s depois (08:09:48Z); execução interrompida |
| 36-52 | demais | não executados |

R8 está consumida, sem rerun, replay nem reuso de nonce. Candidatos ao ledger: os índices 26-29 desta execução.

## Padrão observado (correlação, não causa)

Todas as falhas desse tipo desde o R6 são `LINK_CLICK` com destino **`SYS04`** (rota `/`, componente `Dashboard`):
- R6: V107/390.
- R7: V110/390.
- R8: V112/390 e V115/1440. Esta é a primeira ocorrência em desktop.

Os abortos ocorrem **dentro de `clickPath`**, enquanto `row.operation` ainda é `LINK_CLICK`, e não na volta à origem (`LINK_RETURN_SOURCE`). O `Dashboard` e o `ContaOSAppShell` não passam `signal` aos pedidos. Um `ERR_ABORTED` sem `AbortController` costuma indicar navegação de documento ou cancelamento interno de biblioteca, mas os dados atuais **não comprovam** nenhuma das duas. A causa dos abortos é **NÃO COMPROVADA**.

A falha do índice 35 tem mecanismo provável já conhecido: é o preflight CORS órfão do #629, agora com `POST`, porque a aposentadoria só cobre `GET`. Isso precisa de prova própria antes da correção.

## Investigação e BUILD R9 (somente harness)

1. **Instrumentação segura de transporte** (`authenticated-visual-audit.mjs`). Cada `NAVIGATION_TRANSPORT` e o diagnóstico do drain passam a registrar apenas valores enumerados ou numéricos:
   - classe do endpoint por lista fechada: tabela REST, função RPC ou endpoint Auth, sem query, IDs, cabeçalhos ou corpo;
   - tempo desde o clique, em ms;
   - se houve navegação de documento (`Page.frameNavigated` ou `requestWillBeSent` `Document`) durante `clickPath`;
   - tipo de `initiator`;
   - se o pedido tinha preflight;
   - `pathname` de origem e de destino, como superfície canônica;
   - fase do drain (antes ou depois do clique) e contadores do drain no timeout.
2. **RED/GREEN do preflight órfão de POST**, em Chromium real e com testes sintéticos, no mesmo formato do #629. Se comprovado, estender a aposentadoria a `POST` com as mesmas três provas. Nada muda para pedidos sem prova.
3. **Ledger v2:** acrescentar os índices 26-29 e 31-34 da R8 (run `43388821235`, artefato `14020676685`, report `3025371b…`), encadeado a `0a8f71f2…`, com lacunas 30 e 35-52 e primeira pendência 30, conforme a emenda R9 (C). Também implementar no executor a execução exata dos índices pendentes e, no auditor, a regra de revisão canônica (B). Incluir `9a4d0ad…` em `compatibleHarnessShas`, com prova de não impacto da instrumentação e da extensão a POST: nenhuma das duas altera a verificação de cada caso.
4. **Nonce** `integracao-v1-fase2-nav-20261113-r9`, com R8 consumida e este PLAN como ancestral.
5. Testes adversariais: falhas reais de transporte, pedidos não terminais, frame estranho e ausência de prova CDP continuam bloqueando, e nenhum `ABORTED` é ignorado.

O objetivo da execução R9 é dar evidência causal **sem enfraquecer controles**. Se o índice 30 falhar de novo, ele deve falhar com a instrumentação que identifica o pedido e o mecanismo.

## Emenda R9 ao protocolo (aprovada pelo titular em 13/11/2026)

O titular, como direção, aprovou no chat de execução de 13/11/2026 (05:20, Bahia) quatro otimizações. Elas prevalecem sobre os pontos correspondentes da emenda de certificação incremental (#626) e do PLAN R8, sem revogar nenhum controle de segurança:

- **A. Agrupamento por identidade.** PLAN e BUILD podem ser enviados empilhados. O BUILD exige como ancestral o **commit** deste PLAN, e não apenas o merge, o que preserva a ancestralidade comprovada. PLAN e BUILD continuam integrados por PRs protegidas separadas, nessa ordem.
- **B. Revisão canônica pelo revisor independente.** O auditor aceita a revisão canônica JSON registrada pela conta autora (`contaos9999`) **ou** pelo revisor independente com escrita (`Edivan5002`), sempre a mais recente dessas contas no HEAD exato, em estado `COMMENTED`. O corpo deve ser o JSON exato. Também é aceito exatamente o JSON seguido do rodapé fixo `\n\n---\n_Generated by [Claude Code](https://claude.ai/code)_`, que o ambiente de execução acrescenta, e nenhum outro texto.
- **C. PASS posteriores a FAIL não fatal.** Cada caso começa com navegação direta e verificação própria. Por isso, um caso PASS na mesma execução, **depois** de um FAIL de caso que não interrompeu a matriz, também é candidato ao ledger. O ledger deixa de exigir contiguidade e passa a registrar **lacunas**. A execução seguinte executa exatamente os índices pendentes (sem PASS válido), em ordem canônica, e só eles. Continuam valendo:
  - o caso que falhou nunca entra;
  - casos não executados nunca recebem PASS;
  - os controles globais (sessão, MASTER, organização, logout, zero erros) nunca são herdados e são exigidos na execução que fechar a matriz;
  - falhas fatais (fence, drain, contexto) interrompem a matriz.

  Aplicado à R8, ficam candidatos os índices 26-29 e 31-34.
- **D. Pré-revisão por mutação.** Antes de cada revisão independente, o autor executa testes de mutação e a suíte completa e anexa o resultado. Isso não substitui a revisão independente.

## Correção de produto (condicionada)

Só depois de causa demonstrada. Uma correção de produto (por exemplo, no `Dashboard` ou no `ContaOSAppShell`) exige PLAN próprio ou revisão deste, BUILD com teste DOM e de rede, novo deployment HML, reancoragem de `NAVIGATION_DEPLOYMENT` e **`SUPERSEDED` de todos os PASS** do produto anterior, com retomada a partir do índice 1, porque a emenda exige o mesmo produto para reaproveitar.

## Proibições

Continua proibido:
- ignorar `ABORTED`, suprimir `requestfailed` ou zerar contadores;
- alterar o deadline para mascarar defeitos ou desabilitar o fence;
- aceitar rede não terminal ou remover asserções;
- alterar RLS, RBAC, backend, SQL, Auth, segredos, YAML, lockfile, branch protection, deployment ou PROD.

Zero-Drift, LOCK, isolamento e fail-closed continuam obrigatórios.

## Sequência e aceite

1. Integrar este PLAN por PR protegida com revisão independente, Zero-Drift e LOCK.
2. BUILD R9 (itens 1-5) com revisão independente sem Critical/Important, CI e merge protegido.
3. REQUEST R9 de sete chaves, com revisão canônica JSON e Auth attempt 1 automática a partir do índice 30.
4. Certificação somente com 52/52 consolidados no ledger, controles globais verificados na execução final e PR de certificado integrada.

Rollback apenas por nova PR.
