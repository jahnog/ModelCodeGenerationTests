import type { CartItem } from "./CartItem";
import type { CartRepository } from "./CartRepository";

/** Keeps cart items in memory, preserving insertion order. */
export class InMemoryCartRepository implements CartRepository {
  private readonly items = new Map<string, CartItem>();

  findById(id: string): CartItem | undefined {
    return this.items.get(id);
  }

  findAll(): readonly CartItem[] {
    return [...this.items.values()];
  }

  save(item: CartItem): void {
    this.items.set(item.id, item);
  }

  delete(id: string): boolean {
    return this.items.delete(id);
  }
}
