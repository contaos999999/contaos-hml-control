# Forense offline V112, 09/11/2026

Evidência documental em branch isolada. Nenhuma alteração de produto, auditor de produção, política de rede ou dicionário. Nenhuma chamada HML, Auth, SQL, screenshot ou dado desconhecido coletado. Main não foi alterada.

## Resultado real

Playwright1.58.2, Chromium/headless_shell1208, versão145.0.7632.6. Lançamento com chromiumSandbox:true, sem args personalizados. Browser.getBrowserCommandLine confirmou sandbox habilitado e zero switches da lista proibida (no-sandbox, disable-setuid-sandbox, disable-web-security, allow-running-insecure-content, ignore-certificate-errors).

HostUbuntu26.04 não é reconhecido pelo instalador antigo1.58.2. A instalação padrão --with-deps falhou; o alvo binário explícito PLAYWRIGHT_HOST_PLATFORM_OVERRIDE=ubuntu24.04-x64 permitiu instalar binário/dependências. Nenhuma segurança do navegador foi desligada. A prova registra host, alvo, binário real e versão; não é prova de compatibilidade geral desse host.

| Fixture local | Casos | Rendered desconhecidos | Snapshot desconhecidos |
|---|---:|---:|---:|
| Apenas período aprovado | 8 | 1 | 1 |
| Tabela baseada na fonte | 8 | 1 | 3 |

Quatro larguras1440/1280/768/390 e temaslight/dark. Na tabela, o período aparece duas vezes no ARIA real: nome agregado da row e cell. O token não permitido é01, não a conjunçãoa. O terceiro desconhecido érowheader, gerado nativamente pelo th scope=row. LiteralWords real permitea e meter tanto no SRC241dd quanto no SRCatualfca0798. Não permite01 nemrowheader.

Diagnóstico contrafactual somente em memória: retirar as duas ocorrências do período aprovado levaUNKNOWN3→1; retirar também o papel estrutural nativo leva1→0. Isto demonstra composição de contagens da fixture; não cria exceção de privacidade ou autorização runtime. OTHER=0 após as normalizações já existentes do classificador; uma categoria estrutural já tratada pelo baseline é excluída por essa normalização. Nenhuma palavra desconhecida ou hash de texto desconhecido foi persistido.

## Proveniência

- Harness original:2a5ef8043ff26fbe9b4c68b828099f0c7dd70e33; arquivoSHA2568454550c8f47a3b01fd15a669e076d04016e8c26792634b49dbc6e9419c90020.
- SRC original:241dd775d14a0d2a1ec24c93ae3f655c79d3efd2; CompetenciasContrato.tsx SHA2562819e6b2a12b1252c74cb7df96ce944e4f7cbf483d65bbb7bebd221b01ff0c97.
- SRC comparativo atual:fca0798d3eba81e8daa3a876a255f34b66ff39f9.
- fixture.html SHA256573782fc3abf5f306cede0d9f3ebb1563a8daa2ab1ed8d1beebac273354f0b04.
- forensic.mjs SHA2567d8105c5df7cd113a36d4a4e22da30184bb153fe36ef57895da845a47d8fd142.
- proof.json SHA2569910d67382e61bf803a6fe831375f3874d45f779384abe403dafe450204c055f.
- Execução forense final no Sandbox:cmd_2344f416f7fe445fae28c9c0e47c registra resumo. Não reutilizar resultados locais antigos como se fossem este experimento.

## Reprodução isolada

O script usa o layout/vercel/v112-forensic para seus próprios arquivos, /vercel/v112-source241 para a worktree readonly do SRC original e/vercel/v112agent para a fonte atualfixada. Instalar temporariamente TypeScript5.9.3/jsdom20.0.3/Playwright1.58.2 em/vercel/tools e apontar node_modules do diretório forense para essas dependências. Extrair scripts/hml/authenticated-visual-audit.mjs do commit original2a5ef para harness-original.mjs nesse diretório; não editar o harness. Copiar forensic.mjs efixture.html preservando os bytes. Instalar Chromium1208 e dependências do alvoUbuntu24.04 conforme a limitação registrada. Executar Node com o mesmo PLAYWRIGHT_HOST_PLATFORM_OVERRIDE. O script bloqueia todas as requisições de página e processa somente fixtures locais. Não executá-lo como auditor HML.

## Limites

A fixture contém apenas referência/períodoNov já aprovado; demais células de negócio são placeholders—, explicitamente não valores de um registro real. Não reproduz o corpo bloqueado do run nem prova que todo desconhecido HML seja esse trio, apesar de reproduzir as contagens1/3 e explicar causalmente as duas ocorrências extras locais. Não salva ARIA bruto, DOM bruto ou screenshot. Não é Teste C de produto, PASS de8casos V112, resolução56PII,72/WCAG/V1. Alteração de helper/catálogo de V112 requer emendaGATE própria, CI/revisão/merge e validação runtime posterior. A forma tabela permanece no SRC conferido em todas as larguras; não foi presumida uma representação em cards.
