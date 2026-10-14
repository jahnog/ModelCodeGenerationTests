export interface ItemAddedEvent {
  readonly type: "ItemAdded";
  readonly cartId: string;
  readonly itemId: string;
  readonly name: string;
  readonly unitPriceCents: number;
  readonly quantityAdded: number;
  readonly resultingQuantity: number;
}

export interface ItemRemovedEvent {
  readonly type: "ItemRemoved";
  readonly cartId: string;
  readonly itemId: string;
  readonly name: string;
  readonly quantity: number;
}

export type CartEvent = ItemAddedEvent | ItemRemovedEvent;
