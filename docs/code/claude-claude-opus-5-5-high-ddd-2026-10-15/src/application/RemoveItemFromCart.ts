import { CartId } from "../domain/cart/CartId";
import type { CartRepository } from "../domain/cart/CartRepository";
import { ProductId } from "../domain/cart/ProductId";
import { CartNotFoundError } from "./ApplicationError";
import { type CartView, toCartView } from "./CartView";
import type { EventPublisher } from "./EventPublisher";

export interface RemoveItemFromCartCommand {
  readonly cartId: string;
  readonly productId: string;
}

/** Use case: remove a product, with its whole quantity, from a cart. */
export class RemoveItemFromCart {
  private readonly carts: CartRepository;
  private readonly events: EventPublisher;

  constructor(carts: CartRepository, events: EventPublisher) {
    this.carts = carts;
    this.events = events;
  }

  async execute(command: RemoveItemFromCartCommand): Promise<CartView> {
    const cartId = CartId.of(command.cartId);
    const cart = await this.carts.findById(cartId);
    if (!cart) {
      throw new CartNotFoundError(cartId.value);
    }

    cart.removeItem(ProductId.of(command.productId));

    await this.carts.save(cart);
    await this.events.publish(cart.pullEvents());
    return toCartView(cart);
  }
}
