# Auditoria automatizada3.1.4 — RCA e evidências do BUILD684

## Atualização operacional1 — instalação dos bytes aprovados, 15/11/2026

PR684 integrada em `e3f42b393eeb64355e81c92e928093485608ba95`, review [5910026660](https://github.com/contaos999999/contaos-hml-control/pull/684#pullrequestreview-5910026660) por Edivan5002 no HEAD `cae714adb122e762e441ec45b664fc13272987c8`, após autorização específica. Cinco checks pertinentes pós-merge SUCCESS. PASS independente RunId `20261115T090945479Z-cae714adb122-c97b90db0bf548c6985e66ee23db616f`, SHA256 `C67ABCC351B9546E13A488DFD29F14AB1634B45BCE5EB0A5D1AD0570B3DE3553`. O parecer menciona21 documentos; o snapshot contém25, todos25 hashes conferidos pelo orquestrador; o original permanece imutável.

Release local nova: `C:/Users/ediva/Projetos/ContaOS-4.1/scripts/releases/auditoria-v3_1_4-20261115`, com approved/, backup/, package-manifest.json e installation.initial/final.json separados. Instalação por substituições atômicas de arquivos individuais após validar todos os originais3.1.3 e bytes Git aprovados/mesclados; nenhum perfil, config ou credencial foi alterado. `installation.final.json` estado INSTALLED_HASH_VERIFIED, SHA256 `34E213EE0E4109E7A5CA74FC9C5179BD9F8C519680C79010767F4C4F6325924C`.

Hashes SHA256 instalados: controlador `9165f22dd011ae3a5aacdfd8f16eca6c0b715cec9822fc48fc16a51c7f194d91`; preparador `fd25bb117400fffc23de9c555231001d8c7852eef7bb0cda3fa98405d69ea79c`; runner preservado `aeef6ea8bfacaf2678ebfd693f5c8af0874c514e6f7c68753a0fdd0b49e17d8d`. Conferem com MANIFEST aprovado. `installed:false` no MANIFEST é o estado histórico de publicação do BUILD; esta atualização registra a instalação posterior sem reescrever aquele recibo.

Prova negativa real: controlador instalado3.1.4, `-Pr679 -Acao Verificar`, exit1 por base gravada divergente da ref viva, antes de preparação/auditoria/review. Log bruto `C:/Users/ediva/AppData/Local/Temp/contaos-314-stale-pr679-a950026d6b9c4f36be23f0ff0269acc3.log`, SHA256 `68542EF257A2AB16DD4C343001D3DCA16511FAA4794D782760AC070356128BA5`. Não é falha nova nem tentativa de resolver679; é o negativo previsto de frescor.

**Estado ao publicar esta atualização:** bytes instalados e negativo real comprovados; positivos Verificar/Preparar/Analisar e checkpoint integrado ainda PENDENTES. A PR deste recibo documental, baseada na main atual, servirá de alvo positivo sem mudanças de aplicação. NR009 continua PENDENTE_PR até recibos completos; não confundir instalação física com aceite integral. O histórico do BUILD abaixo permanece preservado.

## Estado e fontes

BUILD local sob o [PLAN integrado pela PR685](../../planos/PLAN_AUDITORIA_BASE_VIVA_V3_1_4_2026-11-15.md) e GOV684. PLAN685 HEAD `a88c3b0d2511a9035de331e375b84cbb65a6090b`, PASS R2, review [5909914860](https://github.com/contaos999999/contaos-hml-control/pull/685#pullrequestreview-5909914860), merge `0a1c9e9bc1e51a2d16b92965b88f5116bea51591`; quatro checks pertinentes pós-merge SUCCESS. A reserva684 continha apenas sete linhas documentais; recebeu a main por merge local `73bbd206178239e8a3a9f10b2de22e23ecc2e808` antes da implementação. Nenhum histórico publicado reescrito.

**PENDENTE:** CI do BUILD684, auditoria independente, review formal autorizada, merge, instalação3.1.4 e prova operacional da release instalada. Os testes abaixo são offline; não certificam E2E do produto. Fonte normativa permanece `1504af465b45afc846458d00e5cb63513fa298ed`,25 blobs conferidos na retomada.

## RCA → impacto

Classe confirmada `PR_BASE_SNAPSHOT_AS_LIVE_REF`: `InfoPR` e `validate_pr` da3.1.3 tratavam `baseRefOid` como evidência de frescor sem consultar a branch base. Na consulta histórica real da679, a base gravada era `20d4ad96fd1f7ec02baa3bd618532385065a729b` e a ref viva já era `f538d967dd974b7cd8243a3407a0736b64580db3`. Não há demonstração de APPROVE/merge indevido ou corrida efetivamente ocorrida no envio do CLI.

NR-001/004/005/006 conhecidos: conferir refs/mergeability/checks antes de retry, rejeitar skipping, integrar GOV antes de código e autenticar proveniência. A nova classe de frescor fica NR-009 PENDENTE_PR; não renomeia ou resolve as classes históricas. A causa é coleta/validação insuficiente no controlador/preparador, não o runner, RLS ou produto. O protocolo682 já exige conferência manual explícita da ref viva enquanto a release instalada não a implementar.

Consumidores afetados: InfoPR→Verificar/Preparar/Analisar/Revisar; preparador→snapshot; metadata→review; API GitHub→readback. Sem src/public/rotas/CRUD/dados/cache/RPC/RBAC/RLS/schema/backend/PROD. Riscos novos previstos: nome de base com barra, objeto/ref inválidos, contexto trocado com SHA igual, campos ausentes, identidade, hash e checks alterados após confirmação, review no commit errado e falha posterior ao POST.

## RED → GREEN e mecanismo

- RED3.1.3 preservado no TEMP `contaos-313-base-red-7da0d6eb4f2d481ab3366ae3ef5bcb40`: AST real InfoPR aceitou base divergente com zero consultas api/ref. Hashes estão no PLAN; fixtures sintéticos declarados, sem rede/secrets/review.
- Novo RED causal no controlador real: `base viva stale inicial bloqueia InfoPR real` falhou com `Esperava rejeicao` antes da correção. O primeiro RED Python reportou ausência da nova interface `collect_context`, não uma segunda prova semântica; não ocultar essa distinção. O RED semântico original e a observação do fluxo real sustentam a causa.
- RED do trecho real Revisar: nove casos falharam quando o caminho antigo chegava ao stub de envio inseguro/sem commit_id ou deixava passar mudanças de nome/autor/checks/hash após confirmação. Cancelamento e controles prévios já existentes continuaram bloqueando.
- GREEN final: **91 testes** —59 PowerShell,25 preparação Python,7 runner. Inclui os43 testes anteriores. **Três mutações detectadas**: retirar comparação da ref viva em PS, retirar reconsulta após preparação em PS e retirar comparação viva no preparador Python. Cada mutante falhou no teste causal nomeado; fontes reais não foram modificadas pelas mutações.
- Em ambos os coletores: ref GitHub exata, objeto commit, SHA e nome conferidos; erro, 404, JSON malformado, lista e base diferente bloqueiam. Snapshot preserva PR/base gravada/ref viva/endpoint/instante antes e depois. Controlador consulta depois da preparação, depois da análise e imediatamente antes de review.
- Revisar: RunId e parecer imutáveis; contexto completo dos metadados; confirmação humana; hash/checks/identidade revalidados; POST estruturado com `commit_id` fixo; response/readback com id, SHA, estado e login; contexto pós-envio. Tentativa escreve request/response/readback/verified ou failure em diretório único, sem sobrescrever parecer/metadata. Falha após POST pode deixar review registrada: reavaliar e não reenviar cegamente. Não há promessa de atomicidade entre snapshots remotos.

Contrato oficial consultado: [Git refs: Get a reference](https://docs.github.com/en/rest/git/refs#get-a-reference) e [Create a review for a pull request](https://docs.github.com/en/rest/pulls/reviews#create-a-review-for-a-pull-request), incluindo `commit_id`. Não adicionar token ao runner nem alterar credenciais/perfis.

## Comandos e cobertura

1. `powershell.exe -NoProfile -ExecutionPolicy RemoteSigned -File scripts/auditoria/test-controller.ps1 -Controller scripts/auditoria/auditar-pr.ps1`:59 PASS/0 FAIL.
2. `python -B scripts/auditoria/test_preparation.py`:25 testes OK.
3. `python -B scripts/auditoria/test_runner.py`:7 testes OK.

Os subprocessos de teste executam os trechos reais de Revisar e Preparar/Analisar com stubs exclusivamente nas fronteiras externas e na confirmação de fixture. Zero requests/reviews reais. Os casos estáveis precisam concluir; negativos precisam falhar na barreira correta, sem metadata final; falha de setup não vale como negativo. Dois diagnósticos do harness foram preservados: scriptblock não tinha PSCommandPath e arquivo de cápsula mudou o escopo `$script:` dos stubs. A revisão causal ampliada isolou estado de fixture por subprocesso; nenhuma mudança de produto foi feita para acomodar o teste. Só o GREEN posterior foi aceito.

## Limites, rollback e próximos gates

Runner, cinco perfis e config.toml preservados. Manifestos/releases3.1.3 e pareceres anteriores preservados. Tipos no blob `8ea7750b75fd9d76b29c36ce7613392e3ab65e19`. Impacto visual N/A nas quatro larguras × dois temas: delta administrativo sem UI. SKIPPED não é E2E. Economia Lovable CONFORME: trabalho direto, zero BUILD Lovable e zero backend.

Antes de encerrar: checks do SHA final, nova auditoria/read-only, review autorizada, merge protegido/readback/pós-merge; instalar bytes aprovados em nova release com backup e manifesto, provar Verificar/Preparar/Analisar no instalado, registrar checkpoint integrado. Usar3.1.3 para auditar esta PR com conferência explícita da ref viva pelo orquestrador. Rollback somente por PR e backup rastreável; enquanto3.1.3 estiver instalada, manter conferência manual. PR679 continua pendente e separada.

## Artefatos locais preservados

Hashes dos logs brutos; transcricao da interface nao altera estes arquivos. Caminhos locais tambem constam do MANIFEST.

- powershell-green: `C:\Users\ediva\AppData\Local\Temp\contaos-684-final-green-2752b8ceaf14464d9a4e50b5d89a8167.log`; SHA256 `c47a2104ac08dfe608fff505c1ac6d007c6246e85232c45baad334d9809c0a01`.
- powershell-red: `C:\Users\ediva\AppData\Local\Temp\contaos-684-red-context-20261115\powershell-red.log`; SHA256 `32011b7dc8dbd6dd0210d4f04700e92be417ec2327ffc0f5db1cc9d8a68b5611`.
- review-red: `C:\Users\ediva\AppData\Local\Temp\contaos-684-red-review-valid-20261115.log`; SHA256 `e01344de5dea47749e598e5f81323204d97a4ae6b93b84e70ba4ca4eb3e8df05`.
- mutations: `C:\Users\ediva\AppData\Local\Temp\contaos-684-mutations-gb9e982_\results.json`; SHA256 `a472a9f03a2163d2a42e7120a7c7a589af23a850c876915ffe2d77c38fc843f6`.
- preparation-green: `C:\Users\ediva\AppData\Local\Temp\contaos-684-build-evidence-p7bvwir9\preparation-green.log`; SHA256 `455264ae94f16b14b1cb2ff52231b558532eee6da826943c52e82903cbdefae6`.
- runner-green: `C:\Users\ediva\AppData\Local\Temp\contaos-684-build-evidence-p7bvwir9\runner-green.log`; SHA256 `3a771320915236c80759de3dfd5d44972a704b72e2e631b8baf4ce38c59cccb8`.
