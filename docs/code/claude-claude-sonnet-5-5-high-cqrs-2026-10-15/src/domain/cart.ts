import type { CartEvent, CartId, ProductId } from "./events";

export class CartError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CartError";
  }
}

interface Line {
  readonly name: string;
  readonly quantity: number;
}

export interface NewItem {
  readonly productId: ProductId;
  readonly name: string;
  readonly unitPriceCents: number;
  readonly quantity: number;
}

/**
 * Write-side aggregate. Its state is rebuilt from past events and it only
 * answers with new events; it never exposes data for display.
 */
export class Cart {
  private readonly lines = new Map<ProductId, Line>();
  private version = 0;

  private constructor(readonly id: CartId) {}

  static fromHistory(id: CartId, history: readonly CartEvent[]): Cart {
    const cart = new Cart(id);
    for (const event of history) {
      cart.apply(event);
    }
    return cart;
  }

  get currentVersion(): number {
    return this.version;
  }

  addItem(item: NewItem, occurredAt: string): CartEvent[] {
    if (item.productId.trim() === "") {
      throw new CartError("Product id must not be empty.");
    }
    if (item.name.trim() === "") {
      throw new CartError("Product name must not be empty.");
    }
    if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
      throw new CartError("Quantity must be a positive integer.");
    }
    if (!Number.isInteger(item.unitPriceCents) || item.unitPriceCents < 0) {
      throw new CartError("Unit price must be a non-negative number of cents.");
    }
    return [
      {
        type: "ItemAdded",
        cartId: this.id,
        productId: item.productId,
        name: item.name,
        unitPriceCents: item.unitPriceCents,
        quantity: item.quantity,
        occurredAt,
      },
    ];
  }

  removeItem(productId: ProductId, occurredAt: string): CartEvent[] {
    if (!this.lines.has(productId)) {
      throw new CartError(`Product "${productId}" is not in cart "${this.id}".`);
    }
    return [{ type: "ItemRemoved", cartId: this.id, productId, occurredAt }];
  }

  private apply(event: CartEvent): void {
    switch (event.type) {
      case "ItemAdded": {
        const existing = this.lines.get(event.productId);
        this.lines.set(event.productId, {
          name: event.name,
          quantity: (existing?.quantity ?? 0) + event.quantity,
        });
        break;
      }
      case "ItemRemoved":
        this.lines.delete(event.productId);
        break;
    }
    this.version += 1;
  }
}
