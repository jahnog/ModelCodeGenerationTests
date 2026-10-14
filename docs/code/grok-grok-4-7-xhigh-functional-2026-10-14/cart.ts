import { createItem, type Item, type ItemError } from "./item";
import { err, flatMap, ok, type Result } from "./result";

export type Cart = {
  readonly items: readonly Item[];
};

export type CartError =
  | ItemError
  | { readonly kind: "conflicting-item"; readonly id: string }
  | { readonly kind: "missing-item"; readonly id: string }
  | { readonly kind: "unsafe-quantity" };

export const emptyCart = (): Cart => ({ items: [] });

export const itemsOf = (cart: Cart): readonly Item[] =>
  cart.items.map((item) => ({
    id: item.id,
    name: item.name,
    unitPriceCents: item.unitPriceCents,
    quantity: item.quantity,
  }));

const sameProduct = (left: Item, right: Item): boolean =>
  left.name === right.name && left.unitPriceCents === right.unitPriceCents;

const withQuantity = (item: Item, quantity: number): Item => ({
  id: item.id,
  name: item.name,
  unitPriceCents: item.unitPriceCents,
  quantity,
});

const insertItem = (cart: Cart, item: Item): Result<Cart, CartError> => {
  const current = cart.items.find((candidate) => candidate.id === item.id);
  if (current === undefined) {
    return ok({ items: [...cart.items, item] });
  }
  if (!sameProduct(current, item)) {
    return err({ kind: "conflicting-item", id: item.id });
  }
  const quantity = current.quantity + item.quantity;
  if (!Number.isSafeInteger(quantity)) {
    return err({ kind: "unsafe-quantity" });
  }
  if (!Number.isSafeInteger(current.unitPriceCents * quantity)) {
    return err({ kind: "unsafe-line-total" });
  }
  const updated = withQuantity(current, quantity);
  return ok({
    items: cart.items.map((candidate) => (candidate.id === item.id ? updated : candidate)),
  });
};

export const addItem = (cart: Cart, input: Item): Result<Cart, CartError> =>
  flatMap(createItem(input), (item) => insertItem(cart, item));

export const removeItem = (cart: Cart, id: string): Result<Cart, CartError> => {
  const itemId = id.trim();
  if (itemId.length === 0) {
    return err({ kind: "empty-id" });
  }
  const items = cart.items.filter((item) => item.id !== itemId);
  if (items.length === cart.items.length) {
    return err({ kind: "missing-item", id: itemId });
  }
  return ok({ items });
};
