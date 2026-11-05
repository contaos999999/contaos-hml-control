# ContaOS 4.1 — PLANO MESTRE ÚNICO P0 | Provas reais V1
Data: 05/11/2026. Estado: PLAN, sem BUILD neste PR.

## Mandato e autorização
O titular autorizou neste chat executar **automaticamente** todas as provas reais de homologação que forem tecnicamente possíveis, usar dados **sintéticos** e conectores já integrados, sem aprovação por etapa. Essa autorização está registrada aqui. Quando um plugin exigir consentimento OAuth/escolha de permissões na plataforma, essa etapa não pode ser contornada por declaração textual. Não acessar PROD ou dados pessoais de terceiros; nunca registrar senhas, service_role ou JWT em GitHub, anexos ou conversas. Permissões e credenciais de HML devem ficar em ambiente secreto próprio.

**Fontes verificadas**: frontend `contaos999999/contaos-hml-control@f59a79713493b562d15602307eb3c4d7147ce683`, CI 42056568954 PASS ambos jobs; backend normativo `contaos999999/develop@3aa4af7a292b80243045e0a426ee6399ba948ff2`, CI 42013508780 PASS; Supabase HML ref `gklhhhyosgasnyoxlrui`.

## As quatro frentes dentro deste único plano

| Etapa | Prova automática requerida | Critério de conclusão |
| --- | --- | --- |
| A1 | Reconciliar 45 regulares V1, 488 itens (416 originais + 72 normalizados), 25 atômicos/BRAND e 12 NFR | Link por item para requisito, código, teste, evidência, run e HEAD |
| A2 | Cotejar os seis regulares finais 39–43/75 com fonte **literal** do manual; não aceitar protocolo normalizado como transcrição literal | Fonte e hash verificados, discrepâncias corrigidas ou bloqueio expresso por falta de arquivo |
| A3 | Executar apenas provas funcionais reais ausentes; recuperar CI e testes já certificados sem repetir BUILD | Cada PASS_REAL com ambiente, método, data, evidência individual; demais NAO_VERIFICADO |
| B1 | Verificar 9 RPCs SECURITY DEFINER, ACL, search_path, helpers, Storage, policy, RLS | Verificação estática por função e alertas intencionais classificados |
| B2 | Testar **JWTs emitidos por Supabase Auth**, usuários HML sintéticos, perfil permitido e negado, sessão revogada/expirada em cada RPC | Requisições reais de Auth e PostgREST, resultado HTTP sem token em log, 9/9 funções |
| B3 | Corrigir somente falhas comprovadas por B2 usando PLAN backend específico derivado daqui e TDD RED/GREEN, CI/restore isolado | Testes reais corrigidos; se não houver falha, nenhuma migration de risco |
| C1 | Reusar prova Auto-Lock GOV-011 attempt 3, criação/limpeza PR #148, sem drift na main | PASS já provado, não repetir teste destrutivo |
| D1 | Revalidar Release privada dos dois ZIP Teste C + SHA256SUMS, Biblioteca e recuperação | 3 SHA conhecidos e download com conferência |
| D2 | Executar **de fato** job somente-leitura de verificação de hashes fixos (não só cron configurado) | Run e logs SUCCESS com 3 SHA, credencial somente leitura |
| D3 | Registrar responsável, retenção, acesso e restore; WORM não presumido | Política explícita, incluindo limitações reais |
| G1 | Termo oficial apenas após fechamento das demais provas e CI/merge | CERTIFICADA_V1_COM_3_RESSALVAS ou NO_GO fundamentado |

## Exceções sem falso PASS
R01 upload real E2E; R02 processamento real worker; R03 isolamento real entre usuários. Essas três são as **únicas ressalvas de comportamento aceitas**; estado `RESSALVA_ACEITA_NAO_EXECUTADA`. O recurso nativo de proteção a senhas vazadas exige plano Pro, reconhecido como `EXCECAO_DE_PLANO_FREE_NAO_CORRIGIDA`, nunca PASS. Isso não dispensa autorização JWT/perfis dentro da mesma organização, SYS-03, WCAG privada e RNFs aplicáveis.

## Procedimento para testes reais e configuração
Usar exclusivamente HML, REST/Auth oficial e identidade de teste. Conferir se o GitHub environment `hml` possui meios seguros para criar e autenticar usuários sintéticos. **É proibido** criar identidades por INSERT direto em `auth.users` ou substituir JWT real por `SET LOCAL ROLE authenticated`. Caso não exista credencial/conta de teste acessível, preparar runner fail-closed e registrar a configuração pendente com o nome exato de segredo, sem expor valor. Provisionamento via plugin só se o fluxo nativo permitir; consentimento de conexão requer ação do titular no UI.

## Gates de execução
Um PLAN integrado com CI verde antecede os BUILDs de cada frente. Para cada alteração: fonte canônica 25/25 e 100/97, design BRAND-01, Zero-Drift, Type-Lock, Teste C independente, dois checks verdes no mesmo SHA, PR e merge confirmado. Backend exige PLAN específico apenas para alteração de schema/RLS/Auth, migration versionada HML, TDD e restore isolado. Não burlar gates e não alterar PROD. V2–V5 bloqueadas até V1 comprovadamente certificada.

## Checklist de saída
Matriz 488/37 individual, nove RPCs e sessão JWT com perfil, evidência Auto-Lock reaproveitada, três assets e job de integridade real, política custódia e checkpoint GitHub com HEADs, CI, PRs, resultados, impedimentos, última etapa concluída e próxima tarefa. Nenhum teste sem prova vira PASS.

## ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE (OBRIGATÓRIO)
Preservar BRAND-01, logomarca transparente, AppShell/sidebar e types.ts congelado; evitar chamadas Lovable redundantes e refazer testes já aprovados. 
