import type { CartItem } from "./CartItem";
import type { CartItemValidator } from "./CartItemValidator";
import type { CartRepository } from "./CartRepository";

/** Read-only view of a cart (Interface Segregation: displaying needs no mutation methods). */
export interface CartReader {
  getItems(): readonly CartItem[];
}

/** Use cases a client needs from a cart; no storage or display concerns. */
export interface ShoppingCart extends CartReader {
  addItem(item: CartItem): void;
  removeItem(id: string): boolean;
}

/** Cart business rules: validate, merge quantities of the same item, remove by id. */
export class ShoppingCartService implements ShoppingCart {
  private readonly repository: CartRepository;
  private readonly validator: CartItemValidator;

  constructor(repository: CartRepository, validator: CartItemValidator) {
    this.repository = repository;
    this.validator = validator;
  }

  addItem(item: CartItem): void {
    this.validator.validate(item);
    const existing = this.repository.findById(item.id);
    if (existing === undefined) {
      this.repository.save(item);
      return;
    }
    if (existing.name !== item.name || existing.unitPriceCents !== item.unitPriceCents) {
      throw new Error(`Item id "${item.id}" is already used by a different product.`);
    }
    this.repository.save({ ...existing, quantity: existing.quantity + item.quantity });
  }

  removeItem(id: string): boolean {
    return this.repository.delete(id);
  }

  getItems(): readonly CartItem[] {
    return this.repository.findAll();
  }
}
