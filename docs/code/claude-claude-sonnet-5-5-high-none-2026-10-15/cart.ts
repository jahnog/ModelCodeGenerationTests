export interface CartItem {
  readonly id: string;
  readonly name: string;
  /** Price of one unit, in cents, so totals stay exact. */
  readonly unitPriceCents: number;
  readonly quantity: number;
}

export type NewItem = Omit<CartItem, "quantity"> & { readonly quantity?: number };

export type Cart = readonly CartItem[];

export const emptyCart: Cart = [];

function assertPositiveInteger(value: number, label: string): void {
  if (!Number.isInteger(value) || value <= 0) {
    throw new RangeError(`${label} must be a positive whole number, got ${value}`);
  }
}

/** Returns a new cart with the item added. Adding an id already in the cart increases its quantity. */
export function addItem(cart: Cart, item: NewItem): Cart {
  const quantity = item.quantity ?? 1;
  assertPositiveInteger(quantity, "quantity");
  if (!Number.isInteger(item.unitPriceCents) || item.unitPriceCents < 0) {
    throw new RangeError(`unitPriceCents must be a non-negative whole number, got ${item.unitPriceCents}`);
  }

  const existing = cart.find((entry) => entry.id === item.id);
  if (existing === undefined) {
    return [...cart, { id: item.id, name: item.name, unitPriceCents: item.unitPriceCents, quantity }];
  }
  return cart.map((entry) =>
    entry.id === item.id ? { ...entry, quantity: entry.quantity + quantity } : entry,
  );
}

/**
 * Returns a new cart with the item removed.
 * Without a quantity the whole line is removed; with one, that many units are taken off.
 * Throws if the id is not in the cart.
 */
export function removeItem(cart: Cart, id: string, quantity?: number): Cart {
  const existing = cart.find((entry) => entry.id === id);
  if (existing === undefined) {
    throw new Error(`Item "${id}" is not in the cart`);
  }
  if (quantity === undefined || quantity >= existing.quantity) {
    return cart.filter((entry) => entry.id !== id);
  }
  assertPositiveInteger(quantity, "quantity");
  return cart.map((entry) =>
    entry.id === id ? { ...entry, quantity: entry.quantity - quantity } : entry,
  );
}

export function totalCents(cart: Cart): number {
  return cart.reduce((sum, entry) => sum + entry.unitPriceCents * entry.quantity, 0);
}

export function formatMoney(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

/** Builds a printable listing of the cart. */
export function formatCart(cart: Cart): string {
  if (cart.length === 0) {
    return "The shopping cart is empty.";
  }
  const lines = cart.map(
    (entry) =>
      `${entry.quantity} x ${entry.name} (${entry.id}) @ ${formatMoney(entry.unitPriceCents)}` +
      ` = ${formatMoney(entry.unitPriceCents * entry.quantity)}`,
  );
  return [...lines, `Total: ${formatMoney(totalCents(cart))}`].join("\n");
}

/** Prints the items in the cart. */
export function showCart(cart: Cart): void {
  console.log(formatCart(cart));
}
