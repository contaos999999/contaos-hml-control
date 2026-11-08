# Comparação executada: build da main × HML publicado

**Resultado: os artefatos comparados são diferentes. A igualdade com a main não foi comprovada; há também divergência de implementação do cabeçalho observada no HML.**

Coleta iniciada em 08/11/2026, às 00:08, America/Bahia. A main foi consultada antes e depois da comparação e permaneceu em `45104916895a1f0972ecec2eec9a541dbd4e0b97`. Nenhuma publicação, sincronização forçada, alteração de produto ou backend foi realizada.

## Método executado

1. Checkout isolado e imutável da main. Instalação por Bun 1.4.4 com `bun install --frozen-lockfile`, seguida de `bun run build`. Build concluído e fontes versionadas sem alterações, incluindo `types.ts` no blob certificado `8ea7750b75fd9d76b29c36ce7613392e3ab65e19`.
2. GET público de `https://scope-and-approval-keeper.lovable.app`, sem sessão, cookies ou credenciais. Preservados SHA-256 do HTML e cabeçalhos selecionados, excluindo Set-Cookie. Download do entry identificado no HTML e dos módulos descobertos por caminhos literais, sem executar JavaScript.
3. Obtidos 108 módulos JavaScript, total de 1.345.822 bytes. Inventariados caminho, tamanho e SHA-256 de cada arquivo. Apenas 21 módulos têm simultaneamente o mesmo caminho e hash no build atual. O grafo estático descoberto não equivale a um rastreamento exaustivo de rede em runtime.
4. Reconstruído também o commit `935bb96e3d73f7f7d1a8585a4e677db5dd92a379`, informado por `latest_commit_sha` do Lovable. Seu package.json e bun.lock são iguais aos da main, permitindo usar as mesmas dependências congeladas. As fontes desse checkout também permaneceram intactas.

## Comparação dos entries

| Origem | Arquivo | Bytes | SHA-256 |
|---|---|---:|---|
| Build da main `4510491` | `index-CrkggL7D.js` | 322.713 | `f16568e5cacab8cbe739909c6c4489c18494b25c7cabcb320408811569479b8b` |
| HML publicado | `index-CjzqjoMJ.js` | 318.007 | `cbce6433c598f440012543f62e36c5f0bef7986ed198952496bd0d7f2beccc54` |
| Build do commit informado pelo Lovable `935bb96` | `index-DMDJ_yWG.js` | 321.658 | `7a60581b492db06dd5396ec47768b2efc02b45c2a9f0d08e83c293ace0e8ed18` |

Diferenças de hash, isoladamente, podem decorrer do ambiente ou da configuração de build. Por isso foram examinados também marcadores concretos da implementação e a evidência funcional autenticada.

## Diferença de implementação constatada

O entry da main contém as três strings do cabeçalho compartilhado:

- `Organização atual`, no atributo de acessibilidade;
- `Confirmando organização`, no estado de carregamento;
- `Não foi possível confirmar a organização.`, no estado de erro.

Nenhuma das três aparece nos 108 módulos publicados obtidos. O build do commit `935bb96` também contém o cabeçalho. A [coleta autenticada](TRILHA_A_AUTENTICADA_2026-11-08.md) mostra a ausência do contexto organizacional nas telas e a marca duplicada nos cabeçalhos publicados, corroborando a divergência sem depender apenas de nomes de arquivo ou hashes.

Isso demonstra que o conjunto servido não é o artefato reconstruído da main e que a publicação observada não reproduz a implementação atual do cabeçalho. Não identifica, por si só, o commit exato usado para publicar o HML.

## Identificador de implantação e limites

Foi recebido `x-deployment-id`, preservado em `published-manifest.json`. Não foi encontrado vínculo verificável desse valor com um SHA Git. Ele não foi tratado como prova de correspondência e não substitui a comparação.

`latest_commit_sha` é metadado do projeto Lovable, não comprovação do código servido. O build desse próprio commit também difere do bundle publicado. Não afirmar que o HML foi publicado necessariamente a partir de `935bb96`.

A prova não valida autenticação/RLS, a matriz visual 232/72 ou o domínio CRUD. Não houve tentativa de publicar para corrigir a divergência durante a auditoria.

## Evidências reproduzíveis

Diretório [evidencias/versao-hml-20261108](evidencias/versao-hml-20261108/):

- `published-manifest.json`: URL, horário UTC, cabeçalhos selecionados e hash do entry/HTML;
- `published-graph.json`: hashes dos 108 módulos obtidos;
- `main-build-manifest.json`: commit, lockfile, ferramentas e hashes dos 123 arquivos públicos gerados;
- `lovable-pin-build-manifest.json`: inventário do build de controle;
- `comparison.json`: resultados da comparação e limites;
- `download_graph.py`: coletor público, limitado ao mesmo host e diretório /assets, sem execução de código remoto;
- `SHA256SUMS`: hashes dos seis arquivos de evidência acima.

**Próxima ação:** reconciliar a publicação HML com uma fonte integrada conhecida e repetir a comparação, preservando estes recibos de divergência. Não repetir correções de cabeçalho já existentes na main. Certificação visual e V1 permanecem NO-GO.

ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE: comparação e documentação somente; nenhum produto, tipo congelado, workflow, dependência versionada, backend ou PROD alterado.
