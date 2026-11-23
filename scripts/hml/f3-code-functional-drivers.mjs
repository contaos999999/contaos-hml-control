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
          parsed.some((event) =>
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

export const producerDrivers = Object.freeze({
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
    if (c.caseId !== CASE_0041) {
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
    if (c.caseId !== CASE_0037) {
      throw Object.assign(new Error("F3_CONSUMER_CASE_NOT_IMPLEMENTED"), {
        code: "F3_CONSUMER_CASE_NOT_IMPLEMENTED",
      });
    }
    const [positive] = await runCase0037();
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
});

export const negativeDrivers = Object.freeze({
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
    if (c.caseId !== CASE_0037) {
      throw Object.assign(new Error("F3_NEGATIVE_CASE_NOT_IMPLEMENTED"), {
        code: "F3_NEGATIVE_CASE_NOT_IMPLEMENTED",
      });
    }
    const [, negative] = await runCase0037();
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
});

/** Contraditório estrutural interno. Não constitui auditoria independente final. */
export async function independentVerifier(c, observed) {
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
