import type { EventBus } from "./events";

export type Output = (line: string) => void;

export function formatMoney(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

/** Listens to fact events and renders them as text lines. */
export class CartView {
  constructor(bus: EventBus, out: Output) {
    bus.subscribe("ItemAdded", ({ item }) => {
      out(`Added: ${item.name} x${item.quantity} @ ${formatMoney(item.priceCents)}`);
    });
    bus.subscribe("ItemAddRejected", ({ itemId, reason }) => {
      out(`Could not add "${itemId}": ${reason}`);
    });
    bus.subscribe("ItemRemoved", ({ item }) => {
      out(`Removed: ${item.name}`);
    });
    bus.subscribe("ItemRemoveRejected", ({ itemId, reason }) => {
      out(`Could not remove "${itemId}": ${reason}`);
    });
    bus.subscribe("CartContentsReady", ({ items, totalCents }) => {
      if (items.length === 0) {
        out("Cart is empty.");
        return;
      }
      out("Cart:");
      for (const item of items) {
        const line = formatMoney(item.priceCents * item.quantity);
        out(`  ${item.id}  ${item.name}  ${item.quantity} x ${formatMoney(item.priceCents)} = ${line}`);
      }
      out(`  Total: ${formatMoney(totalCents)}`);
    });
  }
}
