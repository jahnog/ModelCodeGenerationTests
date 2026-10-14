import { ProductId } from "../../domain/model/product-id";
import type { ShoppingCartRepository } from "../../domain/repository/shopping-cart-repository";
import { summarizeCart } from "../../domain/service/cart-summary";
import type { RemoveItemRequest } from "../dto/cart-request";
import type { RemoveItemResult } from "../dto/cart-view";
import { toCartItemData, toCartView, toFailure } from "../mapping/to-cart-view";

export class RemoveItemFromCart {
  constructor(private readonly carts: ShoppingCartRepository) {}

  remove(request: RemoveItemRequest): RemoveItemResult {
    try {
      const cart = this.carts.load();
      const removed = cart.removeItem(ProductId.create(request.productId));
      const summary = summarizeCart(cart);
      this.carts.save(cart);
      return { ...toCartView(summary), removed: toCartItemData(removed) };
    } catch (error) {
      return toFailure(error);
    }
  }
}
