import { createShoppingCartProgram, type ShoppingCartProgram } from "./composition/shopping-cart-program";
import type { CommandAcknowledgement } from "./command/cart-command";
import { formatAcknowledgement, formatShownCart } from "./presentation/text-cart-view";

export function runShoppingCart(program: ShoppingCartProgram = createShoppingCartProgram()): string {
  const parts: string[] = [];

  const show = (heading: string): void => {
    parts.push(heading, formatShownCart(program.showItems()), "");
  };

  const change = (heading: string, result: CommandAcknowledgement): void => {
    parts.push(heading, formatAcknowledgement(result), formatShownCart(program.showItems()), "");
  };

  show("Shopping cart before any item is added:");

  change(
    "Add Milk with quantity 0:",
    program.addItem({ itemId: "milk", name: "Milk", unitPriceCents: 199, quantity: 0 }),
  );
  change(
    "Add 1 Milk:",
    program.addItem({ itemId: "milk", name: "Milk", unitPriceCents: 199, quantity: 1 }),
  );
  change(
    "Add 1 more Milk:",
    program.addItem({ itemId: "milk", name: "Milk", unitPriceCents: 199, quantity: 1 }),
  );
  change(
    "Add 1 Bread:",
    program.addItem({ itemId: "bread", name: "Bread", unitPriceCents: 250, quantity: 1 }),
  );

  show("Shopping cart:");

  change("Remove Milk:", program.removeItem("milk"));
  change("Remove Milk again:", program.removeItem("milk"));

  show("Shopping cart after removal:");

  return `${parts.join("\n").trimEnd()}\n`;
}
