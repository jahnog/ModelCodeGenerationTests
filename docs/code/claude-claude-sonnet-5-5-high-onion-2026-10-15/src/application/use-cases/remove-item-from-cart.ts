import { Cart } from "../../domain/cart";
import type { CartRepository } from "../../domain/cart-repository";
import { type CartView, toCartView } from "../cart-view-model";

export class RemoveItemFromCart {
  private readonly carts: CartRepository;

  constructor(carts: CartRepository) {
    this.carts = carts;
  }

  async execute(cartId: string, productId: string): Promise<CartView> {
    const cart = (await this.carts.findById(cartId)) ?? Cart.empty(cartId);
    const updated = cart.removeItem(productId);
    await this.carts.save(updated);
    return toCartView(updated);
  }
}
