import type { CartEvent, ItemAddedEvent } from "../write-model/cart-event";
import { shownCartWithTotal, type ShownCart, type ShownCartItem } from "./shown-cart";

// ItemAdded carries the quantity after the write. This projection sets that
// quantity. It does not add the delta again.
export function projectCartEvent(cart: ShownCart, event: CartEvent): ShownCart {
  switch (event.type) {
    case "ItemAdded":
      return shownCartWithTotal(event.cartId, upsertItem(cart.items, event));
    case "ItemRemoved":
      return shownCartWithTotal(
        event.cartId,
        cart.items.filter((item) => item.itemId !== event.itemId),
      );
  }
}

function upsertItem(items: readonly ShownCartItem[], event: ItemAddedEvent): readonly ShownCartItem[] {
  const next = shownItem(event);
  const index = items.findIndex((item) => item.itemId === event.itemId);
  if (index < 0) {
    return [...items, next];
  }
  return items.map((item, position) => (position === index ? next : item));
}

function shownItem(event: ItemAddedEvent): ShownCartItem {
  return {
    itemId: event.itemId,
    name: event.name,
    unitPriceCents: event.unitPriceCents,
    quantity: event.resultingQuantity,
    lineTotalCents: event.unitPriceCents * event.resultingQuantity,
  };
}
