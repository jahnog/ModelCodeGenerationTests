import { type CartItem, lineTotalInCents } from "./cart-item";

export class InvalidItemError extends Error {}

export class ItemNotFoundError extends Error {
  constructor(itemId: string) {
    super(`No item with id "${itemId}" in the cart`);
  }
}

export class ShoppingCart {
  private readonly itemsById = new Map<string, CartItem>();

  addItem(item: CartItem): void {
    assertIsValid(item);
    const existing = this.itemsById.get(item.id);
    const quantity = (existing?.quantity ?? 0) + item.quantity;
    this.itemsById.set(item.id, { ...item, quantity });
  }

  removeItem(itemId: string): void {
    const wasRemoved = this.itemsById.delete(itemId);
    if (!wasRemoved) {
      throw new ItemNotFoundError(itemId);
    }
  }

  getItems(): readonly CartItem[] {
    return [...this.itemsById.values()];
  }

  getTotalInCents(): number {
    return this.getItems().reduce((total, item) => total + lineTotalInCents(item), 0);
  }

  isEmpty(): boolean {
    return this.itemsById.size === 0;
  }
}

function assertIsValid(item: CartItem): void {
  if (item.id.trim() === "") {
    throw new InvalidItemError("Item id must not be empty");
  }
  if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
    throw new InvalidItemError("Item quantity must be a positive whole number");
  }
  if (!Number.isInteger(item.unitPriceInCents) || item.unitPriceInCents < 0) {
    throw new InvalidItemError("Item price must be a non-negative number of cents");
  }
}
