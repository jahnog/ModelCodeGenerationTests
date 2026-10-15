import { ShoppingCart } from "./domain";
import type { AddCartItem, CartItem } from "./domain";

export interface CartRepository {
  load(): ShoppingCart;
  save(cart: ShoppingCart): void;
}

export class ShoppingCartService {
  constructor(private readonly repository: CartRepository) {}

  addItem(item: AddCartItem): void {
    const cart = this.repository.load();
    cart.addItem(item);
    this.repository.save(cart);
  }

  listItems(): readonly CartItem[] {
    return this.repository.load().getItems();
  }

  removeItem(id: string): void {
    const cart = this.repository.load();
    cart.removeItem(id);
    this.repository.save(cart);
  }
}
