# Fase 2 R9: preflight CORS órfão de POST em Chromium real (RED/GREEN)

A Fase 2 continua NÃO CERTIFICADA. Este registro atende ao item 2 do PLAN R9 e segue o formato do #629 (relatório `R8_CAUSA_RAIZ_PREFLIGHT_CANCELADO_2026-11-13.md`). Não há dados privados: o experimento usa duas origens locais sintéticas, sem credenciais nem HML.

## Montagem

- Chrome for Testing 153.0.8010.12 (`/usr/bin/google-chrome`), `playwright-core` 1.63.0.
- Uma origem serve a página; outra faz o papel da API, com CORS e `apikey`, e atrasa a resposta do `OPTIONS` em 2 s.
- Uma sessão CDP com `Network.enable` e `Fetch.enable` (padrão `*`, estágio Request) alimenta o `createRequestLifecycle` **real** do auditor e aplica o mesmo critério do `fence.drain()`: handlers, pedidos ativos e `pendingNetwork` zerados em até 10 s.
- A página faz `fetch` com `AbortController`. Nos cenários com aborto, `abort()` ocorre 300 ms depois do envio, ainda durante o preflight.
- Script: `preflight-experiment-m2.mjs`, SHA-256 `eb15e4d9d54b9c8d009decfbeee3144ae4675ecd56e8d1a0d330a436ae2b48ed`, integral no anexo. Variáveis: `AUDIT` (caminho do auditor), `METHOD` (`GET` ou `POST`); argumento: cenário.
- Auditores: `main` `9a4d0ad` (`authenticated-visual-audit.mjs` SHA-256 `c8a558c042721dcc6fdcfa17e949a79537663008d00b224540c330ab9e4e3884`) e o BUILD R9.

## Eventos observados (POST com preflight, abortado)

- `Fetch.requestPaused` do `OPTIONS` (rt `XHR`) e `Network.requestWillBeSent` do `POST` principal (`type=Fetch`).
- Aos ~300 ms: `Network.loadingFailed` do principal, `net::ERR_ABORTED`, `canceled=true`, `type=Fetch`.
- Aos ~2 s: pausa de resposta do `OPTIONS` (204), continuada pelo fence. **Nenhum terminal `Network` do `OPTIONS` chega depois.** É o mesmo mecanismo do GET corrigido no #629.

No controle sem aborto, o `OPTIONS` recebe `responseReceived` e `loadingFinished` e o `POST` termina com 200.

## Resultado

| Auditor | Método | Cenário | Drain | Ativos | Preflights aposentados |
|---|---|---|---|---|---|
| `main` `9a4d0ad` | POST | preflight abortado | **não** (timeout 10 s) | 1 | 0 |
| `main` `9a4d0ad` | POST | preflight sem aborto | sim, ~2,3 s | 0 | 0 |
| `main` `9a4d0ad` | POST | aborto simples, sem preflight | sim, ~0,3 s | 0 | 0 |
| `main` `9a4d0ad` | GET | preflight abortado | sim, ~2,0 s | 0 | 1 |
| BUILD R9 | POST | preflight abortado | **sim, ~2,0 s** | 0 | 1 |
| BUILD R9 | POST | preflight sem aborto | sim, ~2,3 s | 0 | 0 |
| BUILD R9 | POST | aborto simples, sem preflight | sim, ~0,3 s | 0 | 0 |
| BUILD R9 | GET | preflight abortado | sim, ~2,0 s | 0 | 1 |
| BUILD R9 | GET | preflight sem aborto | sim, ~2,3 s | 0 | 0 |
| BUILD R9 | GET | aborto simples, sem preflight | sim, ~0,3 s | 0 | 0 |

RED na `main` para POST com preflight abortado (o mesmo travamento do índice 35 da R8) e GREEN no BUILD R9. Nos controles, nada muda: sem aborto não há aposentadoria, e o aborto simples termina pelo próprio `loadingFailed`. O pedido principal abortado continua contado como `ABORTED` pelo auditor; a extensão só libera o registro do `OPTIONS` com as três provas (principal `canceled` com `ERR_ABORTED`, não bloqueado e do mesmo tipo; preflight órfão; resposta do preflight continuada pelo fence).

A revisão independente do BUILD R9 repetiu o experimento por conta própria (padrões Request e Response, cache desativado) e obteve os mesmos eventos.

## Anexo: script do experimento

