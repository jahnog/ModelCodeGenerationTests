export interface CartItem {
  readonly id: string;
  readonly name: string;
  readonly unitPriceCents: number;
  readonly quantity: number;
}

/** Operations return a new cart; retain that value to apply the change. */
export interface ShoppingCart {
  readonly items: readonly CartItem[];
}

export function createCart(): ShoppingCart {
  return { items: [] };
}
