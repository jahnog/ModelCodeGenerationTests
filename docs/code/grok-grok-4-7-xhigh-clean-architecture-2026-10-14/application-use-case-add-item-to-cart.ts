// Use case. Depends on the cart entity and the repository port, not on storage or presentation.

import type { CartError } from "./domain-cart-error";
import { createCartItem } from "./domain-entity-cart-item";
import { addCartItem } from "./domain-entity-shopping-cart";
import type { CartRepository } from "./application-port-cart-repository";
import {
  toCartLine,
  toShownCart,
  type CartLine,
  type ShownCart,
} from "./application-shown-cart";

export interface AddItemToCartRequest {
  readonly id: string;
  readonly name: string;
  readonly unitPriceCents: number;
  readonly quantity: number;
}

export type AddItemToCartResult =
  | { readonly ok: true; readonly item: CartLine; readonly cart: ShownCart }
  | { readonly ok: false; readonly error: CartError };

export interface AddItemToCartInput {
  execute(request: AddItemToCartRequest): AddItemToCartResult;
}

export class AddItemToCartInteractor implements AddItemToCartInput {
  private readonly repository: CartRepository;

  constructor(repository: CartRepository) {
    this.repository = repository;
  }

  execute(request: AddItemToCartRequest): AddItemToCartResult {
    const created = createCartItem(
      request.id,
      request.name,
      request.unitPriceCents,
      request.quantity,
    );
    if (!created.ok) {
      return { ok: false, error: created.error };
    }
    const updated = addCartItem(this.repository.load(), created.value);
    if (!updated.ok) {
      return { ok: false, error: updated.error };
    }
    this.repository.save(updated.value.cart);
    return {
      ok: true,
      item: toCartLine(updated.value.item),
      cart: toShownCart(updated.value.cart),
    };
  }
}
