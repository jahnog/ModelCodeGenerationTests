import type { ShoppingCart } from "../domain/cart/ShoppingCart";

/** Read model returned to callers so the domain objects never leave the application layer. */
export interface CartItemView {
  readonly productId: string;
  readonly name: string;
  readonly unitPriceCents: number;
  readonly quantity: number;
  readonly subtotalCents: number;
}

export interface CartView {
  readonly cartId: string;
  readonly currency: string;
  readonly items: readonly CartItemView[];
  readonly totalQuantity: number;
  readonly totalCents: number;
}

export function toCartView(cart: ShoppingCart): CartView {
  return {
    cartId: cart.id.value,
    currency: cart.currency,
    items: cart.listItems().map((item) => ({
      productId: item.productId.value,
      name: item.name.value,
      unitPriceCents: item.unitPrice.cents,
      quantity: item.quantity.value,
      subtotalCents: item.subtotal.cents,
    })),
    totalQuantity: cart.totalQuantity,
    totalCents: cart.total.cents,
  };
}
