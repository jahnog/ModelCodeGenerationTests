import type { CartService } from "../application";
import { DomainError } from "../domain";
import { HELP_TEXT, formatAdded, formatCart, formatRemoved } from "./CartView";
import type { Output } from "./Output";

class InputError extends Error {}

/** Turns text commands into use-case calls and renders the results. */
export class CartController {
  constructor(
    private readonly service: CartService,
    private readonly output: Output,
  ) {}

  /** Runs one command line. Returns false if the command failed. */
  execute(commandLine: string): boolean {
    const [command = "", ...args] = commandLine.trim().split(/\s+/);
    try {
      this.output.writeLine(this.dispatch(command.toLowerCase(), args));
      return true;
    } catch (error) {
      if (error instanceof DomainError || error instanceof InputError) {
        this.output.writeLine(`Error: ${error.message}`);
        return false;
      }
      throw error;
    }
  }

  private dispatch(command: string, args: readonly string[]): string {
    switch (command) {
      case "add":
        return this.add(args);
      case "list":
        return formatCart(this.service.listItems());
      case "remove":
        return this.remove(args);
      case "help":
        return HELP_TEXT;
      default:
        throw new InputError(`Unknown command "${command}". Type "help" for the list of commands.`);
    }
  }

  private add(args: readonly string[]): string {
    const [id, price, quantity, ...nameParts] = args;
    if (id === undefined || price === undefined || quantity === undefined || nameParts.length === 0) {
      throw new InputError("Usage: add <id> <unit price> <quantity> <name>");
    }
    const added = this.service.addItem({
      id,
      name: nameParts.join(" "),
      unitPriceCents: parsePriceToCents(price),
      quantity: parseQuantity(quantity),
    });
    return formatAdded(added);
  }

  private remove(args: readonly string[]): string {
    const [id] = args;
    if (id === undefined || args.length !== 1) throw new InputError("Usage: remove <id>");
    return formatRemoved(this.service.removeItem(id));
  }
}

function parsePriceToCents(text: string): number {
  const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(text);
  if (match === null) throw new InputError(`"${text}" is not a valid price, e.g. 2.50`);
  const whole = Number(match[1]);
  const fraction = Number((match[2] ?? "").padEnd(2, "0"));
  return whole * 100 + fraction;
}

function parseQuantity(text: string): number {
  if (!/^\d+$/.test(text)) throw new InputError(`"${text}" is not a valid quantity.`);
  return Number(text);
}
