import { Cart, CartItem, type CartItemProps, type CartRepository } from "../domain";

/** Stores plain snapshots so callers never share a live Cart instance with the store. */
export class InMemoryCartRepository implements CartRepository {
  private snapshot: readonly CartItemProps[] = [];

  load(): Cart {
    return new Cart(this.snapshot.map((props) => CartItem.create(props)));
  }

  save(cart: Cart): void {
    this.snapshot = cart.getItems().map((item) => item.toProps());
  }
}
