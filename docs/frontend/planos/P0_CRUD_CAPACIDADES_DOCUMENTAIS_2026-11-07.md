# P0 CRUD V1 — capacidades de criação de contratantes e revisão documental

> Execução nativa nesta sessão, conforme autorização expressa do titular para executar CRUD global integralmente. Plano técnico fechado; BUILD somente após este PLAN integrado com ambos checks SUCCESS.

**Objetivo:** refletir permissões efetivas do Supabase nas operações existentes, inclusive MASTER global sem vínculo, sem conceder ação no cliente.
**Arquitetura:** frontend React/TypeScript consulta RBAC existente; as mesmas RPCs/RLS continuam decidindo a escrita. Nenhuma mudança de backend, schema ou Auth.
**Fonte:** backend4fec09bf5cab5afc776192b9bef6e70728e1a058,25documentos normativos e catálogo100/97 inalterados; PRD V1-CON/DOC e transversais de autorização. Consulta HML read-only07/11/2026.

## Diagnóstico e decisão
DocumentoDetalhe usa obterPerfilVinculo e podeRevisar: vínculo ausente bloqueia MASTER antes da revisão. HML privado.usuario_possui_perfil reconhece MASTER com sessão ativa quando administrador pertence ao conjunto; duas funções de revisão exigem arquivos/editar e os seis perfis administrador,direcao_aprovador,gestor_contrato,prestacao_contas,juridico_conformidade,auditor, além de acesso ao contrato/statuspendente. A correção deve respeitar a conjunção efetiva, não substituir por master=true local.
NovoContratante usa organização/perfil retornado,mas não consulta contratantes/criar efetivo. HML RLS INSERT exige usuario_possui_perfil(admin/gestor) mais rbac_permite(contratantes,criar). Manter organização ativa/perfil elegível e acrescentar permissão. Revogar criar impede formulário; conceder a perfil inelegível não vence a policy legada.
Abordagens: manter gate atual perpetua divergência; remover gate expõe comandos negados; adotada consulta efetiva com restrição legada preservada. Usar RPC consultar_permissoes_efetivas e adaptador rbacRpc existente, sem RPC nova nem bypass.

## Allowlist exata
- src/lib/contratantes/novoContratanteDados.ts
- src/test/novoContratante.test.tsx
- src/lib/contratos/documentoDetalheDados.ts
- src/components/contratos/DocumentoDetalhe.tsx
- src/test/documentoDetalhe.test.tsx
- docs/frontend/planos/P0_CRUD_CAPACIDADES_DOCUMENTAIS_2026-11-07.md
- docs/frontend/planos/PLANO_ATIVO.json
- docs/frontend/ESTADO_E_RETOMADA_CONTAOS_4_1.md
Proibidos types.ts,clienteSupabase,rbacRpc compartilhado,rotas/árvore,styles/assets,package/lock,SQL/migrations,Edge/Auth/RLS/Storage/workflows/PROD.

## Tarefa1 — criação de contratantes
Interface consultarCapacidadeCadastro(idOrganizacao,idUsuario) preserva retorno CapacidadeCadastro|null. Após recuperar organização alvo ativa,elegível por perfil, consultarPermissoesEfetivas(org,null); somente retornar registro se temPermissao(...,contratantes,criar). Sem autorização em master flag e sem acesso extra a outras organizações. Mapear ErroRbac negado→ErroV102 negado, técnico→erro. Existing INSERT,campos,defaults,erros e cache preservados.
- [ ] RED: admin revogado,MASTER semperm e ErroRbac negado/técnico não ganhamformulário/INSERT; admin/MASTER comperm funcionam; RPC usaorgexata/nullcontrato.
- [ ] Implementação mínima e GREEN dos testes novoContratante,sem reduzir negativos existentes.

## Tarefa2 — revisão documental
Nova interface consultarCapacidadeRevisaoDocumento(idUsuario,idOrganizacao,idContrato,signal?):Promise<boolean>. Exigir UUIDs deorg/contrato e usuário nãovazio; consultarPermissoesEfetivas(org,contrato); sem arquivos/editar→false inclusiveMASTER. Comperm,MASTER retornado pelo backend dispensa vínculo conforme helpercanônico; nãoMASTER exige obterPerfilVinculo/podeRevisar existentes. Erros falhamfechados. Não substituir demais gates decontrato/documento/contexto.
DocumentoDetalhe troca queryperfil por capacidade comchave usuário/org/contrato/ação,sem staleTime5min; fechamento/abertura de ações só quando capacidade atual true. Revisão bemsucedida invalida leitura/capacidade,sem invalidar outrosusuários/orgs. Estados loading/errofalse nãooferecemações. Cada escrita permanece RPCexistente,sem edição/exclusão deversão anterior.
- [ ] RED: MASTERsemvínculo+perm vê revisar; MASTERsemperm e administradorrevogado não; gestorcomperm sim; perfilinelegível mesmo comperm não; falhaRbac nãoexpõeação; contextoexato; prova de revisão existente preservada.
- [ ] Implementação mínima e GREEN; negativos de RPC precisam distinguir consulta read-only de mutação sem enfraquecer ausência de comandos negados.

## Review focus e validação final
- Permissão revogada durante leitura não libera nova ação; backend decide submissão já emcurso.
- MASTER=true sem arquivos/editar ou contratantes/criar deve ser negado.
- Vínculo ausente só é dispensado com MASTER vindo da RPCautenticada e permissão positiva.
- Cache precisa decontrato e contexto completo,sem mistura deorg.
- Falha técnica não equivale a permissão e conteúdo permanece somente leitura.
Testes porcaso acima nas tarefas1/2; regressão completa,tsc,build,lintfocal sem reformatarlegado;typesblob8ea7750b75fd9d76b29c36ce7613392e3ab65e19 fixo. Revisão independente,doischecks noHEADfinal,TesteC read-only; UIprivada sóPASS seexecutada. Rollback reverte deltafrontend,sem banco.

## ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE
GitHub+Actions canônicos. Reusar UI e tokens atuais,sem redesign ou assets. PreservarPT-BR,44px,foco,teclado e estados existentes; matriz1440/1280/768/390×claro/escuro privada continua não comprovada. Nenhuma dispensa de testes/gates. CRUD global/V1 permanecem abertos;V2/PROD bloqueados.
