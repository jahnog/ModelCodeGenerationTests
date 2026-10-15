import { Cart, type NewItem } from "../domain/cart";
import type { CartUseCases } from "./ports/in/cartUseCases";
import type { CartRepository } from "./ports/out/cartRepository";

export class CartService implements CartUseCases {
  constructor(private readonly carts: CartRepository) {}

  async addItem(cartId: string, item: NewItem): Promise<Cart> {
    const cart = await this.load(cartId);
    const updated = cart.add(item);
    await this.carts.save(updated);
    return updated;
  }

  async showItems(cartId: string): Promise<Cart> {
    return this.load(cartId);
  }

  async removeItem(cartId: string, itemId: string): Promise<Cart> {
    const cart = await this.load(cartId);
    const updated = cart.remove(itemId);
    await this.carts.save(updated);
    return updated;
  }

  private async load(cartId: string): Promise<Cart> {
    return (await this.carts.findById(cartId)) ?? Cart.empty(cartId);
  }
}
