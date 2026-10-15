// Domain events: facts the write side publishes after a command succeeds.
// The read side listens to them to keep its views up to date.

export interface ItemAdded {
  readonly type: "ItemAdded";
  readonly cartId: string;
  readonly productId: string;
  readonly name: string;
  readonly unitPriceCents: number;
  readonly quantity: number;
}

export interface ItemRemoved {
  readonly type: "ItemRemoved";
  readonly cartId: string;
  readonly productId: string;
}

export type CartEvent = ItemAdded | ItemRemoved;
