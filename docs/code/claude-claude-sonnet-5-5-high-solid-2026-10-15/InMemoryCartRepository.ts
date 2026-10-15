import type { CartItem } from "./CartItem";
import type { CartRepository } from "./CartRepository";

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
