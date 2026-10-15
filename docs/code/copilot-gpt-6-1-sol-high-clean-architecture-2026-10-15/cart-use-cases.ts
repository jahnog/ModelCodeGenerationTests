import type { CartRepository } from "./cart-repository";
import type { AddItemInput, CartItem } from "./shopping-cart";

export class AddItemToCart {
  private readonly repository: CartRepository;

  constructor(repository: CartRepository) {
    this.repository = repository;
  }

  execute(input: AddItemInput): void {
    const cart = this.repository.load();
    cart.addItem(input);
    this.repository.save(cart);
  }
}

export class ListCartItems {
  private readonly repository: CartRepository;

  constructor(repository: CartRepository) {
    this.repository = repository;
  }

  execute(): readonly CartItem[] {
    return this.repository.load().listItems();
  }
}

export class RemoveItemFromCart {
  private readonly repository: CartRepository;

  constructor(repository: CartRepository) {
    this.repository = repository;
  }

  execute(id: string): void {
    const cart = this.repository.load();
    cart.removeItem(id);
    this.repository.save(cart);
  }
}
