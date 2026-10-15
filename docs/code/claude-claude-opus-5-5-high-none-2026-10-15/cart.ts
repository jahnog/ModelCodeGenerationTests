/** A product that can be put in the cart. Prices are in cents to avoid floating-point rounding. */
export interface Product {
  readonly id: string;
  readonly name: string;
  readonly priceCents: number;
}

/** A product in the cart together with how many units of it the cart holds. */
export interface CartItem {
  readonly product: Product;
  readonly quantity: number;
}

export class ShoppingCart {
  // A Map keeps insertion order, so items are shown in the order they were first added.
  private readonly items = new Map<string, CartItem>();

  /** Adds `quantity` units of `product`. Adding a product already in the cart increases its quantity. */
  addItem(product: Product, quantity = 1): void {
    assertPositiveInteger(quantity, "quantity");
    assertNonNegativeInteger(product.priceCents, "priceCents");

    const existing = this.items.get(product.id);
    this.items.set(product.id, {
      product,
      quantity: (existing?.quantity ?? 0) + quantity,
    });
  }

  /**
   * Removes `quantity` units of the product with `productId`, or all units when `quantity` is omitted.
   * Returns false when the product is not in the cart.
   */
  removeItem(productId: string, quantity?: number): boolean {
    if (quantity !== undefined) {
      assertPositiveInteger(quantity, "quantity");
    }

    const existing = this.items.get(productId);
    if (existing === undefined) {
      return false;
    }

    if (quantity === undefined || quantity >= existing.quantity) {
      this.items.delete(productId);
      return true;
    }

    this.items.set(productId, { ...existing, quantity: existing.quantity - quantity });
    return true;
  }

  /** Returns the items in the cart, in the order they were first added. */
  getItems(): readonly CartItem[] {
    return [...this.items.values()];
  }

  /** Returns the total price of everything in the cart, in cents. */
  getTotalCents(): number {
    let total = 0;
    for (const { product, quantity } of this.items.values()) {
      total += product.priceCents * quantity;
    }
    return total;
  }

  isEmpty(): boolean {
    return this.items.size === 0;
  }
}

/** Formats an amount in cents as dollars, for example 1999 as "$19.99". */
export function formatPrice(cents: number): string {
  const dollars = Math.floor(cents / 100);
  const rest = String(cents % 100).padStart(2, "0");
  return `$${dollars}.${rest}`;
}

/** Returns the lines that describe the contents of `cart`, ready to print. */
export function describeCart(cart: ShoppingCart): string[] {
  if (cart.isEmpty()) {
    return ["The shopping cart is empty."];
  }

  const lines = ["Shopping cart:"];
  for (const { product, quantity } of cart.getItems()) {
    const subtotal = formatPrice(product.priceCents * quantity);
    lines.push(`  ${quantity} x ${product.name} (${formatPrice(product.priceCents)} each) = ${subtotal}`);
  }
  lines.push(`Total: ${formatPrice(cart.getTotalCents())}`);
  return lines;
}

function assertPositiveInteger(value: number, name: string): void {
  if (!Number.isInteger(value) || value <= 0) {
    throw new RangeError(`${name} must be a positive integer, got ${value}`);
  }
}

function assertNonNegativeInteger(value: number, name: string): void {
  if (!Number.isInteger(value) || value < 0) {
    throw new RangeError(`${name} must be a non-negative integer, got ${value}`);
  }
}
