import { Cart } from "../../domain/entities/Cart";
import { toCartView, type CartView, type ViewCartRequest } from "../dto/CartDto";
import type { CartRepository } from "../ports/CartRepository";

export class ViewCart {
  constructor(private readonly carts: CartRepository) {}

  /** A cart that was never created is shown as empty rather than treated as an error. */
  async execute(request: ViewCartRequest): Promise<CartView> {
    const cart = (await this.carts.findById(request.cartId)) ?? new Cart(request.cartId);
    return toCartView(cart);
  }
}
