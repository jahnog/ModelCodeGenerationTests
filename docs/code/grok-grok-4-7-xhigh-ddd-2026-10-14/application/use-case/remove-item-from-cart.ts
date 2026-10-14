import { type DomainEventPublisher } from "../../domain/event/domain-event-publisher";
import { type ShoppingCartRepository } from "../../domain/repository/shopping-cart-repository";
import { CartId } from "../../domain/value/cart-id";
import { ProductId } from "../../domain/value/product-id";
import { CartNotFound } from "../error/cart-not-found";

export interface RemoveItemRequest {
  readonly cartId: string;
  readonly productId: string;
}

export class RemoveItemFromCart {
  readonly #carts: ShoppingCartRepository;
  readonly #events: DomainEventPublisher;

  constructor(carts: ShoppingCartRepository, events: DomainEventPublisher) {
    this.#carts = carts;
    this.#events = events;
  }

  execute(request: RemoveItemRequest): void {
    const cartId = CartId.create(request.cartId);
    const cart = this.#carts.findById(cartId);
    if (cart === undefined) {
      throw new CartNotFound(cartId.value);
    }
    cart.removeItem(ProductId.create(request.productId));
    this.#carts.save(cart);
    this.#events.publishAll(cart.pullDomainEvents());
  }
}
