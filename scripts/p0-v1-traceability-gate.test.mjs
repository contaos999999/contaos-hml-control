import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { validateLedger, ledgerFile } from "./p0-v1-traceability-gate.mjs";

const baseline = JSON.parse(readFileSync(ledgerFile, "utf8"));
const copy = () => structuredClone(baseline);
const failing = (mutate, expected) => {
  const payload = copy();
  mutate(payload);
  assert.ok(validateLedger(payload).some((issue) => issue.includes(expected)),
    "Deveria reprovar: " + expected);
};

test("P0 V1: o inventário vigente é consistente e não falseia certificação", () => {
  assert.deepEqual(validateLedger(baseline), []);
});
test("P0 V1: bloquear remoção de regular", () => {
  failing((data) => data.regular.pop(), "Lista ou ordem de 45");
});
test("P0 V1: bloquear remoção de critério legado", () => {
  failing((data) => {data.regular[1].criteria.pop();data.regular[1].criteria_count--;}, "416 critérios");
});
test("P0 V1: bloquear duplicidade de ID atômico", () => {
  failing((data) => {data.atomic[1].atomic_id="000";}, "ID atômico duplicado");
});
test("P0 V1: bloquear atômico sem fonte documental", () => {
  failing((data) => {data.atomic[2].source="";}, "Atômico sem fonte");
});
test("P0 V1: bloquear status artificialmente certificado", () => {
  failing((data) => {data.regular[1].criteria[0].certified=true;}, "Critério promovido");
});
test("P0 V1: bloquear quarta exceção não autorizada", () => {
  failing((data) => {data.exception_policy.R04="Nova dispensa";}, "Exceções aumentadas");
});
test("P0 V1: bloquear supressão de NFR transversal", () => {
  failing((data) => {data.atomic.at(-1).applies_to_v1=false;}, "RNF transversal ignorado");
});
test("P0 V1: bloquear fonte canônica alterada silenciosamente", () => {
  failing((data) => {data.source_catalog_blob="0000000000000000000000000000000000000000";},
    "Fonte original");
});
