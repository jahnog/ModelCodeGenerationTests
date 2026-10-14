export class CartError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CartError";
  }
}

export interface CartItem {
  readonly id: string;
  readonly name: string;
  readonly unitPriceCents: number;
  readonly quantity: number;
}

export interface NewCartItem {
  readonly id: string;
  readonly name: string;
  readonly unitPriceCents: number;
  readonly quantity: number;
}

export interface CartLine {
  readonly id: string;
  readonly name: string;
  readonly unitPriceCents: number;
  readonly quantity: number;
  readonly lineTotalCents: number;
}

export function createCartItem(input: NewCartItem): CartItem {
  const id = input.id.trim();
  const name = input.name.trim();
  if (id.length === 0) {
    throw new CartError("Item id must not be empty.");
  }
  if (name.length === 0) {
    throw new CartError("Item name must not be empty.");
  }
  if (!Number.isInteger(input.unitPriceCents) || input.unitPriceCents < 0) {
    throw new CartError("Unit price must be a non-negative integer number of cents.");
  }
  if (!Number.isInteger(input.quantity) || input.quantity < 1) {
    throw new CartError("Quantity must be a positive integer.");
  }
  const lineTotalCents = input.quantity * input.unitPriceCents;
  if (!Number.isSafeInteger(lineTotalCents)) {
    throw new CartError("Line total is outside the safe integer range.");
  }
  return {
    id,
    name,
    unitPriceCents: input.unitPriceCents,
    quantity: input.quantity,
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

export function toCartLine(item: CartItem): CartLine {
  return {
    id: item.id,
    name: item.name,
    unitPriceCents: item.unitPriceCents,
    quantity: item.quantity,
    lineTotalCents: item.quantity * item.unitPriceCents,
  };
}
