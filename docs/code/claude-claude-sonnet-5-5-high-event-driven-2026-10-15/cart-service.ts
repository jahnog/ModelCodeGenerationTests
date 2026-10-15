import type { CartItem, EventBus } from "./events";

/** Owns the cart state; reacts to request events and publishes fact events. */
export class CartService {
  private readonly items = new Map<string, CartItem>();

  constructor(private readonly bus: EventBus) {
    bus.subscribe("AddItemRequested", ({ item }) => {
      if (item.id.trim() === "") {
        bus.publish("ItemAddRejected", { itemId: item.id, reason: "Item id is required" });
        return;
      }
      if (!Number.isInteger(item.quantity) || item.quantity < 1) {
        bus.publish("ItemAddRejected", {
          itemId: item.id,
          reason: "Quantity must be a positive whole number",
        });
        return;
      }
      if (!Number.isInteger(item.priceCents) || item.priceCents < 0) {
        bus.publish("ItemAddRejected", {
          itemId: item.id,
          reason: "Price must be a non-negative whole number of cents",
        });
        return;
      }

      const existing = this.items.get(item.id);
      const stored: CartItem = existing
        ? { ...existing, quantity: existing.quantity + item.quantity }
        : { ...item };
      this.items.set(stored.id, stored);
      bus.publish("ItemAdded", { item: stored });
    });

    bus.subscribe("RemoveItemRequested", ({ itemId }) => {
      const existing = this.items.get(itemId);
      if (!existing) {
        bus.publish("ItemRemoveRejected", { itemId, reason: "Item is not in the cart" });
        return;
      }
      this.items.delete(itemId);
      bus.publish("ItemRemoved", { item: existing });
    });

    bus.subscribe("ShowCartRequested", () => {
      const items = [...this.items.values()];
      const totalCents = items.reduce((sum, i) => sum + i.priceCents * i.quantity, 0);
      bus.publish("CartContentsReady", { items, totalCents });
    });
  }
}
