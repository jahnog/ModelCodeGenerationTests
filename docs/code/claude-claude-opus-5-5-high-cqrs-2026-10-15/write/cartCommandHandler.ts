import type { EventBus } from "../infrastructure/eventBus";
import type { CartCommand, CommandResult } from "./commands";
import type { CartRepository } from "./cartRepository";
import { CartRuleError } from "./shoppingCart";

// Entry point of the write side: loads the aggregate, runs the command,
// saves the aggregate and publishes the resulting events.
export class CartCommandHandler {
  constructor(
    private readonly repository: CartRepository,
    private readonly eventBus: EventBus,
  ) {}

  handle(command: CartCommand): CommandResult {
    const cart = this.repository.getOrCreate(command.cartId);
    try {
      switch (command.type) {
        case "AddItem":
          cart.addItem(command.productId, command.name, command.unitPriceCents, command.quantity);
          break;
        case "RemoveItem":
          cart.removeItem(command.productId);
          break;
      }
    } catch (error) {
      if (error instanceof CartRuleError) {
        return { ok: false, error: error.message };
      }
      throw error;
    }

    this.repository.save(cart);
    this.eventBus.publish(cart.pullEvents());
    return { ok: true };
  }
}
