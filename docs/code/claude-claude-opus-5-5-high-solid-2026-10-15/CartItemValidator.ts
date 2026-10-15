import type { CartItem } from "./CartItem";

/** Checks that an item may enter the cart. Throws when it may not. */
export interface CartItemValidator {
  validate(item: CartItem): void;
}

export class BasicCartItemValidator implements CartItemValidator {
  validate(item: CartItem): void {
    if (item.id.trim() === "") {
      throw new Error("Item id must not be empty.");
    }
    if (item.name.trim() === "") {
      throw new Error("Item name must not be empty.");
    }
    if (!Number.isInteger(item.unitPriceCents) || item.unitPriceCents < 0) {
      throw new Error(`Invalid price for "${item.name}": must be a non-negative integer number of cents.`);
    }
    if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
      throw new Error(`Invalid quantity for "${item.name}": must be a positive integer.`);
    }
  }
}
