# GOV-014 — Relatório de medição instrumental de contraste WCAG AA

**Data da verificação:** 04/11/2026 (America/Bahia).  
**Escopo:** apenas telas públicas, sem sessão HML, 23 rotas × 4 larguras × 2 temas no Teste C.  
**PLAN pré-BUILD:** `docs/frontend/planos/GOV_014_CONTRASTE_PIXEL_2026-11-04.md`.  
**PR:** #25 · **GitHub Actions:** `41838951107`.  
**SHA testado:** `da559c3771b4f4433a87df6115a055cf05e77d42`.

## 1. Resultado medido no Chromium

| Métrica | Resultado |
| --- | ---: |
| Combinações totais da matriz Teste C | 184 |
| Cenários públicos efetivamente executados | 24/24 |
| Cenários protegidos sem sessão real | 160 (NÃO VERIFICADOS) |
| Nós de texto públicos antes inconclusivos no axe-core | 120 |
| Nós com contraste AA suplementar medido e aprovado | **120/120** |
| Contrastes AA abaixo do limite | **0** |
| Nós inconclusivos no medidor por pixel | **0** |
| Menor razão medida entre os nós | **4,7465:1** |
| Maior razão medida | **14,9444:1** |
| Regra axe `color-contrast` originalmente incompleta | 24 ocorrências por cenário (um por cenário), complementadas pelo ensaio de pixels |

A auditoria **não suprime** a marcação original `INCOMPLETE` do axe-core; registra-a juntamente com a prova suplementar `PASS_AA_PIXEL_PUBLICO` dos 24 cenários públicos. O método exige pixels centrais de glifo coerentes com a cor/alpha computados, fundo renderizado extraído da captura sem texto, contagem mínima de amostras e compara a razão com 4,5:1 (texto normal) ou 3:1 (texto grande). A métrica é conservadora em casos de foreground desconhecido, PNG incompatível, mudanças de fundo e amostras insuficientes: nesses casos retorna `NAO_VERIFICADO`.

## 2. Método e controle de falso positivo

1. O Playwright abriu páginas **públicas**, sem login e sem persistência de dados, no mesmo SHA versionado; CSS de ocultação foi injetado apenas na página temporária do navegador, nunca no repositório.
2. O `axe-core@4.14.0` detectou nós cuja regra de contraste não conseguia reconstruir backgrounds por `bgGradient` ou `bgOverlap`.
3. O executor `pngjs@7.0.0` comparou duas capturas de viewport: texto renderizado e texto temporariamente ocultado, com layout e fundo preservados. Amostras de pixel foram aceitas somente quando condizentes com o texto CSS transformado em sRGB e opacidade efetiva, descartando bordas com antialiasing não reconstituíveis.
4. A primeira execução do medidor (`41837455213`, SHA `2559fd8eb99aaf8cbe00cf94f7a3b2902efaf5d1`) aprovou 96 nós e manteve **24** inconclusivos, por amostragem pequena em um `span` de fonte 12px repetido nas variantes.
5. O refinamento subsequente exigiu até 2% de pixels concordantes, no máximo 30 pixels centrais, além do mínimo configurado; um novo autoteste negativo comprova que coincidência isolada de 1 pixel em área de 100 não é aprovada. A razão WCAG passou a ser comparada **antes do arredondamento de exibição**, evitando falso PASS limítrofe.
6. Execução subsequente `41838951107`, SHA `da559c3771b4f4433a87df6115a055cf05e77d42`: **120 PASS / 0 FAIL / 0 NÃO VERIFICADO** na amostra pública. O resultado não depende de mudança de cores, identidade visual, assets ou backend.

O workflow do teste integra regressão, TypeScript, lint, build e Zero-Drift, com dois checks obrigatórios conforme o ruleset. A prova final deve ser refeita em novo SHA se o código de medição for alterado, sem transpor automaticamente o resultado para telas autenticadas.

## 3. Artefato e rastreabilidade

- GitHub Actions: https://github.com/contaos999999/contaos-hml-control/actions/runs/41838951107
- Artefato: `13327224163`, nome `contaos-teste-c-41838951107-1`, retenção informada até `02/02/2027`.
- ZIP materializado: `ContaOS_GOV014_ContrastePixel_41838951107.zip`, SHA-256 `85498929aa290e7398b46e7dfe946878668ef195b1af6335fd4f9f5049946bbf`.
- Conteúdo: 26 entradas, **24 capturas públicas**, `relatorio.json` e `SHA256SUMS`. CRC do ZIP aprovado, **25/25 hashes internos válidos**, nenhuma divergência.
- Arquivo de fonte protegido `src/integrations/supabase/types.ts` não modificado pelo PR. O runner verifica diff versionado limpo.

## 4. Certificação delimitada

**Concluído com prova:** diagnóstico de contrastes inconclusivos nas páginas públicas, medição complementar WCAG AA de 120 elementos por pixels renderizados, ausência de falhas nesses elementos e preservação da marca ContaOS. O registro atende ao saneamento **GOV-014 no escopo público e nos estados capturados**.

**Fora do escopo e ainda NÃO VERIFICADO:** telas protegidas/autenticadas (160 combinações), foco/teclado, leitor de tela, estados dinâmicos não capturados e certificação de conformidade WCAG de toda a aplicação. A conclusão de 120/120 não constitui homologação funcional do Supabase HML, RLS A/B ou recuperação de senha. Não confundir `PASS_ESCOPADO_PUBLICO` com `100% do PRD 4.1`.

**Sem alterações:** `src/**`, `public/**`, tokens/cores BRAND-01, backend, migrations, Auth, dados HML, PROD e Lovable BUILD.
