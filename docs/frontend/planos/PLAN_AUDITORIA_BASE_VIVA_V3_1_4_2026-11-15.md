# PLAN — auditoria 3.1.4: base viva e revisão vinculada ao commit

**Estado:** VALIDADO tecnicamente, eficácia condicionada a CI, auditoria independente, revisão formal autorizada e integração protegida deste PLAN antes de BUILD. PR de BUILD existente: #684. Esta PR de PLAN contém somente este documento e `P0_GOV_PLAN_684.json`; não modifica executáveis.

## PROMPT, autorização e contexto

O titular determinou concluir a instalação da auditoria automatizada antes de tratar os achados da PR679. A instalação3.1.3 e o protocolo já foram integrados pelas PR680 e PR682; não serão refeitos. Esta correção administrativa permanece sob o contexto75/V1, sem iniciar V2, certificar produto ou executar operações HML de negócio. Preservar a certificação funcional V1 e Fases1–2; Fase3 continua pendente.

Baseline frontend conferido: `47434526b805deaa3edc4c170c10725bbe79f594`; fonte normativa `contaos999999/develop@1504af465b45afc846458d00e5cb63513fa298ed`, igual ao snapshot. `context_pack_version=4.1`; `context_read_acknowledged=true`: leituras dos25 documentos00–20/08A–08D, P0 versão/NR/ledger, ADR-DEV-002, RCA e protocolo682 realizadas nesta retomada; os25 blobs do cache foram conferidos contra `CONTEXT_CANONICO_4_1_SNAPSHOT.json`. Lista nominal e fingerprint são os25 pares path/blob desse snapshot imutável; não criar uma segunda fonte normativa. BRAND-01 lido e preservado. Os100 regulares/97 atômicos não são certificados por este PLAN.

Aplicabilidade: segurança, evidência, histórico e governança do pacote4.1; NFR-007/008/010/011 por analogia operacional de concorrência, duplicação, observabilidade e falha externa, sem afirmar implementação/certificação funcional desses requisitos. Atômicos001–084 e demais NFRs de produto não recebem BUILD;000 preservado visualmente. Não inspecionar tecnicamente ou alterar backend/Supabase/PROD, dados, Auth, Storage, RPC, RLS, schema ou migrations. `src/integrations/supabase/types.ts` imutável no blob `8ea7750b75fd9d76b29c36ce7613392e3ab65e19`.

## Preflight P0-NR, RCA e RED

- NR-001 CONHECIDO: conferir mergeability, refs, eventos/checks antes de retry. Atualizar684 por merge da main integrada antes de reapresentação, preservando o histórico.
- NR-004 CONHECIDO: bucket skipping continua bloqueante no gate formal; Teste C administrativo não é E2E. NR-005 CONHECIDO: GOV684 prévio com allowlist fechada, nunca usar PLAN75 para isentar scripts sem autorização. NR-006 CONHECIDO: autenticar proveniência e preservar SHA/RunId/hashes; formato não é prova.
- NOVO confirmado, subtipo de frescor não coberto pelos mecanismos atuais: `PR_BASE_SNAPSHOT_AS_LIVE_REF`. `InfoPR` e `validate_pr` comparam `baseRefOid`/`base.sha`, mas não consultam `refs/heads/<baseRefName>`. Uma base gravada na PR pode continuar estável enquanto a branch base avança. Não há prova de review/merge indevido; não alegar corrida reproduzida no envio do CLI.
- Evidência real anterior: PR679 base gravada `20d4ad96fd1f7ec02baa3bd618532385065a729b`, ref viva main `f538d967dd974b7cd8243a3407a0736b64580db3`. O código3.1.3 confirma a ausência da consulta. A API real e o RED offline são tipos diferentes de evidência.
- RED preservado em `C:/Users/ediva/AppData/Local/Temp/contaos-313-base-red-7da0d6eb4f2d481ab3366ae3ef5bcb40`: `red-info-pr-base.ps1` SHA256 `811BF758877944AE692271DE519177BD5A57848B1B3ECC0581B4331943A382A3`; `red-result.json` SHA256 `B090BFAB2A1BEF6048796EFCCDFF84EC0E174AD349C32A39E157E905361E0806`. O harness extrai a função real por AST, observa base divergente aceita, zero consultas api/ref, zero rede/secrets/reviews. SHAs dos fixtures são sintéticos e declarados. O positivo tem refs iguais. Este RED não é o GREEN da versão futura.

