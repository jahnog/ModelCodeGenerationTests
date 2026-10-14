import { err, ok, type Result } from "./result";

export type Item = {
  readonly id: string;
  readonly name: string;
  readonly unitPriceCents: number;
  readonly quantity: number;
};

export type ItemError =
  | { readonly kind: "empty-id" }
  | { readonly kind: "empty-name" }
  | { readonly kind: "invalid-price" }
  | { readonly kind: "invalid-quantity" }
  | { readonly kind: "unsafe-line-total" };

export const createItem = (input: Item): Result<Item, ItemError> => {
  const id = input.id.trim();
  const name = input.name.trim();
  if (id.length === 0) {
    return err({ kind: "empty-id" });
  }
  if (name.length === 0) {
    return err({ kind: "empty-name" });
  }
  if (!Number.isInteger(input.unitPriceCents) || input.unitPriceCents < 0) {
    return err({ kind: "invalid-price" });
  }
  if (!Number.isInteger(input.quantity) || input.quantity < 1) {
    return err({ kind: "invalid-quantity" });
  }
  if (!Number.isSafeInteger(input.unitPriceCents * input.quantity)) {
    return err({ kind: "unsafe-line-total" });
  }
  return ok({
    id,
    name,
    unitPriceCents: input.unitPriceCents,
    quantity: input.quantity,
  });
};
