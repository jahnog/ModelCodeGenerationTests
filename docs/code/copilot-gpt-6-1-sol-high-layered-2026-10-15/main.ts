import { ShoppingCartService } from "./application";
import { InMemoryCartRepository } from "./infrastructure";
import { ShoppingCartController } from "./presentation";
import type { WriteLine } from "./presentation";

export function createShoppingCart(
  writeLine: WriteLine = (message) => console.log(message),
): ShoppingCartController {
  const repository = new InMemoryCartRepository();
  const service = new ShoppingCartService(repository);
  return new ShoppingCartController(service, writeLine);
}

export function main(): void {
  const cart = createShoppingCart();

  cart.addItem({ id: "notebook", name: "Notebook", unitPriceCents: 499 });
  cart.addItem({ id: "pen", name: "Pen", unitPriceCents: 125, quantity: 2 });
  cart.showItems();

  cart.removeItem("notebook");
  cart.showItems();

  cart.removeItem("pen");
  cart.showItems();
}

main();
