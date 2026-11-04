# GOV-017 — PLAN: crivo da logomarca transparente em todas as telas

**Data:** 04/11/2026 (Brasília). **Estado:** PLAN, sem BUILD. **Origem:** solicitação expressa do usuário nesta conversa para eliminar fundo preto/navy da logomarca sobre gradiente e exigir crivo visual a cada módulo.

## 1. BASE E DIAGNÓSTICO CONFIRMADO
- Frontend: `contaos999999/contaos-hml-control/main@f58265fd595eae5ba5bae8406dc75b2c95afc2b0`; PR #30 e #32 integrados; GitHub Actions Teste C 24 telas × 4 larguras × 2 temas. Fonte normativa `contaos999999/develop/main@a10d3b1a1a14276c017027f93ec2a7aace4d6cb6`; snapshot de 25 documentos e catálogo 100/97 inalterados.
- `public/brand/ContaOS_Logo_Horizontal_Mono_Branco.svg` contém literalmente `<rect width="100%" height="100%" fill="#0F172A"/>` em todo o canvas. O arquivo é usado por `src/components/brand/ContaOSMarca.tsx` e se sobrepõe aos gradientes/glows da área institucional do login, recuperação de senha, redefinição de senha e seleção de organização. É um problema reproduzível de SVG, não de CSS do gradiente.
- `public/brand/ContaOS_Logo_Horizontal_Mono_Navy.svg` não possui fundo integral. `ContaOS_Simbolo_Branco.svg` e `ContaOS_Simbolo_Navy.svg` também não possuem fundo integral. O símbolo possui pequenos círculos internos navy/branco, parte da marca, **não** um fundo chapado.
- `src/test/brand.test.tsx` fixa SHA-256 dos **assets oficiais originais**. Não sobrescrever, renomear ou distorcer a marca oficial nem invalidar seu manifesto.
- `src/routes/login.tsx`, `esqueci-senha.tsx`, `redefinir-senha.tsx` e `selecionar-organizacao.tsx` usam o mesmo `ContaOSMarca`. Demais telas com header usam o componente, reduzindo correção a um único ponto.
- A auditoria existente `scripts/testc/visual-audit.mjs` inclui 24 superfícies, 4 larguras e 2 temas; telas privadas sem login real não podem ser declaradas visualmente verificadas.

## 2. DECISÃO DE IDENTIDADE VISUAL E APROVAÇÃO HUMANA
**Aprovado expressamente pelo usuário:** criar aplicação da logomarca branca com fundo **transparente**, em vez do bloco navy sobre gradiente, e tornar o crivo visual obrigatório após cada módulo (mensagens do usuário: “após a conclusão de um módulo deve passar pelo crivo da identidade visual…” e “faça tudo”). Aprovação restrita à remoção do retângulo de fundo de **variante derivada**, conservando traços, polígonos, proporções, fontes, cores da marca e hashes oficiais. Não alterar visual geral/UX além do necessário.

## 3. PLAN: ESCOPO FECHADO DE BUILD, APÓS ESTE PLAN E GATE VERDES
Arquivos **novos**:
- `public/brand/ContaOS_Logo_Horizontal_Mono_Branco_Transparente.svg`: cópia fiel do SVG branco **sem apenas o primeiro `rect` que cobre 100% do canvas**. Não inserir novas formas nem alterar atributos de formas do logotipo. Preservar original.
- `docs/frontend/auditorias/GOV_017_BRAND_SEM_FUNDO_2026-11-04.md`: evidências de ocorrência, testes, prints, SHA original/derivado, ressalvas.
Arquivos **alteráveis**:
- `src/components/brand/ContaOSMarca.tsx`: alterar exclusivamente `src` da variante horizontal branca para nova variante transparente; manter variante navy para superfície clara, símbolos transparentes, CSS por tema e dimensões.
- `src/test/brand.test.tsx`: TDD com invariantes: nunca usar SVG com retângulo integral no componente; novo SVG com mesmo conteúdo gráfico restante que o original; original mantém SHA; telas com Marca continuam usando componente; sem PNG opaco nos pontos dinâmicos.
- `docs/frontend/ESTADO_E_RETOMADA_CONTAOS_4_1.md`: checkpoint com HEADs, PRs, CI, próxima tarefa.
- `docs/frontend/lovable/BRAND-01.md`: nota de aplicação autorizada e política futura do crivo pós-módulo, sem substituir norma canônica.

**Proibidos:** todos os demais caminhos, especialmente `supabase/**`, `src/integrations/supabase/**`, auth, RPC, RLS, Edge, `types.ts`, migrations, `src/styles.css`, layout de rotas, temas globais, PROD, assets oficiais já certificados e workflows sem PLAN próprio. Nenhum novo token/paleta.

## 4. EXECUÇÃO BLOQUEANTE
1. Commit deste PLAN, PR e CI verde com dois checks antes do BUILD.
2. Gate separado: `PLANO_ATIVO.json` atualizado e VALIDADO para GOV-017, com paths exatos, confirmação 25/25, contexto, atômico 000 e aprovação humana acima, commit/CI próprio. Se não houver gates verdes, não iniciar BUILD.
3. TDD RED: primeiro testar existência de variante transparente e correspondência com o original após remover **somente** `<rect width="100%" height="100%" fill="#0F172A"/>`; capturar falha dos novos testes com fonte anterior.
4. GREEN: adicionar derivado (sem alterar original) e redirecionar o componente compartilhado, sem alterar rotas/código de negócio.
5. CI completo, teste estático de integridade/Byte SHA oficial, 24 superfícies 1440/1280/768/390 × light/dark, capturas e SHA256SUMS Teste C. Public/privado classificados corretamente.
6. Dossiê e checkpoint pós-merge. **Somente depois** iniciar PLAN do PROMPT 40/V1-19 em novo escopo.

## 5. CRIVO OBRIGATÓRIO DE MARCA AO FINAL DE CADA MÓDULO
Verificar: (a) asset correto com canal alpha sem fundo embutido sobre gradiente/imagem/textura, (b) contraste real e acessibilidade, (c) proporção/área de respiro e responsividade, (d) 1440/1280/768/390 claro/escuro, (e) integridade de fontes oficiais, (f) navegação e brand nos estados loading/vazio/erro e (g) artefatos e evidências. Aplicação universal do `ContaOSMarca`; nunca usar a variante opaca em superfícies compostas. Testes com sessão real exigem evidência HML distinta, nunca PASS por mock.

## 6. ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE (OBRIGATÓRIO)
PROMPT 000/BRAND-01 e `19_IDENTIDADE_VISUAL_OFICIAL_BRAND_1_0.md` prevalecem para identidade; PRD, arquitetura, Design System, RNF, Auth e RLS prevalecem para regras e fluxos. Reutilizar > estender > criar. Sem novos tokens, sem libs, sem redesign, sem cores hardcoded em componentes, sem prompt repetido Lovable; todo trabalho GitHub, escopo mínimo. Provar o que for verificável e registrar lacunas de HML. Reverter somente por PR, sem force push.
