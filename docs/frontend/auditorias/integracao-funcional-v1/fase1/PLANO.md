# Auditoria de integração funcional V1: Fase 1

Autorização: plano integral de sete fases aprovado pelo titular nesta conversa; execução e certificação da Fase 1 expressamente autorizadas. Não altera as oito certificações anteriores.

## Escopo e gate

Inventariar todas as telas/rotas existentes na main, componentes, consultas, tabelas, RPCs e Edges; identificar produtores/consumidores, conexões obrigatórias, condicionais e não aplicáveis; registrar grafo e candidatos a telas órfãs. PASS desta fase significa inventário e mapa verificáveis, não execução ponta a ponta.

Baseline frontend: `90ae86432e617b880d603cff379878e623612a73`.
Baseline normativo: `5eca44aebead3183e81b5c1af0d1dffa5fb8feb6`.
HML: `gklhhhyosgasnyoxlrui`. Nenhuma chamada autenticada, mutação ou implantação é necessária nesta fase estática.

## Contexto

Leitura dos 25 documentos do snapshot `CONTEXT_CANONICO_4_1_SNAPSHOT.json`, AGENTS dos dois repositórios, P0, manifesto, certificado V1/Fase 8 e checkpoint. Os blobs normativos serão conferidos contra o snapshot. Requisitos: estrutura V1 001–024, BRAND 000 e NFR 085–096 considerados no mapa, sem nova certificação operacional desses requisitos.

## Execução

1. Conciliar catálogo real, rotas TanStack e superfícies internas, sem forçar a contagem histórica de 27.
2. Extrair dependências transitivas, operações de dados, navegação, cache e evidências com caminho, linha e SHA256.
3. Construir matriz de dados e de todas as combinações de telas, distinguindo ausência de link direto de ausência de relação funcional.
4. Validar cobertura, referências, hashes, conexões e negativos do verificador; revisar independentemente.
5. PR documental, checks exigidos no mesmo HEAD, merge protegido, readback e recibo canônico de conclusão.

## Arquivos permitidos

Somente `docs/frontend/auditorias/integracao-funcional-v1/**` e acréscimo ao `docs/frontend/ESTADO_E_RETOMADA_CONTAOS_4_1.md`. Verificador offline e testes ficam junto aos dados de auditoria. Nenhum código do produto, tipos, rotas geradas, workflow, dependência, backend, Auth, RLS, Storage ou PROD será alterado. Não mudar o PLANO_ATIVO de outra frente.

Rollback: reverter o commit documental por PR. Próxima tarefa após PASS: Fase 2 de navegação autenticada, com gate próprio; V2 permanece condicionada à decisão formal das sete fases por instrução mais recente do titular.

## ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE

Impacto visual N/A: somente inventário/documentação; assets, ContaOSMarca, Design System, tokens e estados preservados. Matriz 1440/1280/768/390 claro/escuro não será recapturada por esta fase estática. Economia: leitura local/GitHub, sem turns Lovable, sem repetir provas aprovadas. Não dispensar checks ou revisão. Nenhum PASS estático equivale a PASS funcional na HML.
