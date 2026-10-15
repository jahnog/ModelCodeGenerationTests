import { CartItem, lineTotalInCents } from "./CartItem";
import { ItemNotInCartError } from "./errors";

/** Immutable shopping cart aggregate: every operation returns a new Cart. */
export class Cart {
  private constructor(private readonly lines: readonly CartItem[]) {}

  static empty(): Cart {
    return new Cart([]);
  }

  static fromItems(items: readonly CartItem[]): Cart {
    return new Cart([...items]);
  }

  get items(): readonly CartItem[] {
    return this.lines;
  }

  get isEmpty(): boolean {
    return this.lines.length === 0;
  }

  get totalInCents(): number {
    return this.lines.reduce((sum, item) => sum + lineTotalInCents(item), 0);
  }

  /** Adds the item; if the product is already present its quantity is increased. */
  add(item: CartItem): Cart {
    const existing = this.lines.find((line) => line.productId === item.productId);
    if (existing === undefined) {
      return new Cart([...this.lines, item]);
    }
    return new Cart(
      this.lines.map((line) =>
        line.productId === item.productId
          ? { ...line, quantity: line.quantity + item.quantity }
          : line,
      ),
    );
  }

  /** Removes the whole line for the product. */
  remove(productId: string): Cart {
    if (!this.lines.some((line) => line.productId === productId)) {
      throw new ItemNotInCartError(productId);
    }
    return new Cart(this.lines.filter((line) => line.productId !== productId));
  }
}
