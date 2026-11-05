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

test("P0 V1: bloquear regular final sem os 12 critérios", () => {
  failing((data) => {
    const prompt = data.regular.find((item) => item.id === "75");
    prompt.criteria.pop();
    prompt.criteria_count -= 1;
  }, "Prompts finais exigem 12 critérios");
});
test("P0 V1: bloquear critério final duplicado", () => {
  failing((data) => {
    const prompt = data.regular.find((item) => item.id === "42");
    prompt.criteria[5].index = 4;
  }, "Critério final duplicado");
});
test("P0 V1: bloquear source_protocol ausente", () => {
  failing((data) => {
    const prompt = data.regular.find((item) => item.id === "41");
    prompt.criteria[0].source_protocol = "";
  }, "Critério final sem fonte/escopo");
});
test("P0 V1: bloquear evidência simulada promovida a certificação", () => {
  failing((data) => {
    const prompt = data.regular.find((item) => item.id === "39");
    prompt.criteria[2].certified = true;
  }, "Critério final promovido ou sem limites de prova");
});
test("P0 V1: bloquear título de teste não existente no código", () => {
  failing((data) => {
    const prompt = data.regular.find((item) => item.id === "40");
    prompt.criteria[0].indicative_test_titles = ["TESTE_INEXISTENTE_XYZ"];
  }, "Título de teste indicativo sem correspondência");
});
test("P0 V1: bloquear declaração artificial de mais itens finais", () => {
  failing((data) => {
    data.coverage.final_normalized_criteria_indexed = 74;
  }, "Cobertura dos 72 critérios finais");
});
