import { Cart } from "../domain/cart";
import type { CartEvent } from "../domain/events";
import type { EventBus } from "../infrastructure/eventBus";
import type { EventStore } from "../infrastructure/eventStore";
import type { AddItemToCart, RemoveItemFromCart } from "./commands";

export type Clock = () => string;

/** Commands return nothing: callers read results through queries. */
export class CartCommandHandlers {
  constructor(
    private readonly store: EventStore,
    private readonly bus: EventBus,
    private readonly clock: Clock,
  ) {}

  handleAddItem(command: AddItemToCart): void {
    this.execute(command.cartId, (cart, now) =>
      cart.addItem(
        {
          productId: command.productId,
          name: command.name,
          unitPriceCents: command.unitPriceCents,
          quantity: command.quantity,
        },
        now,
      ),
    );
  }

  handleRemoveItem(command: RemoveItemFromCart): void {
    this.execute(command.cartId, (cart, now) => cart.removeItem(command.productId, now));
  }

  private execute(cartId: string, decide: (cart: Cart, now: string) => CartEvent[]): void {
    const cart = Cart.fromHistory(cartId, this.store.load(cartId));
    const events = decide(cart, this.clock());
    this.store.append(cartId, cart.currentVersion, events);
    this.bus.publish(events);
  }
}
