import { BasicCartItemValidator } from "./CartItemValidator";
import { TextCartFormatter } from "./CartFormatter";
import { CartView } from "./CartView";
import { InMemoryCartRepository } from "./InMemoryCartRepository";
import { ConsoleOutput } from "./Output";
import { ShoppingCartService } from "./ShoppingCart";

/** Composition root: the only place that picks concrete classes. */
export function main(): void {
  const output = new ConsoleOutput();
  const cart = new ShoppingCartService(new InMemoryCartRepository(), new BasicCartItemValidator());
  const view = new CartView(cart, new TextCartFormatter(), output);

  output.write("Adding items...");
  cart.addItem({ id: "apple", name: "Apple", unitPriceCents: 50, quantity: 3 });
  cart.addItem({ id: "bread", name: "Bread", unitPriceCents: 249, quantity: 1 });
  cart.addItem({ id: "milk", name: "Milk", unitPriceCents: 199, quantity: 2 });
  cart.addItem({ id: "apple", name: "Apple", unitPriceCents: 50, quantity: 2 });
  view.show();

  output.write("\nRemoving bread...");
  const removed = cart.removeItem("bread");
  output.write(removed ? "Bread removed." : "Bread was not in the cart.");
  view.show();
}

main();
