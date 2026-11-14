# Integração funcional V1: Fase 2, navegação autenticada

> Execução inline do plano de sete fases já aprovado pelo titular. Autorização expressa nesta conversa para iniciar, corrigir os bloqueios dentro do escopo e certificar a Fase 2, sem contornar controles. Este PLAN/GATE técnico não é certificado de execução.

**Objetivo:** comprovar na HML as rotas, menus, retorno, recarga, transições e ações de interface essenciais das 27 telas do núcleo, incluindo o drawer V117; registrar também as duas telas auxiliares de recuperação.

**Baseline:** frontend `538c52d909a5a9929c10740e6f961e38beb8ee11`, backend normativo `5eca44aebead3183e81b5c1af0d1dffa5fb8feb6`, produto HML certificado `0024b3c6739ab6296ec12338f11cf792d3a5f84b`, deployment `dpl_8FQFvCqVE2UMVPyg8SVsPDurZSCh`, origem exata `https://contaos-41-hml.vercel.app`, Supabase `gklhhhyosgasnyoxlrui`. Qualquer divergência material exige nova reancoragem, sem substituir pins silenciosamente.

**Fonte:** Fase 1/PR #594 e recibo 6812207699, inventário SHA256 `81f56088977b9d874c2e2a3678a1df185dcccf0e0f16b99629fb2862f411d302`; plano aprovado nesta conversa; PRD/Premissas/Arquitetura/Zero-Drift, 25 documentos do snapshot e manifesto P0 atuais. As oito certificações anteriores, R-01/R-02/R-03 e as provas C8/API51 permanecem em suas origens.

## Arquitetura e limites

Ampliar o executor autenticado existente com um escopo fechado `INTEGRACAO_V1_FASE2_NAV`, resolvido exclusivamente pelo nonce `integracao-v1-fase2-nav-20261111-r1` no mesmo JSON de sete campos, operação `audit`. Preservar workflow original, environment HML, credenciais sintéticas existentes, cerca nativa, CSP adicional, verificação de assets/publicação, preflight/revalidação, unicidade, ancestralidade, revisão canônica pré-merge, concorrência, sessão normal MASTER e logout em finally. O escopo V117/C8 anterior não é reexecutado ou reclassificado.

O novo percurso usa somente leituras e interações locais de UI, sem SQL/Admin API, novo usuário, concessão de perfil, alteração de backend ou gravação de negócio. Criação/edição/exclusão e efeitos persistidos pertencem às Fases 3–6; nesta fase verificar navegação dos formulários, campos/validação local sem envio válido, abrir/fechar painéis e controles de leitura. Operações de negócio já certificadas podem ser referenciadas por fonte imutável; não lhes atribuir execução nova. Qualquer controle essencial sem finalidade ou rota inválida é FAIL, não N/A.

## Arquivos fechados

- Documento prévio: este arquivo e acréscimo ao `docs/frontend/planos/PLANO_ATIVO.json`.
- BUILD: somente `scripts/hml/authenticated-visual-audit.mjs` e `scripts/hml/authenticated-visual-audit.test.mjs`.
- Request posterior isolado: somente `docs/frontend/auditorias/TRILHA_A_SOLICITACAO_UNICA.json`.
- Resultados/ledger/matriz/certificado: `docs/frontend/auditorias/integracao-funcional-v1/fase2/**` e prefixo aditivo ao checkpoint `docs/frontend/ESTADO_E_RETOMADA_CONTAOS_4_1.md`.
- Produto `src/**`, assets, árvore gerada, tipos, dependências/lock, YAML/workflows, backend, Auth/RLS/Storage e PROD proibidos nesta implementação. Defeito de produto encontrado exige PLAN/GATE de correção separado antes de editar e revalidação das conexões afetadas; não adaptar o teste para aceitar o defeito.

## Tarefas e critérios

