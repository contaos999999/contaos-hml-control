/**
 * F3 CODE — registry de provas funcionais de produto.
 * Sem adaptadores artificiais: cada caso exige testes reais do frontend sob
 * fixtures CODE isoladas; HML LIVE/RLS remota só após V5.
 */
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readFile, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const exec = promisify(execFile);
const ROOT = fileURLToPath(new URL("../../", import.meta.url));
const CASE_0036 = "IFV1-F3-C0036";
const CASE_0037 = "IFV1-F3-C0037";
const CASE_0041 = "IFV1-F3-C0041";
const CASE_0043 = "IFV1-F3-C0043";
const CASE_0048 = "IFV1-F3-C0048";
const CONSUMER_0048 = "contratos";
let c0048Run = null;
const CASE_0045 = "IFV1-F3-C0045";
const CONSUMER_0045 = "contratantes";
let c0045Run = null;
let c0043Run = null;
const ORG_0041 = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
const CONSUMER_0041 = "consultar_permissoes_efetivas";
let c0041Run = null;
const CONSUMER_0037 = "obter_resumo_dashboard";
let c0037Run = null;
const ORG_0036 = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const CONSUMER_0036 = "listar_organizacoes_disponiveis";
let c0036Run = null;

async function runCase0036() {
  if (!c0036Run) {
    c0036Run = (async () => {
      const dir = await mkdtemp(join(tmpdir(), "contaos-f3-c0036-"));
      const evidenceFile = join(dir, "observations.json");
      try {
        // A própria Vitest instancia o módulo de produto com RPC isolada
        // e exige duas asserções antes de publicar o resultado.
        await exec(
          "bunx",
          ["vitest", "run", "src/test/f3-code-case-0036.test.ts", "--reporter=dot"],
          {
            cwd: ROOT,
            env: { ...process.env, F3_CODE_C0036_OBSERVATIONS: evidenceFile },
            timeout: 60000,
            maxBuffer: 1024 * 1024,
          },
        );
        const parsed = JSON.parse(await readFile(evidenceFile, "utf8"));
        if (
          !Array.isArray(parsed) ||
          parsed.length !== 2 ||
          parsed[0]?.caseId !== CASE_0036 ||
          parsed[1]?.caseId !== CASE_0036 ||
          parsed[0].kind !== "positive" ||
          parsed[1].kind !== "negative" ||
          parsed.some(
            (event) =>
              event.consumer !== CONSUMER_0036 ||
              event.producerOrder !== 1 ||
              event.organizationId !== ORG_0036 ||
              event.producerEntityId !== ORG_0036 ||
              event.state !== "EXECUTED" ||
              event.assertion !== "PASS",
          )
        ) {
          throw Object.assign(new Error("F3_C0036_BAD_TEST_OUTPUT"), {
            code: "F3_C0036_BAD_TEST_OUTPUT",
          });
        }
        return Object.freeze(parsed.map((event) => Object.freeze(event)));
      } finally {
        await rm(dir, { recursive: true, force: true });
      }
    })();
  }
  return c0036Run;
}

async function runCase0037() {
  if (!c0037Run) {
    c0037Run = (async () => {
      const dir = await mkdtemp(join(tmpdir(), "contaos-f3-c0037-"));
      const evidenceFile = join(dir, "observations.json");
      try {
        await exec(
          "bunx",
          ["vitest", "run", "src/test/f3-code-case-0037.test.tsx", "--reporter=dot"],
          {
            cwd: ROOT,
            env: { ...process.env, F3_CODE_C0037_OBSERVATIONS: evidenceFile },
            timeout: 60000,
            maxBuffer: 1024 * 1024,
          },
        );
        const parsed = JSON.parse(await readFile(evidenceFile, "utf8"));
        if (
          !Array.isArray(parsed) ||
          parsed.length !== 2 ||
          parsed[0]?.caseId !== CASE_0037 ||
          parsed[1]?.caseId !== CASE_0037 ||
          parsed[0].kind !== "positive" ||
          parsed[1].kind !== "negative" ||
          parsed.some(
            (event) =>
              event.consumer !== CONSUMER_0037 ||
              event.producerOrder !== 1 ||
              event.organizationId !== ORG_0036 ||
              event.producerEntityId !== ORG_0036 ||
              event.state !== "EXECUTED" ||
              event.assertion !== "PASS",
          )
        ) {
          throw Object.assign(new Error("F3_C0037_BAD_TEST_OUTPUT"), {
            code: "F3_C0037_BAD_TEST_OUTPUT",
          });
        }
        return Object.freeze(parsed.map((event) => Object.freeze(event)));
      } finally {
        await rm(dir, { recursive: true, force: true });
      }
    })();
  }
  return c0037Run;
}

