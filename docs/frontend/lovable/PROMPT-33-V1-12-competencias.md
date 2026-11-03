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
- GREEN: 18 testes V1-12; suíte 519/519 (22 arquivos).

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

## Correção mínima pós-auditoria — ordem do gate UUID

- Base solicitada: `259a11d325463229c7d4cff1a55bceb764af880f`.
- RED isolado: 1 falha, 18 testes ignorados; `expect(m.getUser).not.toHaveBeenCalled()` falhou porque Auth foi chamada 1 vez com UUID inválido.
- GREEN: UUID é validado antes do effect; o effect retorna sem autenticar para UUID inválido, sem hooks condicionais. A renderização prioriza “Contrato não encontrado.” sobre os estados de sessão.
- Teste negativo verifica zero Auth, zero leitura de preferência, zero consultas e zero RPC. Teste positivo comprova a sequência sessão → organização → contrato → competências.
- V1-12: 19/19; V1-11: 35/35; V1-10: 33/33; regressão consolidada: 87/87. Suíte completa: 520/520, 22 arquivos.
- ESLint dos dois arquivos alterados: exit 0; `git diff --check`: exit 0; scan estático da produção sem operações de escrita/RPC, secrets, `as any` ou `console.log`.
- Validação automática do preview após o GREEN: `build OK` em 03/11/2026 às 08:18:29 UTC. Build/typecheck manuais, inclusive `tsc`, não foram executados por restrição do ambiente; não há comprovação separada de `tsc` neste delta.
- Browser real do preview, UUID inválido: mensagem imediata, sem estado de verificação de sessão e zero requisições Supabase. O fluxo de UUID válido foi verificado por teste comportamental, não com sessão HML real.
- Security Scan nativo concluído sem gate humano: Critical/High/Medium/Low = 0; Info = 1 (proteção de senhas vazadas, preexistente). Wiz não configurado.
- `types.ts` restaurado byte a byte do baseline `e10f7973260df0c455bb66baa091e5c9b3124efe`; diff = 0 bytes. Blob esperado: `8ea7750b75fd9d76b29c36ce7613392e3ab65e19`.
- O estado recebido já incluía `.lovable/north-star/north-star.md`, criado pela plataforma; não foi editado nesta correção. Nenhuma alteração de backend, V1-13/V1-14 ou Teste C.
- SHA funcional gravado após GREEN: `d1574448c3a3c26f818e27df60e828269722bd66`. Esta atualização documental pode receber commit automático posterior.
