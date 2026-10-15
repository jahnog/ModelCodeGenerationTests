import type { Cart } from "../../domain/cart";
import { DomainError } from "../../domain/errors";
import type { CartUseCases } from "../../application/ports/in/cartUseCases";

/** Where the CLI writes its lines. Lets the host decide (console, buffer, ...). */
export type WriteLine = (line: string) => void;

export const formatMoney = (cents: number): string => {
  const whole = Math.floor(cents / 100);
  const fraction = String(cents % 100).padStart(2, "0");
  return `$${whole}.${fraction}`;
};

const parsePriceToCents = (text: string): number => {
  if (!/^\d+(\.\d{1,2})?$/.test(text)) {
    throw new UsageError(`Invalid price "${text}" (example: 2.50)`);
  }
  return Math.round(Number(text) * 100);
};

const parseQuantity = (text: string): number => {
  if (!/^\d+$/.test(text)) {
    throw new UsageError(`Invalid quantity "${text}"`);
  }
  return Number(text);
};

class UsageError extends Error {}

const USAGE = [
  "Commands:",
  "  add <id> <name> <price> [quantity]   add an item (name without spaces, use _)",
  "  list                                 show the items in the cart",
  "  remove <id>                          remove an item from the cart",
].join("\n");

/** Driving adapter: turns text commands into calls on the use-case port. */
export class CartCli {
  constructor(
    private readonly useCases: CartUseCases,
    private readonly cartId: string,
    private readonly write: WriteLine,
  ) {}

  async run(commandLine: string): Promise<void> {
    this.write(`> ${commandLine}`);
    try {
      this.write(await this.execute(commandLine.trim().split(/\s+/)));
    } catch (error) {
      if (error instanceof DomainError || error instanceof UsageError) {
        this.write(`Error: ${error.message}`);
        return;
      }
      throw error;
    }
  }

  private async execute(args: readonly string[]): Promise<string> {
    const [command, ...rest] = args;
    switch (command) {
      case "add": {
        const [id, name, price, quantity] = rest;
        if (id === undefined || name === undefined || price === undefined || rest.length > 4) {
          throw new UsageError(USAGE);
        }
        const cart = await this.useCases.addItem(this.cartId, {
          id,
          name: name.replaceAll("_", " "),
          unitPriceCents: parsePriceToCents(price),
          quantity: quantity === undefined ? 1 : parseQuantity(quantity),
        });
        return `Added "${id}".\n${renderCart(cart)}`;
      }
      case "list":
        return renderCart(await this.useCases.showItems(this.cartId));
      case "remove": {
        const [id] = rest;
        if (id === undefined || rest.length > 1) {
          throw new UsageError(USAGE);
        }
        const cart = await this.useCases.removeItem(this.cartId, id);
        return `Removed "${id}".\n${renderCart(cart)}`;
      }
      default:
        throw new UsageError(USAGE);
    }
  }
}

const renderCart = (cart: Cart): string => {
  if (cart.items.length === 0) {
    return "The cart is empty.";
  }
  const lines = cart.items.map(
    (item) =>
      `  [${item.id}] ${item.name} x${item.quantity} @ ${formatMoney(item.unitPriceCents)} = ${formatMoney(item.unitPriceCents * item.quantity)}`,
  );
  return ["Cart:", ...lines, `Total: ${formatMoney(cart.totalCents)}`].join("\n");
};
