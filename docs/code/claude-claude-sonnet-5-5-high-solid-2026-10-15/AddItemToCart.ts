import type { CartItem } from "./CartItem";
import type { CartReader, CartWriter } from "./CartRepository";

export class AddItemToCart {
  constructor(
    private readonly reader: CartReader,
    private readonly writer: CartWriter,
  ) {}

  execute(item: CartItem): CartItem {
    const existing = this.reader.findById(item.id);
    const merged: CartItem = existing
      ? { ...existing, quantity: existing.quantity + item.quantity }
      : item;
    this.writer.save(merged);
    return merged;
  }
}