async function runCase0041() {
  if (!c0041Run) {
    c0041Run = (async () => {
      const dir = await mkdtemp(join(tmpdir(), "contaos-f3-c0041-"));
      const evidenceFile = join(dir, "observations.json");
      try {
        await exec(
          "bunx",
          ["vitest", "run", "src/test/f3-code-case-0041.test.ts", "--reporter=dot"],
          {
            cwd: ROOT,
            env: { ...process.env, F3_CODE_C0041_OBSERVATIONS: evidenceFile },
            timeout: 60000,
            maxBuffer: 1024 * 1024,
          },
        );
        const parsed = JSON.parse(await readFile(evidenceFile, "utf8"));
        if (
          !Array.isArray(parsed) ||
          parsed.length !== 2 ||
          parsed[0]?.caseId !== CASE_0041 ||
          parsed[1]?.caseId !== CASE_0041 ||
          parsed[0].kind !== "positive" ||
          parsed[1].kind !== "negative" ||
          parsed.some(
            (event) =>
              event.consumer !== CONSUMER_0041 ||
              event.producerOrder !== 3 ||
              event.organizationId !== ORG_0041 ||
              event.producerEntityId !== ORG_0041 ||
              event.state !== "EXECUTED" ||
              event.assertion !== "PASS",
          )
        ) {
          throw Object.assign(new Error("F3_C0041_BAD_TEST_OUTPUT"), {
            code: "F3_C0041_BAD_TEST_OUTPUT",
          });
        }
        return Object.freeze(parsed.map((event) => Object.freeze(event)));
      } finally {
        await rm(dir, { recursive: true, force: true });
      }
    })();
  }
  return c0041Run;
}

async function runCase0043() {
  if (!c0043Run) {
    c0043Run = (async () => {
      const dir = await mkdtemp(join(tmpdir(), "contaos-f3-c0043-"));
      const evidenceFile = join(dir, "observations.json");
      try {
        await exec(
          "bunx",
          ["vitest", "run", "src/test/f3-code-case-0043.test.tsx", "--reporter=dot"],
          {
            cwd: ROOT,
            env: { ...process.env, F3_CODE_C0043_OBSERVATIONS: evidenceFile },
            timeout: 60000,
            maxBuffer: 1024 * 1024,
          },
        );
        const parsed = JSON.parse(await readFile(evidenceFile, "utf8"));
        if (
          !Array.isArray(parsed) ||
          parsed.length !== 2 ||
          parsed[0]?.caseId !== CASE_0043 ||
          parsed[1]?.caseId !== CASE_0043 ||
          parsed[0].kind !== "positive" ||
          parsed[1].kind !== "negative" ||
          parsed.some(
            (event) =>
              event.consumer !== CONSUMER_0037 ||
              event.producerOrder !== 3 ||
              event.organizationId !== ORG_0041 ||
              event.producerEntityId !== ORG_0041 ||
              event.state !== "EXECUTED" ||
              event.assertion !== "PASS",
          )
        ) {
          throw Object.assign(new Error("F3_C0043_BAD_TEST_OUTPUT"), {
            code: "F3_C0043_BAD_TEST_OUTPUT",
          });
        }
        return Object.freeze(parsed.map((event) => Object.freeze(event)));
      } finally {
        await rm(dir, { recursive: true, force: true });
      }
    })();
  }
  return c0043Run;
}

async function runCase0045() {
  if (!c0045Run) {
    c0045Run = (async () => {
      const dir = await mkdtemp(join(tmpdir(), "contaos-f3-c0045-"));
      const evidenceFile = join(dir, "observations.json");
      try {
        await exec(
          "bunx",
          ["vitest", "run", "src/test/f3-code-case-0045.test.ts", "--reporter=dot"],
          {
            cwd: ROOT,
            env: { ...process.env, F3_CODE_C0045_OBSERVATIONS: evidenceFile },
            timeout: 60000,
            maxBuffer: 1024 * 1024,
          },
        );
        const parsed = JSON.parse(await readFile(evidenceFile, "utf8"));
        if (
          !Array.isArray(parsed) ||
          parsed.length !== 2 ||
          parsed[0]?.caseId !== CASE_0045 ||
          parsed[1]?.caseId !== CASE_0045 ||
          parsed[0].kind !== "positive" ||
          parsed[1].kind !== "negative" ||
          parsed.some((event) =>
            event.consumer !== CONSUMER_0045 ||
            event.producerOrder !== 3 ||
            event.organizationId !== ORG_0041 ||
            event.producerEntityId !== ORG_0041 ||
            event.state !== "EXECUTED" ||
            event.assertion !== "PASS",
          )
        ) {
          throw Object.assign(new Error("F3_C0045_BAD_TEST_OUTPUT"), {
            code: "F3_C0045_BAD_TEST_OUTPUT",
          });
        }
        return Object.freeze(parsed.map((event) => Object.freeze(event)));
      } finally {
        await rm(dir, { recursive: true, force: true });
      }
    })();
  }
  return c0045Run;
}

