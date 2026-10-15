import { CartController } from "./cart-controller";
import {
  AddItemToCart,
  ListCartItems,
  RemoveItemFromCart,
} from "./cart-use-cases";
import { InMemoryCartRepository } from "./in-memory-cart-repository";

/**
 * Composition root: wires presentation -> use cases -> domain/repository port.
 * Storage is in memory, isolated per application, and lost on process exit.
 * Prices are integer cents; adding the same ID increases its quantity.
 */
export function createShoppingCart(): CartController {
  const repository = new InMemoryCartRepository();
  return new CartController(
    new AddItemToCart(repository),
    new ListCartItems(repository),
    new RemoveItemFromCart(repository),
  );
}
