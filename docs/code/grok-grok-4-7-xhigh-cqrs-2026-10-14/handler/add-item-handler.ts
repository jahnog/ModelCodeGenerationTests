import { acceptedCommand, rejectedCommand } from "../command/cart-command";
import type { CartCommand, CommandAcknowledgement } from "../command/cart-command";
import type { EventPublisher } from "../write-model/event-publisher";
import { decideAddItem } from "../write-model/shopping-cart";
import type { CartWriteStore } from "../write-model/cart-write-store";

export class AddItemHandler {
  readonly kind = "AddItem" as const;
  private readonly carts: CartWriteStore;
  private readonly events: EventPublisher;

  constructor(carts: CartWriteStore, events: EventPublisher) {
    this.carts = carts;
    this.events = events;
  }

  handle(command: CartCommand): CommandAcknowledgement {
    if (command.kind !== "AddItem") {
      return rejectedCommand("AddItem handler received a different command.");
    }

    const decision = decideAddItem(this.carts.load(command.cartId), {
      itemId: command.itemId,
      name: command.name,
      unitPriceCents: command.unitPriceCents,
      quantity: command.quantity,
    });
    if (!decision.ok) {
      return rejectedCommand(decision.reason);
    }

    this.carts.save(decision.cart);
    this.events.publish(decision.events);
    return acceptedCommand();
  }
}
