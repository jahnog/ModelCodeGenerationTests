import type { CartWriter } from "./CartRepository";

export class RemoveItemFromCart {
  constructor(private readonly writer: CartWriter) {}

  /** Returns true when an item was removed, false when the id was not in the cart. */
  execute(id: string): boolean {
    return this.writer.deleteById(id);
  }
}
