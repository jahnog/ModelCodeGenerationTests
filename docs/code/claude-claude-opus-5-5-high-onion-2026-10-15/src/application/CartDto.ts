import type { ShoppingCart } from "../domain/ShoppingCart";

export interface CartItemDto {
  readonly productId: string;
  readonly name: string;
  readonly unitPriceCents: number;
  readonly quantity: number;
  readonly subtotalCents: number;
}

export interface CartDto {
  readonly cartId: string;
  readonly items: readonly CartItemDto[];
  readonly totalCents: number;
}

export function toCartDto(cart: ShoppingCart): CartDto {
  return {
    cartId: cart.id,
    items: cart.items.map((item) => ({
      productId: item.productId,
      name: item.name,
      unitPriceCents: item.unitPriceCents,
      quantity: item.quantity,
      subtotalCents: item.subtotalCents,
    })),
    totalCents: cart.totalCents,
  };
}
