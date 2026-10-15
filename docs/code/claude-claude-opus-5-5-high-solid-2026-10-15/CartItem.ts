/** A product line held in the shopping cart. Prices are in minor units (cents). */
export interface CartItem {
  readonly id: string;
  readonly name: string;
  readonly unitPriceCents: number;
  readonly quantity: number;
}
