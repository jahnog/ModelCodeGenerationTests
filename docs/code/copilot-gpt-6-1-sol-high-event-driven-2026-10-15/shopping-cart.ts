import { EventBus } from "./event-bus";

export interface CartItem {
  readonly id: string;
  readonly name: string;
  readonly unitPriceCents: number;
  readonly quantity: number;
}

export interface CartSnapshot {
  readonly items: readonly CartItem[];
  readonly totalQuantity: number;
  readonly totalCents: number;
}

export interface CartEvents {
  "cart:add-item": CartItem;
  "cart:remove-item": { readonly id: string };
  "cart:show-items": undefined;
  "cart:item-added": CartItem;
  "cart:item-removed": CartItem;
  "cart:items-shown": CartSnapshot;
}

export class ShoppingCart {
  private readonly items = new Map<string, CartItem>();
  private readonly unsubscribe: readonly (() => void)[];

  constructor(private readonly events: EventBus<CartEvents>) {
    this.unsubscribe = [
      events.on("cart:add-item", (item) => this.addItem(item)),
      events.on("cart:remove-item", ({ id }) => this.removeItem(id)),
      events.on("cart:show-items", () => {
        events.emit("cart:items-shown", this.snapshot());
      }),
    ];
  }

  dispose(): void {
    for (const unsubscribe of this.unsubscribe) {
      unsubscribe();
    }
  }

  private addItem(item: CartItem): void {
    if (!item.id.trim() || !item.name.trim()) {
      throw new Error("An item must have a non-empty ID and name.");
    }
    if (!Number.isSafeInteger(item.unitPriceCents) || item.unitPriceCents < 0) {
      throw new RangeError("The unit price must be a non-negative integer in cents.");
    }
    if (!Number.isSafeInteger(item.quantity) || item.quantity <= 0) {
      throw new RangeError("The quantity must be a positive safe integer.");
    }

    const existing = this.items.get(item.id);
    if (
      existing &&
      (existing.name !== item.name ||
        existing.unitPriceCents !== item.unitPriceCents)
    ) {
      throw new Error(`Item "${item.id}" already exists with different details.`);
    }

    const updated = Object.freeze({
      id: item.id,
      name: item.name,
      unitPriceCents: item.unitPriceCents,
      quantity: (existing?.quantity ?? 0) + item.quantity,
    });
    const current = this.snapshot();
    const totalQuantity = current.totalQuantity + item.quantity;
    const totalCents =
      current.totalCents + item.unitPriceCents * item.quantity;

    if (
      !Number.isSafeInteger(totalQuantity) ||
      !Number.isSafeInteger(totalCents)
    ) {
      throw new RangeError("Adding this item would exceed safe integer limits.");
    }

    this.items.set(updated.id, updated);
    this.events.emit("cart:item-added", updated);
  }

  private removeItem(id: string): void {
    const item = this.items.get(id);
    if (!item) {
      throw new Error(`Item "${id}" is not in the shopping cart.`);
    }
    this.items.delete(id);
    this.events.emit("cart:item-removed", item);
  }

  private snapshot(): CartSnapshot {
    const items = Object.freeze([...this.items.values()]);
    return Object.freeze({
      items,
      totalQuantity: items.reduce((total, item) => total + item.quantity, 0),
      totalCents: items.reduce(
        (total, item) => total + item.unitPriceCents * item.quantity,
        0,
      ),
    });
  }
}
