# P0-NR-001 — NÃO REINCIDÊNCIA DE ERROS CONHECIDOS
**Instituído por orientação expressa do titular em 14/11/2026.** Complementa P0-RCA-001 e todos os controles P0 preexistentes. **Regra:** dificuldade nova exige investigação; falha de causa já conhecida exige aplicação e aperfeiçoamento do aprendizado prévio. A recorrência não deve ser mascarada como incidente novo.

## I. Preflight obrigatório em todas as tarefas
Antes da primeira ação que altere um projeto ou antes de encerrar uma missão com bloqueio:
1. Ler o checkpoint canônico, HEAD e estado atual da PR, CI e reviews. Consultar `docs/frontend/governanca/P0_NR_001_LEDGER.json` e o último resultado do gate.
2. Buscar correspondência por fingerprint e **causa**, não apenas palavras ou mensagem de erro. Encontrou classe conhecida? Declarar NR-XXX, aplicar primeiro sua barreira/negativo; se a proteção falhar, marcar REINCIDENCIA e escalar. Erro verdadeiramente novo recebe ID novo e estado DIAGNOSTICO, nunca se presume resolvido.
3. Registrar **resultado da checagem prévia** (conhecido/novo/não conclusivo), data, refs SHA/PR, mecanismo aplicado e observação. Sem ambiente ou prova suficiente, usar NAO_VERIFICADO/NO-GO, jamais PASS.
4. Confirmar diff, contratos, causas concorrentes, mapa de dependências e riscos de regressão **antes** de implementar. Uma falha conhecida é defeito do processo de prevenção e obriga revisão do guard, do teste e do fluxo, não uma nova repetição do mesmo patch.
5. Usar RED causal → BUILD mínimo completo → GREEN → teste negativo/propriedade/mutação quando aplicável → suite integral e testes nativos obrigatórios → revisão independente → merge protegido → readback. Os mesmos controles não podem ser simulados nem reutilizados de outro HEAD.

## II. Interrupção e continuidade responsável
Bloqueio técnico comum **não** finaliza a missão. Investigar estado real (PR, conflito, HEAD, branch, eventos, permissões, dependências, runners, ambiente, CI), testar alternativas legítimas *diferentes*, tratar causa raiz, voltar ao objetivo. Não repetir reabertura, commit vazio ou workflow_dispatch sem nova evidência. Se duas tentativas da mesma causa não resolvem, abrir análise causal ampliada, não abandono.

Interromper a **ação de risco** se faltarem autorização, evidência, segurança, serviço ou acesso real. Isso não implica declarar a missão concluída. Preservar checkpoint GitHub verificável com última etapa comprovada, HEADs, PRs, testes, resultados, pendências, riscos e próxima tarefa. Jamais dizer que o problema foi resolvido só porque foi documentado ou porque um teste simulado passou.

## III. Classes conhecidas e prova
A fonte canônica de incidentes é o arquivo `P0_NR_001_LEDGER.json`. Status:
- `PENDENTE_PR`: mitigação proposta, ainda sem review/merge/CI final.
- `MITIGADO_EM_BRANCH`: comportamento observado no novo HEAD, mas barreira não necessariamente integrada no produto.
- `EM_MONITORAMENTO`: processo ou teste de prevenção já existente, sem prova de impossibilidade de reincidência.
- `REINCIDENCIA`: condição conhecida reapareceu; exige referência ao primeiro incidente e revisão causal ampliada.
- `RESOLVIDO_COM_PROVA`: só com referência a PR integrada, review independente, CI no SHA, readback do mecanismo preventivo e prova operacional. O guard deve rejeitar ausência ou incongruência de recibos.
- `DIAGNOSTICO`: hipótese ou estado ainda não conclusivo; não implementar correção como se causa estivesse confirmada.

**Atenção:** status RESOLVIDO_COM_PROVA não significa garantia de que o erro nunca mais ocorrerá, somente prevenção atualmente demonstrada. Se reaparecer, volta a REINCIDENCIA, obrigatoriamente.

### Classes iniciais
NR-001: CI não inicia por merge conflict; checar mergeability, divergência main e estado do workflow antes de retries. NR-002: encerramento prematuro por bloqueio; manter investigação e checkpoint. NR-003: falso GREEN node:test sem subteste exato. NR-004: Teste C SUCCESS com Playwright SKIPPED não certifica integração. NR-005: RCA burlada por escopo/PLAN V1. NR-006: certificado com links sintáticos sem autenticação. NR-007: preflight textual sem testes. NR-008: sete rodadas na PR #658 por classes causais em vez de solução da origem. **Os cinco incidentes NR-003 a NR-007 dependem da PR #661 e não são considerados resolvidos antes do merge e readback.**

## IV. Ledger e governança de mudanças
Para cada classe manter ID, fingerprint estável e exclusivo, causa_status (CONFIRMADA ou EM_INVESTIGACAO), sintoma, origem verificável, barreira de prevenção, estado, mecanismo e teste/procedimento, tentativas do ciclo e risco residual. Duas tentativas sem nova evidência obrigam `revisao_causal_ampliada=true`, com referência a diagnóstico. Não apagar uma classe por já ter sido corrigida; apenas atualizar estado e provas, preservando histórico por commit. Não duplicar classe com ID novo para ocultar reincidência.

`scripts/p0-nr001-gate.mjs` verifica integridade do ledger e PREVENTION RECEIPTS; `scripts/p0-nr001-gate.test.mjs` mantém casos negativos. O workflow P0-NR separado é **aditivo**, não substitui o Zero-Drift, Teste C, RBAC/RLS, LOCK, revisão por Edivan5002, branch protection nem os gates 100/97. Sua mera criação não o torna check obrigatório do ruleset; promover a required check somente após revisão e alteração expressa e protegida.

## V. Procedimento de auditoria independente e certificação
O auditor executa uma passada completa e responde: (a) já houve falha desta classe? (b) causa original registrada? (c) prevenção foi aplicada ou burlada? (d) teste RED demonstra falha e negativo cobre novos riscos? (e) há regressão transversal? (f) a evidência pertence ao SHA/PR/ambiente real? (g) status no ledger é sustentado? Se reincidência, registrar a falha do **mecanismo de prevenção** como bloqueio e exigir correção na origem. Não autorizar revisão como aprovado com checks anteriores a HEAD modificado.

## VI. Limites de aplicação a outras interações
Esta regra orienta meu comportamento em conversas com o titular, além do ContaOS. Contudo, o CI do GitHub só aplica seus testes a este repositório. Nenhum arquivo GitHub altera, por si, as configurações de memória/personalização do ChatGPT nem garante lembrança em todas as conversas futuras. Para trabalho entre chats, consultar o checkpoint canônico e o ledger; não inventar continuidade que não tenha sido lida ou demonstrada.

**ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE (OBRIGATÓRIO):** preservar desenho, HML, 25 fontes canônicas, 100 regulares/97 atômicos, LOCK, BRAND, Teste C, auditoria independente e proibição PROD. Sem bypass por economia ou pressão por entrega.
