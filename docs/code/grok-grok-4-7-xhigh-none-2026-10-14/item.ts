export interface CartItem {
  readonly id: string;
  readonly name: string;
  readonly unitPriceCents: number;
  readonly quantity: number;
}

export function createItem(
  id: string,
  name: string,
  unitPriceCents: number,
  quantity: number,
): CartItem {
  const item: CartItem = { id, name, unitPriceCents, quantity };
  assertValidItem(item);
  return item;
}

export function assertValidItem(item: CartItem): void {
  if (item.id.trim().length === 0) {
    throw new Error("Item id must not be empty.");
  }
  if (item.name.trim().length === 0) {
    throw new Error("Item name must not be empty.");
  }
  if (!Number.isInteger(item.unitPriceCents) || item.unitPriceCents < 0) {
    throw new Error("Unit price must be a non-negative integer number of cents.");
  }
  if (!Number.isInteger(item.quantity) || item.quantity < 1) {
    throw new Error("Quantity must be a positive integer.");
  }
  if (!Number.isSafeInteger(item.quantity * item.unitPriceCents)) {
    throw new Error("Line total is outside the safe integer range.");
  }
}
