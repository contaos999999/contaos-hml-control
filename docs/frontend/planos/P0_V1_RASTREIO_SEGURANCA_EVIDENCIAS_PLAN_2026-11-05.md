# PLAN P0 — rastreabilidade V1, seguranca HML e custodia de evidencias
Data: 05/11/2026; escopo **V1**; ordem V1→V5 preservada; sem PROD.

## PROMPT e fronteira
Atender determinacao expressa do titular para corrigir automaticamente rastreabilidade integral, revisao de seguranca salvo Auth leaked-password indisponivel no Free, Auto-Lock e arquivo de evidencias. Nao transformar ausencia de prova em PASS. O aceite previo R-01 upload real, R-02 worker real e R-03 isolamento entre usuarios permanece exclusivamente nessas tres. NFRs e SYS-03 continuam fora desta mudanca se nao forem comprovados.

## PLAN somente documental/CI
1. Rastreabilidade: gerar `docs/frontend/auditorias/P0_V1_RASTREABILIDADE_COMPLETA_2026-11-05.json` contendo os 45 IDs regulares 00–43 e 75, 416 criterios textuais legados 00–38 com status historico e provas, os seis regulares finais com relacionamentos atômicos explicitos e dossies reais, 25 atômicos (000–024) e 12 NFRs (085–096) como transversais, fontes de origem e impedimentos por requisito. Registros sem prova devem permanecer PENDENTE. Proibir inferir PASS por existencia de teste, CI, mock ou caminho.
2. Seguranca: auditar e versionar 9 RPCs SECURITY DEFINER publicas, ACL efetivo para anon/authenticated, search_path, helpers privados, validacoes de sessao/escopo e sua chamada real pelo frontend, com protocolo de teste read-only por caso. Nao revogar EXECUTE de RPC necessária, nao substituir SECURITY DEFINER sem prova de compatibilidade, nao executar migration improvisada, nao criar dados ou usar credenciais reais. Registrar Auth leaked-password como excecao de plataforma Free, sem marcar PASS. Um aviso lint nao equivale automaticamente a falha exploravel ou a garantia de seguranca.
3. Auto-Lock: conferir tentativa anterior e rerun do ensaio GOV-011, criando PR temporario, valida hashes, confirma limpeza. O Teste C tradicional e o gate dos tipos continuam obrigatorios. Nao injetar drift na main, sem bypass.
4. Custodia: redundancia atual GitHub Actions + Biblioteca ChatGPT; registro SHA256 dos ZIPs, manifesto do conteudo e teste de recuperacao dos pacotes. Avaliar automacao opcional de Release privada independente do prazo dos artifacts; antes de adiciona-la, avaliar concessao de `contents: write`, politica de acesso e disponibilidade. Arquivos arquivados devem permanecer privados, sem tokens nem dados reais. Se nao houver mecanismo seguro de Release, registrar blocker e manter provas preservadas.
5. Evidencias por criterio: ensaios realmente executados recebem links, SHA, ambiente, data e resultado; nao inventar situacao positiva. Arquivar diferencias antigas e atualizar somente provas que existam.

## Allowlist exclusiva para BUILD
- `docs/frontend/auditorias/P0_V1_RASTREABILIDADE_COMPLETA_2026-11-05.json`
- `docs/frontend/auditorias/P0_V1_SEGURANCA_RPC_HML_2026-11-05.md`
- `docs/frontend/auditorias/P0_V1_AUTOLOCK_RECUPERACAO_CUSTODIA_2026-11-05.md`
- `docs/frontend/ESTADO_E_RETOMADA_CONTAOS_4_1.md`
- `docs/frontend/planos/P0_V1_RASTREIO_SEGURANCA_EVIDENCIAS_PLAN_2026-11-05.md`

Se for preciso incluir workflow/script de automacao ou alterar banco, elaborar emenda PLAN antes de alterar arquivos. Nao tocar `src/`, `public/`, `types.ts`, Auth, RLS, migrations, Storage, PROD. Nao alterar `docs/frontend/governanca/P0_ORDEM_POR_VERSAO_4_1.json` para certificada sem prova integral.

## Gates
- PLAN submetido em PR exclusivamente documental; verificar CI Zero-Drift e Teste C N/A/pass.
- BUILD apenas em nova branch a partir de `main` **apos merge do PLAN e CI verde**, usando allowlist fechada.
- Testes de coerencia por 45 IDs, 416 criterios, 000–024, 085–096, unicidade, origem, status e provas.
- Rastreio de versoes: main de frontend e backend, links dos CI e artefatos.
- Segurança: teste estatico e verificacao de grants/guards real read-only; qualquer falha de seguranca confirmada requer PLAN backend especifico e suite negativa antes de migration.
- Rollback: reverter PR documental; nenhum dado ou schema afetado.
- Emitir fechamento **por frente**; proibir certificado global V1 quando houver outros bloqueios.

## ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE (OBRIGATÓRIO)
Nenhum impacto visual; N/A por natureza documental. Identidade de marca BRAND-01 mantida. GitHub e Supabase read-only sem chamadas de build Lovable; custo minimo sem reduzir testes.
