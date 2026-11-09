import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";

test("R6 inspection validates the pinned artifact without opening an authorization path", async () => {
  const path = new URL("./inspect-fixture-artifact.mjs", import.meta.url);
  assert.ok(existsSync(path), "R6_INSPECTION_IMPLEMENTATION_ABSENT");
  const { validateDownloadOutput } = await import(path.href);
  assert.equal(typeof validateDownloadOutput, "function");
  assert.throws(() => validateDownloadOutput({ status: 0, stdout: "", stderr: "" }));
});
