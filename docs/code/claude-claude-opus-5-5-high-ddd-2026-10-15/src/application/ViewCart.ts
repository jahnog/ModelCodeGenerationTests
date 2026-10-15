import { CartId } from "../domain/cart/CartId";
import type { CartRepository } from "../domain/cart/CartRepository";
import { CartNotFoundError } from "./ApplicationError";
import { type CartView, toCartView } from "./CartView";

export interface ViewCartQuery {
  readonly cartId: string;
}

/** Use case: show the items in a cart. */
export class ViewCart {
  private readonly carts: CartRepository;

  constructor(carts: CartRepository) {
    this.carts = carts;
  }

  async execute(query: ViewCartQuery): Promise<CartView> {
    const cartId = CartId.of(query.cartId);
    const cart = await this.carts.findById(cartId);
    if (!cart) {
      throw new CartNotFoundError(cartId.value);
    }
    return toCartView(cart);
  }
}
