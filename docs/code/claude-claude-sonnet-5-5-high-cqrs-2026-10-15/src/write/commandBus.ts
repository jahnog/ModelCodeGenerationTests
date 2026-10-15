import type { CartCommandHandlers } from "./commandHandlers";
import type { Command } from "./commands";

export class CommandBus {
  constructor(private readonly handlers: CartCommandHandlers) {}

  dispatch(command: Command): void {
    switch (command.type) {
      case "AddItemToCart":
        this.handlers.handleAddItem(command);
        break;
      case "RemoveItemFromCart":
        this.handlers.handleRemoveItem(command);
        break;
    }
  }
}
