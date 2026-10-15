import type { AddItemToCart } from "../../application/use-cases/AddItemToCart";
import type { RemoveItemFromCart } from "../../application/use-cases/RemoveItemFromCart";
import type { ViewCart } from "../../application/use-cases/ViewCart";
import { DomainError } from "../../domain/errors/DomainError";
import type { CartPresenter } from "../presenters/CartPresenter";

export class InvalidCommandError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidCommandError";
  }
}

export interface CartUseCases {
  readonly addItem: AddItemToCart;
  readonly viewCart: ViewCart;
  readonly removeItem: RemoveItemFromCart;
}

/** Translates text commands into use-case requests and hands the results to the presenter. */
export class CartController {
  constructor(
    private readonly cartId: string,
    private readonly useCases: CartUseCases,
    private readonly presenter: CartPresenter,
  ) {}

  async handle(commandLine: string): Promise<string> {
    const [command, ...args] = tokenize(commandLine);
    try {
      switch (command?.toLowerCase()) {
        case "add":
          return await this.add(args);
        case "show":
          return await this.show();
        case "remove":
          return await this.remove(args);
        case undefined:
        case "help":
          return this.presenter.presentHelp();
        default:
          throw new InvalidCommandError(`Unknown command "${command}". Type "help" to list commands.`);
      }
    } catch (error) {
      if (error instanceof DomainError || error instanceof InvalidCommandError) {
        return this.presenter.presentError(error.message);
      }
      throw error;
    }
  }

  private async add(args: readonly string[]): Promise<string> {
    const [itemId, name, price, quantity] = args;
    if (itemId === undefined || name === undefined || price === undefined || args.length > 4) {
      throw new InvalidCommandError('Usage: add <id> "<name>" <price> [quantity]');
    }
    const view = await this.useCases.addItem.execute({
      cartId: this.cartId,
      itemId,
      name,
      unitPriceCents: parsePriceToCents(price),
      quantity: quantity === undefined ? 1 : parseQuantity(quantity),
    });
    return this.presenter.presentItemAdded(view, itemId);
  }

  private async show(): Promise<string> {
    const view = await this.useCases.viewCart.execute({ cartId: this.cartId });
    return this.presenter.presentCart(view);
  }

  private async remove(args: readonly string[]): Promise<string> {
    const [itemId] = args;
    if (itemId === undefined || args.length > 1) {
      throw new InvalidCommandError("Usage: remove <id>");
    }
    const view = await this.useCases.removeItem.execute({ cartId: this.cartId, itemId });
    return this.presenter.presentItemRemoved(view, itemId);
  }
}

/** Splits on whitespace, keeping "double quoted" text together as one argument. */
export function tokenize(commandLine: string): string[] {
  return [...commandLine.matchAll(/"([^"]*)"|(\S+)/g)].map((match) => match[1] ?? match[2] ?? "");
}

export function parsePriceToCents(text: string): number {
  const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(text);
  if (match === null) {
    throw new InvalidCommandError(`Price must look like 12 or 12.34, got "${text}".`);
  }
  const whole = Number(match[1]);
  const fraction = Number((match[2] ?? "").padEnd(2, "0"));
  return whole * 100 + fraction;
}

export function parseQuantity(text: string): number {
  if (!/^\d+$/.test(text)) {
    throw new InvalidCommandError(`Quantity must be a whole number, got "${text}".`);
  }
  return Number(text);
}
