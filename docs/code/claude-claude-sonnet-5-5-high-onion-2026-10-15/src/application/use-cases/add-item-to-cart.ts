import { Cart } from "../../domain/cart";
import { createCartItem } from "../../domain/cart-item";
import type { CartRepository } from "../../domain/cart-repository";
import { type CartView, toCartView } from "../cart-view-model";

export interface AddItemToCartInput {
  readonly cartId: string;
  readonly productId: string;
  readonly name: string;
  readonly unitPriceInCents: number;
  readonly quantity: number;
}

export class AddItemToCart {
  private readonly carts: CartRepository;

  constructor(carts: CartRepository) {
    this.carts = carts;
  }

  async execute(input: AddItemToCartInput): Promise<CartView> {
    const item = createCartItem(input.productId, input.name, input.unitPriceInCents, input.quantity);
    const cart = (await this.carts.findById(input.cartId)) ?? Cart.empty(input.cartId);
    const updated = cart.addItem(item);
    await this.carts.save(updated);
    return toCartView(updated);
  }
}
