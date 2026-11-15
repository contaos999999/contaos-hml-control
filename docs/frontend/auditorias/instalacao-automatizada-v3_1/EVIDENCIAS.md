# Evidências da instalação — BUILD3.1.3

PLAN protegido: PR681, HEAD203483271e118f7b3541bd0d56734d823fda1567; merge5bbadb225b52f71b1a8383f36b63e3ede9e11a2d. Checks do PLAN: Zero-Drift, Teste C administrativo, P0-NR e LOCK SUCCESS. Revisão técnica independente Luna; nenhuma review formal foi publicada por IA.

Pacote em preparação3.1.3:43 testes reais aprovados (19 PowerShell,7 runner,17 preparação), log do pacote3.1.3 executado pelo orquestrador, transcrito abaixo com origem e SHA256. Includes processo filho real sem credenciais/injeção, Git real com EOL/índice, modelo Luna opcional sem mudar perfis, provenance SHA/base e gate skipping. Hashes dos arquivos publicados no MANIFEST.json; o CI próprio repete as três suites offline no Windows sem segredos de backend.

Preparação operacional3.1.1 realizada na PR679/head9c0ed0f0ddfc0fc91512dff2e290e0a8d6826c71, execução20261115T032236018Z-9c0ed0f0ddfc-8d073e7ddedb48c4b615398b695035b2. Snapshot autenticado7 checks/7 jobs e25 documentos canônicos, hashes verificados, Node24.22.3/Bun1.4.4, dependências congeladas, árvore limpa e types8ea7750b75fd9d76b29c36ce7613392e3ab65e19. Essa execução não é auditoria HML do produto.

Nova execução do controlador3.1.2 no PLAN681 com ModeloAuditor gpt-6-luna foi iniciada pelo orquestrador após checks verdes, sem comando manual de auditoria adicional. Perfil auditor em read-only, ambiente OS em allowlist e snapshot antes do modelo; não alterar perfis globais. O parecer final e seu hash devem ser conferidos antes da integração do BUILD.

Aplicação, marca, rotas, backend e PROD não mudam. Teste C visual/E2E é N/A para este delta administrativo e não é certificado por step SKIPPED. Reviews formais e confirmações APROVAR/SOLICITAR continuam humanas, com identidade distinta do autor. Nenhum merge é executado pelo controlador.

Estado do BUILD: CI/revisão/aceite e integração ainda PENDENTES. Nenhum achado da PR679 foi corrigido por esta instalação; retomá-la somente após encerrar a instalação.

Emenda de segurança do bootstrap: somente binários diretos Node/Bun fixados por URL/SRI e SHA256, lockfile local exato, npm ci --ignore-scripts com configurações vazias e ambiente mínimo. Nenhum lifecycle de terceiros é executado; os quatro novos negativos complementam os39 casos originais (total43). Aceite operacional da emenda ainda pendente.

## Log real dos43 casos do pacote3.1.3

Origem local: `C:\Users\ediva\AppData\Local\Temp\contaos-auditoria-v3_1-20261115\tests-published-package-313.log`; SHA256 bruto `b503c13b61148b62b2c54afae696de5a035573f35469b1c4b4ea1fb854e34449`. Executado pelo orquestrador; o revisor não executou estes testes. A transcrição é textual com LF canônico; CI próprio ainda pendente no SHA do BUILD.

