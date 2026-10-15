import { CartRepository } from "../application/ports/CartRepository";
import { Cart } from "../domain/Cart";

export class InMemoryCartRepository implements CartRepository {
  private cart: Cart = Cart.empty();

  async get(): Promise<Cart> {
    return this.cart;
  }

  async save(cart: Cart): Promise<void> {
    this.cart = cart;
  }
}
