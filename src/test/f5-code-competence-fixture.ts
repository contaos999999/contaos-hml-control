import { createHash } from "node:crypto";
import { writeFileSync } from "node:fs";
import { expect } from "vitest";

export const fixtureDate = "2026-11-01T12:00:00Z";
export const digest = (value: string) => createHash("sha256").update(value).digest("hex");
const scope = (side: string, org: string, actor: string, role: string) => ({
  org,
  actor,
  role,
  session: "fixture-competence-" + side,
  id: (n: number) => side + "5500000-0000-4000-8000-" + String(n).padStart(12, "0"),
});
export const tenantA = scope(
  "a",
  "a1111111-1111-4111-8111-111111111111",
  "a3333333-3333-4333-8333-333333333333",
  "administrador",
);
export const tenantB = scope(
  "b",
  "a2222222-2222-4222-8222-222222222222",
  "b3333333-3333-4333-8333-333333333333",
  "leitor",
);
export type Scope = typeof tenantA;
type Fields = Record<string, unknown>;
type Reply = { status: number; data: unknown };
export const reply = (data: unknown, status = 200): Reply => ({ status, data });
export const denied = { code: "42501", message: "Acesso negado na fixture." };
export const signal = () => new AbortController().signal;
export const pagination = (limite: number, total = 0) => ({ offset: 0, limite, total });
export const eq = (value: string) => "eq." + value;

export function fixtureTransport(
  handler: (actor: Scope, path: string, fields: Fields, method: string) => Reply,
) {
  const calls: Array<{ path: string; method: string; status: number; data: unknown }> = [];
  const fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(String(input));
    expect(url.origin).toBe("https://f5-competence.invalid");
    const authorization = new Headers(init?.headers).get("authorization");
    const actor = [tenantA, tenantB].find((s) => "Bearer " + s.session === authorization);
    if (!actor) throw Error("Unknown synthetic identity");
    const method = init?.method ?? "GET";
    const path = url.pathname.replace(/^\/rest\/v1\//, "");
    const fields =
      method === "POST"
        ? JSON.parse(String(init?.body))
        : Object.fromEntries(
            [...url.searchParams].filter(
              ([k]) => !["select", "order", "offset", "limit"].includes(k),
            ),
          );
    const { status, data } = handler(actor, path, fields, method);
    calls.push({ path, method, status, data });
    const headers = new Headers({ "content-type": "application/json" });
    if (Array.isArray(data))
      headers.set("content-range", data.length ? "0-0/" + data.length : "*/0");
    return new Response(JSON.stringify(data), { status, headers });
  };
  return { fetch, calls };
}

export function createObservationWriter() {
  const observations: object[] = [];
  return {
    record(
      c: { id: string; origin: string; destination: string; consumer: string; operation: string },
      actor: Scope,
      kind: "positive" | "negative",
      readback: object,
    ) {
      observations.push({
        caseId: "IFV1-F5-C" + c.id,
        kind,
        mode: "CODE_FIXTURE",
        origin: c.origin,
        destination: c.destination,
        frontier: c.consumer,
        actor: actor.actor,
        role: actor.role,
        tenant: actor.org,
        target: tenantA.org,
        operation: c.operation,
        decision: kind === "positive" ? "ALLOW" : "DENY",
        frontend: process.env["F5_FRONTEND_SHA"],
        backend: "a1516de1d8949e505d83b5e000eb1cc558b217a7",
        harness: process.env["F5_HARNESS_SHA"],
        run: process.env["GITHUB_RUN_ID"],
        attempt: process.env["GITHUB_RUN_ATTEMPT"],
        job: process.env["JOB_ID"],
        readback,
      });
    },
    write() {
      const path = process.env["F5_OBSERVATIONS"];
      if (path) writeFileSync(path, JSON.stringify(observations, null, 2) + "\n");
    },
  };
}
