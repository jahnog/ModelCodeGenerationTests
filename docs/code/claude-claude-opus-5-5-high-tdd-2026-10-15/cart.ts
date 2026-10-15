export interface CartItem {
  readonly name: string;
  /** Unit price in cents, so money math stays exact. */
  readonly priceCents: number;
  readonly quantity: number;
}

export class CartError extends Error {
  override name = "CartError";
}

/** Formats a whole number of cents as dollars, e.g. 1250 -> "$12.50". */
export function formatPrice(cents: number): string {
  return `$${Math.floor(cents / 100)}.${String(cents % 100).padStart(2, "0")}`;
}

function checkQuantity(quantity: number): void {
  if (!Number.isSafeInteger(quantity) || quantity < 1) {
    throw new CartError("Item quantity must be a whole number >= 1.");
  }
}

export class ShoppingCart {
  /** Keyed by lower-cased name; a Map keeps insertion order. */
  private readonly items = new Map<string, CartItem>();

  addItem(name: string, priceCents: number, quantity = 1): void {
    const trimmed = name.trim();
    if (trimmed === "") throw new CartError("Item name must not be empty.");
    if (!Number.isSafeInteger(priceCents) || priceCents < 0) {
      throw new CartError("Item price must be a whole number of cents >= 0.");
    }
    checkQuantity(quantity);

    const key = trimmed.toLowerCase();
    const existing = this.items.get(key);
    if (existing === undefined) {
      this.items.set(key, { name: trimmed, priceCents, quantity });
      return;
    }
    if (existing.priceCents !== priceCents) {
      throw new CartError(`"${existing.name}" is already in the cart at ${formatPrice(existing.priceCents)}.`);
    }
    this.items.set(key, { ...existing, quantity: existing.quantity + quantity });
  }

  /** Removes `quantity` units of the item, or the whole item when `quantity` is omitted. */
  removeItem(name: string, quantity?: number): void {
    const key = name.trim().toLowerCase();
    const existing = this.items.get(key);
    if (existing === undefined) throw new CartError(`"${name.trim()}" is not in the cart.`);
    if (quantity === undefined || quantity === existing.quantity) {
      this.items.delete(key);
      return;
    }
    checkQuantity(quantity);
    if (quantity > existing.quantity) {
      throw new CartError(`The cart has only ${existing.quantity} of "${existing.name}".`);
    }
    this.items.set(key, { ...existing, quantity: existing.quantity - quantity });
  }

  getItems(): CartItem[] {
    return [...this.items.values()];
  }

  getTotalCents(): number {
    return this.getItems().reduce((sum, item) => sum + item.priceCents * item.quantity, 0);
  }
}

/** Renders the cart as numbered lines with subtotals, followed by the total. */
export function formatCart(cart: ShoppingCart): string {
  const items = cart.getItems();
  if (items.length === 0) return "The cart is empty.";
  const nameWidth = Math.max(...items.map((item) => item.name.length));
  const lines = items.map(
    (item, index) =>
      `${index + 1}. ${item.name.padEnd(nameWidth)} - ${item.quantity} x ${formatPrice(item.priceCents)}` +
      ` = ${formatPrice(item.priceCents * item.quantity)}`,
  );
  return [...lines, `Total: ${formatPrice(cart.getTotalCents())}`].join("\n");
}
