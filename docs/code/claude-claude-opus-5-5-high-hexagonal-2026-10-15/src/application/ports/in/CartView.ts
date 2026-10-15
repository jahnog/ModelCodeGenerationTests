/** Read model returned by the inbound ports, so driving adapters never touch domain objects. */
export interface CartItemView {
  readonly productId: string;
  readonly name: string;
  readonly unitPriceCents: number;
  readonly quantity: number;
  readonly subtotalCents: number;
}

export interface CartView {
  readonly cartId: string;
  readonly items: readonly CartItemView[];
  readonly totalQuantity: number;
  readonly totalCents: number;
}
