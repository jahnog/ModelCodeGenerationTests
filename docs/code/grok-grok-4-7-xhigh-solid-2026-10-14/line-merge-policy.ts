import { CartError } from "./cart-error";
import { createCartItem, type CartItem } from "./cart-item";

/** How a second add of the same id combines with the line already in the cart. */
export interface LineMergePolicy {
  /** Returns a new item for this id, or throws CartError. Does not mutate either input. */
  merge(current: CartItem, incoming: CartItem): CartItem;
}

export class SumQuantityMergePolicy implements LineMergePolicy {
  merge(current: CartItem, incoming: CartItem): CartItem {
    if (current.name !== incoming.name || current.unitPriceCents !== incoming.unitPriceCents) {
      throw new CartError(
        `Item "${incoming.id}" is already in the cart with a different name or price.`,
      );
    }
    const quantity = current.quantity + incoming.quantity;
    if (!Number.isSafeInteger(quantity)) {
      throw new CartError("Quantity is outside the safe integer range.");
    }
    return createCartItem({
      id: current.id,
      name: current.name,
      unitPriceCents: current.unitPriceCents,
      quantity,
    });
  }
}
