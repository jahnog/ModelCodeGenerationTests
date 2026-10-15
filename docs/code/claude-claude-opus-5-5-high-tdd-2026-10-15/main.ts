// The shopping cart program: adds items, shows the cart, removes an item, and shows it again.
import { ShoppingCart } from "./cart";
import { runSession } from "./commands";

declare const console: { log(message: string): void };

export const DEMO_COMMANDS: readonly string[] = [
  "add apple 0.50 3",
  "add green tea 4.25",
  "add bread 2.99 2",
  "show",
  "remove green tea",
  "remove bread 1",
  "show",
];

console.log(runSession(new ShoppingCart(), DEMO_COMMANDS));
