import type { CartRepository } from "../domain/CartRepository";
import { ShoppingCart } from "../domain/ShoppingCart";

/** A cart that has never been saved is treated as a new, empty cart. */
export async function loadCart(repository: CartRepository, cartId: string): Promise<ShoppingCart> {
  return (await repository.findById(cartId)) ?? new ShoppingCart(cartId);
}
