import type { Product } from "./product";

export interface CartItem {
  readonly product: Product;
  readonly quantity: number;
}

export function subtotalInCents(item: CartItem): number {
  return item.product.priceInCents * item.quantity;
}
