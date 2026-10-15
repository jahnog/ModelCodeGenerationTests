import type { EventBus, Unsubscribe } from "./eventBus";
import type { CartEventMap, CartItem } from "./events";

export interface Output {
  writeLine(line: string): void;
}

export function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function formatItem(item: CartItem): string {
  const lineTotal = formatCents(item.priceCents * item.quantity);
  return `${item.name} (${item.id}) x${item.quantity} @ ${formatCents(item.priceCents)} = ${lineTotal}`;
}

/**
 * Turns facts published by the cart into text. It never reads cart state
 * directly; everything it prints comes from event payloads.
 */
export function attachCartView(
  bus: EventBus<CartEventMap>,
  output: Output,
): Unsubscribe {
  const subscriptions = [
    bus.on("ItemAdded", ({ item, addedQuantity }) => {
      output.writeLine(
        `Added ${addedQuantity} x ${item.name}. The cart now holds ${item.quantity}.`,
      );
    }),
    bus.on("ItemAddRejected", ({ id, reason }) => {
      output.writeLine(`Could not add "${id}": ${reason}.`);
    }),
    bus.on("ItemRemoved", ({ item }) => {
      output.writeLine(`Removed ${item.name} from the cart.`);
    }),
    bus.on("ItemRemoveRejected", ({ id, reason }) => {
      output.writeLine(`Could not remove "${id}": ${reason}.`);
    }),
    bus.on("CartShown", ({ items, totalCents }) => {
      if (items.length === 0) {
        output.writeLine("The shopping cart is empty.");
        return;
      }
      output.writeLine("Shopping cart:");
      items.forEach((item, index) => {
        output.writeLine(`  ${index + 1}. ${formatItem(item)}`);
      });
      output.writeLine(`  Total: ${formatCents(totalCents)}`);
    }),
  ];

  return () => {
    for (const unsubscribe of subscriptions) {
      unsubscribe();
    }
  };
}
