export interface ItemAddedToCart {
  readonly type: "ItemAddedToCart";
  readonly itemId: string;
  readonly name: string;
  readonly unitPriceCents: number;
  readonly quantity: number;
  readonly resultingQuantity: number;
}

export interface ItemRemovedFromCart {
  readonly type: "ItemRemovedFromCart";
  readonly itemId: string;
  readonly name: string;
  readonly unitPriceCents: number;
  readonly quantity: number;
  readonly remainingQuantity: number;
}

export type DomainEvent = ItemAddedToCart | ItemRemovedFromCart;

export interface AddItemRequested {
  readonly type: "AddItemRequested";
  readonly itemId: string;
  readonly name: string;
  readonly unitPriceCents: number;
  readonly quantity: number;
}

export interface RemoveItemRequested {
  readonly type: "RemoveItemRequested";
  readonly itemId: string;
  readonly quantity: number;
}

export interface ShowCartRequested {
  readonly type: "ShowCartRequested";
}

export interface AddItemRejected {
  readonly type: "AddItemRejected";
  readonly itemId: string;
  readonly reason: string;
}

export interface RemoveItemRejected {
  readonly type: "RemoveItemRejected";
  readonly itemId: string;
  readonly reason: string;
}

export interface ShownLine {
  readonly itemId: string;
  readonly name: string;
  readonly unitPriceCents: number;
  readonly quantity: number;
  readonly lineTotalCents: number;
}

export interface ShownCart {
  readonly lines: readonly ShownLine[];
  readonly totalCents: number;
}

export interface CartShown {
  readonly type: "CartShown";
  readonly cart: ShownCart;
}

export type CartRequest = AddItemRequested | RemoveItemRequested | ShowCartRequested;

export type CartOutcome = DomainEvent | AddItemRejected | RemoveItemRejected | CartShown;

export type CartMessage = CartRequest | CartOutcome;

export interface EventEnvelope<TEvent extends CartMessage = CartMessage> {
  readonly sequence: number;
  readonly occurredAt: string;
  readonly event: TEvent;
}

export type CartMessageOf<TType extends CartMessage["type"]> = Extract<
  CartMessage,
  { readonly type: TType }
>;