Hipóteses descartadas: não é indisponibilidade do GitHub (consultas reais retornaram dois OIDs válidos), nem erro do runner/ambiente (a origem está nas funções que coletam/validam PR), nem simples mudança de HEAD (o defeito persiste com HEAD estável). Não corrigir os drivers679 nesta PR.

## Desenho e contrato

A correção consulta a ref viva autenticada, em vez de tentar inferi-la por fetch local ou `pull.base.sha`. Preferir estender os dois validadores existentes; não introduzir serviço, credencial, dependência ou arquitetura paralela. Comparar apenas snapshot da PR ou apenas branch local foi rejeitado por não eliminar a causa. A decisão técnica nominal decorre da autorização de correção e ADR-DEV-002; não substitui review formal.

1. `InfoPR` consulta PR e endpoint GitHub `repos/<repo>/git/ref/heads/<baseRefName>`, escapando corretamente o nome. Validar ref exata, objeto commit e SHA40 minúsculo; erro/ausência/lista/malformação bloqueiam. Preservar `baseRefOid` e acrescentar `baseLiveOid`, nome/ref, endpoint e instante da consulta. Exigir base gravada=base viva. Não sobrescrever silenciosamente o OID gravado para ocultar divergência.
2. Criar uma comparação central de contexto no controlador: número/repo, HEAD, nome da base, base gravada e viva, autor. Aplicar no início, imediatamente após Preparar, após Analisar e imediatamente antes de enviar review (depois da confirmação). Qualquer mudança invalida a execução: preservar evidência/failure, não produzir COMPLETED/PASS nem enviar review. Modo Preparar também não finaliza PREPARED se a base mudou.
3. `prepare-audit.py` consulta e valida a mesma ref no início e no final, antes de publicar os JSON finais. Recebe o nome de base esperado além de HEAD/OID. Snapshot inclui ambas as consultas e seus OIDs, timestamps e endpoint; metadata do controlador aponta hashes. Rejeitar nome diferente mesmo que OIDs coincidam. Tokens ficam no coletor autenticado, nunca no runner/prompt.
4. Revisar continua exigindo RunId, integridade/parecer/identidade e confirmação humana. Reconsultar checks e contexto após a confirmação e antes do envio. Enviar decisão pela API com `commit_id` fixo e corpo JSON por arquivo temporário exclusivo; não depender do HEAD implícito do CLI. Ler review retornada/registrada e conferir commit_id, estado e identidade, então reconsultar contexto. Divergência pós-envio registra falha e exige reavaliação; não apagar/dismissar review nem prometer eliminar atomicamente toda corrida remota. O controlador nunca faz merge. A IA não preenche APROVAR/SOLICITAR.
5. Relatórios3.1.3 permanecem íntegros. Só reutilizar PASS antigo quando todos os controles e prova explícita da base viva pelo orquestrador continuarem válidos, como foi feito na682. O novo fluxo3.1.4 exige seu contrato de metadados completo para novas execuções; campos ausentes bloqueiam revisão automática do controlador, sem inventar provas retroativas.

## Allowlist fechada de BUILD684

Executáveis/testes (somente estes quatro):

- `scripts/auditoria/auditar-pr.ps1`: contexto/ref, comparador, metadados, checks e envio/readback formal ancorado; versão3.1.4.
- `scripts/auditoria/prepare-audit.py`: mesmo contrato, consultas pré/pós e snapshot.
- `scripts/auditoria/test-controller.ps1`: AST real, cenários de contexto e trecho real Revisar com stubs offline, sem enviar reviews.
- `scripts/auditoria/test_preparation.py`: ref viva, nome, identidade do objeto, falhas externas e verificações pré/pós; preservar testes existentes.

Documentação de BUILD:

