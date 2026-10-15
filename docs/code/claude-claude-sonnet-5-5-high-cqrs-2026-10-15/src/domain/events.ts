export type CartId = string;
export type ProductId = string;

export interface ItemAdded {
  readonly type: "ItemAdded";
  readonly cartId: CartId;
  readonly productId: ProductId;
  readonly name: string;
  readonly unitPriceCents: number;
  readonly quantity: number;
  readonly occurredAt: string;
}

export interface ItemRemoved {
  readonly type: "ItemRemoved";
  readonly cartId: CartId;
  readonly productId: ProductId;
  readonly occurredAt: string;
}

export type CartEvent = ItemAdded | ItemRemoved;
