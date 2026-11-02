# PROMPT 28 / V1-07 — Contrato — Base normativa (PLANO para auditoria externa)

Rastreabilidade: GitHub issue #24. Base frontend 9c26e97e. HML gklhhhyosgasnyoxlrui. PROD intocado. Sem build neste turno.

## 1. Referências
- Regular: PROMPT 28 / FE V1-07 `/contratos/:id/base-normativa`.
- Atômicos (parciais, nunca PASS integral por existir tela):
  - 001 / V1-CON-001 cadastro de documentos-base: **leitura** coberta aqui; cadastro = LACUNA (ver §8).
  - 002 / V1-CON-002 vigência temporal: exibição de inicio/fim_vigencia por versão, coberta aqui; manutenção = LACUNA.
  - 004 / V1-CON-004 extração assistida: fora desta tela (depende V1-08/09/10 e de fluxo certificado); registrado N/A-dependente.
  - 005 / V1-CON-005 documento/página/trecho: exibe somente id_arquivo/metadados oficiais quando existirem; ausência declarada "Não informado pelo backend". Sem inventar página/trecho.
- NFR-005 (PT-BR/formatos) e NFR-009 (paginação) aplicáveis; NFR-007/008 N/A porque não há mutação neste recorte.

## 2. Escopo funcional (somente leitura, sem certificar feature integral)
- Lista paginada (25, server-side) de fontes normativas visíveis via RLS para o contrato: específicas do contrato (`id_contrato = :id`) e globais da organização do contrato (`id_contrato is null`), em seções/filtro distintos ("Do contrato" / "Globais da organização").
- Filtros: escopo (contrato/global), situação (literais oficiais rascunho/ativa/inativa/revogada; desconhecido exibido literal). Ordem determinística: `titulo asc, id asc`.
- Detalhe sob demanda (drawer acessível, Esc/retorno de foco) de uma fonte: versões paginadas (25, `versao desc, id asc`), com vigência, hash, id_arquivo (apenas "Arquivo vinculado" sem download), aprovado_por/aprovado_em ("Aprovada em DD/MM/AAAA HH:mm" somente se aprovado_em não nulo; caso contrário "Sem aprovação registrada"). Vigência nunca implica aprovação.
- Aplicabilidade por versão ao contrato: lida de `aplicabilidades_fonte` (id_contrato=:id, id_fonte_versao in versões da página atual — uma única query por página, sem N+1). Rótulos: "Aplicável"/"Não aplicável" apenas de `aplicavel` com aprovado_em; registro sem aprovação = "Aplicabilidade sem aprovação registrada"; ausência = "Sem registro de aplicabilidade". Fonte global sem registro nunca é exibida como aplicável.
- `conteudo_texto`/`metadados`: só ao expandir uma versão, query separada `select conteudo_texto, metadados` por id, exibição limitada a 5.000 caracteres com aviso de truncamento; rotulado "Texto registrado (não constitui aprovação normativa)".

## 3. Gate e autorização (reutilização, sem alterar helpers certificados)
- Sessão `getUser` (ausente → /login; erro → retry sem signOut); preferência de organização ausente → /selecionar-organizacao (padrão V1-06).
- UUID validado com `uuidValido`, canonizado com `uuidCanonico`; inválido não chama API.
- Contrato autorizado via `obterContrato(id, signal)` (inclui classificador `classificar_acesso_contrato_v106` só após zero linhas) → 403/404/consistência/erro com mensagens existentes. Somente após sucesso executam-se as queries normativas, usando `contrato.id_organizacao` (do backend) para o filtro global.
- Sem gate por perfil: leitor e Master leem conforme RLS.

## 4. Queries exatas (Data API, somente SELECT)
```text
Q-F: from('fontes_normativas')
  .select('id,id_organizacao,id_contrato,tipo,titulo,referencia,descricao,situacao,versao_registro,criado_em,atualizado_em', {count:'exact'})
  .eq('id_organizacao', org).[escopo: .eq('id_contrato', id) | .is('id_contrato', null) | .or(`id_contrato.eq.${id},id_contrato.is.null`)]
  .[situacao: .eq('situacao', s)]
  .order('titulo').order('id').range(p*25, p*25+24).abortSignal(signal)
Q-V: from('versoes_fontes_normativas')
  .select('id,id_fonte,versao,inicio_vigencia,fim_vigencia,id_arquivo,hash,aprovado_por,aprovado_em,criado_em', {count:'exact'})
  .eq('id_fonte', idFonte).order('versao',{ascending:false}).order('id').range(...).abortSignal(signal)
Q-A: from('aplicabilidades_fonte')
  .select('id,id_fonte_versao,aplicavel,fundamento,aprovado_por,aprovado_em,atualizado_em')
  .eq('id_contrato', id).in('id_fonte_versao', idsVersoesDaPagina).abortSignal(signal)
Q-T: from('versoes_fontes_normativas').select('conteudo_texto,metadados').eq('id', idVersao).maybeSingle()
```
Sem `!inner`, sem RPC além do classificador V1-06, sem Storage, sem INSERT/UPDATE.
Query keys: `['base-normativa', uid, org, idContrato, escopo, situacao, pagina]`, `['bn-versoes', uid, org, idContrato, idFonte, pagina]`, `['bn-aplic', uid, org, idContrato, idsVersoes]`, `['bn-texto', uid, org, idVersao]`; sem placeholderData; remount por key (anti-stale A→B).
Erros: 401/403/42501/PGRST301 → "Acesso negado"; demais/rede → erro técnico sanitizado + retry; sem expor code/hint/stack.

