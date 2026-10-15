import { CartItem } from "./cart-item";
import { ShoppingCart } from "./shopping-cart";
import type { ShoppingCartRepository } from "./shopping-cart-repository";

export interface AddItemInput {
  readonly productId: string;
  readonly name: string;
  readonly quantity?: number;
}

/** Application layer: coordinates use cases without owning domain rules. */
export class ShoppingCartService {
  private readonly repository: ShoppingCartRepository;

  constructor(repository: ShoppingCartRepository) {
    this.repository = repository;
  }

  createCart(cartId: string): void {
    const cart = new ShoppingCart(cartId);
    if (this.repository.findById(cart.id) !== undefined) {
      throw new Error(`Cart "${cart.id}" already exists.`);
    }
    this.repository.save(cart);
  }

  addItem(cartId: string, input: AddItemInput): void {
    const cart = this.getCart(cartId);
    cart.addItem(new CartItem(input.productId, input.name, input.quantity));
    this.repository.save(cart);
  }

  listItems(cartId: string): readonly CartItem[] {
    return this.getCart(cartId).items;
  }

  removeItem(cartId: string, productId: string): void {
    const cart = this.getCart(cartId);
    cart.removeItem(productId);
    this.repository.save(cart);
  }

  private getCart(cartId: string): ShoppingCart {
    const cart = this.repository.findById(cartId);
    if (cart === undefined) {
      throw new Error(`Cart "${cartId}" was not found.`);
    }
    return cart;
  }
}
