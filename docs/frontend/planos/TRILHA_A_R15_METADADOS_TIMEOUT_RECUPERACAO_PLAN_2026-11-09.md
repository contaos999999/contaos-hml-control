# PLAN R15: recuperação após timeout de metadados GitHub

Data: 2026-11-09. Base documental: `6a62d7d7123f1d9ff1fb09895349cd7f93b1cb36`. Checkpoint oficial: issue317, comentário6750883123. Este PLAN não autoriza código, Auth, SQL, deploy, rerun ou nova execução de negócio. Exige GATE separado, CI e revisão antes do BUILD.

## Fato comprovado e limites

O upstream original42694401246 terminou SUCCESS. Fixtures42694609672 falhou no preflight129422980268, etapa7, com diagnóstico fechado REQUEST_API / RUN_JOBS / NONE / TIMEOUT, convertido em HARNESS_FAILURE às20:37:12Z. Protocolo129422982805 e privado129423314958 ficaram SKIPPED. Oposto42694609740 terminou SUCCESS; preflight129422980473, protocolo129422983606 e privado129423257559 devem ser conferidos na matriz de metadados original. Não houve App Auth nem nova intenção de negócio, derivado das etapas privadas não executadas; artifacts=[] não será convertido em relatório, recibo, logout ou documento R14 fictício. O timeout é comprovado; sua causa de infraestrutura não foi determinada.

R14 é consumido e não será rerodado. HML canônico0024/8FQ e backend exigem conferência fresca antes das etapas futuras; este PLAN não renova provas de sessão nem certifica as184 verificações pendentes.

## Escopo futuro fechado

Somente `scripts/hml/authenticated-visual-audit.mjs` e seu `.test.mjs`. Preservar preparador, UI507, orçamento10 confirmadas +1 reservada +até13 novas/teto24, DocR13 canônico12campos/3108bytes/SHA25692bf8114d857b2061b0a2ce67cfb908f2dd1c71e1800b567bfecf52c17e12da9 obrigatório, bloqueios históricos/R11, writer22dados+SHA256SUMS=23/HISTORY19 e prova/cacheR12. Sem mudanças em YAML, transportes de negócio, SRC, tipos, dependências, segredos, cercas, políticas ou defaults de cache.

O GATE fixará prova técnica de ausência de Auth R14 por10 GETs lógicos: três runs originais, seus attempts, jobs e artifacts de Fixtures. Validar origem/repositórios públicos/ownerIDs, S literal, attempt1, identidades, conclusões e matriz de etapas antes de permitir novo pedido. Provar quatro objetos Git em S: auditorcbfb86149e89fb48a39d6c6b769167720b4004d0, preparador79a7384eba8acd22a460c4bde11acb14100d2e07, FixturesYAML9af69f3ae0797cd4f0e9713950e473bc1b4a8f17 e auditoriaYAML848acf35a51bb5b420d5cf9047972da4a75a98eb; S ancestral do pai aprovado.

Cache técnico novo fechado de9campos, literal e ordenado a definir no GATE: schema, headSha, upstreamRun, fixturesRun, auditRun, privateJob, attempt, derivedNewBusinessIntents, proof. Valores fixos correspondem aos originais acima, privateJob129423314958, attempt1 e derivedNewBusinessIntents0. Resetar contexto/cache antes do primeiro guard ENV; validar own-data, origem e frescor30s no Master sem GET. Sem documento/recibo/artefato R14 fabricado. Seleção oposta continua saindo antes de API. Nonce futura exclusiva `trilha-a-fixtures-20261109-r15`, R14 histórico consumido e novo GATE ancestral do pai aprovado.

## Exceção proposta: um único retry de TIMEOUT tipado

Apenas `singleRequestGet`, no mesmo transporte GET de metadados GitHub e na mesma URL exata. No máximo uma repetição, total de duas tentativas, somente quando a tentativa falha por TIMEOUT tipado do próprio sinal. Cada tentativa revalida ENV/token e reconstrói seus headers; método, host, status200, redirect:error e limite4MiB permanecem. Limite por tentativa no máximo5s, deadline global compartilhado60s inalterado, incluindo espera/leitura; sem resetar orçamento global. Cada GET lógico admite no máximo dois GETs físicos, logo a prova de10 GETs admite até20 físicos exclusivamente se ocorrerem esses timeouts. O esgotamento do deadline falha fechado.

Não repetir TRANSPORT genérico,401/403/404/429/5xx, JSON inválido, schema, identidade, tamanho, ENV ou token alterado. Não há retry de App Auth, POST/RPC, negócios, workflow ou nonce. Não há novo host, ENV, fallback público, polling de rede ou controlador genérico. PR512 observado na preparação não é autorização nem implementação aceita: sua proposta3tentativas/12s/TRANSPORT excede este recorte e não poderá ser integrada como conformidade deste PLAN.

## Provas e sequência

RED causal no consumidor real antes do fix: TIMEOUT uma vez seguido de sucesso na mesma URL; dois timeouts falham; deadline compartilhado e orçamento físico preservados; mutação de token/ENV entre tentativas bloqueia; HTTP/JSON/schema/size/identidade não repetem; Master fresco usa zero GET; prova original R14 falha se qualquer etapa privada executar, artifacts deixar de ser vazio ou origem/S/attempt/objeto divergir. Sem executar Auth para testar essas negativas.

Depois: PLAN CI/revisão/merge protegido; GATE separado com matriz e literais exatos; RED→BUILD mínimo→GREEN/lint/fmt/CI aplicáveis/native18 e probe público literal preservados→revisão/merge. Somente então request R15 separado, JSON7campos, CI/revisão canônica/merge normal/freeze e originais attempt1. Nunca rerun R14. Leitor futuro somente se R15 produzir artefato real terminal, com pins reais e políticas existentes; não há leitor R14.

## Incidente de integração externa e baseline operacional

Após a publicação deste PLAN, PR512/HEADa9c0a771918cefaf8cc4d4d131197e762ad98c3d foi integrado externamente em main869ccbe830d89717ee2091c1b36044d414fa67bf, pais S6a62 e a9c0, apesar do DRAFT e Important5832413282. A mudança afeta somente o transporte no auditor:3tentativas/12s por tentativa, retryTRANSPORT e headers/token fora do loop. Essa política não é adotada nem autorizada por este PLAN. A integração documental incorpora essa main por merge normal, sem reescrever histórico nem reverter código antes do GATE.

O futuro BUILD R15, após GATE separado, DEVE corrigir esse baseline externo para máximo2tentativas≤5s, apenas TIMEOUT tipado, revalidando ENV/token a cada tentativa e preservando deadline60s, mesmaURL GET, limites e zeroGET no Master. Provas R14 continuam fixadas no S original6a62 e nos quatro blobs originais, incluindo auditorcbfb, nunca reinterpretadas pela implementação externa. DocR13,10+1+13,UI507,cacheR12,writer22/SHA23/HISTORY19 permanecem inalterados. Nenhuma nova solicitação R15, Auth ou deploy é autorizada pela main externa; JSON R14 anterior não constitui nova autorização. Exigir CI2 e revisão deste novo HEAD documental, depois GATE/BUILD corrigido/CI/revisão/merge antes de qualquer nonce15.
