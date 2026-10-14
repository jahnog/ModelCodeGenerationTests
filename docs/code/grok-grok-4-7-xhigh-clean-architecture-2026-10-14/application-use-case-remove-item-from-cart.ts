// Use case. Removes one cart line by id and returns the line that was removed.

import type { CartError } from "./domain-cart-error";
import { removeCartItem } from "./domain-entity-shopping-cart";
import type { CartRepository } from "./application-port-cart-repository";
import {
  toCartLine,
  toShownCart,
  type CartLine,
  type ShownCart,
} from "./application-shown-cart";

export interface RemoveItemFromCartRequest {
  readonly id: string;
}

export type RemoveItemFromCartResult =
  | { readonly ok: true; readonly removed: CartLine; readonly cart: ShownCart }
  | { readonly ok: false; readonly error: CartError };

export interface RemoveItemFromCartInput {
  execute(request: RemoveItemFromCartRequest): RemoveItemFromCartResult;
}

export class RemoveItemFromCartInteractor implements RemoveItemFromCartInput {
  private readonly repository: CartRepository;

  constructor(repository: CartRepository) {
    this.repository = repository;
  }

  execute(request: RemoveItemFromCartRequest): RemoveItemFromCartResult {
    const updated = removeCartItem(this.repository.load(), request.id);
    if (!updated.ok) {
      return { ok: false, error: updated.error };
    }
    this.repository.save(updated.value.cart);
    return {
      ok: true,
      removed: toCartLine(updated.value.item),
      cart: toShownCart(updated.value.cart),
    };
  }
}