- `docs/frontend/governanca/AUDITORIA_BASE_VIVA_V3_1_4_BUILD_STATUS_2026-11-15.md`: reserva existente, estado honesto até integração/instalação.
- `docs/frontend/auditorias/instalacao-automatizada-v3_1_4/RCA_E_EVIDENCIAS.md`: RCA/impacto/RED/GREEN/CI/RunIds/hashes e limitações.
- `docs/frontend/auditorias/instalacao-automatizada-v3_1_4/MANIFEST.json`: novos hashes e vínculo à versão anterior, sem editar o manifesto3.1.3.
- `docs/frontend/governanca/P0_NR_001_LEDGER.json`: acrescentar a classe de frescor confirmada como PENDENTE_PR, com causa, testes/procedimento e origem; não promover a RESOLVIDO_COM_PROVA sem recibos integrados.
- `docs/frontend/ESTADO_E_RETOMADA_CONTAOS_4_1.md`: preservar histórico e registrar682/review5909839419/merge4743452 e etapas3.1.4 comprovadas, pendências679 e próxima tarefa.

Proibidos: qualquer outro arquivo, runner/perfis/config.toml, workflows/proteções, dependências/locks de aplicação, src/public, PLANO_ATIVO, backend/PROD/types.ts e manifestos/pareceres/release3.1.3. Se um teste revelar necessidade de ampliar caminhos, revalidar PLAN previamente; não contornar guard.

## Mapa de impacto e critérios de aceite

Consumidores: InfoPR→Verificar/Preparar/Analisar/Revisar, coletor Python→snapshot→auditor, metadata→revisão, identidade/checks→API GitHub. UI/rotas/CRUD/cálculos/dados/tenant/cache/API de negócio têm impacto N/A por diff exclusivamente administrativo. Novos riscos: falso bloqueio por nome escapado, campos incompatíveis, falha externa, base trocada com mesmo OID, corrida entre confirmação/envio, review no commit errado, overwrite da evidência. Cada um recebe negativo abaixo. Nenhuma falha pode gerar retry ilimitado ou desativar controle.

### Tarefa1 — RED→GREEN do contexto compartilhado

- [ ] Acrescentar testes dos validadores reais e observar RED em3.1.3: stale inicial; base muda após preparação/durante análise/pré-review; nome muda com OID igual; ref ausente/404/erro JSON/lista/SHA inválido/tipo errado/ref de outra branch; positivo estável e nome com barra escapado. Os testes precisam observar chamadas reais e efeito do bloqueio, além da mera presença de texto.
- [ ] Implementar contrato acima nos dois arquivos, mantendo a consulta autenticada fora do runner. Asserções devem comparar snapshot inicial, reconsultas e campos finais; erro em qualquer fase impede PREPARED/COMPLETED.
- [ ] Rodar `powershell.exe -NoProfile -ExecutionPolicy RemoteSigned -File scripts/auditoria/test-controller.ps1 -Controller scripts/auditoria/auditar-pr.ps1` e `python -B scripts/auditoria/test_preparation.py`; exigir nomes/casos e zero falhas.

### Tarefa2 — revisão formal e regressão

- [ ] Executar trecho real Revisar em processo/harness isolado com stubs, zero rede/secrets: CANCELAR, skipping, autor=revisor, hash/HEAD/base/nome divergentes, mudança após confirmação, payload commit_id fixo, readback de identidade/commit errado, e positivo estável. APROVAR é exclusivamente fixture de teste offline e nunca entrada da IA para revisão real.
- [ ] Implementar envio ancorado e readback conforme desenho; provar que cenário bloqueado nunca chega ao stub de envio e preserva o parecer. Positivo só envia uma vez ao stub no SHA esperado.
- [ ] Rodar ambas as suites acima e `python -B scripts/auditoria/test_runner.py`, mantendo os43 testes prévios e os novos casos identificados. CI Windows existente já executa essas três suites; não há mudança de workflow planejada.
- [ ] Atualizar evidências/manifesto/ledger/checkpoint allowlisted. Conferir diff, parser PS/Python, hashes e LOCK; aguardar Zero-Drift, P0-NR, protect-types, Teste C aplicável e CI Windows no HEAD exato. Regredir lint/tipos/build/suites nos gates CI previstos, sem dispensas.

