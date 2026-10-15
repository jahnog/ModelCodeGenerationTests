export interface Product {
  readonly id: string;
  readonly name: string;
  readonly unitPriceCents: number;
}

export interface CartItem extends Product {
  readonly quantity: number;
}

export class ShoppingCart {
  private readonly items = new Map<string, CartItem>();

  addItem(product: Product, quantity = 1): void {
    if (product.id.trim().length === 0 || product.name.trim().length === 0) {
      throw new TypeError("Product ID and name must not be empty.");
    }

    if (
      !Number.isSafeInteger(product.unitPriceCents) ||
      product.unitPriceCents < 0
    ) {
      throw new RangeError("Unit price must be a non-negative safe integer in cents.");
    }

    if (!Number.isSafeInteger(quantity) || quantity <= 0) {
      throw new RangeError("Quantity must be a positive safe integer.");
    }

    const existing = this.items.get(product.id);
    if (
      existing !== undefined &&
      (existing.name !== product.name ||
        existing.unitPriceCents !== product.unitPriceCents)
    ) {
      throw new Error("A product ID cannot refer to different product details.");
    }

    const nextQuantity = (existing?.quantity ?? 0) + quantity;
    const nextTotalCents =
      this.getTotalCents() + product.unitPriceCents * quantity;

    if (
      !Number.isSafeInteger(nextQuantity) ||
      !Number.isSafeInteger(nextTotalCents)
    ) {
      throw new RangeError("Adding this item would exceed the safe integer limit.");
    }

    this.items.set(product.id, {
      id: product.id,
      name: product.name,
      unitPriceCents: product.unitPriceCents,
      quantity: nextQuantity,
    });
  }

  getItems(): readonly CartItem[] {
    return Array.from(this.items.values(), (item) => ({ ...item }));
  }

  // Removing a product removes its entire quantity; false means it was absent.
  removeItem(productId: string): boolean {
    return this.items.delete(productId);
  }

  getTotalCents(): number {
    let totalCents = 0;
    for (const item of this.items.values()) {
      totalCents += item.unitPriceCents * item.quantity;
    }
    return totalCents;
  }
}
