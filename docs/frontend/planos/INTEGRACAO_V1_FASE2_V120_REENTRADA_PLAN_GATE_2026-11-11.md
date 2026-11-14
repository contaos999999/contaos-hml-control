# Fase 2: reentrada persistente na apresentação existente

> Execução inline autorizada pelo titular para corrigir bloqueios e certificar a Fase 2, mantendo todos os controles. Este PLAN/GATE deve ser integrado antes de qualquer BUILD de produto. Não constitui certificação.

**Objetivo:** permitir que o usuário alcance V120 pela competência depois de recarregar, sem registrar outra apresentação.

**Diagnóstico comprovado:** na fonte HML `0024b3c6739ab6296ec12338f11cf792d3a5f84b`, a única entrada de V120 está em `CompetenciaApresentar.tsx`, condicionada a `registroFinal`, estado local criado após `registrar_apresentacao`. A visão geral não lista apresentações existentes. A revisão independente do candidato local `691c06f` confirmou que navegar diretamente ao wizard não reconstrói essa entrada. Consumir a nonce de navegação agora produziria falha determinística.

**Base:** PLAN Fase 2/PR #595, merge `c1b003bd9fd1e8909a2d1950e43984023206f1d3`; backend `5eca44aebead3183e81b5c1af0d1dffa5fb8feb6`; fixture R20 imutável. As oito certificações e ressalvas R-01/R-02/R-03 permanecem históricas. A nova publicação HML exige identidade própria, não herda provas de fonte alterada.

## Desenho e limites

Acrescentar à visão geral V114 uma seção de apresentações existentes, em componente próprio. Consultar somente `apresentacoes_contratante`, tabela já usada pelo protocolo e permitida pela cerca de leitura, com JWT normal, RLS, filtros simultâneos de organização, contrato e competência, ordenação estável e paginação de 25. Reutilizar a projeção e o parser estrito do adapter `protocoloDados.ts`; validar UUIDs, ownership, duplicatas, contagem e resposta antes de criar links tipados para a rota existente. A página pai só monta a seção depois de autenticação, preferência de organização e visão geral válidas. Resposta atrasada, abortada ou de outro contexto nunca renderiza links. Erros devem ser tratados sem expor payload.

Escolha técnica: lista de leitura na visão geral, onde o usuário retorna naturalmente. Reconstruir estado de uma operação concluída no wizard mistura comando e consulta; exigir novo registro criaria efeito de negócio e duplicação. Nenhuma dessas alternativas atende à reentrada persistente.

O wizard conserva a autoridade do backend. A rota de apresentação pode estar indisponível em estados incompatíveis. O auditor distinguirá, por rota e fixture fechadas, a indisponibilidade autorizada de novembro/setembro da etapa elegível de outubro; nunca declarará a etapa elegível executada nesses outros estados. Links desconhecidos ou sem contrato conhecido continuam FAIL.

## Arquivos permitidos

- PLAN: este arquivo, `docs/frontend/planos/PLANO_ATIVO.json` e prefixo aditivo do checkpoint.
- Produto: `src/components/competencias/CompetenciaVisaoGeral.tsx`, novo `src/components/competencias/CompetenciaApresentacoesLista.tsx`, `src/lib/competencias/protocoloDados.ts`.
- Testes: `src/test/competenciaApresentacoesLista.test.tsx`, `src/test/protocoloDados.test.ts`, `src/test/competenciaVisaoGeral.test.tsx`; ajustes de mocks estritamente necessários em testes existentes da visão geral.
- Auditor: os dois mjs já autorizados pelo PLAN Fase 2; somente adições do escopo NAV e suas provas. Fontes, pins e documentos C8/R20 antigos permanecem imutáveis.
- Evidências: `docs/frontend/auditorias/integracao-funcional-v1/fase2/**`.

Sem backend, SQL, Auth/RLS, Storage, tipos gerados, rotas novas, dependências/lock, YAML/workflow ou PROD. Sem nova aprovação, registro, pacote ou intenção de negócio.

## Sequência verificável

1. Integrar este PLAN/GATE por PR com revisão independente e checks obrigatórios, relendo o conteúdo no merge.
2. TDD do adapter: UUID inválido antes de IO; filtros completos; projeção existente; ordem e limite estáveis; resposta vazia; 401/403; ownership divergente; duplicatas; contagem incoerente; paginação e abort. Observar RED antes de implementar `listarApresentacoes(competencia, organizacao, contrato, offset, signal)`.
3. TDD do componente: link real da apresentação existente, lista vazia, erro e nova tentativa, próxima/anterior página, troca de contexto e resposta antiga ignorada. Nenhuma RPC mutante. Implementar seção com heading `Apresentações registradas`, estados acessíveis e botões mínimos de 44px, usando tokens existentes.
4. Integrar seção em V114 somente no estado autorizado. Testar que ausência de sessão/organização/visão geral válida não aciona a lista e que recarga recria o link. Preservar ações existentes e a autoridade do backend.
5. Corrigir os achados do auditor antes de consumir nonce: V117 fechado validado como análise, drawer aberto e foco comprovados; tema reaplicado e aferido após cada recarga/navegação; coleta do conteúdo e menu móvel, fechamento por navegação/Escape e foco; contadores de console/requestfailed sem texto; links desconhecidos bloqueados; controles locais explícitos, inclusive edição e confirmações abertas/canceladas sem confirmar.
6. Revisão independente, regressão completa produto/SDK, build/typecheck/Zero-Drift/Teste C/LOCK e checks de harnesses com nativas18. Não adaptar testes para aceitar falhas. Produto e harness podem ter PRs separados; nenhum request privado antes de todos os gates.
7. Publicar exclusivamente o projeto HML existente após CI e merge. Registrar antes/depois a configuração e fixar o ignored-build estritamente ao novo SHA de produto aprovado, mantendo o mesmo ambiente/configuração pública e proteções. Autoriza uma nova publicação HML da correção, nunca outra origem/PROD, remoção de proteção ou build de SHA arbitrário. Confirmar SHA, deployment, assets e origem por leitura real; restaurar rollback HML anterior se o novo build falhar. Não executar auditor durante troca de deployment.
8. Reancorar somente NAV ao novo SHA/deployment em commit revisado anterior ao request. Manter provas C8/R20 e validadores nativos antigos intactos. A ancestralidade do novo PLAN é exigida pelo request NAV. Revalidar as superfícies afetadas V114/V120 em quatro larguras e dois temas com fixture offline dos componentes reais e checagens de layout/foco/overflow; a navegação autenticada final continua 52 casos e prova o link persistente pela UI real.
9. Retomar os critérios completos do PLAN Fase 2: request isolado, COMMENT canônico, freeze, attempt1, transporte oficial, relatório estrito e revisão independente. Não fabricar PASS, não replay, não rerun, não reaproveitar nonce consumido.

## Foco de revisão

Ownership em toda página, resposta atrasada entre competências, erro de autorização sem link residual, lista maior que a página sem perda de acesso, navegação V114→V120→voltar→recarga, nenhum efeito de negócio, preservação das provas históricas e da cerca nativa.

## ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE

Usar exclusivamente componentes/tokens ContaOS existentes; sem mudança de marca ou shell. Impacto visual restrito à nova seção de leitura V114. Revalidar o delta em 1440/1280/768/390 × claro/escuro e os fluxos de apresentação afetados; preservar os demais resultados históricos com seus SHAs. Ferramentas diretas GitHub/Vercel HML, sem turn Lovable nem backend paralelo. Economia não dispensa evidência, revisão, controles ou Teste C.
