import type { CartFormatter } from "./CartFormatter";
import type { Output } from "./Output";
import type { CartReader } from "./ShoppingCart";

/** Shows the cart's items. Depends only on what it reads, how it formats and where it writes. */
export class CartView {
  private readonly cart: CartReader;
  private readonly formatter: CartFormatter;
  private readonly output: Output;

  constructor(cart: CartReader, formatter: CartFormatter, output: Output) {
    this.cart = cart;
    this.formatter = formatter;
    this.output = output;
  }

  show(): void {
    this.output.write(this.formatter.format(this.cart.getItems()));
  }
}
