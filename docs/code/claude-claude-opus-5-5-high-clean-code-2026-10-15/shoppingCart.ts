import { subtotalInCents, type CartItem } from "./cartItem";
import type { Product } from "./product";

export class InvalidQuantityError extends Error {
  constructor(quantity: number) {
    super(`Quantity must be a positive whole number, but got ${quantity}.`);
    this.name = "InvalidQuantityError";
  }
}

export class ItemNotInCartError extends Error {
  constructor(productId: string) {
    super(`No item with product id "${productId}" is in the cart.`);
    this.name = "ItemNotInCartError";
  }
}

export class ShoppingCart {
  private readonly itemsByProductId = new Map<string, CartItem>();

  addItem(product: Product, quantity = 1): void {
    assertValidQuantity(quantity);

    const quantityAlreadyInCart = this.itemsByProductId.get(product.id)?.quantity ?? 0;
    this.itemsByProductId.set(product.id, {
      product,
      quantity: quantityAlreadyInCart + quantity,
    });
  }

  removeItem(productId: string): CartItem {
    const removedItem = this.itemsByProductId.get(productId);
    if (removedItem === undefined) {
      throw new ItemNotInCartError(productId);
    }

    this.itemsByProductId.delete(productId);
    return removedItem;
  }

  getItems(): readonly CartItem[] {
    return [...this.itemsByProductId.values()];
  }

  isEmpty(): boolean {
    return this.itemsByProductId.size === 0;
  }

  totalInCents(): number {
    return this.getItems().reduce((total, item) => total + subtotalInCents(item), 0);
  }
}

function assertValidQuantity(quantity: number): void {
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new InvalidQuantityError(quantity);
  }
}
