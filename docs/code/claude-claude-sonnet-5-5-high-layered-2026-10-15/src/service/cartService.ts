import type { CartRepository } from "../data/cartRepository";
import { lineTotalCents, type CartItem } from "../domain/cartItem";
import { InvalidItemError, ItemNotFoundError } from "../domain/errors";

export interface NewItem {
  readonly id: string;
  readonly name: string;
  readonly unitPriceCents: number;
  readonly quantity: number;
}

/** Service layer: business rules for the cart. Knows nothing about I/O. */
export class CartService {
  constructor(private readonly repository: CartRepository) {}

  /** Adds an item; if the id is already in the cart, the quantities are summed. */
  addItem(input: NewItem): CartItem {
    const id = input.id.trim();
    const name = input.name.trim();
    if (id === "") throw new InvalidItemError("Item id must not be empty.");
    if (name === "") throw new InvalidItemError("Item name must not be empty.");
    if (!Number.isInteger(input.unitPriceCents) || input.unitPriceCents < 0) {
      throw new InvalidItemError("Unit price must be a non-negative whole number of cents.");
    }
    if (!Number.isInteger(input.quantity) || input.quantity <= 0) {
      throw new InvalidItemError("Quantity must be a positive whole number.");
    }

    const existing = this.repository.findById(id);
    const item: CartItem = existing
      ? { ...existing, quantity: existing.quantity + input.quantity }
      : { id, name, unitPriceCents: input.unitPriceCents, quantity: input.quantity };
    this.repository.save(item);
    return item;
  }

  listItems(): readonly CartItem[] {
    return this.repository.findAll();
  }

  /** Removes the whole line for the given id. */
  removeItem(id: string): CartItem {
    const existing = this.repository.findById(id);
    if (!existing) throw new ItemNotFoundError(id);
    this.repository.deleteById(id);
    return existing;
  }

  totalCents(): number {
    return this.repository.findAll().reduce((sum, item) => sum + lineTotalCents(item), 0);
  }
}
