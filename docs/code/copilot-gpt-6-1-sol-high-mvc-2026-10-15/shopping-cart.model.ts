export interface Product {
  readonly id: string;
  readonly name: string;
  readonly price: number;
}

export interface CartItem extends Product {
  readonly quantity: number;
}

export class ShoppingCartModel {
  private readonly items = new Map<string, CartItem>();

  addItem(product: Product, quantity = 1): void {
    if (product.id.trim() === "" || product.name.trim() === "") {
      throw new Error("A product must have a non-empty ID and name.");
    }
    if (!Number.isFinite(product.price) || product.price < 0) {
      throw new Error("A product price must be a finite, non-negative number.");
    }
    if (!Number.isSafeInteger(quantity) || quantity <= 0) {
      throw new Error("Quantity must be a positive safe integer.");
    }

    const existing = this.items.get(product.id);
    if (
      existing !== undefined &&
      (existing.name !== product.name || existing.price !== product.price)
    ) {
      throw new Error("A product ID cannot refer to different product details.");
    }

    const nextQuantity = (existing?.quantity ?? 0) + quantity;
    if (!Number.isSafeInteger(nextQuantity)) {
      throw new Error("The combined quantity exceeds the safe integer limit.");
    }

    this.items.set(product.id, {
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: nextQuantity,
    });
  }

  getItems(): readonly CartItem[] {
    return Array.from(this.items.values(), (item) => ({ ...item }));
  }

  getTotal(): number {
    let total = 0;
    for (const item of this.items.values()) {
      total += item.price * item.quantity;
    }
    return total;
  }

  // Removing a product removes its entire quantity from the cart.
  removeItem(productId: string): boolean {
    return this.items.delete(productId);
  }
}
