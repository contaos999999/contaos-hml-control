# ContaOS 4.1 | Trilha A | Gate de auditoria visual independente

**Status:** PLAN proposto, não aprovado por CI. **Issue:** #317. **Data:** 07/11/2026 (Bahia). **Escopo:** exclusivamente frontend. **Plano mestre:** `docs/frontend/planos/P0_V1_PLANO_UNICO_AUDITORIA_CORRECAO_CERTIFICACAO_2026-11-05.md`. Não substitui PLAN #299, GATE #300, BUILD #301 nem checkpoints #315/#316 integrados.

## Baseline lido e limites da evidência

- `PLANO_ATIVO.json` indica prompt 75 VALIDADO; isso não certifica a V1 nem habilita alteração indiscriminada.
- Checkpoint `ESTADO_E_RETOMADA_CONTAOS_4_1.md`: 29 superfícies (28 rotas + drawer), 232 casos em quatro larguras (1440,1280,768,390) × dois temas, 24 casos públicos PASS e **208 casos protegidos sem sessão**. Provas de teclado públicas restritas a login/recuperação vazios; WCAG integral e formulários preenchidos/submetidos não certificados.
- Revisão somente-leitura de `src/components/layout/ContaOSSidebar.tsx` identificou links contextuais via `<a href={item.destino}>` em vez do `Link` do roteador, diferente dos demais itens da sidebar. **Hipótese a testar**, não defeito funcional comprovado: navegação completa pode reconstruir AppShell e estado transitório, gerar perda de contexto/flash de carregamento e alterar foco. Não alterar até RED reproduzível e GATE.
- `src/styles.css` usa `--ring: oklch(0.704 0.04 256.788)` em tema claro. A medição histórica do anel isolado em mobile claro foi 2,63014:1, **sem veredito WCAG**: avaliar indicador completo em 1.4.11 e 2.4.11 com estados reais antes de correção.
- Nenhuma credencial, sessão privada, imagem ou versão implantada foi comprovada por este PLAN. Não presumir 208 PASS.

## Gate de trabalho A, sem dependência geral do backend

1. **Matriz de rastreabilidade:** para cada uma das 29 superfícies, registrar rota, módulo, estado de sessão, organização, perfil RBAC, ações disponíveis, tema, largura, screenshot hash, DOM/ARIA, foco, overflow, contraste, versão do bundle e evidência de teste. Separar `PASS_REAL`, `FAIL`, `BLOQUEADO_HML` e `NAO_VERIFICADO`; 232 casos são mínimos, não substituem os 72 itens BRAND.
2. **RED dirigido:** reproduzir comportamento dos links contextuais (troca de organização, retorno/back, scroll, foco, refresh e persistência de estado). Especificar teste de regressão em `src/test/appShellSidebar.test.tsx` e/ou `src/test/visualShell.test.tsx`; se a hipótese não se confirmar, fechar sem alterar produto.
3. **Acessibilidade:** testar indicadores de foco completos, contraste de texto/não-texto, navegação por teclado e escape, zoom 200%/400% com reflow, nome/papel/valor, mensagens dinâmicas, leitor de tela e teclado em formulários preenchidos/submetidos. Não aprovar AA só por pixel/CI estático.
4. **Identidade global:** uma marca oficial transparente na sidebar expandida/recolhida, sem duplicação no header; organização e situação persistentes nas 28 rotas; sidebar com estados ativo/inativo e navegação progressiva, inclusive MASTER, sem expor capacidades indevidas.
5. **E2E protegido:** usar sessões HML legítimas de perfis e organizações A/B; registrar isolamento, links diretos, erro de RPC, mudança de organização e retorno. Não fabricar autenticação, screenshots privadas ou bypass de RLS. Marcar dependências pontuais do backend #139, sem bloquear CSS/teclado público.
6. **BUILD agrupado:** somente após PLAN com dois checks SUCCESS no mesmo HEAD, merge normal, GATE separado aprovado, TDD RED, revisão de escopo e allowlist. Arquivos candidatos: `src/components/layout/ContaOSSidebar.tsx`, `src/components/layout/ContaOSAppShell.tsx`, `src/components/layout/ContaOSOrganizationHeader.tsx`, `src/styles.css`, testes e `scripts/testc/visual-audit.mjs`; nunca alterar `src/integrations/supabase/**` nem `types.ts` sem rito específico.
7. **GREEN e auditoria independente:** typecheck, lint, build, Vitest, Zero-Drift, Teste C, protect-types e matriz 232/232 + 72 itens com artefatos, hashes e revisão independente. Certificar a frente visual somente com evidências completas; CRUD e rastreabilidade continuam gates posteriores da V1.

## Ordem e bloqueios

PLAN (este PR) → **dois checks requeridos SUCCESS no HEAD deste PR** → revisão e merge → GATE separado → TDD RED → BUILD → GREEN → Teste C independente → auditoria HML → checkpoint integrado. Em caso de FAIL, corrigir e reenfileirar; nunca merge sem checks. Nenhuma alteração PROD, backend ou PR #139. Trilha B continua independente. Se a fonte ZIP/manual literal não estiver disponível, registrar indisponibilidade e não inventar leitura.

**Última entrega comprovada antes deste PLAN:** checkpoint frontend #316 integrado conforme instrução de retomada, sujeito à reconfirmação por SHA e CI no GitHub. **Próximo passo:** validar CI e revisão deste PLAN, depois gate separado de escopo e RED dos links contextuais, enquanto prossegue inventário público/privado.
