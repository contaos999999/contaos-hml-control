import assert from "node:assert/strict";
import test from "node:test";
import { createServer, connect } from "node:net";
import { createServer as createHttpServer } from "node:http";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { WebSocketServer } = createRequire(require.resolve("jsdom"))("ws");

const sut = await import("./authenticated-visual-audit.mjs").catch((error) => {
  if (
    error.code !== "ERR_MODULE_NOT_FOUND" ||
    !error.message.includes("authenticated-visual-audit.mjs")
  )
    throw error;
  return {};
});
function fn(name) {
  assert.equal(typeof sut[name], "function", `${name}: comportamento ainda nÃ£o implementado`);
  return sut[name];
}
const HML = "https://contaos-41-hml.vercel.app";
const API = "https://gklhhhyosgasnyoxlrui.supabase.co";
const config = {
  origin: HML,
  frontendSha: "1".repeat(40),
  harnessSha: "2".repeat(40),
  deploymentId: "dpl_fixture123",
  emailPresent: true,
  passwordPresent: true,
};
test("configuraÃ§Ã£o impede login sem segredo ou com destino diferente", () => {
  const validate = fn("validateConfiguration");
  assert.equal(validate(config).ready, true);
  for (const delta of [
    { emailPresent: false },
    { passwordPresent: false },
    { origin: "https://foreign.invalid" },
    { frontendSha: "main" },
    { harnessSha: "" },
    { deploymentId: "../" },
  ]) {
    assert.equal(validate({ ...config, ...delta }).ready, false);
  }
});
test("parser real ignora scrip¶»§q«^