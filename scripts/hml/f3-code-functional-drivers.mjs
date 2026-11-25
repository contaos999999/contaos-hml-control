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
  },
  "IFV1-F3-C0054": {
    "table": "documentos_contrato",
    "destination": "V110",
    "file": "src/test/f3-code-case-0054.test.ts",
    "env": "F3_CODE_C0054_OBSERVATIONS"
  },
  "IFV1-F3-C0062": {
    "table": "pareceres_internos",
    "destination": "V118",
    "file": "src/test/f3-code-case-0062.test.ts",
    "env": "F3_CODE_C0062_OBSERVATIONS"
  },
  "IFV1-F3-C0064": {
    "table": "apresentacoes_contratante",
    "destination": "V120",
    "file": "src/test/f3-code-case-0064.test.ts",
    "env": "F3_CODE_C0064_OBSERVATIONS"
  },
  "IFV1-F3-C0065": {
    "table": "relatorios_historicos_contratante",
    "destination": "V121",
    "file": "src/test/f3-code-case-0065.test.ts",
    "env": "F3_CODE_C0065_OBSERVATIONS"
  },
  "IFV1-F3-C0050": {
    "table": "contratos",
    "destination": "V106",
    "file": "src/test/f3-code-case-0050.test.ts",
    "env": "F3_CODE_C0050_OBSERVATIONS"
  },
  "IFV1-F3-C0055": {
    "table": "documentos_contrato",
    "destination": "V111",
    "file": "src/test/f3-code-case-0055.test.ts",
    "env": "F3_CODE_C0055_OBSERVATIONS"
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
  },
  "IFV1-F3-C0002": {
    "destination": "SYS04",
    "consumer": "listar_organizacoes_disponiveis",
    "reader": true
  },
  "IFV1-F3-C0033": {
    "destination": "V123",
    "consumer": "eventos_auditoria",
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
              e.consumer !== (rbacCases[e.caseId].consumer ?? RBAC_SHARED) || e.producerOrder !== 4 ||
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
  if (!config || c.destination !== config.destination || c.consumer !== (config.consumer ?? RBAC_SHARED) || c.producerOrder !== 4)
    throw Object.assign(new Error("F3_RBAC_CASE_NOT_IMPLEMENTED"), {code:"F3_RBAC_CASE_NOT_IMPLEMENTED"});
  const value=(await runRbacCases()).get(c.caseId+":"+kind);
  if (!value) throw Object.assign(new Error("F3_RBAC_EVIDENCE_MISSING"), {code:"F3_RBAC_EVIDENCE_MISSING"});
  return structuredClone(value);
}


const COMP_RPC_SOURCE="src/test/f3-code-sys04-competence-rpc.test.ts";
const COMP_RPC_ID="a9999999-9999-4999-8999-999999999999";
const competenceRpcCases=Object.freeze({
  "IFV1-F3-C0058": {
    "destination": "V114",
    "rpc": "obter_visao_geral_competencia"
  },
  "IFV1-F3-C0059": {
    "destination": "V115",
    "rpc": "obter_documentos_competencia_v115"
  },
  "IFV1-F3-C0060": {
    "destination": "V116",
    "rpc": "obter_analise_competencia_v116"
  },
  "IFV1-F3-C0061": {
    "destination": "V117",
    "rpc": "obter_detalhe_requisito_v117"
  },
  "IFV1-F3-C0063": {
    "destination": "V119",
    "rpc": "obter_visao_geral_competencia"
  }
});
let competenceRpcRun;
async function competenceRpcEvidence(c,kind){
  const config=competenceRpcCases[c.caseId];
  if(!config || c.producerOrder!==3 || c.destination!==config.destination || c.consumer!==config.rpc)
    throw Object.assign(new Error("F3_COMP_RPC_CASE_NOT_IMPLEMENTED"),{code:"F3_COMP_RPC_CASE_NOT_IMPLEMENTED"});
  if(!competenceRpcRun){
    competenceRpcRun=(async()=>{
      const dir=await mkdtemp(join(tmpdir(),"contaos-f3-comp-rpc-"));
      const evidenceFile=join(dir,"observations.json");
      try{
        await exec("bunx",["vitest","run",COMP_RPC_SOURCE,"--reporter=dot"],{cwd:ROOT,env:{...process.env,F3_CODE_SYS04_COMPETENCE_RPC_OBSERVATIONS:evidenceFile},timeout:60000,maxBuffer:1024*1024});
        const parsed=JSON.parse(await readFile(evidenceFile,"utf8"));
        const map=new Map();
        if(!Array.isArray(parsed)||parsed.length!==Object.keys(competenceRpcCases).length*2)
          throw Object.assign(new Error("F3_COMP_RPC_COUNT"),{code:"F3_COMP_RPC_COUNT"});
        for(const e of parsed){
          const spec=competenceRpcCases[e.caseId],key=e.caseId+":"+e.kind;
          if(!spec||map.has(key)||!["positive","negative"].includes(e.kind)||e.testId!==COMP_RPC_SOURCE+":"+key||e.consumer!==spec.rpc||
          e.producerOrder!==3||e.organizationId!==ORG_0041||e.producerEntityId!==ORG_0041||e.state!=="EXECUTED"||e.assertion!=="PASS")
            throw Object.assign(new Error("F3_COMP_RPC_OUTPUT"),{code:"F3_COMP_RPC_OUTPUT"});
          map.set(key,Object.freeze(e));
        }
        return map;
      }finally{await rm(dir,{recursive:true,force:true});}
    })();
  }
  const value=(await competenceRpcRun).get(c.caseId+":"+kind);
  if(!value)throw Object.assign(new Error("F3_COMP_RPC_MISSING"),{code:"F3_COMP_RPC_MISSING"});
  return structuredClone(value);
}
const competenceRpcConsumers=kind=>Object.fromEntries(Object.values(competenceRpcCases).map(spec=>[spec.rpc,async({case:c})=>competenceRpcEvidence(c,kind)]));


