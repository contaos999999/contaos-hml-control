# GOV-017 — Correção transparente e crivo de marca V1-18 (ContaOS 4.1)

**Data:** 04/11/2026, Brasília. **Escopo:** somente identidade visual e auditoria; backend, autenticação, RLS, dados, PROD, tokens e composição de rotas intactos.

## 1. Falha comprovada e reparo
- Fonte oficial certificada `public/brand/ContaOS_Logo_Horizontal_Mono_Branco.svg` (SHA-256 `099518bc6ff6b83d4380071b99410dbbbdb43805790c7ad6b0437ba16ae14c36`) contém, junto ao root SVG, o elemento `<rect width="100%" height="100%" fill="#0F172A"/>`. Esse elemento de 100% da imagem cria o retângulo chapado navy que cobre o fundo composto/gradiente em login e cabeçalhos.
- **Aprovado pelo usuário:** remover o fundo, preservando a marca. Novo `ContaOS_Logo_Horizontal_Mono_Branco_Transparente.svg` difere do original exclusivamente pela retirada desse único elemento; Comprimento do derivado: 1364 caracteres contra 1413 do original, diferença exata dos 49 caracteres do elemento de fundo removido. O SHA-256 do derivado e a transparência visual renderizada ainda dependem de confirmação independente; a ausência do retângulo integral está comprovada pela comparação do conteúdo SVG. Não há evidência de PNG renderizado isoladamente nesta etapa.
- `src/components/brand/ContaOSMarca.tsx`: substituição exclusiva do caminho da variante horizontal branca pelo derivado; SVG Navy para tema dark e símbolos mobile preservados, dimensões preservadas, sem CSS global extra. `src/test/brand.test.tsx`: original continua checado por SHA de manifesto, novo derivado checado por igualdade byte a byte à fonte oficial sem retângulo, componente compartilhado com novo `src`, e V1-18 acrescida ao inventário da marca.

## 2. Crivo específico da tela V1-18 /competencias/:id/parecer
**Fonte auditada:** `src/components/competencias/CompetenciaParecer.tsx` e `src/routes/competencias_.$id_.parecer.tsx`, integrados pelo PROMPT 39 PR #30, com GOV-016 Teste C 24 superfícies PR #32.

| Critério da marca | Achado no código | Classificação |
| --- | --- | --- |
| Marca oficial | Cabeçalho inclui `<ContaOSMarca />`, nenhuma imagem alternativa de branding. Novo SVG é selecionado centralmente. | PASS estático |
| Sem identidade paralela | Não há cor HEX hardcoded no componente, não há CSS próprio, `fonts.googleapis`, `createTheme` ou novo Design System. | PASS estático |
| Tokens / claro-escuro | Usa `bg-primary text-primary-foreground` no header, `bg-background text-foreground`, `border-border`, `bg-card`, `text-muted-foreground`, `text-destructive`; tema dark herdado de `src/styles.css`. | PASS estático; contraste renderizado requer inspeção |
| Responsividade | `max-w-7xl`, `flex-wrap`, `gap-3`, `px-4 sm:px-6 lg:px-8`, grade `sm:grid-cols-2`, hash `break-all` e conteúdo `break-words`. | PASS estrutura; viewport privado autenticado NÃO VERIFICADO |
| Acessibilidade | H1 de página, seções `aria-labelledby`, navegação com `aria-label`, alertas/status, diálogo com título e descrição, controles `min-h-11`, botões sem acesso inexistente. | PASS estático; WCAG real completo NÃO VERIFICADO |
| Estados | Carregando com status, sem sessão, indisponível, sem permissão, erro, histórico vazio, confirmação e atualização. | PASS leitura do código; execução real HML NÃO VERIFICADA |
| Logs/privacidade | Não introduz chave secreta, backend autoritativo, não há mutation direta de status no componente. | PASS estático |
| Marca sobre fundos compostos | A variante branca anteriormente continha o `rect` opaco; o reparo centralizado remove a causa sem editar V1-18. | FAIL no baseline / reparo aplicado no BUILD, validação CI pendente |

**Conclusão institucional precisa:** a implementação original V1-18 está alinhada **estaticamente** com a identidade visual e o Design System, mas herdou um problema central de asset opaco presente em todas as telas; a implementação GOV-017 remove a causa. O Teste C 24 × 4 × 2 **não possui sessão HML real** para renderizar o corpo interno V1-18 após autorização; **não declarar 100% visual nem WCAG autenticado** sem essa prova. Capture/valide à parte quando houver identidade HML de teste autorizada.

## 3. CI, TDD e rastreabilidade
- PLAN original GOV-017: PR #34, merge `33f167c6b745261c5a21d7bc63aedad4ffd36fd5`, 2 checks SUCCESS.
- GATE formal separado: PR #38, `PLANO_ATIVO.json` para PROMPT 16/atômico 000 e aprovação humana expressa; merge `ca74b9555a46f0de8f01020b8cb779f412fcee40`, 2 checks SUCCESS.
- TDD RED comprometido antes de reparo no commit `fd15204c4c1ae3ad7a1a442de7bc4fb7dc441fb9`: teste exigia novo asset/componente ainda não existentes naquele commit; **execução real RED não foi realizada**. BUILD subsequente adicionou asset e redirecionou componente. GREEN depende de CI de PR.
- Teste C: exigir dois checks `ContaOS Frontend Zero-Drift` e `Auditoria de navegador independente (somente leitura) / ContaOS Teste C Independente` **SUCCESS no mesmo SHA**; registrar 192 cenários, prints e SHA256SUMS; sem sessão real a tela privada continua NÃO VERIFICADA.
- Rollback: voltar exclusivamente o `src` do componente em PR e remover variante derivada caso necessário, sem tocar nos assets certificados.
