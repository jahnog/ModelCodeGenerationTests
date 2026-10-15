import { AddItemToCart } from "./application/use-cases/AddItemToCart";
import { RemoveItemFromCart } from "./application/use-cases/RemoveItemFromCart";
import { ViewCart } from "./application/use-cases/ViewCart";
import { ConsoleOutput, type Output } from "./infrastructure/io/ConsoleOutput";
import { InMemoryCartRepository } from "./infrastructure/persistence/InMemoryCartRepository";
import { CartController } from "./interface-adapters/controllers/CartController";
import { CartPresenter } from "./interface-adapters/presenters/CartPresenter";

/** Composition root: the only module that knows every concrete class and wires them together. */
export function createCartController(cartId: string): CartController {
  const carts = new InMemoryCartRepository();
  return new CartController(
    cartId,
    {
      addItem: new AddItemToCart(carts),
      viewCart: new ViewCart(carts),
      removeItem: new RemoveItemFromCart(carts),
    },
    new CartPresenter(),
  );
}

export const demoSession: readonly string[] = [
  "help",
  "show",
  'add apple "Green apple" 0.50 3',
  'add bread "Sourdough bread" 4.25',
  'add milk "Whole milk" 1.99 2',
  'add apple "Green apple" 0.50 1',
  "show",
  "remove bread",
  "show",
  "remove bread",
  'add soda "Soda" -1',
];

export async function run(commands: readonly string[], output: Output): Promise<void> {
  const controller = createCartController("my-cart");
  for (const command of commands) {
    output.write(`> ${command}`);
    output.write(await controller.handle(command));
    output.write("");
  }
}

run(demoSession, new ConsoleOutput()).catch((error: unknown) => {
  console.error("Unexpected failure:", error);
});
