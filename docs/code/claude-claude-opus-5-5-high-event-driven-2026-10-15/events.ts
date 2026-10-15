// Every message that travels through the event bus is declared here.
//
// Two kinds of events exist:
// - Requests ("...Requested") express an intent. Anyone may publish them.
// - Facts (past tense) record what the cart actually did. Only the cart
//   publishes them, and views react to them.

export interface CartItem {
  readonly id: string;
  readonly name: string;
  /** Unit price in cents, to avoid floating-point rounding. */
  readonly priceCents: number;
  readonly quantity: number;
}

export interface CartEventMap {
  // Requests
  AddItemRequested: {
    readonly id: string;
    readonly name: string;
    readonly priceCents: number;
    readonly quantity: number;
  };
  RemoveItemRequested: { readonly id: string };
  ShowCartRequested: Record<string, never>;

  // Facts
  ItemAdded: { readonly item: CartItem; readonly addedQuantity: number };
  ItemAddRejected: { readonly id: string; readonly reason: string };
  ItemRemoved: { readonly item: CartItem };
  ItemRemoveRejected: { readonly id: string; readonly reason: string };
  CartShown: {
    readonly items: readonly CartItem[];
    readonly totalCents: number;
  };
}

export type CartEventName = keyof CartEventMap;
