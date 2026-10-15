import { InMemoryCartRepository } from "./data/inMemoryCartRepository";
import { CartController, type CartCommand } from "./presentation/cartController";
import { CartService } from "./service/cartService";

// Declared locally so no DOM or Node typings are required.
declare const console: { log(message: string): void };

/** Composition root: wires the layers together. */
export function createCartController(): CartController {
  return new CartController(new CartService(new InMemoryCartRepository()));
}

export function runDemo(): void {
  const controller = createCartController();
  const script: readonly CartCommand[] = [
    { kind: "show" },
    { kind: "add", item: { id: "apple", name: "Apple", unitPriceCents: 50, quantity: 4 } },
    { kind: "add", item: { id: "bread", name: "Bread", unitPriceCents: 250, quantity: 1 } },
    { kind: "add", item: { id: "apple", name: "Apple", unitPriceCents: 50, quantity: 2 } },
    { kind: "show" },
    { kind: "remove", id: "apple" },
    { kind: "remove", id: "apple" },
    { kind: "show" },
  ];
  for (const command of script) console.log(controller.handle(command));
}

runDemo();
