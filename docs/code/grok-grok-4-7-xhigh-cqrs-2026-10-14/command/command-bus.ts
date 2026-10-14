import type { CartCommand, CommandAcknowledgement } from "./cart-command";

export interface CommandBus {
  dispatch(command: CartCommand): CommandAcknowledgement;
}