1. **PLAN/GATE anterior ao BUILD:** validar contexto e o escopo, publicar PR documental e concluir revisão independente/CI/merge/readback. Acrescentar allowlist e autorização específica ao plano ativo sem remover nenhuma regra anterior.
2. **TDD do novo escopo:** negativos de nonce antigo/manual/desconhecido, escopo forjado/proxy/getter, fonte/route/ID fora da fixture, lista incompleta/duplicada, falso PASS ou token/texto livre em relatório. Oito casos antigos V117, default208, nativas18, sourceOrdering/preflightDrain e contratos atuais permanecem íntegros.
3. **Driver UI:** usar autenticação normal MASTER já existente. Gerar catálogo das 26 superfícies privadas com IDs sintéticos já fixados, mantendo V117 dentro de sua análise, V119 elegível e V120 com apresentação existente. Ler menu real/links visíveis e testar destinos esperados por clique, sem presumir que URL direta comprova integração. Conferir path/título/estado/organização, retorno e recarga. Testar menu desktop recolhido/expandido e móvel com fechamento/foco. Capturar falhas de console/requisição por contadores e códigos fechados.
4. **Cobertura:** executar navegação funcional em 1440 claro e 390 escuro; preservar as evidências visuais anteriores 1440/1280/768/390 × claro/escuro porque não há alteração de produto. Toda tela privada precisa de rota direta, navegação pelo menu ou contexto quando aplicável, retorno e recarga. A entrada V117 exige abrir e fechar requisito; V120 exige link da apresentação real. SYS01 faz parte da sessão; SYS02/SYS03 têm provas públicas e navegação auxiliar sem enviar e-mail nem alterar senha. Distinguir links condicionais não renderizados no estado da fixture, com justificativa e evidência técnica, de links quebrados. A matriz Fase 1 é mapa conservador de módulos, não obrigação de renderizar simultaneamente controles mutuamente exclusivos.
5. **Artefato mínimo:** registrar em `report.json` uma matriz de operações com IDs de tela/ação, enums, contadores e booleanos estritos, mais `SHA256SUMS`. Sem DOM/texto livre/HTML/PNG/HAR/cookie/JWT/credenciais ou dados de usuário nesta prova técnica. Usar o mesmo transporte oficial de artefatos GitHub; validar metadata, tamanho, digest, membros, hashes, schema, unicidade e cobertura antes de interpretar o resultado. Não usar sucesso do workflow como substituto do relatório.
6. **Operação governada:** após BUILD aprovado/CI4/nativas18/revisão/merge/push, criar request de sete campos com pai igual ao merge BUILD exato; preservar nonce V117 anterior como histórico consumido, nunca reativá-lo. Publicar e reler o COMMENT canônico antes do merge do request. Congelar main/deployment até ambas vias originais attempt1 terminais. Sem rerun/dispatch/cancel/replay nem aquisição privada antes de metadata real registrada.
7. **Certificação:** matriz sem falhas obrigatórias, sessão/MASTER/organização/logout confirmados, nenhum efeito de negócio, leitura independente do artefato técnico, relatório e certificado integrados por PR com checks exigidos. Conferir HEAD final e recibo efetivo. Fase 2 não certifica CRUD integrado, RBAC/RLS entre organizações ou processo mensal completo. V2 aguarda decisão formal das sete fases.

## Interface técnica prevista

- `NAVIGATION_SCOPE`: objeto congelado, ID/nonce acima, catálogo fechado; não adicionar CLI ou ENV de escopo.
- `navigationCases()`: operações esperadas finitas por tela e largura, usando fixture original e bindings R20.
- `runNavigationAudit(page, fence, proof)`: executa somente UI e retorna registros estritos; não recebe segredo nem autoriza rede adicional.
- `summarizeNavigation(records)`: nega faltante/duplicado/extra, estados não terminais e falso PASS; não cria recibos ausentes.
- `validateNavigationReport(value)`: função pura offline; rejeita campos desconhecidos e qualquer conteúdo livre; autenticação/logout/zero mutação e identidade são requisitos.
- `runAuthenticatedAudit`: delegação ao novo escopo após os mesmos gates de origem, cerca nativa e seleção MASTER; finally e preservação das provas C8 intactos.

## Verificações e rollback

Testes RED→GREEN específicos e suíte completa auditor/preparador, lint/formato, 18 nativas oficiais e quatro checks dos harnesses no mesmo HEAD, regressão do produto/build/typecheck/Zero-Drift/LOCK. Revisão independente antes de cada merge exigível. Defeito do harness deve ter causa e regressão; não aumentar prazos ou retirar cerca para obter PASS.

Rollback por PR dos dois mjs, sem alterar dados HML nem reaproveitar nonce consumido. Falha parcial preserva registros honestos e bloqueia certificado; um sucessor só por novo PLAN/GATE/request próprio e prova do estado anterior.

## Foco da revisão

1. Percurso pelo menu real, não só page.goto ou título de página de erro.
2. Fixture com estado diferente deve bloquear a transição material correspondente; nunca fabricar apresentação/drawer.
3. Novo escopo não pode converter request V117 consumido, workflow manual ou caller arbitrário em login autorizado.
4. JSON técnico não pode transportar saída livre/credenciais nem aceitar campos extras como prova.
5. Interações móveis e recarga preservam contexto e logout; nenhum clique válido de negócio nesta fase.

## ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE

Marca ContaOS Brand v1.0 e assets/Design System preservados; impacto visual de implementação N/A porque só o instrumento de auditoria muda. Não recapturar o conjunto visual já certificado sem delta de produto. Provar o comportamento de menus em desktop/móvel na sessão real e preservar as provas das quatro larguras/dois temas. Ferramentas diretas GitHub, sem turns Lovable, criação de backend paralelo, novas dependências ou repetição das oito certificações. Economia nunca dispensa segurança, TDD, revisão, evidência real, CI e Teste C.
