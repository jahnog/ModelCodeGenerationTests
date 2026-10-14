import { createCartItem } from "../../domain/cart-item";
import { readCartError } from "../map-cart-error";
import { toCartLines } from "../map-cart-line";
import type { CartResult } from "../model/cart-line";
import type { AddItemCommand, AddItemToCart } from "../port/driving/add-item-to-cart";
import type { CartRepository } from "../port/driven/cart-repository";

export class AddItemToCartService implements AddItemToCart {
  readonly #carts: CartRepository;

  constructor(carts: CartRepository) {
    this.#carts = carts;
  }

  add(command: AddItemCommand): CartResult {
    try {
      const item = createCartItem(
        command.id,
        command.name,
        command.unitPriceCents,
        command.quantity,
      );
      const cart = this.#carts.load();
      cart.addItem(item);
      this.#carts.save(cart);
      return { ok: true, items: toCartLines(cart.items()) };
    } catch (error: unknown) {
      const message = readCartError(error);
      if (message === undefined) {
        throw error;
      }
      return { ok: false, message };
    }
  }
}
