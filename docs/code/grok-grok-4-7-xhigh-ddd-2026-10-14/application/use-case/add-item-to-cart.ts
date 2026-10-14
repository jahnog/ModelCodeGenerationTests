import { type DomainEventPublisher } from "../../domain/event/domain-event-publisher";
import { ShoppingCart } from "../../domain/entity/shopping-cart";
import { type ShoppingCartRepository } from "../../domain/repository/shopping-cart-repository";
import { CartId } from "../../domain/value/cart-id";
import { Money } from "../../domain/value/money";
import { ProductId } from "../../domain/value/product-id";
import { ProductName } from "../../domain/value/product-name";
import { Quantity } from "../../domain/value/quantity";

export interface AddItemRequest {
  readonly cartId: string;
  readonly productId: string;
  readonly productName: string;
  readonly unitPriceMinor: number;
  readonly currency: string;
  readonly quantity: number;
}

export class AddItemToCart {
  readonly #carts: ShoppingCartRepository;
  readonly #events: DomainEventPublisher;

  constructor(carts: ShoppingCartRepository, events: DomainEventPublisher) {
    this.#carts = carts;
    this.#events = events;
  }

  execute(request: AddItemRequest): void {
    const cartId = CartId.create(request.cartId);
    const cart = this.#carts.findById(cartId) ?? ShoppingCart.open(cartId);
    cart.addItem(
      ProductId.create(request.productId),
      ProductName.create(request.productName),
      Money.create(request.unitPriceMinor, request.currency),
      Quantity.create(request.quantity),
    );
    this.#carts.save(cart);
    this.#events.publishAll(cart.pullDomainEvents());
  }
}
