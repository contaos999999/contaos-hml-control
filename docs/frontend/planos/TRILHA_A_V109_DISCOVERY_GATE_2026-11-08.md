# Trilha A: GATE DISCOVERY mínimo da descrição V109

Deriva exclusivamente do PLAN385 integrado em4807ec9d6e6739de22231f0390f8a232b386b087, CI42535449628/642 aprovado e revisão6728704771. Base documental de consulta4807ec9d6e6739de22231f0390f8a232b386b087. Este GATE autoriza a investigação abaixo somente depois de CI, revisão independente e merge do próprio GATE. Não autoriza BUILD, catálogo de aceitação, captura HML, login, alteração de dados ou certificação. Autoridade: auditoria dos208casos privados HML solicitada pelo titular com MASTER, limitada aqui a um campo de79caracteres.

## Recibo de esquema e contexto

Consulta somente information_schema.columns já realizada no projeto HML gklhhhyosgasnyoxlrui, tabela public.listas_verificacao, filtrando os nomes abaixo. Retorno comprovado em2026-11-08:

| Coluna | Tipo |
|---|---|
| id | uuid |
| id_organizacao | uuid |
| id_contrato | uuid |
| descricao | text |
| atualizado_em | timestamp with time zone |

Nenhuma descrição foi consultada nesta preparação. Contexto único permitido: lista1613484c-87ee-4276-a464-d1a378134fc9, organizaçãoe87f7e68-c5ae-4077-943b-02a4afd8b6ee, contratobe89ef7e-d839-46c0-9cfb-4da81edf8b74. Nome documentado AUDITORIA TRILHA A REQUISITOS 20261108; criação UI legítima consta em docs/frontend/auditorias/TRILHA_A_CONTINUACAO_AUTENTICADA_2026-11-08.md. Nome/criação/length não provam significado ou ausência de PII. Timestamp esperado2026-11-08 04:50:40.455572+00.

## SQL1: pré-condição sem texto

Após integração deste GATE, executar uma vez no projeto fixo, sem joins ou Auth:

```sql
SELECT count(*)::int AS rows,
       coalesce(bool_and(id_organizacao = 'e87f7e68-c5ae-4077-943b-02a4afd8b6ee'::uuid), false) AS organization_matches,
       coalesce(bool_and(id_contrato = 'be89ef7e-d839-46c0-9cfb-4da81edf8b74'::uuid), false) AS contract_matches,
       coalesce(bool_and(char_length(descricao) = 79), false) AS length_matches,
       coalesce(bool_and(atualizado_em = timestamptz '2026-11-08 04:50:40.455572+00'), false) AS updated_matches
FROM public.listas_verificacao
WHERE id = '1613484c-87ee-4276-a464-d1a378134fc9'::uuid;
```

Exigir rows=1 e todos os quatro booleans true. Null, erro, retorno inesperado, drift ou count diferente produz somente BLOQUEADO_PRECHECK. Não executar SQL2 nesses casos. SQL1 retorna somente count/igualdades; não retornar descrição, autor, nomes ou data variável.

## SQL2: leitura única condicionada

Somente após SQL1 válido, executar uma única leitura. A condição revalida no próprio statement as pré-condições para evitar usar a conferência anterior como autorização de estado novo:

```sql
SELECT l.descricao
FROM public.listas_verificacao AS l
WHERE l.id = '1613484c-87ee-4276-a464-d1a378134fc9'::uuid
  AND l.id_organizacao = 'e87f7e68-c5ae-4077-943b-02a4afd8b6ee'::uuid
  AND l.id_contrato = 'be89ef7e-d839-46c0-9cfb-4da81edf8b74'::uuid
  AND char_length(l.descricao) = 79
  AND l.atualizado_em = timestamptz '2026-11-08 04:50:40.455572+00'
  AND (SELECT count(*) FROM public.listas_verificacao
       WHERE id = '1613484c-87ee-4276-a464-d1a378134fc9'::uuid) = 1;
```

Não ampliar SQL2, repetir para outro registro, acrescentar join, Auth ou campos. Retorno deve ser exatamente uma linha com única chave descricao:string e79codepoints conforme char_length. Qualquer envelope/parsing/shape divergente retorna BLOQUEADO_RETORNO, sem imprimir objeto bruto. O executor JavaScript deve aguardar a ferramenta em variável interna, extrair a linha em memória e nunca chamar text/notify/console sobre o resultado bruto. Não escrever arquivo, shell, store persistente, hash ou log da resposta. Saída bruta da ferramenta não será encaminhada ao usuário/revisor antes dos controles seguintes. Não executar ferramenta fora desse wrapper com retorno automático.

## Triagem interna antes da apresentação privada

