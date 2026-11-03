# PROMPT 33 / V1-12 — Competências do contrato

Base: `d490ebe9f90d53b7d1f5e3f26d8ef31c7b22844e`. HML. Somente leitura.

## Escopo entregue
- Rota `/contratos/:id/competencias` (`ssr:false`, head próprio).
- Gate: UUID → `getUser()` → preferência de organização (contexto) → `obterContrato()` sob RLS/classificador → só então `competencias`.
- Consulta única por página: `select(COLUNAS_COMPETENCIA,{count:'exact'})`, `.eq('id_contrato')`, filtros server-side `.eq('competencia_referencia','YYYY-MM-01')` e `.eq('situacao', token)`, `order competencia_referencia desc, id desc`, `range` 25, `abortSignal`. Sem joins, sem N+1, sem filtro no cliente.
- Componentes locais: CompetenceTable, StatusBadge (token bruto, ícone + texto), PercentGauge (`role=meter`, valor do backend, pt-BR 2 casas, `—` para nulo), Pagination, FilterBar.
- Estados loading/empty/error (403 sanitizado, retry)/success; filtro reinicia página.
- "Nova competência" e "Abrir competência": `aria-disabled`, "Em breve", sem navegação, sem RPC (V1-13/V1-14 fora).
- Navegação: "Competências" ativo; nas 5 telas irmãs passou de "Em breve" a link.

## TDD
- RED: `competenciasContrato.test.tsx` falhou por módulo inexistente; 3 asserções irmãs autorizadas (baseNormativa, contratoDetalhe, documentosContrato) falharam por Competências ainda desabilitado.
- GREEN: 22 testes V1-12; suíte 519/519 (22 arquivos).

## Validação
- `npx tsc --noEmit` OK; `vite build` OK.
- ESLint: arquivos novos 0 erros; telas irmãs sem aumento (VisaoGeral 29→27, BaseNormativa 188→186, demais 0→0).
- Scan estático: sem insert/update/delete/upsert/rpc/service_role/`as any` nos arquivos V1-12.
- Browser fixture (respostas interceptadas) 1440/1280/768/390 claro/escuro: sem overflow de página, H1 único, status literais (inclusive desconhecido), console sem erros; em 390 a tabela rola horizontalmente dentro do cartão.
- Security Scan nativo: 0 Critical/High/Medium/Low, 1 Info preexistente (senha vazada, configuração de Auth).
- `types.ts` restaurado de `e10f797`, diff 0.

## Limitações
- Sem sessão HML real: RLS de `competencias` não exercida contra o banco.
- SHA final depende do commit automático da plataforma.
