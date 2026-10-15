import { AddItemToCart } from "../application/use-cases/AddItemToCart";
import { RemoveItemFromCart } from "../application/use-cases/RemoveItemFromCart";
import { ShowCartItems } from "../application/use-cases/ShowCartItems";
import { DomainError } from "../domain/errors";
import { presentCart } from "./CartPresenter";

export interface Output {
  write(text: string): void;
}

/** Translates user commands into use-case calls and renders the results. */
export class CartController {
  constructor(
    private readonly addItem: AddItemToCart,
    private readonly removeItem: RemoveItemFromCart,
    private readonly showItems: ShowCartItems,
    private readonly output: Output,
  ) {}

  async add(
    productId: string,
    name: string,
    unitPriceInCents: number,
    quantity: number,
  ): Promise<void> {
    await this.run(`Adding ${quantity} x ${name}`, () =>
      this.addItem.execute({ productId, name, unitPriceInCents, quantity }),
    );
  }

  async remove(productId: string): Promise<void> {
    await this.run(`Removing ${productId}`, () => this.removeItem.execute(productId));
  }

  async show(): Promise<void> {
    await this.run("Cart contents", () => this.showItems.execute());
  }

  private async run(
    title: string,
    action: () => ReturnType<ShowCartItems["execute"]>,
  ): Promise<void> {
    this.output.write(`> ${title}`);
    try {
      this.output.write(presentCart(await action()));
    } catch (error) {
      if (error instanceof DomainError) {
        this.output.write(`Error: ${error.message}`);
        return;
      }
      throw error;
    }
  }
}
