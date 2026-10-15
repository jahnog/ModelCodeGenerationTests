import type { CartItem } from "./shopping-cart";
import type {
  ShoppingCartRepository,
  ShoppingCartUseCases,
} from "./shopping-cart-ports";

export class ShoppingCartService implements ShoppingCartUseCases {
  constructor(private readonly repository: ShoppingCartRepository) {}

  addItem(item: CartItem): void {
    const cart = this.repository.load();
    cart.addItem(item);
    this.repository.save(cart);
  }

  getItems(): readonly CartItem[] {
    return this.repository.load().getItems();
  }

  removeItem(id: string): void {
    const cart = this.repository.load();
    cart.removeItem(id);
    this.repository.save(cart);
  }
}
