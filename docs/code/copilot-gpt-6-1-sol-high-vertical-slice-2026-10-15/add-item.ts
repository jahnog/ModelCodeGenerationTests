import type { CartItem, ShoppingCart } from "./cart";

export interface AddItemCommand {
  readonly id: string;
  readonly name: string;
  readonly unitPriceCents: number;
  readonly quantity?: number;
}

/** Adds a new item or increases the quantity of an identical product. */
export function addItem(
  cart: ShoppingCart,
  command: AddItemCommand,
): ShoppingCart {
  if (command.id.trim().length === 0) {
    throw new Error("Item ID must not be empty.");
  }
  if (command.name.trim().length === 0) {
    throw new Error("Item name must not be empty.");
  }
  if (
    !Number.isSafeInteger(command.unitPriceCents) ||
    command.unitPriceCents < 0
  ) {
    throw new RangeError("Unit price must be a nonnegative safe integer in cents.");
  }

  const quantity = command.quantity ?? 1;
  if (!Number.isSafeInteger(quantity) || quantity <= 0) {
    throw new RangeError("Quantity must be a positive safe integer.");
  }

  const existing = cart.items.find((item) => item.id === command.id);
  if (
    existing !== undefined &&
    (existing.name !== command.name ||
      existing.unitPriceCents !== command.unitPriceCents)
  ) {
    throw new Error("An existing item ID must keep the same name and unit price.");
  }

  const nextQuantity = (existing?.quantity ?? 0) + quantity;
  if (!Number.isSafeInteger(nextQuantity)) {
    throw new RangeError("Combined quantity exceeds the safe integer limit.");
  }

  const addedItem: CartItem = {
    id: command.id,
    name: command.name,
    unitPriceCents: command.unitPriceCents,
    quantity: nextQuantity,
  };

  return {
    items:
      existing === undefined
        ? [...cart.items, addedItem]
        : cart.items.map((item) => (item.id === command.id ? addedItem : item)),
  };
}
