import {
  assertEqual,
  assertThrows,
  formatReport,
  runTests,
  test,
  type TestCase,
} from "./testing";

export const testingTests: readonly TestCase[] = [
  test("assertEqual passes for deeply equal values", () => {
    assertEqual({ a: [1, { b: 2 }] }, { a: [1, { b: 2 }] });
  }),
  test("assertEqual fails for different values", () => {
    assertThrows(() => assertEqual({ a: 1 }, { a: 2 }), "Expected");
  }),
  test("assertEqual fails when an array and an object are compared", () => {
    assertThrows(() => assertEqual([], {}), "Expected");
  }),
  test("assertThrows fails when nothing is thrown", () => {
    assertThrows(() => assertThrows(() => 1, "boom"), "nothing was thrown");
  }),
  test("assertThrows fails when the message differs", () => {
    assertThrows(
      () =>
        assertThrows(() => {
          throw new Error("other");
        }, "boom"),
      "but got",
    );
  }),
  test("runTests records passing and failing cases", () => {
    const results = runTests([
      test("good", () => {}),
      test("bad", () => {
        throw new Error("nope");
      }),
    ]);
    assertEqual(results, [
      { name: "good", error: undefined },
      { name: "bad", error: "nope" },
    ]);
  }),
  test("formatReport summarises the results", () => {
    const report = formatReport([
      { name: "good", error: undefined },
      { name: "bad", error: "nope" },
    ]);
    assertEqual(report.includes("ok   good"), true);
    assertEqual(report.includes("FAIL bad"), true);
    assertEqual(report.endsWith("1 passed, 1 failed"), true);
  }),
];
