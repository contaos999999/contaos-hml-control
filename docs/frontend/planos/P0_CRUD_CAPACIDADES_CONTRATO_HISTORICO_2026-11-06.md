# P0 CRUD: capacidades efetivas de criação de contrato e histórico

Delta do plano único de operações, autorizado pelo titular em 06/11/2026. Organização ativa, IDs e escopo exatos continuam obrigatórios. Backend RLS/RPC é autoridade: consultar_permissoes_efetivas devolve contratos/criar no contexto organizacional e historico/criar no contrato. Exigir temPermissao; MASTER sem vínculo local não é bloqueado por ausência de perfil. Não confiar em claim master, nome de perfil, menu ou array local. Não dispensar segregação canônica final.

Caminhos fechados: src/components/contratos/NovoContrato.tsx, src/components/contratos/ImportarHistorico.tsx, src/test/novoContrato.test.tsx e src/test/ingestaoHistorico.test.tsx. Nenhuma mudança dos adapters de negócio, INSERT RLS contrato, geração de recurso/snapshot/auditoria no servidor ou pipeline de upload/registro/enfileiramento histórico. Sem backend, Auth, RLS, SQL, Edge, tipos, rota ou PROD.

Plano integrado com dois checks antes do RED/BUILD. TDD deve provar MASTER/capacidade sem perfil local, perfil local aparentemente autorizado com capacidade false negado, falha da RPC fecha acesso, organização inativa negada, contexto org/contrato divergente negado, consulta vinculada a usuário/org/contrato sem cache infinito e descarte de resposta tardia. Preservar todas regressões de criação e ingestão, incluindo resultado incerto, segurança/documento e idempotência.

GREEN: suites-alvo, suíte completa, tsc, build, tipos blob8ea7750b75fd9d76b29c36ce7613392e3ab65e19, dois checks no HEAD final, revisão independente. Teste C público não prova sessão privada. Rollback reverte gate de UI; não altera dados. Não constitui certificação V1/CRUD global nem resolve upload/worker reais.

## ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE
Sem alteração visual deliberada, reutiliza carregamento/erro/negativa existentes. Sem BUILD Lovable; mantém marca única/sidebar, componentes e tokens. Economia não dispensa provas.
