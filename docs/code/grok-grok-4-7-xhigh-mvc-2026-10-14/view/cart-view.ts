import { CartError, type CartLine } from "../model/cart-item";
import type { CartReader, CartSnapshot } from "../model/shopping-cart";

export class CartView {
  readonly #cart: CartReader;
  #snapshot: CartSnapshot;
  #listing: string;

  constructor(cart: CartReader) {
    this.#cart = cart;
    this.#snapshot = cart.snapshot();
    this.#listing = formatSnapshot(this.#snapshot);
    cart.subscribe(() => {
      this.#render();
    });
  }

  showItems(): string {
    return this.#listing;
  }

  items(): readonly CartLine[] {
    return this.#snapshot.lines;
  }

  showError(error: unknown): string {
    if (error instanceof CartError) {
      return error.message;
    }
    return "The shopping cart could not be updated.";
  }

  #render(): void {
    this.#snapshot = this.#cart.snapshot();
    this.#listing = formatSnapshot(this.#snapshot);
  }
}

export function formatSnapshot(snapshot: CartSnapshot): string {
  if (snapshot.lines.length === 0) {
    return "The shopping cart is empty.";
  }
  const lines = snapshot.lines.map((line) => {
    return `${line.quantity} x ${line.name} (${line.id}) at ${line.unitPriceCents} cents: ${line.lineTotalCents} cents`;
  });
  return ["Shopping cart", ...lines, `Total: ${snapshot.totalCents} cents`].join("\n");
}
