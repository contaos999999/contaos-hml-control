# PROMPT 43 / V1-22 — prova de recuperação da fonte original

Data: 04/11/2026. **Aditivo documental ao PR #67; não é PLAN validado, GATE ou BUILD.**

## Proveniência verificável
Pacote da biblioteca do titular: `ContaOS_Pacote_Mestre_Arquitetura_4_1_100_PRD_Lovable_Supabase_BRAND_v1_0_FINAL.zip`. Arquivo interno `06_PROMPTS_COPIAR_COLAR/Manual_Mestre_Prompts_4_1_100_PRD.docx` (dentro da pasta raiz do pacote).

SHA-256 extraído e calculado sobre os bytes originais: `8a15d96568d021ac86fdd45e79038e2cb969d69c12b2edb84f012a6129b8940e`, **igual** ao hash certificado em `docs/frontend/governanca/P0_ORDEM_POR_VERSAO_4_1.json`.

Caderno original `Caderno_97_Prompts_Atomicos_000_096_PRD_BRAND_v1_1.docx`: SHA-256 `d9faaae47de4b697b18ad7fb71e4738384514936813cd5b18779f4cb8aed83b8`, igual ao hash certificado P0.

## Requisito original 43: resumo fiel de escopo
- Nome: **PROMPT 43 — V1-22 — Ingestão de histórico**.
- Rota: `/contratos/:id/historico/importar`.
- Acesso: **gestão**.
- Backend autorizado: **Storage privado + tabelas de versões + Queues**.
- Pré-condição expressa: a operação Supabase do PLAN deve **existir e estar autorizada**; se faltar tabela/RPC/Edge, declarar **LACUNA DE BACKEND** e parar, sem criar alternativa.
- PLAN obrigatório antes de BUILD: arquivos exatos, operações de backend existentes, componentes, loading/empty/success/denied/error/processing quando aplicável, responsividade 1440/1280/768/390, teclado/foco/labels/status e testes.
- BUILD restrito ao plano aprovado e cliente Supabase existente; sem secrets, backend paralelo, update direto de status crítico ou alteração de layout global/auth fora de escopo.
- TESTE original exige rota, acesso autorizado, negação efetiva pelo backend/RLS, estados, ausência de segredo, proteção de ações críticas, quatro larguras, acessibilidade, console sem dados sensíveis e security scan sem novo Critical. **Não corrigir automaticamente após teste; relatar evidências.**

## Crosswalk e condição para execução
O catálogo normativo vincula 43 aos atômicos `000,006,007,008,009,010` e IDs `V1-HIS-001..005`. A extração do caderno confirmou hash original, mas ainda é necessário transcrever e confrontar **integralmente** os requisitos atômicos e NFR antes de PLAN validado. Inspecionar contratos **frontend** e evidências existentes, sem acessar/mudar backend/HML sem autorização específica se identificada lacuna.

## Ordem P0 / sidebar
43 → 75 → correção transversal da sidebar issue #66, **sujeita a PLAN e autorização específica**, → auditoria retrospectiva e certificação V1. Nenhum BUILD de sidebar embutido no 43.

**Status:** fonte original recuperada e hash confirmado; contratos de Storage/Queue, plano completo e CI **NÃO VERIFICADOS**. Sem permissão para BUILD neste documento.
