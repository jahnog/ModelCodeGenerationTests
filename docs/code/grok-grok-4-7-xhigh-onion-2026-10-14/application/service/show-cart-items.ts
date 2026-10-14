import type { ShoppingCartRepository } from "../../domain/repository/shopping-cart-repository";
import { summarizeCart } from "../../domain/service/cart-summary";
import type { CartResult } from "../dto/cart-view";
import { toCartView, toFailure } from "../mapping/to-cart-view";

export class ShowCartItems {
  constructor(private readonly carts: ShoppingCartRepository) {}

  show(): CartResult {
    try {
      return toCartView(summarizeCart(this.carts.load()));
    } catch (error) {
      return toFailure(error);
    }
  }
}
