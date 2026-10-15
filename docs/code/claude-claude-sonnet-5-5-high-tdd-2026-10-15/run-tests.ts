import { cartTests } from "./cart.test";
import { formatTests } from "./format.test";
import { demoTests } from "./main.test";
import { formatReport, runTests } from "./testing";
import { testingTests } from "./testing.test";

const results = runTests([...testingTests, ...cartTests, ...formatTests, ...demoTests]);
console.log(formatReport(results));

if (results.some((result) => result.error !== undefined)) {
  throw new Error("Some tests failed");
}

export { results };
