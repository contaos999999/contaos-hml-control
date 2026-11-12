# Fase 1: inventário e matriz de integração funcional V1

## Resultado técnico

**PASS estático de inventário e mapeamento**, sujeito aos checks obrigatórios, revisão independente e integração protegida deste conjunto. O recibo final no GitHub identifica o HEAD integrado e os checks efetivamente concluídos. Esta fase não atribui PASS de execução na HML às conexões.

Baseline frontend: `90ae86432e617b880d603cff379878e623612a73`. Backend normativo: `5eca44aebead3183e81b5c1af0d1dffa5fb8feb6`. HML: `gklhhhyosgasnyoxlrui`.

## Reconciliação das telas

27 = 23 V1 + SYS01 + SYS04 + SYS05 + ADM01. SYS02/SYS03 são auxiliares igualmente inventariadas. Catálogo real contém 29 superfícies/28 rotas; PRIVATE_SURFACES tem 26, não 27. Certificações antigas preservadas sem atribuir execução nova.

O certificado V1/Fase 8 e o manifesto P0 atuais são preservados. A expressão histórica “27 autenticadas” não é usada como contagem técnica: o executor declara 26 privadas. A decisão mais recente do titular exige a auditoria funcional complementar antes da V2.

| ID | Tela | Rota | Componente |
|---|---|---|---|
| SYS01 | Login | `/login` | `LoginForm` |
| SYS02 (auxiliar) | Esqueci a senha | `/esqueci-senha` | `ForgotPasswordForm` |
| SYS03 (auxiliar) | Redefinir senha | `/redefinir-senha` | `ResetPasswordForm` |
| SYS04 | Organizações | `/selecionar-organizacao` | `OrganizationSelector` |
| SYS05 | Painel | `/` | `Dashboard` |
| ADM01 | Usuários e vínculos | `/administracao/usuarios` | `AdminUsuarios` |
| V101 | Contratantes | `/contratantes` | `ListaContratantes` |
| V102 | Novo contratante | `/contratantes/novo` | `NovoContratante` |
| V103 | Editar contratante | `/contratantes/$id/editar` | `EditarContratante` |
| V104 | Contratos | `/contratos` | `ListaContratos` |
| V105 | Novo contrato | `/contratos/novo` | `NovoContrato` |
| V106 | Visão geral do contrato | `/contratos/$id` | `VisaoGeralContrato` |
| V107 | Base normativa | `/contratos/$id/base-normativa` | `BaseNormativaContrato` |
| V108 | Orçamento | `/contratos/$id/orcamento` | `OrcamentoContrato` |
| V109 | Listas e regras | `/contratos/$id/regras` | `RegrasContrato` |
| V110 | Documentos do contrato | `/contratos/$id/documentos` | `DocumentosContrato` |
| V111 | Detalhe e versões do documento | `/contratos/$id/documentos/$idDocumento` | `DocumentoDetalhe` |
| V112 | Competências do contrato | `/contratos/$id/competencias` | `CompetenciasContrato` |
| V113 | Nova competência | `/contratos/$id/competencias/nova` | `NovaCompetencia` |
| V114 | Visão geral da competência | `/competencias/$id` | `CompetenciaVisaoGeral` |
| V115 | Documentos da competência | `/competencias/$id/documentos` | `CompetenciaDocumentos` |
| V116 | Análise da competência | `/competencias/$id/analise` | `CompetenciaAnalise` |
| V117 | Requisito e evidências | `/competencias/$id/analise` | `RequirementDrawer` |
| V118 | Parecer interno | `/competencias/$id/parecer` | `CompetenciaParecer` |
| V119 | Apresentação | `/competencias/$id/apresentar` | `CompetenciaApresentar` |
| V120 | Protocolo e pacote | `/competencias/$id/apresentacoes/$apresentacaoId` | `CompetenciaProtocolo` |
| V121 | Histórico | `/contratos/$id/historico` | `HistoricoContrato` |
| V122 | Importação histórica | `/contratos/$id/historico/importar` | `ImportarHistorico` |
| V123 | Trilha de auditoria | `/administracao/auditoria` | `TrilhaAuditoria` |

## Método e rastreabilidade

Foram selados 171 arquivos frontend, árvore gerada e catálogos. O inventário contém 204 referências de dados, 54 nomes RPC versionados e 167 pontos de consulta/atualização/cache. Os 25 blobs normativos foram comparados com o snapshot e são idênticos. Cada referência tem arquivo, linha e trecho; as fontes possuem SHA256 e blob Git.

O fechamento transitivo de imports é conservador: uma função presente em módulo importado pode não ser chamada pela tela. As listas de RPCs incluem contratos tipados/dispatch, e as tabelas por RPC são candidatas extraídas de SQL, não um rastreamento executado. Os dados exatos diretamente consultados, produtores, consumidores e invariantes estão em `TELAS.csv`, `CONEXOES.csv` e `inventario.json`. Nenhum nome encontrado prova que uma requisição ocorreu.

