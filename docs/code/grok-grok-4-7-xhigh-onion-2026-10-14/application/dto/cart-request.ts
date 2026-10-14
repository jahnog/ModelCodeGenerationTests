export interface AddItemRequest {
  readonly productId: string;
  readonly name: string;
  readonly unitPriceCents: number;
  readonly quantity: number;
}

export interface RemoveItemRequest {
  readonly productId: string;
}
