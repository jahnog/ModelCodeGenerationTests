import { runDemo } from "./main";
import { assertEqual, test, type TestCase } from "./testing";

export const demoTests: readonly TestCase[] = [
  test("the demo adds, shows, removes and shows again", () => {
    assertEqual(runDemo(), [
      "Added Apple, Bread",
      "2 x Apple @ $0.50 = $1.00\n1 x Bread @ $2.50 = $2.50\nTotal: $3.50",
      "Removed Apple",
      "1 x Bread @ $2.50 = $2.50\nTotal: $2.50",
    ]);
  }),
];
