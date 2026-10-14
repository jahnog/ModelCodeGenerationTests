// Entity. The cart adds a line, lists lines, and removes a line. It does not know how it is stored or shown.

import type { CartError } from "./domain-cart-error";
import {
  copyCartItem,
  createCartItem,
  type CartItem,
} from "./domain-entity-cart-item";
import { err, ok, type Result } from "./domain-result";

export interface ShoppingCart {
  readonly items: readonly CartItem[];
}

export interface CartItemUpdate {
  readonly cart: ShoppingCart;
  readonly item: CartItem;
}

export function createShoppingCart(): ShoppingCart {
  return { items: [] };
}

export function copyShoppingCart(cart: ShoppingCart): ShoppingCart {
  return {
    items: cart.items.map((item) => copyCartItem(item)),
  };
}

export function listCartItems(cart: ShoppingCart): readonly CartItem[] {
  return copyShoppingCart(cart).items;
}

export function addCartItem(
  cart: ShoppingCart,
  item: CartItem,
): Result<CartItemUpdate, CartError> {
  const validated = createCartItem(
    item.id,
    item.name,
    item.unitPriceCents,
    item.quantity,
  );
  if (!validated.ok) {
    return err(validated.error);
  }
  const incoming = validated.value;
  const existing = findItem(cart, incoming.id);
  if (existing === undefined) {
    return accept([...cart.items, incoming], incoming);
  }
  if (
    existing.name !== incoming.name ||
    existing.unitPriceCents !== incoming.unitPriceCents
  ) {
    return err({ code: "item-conflict", itemId: incoming.id });
  }
  const quantity = existing.quantity + incoming.quantity;
  if (!Number.isSafeInteger(quantity)) {
    return err({ code: "invalid-quantity" });
  }
  const merged = createCartItem(
    existing.id,
    existing.name,
    existing.unitPriceCents,
    quantity,
  );
  if (!merged.ok) {
    return err(merged.error);
  }
  const items = cart.items.map((line) =>
    line.id === incoming.id ? merged.value : line,
  );
  return accept(items, merged.value);
}

export function removeCartItem(
  cart: ShoppingCart,
  itemId: string,
): Result<CartItemUpdate, CartError> {
  const id = itemId.trim();
  if (id.length === 0) {
    return err({ code: "empty-id" });
  }
  const existing = findItem(cart, id);
  if (existing === undefined) {
    return err({ code: "item-not-found", itemId: id });
  }
  const items = cart.items.filter((line) => line.id !== id);
  return ok({
    cart: { items: items.map((line) => copyCartItem(line)) },
    item: copyCartItem(existing),
  });
}

function findItem(cart: ShoppingCart, id: string): CartItem | undefined {
  return cart.items.find((line) => line.id === id);
}

function accept(
  items: readonly CartItem[],
  item: CartItem,
): Result<CartItemUpdate, CartError> {
  if (!cartTotalIsSafe(items)) {
    return err({ code: "cart-total-overflow" });
  }
  return ok({
    cart: { items: items.map((line) => copyCartItem(line)) },
    item: copyCartItem(item),
  });
}

function cartTotalIsSafe(items: readonly CartItem[]): boolean {
  let total = 0;
  for (const line of items) {
    total += line.unitPriceCents * line.quantity;
    if (!Number.isSafeInteger(total)) {
      return false;
    }
  }
  return true;
}
