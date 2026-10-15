import { AddItemToCart } from "./application/AddItemToCart";
import { RemoveItemFromCart } from "./application/RemoveItemFromCart";
import { ViewCart } from "./application/ViewCart";
import { ConsoleOutput } from "./infrastructure/ConsoleOutput";
import { InMemoryCartRepository } from "./infrastructure/InMemoryCartRepository";
import { CartController } from "./presentation/CartController";

/** Composition root: the only place that knows every layer and wires them together. */
export function createCartController(cartId = "demo-cart"): CartController {
  const repository = new InMemoryCartRepository();
  return new CartController(
    {
      addItem: new AddItemToCart(repository),
      viewCart: new ViewCart(repository),
      removeItem: new RemoveItemFromCart(repository),
    },
    new ConsoleOutput(),
    cartId,
  );
}

export async function main(): Promise<void> {
  const cart = createCartController();

  await cart.add("apple", "Apple", 50, 3);
  await cart.add("bread", "Bread", 249);
  await cart.add("milk", "Milk", 199, 2);
  await cart.add("apple", "Apple", 50, 2);
  await cart.show();

  await cart.remove("bread");
  await cart.show();

  await cart.remove("bread");
}

void main();
