export interface ItemAddedToCart {
  readonly kind: "item-added-to-cart";
  readonly cartId: string;
  readonly productId: string;
  readonly productName: string;
  readonly unitPriceMinor: number;
  readonly currency: string;
  readonly quantity: number;
}

export interface ItemQuantityIncreased {
  readonly kind: "item-quantity-increased";
  readonly cartId: string;
  readonly productId: string;
  readonly quantityAdded: number;
  readonly quantityTotal: number;
}

export interface ItemRemovedFromCart {
  readonly kind: "item-removed-from-cart";
  readonly cartId: string;
  readonly productId: string;
  readonly quantity: number;
}

export type DomainEvent =
  | ItemAddedToCart
  | ItemQuantityIncreased
  | ItemRemovedFromCart;
