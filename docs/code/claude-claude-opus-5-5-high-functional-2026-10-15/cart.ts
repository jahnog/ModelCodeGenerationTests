// Pure cart operations. Each function returns a new cart and leaves its input untouched.

import { type Cart, type CartError, type Item, type Result, err, ok } from "./types";

export const emptyCart: Cart = { items: [] };

const validateItem = (item: Item): Result<Item, CartError> => {
  if (item.id.trim() === "") return err({ kind: "invalid-item", reason: "id must not be empty" });
  if (item.name.trim() === "") return err({ kind: "invalid-item", reason: "name must not be empty" });
  if (!Number.isInteger(item.priceCents) || item.priceCents < 0)
    return err({ kind: "invalid-item", reason: "price must be a non-negative whole number of cents" });
  if (!Number.isInteger(item.quantity) || item.quantity < 1)
    return err({ kind: "invalid-item", reason: "quantity must be a positive whole number" });
  return ok(item);
};

const hasItem = (cart: Cart, id: string): boolean => cart.items.some((item) => item.id === id);

// Adding an id that is already in the cart increases that line's quantity.
export const addItem = (cart: Cart, item: Item): Result<Cart, CartError> => {
  const validated = validateItem(item);
  if (!validated.ok) return validated;
  const added = validated.value;
  return ok({
    items: hasItem(cart, added.id)
      ? cart.items.map((line) =>
          line.id === added.id ? { ...line, quantity: line.quantity + added.quantity } : line,
        )
      : [...cart.items, added],
  });
};

export const removeItem = (cart: Cart, id: string): Result<Cart, CartError> =>
  hasItem(cart, id)
    ? ok({ items: cart.items.filter((item) => item.id !== id) })
    : err({ kind: "item-not-found", id });

export const lineTotalCents = (item: Item): number => item.priceCents * item.quantity;

export const cartTotalCents = (cart: Cart): number =>
  cart.items.reduce((sum, item) => sum + lineTotalCents(item), 0);

export const formatMoney = (cents: number): string =>
  `$${Math.floor(cents / 100)}.${String(cents % 100).padStart(2, "0")}`;

const formatLine = (item: Item, index: number): string =>
  `${index + 1}. ${item.name} (${item.id}) x${item.quantity} @ ${formatMoney(item.priceCents)} = ${formatMoney(lineTotalCents(item))}`;

export const formatCart = (cart: Cart): string =>
  cart.items.length === 0
    ? "The cart is empty."
    : [...cart.items.map(formatLine), `Total: ${formatMoney(cartTotalCents(cart))}`].join("\n");

export const formatError = (error: CartError): string => {
  switch (error.kind) {
    case "invalid-item":
      return `Invalid item: ${error.reason}`;
    case "item-not-found":
      return `No item with id "${error.id}" is in the cart`;
  }
};
