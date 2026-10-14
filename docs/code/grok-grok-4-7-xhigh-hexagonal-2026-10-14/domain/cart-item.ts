import { CartError } from "./cart-error";

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
): CartItem {
  const trimmedId = id.trim();
  const trimmedName = name.trim();
  if (trimmedId.length === 0) {
    throw new CartError("empty-id", "Item id must not be empty.");
  }
  if (trimmedName.length === 0) {
    throw new CartError("empty-name", "Item name must not be empty.");
  }
  if (!Number.isSafeInteger(unitPriceCents) || unitPriceCents < 0) {
    throw new CartError(
      "invalid-price",
      "Unit price must be a non-negative integer number of cents.",
    );
  }
  if (!Number.isSafeInteger(quantity) || quantity < 1) {
    throw new CartError("invalid-quantity", "Quantity must be a positive integer.");
  }
  if (!Number.isSafeInteger(unitPriceCents * quantity)) {
    throw new CartError("unsafe-total", "Line total is outside the safe integer range.");
  }
  return {
    id: trimmedId,
    name: trimmedName,
    unitPriceCents,
    quantity,
  };
}

export function copyCartItem(item: CartItem): CartItem {
  return {
    id: item.id,
    name: item.name,
    unitPriceCents: item.unitPriceCents,
    quantity: item.quantity,
  };
}
