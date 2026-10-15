// Feature slice: add an item to the cart.
// Adding a product that is already in the cart increases its quantity.

import type { CartItem, CartStore } from "../../shared/cart";
import { fail, ok, type Result } from "../../shared/result";

export interface AddItemCommand {
  readonly productId: string;
  readonly name: string;
  readonly unitPriceCents: number;
  readonly quantity?: number;
}

function validate(command: AddItemCommand, quantity: number): string | undefined {
  if (command.productId.trim() === "") return "Product id is required.";
  if (command.name.trim() === "") return "Product name is required.";
  if (!Number.isInteger(command.unitPriceCents) || command.unitPriceCents < 0) {
    return "Unit price must be a whole number of cents, zero or more.";
  }
  if (!Number.isInteger(quantity) || quantity < 1) {
    return "Quantity must be a whole number, one or more.";
  }
  return undefined;
}

export function addItem(store: CartStore, command: AddItemCommand): Result<CartItem> {
  const quantity = command.quantity ?? 1;
  const error = validate(command, quantity);
  if (error !== undefined) return fail(error);

  const productId = command.productId.trim();
  const existing = store.find(productId);
  if (existing !== undefined && existing.unitPriceCents !== command.unitPriceCents) {
    return fail(`"${existing.name}" is already in the cart at a different price.`);
  }

  const item: CartItem = {
    productId,
    name: existing?.name ?? command.name.trim(),
    unitPriceCents: command.unitPriceCents,
    quantity: (existing?.quantity ?? 0) + quantity,
  };
  store.save(item);
  return ok(item);
}
