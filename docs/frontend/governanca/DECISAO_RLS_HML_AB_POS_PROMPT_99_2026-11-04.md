# DECISÃO DO TITULAR — Homologação RLS HML A/B após PROMPT 99, não impeditiva

**Registro:** 04/11/2026 (America/Sao_Paulo). **Origem:** orientação expressa do titular na conversa de continuidade do ContaOS 4.1 após PR #48. **Escopo:** sequência de desenvolvimento frontend do catálogo de prompts regulares 41–99; não altera regras de acesso do Supabase.

## Decisão e interpretação operacional

1. A **comprovação operacional em Supabase HML** de políticas RLS que impedem acesso indevido entre organizações, executada com dois usuários de teste A/B de organizações distintas, fica **ADIADA PARA DEPOIS DA EXECUÇÃO DO PROMPT REGULAR 99**. Não realizar antecipadamente por iniciativa própria.
2. Essa **prova operacional HML A/B é de caráter complementar, NÃO OBRIGATÓRIA e NÃO BLOQUEANTE** para continuar os prompts regulares 41–99, validar os PLANs desses prompts ou integrar seus BUILDs com escopo frontend, **desde que todos os demais controles aplicáveis estejam aprovados**.
3. Se chegar ao PROMPT 99 sem as identidades/fixtures ou autorização operativa, manter a prova com status **NÃO VERIFICADO / FACULTATIVA / PÓS-99**, sem converter em PASS, sem inventar resultado e **sem bloquear retrospectivamente** a sequência concluída.
4. Não converter esta dispensa da **comprovação operacional específica** em dispensa de **segurança**. Permanecem mandatórios: revisão de contratos tipados reais existentes, chamadas Supabase com usuário autenticado e RLS como autoridade, consultas limitadas a competência/organização/pacote, prevenção de IDOR e de fallback de permissões no React, nenhuma chave secreta no browser, nenhuma mutação sem RPC autorizada, isolamento lógico verificado por testes automatizados de frontend (rotulados MOCK/estáticos), TDD, TypeScript/lint/build, CI Zero-Drift, Teste C independente aplicável, BRAND-01, requisitos funcionais e RNFs. Um FAIL demonstrado de segurança (ex.: vazamento real de outra organização) **continua BLOQUEANTE**.
5. A evidência de **execução efetiva de SELECT via RLS** e bloqueio A/B permanece **NÃO VERIFICADA** mesmo com testes unitários verdes; não usar alegações como “RLS HML PASS”, “E2E A/B aprovado” ou “segurança integral certificada”.
6. A decisão **não autoriza** investigação de schema/policies/dados Supabase, criação de usuários/fixtures, alteração de RLS, backend `contaos999999/develop`, Storage, funções ou PROD. Uma futura investigação HML após o PROMPT 99 exige autorização específica separada e credenciais de teste fornecidas por canal apropriado, se ainda desejada.
7. A futura verificação pós-99 pode permanecer em **pendência facultativa**, sem prazo ou execução agendada, não se confundindo com a promoção a produção, cuja avaliação de riscos e critérios próprios deverão ser decididos separadamente pelo titular.

## Aplicação imediata à V1-20 (PROMPT 41)

- **Fonte original** e **contrato tipado**: documentados nos PRs #47 e #48. `apresentacoes_contratante`, `pacotes_competencia` e `itens_pacote_competencia` existem nos tipos certificados.
- **PLAN 41**: a ausência **isolada** do ensaio HML A/B não deve impedir sua validação técnica nem o BUILD seguinte. Os demais gates, allowlist definitiva, segurança estática, Teste C planejado, 97 atômicos e prevenção de reconstrução do pacote continuam a exigir aprovação própria.
- Não transformar o PLAN 41 automaticamente em VALIDADO por esta decisão. Registrar parecer técnico e prova CI em PR documental **separado** antes de criar `PLANO_ATIVO.json` 41 e antes de tocar `src/**`.
- Tela exclusivamente de leitura. Dados de apresentação/pacote/itens devem vir de consultas autorizadas ao backend, sem inventar snapshot, permissões ou URLs, e exibindo erros 403/404/ausência corretamente.

## Rastreabilidade e acompanhamento

- Condição de retomada: **após** conclusão do prompt regular 99, **não obrigatória** e **não bloqueante**.
- Acompanhar em [issue #12 — HML A/B](https://github.com/contaos999999/contaos-hml-control/issues/12); associar, se pertinente, à [issue #35 do repositório normativo](https://github.com/contaos999999/develop/issues/35) sem alterá-lo.
- Esta decisão suplementa a classificação de aplicabilidade da **prova E2E A/B** na ADR-DEV-002, mas **não altera o caráter obrigatório dos gates de segurança/PRD nem os requisitos originais**. Não tratar segurança de acesso como N/A; N/A apenas para a **execução antecipada do ensaio E2E específico**.
