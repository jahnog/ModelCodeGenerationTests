export interface ShownCartItem {
  readonly itemId: string;
  readonly name: string;
  readonly unitPriceCents: number;
  readonly quantity: number;
  readonly lineTotalCents: number;
}

export interface ShownCart {
  readonly cartId: string;
  readonly items: readonly ShownCartItem[];
  readonly totalCents: number;
}

export function emptyShownCart(cartId: string): ShownCart {
  return { cartId, items: [], totalCents: 0 };
}

export function shownCartWithTotal(cartId: string, items: readonly ShownCartItem[]): ShownCart {
  let totalCents = 0;
  for (const item of items) {
    totalCents += item.lineTotalCents;
  }
  return { cartId, items, totalCents };
}
