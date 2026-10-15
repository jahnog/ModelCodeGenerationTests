import { InMemoryCartRepository } from "./in-memory-cart-repository";
import { ShoppingCartConsole } from "./shopping-cart-console";
import type { ShoppingCartUseCases } from "./shopping-cart-ports";
import { ShoppingCartService } from "./shopping-cart-service";

export function createShoppingCart(): ShoppingCartUseCases {
  return new ShoppingCartService(new InMemoryCartRepository());
}

export function runDemo(): void {
  const cart = new ShoppingCartConsole(createShoppingCart());

  cart.showItems();
  cart.addItem({ id: "book", name: "TypeScript book", quantity: 1 });
  cart.addItem({ id: "pen", name: "Blue pen", quantity: 2 });
  cart.showItems();
  cart.removeItem("book");
  cart.showItems();
}

runDemo();
