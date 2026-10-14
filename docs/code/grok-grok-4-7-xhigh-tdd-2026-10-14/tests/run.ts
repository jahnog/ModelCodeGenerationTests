import type { TestCase } from "./assert";
import { cartTests } from "./cart.test";
import { programTests } from "./program.test";

export const tests: readonly TestCase[] = [...cartTests, ...programTests];

export function runTests(cases: readonly TestCase[] = tests): readonly string[] {
  const failures: string[] = [];
  for (const test of cases) {
    try {
      test.run();
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : String(caught);
      failures.push(`${test.name}: ${message}`);
    }
  }
  return failures;
}

export const failures = runTests();

export const passedCount = tests.length - failures.length;

if (failures.length > 0) {
  throw new Error(`${String(failures.length)} failed\n${failures.join("\n")}`);
}
