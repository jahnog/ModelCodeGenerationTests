import { InvalidItemError, ItemNotFoundError } from "./errors";

export interface CartItem {
  readonly id: string;
  readonly name: string;
  /** Unit price in cents, to avoid floating point rounding. */
  readonly unitPriceCents: number;
  readonly quantity: number;
}

export interface NewItem {
  readonly id: string;
  readonly name: string;
  readonly unitPriceCents: number;
  readonly quantity: number;
}

export class Cart {
  private constructor(
    readonly id: string,
    private readonly itemsById: ReadonlyMap<string, CartItem>,
  ) {}

  static empty(id: string): Cart {
    return new Cart(id, new Map());
  }

  get items(): readonly CartItem[] {
    return [...this.itemsById.values()];
  }

  get totalCents(): number {
    return this.items.reduce((sum, item) => sum + item.unitPriceCents * item.quantity, 0);
  }

  /** Returns a new cart with the item added. Adding an existing id increases its quantity. */
  add(newItem: NewItem): Cart {
    if (newItem.id.trim() === "") {
      throw new InvalidItemError("Item id must not be empty");
    }
    if (newItem.name.trim() === "") {
      throw new InvalidItemError("Item name must not be empty");
    }
    if (!Number.isInteger(newItem.unitPriceCents) || newItem.unitPriceCents < 0) {
      throw new InvalidItemError("Unit price must be a non-negative number of cents");
    }
    if (!Number.isInteger(newItem.quantity) || newItem.quantity < 1) {
      throw new InvalidItemError("Quantity must be a positive whole number");
    }

    const existing = this.itemsById.get(newItem.id);
    const next = new Map(this.itemsById);
    next.set(newItem.id, {
      id: newItem.id,
      name: existing?.name ?? newItem.name,
      unitPriceCents: existing?.unitPriceCents ?? newItem.unitPriceCents,
      quantity: (existing?.quantity ?? 0) + newItem.quantity,
    });
    return new Cart(this.id, next);
  }

  /** Returns a new cart without the item. */
  remove(itemId: string): Cart {
    if (!this.itemsById.has(itemId)) {
      throw new ItemNotFoundError(itemId);
    }
    const next = new Map(this.itemsById);
    next.delete(itemId);
    return new Cart(this.id, next);
  }
}
