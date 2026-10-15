import type { Cart } from "../../domain/entities/Cart";

export interface AddItemRequest {
  readonly cartId: string;
  readonly itemId: string;
  readonly name: string;
  readonly unitPriceCents: number;
  readonly quantity: number;
}

export interface ViewCartRequest {
  readonly cartId: string;
}

export interface RemoveItemRequest {
  readonly cartId: string;
  readonly itemId: string;
}

export interface CartItemView {
  readonly id: string;
  readonly name: string;
  readonly unitPriceCents: number;
  readonly quantity: number;
  readonly subtotalCents: number;
}

/** Plain data handed to outer layers so they never touch domain entities. */
export interface CartView {
  readonly cartId: string;
  readonly items: readonly CartItemView[];
  readonly totalQuantity: number;
  readonly totalCents: number;
}

export function toCartView(cart: Cart): CartView {
  return {
    cartId: cart.id,
    items: cart.items().map((item) => ({
      id: item.id,
      name: item.name,
      unitPriceCents: item.unitPrice.cents,
      quantity: item.quantity,
      subtotalCents: item.subtotal().cents,
    })),
    totalQuantity: cart.totalQuantity(),
    totalCents: cart.total().cents,
  };
}
