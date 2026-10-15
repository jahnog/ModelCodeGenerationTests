import type { EventBus, Unsubscribe } from "./eventBus";
import type { CartEventMap, CartItem } from "./events";

/**
 * Owns the cart state. It listens for requests, changes its state, and
 * publishes facts describing the outcome. Nothing else touches the items.
 */
export class ShoppingCart {
  private readonly items = new Map<string, CartItem>();
  private readonly bus: EventBus<CartEventMap>;
  private readonly subscriptions: Unsubscribe[];

  constructor(bus: EventBus<CartEventMap>) {
    this.bus = bus;
    this.subscriptions = [
      bus.on("AddItemRequested", (request) => this.add(request)),
      bus.on("RemoveItemRequested", (request) => this.remove(request.id)),
      bus.on("ShowCartRequested", () => this.show()),
    ];
  }

  dispose(): void {
    for (const unsubscribe of this.subscriptions) {
      unsubscribe();
    }
    this.subscriptions.length = 0;
  }

  private add(request: CartEventMap["AddItemRequested"]): void {
    const reason = validate(request);
    if (reason !== undefined) {
      this.bus.emit("ItemAddRejected", { id: request.id, reason });
      return;
    }

    const existing = this.items.get(request.id);
    if (existing !== undefined && existing.priceCents !== request.priceCents) {
      this.bus.emit("ItemAddRejected", {
        id: request.id,
        reason: "the cart already holds this item at a different price",
      });
      return;
    }

    const item: CartItem = {
      id: request.id,
      name: existing?.name ?? request.name.trim(),
      priceCents: request.priceCents,
      quantity: (existing?.quantity ?? 0) + request.quantity,
    };
    this.items.set(item.id, item);
    this.bus.emit("ItemAdded", { item, addedQuantity: request.quantity });
  }

  private remove(id: string): void {
    const item = this.items.get(id);
    if (item === undefined) {
      this.bus.emit("ItemRemoveRejected", {
        id,
        reason: "the cart does not contain this item",
      });
      return;
    }
    this.items.delete(id);
    this.bus.emit("ItemRemoved", { item });
  }

  private show(): void {
    const items = [...this.items.values()];
    const totalCents = items.reduce(
      (sum, item) => sum + item.priceCents * item.quantity,
      0,
    );
    this.bus.emit("CartShown", { items, totalCents });
  }
}

function validate(
  request: CartEventMap["AddItemRequested"],
): string | undefined {
  if (request.id.trim() === "") {
    return "the item id is empty";
  }
  if (request.name.trim() === "") {
    return "the item name is empty";
  }
  if (!Number.isSafeInteger(request.priceCents) || request.priceCents < 0) {
    return "the price must be a whole, non-negative number of cents";
  }
  if (!Number.isSafeInteger(request.quantity) || request.quantity < 1) {
    return "the quantity must be a whole number of at least 1";
  }
  return undefined;
}
