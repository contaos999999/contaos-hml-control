# P0 CRUD V1: seleção de arquivos e proteção do envio normativo

> Execução nativa autorizada pelo titular no pedido de conclusão integral do CRUD. BUILD somente após este plano integrado e ambos os checks aprovados.

**Objetivo:** permitir escolher qualquer arquivo do escopo autorizado e impedir comandos normativos concorrentes originados pelo mesmo formulário.
**Arquitetura:** React/TypeScript, paginação Supabase já existente e RPCs oficiais. Sem alteração de regras ou persistência no frontend.
**Referências:** requisitos V1-CON-001/002/003, telas V1-07 e V1-08, fonte backend `4fec09bf5cab5afc776192b9bef6e70728e1a058`; plano mestre V1. Leitura das funções e RLS HML confirmou o contrato existente. Os 25 documentos e catálogo 100/97 permanecem iguais.

## Falhas confirmadas e solução

1. Os seletores de arquivo em `DialogoVersao` e `FormVersao` consultam sempre a página 0. `listarArquivos(org, contrato, pagina, signal)` já retorna páginas de 25, com total e ordem estável. Adicionar navegação anterior/próxima, estado de página na chave e consulta, mantendo organização/contrato exatos. Incluir usuário na chave orçamentária, recebido do contexto já autenticado. Preservar ID e nome do arquivo selecionado ao trocar página, com seleção visível e sem trocar silenciosamente por outro arquivo. Normativa continua permitindo apenas arquivo aprovado; orçamento mantém o contrato atual, que permite arquivo pendente no rascunho e exige aprovação na publicação. Upload concluído volta à página 0 e atualiza consultas do seletor no contexto correto.
2. `useAcao` normativo renova chave e chama `mut.reset()` quando campos mudam. Durante RPC pendente, isso pode liberar outro envio com chave diferente. Adicionar trava síncrona independente e estado de envio, preservar a chave e impedir renovação até terminar. Desabilitar os campos e fechamento/cancelamento durante envio nos quatro diálogos que usam esse hook. O handler também precisa recusar segunda chamada, inclusive antes da renderização seguinte. Liberar a trava no encerramento da chamada. Repetição de erro técnico com os mesmos campos mantém a mesma chave, conforme comportamento atual.

Alternativas descartadas: buscar todos os arquivos viola paginação; aumentar limite apenas adia a falha; depender só do botão desabilitado mantém a corrida. A solução usa a API paginada existente e uma trava local curta, sem duplicar a autoridade do Supabase.

## Allowlist fechada

- `src/components/contratos/BaseNormativaContrato.tsx`
- `src/components/contratos/OrcamentoContrato.tsx`
- `src/test/baseNormativa.test.tsx`
- `src/test/orcamento.test.tsx`
- `docs/frontend/planos/P0_CRUD_ARQUIVOS_ENVIO_NORMATIVO_2026-11-07.md`
- `docs/frontend/planos/PLANO_ATIVO.json`
- `docs/frontend/ESTADO_E_RETOMADA_CONTAOS_4_1.md`

Não alterar adaptadores compartilhados, `types.ts`, cliente Supabase, rotas/árvore, UI compartilhada, assets/estilos globais, dependências, SQL, RLS, Auth, Storage, Edge, workflows ou PROD.

## Tarefa 1: acesso aos arquivos de todas as páginas

Interface consumida: `listarArquivos(org: string, contrato: string | null, pagina: number, signal?: AbortSignal): Promise<Pagina<ArquivoResumo>>`. Produz seleção de ID existente para as mesmas RPCs de registro de versão; nenhum parâmetro backend muda.

- [ ] Escrever testes para 26 arquivos, página 1 com arquivo antigo aprovado e envio desse ID.
- [ ] Verificar RED: controle de próxima página ausente e arquivo antigo inacessível.
- [ ] Implementar página e controles de 44px, nome acessível, limite correto e estados de loading/erro/retry. Contrato global normativo mantém `contrato=null`; orçamento usa o contrato atual.
- [ ] Verificar preservação da seleção ao voltar de página e envio do ID escolhido, sem substituição silenciosa. Página entra na chave e no range server-side.
- [ ] Confirmar GREEN nas duas suítes, incluindo pendente negado na normativa e permitido no rascunho orçamentário.

## Tarefa 2: uma intenção normativa em envio

Interface existente de `useAcao(onConcluir)` é interna ao componente. Preservar `mut.error`, `mut.isPending`, `mut.mutate` e `renovar` usados pelos quatro diálogos, acrescentando controle independente de execução. As RPCs e argumentos ficam iguais.

- [ ] Escrever teste de Nova fonte e Nova versão com RPC controlada: enviar, tentar alterar campos, repetir clique/submissão, verificar uma chamada e chave imutável.
- [ ] Verificar RED do cenário de mudança de campo durante envio.
- [ ] Implementar trava, impedir reset/renovação enquanto pendente, bloquear campos e fechamento. Não remover bloqueios por fundamento, confirmação, conflito ou validação.
- [ ] Confirmar que liberação após erro técnico permite repetir os mesmos campos com a mesma chave; sucesso conclui uma única vez. Nenhum retry automático.
- [ ] Confirmar GREEN de aprovar versão e aplicabilidade, que compartilham o hook.

## Pontos da revisão e saída

- Arquivo selecionado fora da página atual continua visível pelo nome e é o ID enviado.
- Página vazia/erro não escolhe automaticamente outro arquivo.
- Normativa não passa a aceitar arquivo pendente por causa da paginação.
- Duplo clique e alteração programática não vencem a trava síncrona.
- Fechar por Escape, X ou Cancelar durante envio não cria outro formulário concorrente.

Cada ponto acima deve ter teste no componente que o controla. Executar regressão completa, TypeScript, build, lint focal e guard de escopo. Dívida Prettier legada permanece explícita; não reformatar arquivos inteiros. Revisão independente e dois checks no SHA final antes do merge. Teste C público não certifica UI privada. Rollback reverte apenas esse delta frontend.

## ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE

GitHub + Actions são canônicos. Reusar botões, tokens, diálogos e padrão de paginação existente. Preservar BRAND-01, PT-BR, foco e teclado. Conferir 1440/1280/768/390, claro/escuro, nos estados aplicáveis; prova privada permanece não verificada até execução real. Tipos fixos no blob `8ea7750b75fd9d76b29c36ce7613392e3ab65e19`. Não antecipar certificação V1, V2 ou PROD.

## Resultado integrado em 07/11/2026

PLAN #258 integrado em `91ad659551cb9c367cde53f00c9d0d5c140c7caa`, após run `42336635664` com ambos os checks SUCCESS. BUILD #259: HEAD `9f4a19ca2115123d6d3e01d740dc13f725caa2d3`, ambos os checks SUCCESS no run `42337202155`, merge `524c870e654d80b3f026cd17c5ffab5b6fcf5bc5`.

RED real no run `42336809205`: quatro falhas específicas e 1.067 testes anteriores aprovados. GREEN final: **1.075/1.075**, 40 suítes, TypeScript, build e guardas do Zero-Drift aprovados. Revisão independente sem achados críticos/importantes. Cobertura inclui seleção antiga/global, preservação de ID, erro de leitura e retry, upload com retorno à primeira página, quatro diálogos em envio, duplo clique antes da renderização, Escape e X. A dívida de formatação legada não foi declarada resolvida.

O executor local falhou ao iniciar por timeout ERS. A sequência RED/GREEN foi executada no GitHub Actions, sem alterar workflows ou contornar gates. Teste C público aprovado; interface privada autenticada continua não verificada. Sem alteração de backend ou PROD.
