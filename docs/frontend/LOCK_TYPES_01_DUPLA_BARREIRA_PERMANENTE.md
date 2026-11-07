# LOCK-TYPES-01 — Dupla barreira permanente

Arquivo protegido: `src/integrations/supabase/types.ts`
Blob canônico Git: `8ea7750b75fd9d76b29c36ce7613392e3ab65e19`.

1. **Barreira preventiva:** Lovable, integrações, geradores, scripts e agentes NÃO podem regenerar, editar, formatar ou substituir este arquivo. Toda alteração de frontend deve usar adaptadores tipados fora desse caminho. Não alterar a referência do hash para acomodar drift.
2. **Barreira de detecção e recuperação:** antes e depois de QUALQUER BUILD, sincronização, teste, atualização de integração ou commit, executar `git hash-object src/integrations/supabase/types.ts`. Se diferente do blob canônico, restaurar o conteúdo exclusivamente de `git cat-file -p 8ea7750b75fd9d76b29c36ce7613392e3ab65e19 > src/integrations/supabase/types.ts`, conferir o hash novamente e bloquear conclusão/commit até o PASS. Se o objeto canônico não existir localmente, parar sem sobrescrever e recuperar a partir do GitHub main verificado.
3. **Barreira GitHub:** workflow `lock-types-double-barrier.yml` verifica cada PR/push; divergência resulta FAIL. No PR, nunca fazer merge com falha; restaurar em branch de trabalho, retestar e submeter novamente. Não confiar apenas em instrução textual do agente.
4. **Exceção:** atualização legítima exige decisão expressa do titular, alteração controlada da fonte canônica e revisão dos guards/checks. Sem exceções tácitas.
5. **Segurança:** nunca fazer checkout/merge/reset forçado que reverta outras alterações; restaurar SOMENTE `types.ts`. Não tocar PROD.
