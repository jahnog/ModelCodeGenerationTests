import type { CartItem } from "./CartItem";
import type { CartReader } from "./CartRepository";

export class ShowCartItems {
  constructor(private readonly reader: CartReader) {}

  execute(): readonly CartItem[] {
    return this.reader.findAll();
  }
}
