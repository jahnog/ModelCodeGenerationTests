import type { AddItemToCartUseCase } from "../../../application/ports/in/AddItemToCart";
import type { RemoveItemFromCartUseCase } from "../../../application/ports/in/RemoveItemFromCart";
import type { ViewCartQuery } from "../../../application/ports/in/ViewCart";
import { DomainError } from "../../../domain/errors";
import { presentCart } from "./CartTextPresenter";

export const HELP_TEXT = [
  "Commands:",
  "  add <productId> <price> <quantity> <name...>   e.g. add apple 0.50 3 Green apple",
  "  show",
  "  remove <productId>",
  "  help",
].join("\n");

class UsageError extends Error {}

/**
 * Driving adapter: turns text commands into calls on the inbound ports and turns the
 * results into text. It depends only on the port interfaces, never on CartService.
 */
export class CartCommandLineAdapter {
  private readonly cartId: string;
  private readonly addItemToCart: AddItemToCartUseCase;
  private readonly viewCart: ViewCartQuery;
  private readonly removeItemFromCart: RemoveItemFromCartUseCase;

  constructor(
    cartId: string,
    addItemToCart: AddItemToCartUseCase,
    viewCart: ViewCartQuery,
    removeItemFromCart: RemoveItemFromCartUseCase,
  ) {
    this.cartId = cartId;
    this.addItemToCart = addItemToCart;
    this.viewCart = viewCart;
    this.removeItemFromCart = removeItemFromCart;
  }

  /** Runs one command line and returns the text to show the user. */
  async execute(line: string): Promise<string> {
    const [command = "", ...args] = line.trim().split(/\s+/);
    try {
      switch (command.toLowerCase()) {
        case "add":
          return await this.add(args);
        case "show":
          return presentCart(await this.viewCart.viewCart(this.cartId));
        case "remove":
          return await this.remove(args);
        case "help":
        case "":
          return HELP_TEXT;
        default:
          throw new UsageError(`Unknown command "${command}".`);
      }
    } catch (error) {
      if (error instanceof UsageError) {
        return `Error: ${error.message}\n${HELP_TEXT}`;
      }
      if (error instanceof DomainError) {
        return `Error: ${error.message}`;
      }
      throw error;
    }
  }

  private async add(args: readonly string[]): Promise<string> {
    const [productId, price, quantity, ...nameParts] = args;
    if (productId === undefined || price === undefined || quantity === undefined || nameParts.length === 0) {
      throw new UsageError("add needs <productId> <price> <quantity> <name...>.");
    }
    const name = nameParts.join(" ");
    const cart = await this.addItemToCart.addItem({
      cartId: this.cartId,
      productId,
      name,
      unitPriceCents: parsePriceToCents(price),
      quantity: parseQuantity(quantity),
    });
    return `Added ${quantity} x ${name}.\n${presentCart(cart)}`;
  }

  private async remove(args: readonly string[]): Promise<string> {
    const [productId] = args;
    if (productId === undefined) {
      throw new UsageError("remove needs <productId>.");
    }
    const cart = await this.removeItemFromCart.removeItem({ cartId: this.cartId, productId });
    return `Removed ${productId}.\n${presentCart(cart)}`;
  }
}

function parsePriceToCents(text: string): number {
  const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(text);
  if (match === null) {
    throw new UsageError(`Price "${text}" must look like 12 or 12.34.`);
  }
  const [, whole = "0", fraction = ""] = match;
  return Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
}

function parseQuantity(text: string): number {
  if (!/^\d+$/.test(text)) {
    throw new UsageError(`Quantity "${text}" must be a whole number.`);
  }
  return Number(text);
}
