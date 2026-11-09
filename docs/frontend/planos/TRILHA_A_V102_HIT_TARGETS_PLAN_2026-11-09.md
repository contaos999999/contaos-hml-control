# Trilha A: plano focal de geometria V102

**Objetivo:** remover cobertura de alvos de ajuda em Novo Contratante, somente após reprodução causal nativa. Execução inline com revisão independente; autorização contínua do titular na issue317.

**Arquitetura:** preservar React/TypeScript, AppShell, componentes Tooltip/Button e tokens existentes. Ajuste estritamente visual do espaço reservado pelos dois botões Dica; nenhuma regra de formulário, RPC ou permissão muda.

## Evidência

Teste C124/run42542802124, fonte866608620909bf313a6c2192736330222f9219ad, harnessa688ba030955229426ff8cd2584af3ffc86921bd e deploymentdpl_EcPdYyFYTAVTGEYpr1go2QrTfakY. Artefato13642651045 ZIP SHA25610e02841060b4b949e3aab80ec0d823350c43836146dbf00e3c57445bd33731e; report0775768b2acda7874ceda36507499a79c5926cb7f3e3846d2eff1ff3d91582d5. 307 hashes conferidos. V102 falha em1440/1280/768/390 × claro/escuro: geometry=false, failedHitCount=2, overflowX=0; identity/table/dates/contrast=true. Não há PNG desses casos porque medição falha antes da captura.

No código, as duas Dicas têm área44×44 e margem vertical negativa -my-3, em linha flex próxima ao input com gap6px. Hipótese específica: a caixa se sobrepõe ao input. As métricas agregadas não identificam sozinhas quais controles falharam; a reprodução nativa deve confirmar isso antes de editar produto.

## Escopo exato

BUILD futuro, após este PLAN e GATE separado integrados:
- src/components/contratantes/NovoContratante.tsx: somente geometria do botão Dica/linha do rótulo, mantendo44×44, nome acessível, foco e tooltip.
- src/test/novoContratante.test.tsx: regressão funcional dos dois controles e formulário, sem mock de layout como prova de geometria.
- scripts/hml/authenticated-visual-audit.test.mjs: reprodução isolada Chromium usando estrutura/classes locais da Dica e os cinco pontos de hit-test reais. Identificar explicitamente fixture isolada, nunca chamar de página HML.
- Documentos deste PLAN/GATE, PLANO_ATIVO e checkpoint/evidência textual de resultados.

Não alterar authenticated-visual-audit.mjs, helpers de aceite, workflows, dependências, tipos, assets, cores, tipografia, Auth, RBAC, Supabase, backend, rotas, payloads, validações ou estados de negócio. Imagens e DOM ficam nos artefatos, sem publicação de conteúdo privado no Git.

## Sequência e aceite

- [ ] CI e revisão deste PLAN; merge normal protegido.
- [ ] GATE documental separado, CI/revisão e integração.
- [ ] RED nativo: reproduzir dois alvos cobertos com as classes atuais. Confirmar cinco pontos, retângulos e identidade dos controles da fixture, sem dados reais. Se a hipótese não reproduzir, não aplicar correção por suposição.
- [ ] BUILD mínimo: reservar altura real do botão, preferindo retirar margem negativa. Não mudar tamanho do alvo nem reduzir o rigor do auditor.
- [ ] GREEN nativo nas oito combinações e regressão existente; Tooltip abre por teclado/clique, nomes e campos preservados.
- [ ] Build, TypeScript, lint/formato focal, Zero-Drift, LOCK e protocolos/nativos no HEAD final; revisão independente.
- [ ] Consolidar todas as alterações frontend necessárias e realizar um único deploy intencional HML, conforme determinação do titular. Conferir SHA/alias/READY; nunca publicar no ambiente de negócio PROD.
- [ ] Teste C real posterior, screenshots originais e SHA256, revisão independente: oito V102 sem cobertura/overflow, demais casos sem regressão. Não antecipar PASS HML pela fixture isolada.

## Riscos e revisão

Aumento local da altura do formulário e mudança de quebra em390/768. Conferir ambos os temas, foco/tooltip/Tab/Shift+Tab, posição dos inputs e controles vizinhos. Marca/sidebar/header não são redesenhados. Reversão por PR da mudança local se houver regressão.

BRAND-01: documentos19/20 lidos na fonte8dc; assets oficiais e Inter/tokens preservados, sem asset novo. A matriz geral de72critérios permanece pendente. Preservar18públicos,18baseline atuais,Run78 e evidências114/124; nenhum PASS global por contagem. As56PII e24fixtures seguem suas cadeias separadas. V1 não certificada.

**PLAN: APROVÁVEL**, condicionado a CI/revisão e GATE antes do BUILD. Nenhuma alteração de produto ou deploy neste PLAN.
