import type { CartItem } from "./cart-item";

export interface CartStore {
  findById(id: string): CartItem | undefined;
  getAll(): readonly CartItem[];
  save(item: CartItem): void;
  delete(id: string): boolean;
}

export class InMemoryCartStore implements CartStore {
  private readonly items = new Map<string, CartItem>();

  findById(id: string): CartItem | undefined {
    const item = this.items.get(id);
    return item === undefined ? undefined : { ...item };
  }

  getAll(): readonly CartItem[] {
    return Array.from(this.items.values(), (item) => ({ ...item }));
  }

  save(item: CartItem): void {
    this.items.set(item.id, { ...item });
  }

  delete(id: string): boolean {
    return this.items.delete(id);
  }
}
