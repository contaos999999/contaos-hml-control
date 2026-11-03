# PROMPT 36 / V1-15 — Competência: Documentos

Base: `77ffd79` (árvore V1-14 equivalente a `b5fe91f`). Plano aprovado: `.lovable/plan/prompt-36-v1-15-competência-documentos-plan-2026-11-03.md` (com correção de `tipos_esperados`).

## Backend consumido (certificado, não alterado)
- `obter_documentos_competencia_v115` (paginação 25/25, `estado_documental`, `capacidades`)
- `criar_documento_competencia_v115`, `adicionar_versao_documento_competencia_v115` (idempotentes, retorno `id_documento/id_versao/numero_versao/id_arquivo`)
- `confirmar_upload_arquivo`, Edges `storage-sign-upload` / `storage-sign-download`

## Arquivos
Criados: `src/routes/competencias_.$id_.documentos.tsx`, `src/components/competencias/CompetenciaDocumentos.tsx`, `src/lib/competencias/competenciaDocumentosDados.ts`, `src/test/competenciaDocumentos.test.tsx`, este documento.
Alterados: `src/lib/contratos/documentosDados.ts` (extração de `enviarArquivoCertificado`, pipeline único), `src/components/contratos/DocumentosContrato.tsx` (passa a chamar a função extraída; comportamento idêntico), `src/components/competencias/CompetenciaVisaoGeral.tsx` (aba Documentos vira link; Análise/Parecer/Apresentação e ações seguem "Em breve"), `src/test/competenciaVisaoGeral.test.tsx` (hunk da aba), `src/routeTree.gen.ts` (automático).

## Decisões
- Estado documental, contadores, `atendido`, capacidades e motivo obrigatório: somente backend; nenhum recálculo.
- Tipo do documento: `tipos_esperados` não vazio é autoritativo (rótulo V1-10 ou o próprio valor); vazio → `TIPOS_DOCUMENTO` V1-10.
- Erros: 42501/401/403 → sem permissão; PT404 → não encontrada; 23505 → duplicada; PT409/40001 → conflito; P0001/PT400/outros → genérico. Nunca texto bruto.
- Chave idempotente por tentativa lógica; retry manual reutiliza chave e não reenvia bytes; trava contra duplo clique.
- Abrir: download assinado V1-10; quarentena/bloqueado/pendente desabilitam. Sem rota V1-11 (semântica diferente).
- Polling apenas em `processing`, backoff V1-10 (5s→60s), para em terminal/unmount.

## Evidências (TDD)
- RED: suíte V1-15 falhou por módulos ausentes; aba Documentos falhou antes do link.
- GREEN: V1-15 33/33; V1-14 32/32; regressão V1-15+V1-14+V1-13+V1-12+V1-11+V1-10 176/176; suíte serial 609/609 (25 arquivos), exit 0.
- Lint arquivos alterados/criados: 0 erros. Scan estático: sem `service_role`, `getPublicUrl`, `sb_secret`.
- Reuso comprovado: teste estático garante que os arquivos V1-15 importam `documentosDados` e não contêm `storage-sign-*`, TUS, `uploadToSignedUrl`, `MIMES_POR_EXTENSAO`, `CHUNK_TUS`, `crypto.subtle`.
- Browser: `/competencias/abc/documentos` em 1440/1280/768/390 claro/escuro: mensagem sanitizada, sem overflow, zero requisições ao Supabase. Estados autenticados verificados apenas por testes com fixture (sem sessão HML real).
- `types.ts` restaurado ao blob `8ea7750b75fd9d76b29c36ce7613392e3ab65e19`. Zero diff em `supabase/**`, package/lock, client, `components/ui`, `styles.css`, `public/brand`, AGENTS.
- Pendentes: `tsc --noEmit`/build manual (restrição do ambiente; build automático do preview), Security Scan, Teste C read-only.
