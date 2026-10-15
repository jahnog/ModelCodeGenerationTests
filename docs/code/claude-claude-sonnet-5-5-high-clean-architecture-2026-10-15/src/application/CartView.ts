import { Cart } from "../domain/Cart";
import { lineTotalInCents } from "../domain/CartItem";

export interface CartItemView {
  readonly productId: string;
  readonly name: string;
  readonly unitPriceInCents: number;
  readonly quantity: number;
  readonly lineTotalInCents: number;
}

export interface CartView {
  readonly items: readonly CartItemView[];
  readonly totalInCents: number;
}

export function toCartView(cart: Cart): CartView {
  return {
    items: cart.items.map((item) => ({
      productId: item.productId,
      name: item.name,
      unitPriceInCents: item.unitPriceInCents,
      quantity: item.quantity,
      lineTotalInCents: lineTotalInCents(item),
    })),
    totalInCents: cart.totalInCents,
  };
}
