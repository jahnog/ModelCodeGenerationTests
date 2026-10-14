import { DomainError } from "../error/domain-error";
import { CartLine } from "./cart-line";
import { ProductId } from "./product-id";

export class ShoppingCart {
  readonly #lines: CartLine[] = [];

  private constructor() {}

  static empty(): ShoppingCart {
    return new ShoppingCart();
  }

  copy(): ShoppingCart {
    const copy = ShoppingCart.empty();
    for (const line of this.#lines) {
      copy.#lines.push(line);
    }
    return copy;
  }

  addItem(incoming: CartLine): void {
    const index = this.#lines.findIndex((line) =>
      line.productId.equals(incoming.productId),
    );
    if (index < 0) {
      this.#lines.push(incoming);
      return;
    }
    const current = this.#lines[index];
    if (current === undefined) {
      this.#lines.push(incoming);
      return;
    }
    if (
      !current.name.equals(incoming.name) ||
      !current.unitPrice.equals(incoming.unitPrice)
    ) {
      throw new DomainError(
        "offering-conflict",
        `Product "${incoming.productId.value}" is already in the cart with a different name or price.`,
      );
    }
    this.#lines[index] = current.withAddedQuantity(incoming.quantity);
  }

  removeItem(productId: ProductId): CartLine {
    const index = this.#lines.findIndex((line) => line.productId.equals(productId));
    if (index < 0) {
      throw new DomainError(
        "item-not-found",
        `Product "${productId.value}" is not in the cart.`,
      );
    }
    const removed = this.#lines[index];
    if (removed === undefined) {
      throw new DomainError(
        "item-not-found",
        `Product "${productId.value}" is not in the cart.`,
      );
    }
    this.#lines.splice(index, 1);
    return removed;
  }

  lines(): readonly CartLine[] {
    return [...this.#lines];
  }
}
