import type { Item } from "../item";
import { runShoppingCart } from "../main";
import { expectEqual, type TestCase } from "./assert";

const pen: Item = { id: "pen", name: "Pen" };
const notebook: Item = { id: "notebook", name: "Notebook" };

export const programTests: readonly TestCase[] = [
  {
    name: "the program shows the added items and the items left after removal",
    run() {
      expectEqual(runShoppingCart(), {
        shown: [pen, notebook],
        afterRemoval: [notebook],
      });
    },
  },
  {
    name: "running the program again shows the same items",
    run() {
      expectEqual(runShoppingCart(), runShoppingCart());
    },
  },
];