const V113_SOURCE="src/test/f3-code-v113-created-competence.test.tsx";
const V113_ORG="c1400000-0000-4000-8000-000000000001";
const V113_CONTRACT="c1400000-0000-4000-8000-000000000002";
const V113_ID="c1400000-0000-4000-8000-000000000003";
const v113Cases=Object.freeze({
  "IFV1-F3-C0352": {
    "caseId": "IFV1-F3-C0352",
    "destination": "SYS05",
    "consumer": "obter_resumo_dashboard",
    "method": "POST",
    "reader": true
  },
  "IFV1-F3-C0365": {
    "caseId": "IFV1-F3-C0365",
    "destination": "V112",
    "consumer": "competencias",
    "method": "GET",
    "reader": true
  },
  "IFV1-F3-C0368": {
    "caseId": "IFV1-F3-C0368",
    "destination": "V114",
    "consumer": "obter_visao_geral_competencia",
    "method": "POST",
    "reader": true
  },
  "IFV1-F3-C0369": {
    "caseId": "IFV1-F3-C0369",
    "destination": "V115",
    "consumer": "obter_documentos_competencia_v115",
    "method": "POST",
    "reader": true
  },
  "IFV1-F3-C0370": {
    "caseId": "IFV1-F3-C0370",
    "destination": "V116",
    "consumer": "obter_analise_competencia_v116",
    "method": "POST",
    "reader": true
  },
  "IFV1-F3-C0371": {
    "caseId": "IFV1-F3-C0371",
    "destination": "V118",
    "consumer": "pareceres_internos",
    "method": "GET",
    "reader": true
  },
  "IFV1-F3-C0372": {
    "caseId": "IFV1-F3-C0372",
    "destination": "V119",
    "consumer": "obter_visao_geral_competencia",
    "method": "POST",
    "reader": true
  },
  "IFV1-F3-C0373": {
    "caseId": "IFV1-F3-C0373",
    "destination": "V120",
    "consumer": "apresentacoes_contratante",
    "method": "GET",
    "reader": true
  },
  "IFV1-F3-C0376": {
    "caseId": "IFV1-F3-C0376",
    "destination": "V123",
    "consumer": "eventos_auditoria",
    "method": "GET",
    "reader": false
  }
});
let v113Run;
async function runV113(){
  if(!v113Run)v113Run=(async()=>{
    const dir=await mkdtemp(join(tmpdir(),"contaos-f3-v113-"));
    const file=join(dir,"observations.json");
    try {
      await exec("bunx",["vitest","run",V113_SOURCE,"--reporter=dot"],{cwd:ROOT,env:{...process.env,F3_CODE_V113_OBSERVATIONS:file},timeout:60000,maxBuffer:1024*1024});
      const parsed=JSON.parse(await readFile(file,"utf8"));
      const map=new Map();
      if(!Array.isArray(parsed)||parsed.length!==Object.keys(v113Cases).length*2)throw Object.assign(new Error("F3_V113_COUNT"),{code:"F3_V113_COUNT"});
      for(const e of parsed){
        const c=v113Cases[e.caseId],key=e.caseId+":"+e.kind;
        if(!c||map.has(key)||!["positive","negative"].includes(e.kind)||e.testId!==V113_SOURCE+":"+key||e.consumer!==c.consumer||e.producerOrder!==14||e.organizationId!==V113_ORG||e.producerEntityId!==V113_ID||e.state!=="EXECUTED"||e.assertion!=="PASS")throw Object.assign(new Error("F3_V113_OUTPUT"),{code:"F3_V113_OUTPUT"});
        map.set(key,Object.freeze(e));
      }
      return map;
    }finally{await rm(dir,{recursive:true,force:true});}
  })();
  return v113Run;
}
async function v113Evidence(c,kind){
  const spec=v113Cases[c.caseId];
  if(!spec||c.producerOrder!==14||c.destination!==spec.destination||c.consumer!==spec.consumer)throw Object.assign(new Error("F3_V113_CASE_NOT_IMPLEMENTED"),{code:"F3_V113_CASE_NOT_IMPLEMENTED"});
  const e=(await runV113()).get(c.caseId+":"+kind);
  if(!e)throw Object.assign(new Error("F3_V113_MISSING"),{code:"F3_V113_MISSING"});
  return structuredClone(e);
}
function dispatchV113(base,kind){
  const all=new Set([...Object.keys(base),...Object.values(v113Cases).map(c=>c.consumer)]);
  return Object.freeze(Object.fromEntries([...all].map(consumer=>[consumer,async args=>{
    if(Object.hasOwn(v113Cases,args.case.caseId))return v113Evidence(args.case,kind);
    if(typeof base[consumer]!=="function")throw Object.assign(new Error("F3_CONSUMER_CASE_NOT_IMPLEMENTED"),{code:"F3_CONSUMER_CASE_NOT_IMPLEMENTED"});
    return base[consumer](args);
  }])));
}


