import { CartError } from "./cart-error";

export interface CartItem {
  readonly id: string;
  readonly name: string;
  readonly unitPriceCents: number;
  readonly quantity: number;
}

export function createCartItem(input: CartItem): CartItem {
  const id = input.id.trim();
  const name = input.name.trim();
  if (id.length === 0) {
    throw new CartError("Item id must not be empty.");
  }
  if (name.length === 0) {
    throw new CartError("Item name must not be empty.");
  }
  if (!Number.isSafeInteger(input.unitPriceCents) || input.unitPriceCents < 0) {
    throw new CartError("Unit price must be a non-negative integer number of cents.");
  }
  if (!Number.isSafeInteger(input.quantity) || input.quantity < 1) {
    throw new CartError("Quantity must be a positive integer.");
  }
  const item: CartItem = {
    id,
    name,
    unitPriceCents: input.unitPriceCents,
    quantity: input.quantity,
  };
  lineTotalCents(item);
  return Object.freeze(item);
}

export function copyCartItem(item: CartItem): CartItem {
  return Object.freeze({
    id: item.id,
    name: item.name,
    unitPriceCents: item.unitPriceCents,
    quantity: item.quantity,
  });
}

export function lineTotalCents(item: CartItem): number {
  const total = item.quantity * item.unitPriceCents;
  if (!Number.isSafeInteger(total)) {
    throw new CartError("Line total is outside the safe integer range.");
  }
  return total;
}

export function assertSafeCartTotal(items: readonly CartItem[]): number {
  let total = 0;
  for (const item of items) {
    total += lineTotalCents(item);
    if (!Number.isSafeInteger(total)) {
      throw new CartError("Cart total is outside the safe integer range.");
    }
  }
  return total;
}