async function runCase0048() {
  if (!c0048Run) {
    c0048Run = (async () => {
      const dir = await mkdtemp(join(tmpdir(), "contaos-f3-c0048-"));
      const evidenceFile = join(dir, "observations.json");
      try {
        await exec(
          "bunx",
          ["vitest", "run", "src/test/f3-code-case-0048.test.ts", "--reporter=dot"],
          {
            cwd: ROOT,
            env: { ...process.env, F3_CODE_C0048_OBSERVATIONS: evidenceFile },
            timeout: 60000,
            maxBuffer: 1024 * 1024,
          },
        );
        const parsed = JSON.parse(await readFile(evidenceFile, "utf8"));
        if (
          !Array.isArray(parsed) ||
          parsed.length !== 2 ||
          parsed[0]?.caseId !== CASE_0048 ||
          parsed[1]?.caseId !== CASE_0048 ||
          parsed[0].kind !== "positive" ||
          parsed[1].kind !== "negative" ||
          parsed.some((event) =>
            event.consumer !== CONSUMER_0048 ||
            event.producerOrder !== 3 ||
            event.organizationId !== ORG_0041 ||
            event.producerEntityId !== ORG_0041 ||
            event.state !== "EXECUTED" ||
            event.assertion !== "PASS",
          )
        ) {
          throw Object.assign(new Error("F3_C0048_BAD_TEST_OUTPUT"), {
            code: "F3_C0048_BAD_TEST_OUTPUT",
          });
        }
        return Object.freeze(parsed.map((event) => Object.freeze(event)));
      } finally {
        await rm(dir, { recursive: true, force: true });
      }
    })();
  }
  return c0048Run;
}


// Dedicated product tests: each ID has its own positive/negative assertions.
const additionalCases = Object.freeze({
  "IFV1-F3-C0051": {
    "table": "fontes_normativas",
    "destination": "V107",
    "file": "src/test/f3-code-case-0051.test.ts",
    "env": "F3_CODE_C0051_OBSERVATIONS"
  },
  "IFV1-F3-C0052": {
    "table": "propostas_orcamentarias",
    "destination": "V108",
    "file": "src/test/f3-code-case-0052.test.ts",
    "env": "F3_CODE_C0052_OBSERVATIONS"
  },
  "IFV1-F3-C0053": {
    "table": "listas_verificacao",
    "destination": "V109",
    "file": "src/test/f3-code-case-0053.test.ts",
    "env": "F3_CODE_C0053_OBSERVATIONS"
  },
  "IFV1-F3-C0056": {
    "table": "competencias",
    "destination": "V112",
    "file": "src/test/f3-code-case-0056.test.ts",
    "env": "F3_CODE_C0056_OBSERVATIONS"
  }
});
const additionalRuns = new Map();
const CONTRACT_EXTRA = "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee";
const ROW_EXTRA = "dddddddd-dddd-4ddd-8ddd-dddddddddddd";

