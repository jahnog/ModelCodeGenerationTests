import { DomainError } from "../error/domain-error";

const MAX_ITEM_NAME_LENGTH = 80;

export class ItemName {
  readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(raw: string): ItemName {
    const value = raw.trim();
    if (value.length === 0) {
      throw new DomainError("empty-item-name", "Item name must not be empty.");
    }
    if (value.length > MAX_ITEM_NAME_LENGTH) {
      throw new DomainError(
        "item-name-too-long",
        `Item name must be at most ${MAX_ITEM_NAME_LENGTH} characters.`,
      );
    }
    return new ItemName(value);
  }

  equals(other: ItemName): boolean {
    return this.value === other.value;
  }
}
