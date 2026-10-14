import { assertSafeCartTotal, lineTotalCents, type CartItem } from "./cart-item";
import type { ShowItemsStore } from "./cart-store";
import type { CartListing, ShownCart, ShownCartItem } from "./shown-cart";

export class ShowCartItems {
  readonly #store: ShowItemsStore;
  readonly #listing: CartListing;

  constructor(store: ShowItemsStore, listing: CartListing) {
    this.#store = store;
    this.#listing = listing;
  }

  execute(): ShownCart {
    const stored = this.#store.list();
    const items = Object.freeze(stored.map((item) => toShownCartItem(item)));
    const totalCents = assertSafeCartTotal(stored);
    return Object.freeze({
      items,
      totalCents,
      listing: this.#listing.format(items, totalCents),
    });
  }
}

function toShownCartItem(item: CartItem): ShownCartItem {
  return Object.freeze({
    id: item.id,
    name: item.name,
    unitPriceCents: item.unitPriceCents,
    quantity: item.quantity,
    lineTotalCents: lineTotalCents(item),
  });
}
