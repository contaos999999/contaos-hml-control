# P0 V1 — Integração das listas com telas existentes
## PROMPT e autorização
Versão V1, ainda não certificada. Correção transversal dos fluxos V1-01→V1-03 e V1-04→V1-06; regulares 22/24/25/27 e revisão herdada sob plano mestre 75. Titular determinou expressamente integrar listas/detalhes/edição e continuar em 06/11/2026. Não implementar desativação de contrato ou rota nova sem requisito/contrato comprovado.
Baseline main 8c3c1987b50f4f4d235b7430ac3ab4ac2aac0dbb; candidato visual PR226 6b0343b2be5009a13f54a99e897ab27e410c9853 preservado. Fonte normativa HEAD 01fa7d7a803ba8507a5ca6d89eb4ce45b2893bea, conferido ao vivo, igual ao manifesto; não altera fontes nem certificação.
FAIL real: com MASTER, V107 concorrência, contratante TESTE VISUAL P0 06112026 - SEM VALIDADE e contrato TESTE-VISUAL-P0-06112026 foram criados pelo navegador. As duas listas exibem registros, mas células/cards sem links; clique não navega. Evidência PR226 comentário6689741619.

## Contrato fechado
Somente:
- src/components/contratos/ListaContratos.tsx
- src/components/contratantes/ListaContratantes.tsx
- src/test/contratos.test.tsx
- src/test/contratantes.test.tsx
- este documento, docs/frontend/planos/PLANO_ATIVO.json e docs/frontend/ESTADO_E_RETOMADA_CONTAOS_4_1.md para evidências.

Adicionar link semântico pelo número do contrato para /contratos/$id e pela razão social para /contratantes/$id/editar, nos layouts tabela e card móvel. Reutilizar Link TanStack e o ID recebido da lista filtrada da organização. Rota de destino continua verificando autorização própria; link não concede edição ou acesso. Não alterar consultas, filtros, dados, permissões, nomes de rotas, componentes compartilhados, marca ou tokens. Não editar routeTree.gen.ts nem types.ts (8ea7750b75fd9d76b29c36ce7613392e3ab65e19), backend, Auth, RLS, Storage, dependências ou PROD. Não publicar nem mesclar PR226 sem provas.
Contrato FE/BE: somente navegação usa IDs já presentes nos SELECT existentes; zero RPC/DML nova. EditarContratante e VisaoGeralContrato existentes fazem suas verificações. A listagem permanece somente leitura.
Teste legado contratantes exige nenhum link criar/editar: atualizar SOMENTE essa asserção de apresentação para links esperados, mantendo zero DML/RPC/Edge da lista. Isto atende a determinação atual de integração, não reduz autorização backend.

## Execução e provas
- [ ] CI do plano documental antes do BUILD; atualização do manifesto com referência da emenda.
- [ ] RED: testes de href exato por ID em tabela e lista compacta, por ambos módulos; zero links para registro inexistente no vazio/negado; zero DML mantido.
- [ ] GREEN: links mínimos, nomes acessíveis e foco visível em tokens atuais.
- [ ] Regressão completa; typecheck/build/Zero-Drift/GOV020/hash; dois CI verdes no HEAD exato.
- [ ] Revisão de diff sem alteração de regras e testes de segurança preservados.
- [ ] Teste C separado: MASTER real abrir registros sintéticos já existentes, sem duplicar; conferir organização/cabeçalho/menu e voltar para lista. Desktop e mobile 1440/1280/768/390 claro/escuro, teclado/foco/sem overflow. Não aprovar telas internas ainda não visitadas.
- [ ] Depois continuar orçamento/base normativa/regras/documentos/competências e demais criações autorizadas pelo navegador, registrando impedimentos reais.
Rollback: revert do commit mínimo de links, sem apagar registros sintéticos nem alterar schema. Sem force push.

## Validação
Escopo frontend e compatibilidade com dados existentes conferidos por fontes e criação/leitura real. Sem lacuna backend para estes dois links. Aprovação de navegação concedida pela determinação expressa do titular; nenhuma alteração de identidade visual. BUILD bloqueado até CI do plano SUCCESS. A revisão integral e os 72 BRAND permanecem NÃO VERIFICADOS.

## ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE (OBRIGATÓRIO)
Marca: ContaOS Brand v1.0 / BRAND-01; preservar assets oficiais, ContaOSMarca, Design System e tokens (REUTILIZAR > ESTENDER > CRIAR), componentes e estados; sem hardcodes, redesign ou bibliotecas paralelas. Baseline visual PR226, risco de links quebrados/ID obsoleto e matriz 4 resoluções × 2 temas. BUILD mantém consistência; TESTE/TESTE C sem alteração de código. Impacto: apenas acesso por link, nenhum asset/cor/fonte.
Economia Lovable: GitHub direto, sem BUILD do agente Lovable; aproveitar registros sintéticos existentes, não duplicar suítes sem mudança e não pular TDD/CI/segurança/validação visual.
IDENTIDADE VISUAL NÃO VERIFICADO até Teste C; ECONOMIA LOVABLE CONFORME; ZERO-DRIFT depende de CI real. V1 NO-GO, V2/PROD bloqueadas.