const MATERIAL_SOURCE="src/test/f3-code-v118-v119-material-actions.test.ts";
const MATERIAL_ORG="c1800000-0000-4000-8000-000000000001";
const MATERIAL_CONTRACT="c1800000-0000-4000-8000-000000000002";
const MATERIAL_COMP="c1800000-0000-4000-8000-000000000003";
const materialId=order=>order===18?"c1800000-0000-4000-8000-000000000004":"c1800000-0000-4000-8000-000000000005";
const materialCases=Object.freeze({
  "IFV1-F3-C0477": {
    "caseId": "IFV1-F3-C0477",
    "order": 18,
    "destination": "V114",
    "consumer": "obter_visao_geral_competencia",
    "method": "POST",
    "reader": true
  },
  "IFV1-F3-C0482": {
    "caseId": "IFV1-F3-C0482",
    "order": 18,
    "destination": "V119",
    "consumer": "obter_visao_geral_competencia",
    "method": "POST",
    "reader": true
  },
  "IFV1-F3-C0484": {
    "caseId": "IFV1-F3-C0484",
    "order": 18,
    "destination": "V123",
    "consumer": "eventos_auditoria",
    "method": "GET",
    "reader": false
  },
  "IFV1-F3-C0496": {
    "caseId": "IFV1-F3-C0496",
    "order": 19,
    "destination": "V114",
    "consumer": "obter_visao_geral_competencia",
    "method": "POST",
    "reader": true
  },
  "IFV1-F3-C0502": {
    "caseId": "IFV1-F3-C0502",
    "order": 19,
    "destination": "V120",
    "consumer": "apresentacoes_contratante",
    "method": "GET",
    "reader": true
  },
  "IFV1-F3-C0504": {
    "caseId": "IFV1-F3-C0504",
    "order": 19,
    "destination": "V123",
    "consumer": "eventos_auditoria",
    "method": "GET",
    "reader": false
  }
});
let materialRun;
async function runMaterial(){
  if(!materialRun)materialRun=(async()=>{
    const dir=await mkdtemp(join(tmpdir(),"contaos-f3-material-"));
    const file=join(dir,"observations.json");
    try{
      await exec("bunx",["vitest","run",MATERIAL_SOURCE,"--reporter=dot"],{cwd:ROOT,env:{...process.env,F3_CODE_MATERIAL_OBSERVATIONS:file},timeout:60000,maxBuffer:1024*1024});
      const parsed=JSON.parse(await readFile(file,"utf8")),map=new Map();
      if(!Array.isArray(parsed)||parsed.length!==Object.keys(materialCases).length*2)throw Object.assign(new Error("F3_MATERIAL_COUNT"),{code:"F3_MATERIAL_COUNT"});
      for(const e of parsed){
        const c=materialCases[e.caseId],key=e.caseId+":"+e.kind;
        if(!c||map.has(key)||!["positive","negative"].includes(e.kind)||e.testId!==MATERIAL_SOURCE+":"+key||e.consumer!==c.consumer||e.producerOrder!==c.order||e.organizationId!==MATERIAL_ORG||e.producerEntityId!==materialId(c.order)||e.state!=="EXECUTED"||e.assertion!=="PASS")throw Object.assign(new Error("F3_MATERIAL_OUTPUT"),{code:"F3_MATERIAL_OUTPUT"});
        map.set(key,Object.freeze(e));
      }return map;
    }finally{await rm(dir,{recursive:true,force:true});}
  })();
  return materialRun;
}
async function materialEvidence(c,kind){
  const spec=materialCases[c.caseId];
  if(!spec||c.producerOrder!==spec.order||c.consumer!==spec.consumer||c.destination!==spec.destination)throw Object.assign(new Error("F3_MATERIAL_CASE_NOT_IMPLEMENTED"),{code:"F3_MATERIAL_CASE_NOT_IMPLEMENTED"});
  const e=(await runMaterial()).get(c.caseId+":"+kind);
  if(!e)throw Object.assign(new Error("F3_MATERIAL_MISSING"),{code:"F3_MATERIAL_MISSING"});
  return structuredClone(e);
}
function dispatchMaterial(base,kind){
  const all=new Set([...Object.keys(base),...Object.values(materialCases).map(c=>c.consumer)]);
  return Object.freeze(Object.fromEntries([...all].map(consumer=>[consumer,async args=>{
    if(Object.hasOwn(materialCases,args.case.caseId))return materialEvidence(args.case,kind);
    if(typeof base[consumer]!=="function")throw Object.assign(new Error("F3_CONSUMER_CASE_NOT_IMPLEMENTED"),{code:"F3_CONSUMER_CASE_NOT_IMPLEMENTED"});
    return base[consumer](args);
  }])));
}
async function materialProducer(order){
  const c=Object.values(materialCases).find(x=>x.order===order);
  const e=(await runMaterial()).get(c.caseId+":positive");
  if(!e)throw Object.assign(new Error("F3_MATERIAL_PRODUCER_MISSING"),{code:"F3_MATERIAL_PRODUCER_MISSING"});
  return Object.freeze({state:"UI_OBSERVED_NOT_CERTIFIED",organizationId:e.organizationId,producerEntityId:e.producerEntityId});
}