```js
// Experimento causal offline: GET cross-origin com preflight CORS abortado pela página,
// observado por uma sessão CDP com Fetch+Network como o fence, alimentando o
// createRequestLifecycle REAL do auditor (main 78a5f4b).
import { createServer } from "node:http";
import { chromium } from "playwright-core";
const { createRequestLifecycle } = await import(process.env.AUDIT || "/tmp/exp/audit.mjs");

const scenario = process.argv[2] || "preflight-abort";
const PREFLIGHT_DELAY = scenario === "preflight-hang" ? 60000 : 2000;

function listen(handler) {
  return new Promise((r) => {
    const s = createServer(handler);
    s.listen(0, "127.0.0.1", () => r(s));
  });
}
const api = await listen((req, res) => {
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "apikey, authorization, content-type",
    "Access-Control-Allow-Methods": "GET, POST",
  };
  if (req.method === "OPTIONS") {
    setTimeout(() => {
      res.writeHead(204, cors);
      res.end();
    }, PREFLIGHT_DELAY);
    return;
  }
  setTimeout(() => {
    res.writeHead(200, { ...cors, "Content-Type": "application/json" });
    res.end("[]");
  }, 200);
});
const apiPort = api.address().port;
const page_ = await listen((req, res) => {
  res.writeHead(200, { "Content-Type": "text/html" });
  res.end("<!doctype html><title>t</title><body>ok</body>");
});
const pagePort = page_.address().port;

const browser = await chromium.launch({ executablePath: "/usr/bin/google-chrome", args: ["--no-sandbox"] });
const context = await browser.newContext();
const page = await context.newPage();
await page.goto(`http://127.0.0.1:${pagePort}/`);
const cdp = await context.newCDPSession(page);
const info = (await cdp.send("Target.getTargetInfo")).targetInfo;
const identity = { targetId: info.targetId, browserContextId: info.browserContextId };
const session = { id: "S1", targetId: identity.targetId, contextId: identity.browserContextId };
const lifecycle = createRequestLifecycle(identity);
const frame = (await cdp.send("Page.getFrameTree")).frameTree.frame;
lifecycle.frame(session, { id: frame.id, loaderId: frame.loaderId });

const log = [];
const t0 = Date.now();
const note = (m, e) => log.push((e.initiator?.type==="preflight"?`[initiator=preflight main=${e.initiator.requestId}] `:"")+`${String(Date.now() - t0).padStart(5)}ms ${m} id=${e.requestId}${e.networkId ? " net=" + e.networkId : ""}${e.type ? " type=" + e.type : ""}${e.request?.method ? " " + e.request.method : ""}${e.resourceType ? " rt=" + e.resourceType : ""}${e.errorText ? " err=" + e.errorText : ""}${e.canceled ? " canceled" : ""}${e.responseStatusCode ? " status=" + e.responseStatusCode : ""}`);
const handlers = new Set();
const errors = [];
for (const m of ["Network.requestWillBeSent", "Network.responseReceived", "Network.loadingFailed", "Network.loadingFinished"]) {
  cdp.on(m, (e) => {
    note(m, e);
    try { lifecycle.observe(session, m, e); } catch (err) { errors.push(m + ":" + (err.code || err.message)); }
  });
}
cdp.on("Fetch.requestPaused", (e) => {
  note("Fetch.requestPaused", e);
  const p = (async () => {
    let ticket;
    try {
      ticket = await lifecycle.pauseWhenObserved(session, e, performance.now());
      const response = e.responseStatusCode !== undefined || e.responseErrorReason !== undefined;
      if (!response) {
        lifecycle.sent(ticket);
        await cdp.send("Fetch.continueRequest", { requestId: e.requestId, interceptResponse: true });
        lifecycle.acknowledge(ticket);
        return;
      }
      await cdp.send("Fetch.continueResponse", { requestId: e.requestId });
      lifecycle.responded?.(ticket);
    } catch (error) {
      const err = { code: "CDP_COMMAND", command: "Fetch.continueRequest", protocolCode: -32602, reason: "INVALID_INTERCEPTION" };
      const handled = await lifecycle.handleCanceled(ticket, /Invalid InterceptionId/i.test(error.message) ? err : error).catch(() => false);
      if (!handled) errors.push("paused:" + (error.code || error.message).slice(0, 120));
    } finally {
      lifecycle.finish(ticket);
    }
  })();
  handlers.add(p);
  p.finally(() => handlers.delete(p));
});
await cdp.send("Network.enable");
await cdp.send("Fetch.enable", { patterns: [{ urlPattern: "*", requestStage: "Request" }] });

const url = `http://localhost:${apiPort}/rest/v1/doc?select=*`;
const withHeader = scenario !== "simple-abort";
const method = process.env.METHOD || "GET";
const abort = scenario !== "preflight-noabort";
await page.evaluate(({ url, withHeader, abort, method }) => {
  const c = new AbortController();
  fetch(url, { method, body: method === "POST" ? "{}" : undefined, signal: c.signal, headers: withHeader ? { apikey: "x", "content-type": "application/json" } : {} }).catch(() => {});
  if (abort) setTimeout(() => c.abort(), 300);
}, { url, withHeader, abort, method });

// Só mede depois de o primeiro pedido ter sido observado.
while (!log.some((l) => l.includes("requestWillBeSent") && l.includes("localhost") === false && /GET|POST|OPTIONS/.test(l))) await new Promise((r) => setTimeout(r, 5));
await new Promise((r) => setTimeout(r, 50));
// Mesmo critério do fence.drain(): handlers, requests e pendingNetwork zerados, até 10 s.
const deadline = Date.now() + Number(process.env.WAIT_MS || 10000);
let drained = false;
while (Date.now() < deadline) {
  const s = lifecycle.snapshot();
  if (handlers.size === 0 && s.active === 0 && s.pendingNetwork === 0) { drained = true; break; }
  await new Promise((r) => setTimeout(r, 10));
}
const snap = lifecycle.snapshot();
console.log(JSON.stringify({ scenario, drained, drainedAtMs: drained ? Date.now() - t0 : null, handlers: handlers.size, ...snap, errors }));
console.log(log.join("\n"));
await browser.close();
api.close();
page_.close();
```
