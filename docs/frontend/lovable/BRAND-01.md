# PROMPT 000 / BRAND-01 — Identidade Visual Oficial ContaOS v1.0

Base: `3ac193a57efb69e7a9982184a8916c197909dca1`. Plano aprovado: `.lovable/plan/prompt-000-brand-01-plan-revisado-somente-plano-sem-build-2026-11-02.md`.
Fonte: pacote `ContaOS_4_1_BRAND_FINAL.zip` (PROMPT_000, ANEXO_BRAND_01, ANEXO_ZERO_DRIFT_BRAND_01, Marca Oficial v1.0, Manual).

## Decisões
- Fonte global inalterada (sem Inter global); wordmark do SVG usa `Inter,Arial` — Arial é fallback autorizado pelo Manual.
- Nenhum token novo; `--primary`/`--accent` inalterados (contraste AA).
- Logo horizontal ≥120 px (32 px de altura ≈131 px) a partir de `sm`; símbolo isolado abaixo (Manual §3.1).
- PWA/manifest, sidebar, boot/erro com marca: NÃO APLICÁVEL, não criados.

## Assets oficiais (byte a byte, SHA-256 do MANIFEST_SHA256_v4_1_BRAND_v1_0.json)
| Arquivo | SHA-256 |
|---|---|
| public/brand/ContaOS_Logo_Horizontal_Fundo_Escuro.svg | 2d3c6c1a088a6f631acf2055a06a9e4b7bd81519cd83b2c9fed4fcf367815187 |
| public/brand/ContaOS_Simbolo_Branco.svg | 7de27bd24a220d9d8e6b7bb2352e9ba895109e3f648401f5cc454fff1873e3fc |
| public/favicon.svg | b659af3ca70eaa47cfa67c0115a394c23448f091ba9ded7cb3a15b5702c1c907 |
| public/favicon.ico | 9d1705a8e8a446b33e3f907adf9b4d5f8d137af3ead8f81d217f6eaa99c3121f |
| public/favicon-16x16.png | 700d6d663f22e5cee0d0566f41aac972dc96504da81035ca53a1c5a9724ddf3d |
| public/favicon-32x32.png | 393b2cb1424baa86e05f7320285d62a4e159ab3f99caf37b4b9f73168fc02d37 |
| public/favicon-48x48.png | 3a2e17b6535c59feafdb0196b026d1481a36c181fc0ad0f4548dbd4ccb655cbc |

## Testes
`src/test/brand.test.tsx` (RED: módulo ausente; GREEN após build). Validação browser 1440/1280/768/390.
