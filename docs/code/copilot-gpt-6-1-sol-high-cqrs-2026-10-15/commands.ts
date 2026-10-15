import type { CartWriteStore } from "./cart-store";

export interface AddItemCommand {
  readonly id: string;
  readonly name: string;
  readonly unitPriceCents: number;
  readonly quantity?: number;
}

export interface RemoveItemCommand {
  readonly id: string;
}

export class AddItemHandler {
  private readonly store: CartWriteStore;

  constructor(store: CartWriteStore) {
    this.store = store;
  }

  execute(command: AddItemCommand): void {
    if (command.id.trim().length === 0) {
      throw new Error("Item ID must not be empty.");
    }
    if (command.name.trim().length === 0) {
      throw new Error("Item name must not be empty.");
    }
    if (
      !Number.isSafeInteger(command.unitPriceCents) ||
      command.unitPriceCents < 0
    ) {
      throw new RangeError("Unit price must be a non-negative safe integer in cents.");
    }

    const quantity = command.quantity ?? 1;
    if (!Number.isSafeInteger(quantity) || quantity <= 0) {
      throw new RangeError("Quantity must be a positive safe integer.");
    }

    const existing = this.store.getItem(command.id);
    if (
      existing !== undefined &&
      (existing.name !== command.name ||
        existing.unitPriceCents !== command.unitPriceCents)
    ) {
      throw new Error("An item with this ID already has a different name or price.");
    }

    const combinedQuantity = (existing?.quantity ?? 0) + quantity;
    if (!Number.isSafeInteger(combinedQuantity)) {
      throw new RangeError("Combined quantity exceeds the safe integer limit.");
    }

    this.store.saveItem({
      id: command.id,
      name: command.name,
      unitPriceCents: command.unitPriceCents,
      quantity: combinedQuantity,
    });
  }
}

export class RemoveItemHandler {
  private readonly store: CartWriteStore;

  constructor(store: CartWriteStore) {
    this.store = store;
  }

  // Removing an item removes its entire line, regardless of quantity.
  execute(command: RemoveItemCommand): void {
    if (command.id.trim().length === 0) {
      throw new Error("Item ID must not be empty.");
    }
    if (!this.store.removeItem(command.id)) {
      throw new Error(`Item "${command.id}" is not in the cart.`);
    }
  }
}
