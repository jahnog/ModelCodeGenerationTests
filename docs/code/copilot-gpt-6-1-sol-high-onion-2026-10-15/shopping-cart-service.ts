import type { CartItem } from "./cart-item";
import type { CartRepository } from "./cart-repository";

export class ShoppingCartService {
  private readonly repository: CartRepository;

  constructor(repository: CartRepository) {
    this.repository = repository;
  }

  addItem(item: CartItem): void {
    const cart = this.repository.load();
    cart.addItem(item);
    this.repository.save(cart);
  }

  getItems(): readonly CartItem[] {
    return this.repository.load().getItems();
  }

  removeItem(itemId: string): void {
    const cart = this.repository.load();
    cart.removeItem(itemId);
    this.repository.save(cart);
  }
}
