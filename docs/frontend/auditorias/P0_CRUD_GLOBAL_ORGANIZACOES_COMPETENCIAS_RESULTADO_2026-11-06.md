## CHECKPOINT PRIORITÁRIO — CRUD GLOBAL — 06/11/2026
**Prioridade expressa do titular: CRUD global em todo o sistema, conforme ações permitidas pelo backend/PRD.**
Frontend integrado antes deste checkpoint: `cd13443bc26ba48482f35c709cef5fb3ee313963`. Backend de referência: `c530fca558e4ce3e3c2cce4cabb660b1ccc05f97`.
**CRUD GLOBAL NÃO CONCLUÍDO. V1 NÃO CERTIFICADA. V2 e PROD permanecem bloqueados.**

### Entregas novas comprovadamente integradas
- PLAN237 integrado `cb6bfd3e410d418643535d68f8760ece16f9172c`, HEADf014dbf3 com dois checks SUCCESS.
- BUILD238 integrado `af23f3afa87e6331573f4870e22a58bcddfe8b1f`, HEAD`65161aee63b455f41aa2b6f22cf828235628425c`, workflow42307438846 dois checks SUCCESS. Formulário de criação de organizações no seletor e caminho do login sem organização. Chama criar_organizacao existente; Supabase cria organização/vínculo/recurso/auditoria. Confirma UUID, recarrega lista e exige Continuar antes de gravar preferência/navegar. Sem restrição MASTER inventada: regra canônica exige sessão ativa. RED11falhas/15PASS; GREEN48/48; regressão961/961. Tsc/build/lint dos3arquivos novos/ZeroDrift/GOV020 PASS.
- PLAN239 integrado `98adc9e5602b8ff73483f8deb96c35580c6833fb`, HEADd9aa2999 com dois checks SUCCESS.
- BUILD240 integrado `cd13443bc26ba48482f35c709cef5fb3ee313963`, HEAD`1fa74eebab15b185918fdcbd16287559a4dadcaf`, workflow42308147045 dois checks SUCCESS. Criação de competência usa competencias/criar efetivo por organização/contrato, sem exigir vínculo local do MASTER; nega ID/org divergentes antes do formulário. Cache inclui contrato e não usa staleTime infinito. Preserva criar_competencia, snapshot e reconciliação de resultado ambíguo. RED6falhas/23PASS; GREEN29/29; regressão966/966 em38suítes. Tsc/build/ESLint sem regra de formatação/ZeroDrift/GOV020 PASS. Lint padrão legado não foi declarado limpo.
- Ambas as correções receberam revisão independente sem bloqueantes. Tipos preservados no blob8ea7750b75fd9d76b29c36ce7613392e3ab65e19, nenhuma rota nova/árvore editada manualmente e nenhum backend paralelo.

### Limites das provas e riscos remanescentes
Testes de código simulam a fronteira Supabase. O Teste C do CI é público/read-only; não prova funcionamento privado ou JWT real. Não houve criação/alteração de dados de negócio, DDL, RLS, Auth, Storage ou PROD nesta rodada; HML só foi consultado em catálogos/definições.
RPC criar_organizacao existente não recebe chave idempotente: frontend não repete automaticamente comando em resposta incerta, exige conferência da lista. Com organizações já existentes, Continuar pode navegar durante outra criação em andamento; a RPC pode concluir no servidor. Não afirmar que navegar cancela/rollback.
A criação de competência continua dependente das validações finais do backend. Esta correção não adicionou invalidação da lista após criação; comportamento anterior fica registrado como ponto de reconciliação.
A dívida de formatação dos arquivos legados permanece e as provas privadas/autenticadas ainda são NÃO VERIFICADAS.

### Próxima tarefa concreta, mantendo CRUD global como prioridade
1. Reconciliar criação de contratantes/contratos e ingestão de histórico, que ainda têm gates locais por perfil, com a autorização efetiva do backend e estados ativos. Não refazer237/238/239/240.
2. Implementar, por plano backend próprio e migration CLI, operações canônicas faltantes de edição/transição de contratos (issue develop89), preservando concorrência, auditoria e invalidação de portão. Não usar update crítico genérico pelo React nem inventar transição sem fonte.
3. Completar ciclo de vida de organizações (editar/ativar/desativar/excluir somente quando permitido) e as operações ausentes dos demais cadastros V1, por matriz entidade→ação→regra→RPC/API→perfil/contexto→teste.
4. Registrar ações proibidas explicitamente: eventos de auditoria e história imutável não ganham edição/exclusão. A existência de tabela/policy/função não concede CRUD.
5. Fazer prova privada de fluxos MASTER/perfis, upload/worker e demais requisitos V1 antes de certificar; certificado continua pendente. O navegador disponível não possuía sessão autenticada nesta execução.

### ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE
GitHub direto e RPCs existentes, sem BUILD Lovable. Componentes/tokens/BRAND preservados; sem mudança de schema, permissões ou tipos. Gates/TDD/revisões mantidos. Matriz visual privada4larguras×2temas ainda não comprovada.

---

