export type TestCase = {
  readonly name: string;
  readonly run: () => void;
};

export function expectEqual(actual: unknown, expected: unknown): void {
  if (!same(actual, expected)) {
    throw new Error(`expected ${format(expected)} but received ${format(actual)}`);
  }
}

function format(value: unknown): string {
  const text = JSON.stringify(value);
  if (text === undefined) {
    return String(value);
  }
  return text;
}

function same(actual: unknown, expected: unknown): boolean {
  if (Object.is(actual, expected)) {
    return true;
  }
  if (Array.isArray(actual) && Array.isArray(expected)) {
    return (
      actual.length === expected.length &&
      actual.every((entry, index) => same(entry, expected[index]))
    );
  }
  if (isRecord(actual) && isRecord(expected)) {
    const actualKeys = Object.keys(actual);
    const expectedKeys = Object.keys(expected);
    return (
      actualKeys.length === expectedKeys.length &&
      expectedKeys.every((key) => same(actual[key], expected[key]))
    );
  }
  return false;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
