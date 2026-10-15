export interface CartItem {
  readonly id: string;
  readonly name: string;
  readonly unitPriceInCents: number;
  readonly quantity: number;
}

export function lineTotalInCents(item: CartItem): number {
  return item.unitPriceInCents * item.quantity;
}
