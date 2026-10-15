import { CartId } from "../domain/cart/CartId";
import type { CartRepository } from "../domain/cart/CartRepository";
import { Money } from "../domain/cart/Money";
import { ProductId } from "../domain/cart/ProductId";
import { ProductName } from "../domain/cart/ProductName";
import { Quantity } from "../domain/cart/Quantity";
import { ShoppingCart } from "../domain/cart/ShoppingCart";
import { type CartView, toCartView } from "./CartView";
import type { EventPublisher } from "./EventPublisher";

export interface AddItemToCartCommand {
  readonly cartId: string;
  readonly productId: string;
  readonly productName: string;
  readonly unitPriceCents: number;
  readonly currency: string;
  readonly quantity: number;
}

/** Use case: add an item to a cart. Creates the cart on the first add. */
export class AddItemToCart {
  private readonly carts: CartRepository;
  private readonly events: EventPublisher;

  constructor(carts: CartRepository, events: EventPublisher) {
    this.carts = carts;
    this.events = events;
  }

  async execute(command: AddItemToCartCommand): Promise<CartView> {
    const cartId = CartId.of(command.cartId);
    const cart = (await this.carts.findById(cartId)) ?? ShoppingCart.create(cartId, command.currency);

    cart.addItem(
      ProductId.of(command.productId),
      ProductName.of(command.productName),
      Money.ofCents(command.unitPriceCents, command.currency),
      Quantity.of(command.quantity),
    );

    await this.carts.save(cart);
    await this.events.publish(cart.pullEvents());
    return toCartView(cart);
  }
}