async function runAdditionalCase(c) {
  const config = additionalCases[c.caseId];
  if (!config || c.consumer !== config.table || c.destination !== config.destination || c.producerOrder !== 3) {
    throw Object.assign(new Error("F3_CONSUMER_CASE_NOT_IMPLEMENTED"), {code:"F3_CONSUMER_CASE_NOT_IMPLEMENTED"});
  }
  if (!additionalRuns.has(c.caseId)) {
    additionalRuns.set(c.caseId, (async () => {
      const dir = await mkdtemp(join(tmpdir(), "contaos-f3-extra-"));
      const evidenceFile = join(dir, "observations.json");
      try {
        await exec("bunx", ["vitest","run",config.file,"--reporter=dot"], {
          cwd: ROOT, env: {...process.env, [config.env]:evidenceFile}, timeout:60000, maxBuffer:1024*1024,
        });
        const parsed = JSON.parse(await readFile(evidenceFile,"utf8"));
        if (!Array.isArray(parsed) || parsed.length !== 2 || parsed.some((e,i) =>
          e.caseId !== c.caseId || e.consumer !== c.consumer || e.producerOrder !== 3 ||
          e.kind !== ["positive","negative"][i] || e.testId !== config.file + ":" + e.kind ||
          e.organizationId !== ORG_0041 || e.producerEntityId !== ORG_0041 ||
          e.state !== "EXECUTED" || e.assertion !== "PASS"
        )) throw Object.assign(new Error("F3_EXTRA_BAD_TEST_OUTPUT"), {code:"F3_EXTRA_BAD_TEST_OUTPUT"});
        return Object.freeze(parsed.map(e=>Object.freeze(e)));
      } finally { await rm(dir,{recursive:true,force:true}); }
    })());
  }
  return additionalRuns.get(c.caseId);
}
const additionalConsumers = kind => Object.fromEntries(Object.values(additionalCases).map(config => [
  config.table, async ({case:c}) => structuredClone((await runAdditionalCase(c))[kind === "positive" ? 0 : 1])
]));


const RBAC_SHARED = "consultar_permissoes_efetivas (infraestrutura compartilhada)";
const RBAC_SOURCE = "src/test/f3-code-adm01-rbac-integration.test.ts";
const RBAC_ORG = "a1111111-1111-4111-8111-111111111111";
const RBAC_FOREIGN = "a2222222-2222-4222-8222-222222222222";
const RBAC_LINK = "a4444444-4444-4444-8444-444444444444";
const rbacCases = Object.freeze({
  "IFV1-F3-C0007": {
    "destination": "V101",
    "permission": "contratantes/consultar",
    "reader": true
  },
  "IFV1-F3-C0009": {
    "destination": "V102",
    "permission": "contratantes/criar",
    "reader": false
  },
  "IFV1-F3-C0011": {
    "destination": "V103",
    "permission": "contratantes/editar",
    "reader": false
  },
  "IFV1-F3-C0012": {
    "destination": "V104",
    "permission": "contratos/consultar",
    "reader": true
  },
  "IFV1-F3-C0014": {
    "destination": "V105",
    "permission": "contratos/criar",
    "reader": false
  },
  "IFV1-F3-C0016": {
    "destination": "V106",
    "permission": "contratos/consultar",
    "reader": true
  },
  "IFV1-F3-C0017": {
    "destination": "V107",
    "permission": "normativos/consultar",
    "reader": true
  },
  "IFV1-F3-C0018": {
    "destination": "V108",
    "permission": "orcamentos/consultar",
    "reader": true
  },
  "IFV1-F3-C0019": {
    "destination": "V109",
    "permission": "listas/consultar",
    "reader": true
  },
  "IFV1-F3-C0020": {
    "destination": "V110",
    "permission": "documentos_contrato/consultar",
    "reader": true
  },
  "IFV1-F3-C0021": {
    "destination": "V111",
    "permission": "documentos_contrato/consultar",
    "reader": true
  },
  "IFV1-F3-C0022": {
    "destination": "V112",
    "permission": "competencias/consultar",
    "reader": true
  },
  "IFV1-F3-C0023": {
    "destination": "V113",
    "permission": "competencias/criar",
    "reader": false
  },
  "IFV1-F3-C0024": {
    "destination": "V114",
    "permission": "competencias/consultar",
    "reader": true
  },
  "IFV1-F3-C0025": {
    "destination": "V115",
    "permission": "documentos_competencia/consultar",
    "reader": true
  },
  "IFV1-F3-C0026": {
    "destination": "V116",
    "permission": "analises/consultar",
    "reader": true
  },
  "IFV1-F3-C0027": {
    "destination": "V117",
    "permission": "analises/consultar",
    "reader": true
  },
  "IFV1-F3-C0028": {
    "destination": "V118",
    "permission": "pareceres/consultar",
    "reader": true
  },
  "IFV1-F3-C0029": {
    "destination": "V119",
    "permission": "apresentacoes/consultar",
    "reader": true
  },
  "IFV1-F3-C0030": {
    "destination": "V120",
    "permission": "apresentacoes/consultar",
    "reader": true
  },
  "IFV1-F3-C0031": {
    "destination": "V121",
    "permission": "historico/consultar",
    "reader": true
  },
  "IFV1-F3-C0032": {
    "destination": "V122",
    "permission": "historico/criar",
    "reader": false
  },
  "IFV1-F3-C0034": {
    "destination": "V123",
    "permission": "auditoria/consultar",
    "reader": false
  }
});
let rbacRun;
async function runRbacCases() {
  if (!rbacRun) {
    rbacRun = (async () => {
      const dir = await mkdtemp(join(tmpdir(), "contaos-f3-adm01-rbac-"));
      const evidenceFile = join(dir, "observations.json");
      try {
        await exec("bunx", ["vitest", "run", RBAC_SOURCE, "--reporter=dot"], {
          cwd: ROOT, env: {...process.env, F3_CODE_ADM01_RBAC_OBSERVATIONS: evidenceFile},
          timeout: 60000, maxBuffer: 1024 * 1024,
        });
        const parsed = JSON.parse(await readFile(evidenceFile, "utf8"));
        const indexed = new Map();
        if (!Array.isArray(parsed) || parsed.length !== Object.keys(rbacCases).length * 2)
          throw Object.assign(new Error("F3_RBAC_EVIDENCE_COUNT"), {code:"F3_RBAC_EVIDENCE_COUNT"});
        for (const e of parsed) {
          const key = e.caseId + ":" + e.kind;
          if (!Object.hasOwn(rbacCases,e.caseId) || indexed.has(key) ||
              !["positive","negative"].includes(e.kind) || e.testId !== RBAC_SOURCE + ":" + key ||
              e.consumer !== RBAC_SHARED || e.producerOrder !== 4 ||
              e.organizationId !== RBAC_ORG || e.producerEntityId !== RBAC_LINK ||
              e.state !== "EXECUTED" || e.assertion !== "PASS")
            throw Object.assign(new Error("F3_RBAC_BAD_TEST_OUTPUT"), {code:"F3_RBAC_BAD_TEST_OUTPUT"});
          indexed.set(key,Object.freeze(e));
        }
        return indexed;
      } finally {await rm(dir,{recursive:true,force:true});}
    })();
  }
  return rbacRun;
}
async function rbacEvidence(c,kind) {
  const config=rbacCases[c.caseId];
  if (!config || c.destination !== config.destination || c.consumer !== RBAC_SHARED || c.producerOrder !== 4)
    throw Object.assign(new Error("F3_RBAC_CASE_NOT_IMPLEMENTED"), {code:"F3_RBAC_CASE_NOT_IMPLEMENTED"});
  const value=(await runRbacCases()).get(c.caseId+":"+kind);
  if (!value) throw Object.assign(new Error("F3_RBAC_EVIDENCE_MISSING"), {code:"F3_RBAC_EVIDENCE_MISSING"});
  return structuredClone(value);
}