## 5. Tipagem
Tipos derivados de `Database['public']['Tables'][...]['Row']` existentes (Pick). Sem casts, sem editar types.ts.

## 6. Estados e UI
Loading, empty distinto ("Nenhuma fonte normativa registrada para este contrato/organização"), 403, 404, erro + retry, empty de versões e de aplicabilidade. H1 único "Base normativa"; datas DD/MM/AAAA e horas America/Sao_Paulo (date-only sem deslocamento); alvos ≥44px; status com texto, não só cor; tooltips só em "Escopo global" e "Hash" (ganho real), hover+foco, toque via popover existente. Larguras 1440/1280/768/390 sem overflow. Design existente, sem layout global.

## 7. Navegação
- V1-06: "Base normativa" passa a link para `/contratos/$id/base-normativa` (única alteração em VisaoGeralContrato.tsx + teste associado); demais seções seguem "Em breve".
- V1-07: link "Visão geral" → `/contratos/$id`; "Base normativa" aria-current; demais "Em breve"; voltar a /contratos.

## 8. LACUNAS DE BACKEND (caminhos parados, sem contorno)
- Cadastro/edição de fonte (001): grants INSERT/UPDATE existem, mas UPDATE tem duplo incremento de `versao_registro` (controlar_versao_registro + tocar_atualizado_em) sem contrato otimista provado → LACUNA; INSERT isolado sem fluxo de versão/aprovação certificado definido pelo pacote para esta tela → não implementado nesta etapa.
- Nova versão/vigência (002): INSERT em versões possível, mas exige id_arquivo/upload sem fluxo Storage certificado para esta tela e hash sem origem definida → LACUNA.
- Aprovação de fonte/versão: sem RPC pública; escrita de aprovado_por/em via Data API proibida → LACUNA.
- Aplicabilidade: sem INSERT/UPDATE nem RPC → LACUNA.
- Publicação/ativação (situacao): sem RPC de transição crítica → LACUNA.
- Download de arquivo/página/trecho (005): sem fluxo Storage certificado → LACUNA; exibe só indicação de vínculo.
- Extração assistida (004): depende de V1-08/09/10 → N/A nesta tela.
Consequência: V1-07 é certificável apenas como **recorte de leitura**, não como feature integral.

## 9. Arquivos exatos
- novo `src/routes/contratos_.$id.base-normativa.tsx` (ssr:false, title "Base normativa — ContaOS", robots noindex)
- novo `src/components/contratos/BaseNormativaContrato.tsx` (inclui drawer local; nenhum componente auxiliar extra)
- novo `src/lib/contratos/baseNormativaDados.ts`
- novo `src/test/baseNormativa.test.tsx`
- alterar `src/components/contratos/VisaoGeralContrato.tsx` (somente link) e `src/test/contratoDetalhe.test.tsx` (somente teste do link)
- `src/routeTree.gen.ts` regenerado; `.lovable/plan.md`.

## 10. TDD
RED (módulo ausente + comportamento link V1-06) → GREEN mínimo. Casos: gate sessão/org/UUID; autorizado/403/404/erro/rede via obterContrato; Q-F colunas/filtros/ordem/range/página 2; escopo contrato vs global vs ambos; situação desconhecida literal; empty vs erro; versões paginadas; aplicabilidade sem aprovação/sem registro/global não aplicável; vigência ≠ aprovação; texto só sob demanda e truncado; uma Q-A por página (sem N+1); stale A→B e abort; scan sem insert/update/upsert/delete/storage/service_role. Suíte completa, tsgo, build, browser 4 larguras.

## 11. Teste C (18 gates, turno separado)
1 HEAD/status; 2 Zero-Drift diff; 3 tipos sem cast; 4 rota/head; 5 sessão/org; 6 UUID; 7 autorização obterContrato/classificador; 8 Q-F/paginação/filtros; 9 escopo contrato×global; 10 versões/vigência/aprovação literal; 11 aplicabilidade; 12 texto sob demanda/limite; 13 estados/erros sanitizados; 14 stale/abort; 15 navegação V1-06↔V1-07; 16 a11y/drawer/foco/44px; 17 responsividade 4 larguras; 18 testes/typecheck/build + Security Scan separado + HEAD final. Qualquer FAIL para sem auto-fix.