const PARTY_SOURCE="src/test/f3-code-v102-v103-contracting-party.test.ts";
const PARTY_ORG="c0500000-0000-4000-8000-000000000001";
const PARTY_ID="c0500000-0000-4000-8000-000000000002";
const partyCases=Object.freeze({
  "IFV1-F3-C0093": {
    "caseId": "IFV1-F3-C0093",
    "order": 5,
    "destination": "V101",
    "consumer": "contratantes",
    "reader": true
  },
  "IFV1-F3-C0096": {
    "caseId": "IFV1-F3-C0096",
    "order": 5,
    "destination": "V103",
    "consumer": "contratantes",
    "reader": false
  },
  "IFV1-F3-C0098": {
    "caseId": "IFV1-F3-C0098",
    "order": 5,
    "destination": "V105",
    "consumer": "contratantes",
    "reader": false
  },
  "IFV1-F3-C0100": {
    "caseId": "IFV1-F3-C0100",
    "order": 5,
    "destination": "V123",
    "consumer": "eventos_auditoria",
    "reader": false
  },
  "IFV1-F3-C0107": {
    "caseId": "IFV1-F3-C0107",
    "order": 6,
    "destination": "V101",
    "consumer": "contratantes",
    "reader": true
  },
  "IFV1-F3-C0111": {
    "caseId": "IFV1-F3-C0111",
    "order": 6,
    "destination": "V104",
    "consumer": "contratos",
    "reader": true
  },
  "IFV1-F3-C0113": {
    "caseId": "IFV1-F3-C0113",
    "order": 6,
    "destination": "V105",
    "consumer": "contratantes",
    "reader": false
  },
  "IFV1-F3-C0115": {
    "caseId": "IFV1-F3-C0115",
    "order": 6,
    "destination": "V106",
    "consumer": "contratantes",
    "reader": true
  },
  "IFV1-F3-C0116": {
    "caseId": "IFV1-F3-C0116",
    "order": 6,
    "destination": "V123",
    "consumer": "eventos_auditoria",
    "reader": false
  }
});
let partyRun;
async function runParty(){
  if(!partyRun)partyRun=(async()=>{
    const dir=await mkdtemp(join(tmpdir(),"contaos-f3-party-")),file=join(dir,"observations.json");
    try{
      await exec("bunx",["vitest","run",PARTY_SOURCE,"--reporter=dot"],{cwd:ROOT,env:{...process.env,F3_CODE_PARTY_OBSERVATIONS:file},timeout:60000,maxBuffer:1024*1024});
      const parsed=JSON.parse(await readFile(file,"utf8")),map=new Map();
      if(!Array.isArray(parsed)||parsed.length!==Object.keys(partyCases).length*2)throw Object.assign(new Error("F3_PARTY_COUNT"),{code:"F3_PARTY_COUNT"});
      for(const e of parsed){
        const c=partyCases[e.caseId],key=e.caseId+":"+e.kind;
        if(!c||map.has(key)||!["positive","negative"].includes(e.kind)||e.testId!==PARTY_SOURCE+":"+key||e.consumer!==c.consumer||e.producerOrder!==c.order||e.organizationId!==PARTY_ORG||e.producerEntityId!==PARTY_ID||e.state!=="EXECUTED"||e.assertion!=="PASS")throw Object.assign(new Error("F3_PARTY_OUTPUT"),{code:"F3_PARTY_OUTPUT"});
        map.set(key,Object.freeze(e));
      }return map;
    }finally{await rm(dir,{recursive:true,force:true});}
  })();return partyRun;
}
async function partyEvidence(c,kind){
  const spec=partyCases[c.caseId];
  if(!spec||c.producerOrder!==spec.order||c.destination!==spec.destination||c.consumer!==spec.consumer)throw Object.assign(new Error("F3_PARTY_CASE_NOT_IMPLEMENTED"),{code:"F3_PARTY_CASE_NOT_IMPLEMENTED"});
  const e=(await runParty()).get(c.caseId+":"+kind);if(!e)throw Object.assign(new Error("F3_PARTY_MISSING"),{code:"F3_PARTY_MISSING"});return structuredClone(e);
}
function dispatchParty(base,kind){
  const all=new Set([...Object.keys(base),...Object.values(partyCases).map(c=>c.consumer)]);
  return Object.freeze(Object.fromEntries([...all].map(consumer=>[consumer,async args=>{
    if(Object.hasOwn(partyCases,args.case.caseId))return partyEvidence(args.case,kind);
    if(typeof base[consumer]!=="function")throw Object.assign(new Error("F3_CONSUMER_CASE_NOT_IMPLEMENTED"),{code:"F3_CONSUMER_CASE_NOT_IMPLEMENTED"});
    return base[consumer](args);
  }])));
}
async function partyProducer(order){
  const c=Object.values(partyCases).find(x=>x.order===order),e=(await runParty()).get(c.caseId+":positive");
  if(!e)throw Object.assign(new Error("F3_PARTY_PRODUCER_MISSING"),{code:"F3_PARTY_PRODUCER_MISSING"});
  return Object.freeze({state:"UI_OBSERVED_NOT_CERTIFIED",organizationId:e.organizationId,producerEntityId:e.producerEntityId});
}