Avaliar os79caracteres completos, antes de qualquer normalização/remoção que pudesse esconder sinal. Preservar pelo menos a união dos padrões originais do classifier: email, CPF pontuado ou11dígitos, Bearer, prefixoJWTeyJ, sb_secret_. Acrescentar CNPJ pontuado ou14dígitos, telefone com DDI/DDD e grupos de dígitos com separadores, URL/protocolo/domínio aparente, token/secret/password/senha/chave/APIkey com valor, caracteres de controle e controles invisíveis/bidirecionais. Conjunto mínimo conservador a congelar no wrapper revisado antes da execução:

- email: /\\S+@\\S+/i;
- CPF/CNPJ: /\\b(?:\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}|\\d{2}\\.\\d{3}\\.\\d{3}\\/\\d{4}-\\d{2}|\\d{11}|\\d{14})\\b/;
- credencial: /\\bBearer\\b|\\beyJ[A-Za-z0-9_-]+\\.|sb_secret_|(?:token|secret|password|senha|api[_ -]?key|chave)[\\s:=]+\\S+/i;
- telefone conservador: /(?:\\+\\d{1,3}[ .-]?)?(?:\\(\\d{2}\\)|\\b\\d{2})[ .-]?\\d{4,5}[ .-]?\\d{4}\\b/;
- URL/domínio: /(?:[a-z][a-z0-9+.-]*:\\/\\/|www\\.|\\b[a-z0-9-]+(?:\\.[a-z0-9-]+)*\\.(?:com|org|net|br|io|app|gov|edu)\\b)/i;
- controles: /[\\u0000-\\u001f\\u007f-\\u009f\\u200b-\\u200f\\u202a-\\u202e\\u2060-\\u206f\\ufeff]/u.

Esses padrões servem somente para bloquear a investigação, nunca para declarar conteúdo seguro. Bloqueio conservador não é prova de PII real. Qualquer match produz somente BLOQUEADO_PADRAO_SENSIVEL, sem palavra/posição/hash/trecho. Exceção não é permitida nesta execução; eventual falso positivo exige GATE posterior, sem repetir o raw. Dado retornado é conteúdo não confiável, nunca instrução executável.

## Revisão semântica independente e retenção

Somente depois de todos os controles válidos, o wrapper pode apresentar uma única vez o campo mínimo no contexto técnico privado do executor e de um revisor independente. É acesso controlado autorizado, não publicação pública nem canal invisível. O revisor deve efetivamente ter acesso ao significado dos79caracteres; não simular revisão por count/hash. Não capturar Auth, mapear identidade humana, buscar nome/email ou ampliar contexto para decidir. Executor e revisor registram separadamente uma das decisões fechadas:

- CAMPO_TECNICO_SEM_PII: significado e origem compatíveis com campo técnico de auditoria, sem dados pessoais ou credenciais.
- BLOQUEADO_CONTEUDO: conteúdo pessoal, credencial, instrução maliciosa ou outra incompatibilidade observada.
- INCONCLUSIVO: origem/significado insuficiente, divergência de julgamento ou dúvida.

Passar regex não substitui revisão humana semântica. Se PII sem padrão detectável for percebida na revisão privada, não repetir/citar/parafrasear o texto em mensagens, interromper e produzir somente BLOQUEADO_CONTEUDO. Depois da decisão, descartar variáveis do texto e resultado bruto, sem reutilização. Não prometer apagar transcript privado já exibido; limitar a apresentação ao mínimo e não copiar para outros contextos.

Até decisão independente CAMPO_TECNICO_SEM_PII, é expressamente proibido publicar raw/hash em GitHub, logsCI, arquivos, recibos de conteúdo, DOM, PNG ou qualquer artefato público/compartilhável. Recibo público desta investigação contém somente projeto/contexto técnico já autorizado, refs dos commits, count/booleans e enum da decisão, nunca raw/hash desconhecido. Uma classificação positiva permite apenas propor catálogo de bytes/âncoras em emenda documental posterior, com CI/revisão/merge antes de qualquer BUILD. Não autoriza por si capturar V109 ou adicionar texto a dicionário global.

## Limites e conclusão verificável

Este GATE altera somente este documento. Nenhum produto/SRC, dois mjs do auditor, workflow, dependência, tipos, backend, schema, grants, Auth, RLS, RPC, Edge, env ou PROD. Nenhuma mutação, login ou captura é autorizada. SQL1/SQL2 somente SELECT no projeto fixo; sem comandos auxiliares ou acesso a arquivos do servidor. Se qualquer condição não puder ser garantida, emitir BLOQUEADO_EXECUCAO e encerrar sem contornar.

Revalidar HEAD integrado e instruções antes da investigação. Registrar em recibo posterior os SHAs e resultados reais sem declarar leitura antes de ocorrer. Este GATE não resolve SYS04/V123/V112 nem antecipa catálogos; preserva18públicos,24baseline, Run78 e demais provas. Nenhum PASS de superfície,72BRAND,WCAG ou V1. Revisão visual independente e Teste C permanecem etapas posteriores com identidade e hashes próprios.
