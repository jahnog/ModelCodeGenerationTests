import { rejectedCommand } from "../command/cart-command";
import type { CartCommand, CommandAcknowledgement } from "../command/cart-command";
import type { CommandBus } from "../command/command-bus";

export class InMemoryCommandBus implements CommandBus {
  private readonly handlers = new Map<
    CartCommand["kind"],
    (command: CartCommand) => CommandAcknowledgement
  >();

  register(
    kind: CartCommand["kind"],
    handle: (command: CartCommand) => CommandAcknowledgement,
  ): void {
    if (this.handlers.has(kind)) {
      throw new Error(`A command handler for ${kind} is already registered.`);
    }
    this.handlers.set(kind, handle);
  }

  dispatch(command: CartCommand): CommandAcknowledgement {
    const handle = this.handlers.get(command.kind);
    if (handle === undefined) {
      return rejectedCommand(`No command handler is registered for ${command.kind}.`);
    }
    return handle(command);
  }
}