export const producerDrivers = Object.freeze({
  4: async (c) => {
    const positive = await rbacEvidence(c,"positive");
    return Object.freeze({state:"UI_OBSERVED_NOT_CERTIFIED",organizationId:positive.organizationId,producerEntityId:positive.producerEntityId});
  },
  1: async (c) => {
    if (![CASE_0036, CASE_0037].includes(c.caseId)) {
      throw Object.assign(new Error("F3_DRIVER_CASE_NOT_IMPLEMENTED"), {
        code: "F3_DRIVER_CASE_NOT_IMPLEMENTED",
      });
    }
    await runCase0036();
    return Object.freeze({
      state: "UI_OBSERVED_NOT_CERTIFIED",
      organizationId: ORG_0036,
      producerEntityId: ORG_0036,
    });
  },
  3: async (c) => {
    if (![CASE_0041, CASE_0043, CASE_0045, CASE_0048].includes(c.caseId) && !Object.hasOwn(additionalCases,c.caseId)) {
      throw Object.assign(new Error("F3_DRIVER_CASE_NOT_IMPLEMENTED"), {
        code: "F3_DRIVER_CASE_NOT_IMPLEMENTED",
      });
    }
    await runCase0041();
    return Object.freeze({
      state: "UI_OBSERVED_NOT_CERTIFIED",
      organizationId: ORG_0041,
      producerEntityId: ORG_0041,
    });
  },
});

