import { expect, test } from "@playwright/test";
import { HML_PROJECT_REF, syntheticFixturePreflight } from "./sys03-fixture";

// This suite intentionally never calls Auth: prerequisites only.
test("SYS-03 authenticated HML prerequisites fail closed", async () => {
  const check = syntheticFixturePreflight(process.env);
  expect(HML_PROJECT_REF).toBe("gklhhhyosgasnyoxlrui");
  expect(check.missing.every((item) => !item.includes("@") && !item.includes("://"))).toBe(true);
  if (!check.ready) {
    test.skip(true, "BLOCKED: synthetic mailbox / HML environment not configured; N1-N9 not executed");
  }
  expect(check.ready).toBe(true);
});
