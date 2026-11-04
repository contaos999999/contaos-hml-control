# Transcrição literal de fonte original — PROMPT regular 41 / V1-20

**Natureza:** espelho de evidência para continuidade do frontend, não substitui o PRD, as premissas ou os requisitos atômicos oficiais. Fonte original do titular: pacote mestre v4.1 BRAND_v1_0_FINAL.zip, caminho interno `06_PROMPTS_COPIAR_COLAR/Manual_Mestre_Prompts_4_1_100_PRD.docx`, SHA-256 `8a15d96568d021ac86fdd45e79038e2cb969d69c12b2edb84f012a6129b8940e`. Extraído dos parágrafos 2303–2362 (índice zero-based do python-docx). Próximo parágrafo 2363 começa o PROMPT 42.

O texto abaixo preserva o conteúdo dos parágrafos originais, em sequência. Não adiciona instruções inexistentes. Este arquivo NÃO é aprovação de BUILD, que continua submetido ao `PLANO_ATIVO.json` e ao gate completo 97/97, segurança e CI.

```text
PROMPT 41 - V1-20 - Apresentação/protocolo
Objetivo em palavras simples: Construir a tela Apresentação/protocolo (V1-20) na rota /competencias/:id/apresentacoes/:apresentacaoId.
ANTES DE COLAR: A operação Supabase citada no plano precisa existir e estar autorizada.
A. PLAN MODE - copie e cole
MODO: PLAN. NÃO ALTERE CÓDIGO.
TAREFA: V1-20 - Apresentação/protocolo
ROTA: /competencias/:id/apresentacoes/:apresentacaoId
ACESSO: acesso
BACKEND AUTORIZADO: Data API com RLS + RPCs específicas quando crítico
Regras:
- Supabase próprio já conectado;
- não criar tabela, RPC ou Edge Function nova se não existir; se faltar, declarar LACUNA DE BACKEND e parar;
- não colocar secret no frontend;
- não calcular status crítico localmente;
- não mudar layout global, auth, cliente Supabase ou outra feature sem necessidade explicitamente listada;
- preservar RLS como autoridade.
Planeje:
1. arquivos exatos a alterar;
2. queries/RPCs/functions usadas;
3. componentes;
4. estados loading/empty/success/denied/error e processing quando aplicável;
5. comportamento desktop 1440/1280, tablet 768 e mobile 390;
6. acessibilidade teclado/foco/labels/status;
7. testes.
Não implemente até aprovação.
B. BUILD MODE - use somente depois de aprovar o plano
MODO: BUILD.
Implemente somente V1-20 - Apresentação/protocolo conforme o plano aprovado.
Rota: /competencias/:id/apresentacoes/:apresentacaoId
Backend: Data API com RLS + RPCs específicas quando crítico
Acesso: acesso
Obrigatório:
- usar o cliente Supabase existente;
- não usar secret key;
- não criar backend paralelo;
- tratar loading, empty, denied e error;
- não esconder erro de permissão como se fosse lista vazia;
- status crítico só pode vir de RPC/dado oficial;
- responsivo 1440/1280/768/390;
- acessível por teclado e com labels;
- não alterar arquivo fora do plano.
Ao final, liste arquivos alterados e operações Supabase utilizadas.
C. TESTE - cole depois que o Build terminar
NÃO ALTERE CÓDIGO.
Teste V1-20 - Apresentação/protocolo.
PASS/FAIL:
1. rota abre;
2. perfil autorizado funciona;
3. perfil não autorizado é bloqueado pelo backend/RLS, não só pela UI;
4. loading/empty/error funcionam;
5. nenhuma request usa secret key;
6. nenhuma ação crítica é update direto;
7. desktop 1440 e 1280 ok;
8. tablet 768 ok;
9. mobile 390 preserva dados críticos;
10. teclado/foco/labels ok;
11. console sem erro e sem log sensível;
12. Security scan sem novo Critical.
Não corrija automaticamente; relate evidências.
PARE AQUI: Só avance ao próximo número se o teste responder PASS nos itens obrigatórios.
```
