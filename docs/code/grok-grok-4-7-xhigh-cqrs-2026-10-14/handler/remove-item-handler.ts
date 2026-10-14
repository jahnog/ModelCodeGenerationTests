import { acceptedCommand, rejectedCommand } from "../command/cart-command";
import type { CartCommand, CommandAcknowledgement } from "../command/cart-command";
import type { EventPublisher } from "../write-model/event-publisher";
import type { CartWriteStore } from "../write-model/cart-write-store";
import { decideRemoveItem } from "../write-model/shopping-cart";

export class RemoveItemHandler {
  readonly kind = "RemoveItem" as const;
  private readonly carts: CartWriteStore;
  private readonly events: EventPublisher;

  constructor(carts: CartWriteStore, events: EventPublisher) {
    this.carts = carts;
    this.events = events;
  }

  handle(command: CartCommand): CommandAcknowledgement {
    if (command.kind !== "RemoveItem") {
      return rejectedCommand("RemoveItem handler received a different command.");
    }

    const decision = decideRemoveItem(this.carts.load(command.cartId), command.itemId);
    if (!decision.ok) {
      return rejectedCommand(decision.reason);
    }

    this.carts.save(decision.cart);
    this.events.publish(decision.events);
    return acceptedCommand();
  }
}
