# Instalação da auditoria automatizada — BUILD3.1.3

PLAN PR681 integrado com CI verde antes deste código. Pacote em scripts/auditoria;43 testes offline locais e workflow Windows complementar, sem mudanças nas proteções existentes. Manifesto e evidências em docs/frontend/auditorias/instalacao-automatizada-v3_1.

PENDENTE: CI deste HEAD, revisão final independente, aceite operacional e integração protegida. A instrução persistente AGENTS veio do PLAN. Nenhum código da aplicação, backend, types.ts ou PROD alterado; PR679 permanece separada. Nenhuma aprovação formal é emitida automaticamente.

Emenda de segurança do bootstrap: somente binários diretos Node/Bun fixados por URL/SRI e SHA256, lockfile local exato, npm ci --ignore-scripts com configurações vazias e ambiente mínimo. Nenhum lifecycle de terceiros é executado; os quatro novos negativos complementam os39 casos originais (total43). Aceite operacional da emenda ainda pendente.

## Validação operacional 3.1.3 antes da publicação

Preparar concluído na execução PR679/20261115T041531019Z-9c0ed0f0ddfc-273f0e683f7e4709b2aa07176d9b1cf8: Node24.22.3, Bun1.4.4, ferramentas diretas com SRI/SHA256 verificados antes do uso, npm ci sem lifecycle, dependências congeladas, snapshot autenticado e25 fontes canônicas. Worktree limpa e types blob8ea7750b75fd9d76b29c36ce7613392e3ab65e19. preparation.json SHA256800799aac9f954978be6c13551d77f515e564143622a0df5801cbc1f655d8f0d. Verificar também executado com identidade contaos9999. Esta preparação não corrige nem certifica PR679.

Revisor separado /root/revisao_build680_luna emitiu PASS técnico local dos12 caminhos no base c6b6847f708e05340893aac089418b4076bcd1b2. Conferiu log43, seus hashes e fechamento do bootstrap; não executou testes nem publicou review. CI e auditoria automatizada do HEAD publicado permanecem pendentes.
