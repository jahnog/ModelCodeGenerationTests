import { CartView, toCartView } from "../CartView";
import { CartRepository } from "../ports/CartRepository";

export class RemoveItemFromCart {
  constructor(private readonly carts: CartRepository) {}

  async execute(productId: string): Promise<CartView> {
    const cart = (await this.carts.get()).remove(productId);
    await this.carts.save(cart);
    return toCartView(cart);
  }
}
