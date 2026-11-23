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

export const producerDrivers = Object.freeze({
  1: async (c) => {
    if (c.caseId !== CASE_0036) {
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
});

/** Contraditório estrutural interno. Não constitui auditoria independente final. */
export async function independentVerifier(c, observed) {
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