```text
PASS gate NR-004 rejeita skipping no predicado real
PASS wrapper Git chama executavel nativo sem recursao
PASS funcao Assert-RequiredChecks existe
PASS funcao New-AuditRun existe
PASS funcao Write-NewJson existe
PASS funcao Get-AuditRun existe
PASS rejeita bucket skipping
PASS rejeita bucket fail
PASS rejeita bucket pending
PASS rejeita bucket cancel
PASS rejeita bucket unknown
PASS rejeita bucket
PASS rejeita checks vazios
PASS aceita somente pass
PASS rejeita mistura pass e skipping
PASS duas execucoes preservam metadados anteriores
PASS CreateNew rejeita sobrescrita e preserva bytes
PASS RunId rejeita traversal
PASS RunId explicito resolve somente execucao existente
RESULTADO: 19 PASS; 0 FAIL

test_exclusive_output_never_overwrites (__main__.RunnerTests.test_exclusive_output_never_overwrites) ... ok
test_explicit_luna_override_preserves_profile_and_read_only (__main__.RunnerTests.test_explicit_luna_override_preserves_profile_and_read_only) ... ok
test_loads_installed_bom_profile_and_unicode (__main__.RunnerTests.test_loads_installed_bom_profile_and_unicode) ... ok
test_real_child_does_not_inherit_secret_or_node_injection (__main__.RunnerTests.test_real_child_does_not_inherit_secret_or_node_injection) ... ok
test_rejects_missing_instructions (__main__.RunnerTests.test_rejects_missing_instructions) ... ok
test_rejects_unknown_profile_options (__main__.RunnerTests.test_rejects_unknown_profile_options) ... ok
test_rejects_writable_profile (__main__.RunnerTests.test_rejects_writable_profile) ... ok

----------------------------------------------------------------------
Ran 7 tests in 0.168s

OK

test_actions_job_comes_from_url_not_check_id (__main__.PreparationTests.test_actions_job_comes_from_url_not_check_id) ... ok
test_actions_url_rejects_another_repo_or_host (__main__.PreparationTests.test_actions_url_rejects_another_repo_or_host) ... ok
test_binary_tampering_is_detected_before_execution (__main__.PreparationTests.test_binary_tampering_is_detected_before_execution) ... ok
test_bootstrap_uses_ci_ignore_scripts_and_empty_config_paths (__main__.PreparationTests.test_bootstrap_uses_ci_ignore_scripts_and_empty_config_paths) ... ok
test_check_snapshot_rejects_other_sha_and_incomplete_page (__main__.PreparationTests.test_check_snapshot_rejects_other_sha_and_incomplete_page) ... ok
test_closed_or_draft_pr_is_rejected (__main__.PreparationTests.test_closed_or_draft_pr_is_rejected) ... ok
test_locked_types_and_app_sources_are_not_materialized (__main__.PreparationTests.test_locked_types_and_app_sources_are_not_materialized) ... ok
test_material_difference_is_rejected (__main__.PreparationTests.test_material_difference_is_rejected) ... ok
test_material_difference_is_rejected_before_any_write (__main__.PreparationTests.test_material_difference_is_rejected_before_any_write) ... ok
test_metadata_cannot_be_overwritten (__main__.PreparationTests.test_metadata_cannot_be_overwritten) ... ok
test_only_canonical_eol_difference_is_accepted (__main__.PreparationTests.test_only_canonical_eol_difference_is_accepted) ... ok
test_pr_lifecycle_scripts_are_not_executed_by_preparation (__main__.PreparationTests.test_pr_lifecycle_scripts_are_not_executed_by_preparation) ... ok
test_pr_snapshot_rejects_different_head_or_base (__main__.PreparationTests.test_pr_snapshot_rejects_different_head_or_base) ... ok
test_preparation_environment_drops_credentials_and_injection (__main__.PreparationTests.test_preparation_environment_drops_credentials_and_injection) ... ok
test_real_git_index_stays_clean_after_canonical_checkout (__main__.PreparationTests.test_real_git_index_stays_clean_after_canonical_checkout) ... ok
test_tool_lock_pins_only_direct_binary_packages_and_integrities (__main__.PreparationTests.test_tool_lock_pins_only_direct_binary_packages_and_integrities) ... ok
test_tool_versions_are_explicit (__main__.PreparationTests.test_tool_versions_are_explicit) ... ok

----------------------------------------------------------------------
Ran 17 tests in 0.844s

OK

```

## Validação operacional 3.1.3 antes da publicação

Preparar concluído na execução PR679/20261115T041531019Z-9c0ed0f0ddfc-273f0e683f7e4709b2aa07176d9b1cf8: Node24.22.3, Bun1.4.4, ferramentas diretas com SRI/SHA256 verificados antes do uso, npm ci sem lifecycle, dependências congeladas, snapshot autenticado e25 fontes canônicas. Worktree limpa e types blob8ea7750b75fd9d76b29c36ce7613392e3ab65e19. preparation.json SHA256800799aac9f954978be6c13551d77f515e564143622a0df5801cbc1f655d8f0d. Verificar também executado com identidade contaos9999. Esta preparação não corrige nem certifica PR679.

Revisor separado /root/revisao_build680_luna emitiu PASS técnico local dos12 caminhos no base c6b6847f708e05340893aac089418b4076bcd1b2. Conferiu log43, seus hashes e fechamento do bootstrap; não executou testes nem publicou review. CI e auditoria automatizada do HEAD publicado permanecem pendentes.
