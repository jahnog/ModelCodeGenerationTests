import { toCartLines } from "../map-cart-line";
import type { CartRepository } from "../port/driven/cart-repository";
import type { CartSnapshot, ShowCartItems } from "../port/driving/show-cart-items";

export class ShowCartItemsService implements ShowCartItems {
  readonly #carts: CartRepository;

  constructor(carts: CartRepository) {
    this.#carts = carts;
  }

  show(): CartSnapshot {
    return { items: toCartLines(this.#carts.load().items()) };
  }
}