export const consumerDrivers = Object.freeze({
  ...additionalConsumers("positive"),
  [RBAC_SHARED]: async ({case:c}) => rbacEvidence(c,"positive"),
  [CONSUMER_0036]: async ({ case: c }) => {
    if (c.caseId !== CASE_0036) {
      throw Object.assign(new Error("F3_CONSUMER_CASE_NOT_IMPLEMENTED"), {
        code: "F3_CONSUMER_CASE_NOT_IMPLEMENTED",
      });
    }
    const [positive] = await runCase0036();
    return structuredClone(positive);
  },
  [CONSUMER_0037]: async ({ case: c }) => {
    if (![CASE_0037, CASE_0043].includes(c.caseId)) {
      throw Object.assign(new Error("F3_CONSUMER_CASE_NOT_IMPLEMENTED"), {
        code: "F3_CONSUMER_CASE_NOT_IMPLEMENTED",
      });
    }
    const [positive] = c.caseId === CASE_0043 ? await runCase0043() : await runCase0037();
    return structuredClone(positive);
  },
  [CONSUMER_0041]: async ({ case: c }) => {
    if (c.caseId !== CASE_0041) {
      throw Object.assign(new Error("F3_CONSUMER_CASE_NOT_IMPLEMENTED"), {
        code: "F3_CONSUMER_CASE_NOT_IMPLEMENTED",
      });
    }
    const [positive] = await runCase0041();
    return structuredClone(positive);
  },
  [CONSUMER_0045]: async ({ case: c }) => {
    if (c.caseId !== CASE_0045) {
      throw Object.assign(new Error("F3_CONSUMER_CASE_NOT_IMPLEMENTED"), {
        code: "F3_CONSUMER_CASE_NOT_IMPLEMENTED",
      });
    }
    const [positive] = await runCase0045();
    return structuredClone(positive);
  },
  [CONSUMER_0048]: async ({ case: c }) => {
    if (c.caseId !== CASE_0048) {
      throw Object.assign(new Error("F3_CONSUMER_CASE_NOT_IMPLEMENTED"), {
        code: "F3_CONSUMER_CASE_NOT_IMPLEMENTED",
      });
    }
    const [positive] = await runCase0048();
    return structuredClone(positive);
  },
});

export const negativeDrivers = Object.freeze({
  ...additionalConsumers("negative"),
  [RBAC_SHARED]: async ({case:c}) => rbacEvidence(c,"negative"),
  [CONSUMER_0036]: async ({ case: c }) => {
    if (c.caseId !== CASE_0036) {
      throw Object.assign(new Error("F3_NEGATIVE_CASE_NOT_IMPLEMENTED"), {
        code: "F3_NEGATIVE_CASE_NOT_IMPLEMENTED",
      });
    }
    const [, negative] = await runCase0036();
    return structuredClone(negative);
  },
  [CONSUMER_0037]: async ({ case: c }) => {
    if (![CASE_0037, CASE_0043].includes(c.caseId)) {
      throw Object.assign(new Error("F3_NEGATIVE_CASE_NOT_IMPLEMENTED"), {
        code: "F3_NEGATIVE_CASE_NOT_IMPLEMENTED",
      });
    }
    const [, negative] = c.caseId === CASE_0043 ? await runCase0043() : await runCase0037();
    return structuredClone(negative);
  },
  [CONSUMER_0041]: async ({ case: c }) => {
    if (c.caseId !== CASE_0041) {
      throw Object.assign(new Error("F3_NEGATIVE_CASE_NOT_IMPLEMENTED"), {
        code: "F3_NEGATIVE_CASE_NOT_IMPLEMENTED",
      });
    }
    const [, negative] = await runCase0041();
    return structuredClone(negative);
  },
  [CONSUMER_0045]: async ({ case: c }) => {
    if (c.caseId !== CASE_0045) {
      throw Object.assign(new Error("F3_NEGATIVE_CASE_NOT_IMPLEMENTED"), {
        code: "F3_NEGATIVE_CASE_NOT_IMPLEMENTED",
      });
    }
    const [, negative] = await runCase0045();
    return structuredClone(negative);
  },
  [CONSUMER_0048]: async ({ case: c }) => {
    if (c.caseId !== CASE_0048) {
      throw Object.assign(new Error("F3_NEGATIVE_CASE_NOT_IMPLEMENTED"), {
        code: "F3_NEGATIVE_CASE_NOT_IMPLEMENTED",
      });
    }
    const [, negative] = await runCase0048();
    return structuredClone(negative);
  },
});

