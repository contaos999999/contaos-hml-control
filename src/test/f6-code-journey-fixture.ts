import { readFileSync, writeFileSync } from "node:fs";
import { expect } from "vitest";

const matrixPath = "docs/frontend/auditorias/integracao-funcional-v1/fase6/F6_JOURNEY_MATRIX.json";
export type Scope = {
  actor: string;
  role: string;
  org: string;
  contract: string;
  competence: string;
  requirement: string;
  party: string;
  version: string;
  correlation: string;
  link: string;
};
const uid = (side: string, slot: number) =>
  side + "6100000-0000-4000-8000-" + String(slot).padStart(12, "0");
function scope(side: "a" | "b", role: string): Scope {
  return {
    actor: uid(side, 1),
    role,
    org: uid(side, 2),
    contract: uid(side, 3),
    competence: uid(side, 4),
    requirement: uid(side, 5),
    party: uid(side, 6),
    version: uid(side, 7),
    correlation: uid(side, 8),
    link: uid(side, 9),
  };
}
export const A = scope("a", "administrador");
export const B = scope("b", "leitor");
export type Fields = Record<string, unknown>;
export type NativeReply = { status: number; data: unknown };
export const response = (data: unknown, status = 200): NativeReply => ({ status, data });
export const forbidden = { code: "42501", message: "Escopo não autorizado na fixture." };
export const eq = (value: string) => "eq." + value;
export const signal = () => new AbortController().signal;
export const moment = "2026-11-01T10:00:00Z";
export const pagination = (limite: number, total = 0) => ({ offset: 0, limite, total });

export function createTransport(
  handler: (
    actor: Scope,
    route: string,
    fields: Fields,
    method: string,
  ) => NativeReply | Promise<NativeReply>,
  actors: Scope[] = [A, B],
) {
  const trace: Array<{
    actor: string;
    route: string;
    method: string;
    status: number;
    code: string | null;
  }> = [];
  const fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(String(input));
    expect(url.origin).toBe("https://f6-journeys.invalid");
    const header = new Headers(init?.headers).get("authorization");
    const actor = actors.find((s) => "Bearer fixture-" + s.actor === header);
    if (!actor || !url.pathname.startsWith("/rest/v1/"))
      throw Error("Unexpected synthetic boundary");
    const route = url.pathname.slice("/rest/v1/".length);
    const method = init?.method ?? "GET";
    const fields =
      method === "GET"
        ? Object.fromEntries(
            [...url.searchParams].filter(
              ([k]) => !["select", "order", "offset", "limit"].includes(k),
            ),
          )
        : JSON.parse(String(init?.body));
    const result = await handler(actor, route, fields, method);
    const data = result.data;
    const code =
      typeof data === "object" && data !== null && "code" in data && typeof data.code === "string"
        ? data.code
        : null;
    trace.push({ actor: actor.actor, route, method, status: result.status, code });
    const headers = new Headers({ "content-type": "application/json" });
    if (Array.isArray(data)) {
      headers.set(
        "content-range",
        data.length ? "0-" + (data.length - 1) + "/" + data.length : "*/0",
      );
    }
    return new Response(JSON.stringify(data), { status: result.status, headers });
  };
  return { trace, fetch };
}

type Journey = {
  caseId: string;
  sourceConnectionId: string;
  journeyId: string;
  batch: string | null;
  normativeSource: string;
  classification: string;
  producer: string;
  consumer: string;
  expected: string;
};
type Step = { phase: "precondition" | "producer" | "consumer" | "recovery"; observed: Fields };
type Proof = {
  preconditions: Fields;
  steps: Step[];
  observed: Fields;
  postconditions: Fields;
  cleanupStatus: "CLEAN";
  recoveryProof: Fields;
  negativeProof?: {
    decision: "DENIED" | "ISOLATED";
    status?: number;
    code?: string;
    effects: 0;
    disclosed: false;
  };
};
export const evidenceStep = (phase: Step["phase"], observed: Fields): Step => ({ phase, observed });

export function journeyRecorder(batch: string) {
  const matrix = JSON.parse(readFileSync(matrixPath, "utf8")) as {
    backendSha: string;
    cases: Journey[];
  };
  const cases = matrix.cases.filter((item) => item.batch === batch);
  const byId = new Map(cases.map((item) => [item.sourceConnectionId, item]));
  const observations: object[] = [];
  return {
    cases,
    record(connection: string, kind: "positive" | "negative", actor: Scope, proof: Proof) {
      const item = byId.get(connection);
      if (!item) throw Error("Journey was not assigned to " + batch + ": " + connection);
      observations.push({
        ...item,
        kind,
        scope: "CODE_FIXTURE",
        applicability: "APLICAVEL",
        actor: actor.actor,
        tenant: actor.org,
        profile: actor.role,
        status: "PASS",
        identity: {
          frontendSha: process.env["F6_FRONTEND_SHA"],
          backendSha: matrix.backendSha,
          harnessSha: process.env["F6_HARNESS_SHA"],
          runId: process.env["GITHUB_RUN_ID"],
          attempt: process.env["GITHUB_RUN_ATTEMPT"],
          jobId: process.env["JOB_ID"],
        },
        ...proof,
      });
    },
    write() {
      const path = process.env["F6_OBSERVATIONS"];
      if (path) {
        expect(observations).toHaveLength(cases.length * 2);
        writeFileSync(path, JSON.stringify(observations, null, 2) + "\n", { flag: "wx" });
      }
    },
  };
}
