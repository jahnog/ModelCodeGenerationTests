import { readCartError } from "../map-cart-error";
import { toCartLine, toCartLines } from "../map-cart-line";
import type { CartRepository } from "../port/driven/cart-repository";
import type {
  RemoveItemCommand,
  RemoveItemFromCart,
  RemoveItemResult,
} from "../port/driving/remove-item-from-cart";

export class RemoveItemFromCartService implements RemoveItemFromCart {
  readonly #carts: CartRepository;

  constructor(carts: CartRepository) {
    this.#carts = carts;
  }

  remove(command: RemoveItemCommand): RemoveItemResult {
    try {
      const cart = this.#carts.load();
      const removed = cart.removeItem(command.id);
      this.#carts.save(cart);
      return {
        ok: true,
        removed: toCartLine(removed),
        items: toCartLines(cart.items()),
      };
    } catch (error: unknown) {
      const message = readCartError(error);
      if (message === undefined) {
        throw error;
      }
      return { ok: false, message };
    }
  }
}
