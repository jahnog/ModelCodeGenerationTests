import type { CartId, ProductId } from "../domain/events";

export interface CartItemView {
  readonly productId: ProductId;
  readonly name: string;
  readonly unitPriceCents: number;
  readonly quantity: number;
  readonly lineTotalCents: number;
}

export interface CartView {
  readonly cartId: CartId;
  readonly items: readonly CartItemView[];
  readonly totalQuantity: number;
  readonly totalCents: number;
}
