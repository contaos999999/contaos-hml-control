# Revisão independente — instalação3.1

Agente auditor Luna /root/revisao_instalacao_luna, contexto novo, somente leitura. Passada completa apontou herança do ambiente no runner; corrigida com allowlist e teste real de subprocesso. Segunda passada confirmou aplicação da allowlist, remoção de tokens, NODE_OPTIONS e desconhecidas, preservação de PATH/CODEX_HOME. Sem outro bloqueador comprovado. Não executou testes nem publicou review formal.

A revisão anterior de /root/revisao_controlador_v3 foi interrompida por limite de uso; seu achado de associação CheckRunID/JobID foi tratado por URL validada e testes com IDs distintos. Não atribuir PASS à revisão interrompida.

Resultados de testes completos são do executor, registrados nos logs desta release. Revisão local não é certificado de produto nem aprovação humana/APPROVE GitHub.

Emenda3.1.1: auditor Luna emitiu PASS técnico local após revisar validação prévia integral dos quatro fixtures e sincronização limitada do índice, com cached diff vazio antes/depois. Nenhum outro bloqueador encontrado no delta. Inspecionou testes;38 resultados completos são execução do orquestrador, não do revisor.

Emenda3.1.2: revisão Luna confirmou override opcional por argv, validação segura do parâmetro, cópia da configuração e manutenção read-only. PLAN documental recebeu PASS técnico após fechar allowlist, proveniência e contagem39, sem review formal.

O diff publicado e o workflow complementar ainda exigem revisão final e CI próprios. Não atribuir a este documento APPROVE formal nem certificação de produto.

Revisão final de diff apontou bootstrap npm com herança de ambiente e lifecycle. Emenda3.1.3 acima corrige a classe antes de publicar. Revisão do delta e execução operacional ainda pendentes; não atribuir PASS à revisão interrompida ou à versão anterior deste delta.

## Validação operacional 3.1.3 antes da publicação

Preparar concluído na execução PR679/20261115T041531019Z-9c0ed0f0ddfc-273f0e683f7e4709b2aa07176d9b1cf8: Node24.22.3, Bun1.4.4, ferramentas diretas com SRI/SHA256 verificados antes do uso, npm ci sem lifecycle, dependências congeladas, snapshot autenticado e25 fontes canônicas. Worktree limpa e types blob8ea7750b75fd9d76b29c36ce7613392e3ab65e19. preparation.json SHA256800799aac9f954978be6c13551d77f515e564143622a0df5801cbc1f655d8f0d. Verificar também executado com identidade contaos9999. Esta preparação não corrige nem certifica PR679.

Revisor separado /root/revisao_build680_luna emitiu PASS técnico local dos12 caminhos no base c6b6847f708e05340893aac089418b4076bcd1b2. Conferiu log43, seus hashes e fechamento do bootstrap; não executou testes nem publicou review. CI e auditoria automatizada do HEAD publicado permanecem pendentes.
