import { Cart } from "../../domain/entities/Cart";
import { CartItem } from "../../domain/entities/CartItem";
import { Money } from "../../domain/value-objects/Money";
import { toCartView, type AddItemRequest, type CartView } from "../dto/CartDto";
import type { CartRepository } from "../ports/CartRepository";

export class AddItemToCart {
  constructor(private readonly carts: CartRepository) {}

  async execute(request: AddItemRequest): Promise<CartView> {
    const cart = (await this.carts.findById(request.cartId)) ?? new Cart(request.cartId);
    cart.addItem(
      CartItem.create({
        id: request.itemId,
        name: request.name,
        unitPrice: Money.fromCents(request.unitPriceCents),
        quantity: request.quantity,
      }),
    );
    await this.carts.save(cart);
    return toCartView(cart);
  }
}
