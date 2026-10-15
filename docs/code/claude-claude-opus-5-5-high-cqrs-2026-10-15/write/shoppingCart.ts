import type { CartEvent } from "../domain/events";

interface CartLine {
  readonly name: string;
  readonly unitPriceCents: number;
  readonly quantity: number;
}

export class CartRuleError extends Error {}

// Write model (aggregate). It enforces the business rules and records
// the events that describe each accepted change. It is never queried for display.
export class ShoppingCart {
  private readonly lines = new Map<string, CartLine>();
  private pendingEvents: CartEvent[] = [];

  constructor(readonly id: string) {}

  addItem(productId: string, name: string, unitPriceCents: number, quantity: number): void {
    if (productId.trim() === "") {
      throw new CartRuleError("Product id is required.");
    }
    if (name.trim() === "") {
      throw new CartRuleError("Product name is required.");
    }
    if (!Number.isInteger(unitPriceCents) || unitPriceCents < 0) {
      throw new CartRuleError("Unit price must be a non-negative whole number of cents.");
    }
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new CartRuleError("Quantity must be a positive whole number.");
    }
    const existing = this.lines.get(productId);
    if (existing !== undefined && existing.unitPriceCents !== unitPriceCents) {
      throw new CartRuleError(`Product ${productId} is already in the cart at a different price.`);
    }

    this.apply({ type: "ItemAdded", cartId: this.id, productId, name, unitPriceCents, quantity });
  }

  removeItem(productId: string): void {
    if (!this.lines.has(productId)) {
      throw new CartRuleError(`Product ${productId} is not in the cart.`);
    }

    this.apply({ type: "ItemRemoved", cartId: this.id, productId });
  }

  pullEvents(): CartEvent[] {
    const events = this.pendingEvents;
    this.pendingEvents = [];
    return events;
  }

  private apply(event: CartEvent): void {
    switch (event.type) {
      case "ItemAdded": {
        const existing = this.lines.get(event.productId);
        this.lines.set(event.productId, {
          name: event.name,
          unitPriceCents: event.unitPriceCents,
          quantity: (existing?.quantity ?? 0) + event.quantity,
        });
        break;
      }
      case "ItemRemoved":
        this.lines.delete(event.productId);
        break;
    }
    this.pendingEvents.push(event);
  }
}
