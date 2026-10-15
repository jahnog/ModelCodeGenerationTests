import { Cart } from "../../domain/cart";
import type { CartRepository } from "../../domain/cart-repository";
import { type CartView, toCartView } from "../cart-view-model";

export class ShowCartItems {
  private readonly carts: CartRepository;

  constructor(carts: CartRepository) {
    this.carts = carts;
  }

  async execute(cartId: string): Promise<CartView> {
    const cart = (await this.carts.findById(cartId)) ?? Cart.empty(cartId);
    return toCartView(cart);
  }
}
