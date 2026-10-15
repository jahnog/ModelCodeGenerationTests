// Read model: shaped for display, with totals already computed.

export interface CartItemView {
  readonly productId: string;
  readonly name: string;
  readonly unitPriceCents: number;
  readonly quantity: number;
  readonly lineTotalCents: number;
}

export interface CartView {
  readonly cartId: string;
  readonly items: readonly CartItemView[];
  readonly totalQuantity: number;
  readonly totalCents: number;
}
