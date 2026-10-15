import { InvalidPriceError, InvalidQuantityError } from "./errors";

export interface CartItem {
  readonly productId: string;
  readonly name: string;
  readonly unitPriceInCents: number;
  readonly quantity: number;
}

export function createCartItem(
  productId: string,
  name: string,
  unitPriceInCents: number,
  quantity: number,
): CartItem {
  if (!Number.isInteger(unitPriceInCents) || unitPriceInCents < 0) {
    throw new InvalidPriceError(unitPriceInCents);
  }
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new InvalidQuantityError(quantity);
  }
  return { productId, name, unitPriceInCents, quantity };
}

export function lineTotalInCents(item: CartItem): number {
  return item.unitPriceInCents * item.quantity;
}
