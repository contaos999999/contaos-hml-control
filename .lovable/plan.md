# Saneamento retrospectivo transversal (Prompts 00–38) — PLAN

PROMPT 38 / V1-17 continua separado, aprovado e pendente. Este plano não o antecipa.

## Baseline verificado
- HEAD `bc120e3b6cdb2069ce225d52d23d6eec2d3fa6e5`, árvore `a3adc4b60fa9bf59644e9eb6e6799b7fce764c8e`.
- `types.ts` está no blob `8ea7750b75fd9d76b29c36ce7613392e3ab65e19`.
- `src/routes/__root.tsx` tem `<html lang="en">` (linha 116). O 404 e o erro global estão em inglês: "Page not found", "Go home", "Something went wrong…", "Try again", além do título e do texto do erro.
- `src/test/brand.test.tsx` cobre 14 arquivos em `ARQUIVOS_MARCA`, mas nenhuma tela de V1-08 a V1-16.
- As 9 telas-alvo já usam `<ContaOSMarca` (2 ocorrências cada) e não têm hex. A previsão é zero alteração nos componentes.

## Correção A — idioma do root
- Arquivo de produção: somente `src/routes/__root.tsx`.
- Mudar `lang="en"` para `lang="pt-BR"`.
- 404: título "Página não encontrada", texto curto em PT-BR e botão "Ir para o início".
- Erro global: título "Algo deu errado", texto "Ocorreu um erro inesperado. Tente novamente ou volte ao início." e botões "Tentar novamente" e "Ir para o início".
- Ficam preservados: `console.error`, `reportLovableError`, `reset`, links, classes e tokens, head e favicons. Nenhum header ou marca novo, conforme a decisão oficial.
- Teste novo `src/test/rootLocale.test.tsx`, escrito primeiro (RED):
  - lê o código-fonte e exige `lang="pt-BR"`, sem `lang="en"`;
  - exige as frases PT-BR acima;
  - proíbe "Page not found", "Go home", "Something went wrong" e "Try again".
- A leitura do fonte é proposital, para não alterar o fluxo do roteador.

## Correção B — cobertura BRAND-01
- Arquivo: somente `src/test/brand.test.tsx`.
- Acrescentar a `ARQUIVOS_MARCA` os 9 caminhos:
  - `contratos/` OrcamentoContrato, RegrasContrato, DocumentosContrato, DocumentoDetalhe, CompetenciasContrato e NovaCompetencia;
  - `competencias/` CompetenciaVisaoGeral, CompetenciaDocumentos e CompetenciaAnalise.
- Novo `it.each` só para os 9 arquivos:
  - **Sem hex de cor:** proibir `#[0-9a-fA-F]{3,8}` somente dentro de `className`, de `style` ou de literais de cor com prefixo `[`. Isso evita falso positivo com SHA, hashes e exemplos.
  - **Sem logo provisório:** proibir `<img` com `src` diferente de `/brand/`.
  - **Sem sistema visual paralelo:** proibir import de `*.css` e de fontes externas (`fonts.googleapis`), além de `createTheme` e `tailwind.config`.
- Testes de componente, de assets SHA-256 e de head: intocados.
- RED esperado: nenhum, porque as telas já estão conformes. A prova de que o teste funciona é um RED controlado em memória: o mesmo matcher aplicado a uma string sintética com `className="bg-[#123456]"` tem que falhar. Isso fica registrado como asserção no próprio teste e nenhum componente é alterado.

## Arquivos permitidos (diff esperado)
- `src/routes/__root.tsx` (troca de strings e de lang, cerca de 8 linhas)
- `src/test/rootLocale.test.tsx` (novo)
- `src/test/brand.test.tsx` (cerca de 30 linhas)
- `docs/frontend/lovable/SANEAMENTO-RETROSPECTIVO-00-38.md` (novo, com as evidências)
- `.lovable/plan.md` e o arquivo arquivado

## Intocáveis
`supabase/**`, `types.ts` (restaurar byte a byte se a plataforma regenerar), `client.ts`, `src/styles.css`, `public/brand/**` e favicons, `src/components/ui/**`, `ContaOSMarca`, package/lock, AGENTS, os 9 componentes, V1-17 e PROD.

## Critérios de aceite e verificação (nada é PASS antes de rodar)
1. `rootLocale.test.tsx`: RED antes da edição do root, depois GREEN.
2. `brand.test.tsx` GREEN, com 14 + 9 telas.
3. Regressão: `app-routing.test.tsx` e full serial `bunx vitest run --maxWorkers=1`, com 739 testes ou mais.
4. eslint nos arquivos alterados, `tsgo`, build automático OK e scan de secrets/static.
5. Browser `/rota-inexistente` (404) em 1440/1280/768/390, claro e escuro: texto PT-BR, foco visível nos botões e contraste. Também `lang` lido do DOM. Erro global apenas por teste (NÃO VERIFICADO no browser se não puder ser induzido). Os fluxos existentes ficam como smoke de login/dashboard, sem sessão real, marcados como limitação.
6. Diff final restrito à lista permitida e blob de `types.ts` conferido.
7. Teste C read-only em turno separado sobre o SHA imutável.

## Ressalvas
- O SHA candidato só existe depois do commit da plataforma; ele será lido no git e informado.
- `tsc` e build manual podem estar bloqueados. Nesse caso ficam como gate externo pendente.

ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE: reutilizar a marca e os tokens existentes, sem hardcodes nem UI nova. Saídas: IDENTIDADE VISUAL a verificar no Teste C. ECONOMIA LOVABLE CONFORME: um BUILD único para A e B, que são independentes. ZERO-DRIFT a verificar.
