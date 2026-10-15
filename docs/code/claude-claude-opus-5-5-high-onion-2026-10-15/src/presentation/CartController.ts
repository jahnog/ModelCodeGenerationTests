import type { AddItemToCart } from "../application/AddItemToCart";
import type { OutputPort } from "../application/OutputPort";
import type { RemoveItemFromCart } from "../application/RemoveItemFromCart";
import type { ViewCart } from "../application/ViewCart";
import { DomainError } from "../domain/errors";
import { formatCart, formatCents } from "./CartFormatter";

export interface CartUseCases {
  readonly addItem: AddItemToCart;
  readonly viewCart: ViewCart;
  readonly removeItem: RemoveItemFromCart;
}

/** Translates user actions into use-case calls and renders the results. */
export class CartController {
  private readonly useCases: CartUseCases;
  private readonly output: OutputPort;
  private readonly cartId: string;

  constructor(useCases: CartUseCases, output: OutputPort, cartId: string) {
    this.useCases = useCases;
    this.output = output;
    this.cartId = cartId;
  }

  async add(productId: string, name: string, unitPriceCents: number, quantity = 1): Promise<void> {
    await this.run(async () => {
      await this.useCases.addItem.execute({ cartId: this.cartId, productId, name, unitPriceCents, quantity });
      this.output.writeLine(`Added ${quantity} x ${name} (${formatCents(unitPriceCents)} each).`);
    });
  }

  async show(): Promise<void> {
    await this.run(async () => {
      this.output.writeLine(formatCart(await this.useCases.viewCart.execute({ cartId: this.cartId })));
    });
  }

  async remove(productId: string): Promise<void> {
    await this.run(async () => {
      await this.useCases.removeItem.execute({ cartId: this.cartId, productId });
      this.output.writeLine(`Removed "${productId}" from the cart.`);
    });
  }

  /** Domain rule violations are shown to the user; anything else is a bug and propagates. */
  private async run(action: () => Promise<void>): Promise<void> {
    try {
      await action();
    } catch (error) {
      if (!(error instanceof DomainError)) throw error;
      this.output.writeLine(`Error: ${error.message}`);
    }
  }
}