const CONTRACT_SOURCE="src/test/f3-code-v105-v106-contract-actions.test.tsx";
const CONTRACT_ORG="c0700000-0000-4000-8000-000000000001";
const CONTRACT_ID="c0700000-0000-4000-8000-000000000002";
const CONTRACT_PARTY="c0700000-0000-4000-8000-000000000003";
const contractCases=Object.freeze({
  "IFV1-F3-C0132": {
    "caseId": "IFV1-F3-C0132",
    "order": 7,
    "destination": "SYS05",
    "consumer": "obter_resumo_dashboard",
    "method": "POST",
    "resource": null,
    "action": null,
    "route": null,
    "reader": true
  },
  "IFV1-F3-C0136": {
    "caseId": "IFV1-F3-C0136",
    "order": 7,
    "destination": "V104",
    "consumer": "contratos",
    "method": "GET",
    "resource": null,
    "action": null,
    "route": null,
    "reader": true
  },
  "IFV1-F3-C0139": {
    "caseId": "IFV1-F3-C0139",
    "order": 7,
    "destination": "V106",
    "consumer": "contratos",
    "method": "GET",
    "resource": null,
    "action": null,
    "route": null,
    "reader": true
  },
  "IFV1-F3-C0140": {
    "caseId": "IFV1-F3-C0140",
    "order": 7,
    "destination": "V123",
    "consumer": "eventos_auditoria",
    "method": "GET",
    "resource": null,
    "action": null,
    "route": null,
    "reader": false
  },
  "IFV1-F3-C0146": {
    "caseId": "IFV1-F3-C0146",
    "order": 8,
    "destination": "SYS05",
    "consumer": "obter_resumo_dashboard",
    "method": "POST",
    "resource": null,
    "action": null,
    "route": null,
    "reader": true
  },
  "IFV1-F3-C0153": {
    "caseId": "IFV1-F3-C0153",
    "order": 8,
    "destination": "V107",
    "consumer": "contratos",
    "method": "GET",
    "resource": "normativos",
    "action": "consultar",
    "route": "base-normativa",
    "reader": true
  },
  "IFV1-F3-C0156": {
    "caseId": "IFV1-F3-C0156",
    "order": 8,
    "destination": "V108",
    "consumer": "contratos",
    "method": "GET",
    "resource": "orcamentos",
    "action": "consultar",
    "route": "orcamento",
    "reader": true
  },
  "IFV1-F3-C0159": {
    "caseId": "IFV1-F3-C0159",
    "order": 8,
    "destination": "V109",
    "consumer": "contratos",
    "method": "GET",
    "resource": "listas",
    "action": "consultar",
    "route": "regras",
    "reader": true
  },
  "IFV1-F3-C0162": {
    "caseId": "IFV1-F3-C0162",
    "order": 8,
    "destination": "V110",
    "consumer": "contratos",
    "method": "GET",
    "resource": "documentos_contrato",
    "action": "consultar",
    "route": "documentos",
    "reader": true
  },
  "IFV1-F3-C0165": {
    "caseId": "IFV1-F3-C0165",
    "order": 8,
    "destination": "V111",
    "consumer": "contratos",
    "method": "GET",
    "resource": "documentos_contrato",
    "action": "consultar",
    "route": "documentos",
    "reader": true
  },
  "IFV1-F3-C0167": {
    "caseId": "IFV1-F3-C0167",
    "order": 8,
    "destination": "V112",
    "consumer": "contratos",
    "method": "GET",
    "resource": "competencias",
    "action": "consultar",
    "route": "competencias",
    "reader": true
  },
  "IFV1-F3-C0170": {
    "caseId": "IFV1-F3-C0170",
    "order": 8,
    "destination": "V113",
    "consumer": "contratos",
    "method": "GET",
    "resource": "competencias",
    "action": "criar",
    "route": "competencias/nova",
    "reader": false
  },
  "IFV1-F3-C0172": {
    "caseId": "IFV1-F3-C0172",
    "order": 8,
    "destination": "V121",
    "consumer": "contratos",
    "method": "GET",
    "resource": "historico",
    "action": "consultar",
    "route": "historico",
    "reader": true
  },
  "IFV1-F3-C0174": {
    "caseId": "IFV1-F3-C0174",
    "order": 8,
    "destination": "V122",
    "consumer": "contratos",
    "method": "GET",
    "resource": "historico",
    "action": "criar",
    "route": "historico/importar",
    "reader": false
  },
  "IFV1-F3-C0176": {
    "caseId": "IFV1-F3-C0176",
    "order": 8,
    "destination": "V123",
    "consumer": "eventos_auditoria",
    "method": "GET",
    "resource": null,
    "action": null,
    "route": null,
    "reader": false
  }
});
let contractRun;
async function runContract(){
  if(!contractRun)contractRun=(async()=>{
    const dir=await mkdtemp(join(tmpdir(),"contaos-f3-contract-")),file=join(dir,"observations.json");
    try{
      await exec("bunx",["vitest","run",CONTRACT_SOURCE,"--reporter=dot"],{cwd:ROOT,env:{...process.env,F3_CODE_CONTRACT_OBSERVATIONS:file},timeout:60000,maxBuffer:1024*1024});
      const parsed=JSON.parse(await readFile(file,"utf8")),map=new Map();
      if(!Array.isArray(parsed)||parsed.length!==Object.keys(contractCases).length*2)throw Object.assign(new Error("F3_CONTRACT_COUNT"),{code:"F3_CONTRACT_COUNT"});
      for(const e of parsed){
        const c=contractCases[e.caseId],key=e.caseId+":"+e.kind;
        if(!c||map.has(key)||!["positive","negative"].includes(e.kind)||e.testId!==CONTRACT_SOURCE+":"+key||e.consumer!==c.consumer||e.producerOrder!==c.order||e.organizationId!==CONTRACT_ORG||e.producerEntityId!==CONTRACT_ID||e.state!=="EXECUTED"||e.assertion!=="PASS")throw Object.assign(new Error("F3_CONTRACT_OUTPUT"),{code:"F3_CONTRACT_OUTPUT"});
        map.set(key,Object.freeze(e));
      }return map;
    }finally{await rm(dir,{recursive:true,force:true});}
  })();return contractRun;
}
async function contractEvidence(c,kind){
  const spec=contractCases[c.caseId];
  if(!spec||c.producerOrder!==spec.order||c.destination!==spec.destination||c.consumer!==spec.consumer)throw Object.assign(new Error("F3_CONTRACT_CASE_NOT_IMPLEMENTED"),{code:"F3_CONTRACT_CASE_NOT_IMPLEMENTED"});
  const e=(await runContract()).get(c.caseId+":"+kind);if(!e)throw Object.assign(new Error("F3_CONTRACT_MISSING"),{code:"F3_CONTRACT_MISSING"});return structuredClone(e);
}
function dispatchContract(base,kind){
  const all=new Set([...Object.keys(base),...Object.values(contractCases).map(c=>c.consumer)]);
  return Object.freeze(Object.fromEntries([...all].map(consumer=>[consumer,async args=>{
    if(Object.hasOwn(contractCases,args.case.caseId))return contractEvidence(args.case,kind);
    if(typeof base[consumer]!=="function")throw Object.assign(new Error("F3_CONSUMER_CASE_NOT_IMPLEMENTED"),{code:"F3_CONSUMER_CASE_NOT_IMPLEMENTED"});
    return base[consumer](args);
  }])));
}
async function contractProducer(order){
  const c=Object.values(contractCases).find(x=>x.order===order),e=(await runContract()).get(c.caseId+":positive");
  if(!e)throw Object.assign(new Error("F3_CONTRACT_PRODUCER_MISSING"),{code:"F3_CONTRACT_PRODUCER_MISSING"});
  return Object.freeze({state:"UI_OBSERVED_NOT_CERTIFIED",organizationId:e.organizationId,producerEntityId:e.producerEntityId});
}

