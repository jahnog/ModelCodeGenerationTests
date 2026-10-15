import { createCartItem } from "../../domain/CartItem";
import { CartView, toCartView } from "../CartView";
import { CartRepository } from "../ports/CartRepository";

export interface AddItemToCartInput {
  readonly productId: string;
  readonly name: string;
  readonly unitPriceInCents: number;
  readonly quantity: number;
}

export class AddItemToCart {
  constructor(private readonly carts: CartRepository) {}

  async execute(input: AddItemToCartInput): Promise<CartView> {
    const item = createCartItem(
      input.productId,
      input.name,
      input.unitPriceInCents,
      input.quantity,
    );
    const cart = (await this.carts.get()).add(item);
    await this.carts.save(cart);
    return toCartView(cart);
  }
}
