import type { AddItemRequest } from "../application/cart-dto";
import type { CartService } from "../application/cart-service";
import type { CartPresenter } from "./cart-presenter";
import type { Output } from "./output";

export class CartController {
  readonly #service: CartService;
  readonly #presenter: CartPresenter;
  readonly #output: Output;

  constructor(service: CartService, presenter: CartPresenter, output: Output) {
    this.#service = service;
    this.#presenter = presenter;
    this.#output = output;
  }

  addItem(request: AddItemRequest): void {
    try {
      const added = this.#service.addItem(request);
      this.#output.writeLine(this.#presenter.presentAdded(added));
    } catch (error: unknown) {
      this.#report(error);
    }
  }

  showItems(): void {
    try {
      const contents = this.#service.showItems();
      this.#output.writeLine(this.#presenter.presentContents(contents));
    } catch (error: unknown) {
      this.#report(error);
    }
  }

  removeItem(id: string): void {
    try {
      const removed = this.#service.removeItem(id);
      this.#output.writeLine(this.#presenter.presentRemoved(removed));
    } catch (error: unknown) {
      this.#report(error);
    }
  }

  #report(error: unknown): void {
    this.#output.writeLine(this.#presenter.presentError(error));
  }
}
