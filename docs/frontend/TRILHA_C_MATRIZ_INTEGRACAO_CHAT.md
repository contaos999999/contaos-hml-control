# Trilha C — Matriz de integração, lacunas e critérios de aceite (P0)

**Baseline verificado:** frontend `f14f8ff1eaf49bf883d3ca4da9a05a3d926ab92b` (PR #375 integrada); backend `ebda39d15e7f7bcb4170b091487b275b56670ac4`. Escopo: HML, sem PROD. **Situação: INVENTÁRIO ESTÁTICO; sem certificação funcional.**

## 1. Inventário estático da árvore `src/routes`

| Grupo | Arquivos de rota | Transições obrigatórias a provar |
|---|---|---|
| Acesso | `index`, `login`, `esqueci-senha`, `redefinir-senha`, `selecionar-organizacao` | Login, reset, seleção e retorno seguro |
| Contratantes | `contratantes`, `contratantes_.novo`, `contratantes_.$id.editar` | Listar → criar → editar → listar; negativas RBAC |
| Contratos | `contratos`, `contratos_.novo`, `contratos_.$id` | Listar → criar → detalhe; contexto org |
| Submódulos contrato | `contratos_.$id_.base-normativa`, `contratos_.$id_.competencias`, `contratos_.$id_.competencias_.nova`, `contratos_.$id_.documentos`, `contratos_.$id_.documentos_.$idDocumento`, `contratos_.$id_.historico`, `contratos_.$id_.historico_.importar`, `contratos_.$id_.orcamento`, `contratos_.$id_.regras` | Contrato → cada submódulo → voltar; IDs válidos e negados |
| Competência | `competencias_.$id`, `competencias_.$id_.analise`, `competencias_.$id_.apresentacoes_.$apresentacaoId`, `competencias_.$id_.apresentar`, `competencias_.$id_.documentos`, `competencias_.$id_.parecer` | Competência → documentos → análise → parecer → apresentação → protocolo |
| Administração | `administracao.usuarios`, `administracao.auditoria` | Somente perfis autorizados, trilha auditável |
| Shell | `__root` | AppShell, sidebar, helper org/status, foco e rota ativa |

**Contagem comprovada:** 28 arquivos TSX de rota, incluindo `__root.tsx`; 27 arquivos TSX de páginas. Essa contagem é de arquivos, não comprovação de 27 telas funcionalmente acessíveis. Não modificar `routeTree.gen.ts` manualmente.

## 2. Lacunas objetivas

- **C-CHAT-001 — BLOCKED:** nenhuma rota/componente de chat nomeado e nenhuma migração/Edge de chat contextual identificada na árvore dos dois repositórios. A migração `0021_mensagens_ptbr_amigaveis.sql` não prova chat.
- **C-NAV-001 — NÃO VERIFICADO:** cada CTA, link, breadcrumb, edição, desativação e exclusão de todas as 27 páginas deve ser exercitado no navegador, inclusive refresh e back.
- **C-CTX-001 — NÃO VERIFICADO:** propagação e troca de organização, contrato, competência e documento; invalidar contexto obsoleto sem vazamento.
- **C-RBAC-001 — NÃO VERIFICADO:** MASTER e demais perfis em HML, permissões efetivas no backend, negações, cross-tenant, IDOR e RLS.
- **C-UX-001 — NÃO VERIFICADO:** responsividade, teclado, contraste, foco, estados vazios, erros e carregamento.
- **C-CHAT-002 — BLOCKED:** contrato de dados, autenticação, persistência, retenção, fonte autorizada, rate limit, auditoria e custos de IA precisam de PLAN validado antes do BUILD.
- **C-CI-001 — PENDENTE:** CI, deploy HML rastreável, teste independente C e SHA256 por caso, com revisão humana.

## 3. Contrato mínimo de chat a validar na fonte canônica

- `thread`: ID, organization_id, contract_id opcional, competencia_id opcional, owner_user_id, timestamps, status e política de retenção.
- `message`: thread_id, author, texto, fontes/evidências permitidas, status, modelo/versão, tokens/custo e trilha de auditoria. Nunca expor segredos ou raciocínio interno.
- **Autoridade exclusiva:** JWT + vínculo efetivo + RLS + autorização de RPC/Edge; toda consulta é filtrada por tenant e contexto real, não por texto enviado pelo usuário.
- **Ações:** chat pode sugerir navegação e operações; CRUD/aprovação só via endpoints canônicos, validação de payload, idempotência, confirmação explícita quando exigida e log.
- **Segurança:** negar cross-tenant, prompt injection de anexos, enumeração de recursos, XSS, SSRF, abuso de ferramentas, replay e uploads maliciosos.
- **Experiência:** acesso contextual a partir de cada tela sem duplicar logomarca, com histórico, erro/retry, limites de tamanho e acessibilidade.
- **Migrações:** aditivas, reversíveis, com teste negativo de RLS e isolamento; nenhuma mudança em workers ou migrations já certificadas sem justificativa.

## 4. Plano de execução e GATE

1. Confirmar esta matriz com PR/CI; confrontar o PRD e a arquitetura canônica, em especial requisitos de chat e governança de mudanças.
2. Produzir contratos SQL/RPC/Edge + testes RED, revisão independente, aprovar PLAN; apenas então implementar backend em PR separado.
3. Implementar componente de chat e pontos de integração na shell/rotas, com testes RED/GREEN e PRs de escopo mínimo.
4. Executar 27 páginas, matriz de navegação/CRUD, perfis, organização, conversa persistida, negativas e regressões A/B em HML.
5. Recolher HEADs, jobs, artifacts, screenshots, hashes e SQL de cleanup. Certificação C só com 100% dos casos mandatórios PASS, nenhum SKIP convertido em PASS.

**Bloqueio formal:** este documento não atesta execução HML, nem valida chat implementado. A Trilha B permanece certificada apenas no escopo registrado no GATE #138; não reinterpretar como aprovação automática da Trilha C.