### Tarefa3 — AUDIT, integração e instalação

- [ ] Após integrar este PLAN e CI verde, atualizar684 por merge da main; BUILD somente allowlisted. Executar controlador Analisar em nova sessão auditor/read-only, com base viva explicitamente conferida pelo orquestrador antes/depois enquanto3.1.3 estiver instalada. Não repetir auditoria válida sem delta.
- [ ] Ler parecer/metadados/hashes; tratar integralmente achados. Somente PASS atual permite preparar review; solicitar autorização humana específica para cada decisão formal concreta, sem reutilizar a autorização682. Conferir conta elegível, commit_id, checks, refs e merge protegido, sem bypass/reescrita.
- [ ] Confirmar main/readback/checks pós-merge; instalar apenas bytes aprovados em NOVA release local `scripts/releases/auditoria-v3_1_4-20261115`, backup único do instalado e manifesto. Conferir três instalados contra fontes (runner permanece byte-idêntico). Não apagar versões/runs. Provar Verificar/Preparar/Analisar operacionais sobre PR elegível; base obsoleta deve bloquear, nunca representar PASS.
- [ ] Registrar integração/instalação final em checkpoint pelo fluxo documental protegido. Só então retomar679 com escopos próprios. Não declarar instalação integral por43 testes antigos ou por existir arquivo instalado.

## Gate técnico, visual e rollback

Validação técnica nominal: causa/RED, fonte normativa atual, escopo fechado, segurança/segredos/isolamento, NFRs pertinentes, testes, CI, auditoria separada, histórico e rollback PASS para publicar este PLAN documental. CI/auditoria/review/merge deste PLAN ainda PENDENTES até prova real. Sem gate prévio integrado, BUILD NO-GO. Sem UI, BRAND-01 não requer aceite visual; nenhuma aprovação de backend/PROD é concedida.

Baseline visual preservado da main; matriz1440/1280/768/390 × claro/escuro e estados loading/empty/error/success: N/A por nenhum src/public/UI alterado. Não declarar Teste C funcional por steps SKIPPED. Economia Lovable CONFORME: GitHub/CLI diretos, sem editor/build Lovable ou backend. Rollback por nova PR limitada ao pacote, mantendo base viva manual obrigatória enquanto houver rollback local; recuperar backup somente após verificar hashes/versão, sem sobrescrever relatórios ou versões. Falha nova reabre RCA; duas tentativas sem solução exigem análise ampliada.

ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE (OBRIGATÓRIO)
Marca: ContaOS Brand v1.0 / BRAND-01; ler 19_IDENTIDADE_VISUAL_OFICIAL_BRAND_1_0.md e 20_PROMPT_000_BRAND_01.md para qualquer alteração frontend. Preservar assets oficiais, ContaOSMarca, Design System e tokens (REUTILIZAR > ESTENDER > CRIAR), componentes e estados; sem hardcodes, redesign ou bibliotecas paralelas. PLAN deve informar baseline visual, riscos e matriz de aceite; BUILD deve manter consistência; TESTE/TESTE C devem provar 1440/1280/768/390 nos temas claro/escuro, acessibilidade, marca e estados, sem alterações durante Teste C. Se prompt não envolver frontend, declarar impacto visual N/A justificado e garantir ausência de alteração visual.
Economia Lovable: checar turno/estado/commit antes de enviar; usar GitHub e Supabase diretamente quando possível; consolidar instruções; executar o menor delta; reutilizar testes/evidências válidos; não reenviar turno pendente nem duplicar builds/scans; nunca pular aprovação humana obrigatória, TDD, segurança, CI, Zero-Drift, fidelidade ao PRD, validação visual ou Teste C separado.
Entregar evidências e classificar: IDENTIDADE VISUAL PASS/FAIL/NÃO VERIFICADO/N/A; ECONOMIA LOVABLE CONFORME/NÃO CONFORME; ZERO-DRIFT PASS/FAIL. Sem prova não declarar PASS.
