/** Domain layer: a line in the shopping cart. Prices are integer cents. */
export interface CartItem {
  readonly id: string;
  readonly name: string;
  readonly unitPriceCents: number;
  readonly quantity: number;
}

export function lineTotalCents(item: CartItem): number {
  return item.unitPriceCents * item.quantity;
}
