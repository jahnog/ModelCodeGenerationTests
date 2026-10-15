import { CartView, toCartView } from "../CartView";
import { CartRepository } from "../ports/CartRepository";

export class ShowCartItems {
  constructor(private readonly carts: CartRepository) {}

  async execute(): Promise<CartView> {
    return toCartView(await this.carts.get());
  }
}
