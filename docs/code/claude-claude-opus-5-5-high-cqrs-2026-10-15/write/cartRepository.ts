import { ShoppingCart } from "./shoppingCart";

// Storage for the write model only. The read side has its own store.
export class CartRepository {
  private readonly carts = new Map<string, ShoppingCart>();

  getOrCreate(cartId: string): ShoppingCart {
    let cart = this.carts.get(cartId);
    if (cart === undefined) {
      cart = new ShoppingCart(cartId);
      this.carts.set(cartId, cart);
    }
    return cart;
  }

  save(cart: ShoppingCart): void {
    this.carts.set(cart.id, cart);
  }
}
