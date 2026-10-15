export interface AddItemInput {
  readonly id: string;
  readonly name: string;
  readonly unitPriceInCents: number;
  readonly quantity?: number;
}

export interface CartItem extends AddItemInput {
  readonly quantity: number;
}

export class ShoppingCart {
  private readonly items = new Map<string, CartItem>();

  constructor(items: readonly CartItem[] = []) {
    for (const item of items) {
      this.addItem(item);
    }
  }

  addItem(input: AddItemInput): void {
    const id = input.id.trim();
    const name = input.name.trim();
    const quantity = input.quantity ?? 1;

    if (id.length === 0 || name.length === 0) {
      throw new Error("An item must have a nonempty ID and name.");
    }
    if (
      !Number.isSafeInteger(input.unitPriceInCents) ||
      input.unitPriceInCents < 0
    ) {
      throw new Error("The unit price must be a nonnegative safe integer in cents.");
    }
    if (!Number.isSafeInteger(quantity) || quantity <= 0) {
      throw new Error("The quantity must be a positive safe integer.");
    }

    const existing = this.items.get(id);
    if (
      existing !== undefined &&
      (existing.name !== name ||
        existing.unitPriceInCents !== input.unitPriceInCents)
    ) {
      throw new Error("An existing item ID must keep the same name and unit price.");
    }

    const combinedQuantity = (existing?.quantity ?? 0) + quantity;
    if (!Number.isSafeInteger(combinedQuantity)) {
      throw new Error("The combined quantity exceeds the safe integer limit.");
    }

    this.items.set(id, {
      id,
      name,
      unitPriceInCents: input.unitPriceInCents,
      quantity: combinedQuantity,
    });
  }

  listItems(): readonly CartItem[] {
    return Array.from(this.items.values(), (item) => ({ ...item }));
  }

  // Removing an item removes its entire quantity, not just one unit.
  removeItem(id: string): void {
    const normalizedId = id.trim();
    if (normalizedId.length === 0) {
      throw new Error("An item ID must not be empty.");
    }
    if (!this.items.delete(normalizedId)) {
      throw new Error(`Item "${normalizedId}" is not in the shopping cart.`);
    }
  }
}
