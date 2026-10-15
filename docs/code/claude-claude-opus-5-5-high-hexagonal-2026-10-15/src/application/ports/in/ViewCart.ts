import type { CartView } from "./CartView";

export interface ViewCartQuery {
  viewCart(cartId: string): Promise<CartView>;
}
