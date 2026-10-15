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
  if (id.trim() === "") {
    throw new Error("Item id must not be empty.");
  }
  if (name.trim() === "") {
    throw new Error("Item name must not be empty.");
  }
  if (!Number.isInteger(unitPriceCents) || unitPriceCents < 0) {
    throw new Error("Unit price must be a non-negative whole number of cents.");
  }
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new Error("Quantity must be a positive whole number.");
  }
  return { id, name, unitPriceCents, quantity };
}

export function lineTotalCents(item: CartItem): number {
  return item.unitPriceCents * item.quantity;
}
