// Shared cart document. Slices read this shape and return a new one.
// Rules for adding, showing, and removing stay in the slice that owns them.

export interface CartLine {
  readonly productId: string;
  readonly name: string;
  readonly unitPriceCents: number;
  readonly quantity: number;
}

export type ShoppingCart = readonly CartLine[];

export function emptyShoppingCart(): ShoppingCart {
  return [];
}

export function copyCartLine(line: CartLine): CartLine {
  return {
    productId: line.productId,
    name: line.name,
    unitPriceCents: line.unitPriceCents,
    quantity: line.quantity,
  };
}
