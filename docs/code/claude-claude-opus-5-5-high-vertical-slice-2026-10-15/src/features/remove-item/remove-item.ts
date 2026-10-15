// Feature slice: remove an item from the cart.
// Without a quantity the whole line is removed; with one, only that many units.

import type { CartStore } from "../../shared/cart";
import { fail, ok, type Result } from "../../shared/result";

export interface RemoveItemCommand {
  readonly productId: string;
  readonly quantity?: number;
}

export interface RemoveItemOutcome {
  readonly productId: string;
  readonly removedQuantity: number;
  readonly remainingQuantity: number;
}

export function removeItem(store: CartStore, command: RemoveItemCommand): Result<RemoveItemOutcome> {
  const productId = command.productId.trim();
  const existing = store.find(productId);
  if (existing === undefined) return fail(`Product "${productId}" is not in the cart.`);

  const quantity = command.quantity ?? existing.quantity;
  if (!Number.isInteger(quantity) || quantity < 1) {
    return fail("Quantity must be a whole number, one or more.");
  }
  if (quantity > existing.quantity) {
    return fail(`The cart only holds ${existing.quantity} of "${existing.name}".`);
  }

  const remainingQuantity = existing.quantity - quantity;
  if (remainingQuantity === 0) {
    store.delete(productId);
  } else {
    store.save({ ...existing, quantity: remainingQuantity });
  }
  return ok({ productId, removedQuantity: quantity, remainingQuantity });
}
