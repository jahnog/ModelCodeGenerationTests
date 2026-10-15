import type { CartItem } from "../domain/cartItem";
import type { CartRepository } from "./cartRepository";

/** Data layer: keeps cart items in memory, in insertion order. */
export class InMemoryCartRepository implements CartRepository {
  private readonly items = new Map<string, CartItem>();

  findAll(): readonly CartItem[] {
    return [...this.items.values()];
  }

  findById(id: string): CartItem | undefined {
    return this.items.get(id);
  }

  save(item: CartItem): void {
    this.items.set(item.id, item);
  }

  deleteById(id: string): boolean {
    return this.items.delete(id);
  }
}
