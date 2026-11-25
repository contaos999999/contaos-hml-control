# BUILD F3 — reaplicação sob PLAN #753

PLAN integrado: 0e85c23cb256c28914cc17b159258ab77f0edd75. RED comprovado: 308e9cd0952b9cc40b981d46bbc144f38677da9a, CI 45527094754. Fonte: PR #748 HEAD 489924b41c2f555ccdb76d152d9dc327dfd97fd2. Reaplicação em DRAFT, sem certificação. Prettier temporário somente para obter formatação a versionar; obrigatória nova execução imutável e regressão antes do merge.

## RCA operacional Node 24
CI 45527777125 comprovou PASS_CODE novamente e diagnosticou ERR_INVALID_FILE_URL_HOST no CLI do próprio guard quando importado por seu arquivo de teste sob isolamento none. RED original mantido; GREEN executa a mesma cobertura por teste nominal no arquivo funcional, que importa o executor e registro. Não altera guard nem relaxa prova. CI do novo HEAD ainda exigido.