Foram incluídos separadamente AppShell, cabeçalho, copiloto, gerenciamento de cadastros e listas. Organização e contrato compartilham um editor genérico; o fechamento de módulos pode listar comandos das duas entidades, cujo contexto e validação separam o alvo. O copiloto embutido depende do contrato/competência e consome a Edge `copilot-query`, sem criar uma tela V4 nova.

## Matriz e grafo

577 relações catalogadas; 812 pares direcionados entre as 29 superfícies classificados. O arquivo JSON contém o grafo integral, `GRAFO.mmd` oferece uma visão dos dados essenciais e o CSV lista cada aresta. Um par `NA_LIGACAO_DIRETA` indica que não se exige salto direto; relações indiretas e testes E2E continuam aplicáveis.

| Relação | Quantidade |
|---|---:|
| auditoria_esperada | 18 |
| dados_esperados | 120 |
| drawer | 2 |
| menu_compartilhado | 193 |
| menu_contextual | 127 |
| navegacao_literal | 117 |

## Invariantes e plano de comprovação

| Integração | Identificadores e efeito esperado | Próxima prova |
|---|---|---|
| Organização e usuários | organização selecionada, sessão, vínculo, RBAC e escopo; preferência local não concede autorização | Fases 2, 3 e 5 |
| Contratante e contrato | mesmo `id_contratante`, `id_organizacao` e `contratos.id`; edição mantém referências | Fases 3 e 4 |
| Fontes, orçamento e listas | versões, vigência, aplicabilidade, fonte aprovada e requisitos da competência | Fases 3, 4 e 6 |
| Documentos | documento/arquivo/versão/hash pertencem ao contrato ou competência; versão anterior preservada | Fases 3, 4 e 6; R-01 delimitada |
| Análise e requisito | competência, execução, resultado, evidência e revisão humana rastreáveis | Fases 4 e 6 |
| Parecer e apresentação | parecer aprovado e hash/contexto atual; 100% obrigatório; pacote imutável e protocolo | Fase 6 |
| Histórico | relatório, apontamento, resposta e desfecho do próprio contrato; regra material exige aprovação | Fases 3 e 6; R-02 delimitada |
| Auditoria e cache | eventos/rastreabilidade e consultas atualizadas entre telas após mutações e novo login | Fases 3, 4 e 6 |

## Órfãs, lacunas e limites

Nenhuma superfície tem grau zero no mapa estático. Isso não certifica alcançabilidade autenticada: menus dependem de permissões/contexto; SYS03 recebe entrada externa pelo fluxo de recuperação, V117 exige requisito selecionado e V120 exige apresentação existente. A Fase 2 deve executar as transições, registrar botões sem ação e testar recarga/voltar/URL direta.

A matriz de produtores/consumidores define obrigações a testar, não afirma que todas já estão implementadas sem defeitos. Atualização entre módulos, invalidação de cache, vigência/snapshot de listas, mudança pós-liberação e propagação de permissões são riscos de integração reservados às fases 3–6. Não foi constatado defeito de produto por execução nesta fase estática.

| Ressalva preservada | Escopo exato |
|---|---|
| R-01 | upload físico E2E/arquivo grande e retomada |
| R-02 | worker/filas E2E em fluxo integral |
| R-03 | isolamento real multiusuário/organização em todos os domínios |

As ressalvas não são PASS_REAL e não dispensam segurança, integridade ou fluxo essencial na nova auditoria. Não houve login, SQL remoto, upload, pergunta OpenAI, mutação, deployment ou acesso PROD.

## Reprodução e gate

```bash
python docs/frontend/auditorias/integracao-funcional-v1/fase1/verificar.py --verificar
python docs/frontend/auditorias/integracao-funcional-v1/fase1/test_verificar.py
```

Para regenerar em checkout normativo fixado: `python docs/frontend/auditorias/integracao-funcional-v1/fase1/verificar.py --gerar /caminho/do/backend-normativo`. Alteração de código/catálogo exige regeneração e nova revisão. O verificador reconstrói as expectativas pelo código real e por catálogo RPC normativo com SHA256 fixado. Rejeita remoção coordenada de RPCs/conexões, componente/arquivo de rota incorretos, definição normativa ausente, classificação ou justificativa adulterada e alegação indevida de PASS runtime. As vistas CSV também são reconstruídas e comparadas.

Checks Zero-Drift, Teste C Independente e proteção de tipos permanecem obrigatórios. Para escopo documental, a própria política existente de Teste C declara recaptura visual N/A; isso não substitui testes autenticados futuros. Resultados reais e recibo de integração serão registrados no PR/checkpoint.

## ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE

Impacto visual N/A: nenhum código de produto/asset/token foi alterado; sem recaptura de 1440/1280/768/390 claro/escuro nesta fase. Economia conforme: ferramentas diretas, sem consumo de turn Lovable ou repetição de provas certificadas. Zero-Drift deve ser conferido por diff e CI no HEAD final.

## Continuidade

Última etapa desta entrega: inventário completo e mapa estático reproduzível. Próxima tarefa: Fase 2, navegação autenticada das 27 telas do núcleo e das duas auxiliares, sem reabrir as oito certificações anteriores. Fases 2–7 desta auditoria complementar não foram executadas por esta entrega.
