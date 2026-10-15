export interface CartItem {
  readonly id: string;
  readonly name: string;
  /** Unit price in cents, to avoid floating point rounding. */
  readonly priceCents: number;
  readonly quantity: number;
}