/** Contraditório estrutural interno. Não constitui auditoria independente final. */
export async function independentVerifier(c, observed) {
  if (Object.hasOwn(rbacCases,c.caseId)) {
    const config=rbacCases[c.caseId];
    const {producer,positive,negative}=observed;
    return c.origin==="ADM01" && c.destination===config.destination &&
      c.consumer===RBAC_SHARED && c.expected?.master==="ALLOW" &&
      c.expected?.leitor===(config.reader?"ALLOW":"DENY") &&
      producer?.organizationId===RBAC_ORG && producer.producerEntityId===RBAC_LINK &&
      positive.testId===RBAC_SOURCE+":"+c.caseId+":positive" &&
      negative.testId===RBAC_SOURCE+":"+c.caseId+":negative" &&
      positive.network?.rpc==="consultar_permissoes_efetivas" &&
      negative.network?.rpc==="consultar_permissoes_efetivas" &&
      positive.network?.fixture===true && negative.network?.fixture===true &&
      positive.network?.status===200 && negative.network?.status===403 &&
      positive.readback?.screen===config.destination && negative.readback?.screen===config.destination &&
      positive.readback?.permission===config.permission && negative.readback?.permission===config.permission &&
      positive.readback?.masterAllowed===true && positive.readback?.readerAllowed===config.reader &&
      positive.readback?.bindingId===RBAC_LINK && negative.readback?.bindingId===RBAC_LINK &&
      positive.readback?.version===6 && negative.readback?.outcome==="DENY" &&
      negative.readback?.foreignOrganization===RBAC_FOREIGN;
  }
  if (Object.hasOwn(additionalCases,c.caseId)) {
    const config = additionalCases[c.caseId];
    const {producer, positive, negative} = observed;
    return c.origin === "SYS04" && c.destination === config.destination &&
      c.consumer === config.table && c.expected?.master === "ALLOW" &&
      c.expected?.leitor === "ALLOW" && producer?.organizationId === ORG_0041 &&
      producer.producerEntityId === ORG_0041 &&
      positive.testId === config.file + ":positive" &&
      negative.testId === config.file + ":negative" &&
      positive.network?.table === config.table && negative.network?.table === config.table &&
      positive.network?.fixture === true && negative.network?.fixture === true &&
      positive.network?.status === 200 && negative.network?.status === 403 &&
      positive.readback?.contractId === CONTRACT_EXTRA &&
      negative.readback?.contractId === CONTRACT_EXTRA &&
      positive.readback?.rowId === ROW_EXTRA &&
      positive.readback?.authorizedLocalIdentities === 2 &&
      negative.readback?.outcome === "DENY" &&
      negative.readback?.preferenceNotAuthorization === true;
  }
  if (c.caseId === CASE_0048) {
    const { producer, positive, negative } = observed;
    return (
      c.origin === "SYS04" &&
      c.destination === "V104" &&
      c.consumer === CONSUMER_0048 &&
      c.expected?.master === "ALLOW" &&
      c.expected?.leitor === "ALLOW" &&
      producer?.producerEntityId === ORG_0041 &&
      producer.organizationId === ORG_0041 &&
      positive.testId === "src/test/f3-code-case-0048.test.ts:positive" &&
      negative.testId === "src/test/f3-code-case-0048.test.ts:negative" &&
      positive.network?.table === CONSUMER_0048 &&
      negative.network?.table === CONSUMER_0048 &&
      positive.network?.fixture === true &&
      negative.network?.fixture === true &&
      positive.readback?.filteredOrganization === ORG_0041 &&
      positive.readback?.contractCount === 1 &&
      negative.network?.status === 403 &&
      negative.readback?.outcome === "DENY" &&
      negative.readback?.preferenceNotAuthorization === true
    );
  }
  if (c.caseId === CASE_0045) {
    const { producer, positive, negative } = observed;
    return (
      c.origin === "SYS04" &&
      c.destination === "V101" &&
      c.consumer === CONSUMER_0045 &&
      c.expected?.master === "ALLOW" &&
      c.expected?.leitor === "ALLOW" &&
      producer?.producerEntityId === ORG_0041 &&
      producer.organizationId === ORG_0041 &&
      positive.testId === "src/test/f3-code-case-0045.test.ts:positive" &&
      negative.testId === "src/test/f3-code-case-0045.test.ts:negative" &&
      positive.network?.table === CONSUMER_0045 &&
      negative.network?.table === CONSUMER_0045 &&
      positive.network?.fixture === true &&
      negative.network?.fixture === true &&
      positive.readback?.isolatedOrgId === ORG_0041 &&
      positive.readback?.count === 1 &&
      negative.network?.status === 403 &&
      negative.readback?.outcome === "DENY" &&
      negative.readback?.noForeignRows === true
    );
  }
  if (c.caseId === CASE_0043) {
    const { producer, positive, negative } = observed;
    return (
      c.origin === "SYS04" &&
      c.destination === "SYS05" &&
      c.consumer === CONSUMER_0037 &&
      c.expected?.master === "ALLOW" &&
      c.expected?.leitor === "ALLOW" &&
      producer?.producerEntityId === ORG_0041 &&
      producer.organizationId === ORG_0041 &&
      positive.testId === "src/test/f3-code-case-0043.test.tsx:positive" &&
      negative.testId === "src/test/f3-code-case-0043.test.tsx:negative" &&
      positive.network?.rpc === CONSUMER_0037 &&
      negative.network?.rpc === CONSUMER_0037 &&
      positive.network?.fixture === true &&
      negative.network?.fixture === true &&
      positive.readback?.organizationId === ORG_0041 &&
      positive.readback?.preferenceMatched === true &&
      positive.readback?.contractsVisible === 3 &&
      negative.network?.status === 403 &&
      negative.readback?.outcome === "DENY" &&
      negative.readback?.preferenceNotAuthorization === true &&
      negative.readback?.noPrivateData === true
    );
  }
  if (c.caseId === CASE_0041) {
    const { producer, positive, negative } = observed;
    return (
      c.origin === "SYS04" &&
      c.destination === "ADM01" &&
      c.consumer === CONSUMER_0041 &&
      c.expected?.master === "ALLOW" &&
      c.expected?.leitor === "DENY" &&
      producer?.producerEntityId === ORG_0041 &&
      producer.organizationId === ORG_0041 &&
      positive.testId === "src/test/f3-code-case-0041.test.ts:positive" &&
      negative.testId === "src/test/f3-code-case-0041.test.ts:negative" &&
      positive.network?.rpc === CONSUMER_0041 &&
      negative.network?.rpc === CONSUMER_0041 &&
      positive.network?.fixture === true &&
      negative.network?.fixture === true &&
      positive.readback?.role === "administrador_master" &&
      positive.readback?.effectivePermission === "usuarios/administrar" &&
      negative.network?.status === 403 &&
      negative.readback?.outcome === "DENY" &&
      negative.readback?.preferenceNotAuthorization === true
    );
  }
  if (c.caseId === CASE_0037) {
    const { producer, positive, negative } = observed;
    return (
      c.origin === "SYS01" &&
      c.destination === "SYS05" &&
      c.consumer === CONSUMER_0037 &&
      c.expected?.master === "ALLOW" &&
      c.expected?.leitor === "ALLOW" &&
      producer?.producerEntityId === ORG_0036 &&
      producer.organizationId === ORG_0036 &&
      positive.testId === "src/test/f3-code-case-0037.test.tsx:positive" &&
      negative.testId === "src/test/f3-code-case-0037.test.tsx:negative" &&
      positive.network?.rpc === CONSUMER_0037 &&
      negative.network?.rpc === CONSUMER_0037 &&
      positive.network?.fixture === true &&
      negative.network?.fixture === true &&
      positive.readback?.organizationId === ORG_0036 &&
      positive.readback?.contractsVisible === 3 &&
      negative.network?.status === 403 &&
      negative.readback?.outcome === "DENY" &&
      negative.readback?.noPrivateData === true
    );
  }
  if (
    c.caseId !== CASE_0036 ||
    c.origin !== "SYS01" ||
    c.destination !== "SYS04" ||
    c.consumer !== CONSUMER_0036 ||
    c.expected?.master !== "ALLOW" ||
    c.expected?.leitor !== "ALLOW"
  ) {
    return false;
  }
  const { producer, positive, negative } = observed;
  return (
    producer?.state === "UI_OBSERVED_NOT_CERTIFIED" &&
    producer.organizationId === ORG_0036 &&
    producer.producerEntityId === ORG_0036 &&
    positive.testId === "src/test/f3-code-case-0036.test.ts:positive" &&
    negative.testId === "src/test/f3-code-case-0036.test.ts:negative" &&
    positive.network?.rpc === CONSUMER_0036 &&
    negative.network?.rpc === CONSUMER_0036 &&
    positive.network?.fixture === true &&
    negative.network?.fixture === true &&
    positive.readback?.route === "/" &&
    positive.readback?.linkedOrgId === ORG_0036 &&
    positive.readback?.foreignOrgExcluded === true &&
    negative.readback?.outcome === "NO_FOREIGN_DATA" &&
    negative.readback?.route === "sem-acesso"
  );
}
