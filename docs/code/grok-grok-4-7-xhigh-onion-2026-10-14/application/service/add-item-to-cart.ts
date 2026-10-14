import { CartLine } from "../../domain/model/cart-line";
import { ItemName } from "../../domain/model/item-name";
import { ProductId } from "../../domain/model/product-id";
import { Quantity } from "../../domain/model/quantity";
import { UnitPrice } from "../../domain/model/unit-price";
import type { ShoppingCartRepository } from "../../domain/repository/shopping-cart-repository";
import { summarizeCart } from "../../domain/service/cart-summary";
import type { AddItemRequest } from "../dto/cart-request";
import type { CartResult } from "../dto/cart-view";
import { toCartView, toFailure } from "../mapping/to-cart-view";

export class AddItemToCart {
  constructor(private readonly carts: ShoppingCartRepository) {}

  add(request: AddItemRequest): CartResult {
    try {
      const cart = this.carts.load();
      cart.addItem(
        CartLine.create(
          ProductId.create(request.productId),
          ItemName.create(request.name),
          UnitPrice.create(request.unitPriceCents),
          Quantity.create(request.quantity),
        ),
      );
      const summary = summarizeCart(cart);
      this.carts.save(cart);
      return toCartView(summary);
    } catch (error) {
      return toFailure(error);
    }
  }
}
