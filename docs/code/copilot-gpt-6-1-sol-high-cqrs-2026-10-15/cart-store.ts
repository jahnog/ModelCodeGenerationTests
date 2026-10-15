export interface CartItem {
  readonly id: string;
  readonly name: string;
  readonly unitPriceCents: number;
  readonly quantity: number;
}

export interface CartReadStore {
  getItems(): readonly CartItem[];
}

export interface CartWriteStore {
  getItem(id: string): CartItem | undefined;
  saveItem(item: CartItem): void;
  removeItem(id: string): boolean;
}

// Both sides share storage; queries receive only the read interface.
export class InMemoryCartStore implements CartReadStore, CartWriteStore {
  private readonly items = new Map<string, CartItem>();

  getItem(id: string): CartItem | undefined {
    const item = this.items.get(id);
    return item === undefined ? undefined : { ...item };
  }

  getItems(): readonly CartItem[] {
    return Array.from(this.items.values(), (item) => ({ ...item }));
  }

  saveItem(item: CartItem): void {
    this.items.set(item.id, { ...item });
  }

  removeItem(id: string): boolean {
    return this.items.delete(id);
  }
}
