export type TestCase = {
  readonly name: string;
  readonly run: () => void;
};

export type TestResult = {
  readonly name: string;
  readonly error: string | undefined;
};

export class AssertionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AssertionError";
  }
}

export const test = (name: string, run: () => void): TestCase => ({ name, run });

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const deepEqual = (a: unknown, b: unknown): boolean => {
  if (Object.is(a, b)) return true;
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((value, i) => deepEqual(value, b[i]));
  }
  if (isRecord(a) && isRecord(b) && !Array.isArray(a) && !Array.isArray(b)) {
    const keys = Object.keys(a);
    return (
      keys.length === Object.keys(b).length &&
      keys.every((key) => Object.hasOwn(b, key) && deepEqual(a[key], b[key]))
    );
  }
  return false;
};

export const assertEqual = (actual: unknown, expected: unknown): void => {
  if (!deepEqual(actual, expected)) {
    throw new AssertionError(
      `Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`,
    );
  }
};

export const assertThrows = (action: () => unknown, messagePart: string): void => {
  try {
    action();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes(messagePart)) {
      throw new AssertionError(
        `Expected an error containing ${JSON.stringify(messagePart)} but got ${JSON.stringify(message)}`,
      );
    }
    return;
  }
  throw new AssertionError(
    `Expected an error containing ${JSON.stringify(messagePart)} but nothing was thrown`,
  );
};

export const runTests = (cases: readonly TestCase[]): readonly TestResult[] =>
  cases.map((testCase) => {
    try {
      testCase.run();
      return { name: testCase.name, error: undefined };
    } catch (error) {
      return {
        name: testCase.name,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  });

export const formatReport = (results: readonly TestResult[]): string => {
  const failed = results.filter((result) => result.error !== undefined);
  const lines = results.map((result) =>
    result.error === undefined
      ? `  ok   ${result.name}`
      : `  FAIL ${result.name}\n         ${result.error}`,
  );
  lines.push("", `${results.length - failed.length} passed, ${failed.length} failed`);
  return lines.join("\n");
};
