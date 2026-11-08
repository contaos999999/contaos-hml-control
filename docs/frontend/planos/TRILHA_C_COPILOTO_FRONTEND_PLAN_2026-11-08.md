# PLAN C-CHAT-001 — Frontend contextual da Trilha C

Autorização: determinação expressa do titular para execução da Trilha C, correção do Zero-Drift e preservação das Trilhas A e B. Fonte backend: PR contaos999999/develop#179, integrada, com escopo PLAN e não BUILD.

## Escopo estritamente aditivo
- `src/components/copiloto/CopilotoContrato.tsx`: chat contextual com envio de pergunta e sessão por contrato, fontes exibidas, erros recuperáveis e limpeza de estado após troca de organização/contrato/logout.
- `src/components/layout/ContaOSAppShell.tsx`: ponto de montagem já permitido no PLAN anterior; nas áreas autenticadas sob contexto autorizado, sem alterar menus, rotas ou regras das telas existentes.
- `src/test/copilotoContrato.test.tsx`: testes de envio, isolamento de estado e regressão.
- `docs/frontend/planos/PLANO_ATIVO.json`: adição dos três caminhos C, sem remoção de caminhos anteriores nem alterações de permissões do backend.

## Limites e critérios
Nenhuma chamada OpenAI diretamente no navegador. Edge `copilot-query` existente é o único endpoint; JWT, contrato e RLS validados no backend. Nenhuma resposta pode aprovar ou liberar competências. Não duplicar tabelas existentes. Nenhuma alteração em `types.ts`, assets BRAND ou PROD. Zero-Drift, LOCK-TYPES, Vitest, TypeScript e Teste C são obrigatórios. Merge apenas após checks verdes, revisão e prova HML. A PR frontend #377 não certifica OpenAI nem cobertura autenticada das 27 telas.

## Rollback
Reverter os commits do futuro BUILD separado que substituirá a PR histórica #377; sem migração, sem mutação de dados, sem impacto na certificação da Trilha B. Preservar checkpoints e provas anteriores.


ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE (OBRIGATÓRIO)
Sem alterações de marca oficial, tipos gerados, backend ou créditos Lovable.

## Emenda de cobertura contextual, execução autorizada em 08/11/2026

A requisição expressa exige chat nas 27 páginas. A árvore existente contém 28 rotas (24 áreas privadas e 4 de acesso/seleção), além do drawer V117. O BUILD não criará rotas para ajustar contagens. A matriz de Teste C deve mapear cada superfície real, sem promover rotas sem sessão a PASS autenticado.

- Montagem única no AppShell após sessão/organização verificadas, invisível nas rotas de acesso; sem duplicar componentes nas páginas. Menu móvel aberto mantém o painel desmontado, preservando inert/foco da Trilha A.
- Reutilizar resolverContextoRbac para contratos e competências. Em competência, resolver o contrato pela consulta RLS já existente e obter referência autorizada somente se necessária ao filtro temporal já suportado pela Edge. Falha ou contexto obsoleto bloqueia envio.
- Nas listas, cadastros e administração sem contrato na rota, exigir seleção explícita de contrato da organização ativa obtido pela Data API sob JWT/RLS. Não selecionar o primeiro contrato automaticamente. Não carregar lista global de tenants e não enviar id_organizacao ao modelo. O contrato escolhido não é autorização: Edge revalida acesso material em toda pergunta.
- Nenhuma chamada OpenAI sem contrato autorizado. Em ausência de contratos ou permissão, estado informativo com envio bloqueado. Nenhuma busca global nem fallback de autorização.
- Chave de montagem deve incluir revisão de sessão, organização e contexto de rota. Troca de usuário/organização/contrato/competência/logout invalida de forma síncrona requisições e histórico local; resposta tardia não pode reaparecer. Não guardar tokens ou mensagens em localStorage.
- Preservar respostas como texto escapado e fontes/páginas da Edge; informar revisão humana, incerteza e fallback. Não disponibilizar DML, aprovação ou liberação por chat.

## RED/GREEN e provas exigidas para o BUILD posterior

1. Testes de contexto por contrato e competência; estado sem contrato e seletor RLS; lista vazia/403/erro bloqueiam envio; não enviar tenant nem chave OpenAI.
2. Corridas: resposta pendente após troca de organização, contrato, competência, usuário ou logout; descarte verificado após resolução real da Promise, sem assert prematuro. Bloqueio síncrono de duplo envio.
3. Histórico/sessão restritos ao mesmo contexto; fontes e HTML malicioso tratados como texto; fallback/timeout recuperáveis, sem conteúdo anterior em novo contexto.
4. Regressão AppShell/RBAC/menu/teclado e CI completo com tipos imutáveis. Quatro larguras e dois temas; não substituir provas A/B já válidas.
5. HML deve comprovar OPTIONS/CORS de origem exata, JWT ausente/inválido/revogado negados, dois usuários/organizações sintéticos próprios e negativos contrato/sessão/fontes cruzados, OpenAI real e fallback, sem publicar credenciais/PII.
6. Teste C independente do frontend efetivamente servido, com SHA de origem/deployment e screenshots/SHA256. Job documental selecionado sem browser é N/A de escopo e não prova de produto.

## Impedimentos comprovados e ordem

Em c3143edc, Zero-Drift42532656429 e LOCK42532656433 SUCCESS. Implantação Vercel FAILURE por api-deployments-free-per-day; nenhum bypass ou upgrade financeiro automático. Integração e BUILD aguardam resolução do status vermelho. Edge HML v3/JWTtrue não possui geração OpenAI implantada e OPTIONS observado HTTP405 sem CORS; isso impede declarar chat funcional no navegador. Corrigir no repositório backend sob plano próprio da #180 antes da prova autenticada, sem relaxar JWT/RLS ou wildcard CORS.

## Evidência incremental BUILD #379, sem certificação HML

Base: PLAN #378 merge d8594696; RED440f3bd3/run42533505445/job128892643926, 3FAIL/1172PASS esperados (seletor, lista negada, troca usuário). REDlocal AppShell24FAIL/12PASS; competência2FAIL/36PASS. GREEN3408283:38focais e1205regressão PASS, TypeScript/build PASS.

Revisão independente3408283: timeout/aborto e matriz de testes incompleta impediam conclusão. Fontes apenas da última resposta foram reclassificadas como problema de rastreabilidade e corrigidas no mesmo lote. REDlocal /tmp/contaos-c-review-red2.log:4FAIL/39PASS (prazo, aborto por competência, aborto pelo seletor, fontes por resposta). GREENlocal após correção:43/43focais,43suítes/1210testes PASS; tsc/buildPASS; lint0erros/1warning preexistente em botaoMovelRef. Tipos blob8ea7750b75fd9d76b29c36ce7613392e3ab65e19.

Prazo20s cancela transporte por AbortController e libera UI mesmo com Promise pendente; resposta tardia não altera histórico. Trocas de contexto abortam transporte e invalidam geração. Fontes F1..Fn permanecem vinculadas a cada resposta e aviso explicita incerteza/revisão humana. Seletor mostra até100contratos autorizados e orienta a página do contrato além desse limite; nenhum contrato automático.

CI do novo HEAD, implantação HML, JWT/cross-tenant/OpenAI e Teste C autenticado permanecem PENDENTES. Nenhum desses testes locais ou job documental equivale a certificação das27páginas. PROD/A/B/tipos preservados.
