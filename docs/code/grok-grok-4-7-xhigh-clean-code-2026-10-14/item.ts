import { CartError } from "./cart-error";

const MINIMUM_QUANTITY = 1;
const MINIMUM_UNIT_PRICE_IN_CENTS = 0;

export interface Item {
  readonly id: string;
  readonly name: string;
  readonly unitPriceInCents: number;
  readonly quantity: number;
}

export function createItem(input: Item): Item {
  const item: Item = {
    id: normalizeItemId(input.id),
    name: requireName(input.name),
    unitPriceInCents: requireUnitPrice(input.unitPriceInCents),
    quantity: requireQuantity(input.quantity),
  };
  requireSafeLineTotal(item);
  return Object.freeze(item);
}

export function normalizeItemId(itemId: string): string {
  return requireText(itemId, "Item id");
}

export function lineTotalInCents(item: Item): number {
  return item.unitPriceInCents * item.quantity;
}

function requireSafeLineTotal(item: Item): void {
  if (Number.isSafeInteger(lineTotalInCents(item))) {
    return;
  }
  throw new CartError("Line total is too large.");
}

function requireName(value: string): string {
  return requireText(value, "Item name");
}

function requireUnitPrice(value: number): number {
  return requireWholeNumber(
    value,
    "Unit price in cents",
    MINIMUM_UNIT_PRICE_IN_CENTS,
  );
}

function requireQuantity(value: number): number {
  return requireWholeNumber(value, "Quantity", MINIMUM_QUANTITY);
}

function requireText(value: string, label: string): string {
  if (typeof value !== "string") {
    throw new CartError(`${label} must be text.`);
  }
  const text = value.trim();
  if (text.length === 0) {
    throw new CartError(`${label} is required.`);
  }
  return text;
}

function requireWholeNumber(
  value: number,
  label: string,
  minimum: number,
): number {
  if (typeof value !== "number" || !Number.isInteger(value)) {
    throw new CartError(`${label} must be a whole number.`);
  }
  if (value < minimum) {
    throw new CartError(`${label} must be at least ${minimum}.`);
  }
  if (!Number.isSafeInteger(value)) {
    throw new CartError(`${label} is too large.`);
  }
  return value;
}
