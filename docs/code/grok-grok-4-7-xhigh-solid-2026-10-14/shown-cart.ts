export interface ShownCartItem {
  readonly id: string;
  readonly name: string;
  readonly unitPriceCents: number;
  readonly quantity: number;
  readonly lineTotalCents: number;
}

export interface ShownCart {
  readonly items: readonly ShownCartItem[];
  readonly totalCents: number;
  readonly listing: string;
}

/** Turns shown lines into text. Showing the cart does not depend on one format. */
export interface CartListing {
  format(items: readonly ShownCartItem[], totalCents: number): string;
}
