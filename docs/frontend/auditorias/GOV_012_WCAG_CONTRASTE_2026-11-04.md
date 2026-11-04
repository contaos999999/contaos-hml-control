# GOV-012 — Relatório técnico de contraste WCAG por elemento

**Data:** 04/11/2026 (America/Bahia) · **Escopo:** Teste C Playwright/axe-core 4.14.0 em páginas públicas sem autenticação. **PLAN:** `docs/frontend/planos/GOV_012_WCAG_CONTRASTE_2026-11-04.md`.
**PR:** #23. **CI com navegador real:** run `41806768058`, artefato `13311270164`, expiração `02/02/2027`.

## 1. Execução instrumental concluída

- 23 rotas × quatro larguras × dois temas = **184 combinações**, com 24 cenários públicos que receberam `PASS_PUBLICO` quanto à navegação/estrutura/ausência de violações automáticas; **160 cenários protegidos continuam NÃO VERIFICADOS por falta de sessão HML real**.
- `axe-core@4.14.0`: **24 verificações públicas**, `0` regras `violations` confirmadas, `24` incidências da regra `color-contrast` `INCOMPLETE` (uma por cenário).
- A instrumentação GOV-012 coletou **120 nós de texto** com `incomplete`: **64** identificados como `bgGradient` e **56** como `bgOverlap`, sem capturar valores de campos, HTML, emails ou tokens.
- A inspeção aponta apenas elementos públicos (`p`, `span`, `h2`) do painel institucional, herdando fundos do `aside` `oklch(0.208 0.042 265.755)` em tema claro e `oklch(0.929 0.013 255.508)` em tema escuro. Há transparência, sobreposição e backdrop filter; a ferramenta não consegue reconstruir todos os fundos renderizados.
- Distribuição de nós inconclusivos por rota e breakpoint, em cada tema: login 12 (1440/1280), 2 (768/390); esqueci-senha e redefinir-senha 6 (1440/1280), 2 (768/390).
- **Isto fecha o diagnóstico causal da incompletude, NÃO a certificação final da razão de contraste.** O resultado mantém `NAO_VERIFICADO_REVISAO_MANUAL` até a medição por pixel com identificação dos glows/gradientes ou correção visual sob um PLAN BRAND-01 formalmente aprovado.

## 2. Artefato e integridade

- Actions: https://github.com/contaos999999/contaos-hml-control/actions/runs/41806768058
- Artefato ID `13311270164`, nome `contaos-teste-c-41806768058-1`.
- Download local `ContaOS_Testec_GOV012_Diagnostico_41806768058.zip`, **SHA256 `f055304a23d2ef7547af944de4a6a4e9d6d5af3d83015ec53ab00b9ffa109fea`**.
- ZIP: **26 entradas**, **24 screenshots**, relatório `relatorio.json` e `SHA256SUMS`. Verificação CRC sem erro; **25/25 hashes internos válidos**, zero divergência.
- A tentativa de upload redundante à Biblioteca em 04/11 retornou `container_session_expired` (duas tentativas). Não declarar arquivamento externo/permanente deste ZIP sem evidência de upload. Artefato original segue disponível na execução GitHub até o vencimento informado.
- Os pacotes GOV-002 e GOV-007 anteriores já possuem atestado técnico de arquivamento GOV-010; esse atestado **não cobre** automaticamente este novo pacote.

## 3. Próxima ação segura para concluir WCAG

1. Realizar avaliação especializada do contraste sobre os fundos realmente renderizados para os 120 casos (ou grupos equivalentes de elementos repetidos), com cálculo WCAG 1.4.3 e prova do cenário mais desfavorável de cada tema/breakpoint. Valores de tokens CSS são apenas referência e não substituem contraste resultante de overlays.
2. Se qualquer nó ficar abaixo do mínimo WCAG, corrigir exclusivamente os valores visuais afetados, conforme PLAN de BRAND-01 com aceitação específica, e repetir o Teste C.
3. Manter tela privada `NÃO VERIFICADO` até sessões HML autorizadas. Não modificar `src/**`, `public/**`, `types.ts`, backend, produção, organização Lovable, RLS, Auth ou Storage neste GOV-012.

## 4. Declaração de validade

**PASS:** executor WCAG, coleta técnica segura por nó, teste de navegação pública, integridade do artefato. **NÃO VERIFICADO:** contraste de texto sobre fundos compostos, estados autenticados, WCAG integral e arquivo institucional imutável. Nenhum `PASS` fictício foi atribuído.
