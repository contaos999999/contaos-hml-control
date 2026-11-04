# LOCK-TYPES-01 — controle permanente do arquivo Supabase `types.ts`

**Data:** 03/11/2026. **Projeto:** ContaOS 4.1, HML. **Escopo:** `src/integrations/supabase/types.ts`.

## Regra canônica

- Blob Git aprovado: `8ea7750b75fd9d76b29c36ce7613392e3ab65e19`.
- SHA de referência funcional: `ad0b933943d4b69f7a9f23f203e4cff1211b4902`.
- Backend: Supabase `gklhhhyosgasnyoxlrui` (HML); não alterado.
- A plataforma Lovable pode regenerar tipos quando sincroniza a integração. A documentação do fornecedor não estabelece uma opção de congelamento do arquivo enquanto a conexão permanece ativa: https://docs.lovable.dev/integrations/supabase.

## Controles instalados

1. Instrução permanente em Project Knowledge do Lovable: nunca tocar no arquivo, restaurar e validar hash após atualizações do agente, sem alterar schema/PROD.
2. AGENTS.md: proibição constitucional explícita, válida para agentes do repositório.
3. `scripts/frontend-zero-drift.mjs`: falha o CI diante de qualquer hash diferente do certificado.
4. `.github/workflows/contaos-types-autolock.yml`: gatilho push do caminho protegido, checagem periódica horária e disparo manual. Antes de publicar reparação, restaura hash e executa teste completo, typecheck, build e Zero-Drift. Faz push somente fast-forward, no máximo três tentativas, com interrupção após três reparos em 60 minutos.
5. CI `ContaOS Frontend Zero-Drift` cobre todas as alterações em main, inclusive documentação e guardas.

## Evidências iniciais

- Restauração manual ao blob certificado: https://github.com/contaos999999/contaos-hml-control/commit/b21d2e2e57d95ea9d62d519576f8bd74bfe7719d
- CI anterior após restauração: https://github.com/contaos999999/contaos-hml-control/actions/runs/41717937678 (SUCCESS).
- Auto-Lock, teste isolado de detecção, corrupção artificial em arquivo temporário e restauração: https://github.com/contaos999999/contaos-hml-control/actions/runs/41718861663 (SUCCESS).
- CI após instalação do workflow: https://github.com/contaos999999/contaos-hml-control/actions/runs/41718861747 (SUCCESS).

## Limitações que não podem ser omitidas

- A plataforma ainda pode **gerar temporariamente** outro conteúdo. O workflow impede persistência prolongada quando executa com permissão de escrita, mas **não é um controle do gerador interno do Lovable**.
- A execução inicial validou o teste isolado e detectou main íntegra, mas não precisou executar o passo de `git push` corretivo. Portanto a escrita automática efetiva **não está comprovada**; verificar na primeira ocorrência natural de drift, sem introduzir corrupção deliberada em main.
- Como o GitHub retornou 403 para regras de branch em repositório privado, não há bloqueio físico de push antes da escrita. O verificador e a automação são mitigadores, não substitutos de regras de proteção da branch.
- O próprio Lovable pode gerar drift antes de publicar um SHA. Manter revisão do diff e Teste C independente no SHA final.

## Operação

Para conferir: `git hash-object src/integrations/supabase/types.ts`, comparando com o blob acima. Para atualizar tipos oficialmente, abrir mudança específica de contrato e migrar a constante em todos os gates só após aprovação, CI e rastreabilidade.

**PROD intocada.**


## Atualização GOV-003/GOV-004 — proteção vigente

O workflow anterior com push automático direto à main foi substituído no merge PR #14, commit `31eb0a3e7f0dca0f70420eeeab2ded1b69fcab2d`. O Auto-Lock vigente usa branch e PR com CI obrigatório, **sem push direto nem merge automático**. A execução saudável em main `41762615464` confirmou fixture de corrupção e restauração local e ausência de drift no arquivo real. O percurso de criação de PR pelo bot diante de drift real ainda **NÃO VERIFICADO**. Blob imutável certificado: `8ea7750b75fd9d76b29c36ce7613392e3ab65e19`. Ruleset da main ativo com 0 revisões obrigatórias e dois required checks. Ver relatório GOV-004 e issue #16.
