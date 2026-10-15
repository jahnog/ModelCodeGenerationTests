import { CartController } from "./adapters/CartController";
import { AddItemToCart } from "./application/use-cases/AddItemToCart";
import { RemoveItemFromCart } from "./application/use-cases/RemoveItemFromCart";
import { ShowCartItems } from "./application/use-cases/ShowCartItems";
import { ConsoleOutput } from "./infrastructure/ConsoleOutput";
import { InMemoryCartRepository } from "./infrastructure/InMemoryCartRepository";

/** Composition root: the only place where concrete classes are wired together. */
export function createCartController(): CartController {
  const carts = new InMemoryCartRepository();
  return new CartController(
    new AddItemToCart(carts),
    new RemoveItemFromCart(carts),
    new ShowCartItems(carts),
    new ConsoleOutput(),
  );
}

export async function main(): Promise<void> {
  const cart = createCartController();
  await cart.show();
  await cart.add("book-1", "TypeScript Handbook", 2999, 1);
  await cart.add("pen-7", "Fountain Pen", 1250, 2);
  await cart.add("book-1", "TypeScript Handbook", 2999, 1);
  await cart.show();
  await cart.remove("pen-7");
  await cart.remove("pen-7");
  await cart.show();
}

void main();
