# Trilha A: emenda GATE372 para contexto RBAC de V115

GATE372 permanece integrado em42abfa51f57c19c09f9a1c487652905f9ec37758. Esta emenda documental resolve uma lacuna específica da projeção observada: V115 usa a rota de competência e o AppShell já resolve seu contrato por GET de competencias com select=id_contrato, sem GET de contratos nessa navegação. Exigir o contrato por uma chamada que a UI não faz mantém um bloqueio artificial; inventar campos ou fazer consulta extra seria incorreto.

## Prova e limite
Recibo separado: docs/frontend/auditorias/evidencias/privacy-78-20261108/PROVENIENCIA_RBAC_V115_READONLY.json. O recibo original de seis GETs é preservado byte a byte.

Fonte main31b68f3: src/lib/administracao/rbacRpc.ts, função resolverContextoRbac, linhas165–189, blob7ab2e931088231d9af971a74ea57651a80b53ef5, SHA256044544f35deeccf3a7903db5574a5b13d06c4788d5f9bfcaad9d86374b650035. SELECT HML somente leitura confirmou1competência, contrato e organização exatos por igualdade booleana, sem Auth, atores ou dados pessoais.

Autoriza apenas observar a resposta da chamada GET já feita pela UI:
- origem https://gklhhhyosgasnyoxlrui.supabase.co;
- path /rest/v1/competencias;
- select=id_contrato;
- id=eq.59072760-4420-4598-82dd-367f41a79e89;
- id_organizacao=eq.e87f7e68-c5ae-4077-943b-02a4afd8b6ee;
- objeto maybeSingle com id_contrato exatamente be89ef7e-d839-46c0-9cfb-4da81edf8b74.

Id da competência e organização são vínculos do query exato, nunca propriedades inventadas da resposta. Não admitir filtros extras/duplicados, select diferente, array, valor alheio, nulo ou ausência. Ordem das chaves do query pode variar; valor de select deve coincidir literalmente. Projetar somente id_contrato ainda dentro do browser. Não ler headers, Auth, cookies, storage, emails ou campos não necessários.

## BUILD posterior e validação
Depois de CI, revisão independente e merge desta emenda, liberar V115 exclusivamente no catálogo de campo 500 MB autorizado pelo GATE372, quando o GET acima e a configuração de upload estiverem comprovados na mesma geração de navegação, rota de competência exata, sessão, organização e target. Não herdar contexto anterior, não fazer novo fetch e não ampliar política de rede. V111/V112/V122 e demais barreiras permanecem sob seus contratos atuais.

Allowlist posterior permanece somente scripts/hml/authenticated-visual-audit.mjs e scripts/hml/authenticated-visual-audit.test.mjs. Nenhuma modificação de SRC, workflow, tipos, dependência, Supabase, Auth, RLS ou PROD.

RED deve provar que o baseline bloqueia V115 por falta do contexto. GREEN exige admissão do DTO real id_contrato sem id/org projetados e negativos para contrato/org/competência alheios, query incompleto/extra/duplicado, array, null, resposta velha, sessão/org/rota/target alterado, falta de upload, cópia do valor em outro campo e conteúdo sensível vizinho. Qualquer desconhecido remanescente bloqueia a captura integral. O campo aprovado não transforma a superfície em PASS.

Exigir CI no HEAD final, oito provas causais nativas e suplemento visual separado, revisão independente e Teste C real com PNG/DOM/SHA256. Esta emenda não comprova os24casos de fixture, os184pendentes, WCAG,72critérios ou V1. Preservar18públicos e baseline aprovado.