export const producerDrivers = Object.freeze({
  7:()=>contractProducer(7),
  8:()=>contractProducer(8),
  5:()=>partyProducer(5),
  6:()=>partyProducer(6),
  18:()=>materialProducer(18),
  19:()=>materialProducer(19),
  14: async()=>{const e=(await runV113()).get('IFV1-F3-C0365:positive');if(!e)throw Object.assign(new Error('F3_V113_PRODUCER_MISSING'),{code:'F3_V113_PRODUCER_MISSING'});return Object.freeze({state:'UI_OBSERVED_NOT_CERTIFIED',organizationId:e.organizationId,producerEntityId:e.producerEntityId});},
  4: async () => {
    // Producer is shared by all ADM01 relations, even if the first consumer
    // is not implemented. Its verified fixture write must not depend on that case.
    const observed = await runRbacCases();
    const positive = observed.get("IFV1-F3-C0007:positive");
    if (!positive) throw Object.assign(new Error("F3_RBAC_PRODUCER_MISSING"), {code:"F3_RBAC_PRODUCER_MISSING"});
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
    if (![CASE_0041, CASE_0043, CASE_0045, CASE_0048].includes(c.caseId) && !Object.hasOwn(additionalCases,c.caseId) && !Object.hasOwn(competenceRpcCases,c.caseId)) {
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

const baseConsumerDrivers = Object.freeze({
  ...additionalConsumers("positive"),
  ...competenceRpcConsumers("positive"),
  [RBAC_SHARED]: async ({case:c}) => rbacEvidence(c,"positive"),
  eventos_auditoria: async ({case:c}) => rbacEvidence(c,"positive"),
  [CONSUMER_0036]: async ({ case: c }) => {
    if (c.caseId === "IFV1-F3-C0002") return rbacEvidence(c,"positive");
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
    if(c.caseId==="IFV1-F3-C0050") return structuredClone((await runAdditionalCase(c))[0]);
    if (c.caseId !== CASE_0048) {
      throw Object.assign(new Error("F3_CONSUMER_CASE_NOT_IMPLEMENTED"), {
        code: "F3_CONSUMER_CASE_NOT_IMPLEMENTED",
      });
    }
    const [positive] = await runCase0048();
    return structuredClone(positive);
  },
});

const baseNegativeDrivers = Object.freeze({
  ...additionalConsumers("negative"),
  ...competenceRpcConsumers("negative"),
  [RBAC_SHARED]: async ({case:c}) => rbacEvidence(c,"negative"),
  eventos_auditoria: async ({case:c}) => rbacEvidence(c,"negative"),
  [CONSUMER_0036]: async ({ case: c }) => {
    if (c.caseId === "IFV1-F3-C0002") return rbacEvidence(c,"negative");
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
    if(c.caseId==="IFV1-F3-C0050") return structuredClone((await runAdditionalCase(c))[1]);
    if (c.caseId !== CASE_0048) {
      throw Object.assign(new Error("F3_NEGATIVE_CASE_NOT_IMPLEMENTED"), {
        code: "F3_NEGATIVE_CASE_NOT_IMPLEMENTED",
      });
    }
    const [, negative] = await runCase0048();
    return structuredClone(negative);
  },
});

export const consumerDrivers=dispatchContract(dispatchParty(dispatchMaterial(dispatchV113(baseConsumerDrivers,"positive"),"positive"),"positive"),"positive");
export const negativeDrivers=dispatchContract(dispatchParty(dispatchMaterial(dispatchV113(baseNegativeDrivers,"negative"),"negative"),"negative"),"negative");

/** Contraditório estrutural interno. Não constitui auditoria independente final. */
export async function independentVerifier(c, observed) {
  if(Object.hasOwn(contractCases,c.caseId)){
    const spec=contractCases[c.caseId],{producer,positive,negative}=observed,a=positive.readback,b=negative.readback,key=spec.method==="GET"?"table":"rpc";
    if(!(c.origin===(spec.order===7?"V105":"V106")&&c.destination===spec.destination&&c.consumer===spec.consumer&&c.expected?.master==="ALLOW"&&c.expected?.leitor===(spec.reader?"ALLOW":"DENY")&&producer.organizationId===CONTRACT_ORG&&producer.producerEntityId===CONTRACT_ID&&positive.testId===CONTRACT_SOURCE+":"+c.caseId+":positive"&&negative.testId===CONTRACT_SOURCE+":"+c.caseId+":negative"&&positive.network?.[key]===spec.consumer&&negative.network?.[key]===spec.consumer&&positive.network?.fixture===true&&negative.network?.fixture===true&&positive.network?.status===200&&negative.network?.status===403&&a?.destination===spec.destination&&b?.destination===spec.destination&&a?.contractId===CONTRACT_ID&&b?.contractId===CONTRACT_ID&&a?.partyId===CONTRACT_PARTY&&b?.partyId===CONTRACT_PARTY&&a?.roles===(spec.reader?2:1)&&a?.writes===1&&b?.writes===1&&b?.outcome==="DENY"&&b?.mutationDenied===true&&b?.entityPreserved===true))return false;
    const v=a.witness;
    if(spec.destination==="V123")return v?.entity===CONTRACT_ID&&v.eventId==="c0700000-0000-4000-8000-000000000004"&&v.correlation==="c0700000-0000-4000-8000-000000000005";
    if(spec.destination==="SYS05")return v?.visible===1&&v.active===1&&v.group==="ativo"&&v.statusWrites===(spec.order===8?1:0);
    return v?.id===CONTRACT_ID&&v.party===CONTRACT_PARTY&&v.organization===CONTRACT_ORG&&v.object===(spec.order===7?"Objeto F3 original":"Objeto F3 revisado")&&v.route===(spec.route?"/contratos/"+CONTRACT_ID+"/"+spec.route:null);
  }
  if(Object.hasOwn(partyCases,c.caseId)){
    const spec=partyCases[c.caseId],{producer,positive,negative}=observed,a=positive.readback,b=negative.readback;
    if(!(c.origin===(spec.order===5?"V102":"V103")&&c.destination===spec.destination&&c.consumer===spec.consumer&&c.expected?.master==="ALLOW"&&c.expected?.leitor===(spec.reader?"ALLOW":"DENY")&&producer.organizationId===PARTY_ORG&&producer.producerEntityId===PARTY_ID&&positive.testId===PARTY_SOURCE+":"+c.caseId+":positive"&&negative.testId===PARTY_SOURCE+":"+c.caseId+":negative"&&positive.network?.table===(spec.destination==="V106"?"contratos":spec.consumer)&&negative.network?.table===(spec.destination==="V106"?"contratos":spec.consumer)&&positive.network?.fixture===true&&negative.network?.fixture===true&&positive.network?.status===200&&negative.network?.status===403&&a?.destination===spec.destination&&b?.destination===spec.destination&&a?.partyId===PARTY_ID&&b?.partyId===PARTY_ID&&a?.version===(spec.order===5?1:2)&&b?.version===a.version&&a?.roles===(spec.reader?2:1)&&a?.writes===1&&b?.writes===1&&b?.outcome==="DENY"&&b?.mutationDenied===true&&b?.entityPreserved===true))return false;
    const v=a.witness;
    if(spec.destination==="V123")return v?.entity===PARTY_ID&&v.eventId==="c0500000-0000-4000-8000-000000000004"&&v.correlation==="c0500000-0000-4000-8000-000000000005";
    if(v?.id!==PARTY_ID||v.name!==(spec.order===5?"Contratante F3":"Contratante F3 revisado"))return false;
    if(spec.destination==="V103")return v.version===1;
    if(spec.destination==="V105")return v.options===1;
    if(["V104","V106"].includes(spec.destination))return v.contractId==="c0500000-0000-4000-8000-000000000003";
    return spec.destination==="V101";
  }
  if(Object.hasOwn(materialCases,c.caseId)){
    const spec=materialCases[c.caseId],{producer,positive,negative}=observed,a=positive.readback,b=negative.readback,key=spec.method==="GET"?"table":"rpc";
    if(!(c.origin===(spec.order===18?"V118":"V119")&&c.destination===spec.destination&&c.consumer===spec.consumer&&c.expected?.master==="ALLOW"&&c.expected?.leitor===(spec.reader?"ALLOW":"DENY")&&producer.organizationId===MATERIAL_ORG&&producer.producerEntityId===materialId(spec.order)&&positive.testId===MATERIAL_SOURCE+":"+c.caseId+":positive"&&negative.testId===MATERIAL_SOURCE+":"+c.caseId+":negative"&&positive.network?.method===spec.method&&negative.network?.method===spec.method&&positive.network?.[key]===spec.consumer&&negative.network?.[key]===spec.consumer&&positive.network?.fixture===true&&negative.network?.fixture===true&&positive.network?.status===200&&negative.network?.status===403&&a?.destination===spec.destination&&b?.destination===spec.destination&&a?.contractId===MATERIAL_CONTRACT&&b?.contractId===MATERIAL_CONTRACT&&a?.competenceId===MATERIAL_COMP&&b?.competenceId===MATERIAL_COMP&&a?.roles===(spec.reader?2:1)&&a?.writes===1&&b?.writes===1&&b?.outcome==="DENY"&&b?.mutationDenied===true&&b?.entityPreserved===true))return false;
    const v=a.witness;
    if(spec.destination==="V123")return v?.entity===materialId(spec.order)&&v.eventId==="c1800000-0000-4000-8000-000000000009"&&v.correlation===(spec.order===18?"c1800000-0000-4000-8000-000000000010":"c1800000-0000-4000-8000-000000000007");
    if(spec.order===18)return v?.scope===MATERIAL_COMP&&v.approved===true&&v.gate===false&&v.percent===50&&v.canPresent===false;
    if(spec.destination==="V114")return v?.scope===MATERIAL_COMP&&v.state==="apresentado"&&v.packageVersion===1&&v.canPresent===false;
    return spec.destination==="V120"&&v?.packageId==="c1800000-0000-4000-8000-000000000006"&&v.hash==="a".repeat(64)&&v.protocol==="F3-119"&&v.versionId==="c1800000-0000-4000-8000-000000000012";
  }
  if(Object.hasOwn(v113Cases,c.caseId)){
    const spec=v113Cases[c.caseId],{producer,positive,negative}=observed;
    const a=positive.readback,b=negative.readback, key=spec.method==="GET"?"table":"rpc";
    const basic=c.origin==="V113"&&c.destination===spec.destination&&c.consumer===spec.consumer&&c.expected?.master==="ALLOW"&&c.expected?.leitor===(spec.reader?"ALLOW":"DENY")&&producer.organizationId===V113_ORG&&producer.producerEntityId===V113_ID&&
      positive.testId===V113_SOURCE+":"+c.caseId+":positive"&&negative.testId===V113_SOURCE+":"+c.caseId+":negative"&&positive.network?.method===spec.method&&negative.network?.method===spec.method&&positive.network?.[key]===spec.consumer&&negative.network?.[key]===spec.consumer&&positive.network?.fixture===true&&negative.network?.fixture===true&&positive.network?.status===200&&negative.network?.status===403&&a?.destination===spec.destination&&b?.destination===spec.destination&&a?.contractId===V113_CONTRACT&&b?.contractId===V113_CONTRACT&&a?.competenceId===V113_ID&&b?.competenceId===V113_ID&&a?.reference==="2026-11-01"&&b?.reference===a.reference&&a?.roles===(spec.reader?2:1)&&b?.outcome==="DENY"&&b?.mutationDenied===true&&b?.entityPreserved===true;
    if(!basic)return false;
    const v=a.witness;
    switch(spec.destination){
      case "SYS05":return v?.count===1&&v.group==="rascunho"&&v.deadline==="2026-12-15";
      case "V112":return v?.rowId===V113_ID&&v.reference===a.reference;
      case "V114":case "V119":return v?.scope===V113_ID&&v.gate===false&&v.canPresent===false;
      case "V115":return v?.scope===V113_ID&&v.state==="missing_docs"&&v.documentCount===0;
      case "V116":return v?.scope===V113_ID&&v.state==="not_analyzed"&&v.execution===null;
      case "V118":case "V120":return v?.scope===V113_ID&&v.empty===true&&v.count===0;
      case "V123":return v?.entity===V113_ID&&v.eventId==="c1400000-0000-4000-8000-000000000004"&&v.correlation==="c1400000-0000-4000-8000-000000000005";
      default:return false;
    }
  }
  if(Object.hasOwn(competenceRpcCases,c.caseId)){
    const spec=competenceRpcCases[c.caseId],{producer,positive,negative}=observed;
    return c.origin==="SYS04" && c.destination===spec.destination && c.consumer===spec.rpc &&
      c.expected?.master==="ALLOW" && c.expected?.leitor==="ALLOW" &&
      producer?.organizationId===ORG_0041 && producer.producerEntityId===ORG_0041 &&
      positive.testId===COMP_RPC_SOURCE+":"+c.caseId+":positive" && negative.testId===COMP_RPC_SOURCE+":"+c.caseId+":negative" &&
      positive.network?.rpc===spec.rpc && negative.network?.rpc===spec.rpc &&
      positive.network?.fixture===true && negative.network?.fixture===true &&
      positive.network?.status===200 && negative.network?.status===403 &&
      positive.readback?.destination===spec.destination && negative.readback?.destination===spec.destination &&
      positive.readback?.contractId===CONTRACT_EXTRA && negative.readback?.contractId===CONTRACT_EXTRA &&
      positive.readback?.competenceId===COMP_RPC_ID && negative.readback?.competenceId===COMP_RPC_ID &&
      positive.readback?.authorizedLocalIdentities===2 &&
      negative.readback?.outcome==="DENY" && negative.readback?.preferenceNotAuthorization===true;
  }
  if(c.caseId==="IFV1-F3-C0002"||c.caseId==="IFV1-F3-C0033"){
    const spec=rbacCases[c.caseId],{producer,positive,negative}=observed;
    const base=c.origin==="ADM01"&&c.destination===spec.destination&&c.consumer===spec.consumer&&
      c.expected?.master==="ALLOW"&&c.expected?.leitor===(spec.reader?"ALLOW":"DENY")&&
      producer?.organizationId===RBAC_ORG&&producer.producerEntityId===RBAC_LINK&&
      positive.testId===RBAC_SOURCE+":"+c.caseId+":positive"&&negative.testId===RBAC_SOURCE+":"+c.caseId+":negative"&&
      positive.network?.fixture===true&&negative.network?.fixture===true&&positive.network?.status===200&&
      positive.readback?.bindingId===RBAC_LINK&&negative.readback?.bindingId===RBAC_LINK;
    if(c.caseId==="IFV1-F3-C0002")return base&&positive.network?.rpc===spec.consumer&&negative.network?.rpc===spec.consumer&&
      positive.readback?.linkedOrgId===RBAC_ORG&&positive.readback?.route==="/"&&positive.readback?.roles===2&&
      negative.network?.status===200&&negative.readback?.outcome==="NO_FOREIGN_DATA"&&negative.readback?.route==="sem-acesso"&&negative.readback?.count===0;
    return base&&positive.network?.table===spec.consumer&&negative.network?.table===spec.consumer&&negative.network?.status===403&&
      positive.readback?.correlationId==="a5555555-5555-4555-8555-555555555555"&&negative.readback?.correlationId===positive.readback?.correlationId&&
      positive.readback?.eventId==="a9999999-9999-4999-8999-999999999999"&&negative.readback?.outcome==="DENY";
  }
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
      positive.readback?.rowId === (c.caseId==="IFV1-F3-C0050"?CONTRACT_EXTRA:ROW_EXTRA) &&
      (c.caseId!=="IFV1-F3-C0055" || (positive.readback?.versionId==="b1111111-1111-4111-8111-111111111111" &&
        positive.readback?.fileId==="b2222222-2222-4222-8222-222222222222" && negative.readback?.versionDenied===true)) &&
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
