import { ItemNotInCartError } from "../../domain/errors/DomainError";
import { toCartView, type CartView, type RemoveItemRequest } from "../dto/CartDto";
import type { CartRepository } from "../ports/CartRepository";

export class RemoveItemFromCart {
  constructor(private readonly carts: CartRepository) {}

  async execute(request: RemoveItemRequest): Promise<CartView> {
    const cart = await this.carts.findById(request.cartId);
    if (cart === undefined) {
      throw new ItemNotInCartError(request.itemId);
    }
    cart.removeItem(request.itemId);
    await this.carts.save(cart);
    return toCartView(cart);
  }
}
