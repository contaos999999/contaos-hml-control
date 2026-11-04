# PROMPT 41 / V1-20 — Validação técnica do planejamento

Data 04/11/2026. Baseline frontend main@da25913f106311e812cdb05dc2bbfc68fec22aba. Fonte normativa develop/main@a10d3b1a1a14276c017027f93ec2a7aace4d6cb6.

## Fontes conferidas
Texto original do regular 41, SHA-256 8a15d96568d021ac86fdd45e79038e2cb969d69c12b2edb84f012a6129b8940e, em docs/frontend/fontes/PROMPT_41_V120_TEXTO_ORIGINAL_VERIFICADO_2026-11-04.md. Caderno 000–096 original SHA-256 d9faaae47de4b697b18ad7fb71e4738384514936813cd5b18779f4cb8aed83b8. Auditoria individual 97/97 em docs/frontend/auditorias/PROMPT_41_V120_CROSSWALK_97_ATOMICOS_2026-11-04.md. Fonte 25/25 na verificação anterior. Tipos certificados blob 8ea7750b75fd9d76b29c36ce7613392e3ab65e19.

## Decisão humana aplicável
O teste operacional HML de RLS entre organizações com usuários A/B foi postergado em caráter facultativo para depois do prompt regular 99. A evidência permanece NÃO VERIFICADA e não bloqueia por si só PLAN/GATE/BUILD frontend 41–99. Decisão documentada no PR #49. Segurança de implementação, prevenção IDOR e isolamento lógico continuam obrigatórios.

## GATEs de PLANEJAMENTO
- PRD/premissas/arquitetura e regular original: PASS documental.
- Mapeamento 97 atômicos e BRAND-01: PASS de aplicabilidade, não PASS funcional integral.
- Contrato de leitura: PASS estrutural para apresentacoes_contratante, pacotes_competencia, itens_pacote_competencia.
- Segurança de desenho: PASS planejado com auth, filtros id_organizacao/id_contrato/id_competencia/id_pacote, RLS como autoridade, sem alterar backend nem calcular status localmente.
- RLS real A/B: NÃO VERIFICADO, facultativo pós-99, não bloqueante nesta fase.
- Responsividade e acessibilidade: PASS de planejamento, Teste C exigido no BUILD.
- TDD, regressão, lint, TS, build e evidências: PASS de planejamento, execução exigida após BUILD.
- CI documental final: PENDENTE até dois checks concluídos; sem PASS antecipado.

## ALLOWLIST FECHADA PARA BUILD V1-20
- src/lib/competencias/protocoloDados.ts
- src/components/competencias/CompetenciaProtocolo.tsx
- src/routes/competencias_.$id_.apresentacoes_.$apresentacaoId.tsx
- src/test/competenciaProtocolo.test.tsx
- src/routeTree.gen.ts (somente geração determinística do TanStack)
- scripts/testc/visual-audit.mjs
- scripts/testc/visual-audit.test.mjs
- src/test/brand.test.tsx (apenas se a matriz visual exigir)
- docs/frontend/auditorias/PROMPT_41_V120_TESTES_2026-11-04.md
- docs/frontend/ESTADO_E_RETOMADA_CONTAOS_4_1.md

Não alterar src/integrations/supabase/**, backend, Supabase HML/PROD, Auth, RLS, migrações, RPCs, Storage, CSS global, brand, dependências ou wizard V1-19 nesta tarefa.

## Contrato de BUILD
Rota /competencias/:id/apresentacoes/:apresentacaoId, exclusivamente leitura. Validar UUID da competência e apresentação e sessão do usuário. Usar organização preferida, visão geral oficial e validar tenant/contrato. Buscar apresentação filtrada por UUID, competência, organização e contrato; buscar pacote por id_pacote oficial e mesmos escopos; buscar itens congelados filtrados pelo pacote e escopos, paginados. Jamais reconstruir pacote a partir de documentos atuais. Não expor metadados arbitrários nem gerar URL/endpoint não certificados. Backend mantém autoridade de acesso e situação.

## Testes obrigatórios
TDD RED/GREEN; 401/403 != 404 ou vazio; org cruzada, UUID inválido, pacote inexistente, resposta inconsistente, network error, abort por troca de rota, paginação segura, ausência de update/RPC de mutação, PT-BR e datas America/Sao_Paulo. Check BRAND-01 com ContaOSMarca/tokens, 1440/1280/768/390 e temas claro/escuro, foco/teclado. Matriz Teste C prevista 26 × 4 × 2 = 208 cenários, protegidos sem sessão real explicitamente NÃO VERIFICADOS. CI dois checks no SHA exato; nada de confundir Playwright SKIP documental com visual PASS.

## Decisão
PLAN com escopo e gates técnicos revisados. A liberação formal depende de CI verde no HEAD documental e de GATE em PR separado com PLANO_ATIVO 41 VALIDADO antes de qualquer BUILD. Rollback por PR específico sem editar dados existentes.
