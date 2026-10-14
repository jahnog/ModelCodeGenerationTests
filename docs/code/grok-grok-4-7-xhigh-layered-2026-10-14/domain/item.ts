import { AmountOverflowError, InvalidItemError } from "./errors";

export type ItemDraft = {
  readonly id: string;
  readonly name: string;
  readonly unitPriceCents: number;
  readonly quantity: number;
};

export type Item = {
  readonly id: string;
  readonly name: string;
  readonly unitPriceCents: number;
  readonly quantity: number;
};

export function normalizeItemId(id: string): string {
  return requireText(id, "Item id");
}

export function createItem(draft: ItemDraft): Item {
  const item: Item = {
    id: normalizeItemId(draft.id),
    name: requireText(draft.name, "Item name"),
    unitPriceCents: requireCents(draft.unitPriceCents),
    quantity: requireQuantity(draft.quantity),
  };
  Object.freeze(item);
  return item;
}

export function lineTotalCents(item: Item): number {
  const total = item.unitPriceCents * item.quantity;
  if (!Number.isSafeInteger(total) || total < 0) {
    throw new AmountOverflowError("Line total is outside the safe integer range.");
  }
  return total;
}

function requireText(value: string, label: string): string {
  if (typeof value !== "string") {
    throw new InvalidItemError(`${label} must be text.`);
  }
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    throw new InvalidItemError(`${label} must not be empty.`);
  }
  return trimmed;
}

function requireCents(value: number): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0) {
    throw new InvalidItemError("Unit price must be a non-negative integer number of cents.");
  }
  return value;
}

function requireQuantity(value: number): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 1) {
    throw new InvalidItemError("Quantity must be a positive integer.");
  }
  return value;
}
