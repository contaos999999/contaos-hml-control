# Fase 2: prova visual do delta no Teste C existente

> Execução inline autorizada pelo titular. Gate documental prévio a qualquer alteração do Teste C. Não certifica produto, HML ou Fase 2.

**Problema:** a correção de reentrada V114→V120 (PLAN #596, BUILD #598) exige conferência visual 1440/1280/768/390 × claro/escuro. O Chromium local não iniciou por restrição de socket e o download oficial retornou arquivo incompleto. O navegador conectado não alcança localhost do executor e sua política bloqueia `file:`. Não contornar essas restrições, alterar política, usar flags para neutralizá-las ou abrir o arquivo por execução indireta.

**Caminho autorizado:** ampliar o Teste C independente já existente, executado pelo CI em runner próprio com Playwright oficial instalado e transporte oficial de artefatos. A prova usa HTTP local no runner, componentes reais do mesmo commit e dados estritamente sintéticos. Não depende de abrir arquivo local no navegador conectado, de HML/Auth ou de novas permissões. Preservar integralmente o workflow, suas proteções, os resultados públicos/sem sessão existentes e as 18 provas nativas do auditor privado.

**Base:** main `72cc05c12d8255e560ebf344be6818aa8d52b685`; backend `5eca44aebead3183e81b5c1af0d1dffa5fb8feb6`. Produto #598 e auditor NAV permanecem pendentes; nenhuma nonce NAV consumida.

## Escopo e arquivos

- PLAN: este documento e aditivo `docs/frontend/planos/PLANO_ATIVO.json`.
- BUILD: somente `scripts/testc/visual-audit.mjs` e `scripts/testc/visual-audit.test.mjs`, além dos arquivos já autorizados nos PLANs #595/#596 quando integrados na mesma branch.
- Evidência adicional no artefato Teste C atual: subdiretório `phase2-delta/`, contendo relatório técnico, 16 PNGs sintéticos e SHA256SUMS próprio. Nenhum arquivo da auditoria HML privada recebe PNG ou texto livre.

Sem YAML/workflow, dependências/lock, rota de produto, backend, SQL, alteração de Auth/RLS/Storage, credencial ou PROD. Não adicionar dispatch/rerun, novo workflow ou environment.

## Implementação verificável

1. Integrar este gate com revisão independente e checks obrigatórios antes do BUILD.
2. TDD de catálogo/schema fechado: exatamente V114/V120 × quatro larguras × dois temas; negar ausente/duplicado/extra, falha, dimensão/tema divergente, erro, rede externa ou falso total. A prova deve se identificar `OFFLINE_SYNTHETIC_ORIGINAL_COMPONENTS`, nunca sessão real, PASS_REAL ou substituto do relatório NAV autenticado.
3. Acrescentar suplemento ao executor Teste C existente. Compilar por Bun os componentes reais V114/V120 e SDK de leitura do mesmo checkout, substituindo nominalmente somente `@/integrations/supabase/client` (Auth/transporte sintético) e `@tanstack/react-router` (roteamento da fixture). Os adapters e parsers de leitura reais, incluindo `listarApresentacoes`, `consultarProtocolo` e `obterVisaoGeral`, devem permanecer compilados da fonte do produto; proíbe-se alias/mock desses módulos ou dos componentes sob teste. Os arquivos da fixture ficam em diretório temporário. Fixtures com UUIDs e ownership coerentes, sem dados reais, operações mutantes ou chamadas HML. Não modificar fonte versionada durante o teste. CSS deve ser o CSS real processado pelo Vite do mesmo checkout, com hash registrado.
4. Criar contexto de browser isolado por largura/tema. Permitir somente origem HTTP local da fixture, contar e bloquear qualquer tráfego externo; nenhum estado de autenticação injetado em domínio HML. Comprovar títulos/regiões reais, tema, ausência de alertas/erros e overflow, controles novos ≥44px, foco de teclado no link, link real tipado e transição entre componentes/retorno/remontagem. Preservar os testes existentes de foco após paginação e cancelamento de respostas antigas.
5. Capturar 16 PNGs exclusivamente sintéticos, gerar hashes e relatório enum/boolean/count estrito. Se compilação, renderização, assert ou captura falhar, reprovar o suplemento e o check, sem fabricar completude. O catálogo/cobertura privados antigos continuam com seus próprios resultados e limites.
6. Regressão dos scripts Teste C e produto, lint/formato/build/tipagem, revisão independente e checks do HEAD exato. A ausência de browser local não constitui PASS; a execução no CI e o artefato real devem provar o resultado. Baixar pelo transporte oficial somente após registrar metadata/digest/tamanho/run/attempt/head, conferir membros/hashes/schema e inspecionar todas as imagens do delta antes de aprovar publicação HML.
7. Depois, retomar os gates #596/#595: publicação HML com SHA aprovado exato, reancoragem NAV própria, CI4/nativas18/revisão, request isolado e COMMENT canônico, freeze e attempt1, relatório autenticado52 e certificação com evidência real. V1 histórico, ressalvas e V2 permanecem preservados.

## Foco da revisão e rollback

Verificar que o mock não substitui os componentes/SDK de leitura sob teste, que CSS e fonte pertencem ao mesmo commit, que o servidor não serve arquivos arbitrários e que nenhum dado/credencial real entra na fixture/PNG. Revisar rede, cardinalidade, foco, overflow e diferença entre prova sintética e autenticada. Rollback por PR dos dois scripts, sem dados alterados nem nonce reativada.

## ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE

Somente ampliar a evidência do delta visual autorizado, usando tokens e componentes ContaOS atuais. Reutilizar runner/browser/upload do Teste C independente, sem criar serviço paralelo, retirar controles ou repetir certificações anteriores. Economia não dispensa revisão, evidência, segurança ou conferência das 16 imagens.
