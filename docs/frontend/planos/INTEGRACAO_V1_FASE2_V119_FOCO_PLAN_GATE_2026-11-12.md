# Fase 2: retorno de foco da confirmação V119

> Execução inline autorizada pelo titular para corrigir bloqueios e certificar a Fase 2 sem bypass. Gate documental anterior ao BUILD. Não certifica execução.

**Diagnóstico independente:** `CompetenciaApresentar.tsx` usa Dialog controlado, com botões de abertura externos e sem DialogTrigger ou onCloseAutoFocus. O Radix modal impede a restauração padrão e tenta focar triggerRef, que está nulo. O auditor NAV exige retorno ao botão depois de Cancelar; retirar essa asserção aceitaria um defeito. Confirmado na fonte do componente e na implementação instalada de `@radix-ui/react-dialog`.

**Base:** main `5ff286c13195d93c0ef9b766969dc0829292794b` (PR #598, reentrada V114→V120 e suplemento Teste C); backend `5eca44aebead3183e81b5c1af0d1dffa5fb8feb6`. As 16 imagens offline de #598 foram conferidas por duas revisões e seus hashes/proveniência preservados. A correção #598 ainda não foi publicada na HML. A nonce NAV r1 não foi consumida.

## Desenho e escopo fechado

Manter o Dialog controlado, o backend como autoridade e os comandos existentes. Acrescentar ref ao botão de abertura visível (aprovar ou registrar, mutuamente exclusivos) e handler explícito de onCloseAutoFocus. Ao cancelar ou pressionar Escape, focar o botão original. Se o sucesso da operação remover o botão, usar o título da página como destino de foco previsível, sem nova requisição ou comando. Preservar os textos, confirmação humana, idempotência, gates de estado/permissão e navegação existentes. Não reformar o wizard nem envolver a página em novo contexto de Dialog.

Arquivos BUILD permitidos somente `src/components/competencias/CompetenciaApresentar.tsx` e `src/test/competenciaApresentar.test.tsx`. PLAN: este documento e aditivo `docs/frontend/planos/PLANO_ATIVO.json`. Evidências no diretório Fase 2 já autorizado. Os dois scripts do auditor NAV podem receber o pin/gate desse PLAN dentro do escopo #595, sem alterar provas C8/R20 históricas.

Sem backend/SQL/RLS/Auth/Storage, dependências/lock, tipos, rotas, workflow/YAML, concessão de perfil, PROD ou operação de negócio nova. Não registrar apresentação para testar Cancelar/Escape. Não reabrir as oito certificações anteriores; este é o delta de navegação encontrado na auditoria complementar.

## Tarefas e critérios

1. Integrar o PLAN/GATE por PR com revisão independente, checks e readback, antes de editar produto.
2. TDD com o Dialog/Radix real: nas duas etapas autorizadas por fixtures do backend, abrir confirmação e cancelar/pressionar Escape. Conferir diálogo fechado, foco no mesmo botão de origem e nenhuma RPC mutante. Observar RED no código atual antes da correção. Preservar os testes existentes de estado/permissão, confirmação e idempotência.
3. Implementar somente refs e política de retorno de foco. Testar fallback ao título quando a operação já existente concluir e remover o botão, sem criar intenção adicional para a prova. Troca de competência/estado não deve focar elemento removido ou conservar confirmação de outro contexto.
4. Suíte focada e regressão completa, typecheck/lint/build/Zero-Drift/LOCK/routeTree, revisão independente e CI do HEAD exato. Impacto de aparência em repouso N/A; preservar a matriz visual anterior. Verificação de foco real em V119 ocorrerá nos dois casos NAV da sessão autenticada, mantendo a asserção atual e todas as provas nativas18.
5. Publicar HML somente depois deste BUILD integrado e push aprovado. O SHA autorizado para a nova publicação passa a ser o merge final desta correção, que deve conter #598 como ancestral. Não publicar o candidato intermediário #598 em separado. Registrar SHA/deployment/guard POSIX exatos antes do request; reancorar somente NAV e exigir este gate na ancestralidade. O rollback permanece `dpl_8FQFvCqVE2UMVPyg8SVsPDurZSCh`.
6. Prosseguir com os controles #595/#596/#599: CI4/nativas18/revisão do auditor, pedido isolado de sete campos e COMMENT canônico, freeze e attempt1, artefato oficial e relatório52 estrito. Sem rerun, dispatch, replay ou certificado parcial.

## Revisão e rollback

Revisar os dois tipos de abertura, Cancelar e Escape, conclusão sem trigger remanescente, manutenção de autorização/idempotência e ausência de nova mutação. Rollback por PR dos dois arquivos, sem estado de negócio alterado ou nonce reativada.

## ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE

Preservar marca, componentes, layout e tokens ContaOS. Apenas corrigir retorno de foco; não recapturar o conjunto visual estático sem mudança de aparência. Reutilizar TDD/CI/NAV existentes, sem turn Lovable, serviço paralelo ou alteração de segurança. Economia não elimina evidência, revisão ou controles.
