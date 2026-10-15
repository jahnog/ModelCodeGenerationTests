// A tiny test harness with no dependencies, so the project imports no packages.

declare const console: { log(message: string): void };

type TestFn = () => void;

const tests: { name: string; fn: TestFn }[] = [];

export function test(name: string, fn: TestFn): void {
  tests.push({ name, fn });
}

export class AssertionError extends Error {
  override name = "AssertionError";
}

function deepEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (typeof a !== "object" || typeof b !== "object" || a === null || b === null) return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return false;
  return aKeys.every(
    (key) => Object.hasOwn(b, key) && deepEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key]),
  );
}

export function assertEqual<T>(actual: T, expected: T, message = ""): void {
  if (!deepEqual(actual, expected)) {
    throw new AssertionError(
      `${message ? message + ": " : ""}expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`,
    );
  }
}

export function assertThrows(fn: () => unknown, messagePart: string): void {
  try {
    fn();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes(messagePart)) {
      throw new AssertionError(`expected error containing ${JSON.stringify(messagePart)}, got ${JSON.stringify(message)}`);
    }
    return;
  }
  throw new AssertionError(`expected an error containing ${JSON.stringify(messagePart)}, but nothing was thrown`);
}

/** Runs every registered test, prints a report, and throws if any test failed. */
export function runTests(): void {
  let failed = 0;
  for (const { name, fn } of tests) {
    try {
      fn();
      console.log(`  ok   ${name}`);
    } catch (error) {
      failed++;
      console.log(`  FAIL ${name}\n       ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  console.log(`\n${tests.length - failed} passed, ${failed} failed`);
  if (failed > 0) throw new Error(`${failed} test(s) failed`);
}
