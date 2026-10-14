// Slice: remove an item from the shopping cart.
// The request, the checks, and the response live in this file.
// This slice does not import the other slices.

import { copyCartLine, type ShoppingCart } from "../shared/shopping-cart";

export interface RemoveItemFromCartRequest {
  readonly productId: string;
}

export type RemoveItemFromCartResponse =
  | {
      readonly ok: true;
      readonly cart: ShoppingCart;
      readonly removedProductId: string;
      readonly removedName: string;
      readonly removedQuantity: number;
      readonly message: string;
    }
  | {
      readonly ok: false;
      readonly message: string;
    };

export function removeItemFromCart(
  cart: ShoppingCart,
  request: RemoveItemFromCartRequest,
): RemoveItemFromCartResponse {
  const productId = request.productId.trim();
  if (productId.length === 0) {
    return { ok: false, message: "Product id must not be empty." };
  }

  const removed = cart.find((line) => line.productId === productId);
  if (removed === undefined) {
    return { ok: false, message: `Item "${productId}" is not in the cart.` };
  }

  return {
    ok: true,
    cart: cart.filter((line) => line.productId !== productId).map(copyCartLine),
    removedProductId: removed.productId,
    removedName: removed.name,
    removedQuantity: removed.quantity,
    message: `Removed ${removed.quantity} x ${removed.name} (${removed.productId}).`,
  };
}
