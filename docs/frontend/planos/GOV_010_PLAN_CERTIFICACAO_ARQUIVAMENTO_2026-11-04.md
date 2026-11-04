# GOV-010 — PLAN de certificação técnica de arquivamento (04/11/2026)

## PROMPT e escopo
Solicitação do titular: **"Certifique o arquivamento"** dos artefatos GOV-002/GOV-007 de Teste C. A certificação deve provar a existência e integridade atual de arquivos recuperados do armazenamento, sem alegar imutabilidade, retenção indefinida, assinatura eletrônica ou política institucional não demonstrada.

**Frontend baseline:** `contaos999999/contaos-hml-control`, main `4b148a22c23a16ce909652bf519d9cb12c753cc1`. **Backend normativo:** sem alterações. Esta é tarefa **somente documental**.

## Evidência material já produzida
- Os dois ZIPs foram recuperados diretamente da Biblioteca persistente `/ContaOS/Evidencias/Teste-C/` via identificadores de arquivo retornados pela Biblioteca, e remontados em armazenamento de trabalho para leitura independente.
- GOV-002, GitHub Action #41737621829: `ContaOS_TesteC_GOV002_41737621829.zip`, 2.155.587 bytes, SHA256 `06dd5aaa044053ae88dc60f9e84289b6b84089d6c080140e20a051c6d47b52ec`, 26 entradas ZIP, 24 screenshots, relatório e `SHA256SUMS` **25/25 válidos**. Biblioteca `libfile_f7da08c5c5f08191b60be4837666e291`.
- GOV-007, GitHub Action #41768441317: `ContaOS_TesteC_GOV007_WCAG_41768441317.zip`, 2.155.868 bytes, SHA256 `10d550b963a71adf08caed2bb5161dbde13a91c2f6d1d3ddf44559277570f89c`, 26 entradas ZIP, 24 screenshots, relatório e `SHA256SUMS` **25/25 válidos**. Biblioteca `libfile_6232ca4339f48191b5de4711779b898f`.
- Verificação independente do ZIP CRC sem erros; nenhum hash divergente.
- Atestado técnico (PDF A4 1 página) e manifesto JSON foram produzidos e arquivados no mesmo diretório da Biblioteca; PDF SHA256 `4a75bc2aba7930e7f8559d604cfedf957fc2c0d0c5805a2d6f33b12b30f776fc`, JSON SHA256 `0c7cd1875d16c85d01aec7b84d007a77824f7c6e41c3cad8697234ff3b10e97d`.
- Arquivos de atestado: `libfile_fbf3e1ae46ac8191900b04b43f38bf72` e `libfile_f257fce875f881918c3324f23058d2f9`.

## PLAN / BUILD documental limitado
Somente criar este PLAN e `docs/frontend/auditorias/GOV_010_ATESTADO_TECNICO_ARQUIVAMENTO_2026-11-04.md` em commits distintos, cada qual sujeito a CI conforme o protocolo. Registrar SHA-256, tamanho, fontes, caminhos e limites, **sem publicar arquivos ZIP ou informações privadas no repositório**. Não alterar `AGENTS.md`, checkpoint, qualquer arquivo `src/**`, `public/**`, `scripts/**`, `.github/**`, `supabase/**`, `types.ts`, backend HML ou PROD.

## Gates
- Fonte canônica/PRD/BRAND-01: inalterados.
- PLAN separado antes do relatório; CI do PLAN deve estar verde antes do segundo commit.
- Zero-Drift + escopo GitHub: obrigatório no PR.
- Teste C no PR somente documental: `N/A`, não evidência visual nova.
- Nenhuma aprovação humana de PR é exigida pelo ruleset, mas não se aplica permissão para dispensar validação documental.
- Liberação: dois checks obrigatórios `SUCCESS`, merge sem bypass.

## Limites da atestação
Comprova **presença, recuperação, integridade ZIP e correspondência aos hashes** na data da leitura. Não comprova assinatura eletrônica, WORM, garantia por prazo indefinido, backup/restore, cadeia de custódia independente ou controles formais de ACL/retention. O GOV-007 mantém contraste incompleto e HML não homologado; arquivamento não sana testes funcionais.

## ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE
Nenhuma mudança de marca, tokens, componentes, UI, rotas, dados ou backend. GitHub como fonte de documentação; Lovable sem BUILD; não converter `N/A` em `PASS`.
