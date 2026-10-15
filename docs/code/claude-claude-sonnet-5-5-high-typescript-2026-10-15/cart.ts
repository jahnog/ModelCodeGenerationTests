export interface Product {
  readonly id: string;
  readonly name: string;
  /** Unit price in cents, so money math stays in integers. */
  readonly priceInCents: number;
}

export interface CartItem {
  readonly product: Product;
  readonly quantity: number;
}

export class CartError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CartError";
  }
}

function assertPositiveInteger(value: number, label: string): void {
  if (!Number.isSafeInteger(value) || value < 1) {
    throw new CartError(`${label} must be a positive integer, got ${value}.`);
  }
}

export class Cart {
  readonly #items = new Map<string, CartItem>();

  /** Adds `quantity` units of a product. Adding an existing product increases its quantity. */
  add(product: Product, quantity = 1): void {
    assertPositiveInteger(quantity, "Quantity");
    if (!Number.isSafeInteger(product.priceInCents) || product.priceInCents < 0) {
      throw new CartError(
        `Price of "${product.name}" must be a non-negative integer number of cents.`,
      );
    }

    const existing = this.#items.get(product.id);
    this.#items.set(product.id, {
      product: existing?.product ?? product,
      quantity: (existing?.quantity ?? 0) + quantity,
    });
  }

  /**
   * Removes a product from the cart. Without `quantity` the whole line is
   * removed; with it, that many units are removed and the line is dropped when
   * it reaches zero.
   */
  remove(productId: string, quantity?: number): void {
    const existing = this.#items.get(productId);
    if (existing === undefined) {
      throw new CartError(`Product "${productId}" is not in the cart.`);
    }

    if (quantity === undefined || quantity === existing.quantity) {
      this.#items.delete(productId);
      return;
    }

    assertPositiveInteger(quantity, "Quantity");
    if (quantity > existing.quantity) {
      throw new CartError(
        `Cannot remove ${quantity} of "${existing.product.name}"; only ${existing.quantity} in the cart.`,
      );
    }
    this.#items.set(productId, { ...existing, quantity: existing.quantity - quantity });
  }

  /** A snapshot of the cart lines in insertion order. */
  list(): readonly CartItem[] {
    return [...this.#items.values()];
  }

  get isEmpty(): boolean {
    return this.#items.size === 0;
  }

  get totalInCents(): number {
    let total = 0;
    for (const { product, quantity } of this.#items.values()) {
      total += product.priceInCents * quantity;
    }
    return total;
  }
}
