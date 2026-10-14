import type {
  AddItemRejected,
  DomainEvent,
  EventEnvelope,
  ItemAddedToCart,
  ItemRemovedFromCart,
  RemoveItemRejected,
  ShownCart,
} from "../events/cart-message";

export function formatCents(cents: number): string {
  const negative = cents < 0;
  const absolute = Math.abs(cents);
  const dollars = Math.floor(absolute / 100);
  const remainder = absolute % 100;
  const text = `$${dollars}.${String(remainder).padStart(2, "0")}`;
  return negative ? `-${text}` : text;
}

export function formatItemAdded(event: ItemAddedToCart): string {
  return `Added ${event.quantity} ${event.name} at ${formatCents(event.unitPriceCents)}. The cart holds ${event.resultingQuantity}.`;
}

export function formatItemRemoved(event: ItemRemovedFromCart): string {
  const removed = `Removed ${event.quantity} ${event.name} at ${formatCents(event.unitPriceCents)}.`;
  if (event.remainingQuantity === 0) {
    return `${removed} None remain in the cart.`;
  }
  if (event.remainingQuantity === 1) {
    return `${removed} 1 remains in the cart.`;
  }
  return `${removed} ${event.remainingQuantity} remain in the cart.`;
}

export function formatAddRejected(event: AddItemRejected): string {
  return `Could not add ${label(event.itemId)}: ${event.reason}`;
}

export function formatRemoveRejected(event: RemoveItemRejected): string {
  return `Could not remove ${label(event.itemId)}: ${event.reason}`;
}

export function formatShownCart(cart: ShownCart): string {
  if (cart.lines.length === 0) {
    return "Shopping cart is empty.";
  }
  const lines = cart.lines.map((line) => {
    return `- ${line.quantity} x ${line.name} (${line.itemId}) at ${formatCents(line.unitPriceCents)} = ${formatCents(line.lineTotalCents)}`;
  });
  return ["Shopping cart:", ...lines, `Total: ${formatCents(cart.totalCents)}`].join("\n");
}

export function formatEventLog(records: readonly EventEnvelope<DomainEvent>[]): string {
  if (records.length === 0) {
    return "Event log is empty.";
  }
  const lines = records.map((record, index) => {
    const event = record.event;
    if (event.type === "ItemAddedToCart") {
      return `${index + 1}. ItemAddedToCart ${event.itemId} +${event.quantity} (now ${event.resultingQuantity})`;
    }
    return `${index + 1}. ItemRemovedFromCart ${event.itemId} -${event.quantity} (${event.remainingQuantity} left)`;
  });
  return ["Event log:", ...lines].join("\n");
}

function label(itemId: string): string {
  const trimmed = itemId.trim();
  return trimmed.length > 0 ? trimmed : "item";
}
