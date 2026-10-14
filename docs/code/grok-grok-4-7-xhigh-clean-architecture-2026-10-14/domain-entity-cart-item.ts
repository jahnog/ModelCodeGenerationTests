// Entity. A cart line is valid only when id, name, price, quantity, and line total are safe.

import type { CartError } from "./domain-cart-error";
import { err, ok, type Result } from "./domain-result";

export interface CartItem {
  readonly id: string;
  readonly name: string;
  readonly unitPriceCents: number;
  readonly quantity: number;
}

export function createCartItem(
  id: string,
  name: string,
  unitPriceCents: number,
  quantity: number,
): Result<CartItem, CartError> {
  const trimmedId = id.trim();
  const trimmedName = name.trim();
  if (trimmedId.length === 0) {
    return err({ code: "empty-id" });
  }
  if (trimmedName.length === 0) {
    return err({ code: "empty-name" });
  }
  if (!Number.isSafeInteger(unitPriceCents) || unitPriceCents < 0) {
    return err({ code: "invalid-price" });
  }
  if (!Number.isSafeInteger(quantity) || quantity < 1) {
    return err({ code: "invalid-quantity" });
  }
  if (!Number.isSafeInteger(unitPriceCents * quantity)) {
    return err({ code: "line-total-overflow" });
  }
  return ok({
    id: trimmedId,
    name: trimmedName,
    unitPriceCents,
    quantity,
  });
}

export function copyCartItem(item: CartItem): CartItem {
  return {
    id: item.id,
    name: item.name,
    unitPriceCents: item.unitPriceCents,
    quantity: item.quantity,
  };
}
