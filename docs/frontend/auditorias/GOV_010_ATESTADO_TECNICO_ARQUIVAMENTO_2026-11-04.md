# GOV-010 — Atestado técnico de arquivamento e integridade das evidências

**Data/hora da verificação:** 04/11/2026, 03h46 (UTC-03:00, America/Bahia).  
**Objeto:** pacotes independentes do Teste C para GOV-002 e GOV-007.  
**Estado:** **ARQUIVAMENTO PRESENTE E INTEGRIDADE COMPROVADA NO INSTANTE DA VERIFICAÇÃO**.  
**Ressalva obrigatória:** não é uma certificação de preservação indefinida, WORM, assinatura digital ou política institucional de retenção.

## 1. Fonte e localização

Ambos os ZIPs foram encontrados na Biblioteca persistente do ChatGPT, na pasta:

`/ContaOS/Evidencias/Teste-C/`

Os quatro arquivos abaixo tiveram presença confirmada por listagem direta da Biblioteca e o conteúdo foi reaberto/relido após o arquivamento:

| Arquivo | Biblioteca (ID estável) | Tamanho | SHA-256 |
| --- | --- | ---: | --- |
| `ContaOS_TesteC_GOV002_41737621829.zip` | `libfile_f7da08c5c5f08191b60be4837666e291` | 2.155.587 bytes | `06dd5aaa044053ae88dc60f9e84289b6b84089d6c080140e20a051c6d47b52ec` |
| `ContaOS_TesteC_GOV007_WCAG_41768441317.zip` | `libfile_6232ca4339f48191b5de4711779b898f` | 2.155.868 bytes | `10d550b963a71adf08caed2bb5161dbde13a91c2f6d1d3ddf44559277570f89c` |
| `ContaOS_Certificacao_Tecnica_Arquivamento_2026-11-04.pdf` | `libfile_fbf3e1ae46ac8191900b04b43f38bf72` | 47.880 bytes | `4a75bc2aba7930e7f8559d604cfedf957fc2c0d0c5805a2d6f33b12b30f776fc` |
| `ContaOS_Manifesto_Verificacao_Arquivamento_2026-11-04.json` | `libfile_f257fce875f881918c3324f23058d2f9` | 3.554 bytes | `0c7cd1875d16c85d01aec7b84d007a77824f7c6e41c3cad8697234ff3b10e97d` |

## 2. Procedimentos de auditoria executados

1. Consulta à pasta de Biblioteca retornou exatamente os dois ZIPs originais e os dois novos arquivos de atestação. Não houve aviso de listagem incompleta ou paginação pendente nessa pasta.
2. Ambos os ZIPs foram materializados a partir de seus IDs da Biblioteca, não a partir de um arquivo local antigo.
3. A comparação SHA-256 de cada ZIP contra o hash previamente registrado nas auditorias **foi idêntica**.
4. A integridade física de ZIP (CRC; `ZipFile.testzip()`) foi aprovada nos dois.
5. Cada ZIP contém **26 membros**: **24 screenshots PNG**, `relatorio.json` e `SHA256SUMS`. Cada um dos **25 hashes internos** foi recalculado e conferido: **25/25 válidos em ambos**. Zero ausências e zero divergências.
6. O relatório JSON GOV-002 indica `tested_sha=73f7834140c1338fba9e10b7168e36198f5d1177`, 184 combinações, 24 cenários públicos aprovados, 160 protegidos não homologados.
7. O relatório JSON GOV-007 indica `tested_sha=b1dbe5557d4ed5dbfd5965eb9bce94c91c3d1556`, 184 combinações, 24 públicos aprovados, 24 scans `axe-core`, zero regras com violação confirmada, 24 regras incompletas, 160 cenários protegidos não homologados. **Não transformar isso em certificação WCAG integral.**
8. O atestado PDF e o manifesto JSON foram enviados à mesma pasta, listados novamente, materializados novamente e comparados byte a byte por SHA-256 com seus arquivos de origem: **ambos idênticos**.

## 3. Proveniência

- Teste C GOV-002: GitHub Actions `41737621829` (link: https://github.com/contaos999999/contaos-hml-control/actions/runs/41737621829).
- Teste C GOV-007 com análise automática WCAG: GitHub Actions `41768441317` (link: https://github.com/contaos999999/contaos-hml-control/actions/runs/41768441317).
- Repositório privado: `contaos999999/contaos-hml-control`.
- Os arquivos binários e screenshots permanecem fora do código GitHub. Este relatório contém somente nomes, hashes, metadados e referências.
- O PDF foi renderizado e inspecionado como **uma página A4**, sem cortes de texto.

## 4. Escopo da certificação e pendências

| Objeto | Resultado |
| --- | --- |
| Existência dos quatro arquivos na Biblioteca no momento da verificação | **PASS** |
| Recuperação e identidade dos bytes originais | **PASS** |
| ZIP CRC, manifesto SHA256SUMS e conteúdo esperado | **PASS** |
| Rastreabilidade por IDs, runs, hashes e commits | **PASS** |
| Política formal de retenção e descarte aprovada pela organização | **NÃO COMPROVADA** |
| Imutabilidade/WORM e trilha inviolável contra exclusão | **NÃO COMPROVADA** |
| Backup independente, teste de restauração e acesso de terceiros | **NÃO COMPROVADOS** |
| Assinatura digital qualificada/atesto por auditor externo | **NÃO REALIZADOS** |
| Contraste WCAG integral e homologação HML A/B | **NÃO VERIFICADOS** neste registro |

**Conclusão delimitada:** a obrigação de demonstrar que os artefatos foram **arquivados de forma recuperável e que não sofreram alteração de conteúdo até o momento da inspeção** está tecnicamente atendida. Uma obrigação adicional de **preservação institucional permanente e imutável** demanda definição explícita de período de retenção, custódia, backups, ACL e revisão periódica. **Não declarar 100% de permanência institucional** sem tais evidências.

**Tipo de documento:** atestado técnico automatizado, sem assinatura digital, validade factual vinculada à data/hora e aos hashes indicados. Não é certificado de autoridade certificadora, laudo pericial externo nem assinatura da organização.

## 5. Governança do commit

Este documento é emitido sob o PLAN `docs/frontend/planos/GOV_010_PLAN_CERTIFICACAO_ARQUIVAMENTO_2026-11-04.md`, com CI do PLAN aprovado (run `41787940545`). Nenhum código da aplicação, backend, dados HML, PROD, Lovable ou `types.ts` foi modificado.
